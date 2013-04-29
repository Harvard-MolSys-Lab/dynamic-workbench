Ext.define('App.usr.dynaml.Editor', {
	extend : 'App.usr.text.Editor',
	mode : 'javascript',
	iconCls : 'nodal',
	editorType : 'DyNAML',
	initComponent : function() {
		Ext.apply(this, {
			tbar : [{
				text : 'Compile',
				iconCls : 'compile',
				handler : function() {
					try{
						var res = this.compile();
						console.log(res);
						console.log(this.printStrands(res));
					} catch (e) {
						console.log(e);
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
	printStrands : function(library) {
		var out = '';

		var defaultPolaritySpecifier = this.defaultPolaritySpecifier;
		
		function makeIdentifier(name, polarity) {
			return name + ((polarity == -1) ? defaultPolaritySpecifier : '');
		}
		
		out += _.map(library.segments,function(segment) {
			return ['sequence', /*makeIdentifier(segment.identity,segment.polarity),*/ segment.getIdentifier(),':',new Array(segment.segmentLength).join('N')].join(' ')
		}).join('\n');
		
		out += '\n';
		
		out += _.map(library.strands, function(segments,name) {
			return ['strand',name,':',].concat(_.map(segments, function(segment) {
				return segment.getIdentifier(); //makeIdentifier(segment.identity, segment.polarity);
			}, '')).join(' ');
		}).join('\n');

		return out;
	},
	compile : function() {
		var input = this.getValue(), library = Ext.decode(input);
		
		function printNodeStrands(library) {
			var out = _.map(library.nodes, function(node) {
				var segments = node.getSegments(), name = node.name;
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
		})

		/* ***************************************************************** */

		/**
		 * @class App.usr.dynaml.Editor.Compiler
		 * Contains a set of utility functions
		 */
		var Compiler = {
			defaultPolaritySpecifier: '*',
			
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
					if(polarityString > 0) {
						return 1;
					}
					if(polarityString < 0) {
						return -1;
					}
					return polarityString;
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
					identifier : identifier,
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
			}
		};

		/* ***************************************************************** */

		/**
		 * @class App.usr.dynaml.Editor.Motif
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
		 * @class App.usr.dynaml.Editor.Node
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
				this.polarity = 1;
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

		/**
		 * @class App.usr.dynaml.Editor.Domain
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
			}
		};

		/* ***************************************************************** */

		/**
		 * @class App.usr.dynaml.Editor.Segment
		 */
		function Segment(config) {
			_.copyTo(this, config);
			_.defaults(this,{
				segmentLength: 7,
				role : "toehold",
			})
			if(this.name) {
				_.extend(this, Compiler.parseIdentifier(this.name));
			}
			this.id = Segment.getId();
		}


		Segment.prototype = {
			
			getId : function() {
				if(!this.id) {
					this.id = Segment.getId();
				}
				return this.id;
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
			getIdentifier: function(name, polarity) {
				return this.identity + ((this.polarity == -1) ? Compiler.defaultPolaritySpecifier : '');
			}
			
		}

		_.extend(Segment, {
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
		 * @class App.usr.dynaml.Editor.Complement
		 */
		function Complement(config) {
			this.sourceNode = Node.get(config.sourceNode);
			this.targetNode = Node.get(config.node);
			this.sourcePort = this.sourceNode ? this.sourceNode.getDomain(config.source) : null;
			this.targetPort = this.targetNode ? this.targetNode.getDomain(config.target) : null;

			// TODO: Throw errors
			if(this.sourceNode == null) {

			}
			if(this.sourcePort == null) {

			}
			if(this.targetNode == null) {

			}
			if(this.targetPort == null) {

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
			_.extend(this, config);
		}

		/* ***************************************************************** */
		// Do the actual compiling

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


			/*
			 * Collect all segments, grouped by their identities
			 * `segments` is an array, indexed by numerical segment identity.
			 * Each element of the array is another array, containing all Segments
			 * with the identity of that element's index
			 *
			 * e.g.:
			 * 	segments = [
			 * 		[Segment({ identity: 0, ... }), Segment({ identity: 0, ... })], // identity = 0
			 * 		[Segment({ identity: 1, ... }), Segment({ identity: 1, ... })], // identity = 1
			 * 		[Segment({ identity: 2, ... }), Segment({ identity: 2, ... })], // identity = 2
			 * 		...
			 *  ]
			 */
			var segments = _.chain(library.nodes).reduce(function(memo, node) {
				return memo.concat(_.compact(_.values(node.getSegmentIdentityMatrix())));
			}, []).compact().value();

			/*
 			 * `segmentHash` is a hash which maps Segment IDs (see Segment#id) to
			 * segment identities. Segment IDs are unique identifiers assigned to
			 * each Segment object, solely for the purpose of hashing them in this way.
			 */
			var segmentHash = {};
			
			// Update identity parameter of Segments, and cache Segment identities by segment ID
			_.each(segments, function(segmentList, i) {
				_.each(segmentList, function(segment) {

					// Set identity of each Segment to numerical index
					segment.identity = i;

					// Cache segment identity in segmentHash by segment ID
					// for fast lookup
					segmentHash[segment.getId()] = i;
				});
			});

			function getIdentity(segment) {
				return segmentHash[segment.getId()];
			}

			// Merge segment identities
			_.each(complementarities, function(complement) {
				var sourceSegments = complement.getSourceDomain().getSegments();
				var targetSegments = complement.getTargetDomain().getSegments(); //.reverse();

				if(sourceSegments.length != targetSegments.length) {
					throw new DynamlError({
						type : 'domain length mismatch',
						message : _.template('Complementarity statement in node <%= source %> implies domain <%= target %> ' + 'should have <%= expected %> segments, but instead it has <%= encountered %> segments', {
							source : complement.sourceNode.name,
							target : complement.targetNode.name,
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
				
				// Merges happen left (source) to right (target)
				// For each segment in sourceSegments
				for(var i = 0; i < sourceSegments.length; i++) {
					// Left = source
					var leftSegment = sourceSegments[i]; 
					var leftPol = leftSegment.polarity;
					var leftId = getIdentity(leftSegment);

					// Right = target
					var rightSegment = targetSegments[i]; 
					var rightPol = rightSegment.polarity;
					var rightId = getIdentity(rightSegment);
					
										
					// Segments which formerly had leftIdentity and now have rightIdentity
					var newSourceSegments = segments[rightId];
					
					/*
					 * Segments which were complementary to right (equal to right*, have -rightPol)
					 * will now be equal to left (have leftPol)
					 */
					var newEqualSegments = _.filter(newSourceSegments,function(segment) {
						//return segment.getAbsolutePolarity() == -rightPol;
						return segment.polarity == -rightPol;
					});
							
					/* 
					 * Segments which were equal to right (have +rightPol) will now be complementary
					 * to left (have -leftPol)
					 */
					var newComplementarySegments = _.filter(newSourceSegments,function(segment) {
						return segment.polarity == rightPol;
					});

					/*
					 * Assign new polarities
					 */					
					_.each(newEqualSegments,function(segment) {
						segment.polarity = leftPol;
					});
					_.each(newComplementarySegments,function(segment) {
						segment.polarity = -leftPol;
					});
					
					// Merge newSourceSegments into list of segments with source identity
					segments[leftId] = segments[leftId].concat(newSourceSegments);
					delete segments[rightId];


					// Update segmentHash to remember identity of all the segments that have been changed
					_.each(newSourceSegments, function(segment) {
						segment.identity = leftId;
						segmentHash[segment.getId()] = leftId;
					});
				}
			});
			// Normalize segment numbering (remove skipped numbers)
			segments = _.chain(segments).compact().map(function(segmentList, i) {

				// Set identity of each Segment in segmentList to have the identity corresponding to
				// segmentList's position in the segment identity map (`segments`)
				return _.map(segmentList, function(segment) {
					segment.identity = i;
					return segment;
				});
			}).flatten().value();

			library.allSegments = segments;
			
			library.segments = _.uniq(segments,false,function(segment) { return segment.identity; });
			
			// Build an array of strands with properly numbered segments.
			library.strands = _.reduce(library.nodes, function(memo, node) {
				memo[node.name] = node.getSegments();
				return memo;
			}, {});
		} else {
			library = {};
		}
		return library;

	}
})