Ext.define('App.ui.DynamlEditor', {
	extend : 'App.ui.TextEditor',
	mode : 'javascript',
	iconCls : 'dynaml',
	editorType : 'DyNAML',
	initComponent : function() {
		Ext.apply(this, {
			tbar : [{
				text : 'Compile',
				iconCls : 'compile',
				handler : function() {
					try{
						var res = this.compile();
						App.log(this.printStrands(res));
						App.log(this.printStrands(res,{
							annotations: false,
						}))
						//console.log(this.printStrands2(res));
					} catch (e) {
						App.log(e.message,{level: 'error'});
						throw e
					}
				},
				scope : this,
			}, '->', Ext.create('App.ui.SaveButton', {
				app : this,
			})],
		});
		this.callParent(arguments);
	},
	defaultPolaritySpecifier : '*',
	printDD : function(library) {
		
	},
	printStrands : function(library,options) {
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
	},
	printStrandsOriginal : function(library) {
		var out = '';

		var defaultPolaritySpecifier = this.defaultPolaritySpecifier;
		
		function getPolarity (identifier) {
			return identifier ? ((identifier[identifier.length - 1] == '*' || identifier[identifier.length - 1] == "'") ? -1 : 1) : 0;
		}
		
		function makeIdentifier(name, polarity) {
			return name + ((polarity == -1) ? defaultPolaritySpecifier : '');
		}
		
		function normalizeIdentity (identifier) {
			if(getPolarity(identifier) == -1) {
				return identifier.substring(0, identifier.length - 1);
			}
			return identifier;
		}
		
		out += _.map(library.segments,function(segment) {
			return ['sequence', /*makeIdentifier(segment.identity,segment.polarity),*/ segment.getIdentifier(),':',new Array(segment.segmentLength).join('N')].join(' ')
		}).join('\n');
		
		out += '\n';
		
		out += _.map(library.strands, function(strand) {
			var name = strand.name;
			var domains = strand.getDomains();
			var segments = strand.getSegments();
			if(strand.polarity == -1) {
				segments = segments.reverse();
			}
			return ['strand',name,(strand.polarity == -1 ? '-' : '+'),':',].concat(_.map(domains, function(domain) {
				return ['['].concat(_.map(domain.getSegments(),function(segment) {				
					return normalizeIdentity(segment.name) + (segment.polarity == -1 ? defaultPolaritySpecifier : ''); //makeIdentifier(segment.identity, segment.polarity);
				})).concat([']'+(domain.polarity== -1 ? '-' : '+')]).join(' ');
			}, '')).join(' ');
		}).join('\n');

		return out;
	},
	compile : function() {
		
		function printNodeStrands(library) {
			var out = _.map(library.nodes, function(node) {
				var segments = node.getSegments(), name = node.name;
				if(node.polarity == -1) {
					segments = segments.reverse();
				}
				return ['strand',name,':',].concat(_.map(segments, function(segment) {
					return segment.getIdentifier(); //makeIdentifier(segment.identity, segment.polarity);
				}, '')).join(' ');
			}).join('\n');
			return out;
		}
		
		/**
		 * @class _
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
		 * @class App.ui.DynamlEditor.Compiler
		 * Contains a set of utility functions
		 */
		var Compiler = {
			defaultPolaritySpecifier: '*',
			makeIdentifier : function(name, polarity) {
				return name + ((polarity == -1) ? this.defaultPolaritySpecifier : '');
			},
			/**
			 * Parses a string polarity identifier or number and produces a numerical
			 * polarity
			 *
			 *     Compiler.parsePolarity("+") // => 1
			 *     Compiler.parsePolarity("-") // => -1
			 *     Compiler.parsePolarity(1) // => 1
			 *     Compiler.parsePolarity(-5) // => -1
			 *
			 * @param {String/Number} polarityString Polarity representation
			 * @returns {Number} polarity Numerical polarity (1 for 5' -> 3', -1 for 3' -> 5')
			 */
			parsePolarity : function(polarityString) {
				if(_.isNumber(polarityString)) {
					return this.signum(polarityString);
				}

				if(polarityString == "-") {
					return -1;
				} else if(polarityString == "+") {
					return 1;
				}
				return 0;
			},
			/**
			 * Gets the polarity of a given identifier string. Strings ending with * or
			 * ' are assumed to have negative (3' to 5') polarity.
			 * @param {String} identifier
			 * @return {Number} polarity 1 for 5' -> 3', -1 for 3' -> 5'
			 */
			getPolarity : function(identifier) {
				return identifier ? ((identifier[identifier.length - 1] == '*' || identifier[identifier.length - 1] == "'") ? -1 : 1) : 0;
			},
			/**
			 * Parses an identifier (identity + optional polarity specifier)
			 * to an object containing the `identity` and `polarity`
			 * @return {Object} spec
			 * @return {Object} spec.identity
			 * @return {Object} spec.polarity
			 */
			parseIdentifier : function(identifier) {
				return {
					identity : this.normalizeIdentity(identifier),
					polarity : this.getPolarity(identifier),
					// identifier : identifier,
				}
			},
			/**
			 * Strips the polarity indicator (* or ') from an identifier. In
			 * other words, gets the identity portion of an identifier.
			 * @param {String} identifier
			 * @returns {String} identity
			 */
			normalizeIdentity : function(identifier) {
				if(this.getPolarity(identifier) == -1) {
					return identifier.substring(0, identifier.length - 1);
				}
				return identifier;
			},
			/**
			 * Converts an array of objects to an Object keyed by the provided
			 * `property` of the objects.
			 *
			 *     hashBy([{id: 'a'},{id: 'b'},{id: 'c'}],'id'); // -> { a : {id: 'a'}, b: {id: 'b'}, c: {id: 'c'} }
			 *
			 * @param {Object[]} array Array of objects
			 * @param {String} property Property of the `array` of objects which should be
			 */
			hashBy : function(array, property) {
				return _.reduce(array, function(memo, obj) {
					memo[obj[property]] = obj;
				}, {});
			}, 
			signum: function(number) {
				if(number > 0) {
					return 1;
				}
				if(number < 0) {
					return -1;
				}
				return number;
			}
		};

		/* ***************************************************************** */

		/**
		 * @class App.ui.DynamlEditor.Motif
		 * Represents a single motif
		 */
		function Motif(config) {

			// Apply configuration options with defaults to this object
			_.copyTo(this, config);
			_.defaults(this,{
				name : '',
				type : 'hairpin',
				polarity : 0,
				isInitiator : false,
				domains : [],
			});

			this.domains = _.map(this.domains, function(domain) {
				return new Domain(domain);
			});
			
			_.each(this.domains,function(domain) {
				if(!domain.polarity) {
					throw new DynamlError({
						type: 'unspecified motif domain polarity',
						message: _.template('Domain <%= domain %> in motif <%= motif %> has no polarity specified. '+
						'Polarities are required for domains specified in motifs.',{
							motif: this.name,
							domain: domain.name,
						}),
						motifs: [this],
						domain: domain,
					});
				}
			},this);

			this.polarity = Compiler.parsePolarity(this.polarity);
			
			Motif.register(this.name, this);
		}


		Motif.prototype = {
			instantiate : function(config) {
				config.motif = this.name;
				return new Node(config);
			},
			getSegments : function() {
				return _.flatten(_.map(this.getDomains(), function(domain) {
					return domain.getSegments();
				}));
			},
			getDomains : function() {
				return this.domains;
			},
		}
		_.extend(Motif, {
			nextName : function() {
				var motifIndex = 0;
				return function() {
					motifIndex++;
					return "m" + motifIndex;
				}
			}(),
			motifs : {},
			register : function(name, motif) {
				this.motifs[name] = motif;
				return motif;
			},
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
		 * @class App.ui.DynamlEditor.Node
		 */
		function Node(config) {

			// Inherit motif if configured
			if(config.motif) {
				_.copyTo(this, Motif.get(config.motif));
			}

			// Save domains from the motif in a hash table by their names
			// TODO: the motif really should do this.
			var motifDomainsMap = _.reduce(this.domains || [], function(memo, domain) {
				memo[domain.name] = domain;
				return memo;
			}, {});

			// Apply configuration options with defaults to this object
			_.copyTo(this,config), 
			_.defaults({
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
			if(this.isInitiator) {
				this.polarity = -1;
			}

			Node.register(this.name, this);
		}


		Node.prototype = {
			getSegments : function() {
				return _.flatten(_.map(this.getDomains(), function(domain) {
					return domain.getSegments();
				}));
			},
			getDomains : function() {
				return this.domains;
			},
			getDomain : function(name) {
				return _.find(this.getDomains(), function(dom) {
					return dom.name == name;
				});
			},
			getName: function() {
				return this.name;
			},
			getConstraintMatrix : function() {
				var segments = this.getSegments();
				
				// fold all segments into a matrix of constraints
				// for each segment (= leftSegment):
				return _.reduce(segments,function(constraints,leftSegment) {
					
					/* 
					 * iterate through each other segment (= rightSegment)
					 * producing a hash mapping the segment ID of each other 
					 * segments which shares leftSegment's identity to the
					 * product of leftSegment's polarity and that segment's 
					 * polarity.
					 * 
					 * result: 
					 * constraints[leftSegment ID][rightSegment ID] == -1 // => leftSegment is complementary to rightSegment
					 * constraints[leftSegment ID][rightSegment ID] == 1  // => leftSegment has the same identity as rightSegment
					 * constraints[leftSegment ID][rightSegment ID] == null // => leftSegment and rightSegment are orthogonal
					 */
					constraints[leftSegment.getId()] = _.reduce(segments,function(memo,rightSegment) {
						
						// if another segment shares leftSegment's identity, but isn't leftSegment
						if((leftSegment.getIdentity() == rightSegment.getIdentity()) && (leftSegment.getId() != rightSegment.getId())) {
							
							// set constraints[leftSegment ID][rightSegment ID] to product of polarities
							memo[rightSegment.getId()] = rightSegment.polarity * leftSegment.polarity;
						}
						return memo;
					},{});
					return constraints;
				},{});
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
		};

		_.extend(Node, {
			nodes : {},
			register : function(name, nodes) {
				this.nodes[name] = nodes;
				return nodes;
			},
			get : function(name) {
				if( name instanceof Node) {
					return name;
				} else {
					return this.nodes[name];
				}
			},
		})

		/* ***************************************************************** */

		function Strand(config) {
			// Apply configuration options with defaults to this object
			_.copyTo(this, config), 
			_.defaults(this,{
			});

			this.polarity = Compiler.parsePolarity(this.polarity);

		}
		
		Strand.prototype = {
			getSegments : function() {
				return _.flatten(_.map(this.getDomains(), function(domain) {
					return domain.getSegments();
				}));
			},
			getDomains : function() {
				return this.domains;
			},
			getDomain : function(name) {
				return _.find(this.getDomains(), function(dom) {
					return dom.name == name;
				});
			},
		}

		/* ***************************************************************** */

		/**
		 * @class App.ui.DynamlEditor.Domain
		 */
		function Domain(config) {

			// Apply configuration options with defaults to this object
			_.copyTo(this, config), 
			_.defaults(this,{
				segments : [],
			});

			// Construct Segment objects from specification
			this.segments = _.map(this.segments, function(segment) {
				segment = _.extend(_.copy(segment), {
					domain : this
				});
				return new Segment(segment);
			}, this);

			this.polarity = Compiler.parsePolarity(this.polarity);
		}


		Domain.prototype = {
			role : "output",
			getSegments : function() {
				return this.segments;
			},
			/**
			 * @return {Node} node The node which contains this domain.
			 */
			getNode : function() {
				return this.node;
			},
			getName: function() {
				return this.name;
			}
		};

		/* ***************************************************************** */

		/**
		 * @class App.ui.DynamlEditor.Segment
		 */
		function Segment(config) {
			_.copyTo(this, config);
			_.defaults(this,{
				segmentLength: 6,
				role : "toehold",
				sequence: '',
			});
			if(this.sequence) {
				this.segmentLength = this.sequence.length;
			}
			
			if(this.name) {
				_.extend(this, Compiler.parseIdentifier(this.name));
			}
			this.id = Segment.getId();
			Segment.register(this.id,this);
		}


		Segment.prototype = {
			getId : function() {
				if(!this.id) {
					this.id = Segment.getId();
				}
				return this.id;
			},
			getName: function() {
				return this.name;
			},
			getFullName : function() {
				var domain = this.getDomain(),
					node = this.getNode();
				
				return [node.getName(),domain.getName(),this.getName()].join('.')
			},
			getQualifiedName : function() {
				return Compiler.makeIdentity(Compiler.normalizeIdentity(this.name),this.polarity); 
			},
			getIdentity : function() {
				return this.identity;
			},
			getIdentifier: function(name, polarity) {
				return this.identity + ((this.polarity == -1) ? Compiler.defaultPolaritySpecifier : '');
			},
			/**
			 * @return {Node} node The node which contain this segment
			 */
			getNode : function() {
				return this.getDomain().getNode();
			},
			/**
			 * @return {Domain} domain The domain which contain this segment
			 */
			getDomain : function() {
				return this.domain;
			},
			getAbsolutePolarity : function() {
				var nodePolarity = this.getNode().polarity, domainPolarity = this.getDomain().polarity;
				return nodePolarity * domainPolarity * this.polarity;
			},
			getSequence: function() {
				if(this.sequence && this.sequence.length == this.segmentLength) {
					return this.sequence;
				} else {
					return (new Array(this.segmentLength+1)).join('N');
				}
			},
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
		 * @class App.ui.DynamlEditor.Complement
		 */
		function Complement(config) {
			this.sourceNode = Node.get(config.sourceNode);
			this.targetNode = Node.get(config.node);
			this.sourcePort = this.sourceNode ? this.sourceNode.getDomain(config.source) : null;
			this.targetPort = this.targetNode ? this.targetNode.getDomain(config.target) : null;

			// Throw errors if anything is wrong.
			if(this.sourceNode == null) {
				throw new DynamlError({
					type: 'phantom complement',
					message: 'Complementarity generated with no sourceNode',
					config: config,
					sourceNode: config.sourceNode,
					targetNode: config.node,
					sourcePort : config.source,
					targetPort : config.target,
				})
			}
			if(this.targetNode == null) {
				throw new DynamlError({
					type: 'invalid complement',
					message: 'In complement from Node <%= sourceNode %>, target node <%= targetNode %>, was not found.',
					sourceNode: config.sourceNode,
					targetNode: config.node,
					sourcePort : config.source,
					targetPort : config.target,
				});
			}
			if(this.sourcePort == null) {
				throw new DynamlError({
					type: 'invalid complement',
					message: 'In complement between Node <%= sourceNode %> and Node <%= targetNode %>, source port <%= sourcePort %> not found.',
					sourceNode: config.sourceNode,
					targetNode: config.node,
					sourcePort : config.source,
					targetPort : config.target,
				});
			}
			if(this.targetPort == null) {
				throw new DynamlError({
					type: 'invalid complement',
					message: 'In complement between Node <%= sourceNode %> and Node <%= targetNode %>, target port <%= targetPort %> not found.',
					sourceNode: config.sourceNode,
					targetNode: config.node,
					sourcePort : config.source,
					targetPort : config.target,
				});
			}
		}

		Complement.prototype = {
			getSourceDomain : function() {
				return this.sourcePort;
			},
			getSourcePort : function() {
				return this.sourcePort;
			},
			getTargetDomain : function() {
				return this.targetPort;
			},
			getTargetPort : function() {
				return this.targetPort;
			},
		}

		/* ***************************************************************** */

		function DynamlError(config) {
			if(config.message) {
				config.message = _.template(config.message,config);
			}
			_.copyTo(this, config);
		}

		/* ***************************************************************** */
		// Do the actual compiling

		var input = this.getValue(), library;
		try {
			library = Ext.decode(input);
		} catch(e) {
			throw new DynamlError({
				type: e.type,
				message: 'Parsing error: '+e.message,
				stack: e.stack,
			});
		}

		if(library) {
			library = _.defaults(library, {
				motifs : [],
				nodes : [],
				'import' : [],
			})
			
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

			/* 
			 * Generate Node polarities. This process will be repeated until the polarities stop changing.
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
						} else if (complement.targetNode.polarity == targetPolarity) { 
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
			_.each(library.nodes,function(node) {
				if(node.polarity==0) {
					node.polarity = 1;
				}
			});
			
			
			// Build constraint matrix by collecting node constraint matricies
			var constraints = _.reduce(library.nodes,function(constraints,node) {
				_.extend(constraints, node.getConstraintMatrix());
				return constraints;
			},{});
			
			// Add complementarity constraints to constraint matrix
			_.each(complementarities, function(complement) {
					var sourceSegments = _.clone(complement.getSourceDomain().getSegments());
					var targetSegments = _.clone(complement.getTargetDomain().getSegments()); // clone so we can potentially flip later
					
					if(complement.sourceNode.polarity == complement.targetNode.polarity) {
						targetSegments.reverse();
					}
					
					if(sourceSegments.length != targetSegments.length) {
						
						// If there's just an extra clamp, that's okay
						if(sourceSegments.length - targetSegments.length == 1 && _.last(sourceSegments).role == 'clamp') {
							sourceSegments.pop();
						} else if (targetSegments.length - sourceSegments.length == 1 && _.last(targetSegments).role == 'clamp' ) {
							targetSegments.pop();
						
						// Otherwise complain
						} else {
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
			
			// labels will map segment IDs to the eventual numerical segment identities.
			var labels = (function() {
				var i = 0;
				return _.reduce(_.keys(constraints),function(labels,segmentId) {
					i++;
					labels[segmentId] = -i;
					return labels;
				}, {});
			}());
			
			// For debugging: print constraint matrix
			// (function() {
				// console.log(constraints);
// 				
				// function newFilledArray(length, val) {
				    // var array = [];
				    // for (var i = 0; i < length; i++) {
				        // array[i] = val;
				    // }
				    // return array;
				// }
// 				
				// function zeros(x) {
					// return newFilledArray(x,0);
				// }
// 				
				// var l = _.keys(constraints).length;
				// var cmat = _.map(constraints,function(list,segmentId) {
					// return _.reduce(list,function(memo,value,segmentId) {
						// memo[Math.abs(labels[segmentId])-1] = value;
						// return memo;
					// },zeros(l));
				// });
// 				
				// console.log(cmat);
				// console.log('['+_.map(cmat,function(list) {
					// return ['[',list.join(', '),']'].join(' ');
				// }).join(',\n')+']')
			// })()
		
			var changing;
			do {
				changing = false;
				
				// Merge segment identities
				_.each(constraints,function(leftSegmentConstraints,leftSegmentId) {
					_.each(leftSegmentConstraints,function(constraint, rightSegmentId) {
						
						// if no constraint
						if(Math.abs(constraint) != 1) {
							return;
							
						// If some constraint exists
						} else {
							
							// Preserve the lower segment ID
							var segments = _.sortBy([leftSegmentId,rightSegmentId],function(id) { return Math.abs(labels[id]) });
							var segmentIdToRelabel = _.last(segments); //Math.max(Math.abs(labels[leftSegmentId]), Math.abs(labels[rightSegmentId]));
							var segmentIdToKeep = _.first(segments); //Math.min(Math.abs(labels[leftSegmentId]), Math.abs(labels[rightSegmentId]));
							
							var newLabel = null;
							
							// If segments must be equal									
							if(constraint == 1) {		
								
								// Ensure they're not already complementary					
								if(labels[leftSegmentId] == -labels[rightSegmentId]) {
									var leftSeg = Segment.get(leftSegmentId), rightSeg = Segment.get(rightSegmentId);
									throw new DynamlError({
											type: 'equality conflict',
											message: "Segments <%= left %> and <%= right %> should be equal, but they're already complementary!",
											left: leftSeg.getFullName(),
											right: rightSeg.getFullName(),
											leftSegment: leftSeg,
											rightSegment: rightSeg,
											nodes: [leftSeg.getNode(), rightSeg.getNode()],
										});	
								} else if (labels[leftSegmentId] != labels[rightSegmentId]) {
									// Otherwise, the downstream label should equal the upstream label
									newLabel = labels[segmentIdToKeep];
								}
								
							// If segments must be complementary
							} else if(constraint == -1) {
								
								// Ensure they're not already equal
								if(labels[leftSegmentId] == labels[rightSegmentId]) {
									var leftSeg = Segment.get(leftSegmentId), rightSeg = Segment.get(rightSegmentId);
									throw new DynamlError({
										type: 'equality conflict',
										message: "Segments <%= left %> and <%= right %> should be complementary, but they're already equal!",
										left: leftSeg.getFullName(),
										right: rightSeg.getFullName(),
										leftSegment: leftSeg,
										rightSegment: rightSeg,
										nodes: [leftSeg.getNode(), rightSeg.getNode()],
										// TODO: equality/complementarity conflict
									});
								} else if (labels[leftSegmentId] != -labels[rightSegmentId]) {
									
									// Otherwise, the downstream label should be opposite the upstream label
									newLabel = -Math.abs(labels[segmentIdToKeep]) * Compiler.signum(labels[leftSegmentId]) * Compiler.signum(labels[rightSegmentId]);
								}
							}
							
							// If segments don't already satisfy constraint
							if(newLabel != null) {
								
								// Find the segment IDs of all segments which will need to be relabeled
								var segmentIdsToRelabel = _.filter(_.keys(labels),function(segmentId) {
									return Math.abs(labels[segmentId])==Math.abs(labels[segmentIdToRelabel]);
								});
								
								// Copy labels so we can change them all at once
								var tempLabels = _.clone(labels);
								
								// Update downstream segments.
								_.each(segmentIdsToRelabel,function(segmentId) {
									
									var segment = Segment.get(segmentId);
									segment.identity = Math.abs(newLabel);
									segment.polarity = Compiler.signum(newLabel);
									
									if(constraint == -1) {
										tempLabels[segmentId] = Compiler.signum(labels[segmentId]) * newLabel;
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
				var uniqLabels = _.chain(labels).values().map(Math.abs).uniq().value(),
					mapping = DNA.mapUnique(uniqLabels,1);
				return _.reduce(labels,function(labels,label,segmentId) {
					labels[segmentId] = mapping[Math.abs(label)]*Compiler.signum(label);
					return labels;
				},{});
			})(labels);
			
			// Build array of all Segment objects, assign Segment objects to their identity in labels
			library.allSegments = [];
			
			_.each(library.nodes,function(node) {
				_.each(node.getSegments(),function(segment) {
					segment.identity = Math.abs(labels[segment.getId()]);
					segment.polarity = Compiler.signum(labels[segment.getId()]);
					library.allSegments.push(segment);
				})
			});
			
			// Build an array of Segment objects representing each unique segment.
			library.segments = _.chain(library.allSegments).uniq(false,function(segment) { return segment.identity; }).map(function(segment) {
				var duplicate = segment.duplicate();
				delete duplicate.name;
				delete duplicate.node;
				delete duplicate.polarity;
				//duplicate = new Segment(duplicate);
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
})