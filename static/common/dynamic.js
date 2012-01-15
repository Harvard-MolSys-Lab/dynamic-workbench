if( typeof require === 'function') {
	_ = require('underscore');
	DNA = require('utils/dna-utils.js').DNA;
} else {
	exports = {};
}
if( typeof App == 'undefined') {
	App = {};
}

App.dynamic = exports = (function(_,DNA) {
	/**
	 * @class _
	 * Provides some additional methods inspired by _.js
	 */
	_.mixin({
		/**
		 * Produces a copy of source which does not include properties on the prototype chain.
		 * @param {Object} source
		 */
		copy : function(source) {
			return _.copyTo({}, source)
		},
		/**
		 * Copies properties from `source` which do not appear on the prototype chain
		 * to `destination`
		 * @param {Object} destination
		 * @param {Object} source
		 */
		copyTo : function(destination, source) {
			_.each(source, function(value, key) {
				if(source.hasOwnProperty(key)) {
					destination[key] = value;
				}
			});
			return destination;
		},
		deepClone : function(source) {
			var dest;
			if(_.isObject(source)) {
				dest = {};
				_.each(source, function(value, key) {
					dest[key] = _.deepClone(value);
				});
			} else if(_.isArray(source)) {
				dest = _.map(source, _.deepClone);
			} else {
				dest = source;
			}
			return dest;
		}
	});

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.Motif
	 * Represents a single motif
	 */
	function Motif(config) {

		// Apply configuration options with defaults to this object
		_.copyTo(this, config);
		_.defaults(this, {
			/**
			 * @cfg
			 */
			name : '',
			/**
			 * @cfg
			 * Type of motif to create. Currently one of: `"initiator"` or `"hairpin"`
			 */
			type : 'hairpin',
			polarity : 0,
			/**
			 * @cfg
			 */
			isInitiator : false,
			domains : [],
		});

		this.isInitiator = this.isInitiator || this.type == 'initiator';

		/**
		 * @property {App.dynamic.Domain[]}
		 * @private
		 * Use #getDomains
		 */
		this.domains = _.map(this.domains, function(domain) {
			return new Domain(domain);
		});

		_.each(this.domains, function(domain) {
			if(!domain.polarity) {
				throw new DynamlError({
					type : 'unspecified motif domain polarity',
					message : _.template('Domain <%= domain %> in motif <%= motif %> has no polarity specified. ' + //
					 'Polarities are required for domains specified in motifs.', {
						motif : this.name,
						domain : domain.name,
					}),
					motifs : [this],
					domain : domain,
				});
			}
		}, this);
		/**
		 *
		 */
		this.polarity = DNA.parsePolarity(this.polarity);

		Motif.register(this.name, this);
	}


	Motif.prototype = {
		/**
		 * Generates a new {@link App.dynamic.Node node} which inherits the properties of this motif
		 * @return {App.dynamic.Node} node
		 */
		instantiate : function(config) {
			config.motif = this.name;
			return new Node(config);
		},
		/**
		 * Gets all {@link App.dynamic.Segment segments} associated with this motif/node
		 * @returns {App.dynamic.Segment}
		 */
		getSegments : function() {
			return _.flatten(_.map(this.getDomains(), function(domain) {
				return domain.getSegments();
			}));
		},
		/**
		 * Gets all {@link App.dynamic.Domain domains} associated with this motif/node
		 * @returns {App.dynamic.Domain[]} domains
		 */
		getDomains : function() {
			return this.domains;
		},
		/**
		 * Gets the {@link App.dynamic.Domain domain} with the provided name
		 * @param {String} name
		 * @returns {App.dynamic.Domain} domain
		 */
		getDomain : function(name) {
			return _.find(this.getDomains(), function(dom) {
				return dom.name == name;
			});
		},
		getName : function() {
			return this.name;
		},
	}
	_.extend(Motif, {
		/**
		 * Gets the next available motif name.
		 * @static
		 */
		nextName : function() {
			var motifIndex = 0;
			return function() {
				motifIndex++;
				return "m" + motifIndex;
			}
		}(),
		motifs : {},
		/**
		 * Registers the given motif by name so it can be retrieved later by #get
		 * @static
		 * @param {String} name
		 * @param {App.dynamic.Motif} motif
		 */
		register : function(name, motif) {
			this.motifs[name] = motif;
			return motif;
		},
		/**
		 * Gets the motif with the given name previously {@link #register registered}.
		 * @static
		 * @param {String/App.dynamic.Motif} name If passed a string, a lookup will convert it to a Motif or `null`; if passed a Motif, the Motif will be returned unchanged
		 */
		get : function(name) {
			if( name instanceof Motif) {
				return name;
			} else {
				return this.motifs[name];
			}
		},
	});

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.Node
	 * Represents a single Node.
	 * @extends App.dynamic.Motif
	 */
	function Node(config) {

		// Inherit motif if configured
		if(config.motif) {
			/**
			 * @cfg {String/App.dynamic.Motif} motif
			 * Name or reference to a {@link App.dynamic.Motif motif} from
			 * which this node inherits.
			 */
			_.copyTo(this, Motif.get(config.motif));
		}

		// Save domains from the motif in a hash table by their names
		// TODO: the motif really should do this.
		var motifDomainsMap = _.reduce(this.domains || [], function(memo, domain) {
			memo[domain.name] = domain;
			return memo;
		}, {});

		// Apply configuration options with defaults to this object
		_.copyTo(this, config), _.defaults({
			polarity : 0,
		});

		// Construct Domain objects from specifications
		this.domains = _.map(this.domains, function(domain) {

			// Find domains with matching identities in motif
			if(domain.identity && motifDomainsMap[domain.identity]) {
				domain = _.extend(_.copy(motifDomainsMap[domain.identity]), domain);
			}
			domain.node = this;
			return new Domain(domain);

		}, this);
		
		// TODO: compiler should do this.
		if(this.isInitiator) {
			this.polarity = -1;
		}
		
		// Apply post-processor
		if(Node.types[this.type]) {
			Node.types[this.type](this);
		}

		Node.register(this.name, this);
	}


	_.extend(Node.prototype, Motif.prototype);
	_.extend(Node.prototype, {

		/**
		 * Produces a constraint matrix; essentially a hash describing the relationship between each
		 * of the {@link App.dynamic.Segment#id segment IDs} of the {@link App.dynamic.Segment segments}
		 * associated with this node.
		 *
		 * Result:
		 *     constraints[leftSegment ID][rightSegment ID] == -1 // => leftSegment is complementary to rightSegment
		 *     constraints[leftSegment ID][rightSegment ID] == 1  // => leftSegment has the same identity as rightSegment
		 *     constraints[leftSegment ID][rightSegment ID] == null // => leftSegment and rightSegment are orthogonal
		 *
		 * @returns {Object} constraints. See description.
		 */
		getConstraintMatrix : function() {
			var segments = this.getSegments();

			// fold all segments into a matrix of constraints
			// for each segment (= leftSegment):
			return _.reduce(segments, function(constraints, leftSegment) {

				/*
				 * iterate through each other segment (= rightSegment)
				 * producing a hash mapping the segment ID of each other
				 * segments which shares leftSegment's identity to the
				 * product of leftSegment's polarity and that segment's
				 * polarity.
				 */

				constraints[leftSegment.getId()] = _.reduce(segments, function(memo, rightSegment) {

					// if another segment shares leftSegment's identity, but isn't leftSegment
					if((leftSegment.getIdentity() == rightSegment.getIdentity()) && (leftSegment.getId() != rightSegment.getId())) {

						// set constraints[leftSegment ID][rightSegment ID] to product of polarities
						memo[rightSegment.getId()] = rightSegment.polarity * leftSegment.polarity;
					}
					return memo;
				}, {});
				return constraints;
			}, {});
		},
		/**
		 * Generates a hash table mapping each unique segment identity
		 * to a list of segments in this node with that identity.
		 */
		getSegmentIdentityMatrix : function() {
			var segments = this.getSegments(), identities = {};

			function checkout(identity, segment) {
				if(!identities[identity]) {
					identities[identity] = [];
				}
				identities[identity].push(segment);
			}


			_.each(segments, function(segment) {
				checkout(segment.identity, segment);
			});
			return identities;

		}
	});

	_.extend(Node, {
		/**
		 * Hash of post-processors to be passed the node at the end of the constructor.
		 */
		types: {
			'hairpin': function(node) {
				_.each(node.getDomains(), function(domain) {
					if(domain.role=='input') {
						// all segments other than toehold will be duplex
						_.each(domain.getSegments(),function(segment) {
							segment.duplex = (segment.role != 'toehold');
						});
					} else if(domain.role=='output') {
						if(domain.type == 'loop') {
							// segments will be duplex if (role != 'loop') and (role of previous segment != 'loop' if role == 'clamp')
							var previousRole = ''
							_.each(domain.getSegments(),function(segment) {
								segment.duplex = !(segment.role == 'loop' || (segment.role == 'clamp' && previousRole == 'loop'));
								previousRole = segment.role;
							});
						} else if(domain.type == 'tail') {
							// segments will be duplex if (role == 'toehold') or (role == 'clamp' and previous role == 'toehold')
							var previousRole = ''
							_.each(domain.getSegments(),function(segment) {
								segment.duplex = (segment.role == 'toehold' || (segment.role == 'clamp' && previousRole == 'toehold'));
								previousRole = segment.role;
							});
						}
					}
				});
			}
		},
		
		nodes : {},
		/**
		 * Registers the given node by name so it can be retrieved later by #get
		 * @static
		 * @param {String} name
		 * @param {App.dynamic.Node} motif
		 */
		register : function(name, nodes) {
			this.nodes[name] = nodes;
			return nodes;
		},
		/**
		 * Gets the node with the given name previously {@link #register registered}.
		 * @static
		 * @param {String/App.dynamic.Node} node If passed a string, a lookup will convert it to a Node or `null`; if passed a Node, the Node will be returned unchanged
		 */
		get : function(name) {
			if( name instanceof Node) {
				return name;
			} else {
				return this.nodes[name];
			}
		},
	})

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.Strand
	 */
	function Strand(config) {
		// Apply configuration options with defaults to this object
		_.copyTo(this, config), _.defaults(this, {
		});

		this.polarity = DNA.parsePolarity(this.polarity);

	}


	Strand.prototype = {
		getName : function() {
			return this.name;
		},
		/**
		 * @inheritdoc App.dynamic.Node#getSegments
		 */
		getSegments : function() {
			return _.flatten(_.map(this.getDomains(), function(domain) {
				return domain.getSegments();
			}));
		},
		/**
		 * @inheritdoc App.dynamic.Node#getDomains
		 */
		getDomains : function() {
			return this.domains;
		},
		/**
		 * @inheritdoc App.dynamic.Node#getDomain
		 */
		getDomain : function(name) {
			return _.find(this.getDomains(), function(dom) {
				return dom.name == name;
			});
		},
		getStructure : function() {
				var duplex = false, lastDuplex = false, regionLength = 0, out = [];
				
				// This code isn't right
				_.each(this.getSegments(),function(segment) {
					
					
					if(!!segment.duplex != duplex) {
						if(regionLength > 0) {						
							out.push((duplex ? 'D' : 'U') +regionLength);
							
							// silence the next duplex 
							if(duplex) {
								lastDuplex = !lastDuplex;								
							}
						}
						duplex = !duplex;
						regionLength = 0;
					}

					if(!!segment.duplex == duplex) {
						if(duplex && lastDuplex) {
							return;
						}
						regionLength += segment.getLength();
					}
					
				});
				
				// Finish the remaining segment
				if(regionLength > 0) {
					out.push((duplex ? 'D' : 'U') +regionLength);
				}
				
				return out.join(' ')				
		}
	}

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.Domain
	 * Represents a domain, which is a collection of {@link App.dynamic.Segment}s
	 * within a {@link App.dynamic.Node node} or {App.dynamic.Motif motif}.
	 */
	function Domain(config) {

		// Apply configuration options with defaults to this object
		_.copyTo(this, config), _.defaults(this, {
			segments : [],
		});

		/**
		 * @property {App.dynamic.Segment[]} segments
		 * @private
		 */

		// Construct Segment objects from specification
		this.segments = _.map(this.segments, function(segment) {
			segment = _.extend(_.copy(segment), {
				domain : this
			});
			return new Segment(segment);
		}, this);
		/**
		 * @property {Number} polarity
		 */
		this.polarity = DNA.parsePolarity(this.polarity);
	}


	Domain.prototype = {
		role : "output",
		/**
		 * Retrieves the segments associated with this domain
		 * @returns {App.dynamic.Segment[]} segments
		 */
		getSegments : function() {
			return this.segments;
		},
		/**
		 * @return {Node} node The node which contains this domain.
		 */
		getNode : function() {
			return this.node;
		},
		/**
		 * Gets the name of the domain
		 */
		getName : function() {
			return this.name;
		}
	};

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.Segment
	 * Smallest individual unit of sequence organization.
	 *
	 * # ID, identity, identifier
	 *
	 * -	Segment ID : a unique code assigned to each App.dynamic.Segment
	 * 	object, which allows the particular Segment to be looked up and
	 * 	identified unambiguously within the ensemble
	 * -	Identity : the particular name or label which this segment represents.
	 * 	Two segments with the same identity and the same polarity have
	 * 	identical sequences. Two segments with the same identity and the
	 * 	opposite polarity have complementary sequences
	 * -	Identifier : The identity of a sequence plus its polarity. Two
	 * 	segments with the same identifier have identical sequences.
	 */
	/*
	 * @constructor
	 * @param {Object} config
	 */
	function Segment(config) {
		_.copyTo(this, config);
		_.defaults(this, {
			/**
			 * @cfg
			 * The length of this segment. If unspecified and #sequence is
			 * specified, this field will be updated to match.
			 */
			segmentLength : 6,
			/**
			 * @cfg
			 * One of: `"toehold"`, `"clamp"`, `"loop"`, or `"reverse"`.
			 */
			role : "toehold",
			/**
			 * @cfg
			 */
			sequence : '',
		});
		if(this.sequence) {
			this.segmentLength = this.sequence.length;
		}

		if(this.name) {
			_.extend(this, DNA.parseIdentifier(this.name));
		}
		this.id = Segment.getId();
		Segment.register(this.id, this);
	}


	Segment.prototype = {
		/**
		 * Returns the unique ID assigned to this segment. This is distinct
		 * from the identity or identifier. See {@link App.dynamic.Segment class description}.
		 */
		getId : function() {
			if(!this.id) {
				this.id = Segment.getId();
			}
			return this.id;
		},
		/**
		 * Gets the original name of the Segment
		 */
		getName : function() {
			return this.name;
		},
		/**
		 * Gets the original name of the segment, qualified by the name of the
		 * parent {@link App.dynamic.Domain domain} and {@link App.dynamic.Node node}.
		 *
		 * @return {String} fullName In the form [node name].[domain name].[segment name]
		 */
		getFullName : function() {
			var domain = this.getDomain(), node = this.getNode();

			return [node.getName(), domain.getName(), this.getName()].join('.')
		},
		/**
		 * Returns the identity portion of the original {@link #getName name}, qualified
		 * with a polarity.
		 */
		getQualifiedName : function() {
			return DNA.makeIdentity(DNA.normalizeIdentity(this.name), this.polarity);
		},
		/**
		 * Returns the identity of this segment
		 */
		getIdentity : function() {
			return this.identity;
		},
		/**
		 * Returns the identifier (segment + polarity specifier) for this segment
		 */
		getIdentifier : function(name, polarity) {
			return this.identity + ((this.polarity == -1) ? DNA.defaultPolaritySpecifier : '');
		},
		/**
		 * @return {Node} node The node which contains this segment
		 */
		getNode : function() {
			return this.getDomain().getNode();
		},
		/**
		 * @return {Domain} domain The domain which contains this segment
		 */
		getDomain : function() {
			return this.domain;
		},
		getAbsolutePolarity : function() {
			var nodePolarity = this.getNode().polarity, domainPolarity = this.getDomain().polarity;
			return nodePolarity * domainPolarity * this.polarity;
		},
		/**
		 * Gets the sequence (or degenerate sequence) of this segment
		 */
		getSequence : function() {
			if(this.sequence && this.sequence.length == this.segmentLength) {
				return this.sequence;
			} else {
				return (new Array(this.segmentLength + 1)).join('N');
			}
		},
		/**
		 * Gets the length of this segment in nucleotides
		 */
		getLength : function() {
			return (this.sequence ? this.sequence.length : this.segmentLength);
		},
		/**
		 * Returns a copy of this Segment's salient (non-prototype) properties
		 */
		duplicate : function() {
			return _.copy(this);
		},
	}

	_.extend(Segment, {
		segments : {},
		register : function(id, segment) {
			this.segments[id] = segment;
			return segment;
		},
		get : function(id) {
			if( id instanceof Segment) {
				return id;
			} else {
				return this.segments[id];
			}
		},
		/**
		 * Returns the next unique segment ID
		 * @static
		 */
		getId : function() {
			var count = 0;
			return function() {
				count++;
				return "segment_" + count;
			}
		}()
	})

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.Complement
	 * Represents a complementarity between two ports
	 */
	/*
	 * @constructor
	 * @param {Object} config
	 */
	function Complement(config) {
		/**
		 * @cfg {String/App.dynamic.Node} sourceNode
		 * Name or reference to the node which will become #property-sourceNode
		 */
		/**
		 * @property {App.dynamic.Node} sourceNode
		 */
		this.sourceNode = Node.get(config.sourceNode);
		/**
		 * @cfg {String/App.dynamic.Node} node
		 * Name or reference to the node which will become #property-targetNode
		 */
		/**
		 * @property {App.dynamic.Node} targetNode
		 */
		this.targetNode = Node.get(config.node);

		/**
		 * @cfg {String} source
		 * Name of the {@link App.dynamic.Domain domain} which will become #property-sourcePort
		 */
		/**
		 * @property {String} sourcePort
		 */
		this.sourcePort = this.sourceNode ? this.sourceNode.getDomain(config.source) : null;
		/**
		 * @cfg {String} target
		 * Name of the {@link App.dynamic.Domain domain} which will become #property-targetPort
		 */
		/**
		 * @property {String} targetPort
		 */
		this.targetPort = this.targetNode ? this.targetNode.getDomain(config.target) : null;

		// Throw errors if anything is wrong.
		if(this.sourceNode == null) {
			throw new DynamlError({
				type : 'phantom complement',
				message : 'Complementarity generated with no sourceNode',
				config : config,
				sourceNode : config.sourceNode,
				targetNode : config.node,
				sourcePort : config.source,
				targetPort : config.target,
			})
		}
		if(this.targetNode == null) {
			throw new DynamlError({
				type : 'invalid complement',
				message : 'In complement from Node <%= sourceNode %>, target node <%= targetNode %>, was not found.',
				sourceNode : config.sourceNode,
				targetNode : config.node,
				sourcePort : config.source,
				targetPort : config.target,
			});
		}
		if(this.sourcePort == null) {
			throw new DynamlError({
				type : 'invalid complement',
				message : 'In complement between Node <%= sourceNode %> and Node <%= targetNode %>, source port <%= sourcePort %> not found.',
				sourceNode : config.sourceNode,
				targetNode : config.node,
				sourcePort : config.source,
				targetPort : config.target,
			});
		}
		if(this.targetPort == null) {
			throw new DynamlError({
				type : 'invalid complement',
				message : 'In complement between Node <%= sourceNode %> and Node <%= targetNode %>, target port <%= targetPort %> not found.',
				sourceNode : config.sourceNode,
				targetNode : config.node,
				sourcePort : config.source,
				targetPort : config.target,
			});
		}
	}


	Complement.prototype = {
		/**
		 * Returns the port/domain on the #sourceNode on which this Complement operates
		 */
		getSourceDomain : function() {
			return this.sourcePort;
		},
		/**
		 * Returns the port/domain on the #sourceNode on which this Complement operates
		 */
		getSourcePort : function() {
			return this.sourcePort;
		},
		/**
		 * Returns the port/domain on the #targetNode on which this Complement operates
		 */
		getTargetDomain : function() {
			return this.targetPort;
		},
		/**
		 * Returns the port/domain on the #targetNode on which this Complement operates
		 */
		getTargetPort : function() {
			return this.targetPort;
		},
	}

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.DynamlError
	 * Class for representing general errors which may occur during the course
	 * of DyNAML system compilation.
	 */
	/*
	 * @constructor
	 * @param {Object} config
	 */
	function DynamlError(config) {
		/**
		 * @cfg {String} message
		 * A human-readable message which contains information about the error
		 * which has occured. This message may optionally be a template
		 * containing EJS (`<% arbitrary code %>` or `<%= variable %>`) tags,
		 * which will be interpolated by _#template. The scope used will be
		 * the configuration object passed to the #constructor
		 *
		 */
		if(config.message) {
			config.message = _.template(config.message, config);
		}
		_.copyTo(this, config);
	}

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.Library
	 * Represents a collection of {@link App.dynamic.Motif motifs} and
	 * {@link App.dynamic.Node nodes} which can be compiled into 
	 * {@link App.dynamic.Strand strands}. Creating a new library object
	 * does not automatically compile the system; instead, you should either
	 * call the #compile method of this class, or use App.dynamic.Compiler
	 */
	function Library(config) {
		_.copyTo(this,config);
		_.defaults(this, {
			/**
			 * @cfg {Object[]/App.dynamic.Motif[]} motifs
			 * Array of {@link App.dynamic.Motif motifs} or motif configuration
			 * objects
			 */
			/**
			 * @property {App.dynamic.Motif[]} motifs
			 */
			motifs : [],
			/**
			 * @cfg {Object[]/App.dynamic.Node[]} nodes
			 * Array of {@link App.dynamic.Node nodes} or node configuration
			 * objects
			 */
			/**
			 * @property {App.dynamic.Node[]} nodes
			 */
			nodes : [],
			/**
			 * @cfg {Object[]} import
			 */
			'import' : [],
		});
	}
	
	Library.prototype = {
		/**
		 * Compiles this library to generate #strands, #segments, etc.
		 */
		compile: function() {
			return Compiler.compileLibrary(this);
		},
		/**
		 * @inheritdoc App.dynamic.Compiler#printStrands
		 */
		printStrands: function(config) {
			return Compiler.printStrands(this,config);
		},
		
		toNupackOutput: function() {
			// #
			// # design a 2-input AND gate (Seelig et al., Science, 2006)
			// # design material, temperature, trials, and model options
			// # see NUPACK User Guide for valid options for 
			// # material, sodium, magnesium, and dangles
			// #
			// material = dna
			// temperature[C] = 23.0 # optional units: C (default) or K
			// trials = 3
			// sodium[M] = 1.0       # optional units: M (default), mM, uM, nM, pM
			// dangles = some
			// 
			// #
			// # target structures
			// #
			// structure signal1 = U36
			// structure signal2 = U36
			// structure gate_full = D30(+D30(U6+))
			// structure gate_step = D30(+U30)
			// structure output = D36(+U24)
			// structure waste = D36(+)
			// 
			// #
			// # sequence domains
			// #
			// domain gate_toehold1 = N6
			// domain gate_toehold2 = N6
			// domain gate_duplex1 = N24
			// domain gate_duplex2 = N30
			// 
			// #
			// # strands (optional, used for threading sequence information 
			// # and for displaying results)
			// # 
			// strand J = gate_toehold1* gate_duplex1* gate_toehold2
			// strand M = gate_duplex2* gate_toehold2*
			// strand G = gate_toehold2* gate_duplex1 gate_toehold1
			// strand F = gate_duplex1* gate_toehold2 gate_duplex2
			// strand E = gate_duplex2*
			// 
			// #
			// # thread strand sequence information onto target structures
			// # 
			// signal1.seq = J
			// signal2.seq = M
			// gate_full.seq = E G F
			// gate_step.seq = E F
			// output.seq = M F
			// waste.seq = J G
			// 
			// #
			// # specify stop conditions for normalized ensemble defect
			// # default: 1.0 percent for each target structure
			// #
			// signal1.stop[%] = 10.0   # optional units: % or frac 
			// signal2.stop[%] = 10.0      # larger defect for unpaired structures   
			// gate_full.stop[%] = 5.0 # smaller defect for mixed structures 
			// gate_step.stop[%] = 5.0
			// output.stop[%] = 5.0
			// waste.stop[%] = 2.0
			// 
			// #
			// # prevent sequence patterns
			// #
			// prevent = AAAA, CCCC, GGGG, UUUU, KKKKKK, MMMMMM, RRRRRR, SSSSSS, WWWWWW, YYYYYY
			// 
			
			var library = this;

			var out = [];
			
			// TODO: Add custom parameters
			// material = dna
			// temperature[C] = 23.0 # optional units: C (default) or K
			// trials = 3
			// sodium[M] = 1.0       # optional units: M (default), mM, uM, nM, pM
			// dangles = some
			
			
			// print domains (segments)
			// e.g.: domain x = N7
			
			out.push(_.map(library.segments,function(segment) {
				return ['domain',segment.identity,'=',segment.getSequence()].join(' ');
			}).join('\n'));
			
			// print strands ("optional?")
			// e.g.: strand J = gate_toehold1* gate_duplex1* gate_toehold2
			// TODO: new NUPACK requires these not to be numbers... poo; need to letter domains.
			
			out.push(_.map(library.strands,function(strand) {
				return ['strand',strand.getName(),'='].concat(_.map(strand.getSegments(),function(segment) {
					return segment.getIdentifier();
				})).join(' ');
			}).join('\n'));
			
			// print structures
			// e.g.: structure gate_full = D30(+D30(U6+))
			// e.g.: structure haripin = Ux Hx Ux Ux
			
			out.push(_.map(library.strands,function(strand) {
				return ['structure',strand.getName()+'_structure','=',strand.getStructure()].join(' ');
			}).join('\n'));
			
			// thread sequences onto structures 
			// e.g.: gate_full.seq = E G F
			
			out.push(_.map(library.strands,function(strand) {
				return [strand.getName()+'_structure.seq','=',strand.getName()].join(' ');
			}).join('\n'));
			
			return out.join('\n\n');
			
		}
	};
	
	

	/* ***************************************************************** */
	// Do the actual compiling

	/**
	 * @class App.dynamic.Compiler
	 * Performs the business of compiling {@link App.dynamic.Library libraries} 
	 * into strands and segments. This class is the preferred method of generating
	 * {@link App.dynamic.Library libraries}.
	 * 
	 * The main entry-point method is #compile, which can be passed a JSON string
	 * and will attempt to compile it into a library, throwing 
	 * {@link App.dynamic.DynamlError DynamlErrors} upon failure.
	 * 
	 * @singleton
	 */
	var Compiler = (function() {
		
		/**
		 * Parses a DyNAML string into JSON library configuration object. Throws 
		 * a {@link App.dynamic.DynamlError DynamlError} on failure.
		 * @param {String} jsonString A string-representation of a JSON DyNAML specification
		 * @returns {Object} library
		 */
		function parse(jsonString) {
			var input = jsonString, library;
			try {
				library = Ext.decode(input);
			} catch(e) {
				throw new DynamlError({
					type : e.type,
					message : 'Parsing error: ' + e.message,
					stack : e.stack,
				});
			}
			return library;
		}
		
		/**
		 * Parses a DyNAML string into a library. Throws 
		 * a {@link App.dynamic.DynamlError DynamlError} on failure.
		 * @param {String} jsonString A string-representation of a JSON DyNAML specification
		 * @returns {App.dynamic.Library} library
		 */
		function compile(jsonString) {
			return this.compileLibrary(this.parse(jsonString));
		}
		
		/**
		 * Compiles a {@link App.dynamic.Library library} configuration object 
		 * into a compiled library.
		 * @param {Object} libraryConfig
		 * @returns {App.dynamic.Library} library
		 */
		function compileLibrary(library) {

			if(library) {
				
				/* ************************************************************
				 * Set up library objects
				 * 
				 * This process generates nodes which properly inherit the 
				 * properties of defined or imported Motifs, as well as
				 * Complements which refer to instantiated Nodes.
				 * 
				 */
				
				library = new Library(library);
				
				// Import motifs first
				if(library['import']) {
					_.each(library['import'],function(statement) {
						if(statement.type && statement.name) {
							switch(statement.type) {
								case 'motif':
									library.motifs.unshift(this.importObject(statement.type,statement.name));
									break;
								case 'node':
									library.nodes.unshift(this.importObject(statement.type,statement.name));
									break;
								default:
									break;
							}
						}
					},this);
				}

				// Instantiate motifs to Motif objects
				library.motifs = _.map(library.motifs, function(motif) {
					return new Motif(motif);
				});
				
				// Instantiate nodes to Node objects
				library.nodes = _.map(library.nodes, function(node) {
					if(node.polarity) {
						delete node.polarity;
					}
					return new Node(node);
				});
				
				// Generate array of Complement objects
				var complementarities = _.chain(library.nodes).map(function(node) {
					return _.map(node.complementarities || [], function(complement) {
						complement.sourceNode = node;
						return new Complement(complement);
					});
				}).compact().flatten().value();

				/* ************************************************************
				 * Generate Node polarities. 
				 * 
				 * This process will be repeated until the polarities stop changing.
				 * This is necessary because multiple passes may be required to set the polarities of upstream
				 * nodes before they can propogate to downstream nodes.
				 */
				var changing;
				do {
					changing = false;

					// Traverse Complements to generate Node polarities
					_.each(complementarities, function(complement) {

						// If the sourceNode's polarity has been set
						if(complement.sourceNode.polarity != 0) {

							// Downstream node should have polarity opposite the sourcePort's absolute polarity
							// (absolute polarity) = (relative port polarity) * (node polarity)
							var targetPolarity = -1 * complement.sourcePort.polarity * complement.sourceNode.polarity

							// If the targetNode already has a polarity and it's wrong, throw polarity error
							if(complement.targetNode.polarity == -targetPolarity) {
								throw new DynamlError({
									type : 'polarity conflict',
									message : _.template('Complementarity statement in node <%= source %> implies node <%= target %> ' + 'should have polarity <%= expected %>, but instead it has polarity <%= encountered %>', {
										source : complement.sourceNode.name,
										target : complement.targetNode.name,
										expected : targetPolarity,
										encountered : -targetPolarity,
									}),
									nodes : [complement.sourceNode, complement.targetNode],
									sourceNode : complement.sourceNode,
									targetNode : complement.targetNode,
									sourcePort : complement.getSourcePort(),
									targetPort : complement.getTargetPort(),
								});
							} else if(complement.targetNode.polarity == targetPolarity) {
								return;
							} else {
								// Else propogate polarity downstream
								complement.targetNode.polarity = targetPolarity;
								changing = true;
							}
						}
					});
				} while(changing)

				// Set polarity of all unspecified nodes to 1 or whatever
				_.each(library.nodes, function(node) {
					if(node.polarity == 0) {
						node.polarity = 1;
					}
				});
				
				/* ************************************************************
				 * Build constraint matrix (formerly "cmat")
				 * 
				 * Assembles a constraint matrix for each Node by calling 
				 * Node#getConstraintMatrix, then _.reduce-ing them into a 
				 * single hash. 
				 * 
				 * The constraint matrix effectively a jagged two-dimensional 
				 * hash. The keys are Segment IDs (see App.dynamic.Segment#id)
				 * and the values indicate the relationship between two segments:
				 * 
				 *     1 => equal
				 *     -1 => complementary
				 *     0 => orthogonal
				 * 
				 * See Node#getConstraintMatrix for more detail
				 * 
				 */
				
				// Build constraint matrix by collecting node constraint matricies
				var constraints = _.reduce(library.nodes, function(constraints, node) {
					_.extend(constraints, node.getConstraintMatrix());
					return constraints;
				}, {});

				// Add complementarity constraints to constraint matrix
				_.each(complementarities, function(complement) {
					// clone so we can potentially flip later or mutate later
					var sourceSegments = _.clone(complement.getSourceDomain().getSegments());
					var targetSegments = _.clone(complement.getTargetDomain().getSegments());

					if(complement.sourceNode.polarity == complement.targetNode.polarity) {
						targetSegments.reverse();
					}
					
					// Two complementary ports should have the same length
					if(sourceSegments.length != targetSegments.length) {

						// If there's just an extra clamp, that's okay
						if(sourceSegments.length - targetSegments.length == 1 && _.last(sourceSegments).role == 'clamp') {
							sourceSegments.pop();
						} else if(targetSegments.length - sourceSegments.length == 1 && _.last(targetSegments).role == 'clamp') {
							targetSegments.pop();

						} else {
							// Otherwise complain
							throw new DynamlError({
								type : 'domain length mismatch',
								message : _.template('Complementarity statement in node <%= source %> implies domain <%= target %> ' + 'should have <%= expected %> segments, but instead it has <%= encountered %> segments', {
									source : complement.sourceNode.getName(),
									target : complement.targetPort.getName(),
									expected : sourceSegments.length,
									encountered : targetSegments.length,
								}),
								nodes : [complement.sourceNode, complement.targetNode],
								sourceNode : complement.sourceNode,
								targetNode : complement.targetNode,
								sourcePort : complement.getSourcePort(),
								targetPort : complement.getTargetPort(),
							});
						}
					}

					// TODO: handle bridge ports

					// Merges happen left (source) to right (target)
					// For each segment in sourceSegments
					for(var i = 0; i < sourceSegments.length; i++) {
						constraints[sourceSegments[i].getId()][targetSegments[i].getId()] = -1;
					}
				});
				
				/* ************************************************************
				 * Generate numerical segment identities
				 * 
				 * First generate a list (labels) mapping segment IDs to unique
				 * numerical segment identities. Then traverse the hash of 
				 * constraints and enforce each constraint by setting segments 
				 * to have equal or complementary identities. 
				 * 
				 */
				
				// labels will map segment IDs to the eventual numerical segment identities.
				var labels = ( function() {
					var i = 0;
					return _.reduce(_.keys(constraints), function(labels, segmentId) {
						i++;
						labels[segmentId] = -i;
						return labels;
					}, {});
				}());

				
				// Merge segment identities
				var changing;
				do {
					changing = false;

					// Merge segment identities
					_.each(constraints, function(leftSegmentConstraints, leftSegmentId) {
						_.each(leftSegmentConstraints, function(constraint, rightSegmentId) {

							// if no constraint
							if(Math.abs(constraint) != 1) {
								return;

								// If some constraint exists
							} else {

								// Preserve the lower segment ID
								var segments = _.sortBy([leftSegmentId, rightSegmentId], function(id) {
									return Math.abs(labels[id])
								});
								var segmentIdToRelabel = _.last(segments);
								//Math.max(Math.abs(labels[leftSegmentId]), Math.abs(labels[rightSegmentId]));
								var segmentIdToKeep = _.first(segments);
								//Math.min(Math.abs(labels[leftSegmentId]), Math.abs(labels[rightSegmentId]));

								var newLabel = null;

								// If segments must be equal
								if(constraint == 1) {

									// Ensure they're not already complementary
									if(labels[leftSegmentId] == -labels[rightSegmentId]) {
										var leftSeg = Segment.get(leftSegmentId), rightSeg = Segment.get(rightSegmentId);
										throw new DynamlError({
											type : 'equality conflict',
											message : "Segments <%= left %> and <%= right %> should be equal, but they're already complementary!",
											left : leftSeg.getFullName(),
											right : rightSeg.getFullName(),
											leftSegment : leftSeg,
											rightSegment : rightSeg,
											nodes : [leftSeg.getNode(), rightSeg.getNode()],
										});
									} else if(labels[leftSegmentId] != labels[rightSegmentId]) {
										// Otherwise, the downstream label should equal the upstream label
										newLabel = labels[segmentIdToKeep];
									}

									// If segments must be complementary
								} else if(constraint == -1) {

									// Ensure they're not already equal
									if(labels[leftSegmentId] == labels[rightSegmentId]) {
										var leftSeg = Segment.get(leftSegmentId), rightSeg = Segment.get(rightSegmentId);
										throw new DynamlError({
											type : 'equality conflict',
											message : "Segments <%= left %> and <%= right %> should be complementary, but they're already equal!",
											left : leftSeg.getFullName(),
											right : rightSeg.getFullName(),
											leftSegment : leftSeg,
											rightSegment : rightSeg,
											nodes : [leftSeg.getNode(), rightSeg.getNode()],
											// TODO: equality/complementarity conflict
										});
									} else if(labels[leftSegmentId] != -labels[rightSegmentId]) {

										// Otherwise, the downstream label should be opposite the upstream label
										newLabel = -Math.abs(labels[segmentIdToKeep]) * DNA.signum(labels[leftSegmentId]) * DNA.signum(labels[rightSegmentId]);
									}
								}

								// If segments don't already satisfy constraint
								if(newLabel != null) {

									// Find the segment IDs of all segments which will need to be relabeled
									var segmentIdsToRelabel = _.filter(_.keys(labels), function(segmentId) {
										return Math.abs(labels[segmentId]) == Math.abs(labels[segmentIdToRelabel]);
									});
									// Copy labels so we can change them all at once
									var tempLabels = _.clone(labels);

									// Update downstream segments.
									_.each(segmentIdsToRelabel, function(segmentId) {

										var segment = Segment.get(segmentId);
										segment.identity = Math.abs(newLabel);
										segment.polarity = DNA.signum(newLabel);

										if(constraint == -1) {
											tempLabels[segmentId] = DNA.signum(labels[segmentId]) * newLabel;
										} else {
											tempLabels[segmentId] = newLabel;
										}
										changing = true;
									});
									labels = tempLabels;
								}
							}

						});
					});
				} while(changing);

				// Condense labels so that there are no skipped numbers
				labels = (function(labels) {
					var uniqLabels = _.chain(labels).values().map(Math.abs).uniq().value(), mapping = DNA.mapUnique(uniqLabels, 1);
					return _.reduce(labels, function(labels, label, segmentId) {
						labels[segmentId] = mapping[Math.abs(label)] * DNA.signum(label);
						return labels;
					}, {});
				})(labels);

				/* ************************************************************
				 * Generate output properties of compiled library
				 */

				// Build array of all Segment objects, assign Segment objects to their identity in labels
				library.allSegments = [];

				_.each(library.nodes, function(node) {
					_.each(node.getSegments(), function(segment) {
						segment.identity = Math.abs(labels[segment.getId()]);
						segment.polarity = DNA.signum(labels[segment.getId()]);
						library.allSegments.push(segment);
					})
				});
				
				// Build an array of new Segment objects, each representing a unique segment identity.
				// This is mostly for the benefit of output generators like DD or NUPACK which
				// need to generate a list of each unique segment in the ensemble
				library.segments = _.chain(library.allSegments).uniq(false, function(segment) {
					return segment.identity;
				}).map(function(segment) {
					var duplicate = segment.duplicate();
					
					// These new Segments are deliberately divorced from their 
					// original "name", parent node, and polarity, since the purpose
					// of these objects is to describe each unique segment identity 
					// and its sequence, length, etc (salient properties for sequence
					// designers mostly). 
					delete duplicate.name;
					delete duplicate.node;
					delete duplicate.polarity;
					return new Segment(duplicate);
				}).value();

				// Build an array of strands with properly numbered segments.
				library.strands = _.map(library.nodes, function(node) {
					return new Strand(node);
				});
			} else {
				library = {};
			}
			return library;
		}
		
		/**
		 * Prints a textual description of a given library for sequence design
		 * @param {App.dynamic.Library} library
		 * @param {Object} [options]
		 * @param {Object} [options.annotations=true] True to display brackets around domains and to indicate strand/domain polarities
		 * @param {Object} [options.originalSegmentNames=false] True to use the original {@link App.dynamic.Segment#name segment names} in the strand descriptions
		 */
		function printStrands(library,options) {
			options = options || {};
			_.defaults(options,{
				annotations: true,
				originalSegmentNames : false,
			});
			var out = '';
	
			var defaultPolaritySpecifier = this.defaultPolaritySpecifier;
			
			function makeIdentifier(name, polarity) {
				return name + ((polarity == -1) ? defaultPolaritySpecifier : '');
			}
			
			out += _.map(library.segments,function(segment) {
				return ['sequence', /*makeIdentifier(segment.identity,segment.polarity),*/ segment.getIdentifier(),':',segment.getSequence()].join(' ')
			}).join('\n');
			
			out += '\n';
			
			out += _.map(library.strands, function(strand) {
				var name = strand.name;
				var domains = _.clone(strand.getDomains());
				if(strand.polarity == -1) {
					domains = domains.reverse();
				}
				
				return _([			
					// leader
					options.annotations ? 'strand' : '', 
					
					name, 
					
					// strand polarity specifier
					(options.annotations ? (strand.polarity == -1 ? '-' : '+') : ''),
					
					':',
					
					].concat(_.map(domains, function(domain) {
					
						var segments = _.clone(domain.getSegments());
						if(strand.polarity == -1) {
							segments = segments.reverse();
						}
						
						return [
							// opening domain grouping bracket
							(options.annotations ? '[' : '')
							
							// segment body
							].concat(_.map(domain.getSegments(),function(segment) {				
								return options.originalSegmentNames ? segment.getQualifiedName() : segment.getIdentifier(); //makeIdentifier(segment.identity, segment.polarity);
							}))
							
							// closing bracket
							.concat([options.annotations ? ']'+(domain.polarity== -1 ? '-' : '+') : ''])
							
							// convert to string
							.join(' ');
						
				}, ''))).compact().join(' ');
			}).join('\n');
	
			return out;
		}
		
		
		var standardMotifs = {
			'm1' :{	
				name: 'm1',
				type: 'initiator',
			    isInitiator: true,
			    domains: [{
			    	name: 'A',
			    	role: 'output',
			    	polarity: '+',
			    	segments: [
				      	{name: 'a', role: ''},
				        {name: 'w', role: 'clamp'},
				        {name: 'b', role: ''},
				        {name: 'x', role: 'clamp'},
			    	]
			    }]
			  }, 
			'm19':{
				name: 'm19',
				type: 'hairpin',
				domains: [{
			    	name: 'A',
			    	role: 'input',
			      	polarity: '+',
			    	segments:  [
			      		{name: 'a', role: 'toehold'},
				      	{name: 'w', role: 'clamp'},
				        {name: 'b', role: 'reverse'},
				      	{name: 'x', role: 'clamp'},
			    	]
			   },{
				   name: 'B',
				   role: 'output',
				   polarity: '-',
				   segments: [
					   {name: 'y', role: 'clamp'},
					   {name: 'c', role: 'loop'},
					   {name: 'x*', role: 'clamp'},
					   {name: 'b*', role: 'toehold'},
					   {name: 'w*', role: 'clamp'},
				   ]
			   }]
			}
		};
		
		return {
			compile: compile,
			compileLibrary: compileLibrary,
			parse: parse,
			printStrands: printStrands, 
			importObject : function(type,name) {
				switch(type) {
					case 'motif': 
						if(this.standardMotifs[name]) {
							return this.standardMotifs[name];
						}
						// TODO: import from external files
				}
			},
			standardMotifs : standardMotifs,
		}

	})();

	return {
		Node : Node,
		Motif : Motif,
		Strand : Strand,
		Segment : Segment,
		Library : Library,
		Compiler : Compiler,
		DynamlError : DynamlError, 
	}

})(_,DNA);
