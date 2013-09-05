if ( typeof require === 'function') {
	_ = require('underscore')
	DNA = require('./dna-utils.js').DNA;
}
if(typeof module == 'undefined') {
	module = {};
}
if( typeof App == 'undefined') {
	App = {};
}

App.dynamic = module.exports = (function(_,DNA) {
	/**
	 * @class _
	 * Provides some additional methods inspired by _.js
	 */
	_.mixin({
		/**
		 * Returns a deep copy of the provided object, which will be a simple 
		 * object. Recursive structures are intelligently handled. If objects
		 * have their own `serialize` method defined, that is used.
		 * @param {Mixed} o
		 * @param {Boolean} isChild 
		 */
		serialize: function(o,isChild) {
			isChild || (isChild = false);
			
			// if o defines its own serialization function (ie: for higher level objects), use that
			if (o && o.serialize && _.isFunction(o.serialize)) {
				return o.serialize(isChild)
			}

			// serialize an array
			if (_.isArray(o)) {
				var r = [];
				for (var i = 0, l = o.length; i < l; i++) {
					r.push(_.serialize(o[i], true));
				}
				return r;
			}

			// serialize a simple object hash (allow for complex objects contained in the hash)
			if (_.isObject(o)) {
				var r = {};
				for (var p in o) {
					if(_.has(o,p)) {
						r[p] = _.serialize(o[p], true);
					}
				}
				return r;
			}

			// no serialization needed; Ext will take care of the .toString()s
			return o;
		},
		/**
		 * Produces a copy of source which does not include properties on the prototype chain.
		 * @param {Object} source
		 * @returns {Object} copy
		 */
		copy : function(source) {
			return _.copyTo({}, source)
		},
		/**
		 * Copies properties from `source` which do not appear on the prototype chain
		 * to `destination`
		 * @param {Object} destination
		 * @param {Object} source
		 * @returns {Object} destination
		 */
		copyTo : function(destination, source) {
			for (var key in source) {
				if(_.has(source,key)) {
					destination[key] = source[key];
				}
			};
			return destination;
		},
		/**
		 * Returns a {@link _#copy copy} of `source`, extended with values in `change`
		 * @param {Object} source Object to copy
		 * @param {Object} change Additional properties to over write in `source
		 * @returns {Object} destination
		 */
		copyWith : function(source, change) {
			return _.extend(_.copy(source),change);
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
		},
		/**
		 * Produces a new array of values by mapping each value in the list 
		 * to one or more values by a transformation function (`iterator`).
		 * Iterator can return an array of multiple values, which will be
		 * concatenated onto the final list.
		 * 
		 * In this way, `comprehend` acts like a 1:n version of {@link _#map map}.
		 * @param {Array} list List to comprehend
		 * @param {Function} iterator Transformation function
		 * @param {Mixed} iterator.value The next value in the list
		 * @param {Number} iterator.index The index of the current value in the original list
		 * @param {Array} [initial=[]] The initial value of the output array
		 * @param {Mixed} [context] Scope in which to execute the `iterator`
		 * @return {Array} comprehension 
		 */
		comprehend: function(list,iterator,initial,context) {
			if (context) iterator = _.bind(iterator, context);
			if (!initial) { initial = []; }
			return _.reduce(list,function(memo,x,i) {
				memo = memo.concat(iterator(x,i));
				return memo;
			},initial);
		},
		/**
		 * Returns a reversed, shallow copy of a list
		 * @param {Array} list
		 * @return {Array} reversed
		 */
		reverse : function(list) {
			var l = _.clone(list);
			l.reverse();
			return l;
		}
	});
	
	/* ***************************************************************** */
	
	function lengths(list) {
		return _.invoke(list,'getLength')
	}

	function names(list) {
		return _.invoke(list,'getName')
	}
	
	function ids(list) {
		return _.invoke(list,'getIdentifier')
	}
	
	function sum(ls) {
    	return _.reduce(ls,function(m,x) {return m+x},0);
    }				    
   
    function repr(x) {
    	return x;
    }
    
    function range(x) {
    	return _.range(0,x);
    }

	/**
	 * Returns a reversed shallow copy of an array if polarity == -1, else returns a 
	 * shallow copy of the array in its original order
	 * @param {Array} list
	 * @param {Number} polarity
	 * @return {Array} list
	 */
	function order(list,polarity) {
		var x = _.clone(list);
		if(polarity == -1) {
			x.reverse();
		}
		return x;
	}

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.Motif
	 * Represents a single motif
	 */
	function Motif(config) {
		if(!config.library) {
			throw new DynamlError({
				type: 'no library',
				message: 'Motif <%= motif.getName() %> instantiated without library reference',
				motif: this,
				config: config,
			});
		}
		
		// Compile recursively if necessary
		if(config.nodes) {
			
			// // Import any external motifs
			// // TODO: check if there are internal motifs with the same name; if so, that'll create a DynamlError now
			// if(config.externalMotifs) {
				// if(!config.motifs) {
					// config.motifs = [];
				// }
				// config.motifs = config.externalMotifs.concat(config.motifs);
			// }
				
			var recursive = Library.fromMotif(config);
			try {
				recursive = recursive.compile();
			} catch (e) {
				if(e.message) {
					e.message = ["In motif",config.name,":\n",e.message].join(' ');
				}
				throw new DynamlError(e);
			}
			_.extend(this,recursive.toMotif());
			delete config.nodes;
			delete config.motifs;
			delete config.imports;
			if(!this.structure) {
				
			}
		} else {
			delete config.externalMotifs;
		}

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
		});
		


		this.isInitiator = this.isInitiator || this.type == 'initiator';
				
		// Thread structures to appropriate strands
		var strandStructures = {};
		if(this.structure) {
			var structures = this.structure;
			if(!_.isArray(structures)) {
				structures = [structures];
			}
			
			structures = _.map(structures,function(struct) {
				/* 
				 * returns an object mapping strand indicies to the sub-structures (separated by +) of struct
				 * allows for the case where the structure(s) refer to a different permutation of strands than
				 * order of strands in the motif
				 */
				return Structure.parseMultiple(struct);
			});
			
			// TODO: deal with multiple structures
			strandStructures = _.first(structures);
		}
		if(this.strands) {
			this.strands = _.map(this.strands,function(strand,i) {
				if(strand.name && strandStructures[strand.name]) {
					strand.structure = strandStructures[strand.name];
				} else if(strandStructures[i]) {
					strand.structure = strandStructures[i];
				}
				strand.library = this.library;
				return new Strand(strand); 
			},this);
		} else if(this.domains) {
			var structure = strandStructures[0]; 
			this.strands = [
				new Strand({
					name: this.name || 's1',
					library: this.library,
					domains: this.domains,
					structure: structure,
				})
			];
		}
		

		/**
		 * @property {App.dynamic.Domain[]}
		 * @private
		 * Use #getDomains
		 */
		// this.domains = _.map(this.domains, function(domain) {
			// return new Domain(domain);
		// });

		_.each(this.getDomains(), function(domain) {
			if(!domain.polarity) {
				domain.polarity = 1;
				// throw new DynamlError({
					// type : 'unspecified motif domain polarity',
					// message : _.template('Domain <%= domain %> in motif <%= motif %> has no polarity specified. ' + //
					 // 'Polarities are required for domains specified in motifs.', {
						// motif : this.name,
						// domain : domain.name,
					// }),
					// motifs : [this],
					// domain : domain,
				// });
			}
		}, this);
		
		/**
		 * @property
		 */
		this.polarity = DNA.parsePolarity(this.polarity);
		
		
		// Apply post-processor
		if(Motif.types[this.type]) {
			Motif.types[this.type](this);
		}
		
		this.library.register('motif',this.name, this);
	}


	Motif.prototype = {
		/**
		 * Returns the absolute polarity of this node
		 * @returns {Number} node polarity
		 */
		getPolarity : function() {
			return this.polarity;
		},
		getStructure: function() {
			var concatamer = Structure.join(_.map(this.getStrands(),function(strand) {
				return strand.getStructure();
			}));
			
			if(this.getPolarity() == -1) {
				return concatamer.reverse();
			}
			return concatamer;
		},
		/**
		 * Returns object like:
		 * 	[{strand: {Strand}, structure:strand.getAnnotatedStructure()},...]
		 */
		getAnnotatedStructure: function() {
			var s = _.map(this.getStrands(),function(strand) {
				return { strand: strand, structure: strand.getAnnotatedStructure(), dotParen: strand.getStructure().toDotParen() };
			});
			s.dotParen = this.getStructure().toDotParen();
			return s;
		},
		getSegmentwiseStructure: function() {
			return Structure.join(_.map(this.getStrands(),function(strand) {
				return strand.getSegmentwiseStructure();
			}));
		},
		getOrderedSegmentLengths: function() {
			return _.comprehend(this.getOrderedStrands(),function(strand) {
				return strand.getOrderedSegmentLengths();
			});
		},

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
		 * Gets all {@link App.dynamic.Segment segments} associated with this motif/node 
		 * in the order they appear, 5' to 3', accounting for {@link #polarity}.
		 * @returns {App.dynamic.Segment}
		 */
		getOrderedSegments : function() {
			// return order(_.comprehend(this.getStrands(), function(strand) {
				// return strand.getSegments();
			// }),this.getPolarity());
			
			return _.clone(_.comprehend(this.getOrderedStrands(),function(strand) {
				return strand.getOrderedSegments();
			}))
		},
		/**
		 * Gets all {@link App.dynamic.Domain domains} associated with this motif/node
		 * @returns {App.dynamic.Domain[]} domains
		 */
		getDomains : function() {
			return _.flatten(_.map(this.getStrands(),function(strand) {
				return strand.getDomains();
			}))
		},
		/**
		 * Gets {@link App.dynamic.Domain}s associated with this Node/Motif 
		 * in the order they appear, 5' to 3', accounting for {@link #polarity}
		 */
		getOrderedDomains: function() {
			return order(_.comprehend(this.getOrderedStrands(),function(strand) {
				return strand.getOrderedDomains();
			}),this.getPolarity());
		},
		getStrands : function() {
			return this.strands;
		},
		/**
		 * Gets {@link App.dynamic.Strand}s associated with this Node/Motif 
		 * in the order they appear, 5' to 3', accounting for {@link #polarity}
		 */
		getOrderedStrands: function() {
			return order(this.getStrands(),this.getPolarity())
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
		serialize: function() {
			var out = _.copy(this);
			if(out.library) { delete out.library; }
			if(out.domains) { delete out.domains; }
			return _.serialize(out);
		}
	}
	_.extend(Motif, {
		/**
		 * Hash of post-processors to be passed the node at the end of the constructor.
		 * 
		 * Current types:
		 * -	`hairpin`
		 * 
		 * @static
		 */
		types: {
			'hairpin': function(node) {
				_.each(node.getDomains(),function(dom) {
					if(dom.role == 'output' && !dom.type) {
						if(dom.polarity == -1) {
							dom.type == 'loop';
						} else if(dom.polarity == 1) {
							dom.type == 'tail';
						}
					}
				});
			}
		},
		
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
		
		if(!config.library) {
			throw new DynamlError({
				type: 'no library',
				message: 'node instantiated without library reference; can\'t decode motif',
				node: this,
				config: config,
			});
		}
		this.library = config.library;
		
		// Inherit motif if configured
		if(config.motif) {
			var motif = config.library.getMotif(config.motif);
			/**
			 * @cfg {String/App.dynamic.Motif} motif
			 * Name or reference to a {@link App.dynamic.Motif motif} from
			 * which this node inherits.
			 */
			_.copyTo(this, motif);
			
		}

		// // Save domains from the motif in a hash table by their names
		// // TODO: the motif really should do this.
		// var motifDomainsMap = _.reduce(this.getDomains() || [], function(memo, domain) {
			// memo[domain.name] = domain;
			// return memo;
		// }, {});

		// Capture any domain/strand properties specified on the nodes
		
		// Parse compact input format
		if(_.isString(config.domains)) {
			config.domains = Compiler.parseDomainString(config.domains);
		}
		var nodeDomainProperties = _.reduce(config.domains || [], function(memo, domain) {
			memo[domain.name] = domain;
			return memo;
		}, {});
		
		var nodeStrandProperties = _.reduce(config.strands || [], function(memo,strand) {
			memo[strand.name] = strand;
			return memo;
		},{});
		
		if(config.motif) {			
			delete config.domains;
			delete config.strands;
		}

		// Apply configuration options with defaults to this object
		_.copyTo(this, config), _.defaults({
			/**
			 * @cfg {String} [type='hairpin']
			 * Type of motif to create. Currently one of: `"initiator"` or `"hairpin"`
			 */
			type: 'hairpin',
			/**
			 * @cfg {Number} [polarity=0]
			 */
			polarity : 0,
		});
		
		if(this.domains && !this.strands) {
			//var structure = strandStructures[0]; 
			this.strands = [
				new Strand({
					library: this.library,
					domains: this.domains,
					node: this,
					structure: this.structure,
				})
			];
		} else {	
			var strandStructures = this.structure ? Structure.parseMultiple(this.structure) : [];
			this.strands = _.map(this.strands,function(strand,i) {
				
				// See if additional strand properties for this strand were specified by the node
				strand = _.copyWith(strand,nodeStrandProperties[strand.name] || {});
				// (must always copy else assigning to strand screws things up)
				
				// Parse compact input format
				if(_.isString(strand.domains)) {
					strand.domains = Compiler.parseDomainString(strand.domains);
				}
				
				// See if additional domain properties for this strand were specified by the node			
				strand.domains = _.map(strand.domains, function(domain) {
			
					// Find domains with matching identities in motif
					
					if(nodeDomainProperties[domain.name]) {
						domain = _.copyWith(domain,nodeDomainProperties[domain.name]);
					}
					
					return domain //new Domain(domain);
				
				}, this);
				
				// Make sure strand is assigned a structure
				if(!strand.structure && strandStructures[i]) {
					strand.structure = strandStructures[i];
				}

				strand.name || (strand.name = (this.strands.length > 1) ? 'strand'+i : '');
				strand.library = this.library;
				
				return new Strand(_.copyWith(strand,{ node: this }));
			},this);
		}
		
		// Construct Domain objects from specifications
		// this.domains = 		_.map(this.domains, function(domain) {
// 		
			// // Find domains with matching identities in motif
			// if(domain.identity && motifDomainsMap[domain.identity]) {
				// domain = _.extend(_.copy(motifDomainsMap[domain.identity]), domain);
			// }
			// domain.node = this;
			// return new Domain(domain);
// 		
		// }, this);
		
		// TODO: compiler should do this.
		if(this.isInitiator && !this.polarity) {
			this.polarity = -1;
		}
		
		// Apply post-processor
		if(Node.types[this.type]) {
			Node.types[this.type](this);
		}

		this.library.register('node',this.name, this);
	}


	_.extend(Node.prototype, Motif.prototype);
	_.extend(Node.prototype, {
		polarity: 0,
		
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

		},

		getSequences: function() {
			var segs = this.getSegments(), map = {}, seg;
			for(var i=0; i<segs.length; i++) {
				seg = segs[i];
				map[seg.getIdentity()] = (seg.getPolarity() == -1) ? 
					DNA.reverseComplement(seg.getSequence()) : seg.getSequence();
			}
			return map;
		},
		serialize: function() {
			var out = _.copy(this);
			if(out.motif && !_.isString(out.motif) && out.motif.getName) { out.motif = out.motif.getName(); }
			if(out.domains) { delete out.domains; }
			if(out.library) { delete out.library; }
			return _.serialize(out);
		}
	});

	_.extend(Node, {
		/**
		 * Hash of post-processors to be passed the node at the end of the constructor.
		 * 
		 * Current types:
		 * -	`hairpin`
		 * 
		 * @static
		 */
		types: {
			'hairpin': function(node) {
				_.each(node.getDomains(),function(dom) {
					if(dom.role == 'output' && !dom.type) {
						if(dom.polarity == -1) {
							dom.type == 'loop';
						} else if(dom.polarity == 1) {
							dom.type == 'tail';
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
		if(!config.library) {
			throw new DynamlError({
				type: 'no library',
				message: 'strand instantiated without library reference',
				strand: this,
				config: config,
			});
		}
		
		// Apply configuration options with defaults to this object
		_.copyTo(this, config); 
		_.defaults(this, {
		});
		
		/**
		 * @property {App.dynamic.Domain[]}
		 * @private
		 * Use #getDomains
		 */
		
		if(_.isString(this.domains)) {
			this.domains = Compiler.parseDomainString(this.domains);
		}
		
		this.domains = _.map(this.domains, function(domain) {
			if(_.isString(domain)) {
				domain = _.first(Compiler.parseDomainString(domain));
			}
			
			return new Domain(_.copyWith(domain,{ strand: this, library: this.library, }));
			// return new Domain(_.copyTo(_.copy(domain),{
				// strand: this
			// }));
		},this);
		
		/**
		 * @property {App.dynamic.Structure}
		 * @private
		 * Use #getStructure or #getSegmentwiseStructure
		 */
		this.structure = new Structure(this.structure);
		
		/**
		 * @property {Number}
		 * @private
		 * Use #getPolarity or #getAbsolutePolarity
		 */
		this.polarity = DNA.parsePolarity(this.polarity);
		if(this.polarity == 0) {
			this.polarity = 1;
		}
	}


	Strand.prototype = {
		/**
		 * @return {App.dynamic.Node} node
		 */
		getNode: function() {
			return this.node;
		},
		/**
		 * @return {String} name
		 */
		getName : function() {
			return this.name;
		},
		/**
		 * Returns the name of this strand, or the name of the node
		 * which this represents, if there is only one strand in the
		 * node.
		 * @return {String} name
		 */
		getQualifiedName : function() {
			var n =[this.getNode().name];
			if(this.getName()) {n.push(this.getName())} 
			return n.join('_');
		},
		/**
		 * Returns the absolute polarity of this strand
		 * absolute polarity = (relative strand polarity) * (node polarity)
		 * @returns {Number} polarity -1 = 3' -> 5', 1 = 5' -> 3', 0 = undetermined
		 */
		getAbsolutePolarity : function() {
			if(this.node) {
				return this.node.getPolarity() * this.getPolarity();
			} else {
				return this.getPolarity();
			}
		},
		/**
		 * Returns the polarity of this strand, relative to the 
		 * {@link App.dynamic.Node#polarity node polarity}
		 * @param {Number} polarity -1 = 3' -> 5', 1 = 5' -> 3', 0 = undetermined
		 */
		getPolarity : function() {
			return this.polarity;
		},
		/**
		 * @inheritdoc App.dynamic.Node#getSegments
		 */
		getSegments : function() {
			return _.comprehend(this.getDomains(), function(domain) {
				return domain.getSegments();
			});
		},
		/**
		 * Returns segments in the order they occur on the strand (accounting for polarity)
		 */
		getOrderedSegments : function() {
			return order(_.comprehend(this.getDomains(), function(domain) {
				//return domain.getOrderedSegments();
				return domain.getSegments();
			}),this.getAbsolutePolarity());
		},
		/**
		 * @inheritdoc App.dynamic.Node#getDomains
		 */
		getDomains : function() {
			return this.domains;
		},
		/**
		 * Returns domains in the order they occur on the strand (accounting for {@link #polarity relative polarity})
		 */
		getOrderedDomains : function() {
			return order(this.getDomains(),this.getPolarity())
		},
		/**
		 * @inheritdoc App.dynamic.Node#getDomain
		 */
		getDomain : function(name) {
			return _.find(this.getDomains(), function(dom) {
				return dom.name == name;
			});
		},
		/**
		 * Returns a list of lengths of the segments in the strand, in bases
		 * @return {Number[]}
		 */
		getSegmentLengths: function() {
			return lengths(this.getSegments());
		},
		getOrderedSegmentLengths: function() {
			return lengths(this.getOrderedSegments());
		},
		getLength: function() {
			return sum(this.getSegmentLengths());
		},
		/**
		 * Returns the structure of the strand, representing each segment
		 * as a single unit/character. See #getStructure
		 * to get the structure with each base represented by one character.
		 * @return {App.dynamic.Structure} structure
		 */
		getSegmentwiseStructure: function() {
			return this.structure;	
		},
		getAnnotatedStructure: function() {
			var n = -1, segs = this.getSegments();
			return _.map(this.structure.toDotParen().split(''),function(ch) {
				if(ch!='+') {
					n++;
					return {type: ch, segment: segs[n], length: segs[n].getLength()};
				} else {
					return {type: ch}
				}
			});
		},
		/**
		 * Returns the structure of the strand, representing each base
		 * as a single unit/character. See #getSegmentwiseStructure
		 * to get the structure with each segment represented by one character.
		 * @return {App.dynamic.Structure} structure
		 */
		getStructure : function() {
			try {
				var struct = this.structure;
				var exp = struct.expand(this.getSegmentLengths());				
				if(this.getPolarity() == -1) {
					exp = exp.reverse();
				}
				return exp;
				
			} catch(e) {
				e.message = "In strand "+this.getQualifiedName()+", "+e.message;
				throw e;
			}
	
		},
		getSequence: function() {
			var seq = _.map(this.getSegments(),function(seg) { return seg.getSequence() }).join('');
			if(this.getAbsolutePolarity() == -1) {
				return DNA.reverse(seq);
			}
			return seq;
		},
		printDomains: function(omitLengths) {
			return Compiler.printDomainString(this.getDomains(),this.getAbsolutePolarity(),omitLengths);
		},
		orphan: function() {
			this.polarity = this.getAbsolutePolarity();
			delete this.node;
			return this;
		},
		serialize: function() {
			var out = _.copy(this);
			if(out.node) { delete out.node; }
			if(out.library) { delete out.library; }
			return _.serialize(out);
		},
	}

	/* ***************************************************************** */

	/**
	 * @class App.dynamic.Domain
	 * Represents a domain, which is a collection of {@link App.dynamic.Segment}s
	 * within a {@link App.dynamic.Node node} or {App.dynamic.Motif motif}.
	 */
	function Domain(config) {
		if(!config.library) {
			throw new DynamlError({
				type: 'no library',
				message: 'domain instantiated without library reference',
				domain: this,
				config: config,
			});
		}
		
		// Apply configuration options with defaults to this object
		_.copyTo(this, config), _.defaults(this, {
			segments : [],
		});

		/**
		 * @property {App.dynamic.Segment[]} segments
		 * @private
		 */
		
		// Parse string representation
		if(_.isString(this.segments)) {
			this.segments = Compiler.parseSegmentString(this.segments);
		}
		
		// Construct Segment objects from specification
		this.segments = _.map(this.segments, function(seg) {
			return new Segment(_.copyWith(seg, {
				domain : this, 
				library : this.library,
			}));
		}, this);
		/**
		 * @property {Number} polarity
		 */
		this.polarity = DNA.parsePolarity(this.polarity);
	}


	Domain.prototype = {
		role : "structural",
		/**
		 * Returns the absolute polarity of this domain
		 * absolute polarity = (domain relative polarity) * (strand relative polarity) * (node polarity)
		 * @return {Number} Abs. polarity
		 */
		getAbsolutePolarity : function() {
			return this.getPolarity() * this.getStrand().getPolarity() * this.getNode().getPolarity();
		},
		/**
		 * Retrieves the segments associated with this domain
		 * @returns {App.dynamic.Segment[]} segments
		 */
		getSegments : function() {
			return this.segments;
		},
		// /**
		 // * Retrieves the segments associated with this domain, accounting for its {@link #polarity relative polarity}
		 // */
		// getOrderedSegments: function() {
			// return order(this.getSegments(),this.getPolarity());
		// },
		/**
		 * Retrieves the strand of which this domain is a part
		 * @return {App.dynamic.Strand}
		 */
		getStrand : function() {
			return this.strand;
		},
		/**
		 * @return {Node} node The node which contains this domain.
		 */
		getNode : function() {
			return this.getStrand().getNode();
		},
		/**
		 * Gets the name of the domain
		 * @return {String} name
		 */
		getName : function() {
			return this.name;
		},
		/**
		 * Returns the relative polarity of this domain
		 */
		getPolarity : function() {
			return this.polarity;
		},
		serialize: function() {
			var out = _.copy(this);
			if(out.strand) { delete out.strand }
			if(out.node) { delete out.node }
			if(out.library) { delete out.library; }
			return _.serialize(out);
		},
		
	};
	
	/**
	 * Produces a domain from the {@link App.dynamic.Compiler.parseDomainString compact string representation}.
	 * 
	 * @param {String} str
	 * The domain string
	 * 
	 * @param {App.dynamic.Library} library
	 * The library reference
	 * 
	 * @returns {App.dynamic.Domain} domain 
	 */
	Domain.fromString = function(str,library) {
		var o = Compiler.parseDomainString(str);
		o.library = library;
		return new Domain(o)
	}

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
			 * @cfg {Number} segmentLength
			 * The length of this segment. If unspecified and #sequence is
			 * specified, this field will be updated to match.
			 */
			/**
			 * @cfg
			 * One of: `"toehold"`, `"clamp"`, `"loop"`, or `"reverse"`.
			 */
			role : "",
			/**
			 * @cfg
			 */
			sequence : '',
		});
		if(this.length) {
			this.segmentLength = this.length;
		}
		if(this.sequence) {
			this.segmentLength = this.sequence.length;
		}
		
		if(!this.segmentLength) {
			this.segmentLength = this.getParameter('segmentLength');
		}
		
		/**
		 * @cfg {String} name
		 * A name for this segment, plus an optional polarity specifier. If given, this will be parsed to
		 * populate the #identity and #polarity properties.
		 */
		if(this.name && !this.identity) {
			_.extend(this, DNA.parseIdentifier(this.name));
		
		/**
		 * @cfg {String} identity
		 */
		/**
		 * @cfg {Number} polarity
		 * The polarity of the segment: 1 or -1. A polarity of -1 implies
		 * this segment has a sequence complementary to a segment which
		 * shares this segment's #identity, but whose #polarity is 1.
		 */
		} else if(this.identity && this.polarity && !this.name) {
			this.name = DNA.makeIdentifier(this.identity,this.polarity);
		}
		this.id = Segment.getId();
		this.getLibrary().register('segment',this.id, this);
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
			return DNA.makeIdentifier(DNA.normalizeIdentity(this.name), this.polarity);
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
		getIdentifier : function() {
			return this.identity + ((this.polarity == -1) ? DNA.defaultPolaritySpecifier : '');
		},
		/**
		 * Returns the polarity of the segment
		 */
		getPolarity : function() {
			return this.polarity;
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
		serialize: function() {
			var out = _.copy(this);
			if(out.strand) { delete out.strand }
			if(out.domain) { delete out.domain }
			if(out.node) { delete out.node }
			if(out.library) { delete out.library; }
			return _.serialize(out);
		},
		getLibrary: function() {
			return this.library;
		},
		getParameter: function(param) {
			switch(param) {
				case 'segmentLength':
					if(this.library) {
						return this.library.getParameter('segmentLength',this);
					}
					return 6;
				default: 
					return '';
			}
		}
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
	 * @class App.dynamic.Structure
	 * Represents a secondary structure of a motif or node
	 */
	function Structure(config) {
		var spec, type;
		if(_.isString(config)) {
			spec = config;
			if(spec.match('.')) {
				type = 'dot-paren';
			} else if(spec.match(/[DHU]+/gi)) {
				spec = spec.replace('H','D');
				type = 'DU+';
			}
			config = {
				spec: spec,
				type: type,
			};
		}
		/**
		 * @property {String} spec
		 */
		/**
		 * @property {String} type
		 * One of "dot-paren" or "DU+"
		 */
		_.copyTo(this, config);
		_.defaults(this, {});
	}
	
	_.extend(Structure.prototype,{
		toDotParen: function() {
			if(this.type=='dot-paren') {
				return this.spec;				
			} else if(this.type=='DU+') { 
				return DNA.DUtoDotParen(this.spec);
			} else {
				throw new DynamlError({
					type: 'Conversion from structure type "<%= structure_type %>" to dot-paren is not supported',
					structure_type: this.type
				});
			}
		},
		toDUPlus: function() {
			if(this.type=='DU+') { 
				return this.spec;	
			} else if(this.type=='dot-paren') {
				return DNA.dotParenToDU(this.spec);
			} else {
				throw new DynamlError({
					type: 'Conversion from structure type "<%= structure_type %>" to DU+ is not supported',
					structure_type: this.type
				});
			}
		},
		reverse: function() {
			if(this.type=='dot-paren') {
				return new Structure(_.chain(this.spec.split('')).reverse().map(function(ch) { 
					if(ch=='(') return ')' 
					else if(ch==')') return '('
					else return ch
				}).value().join(''));
			} else {
				throw new DynamlError({
					type: 'unimplemented',
				});
			}
		},
		expand: function(lengths) {
			var spec = this.spec, out = [], len, ch;
			if(lengths.length != spec.length) {
				throw new DynamlError({
					type: "structure size mismatch",
					message: "Structure '<%= structure %>' (length: <%= structureLength %>) is <%= rel %> than segment count (<%= segmentLength %>)",
					structure: spec,
					structureLength: spec.length,
					rel: (spec.length > lengths.length) ? 'longer' : 'shorter',
					segmentLength: lengths.length,
					lengths: lengths,
				});
			}
			for(var i=0;i<lengths.length;i++) {
				len = lengths[i];
				ch = spec[i];
				out.push(Array(len+1).join(ch));
			}
			return new Structure(out.join(''));
		}
	});
	
	_.extend(Structure,{
		parseMultiple: function(o) {
			if(_.isObject(o)) {
				var spec = o.spec || '',
					specs = spec.split('+');
				
				if(o.order) {
					specs = _.reduce(o.order,function(memo,destinationIndex,specIndex) {
						memo[index] = new Structure(specs[specIndex]);
						return memo;
					},{});
					return specs;
				}
			} else {
				specs = o.split('+');
			}
			return _.map(specs,function(spec) {
				return new Structure(spec);
			})
		},
		parseDUPlus: function(spec) {
			
		},
		DUtoDotParen: function(spec) {
			return DNA.DUtoDotParen(spec);
		},
		dotParenToDU: function(spec) {
			return DNA.dotParenToDU(spec);
		},
		join: function(structures) {
			return new Structure({
				spec: _.map(structures,function(struct) {
					return struct.toDotParen();
				}).join('+'),
				type:'dot-paren'
			});
		}
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
		this.library = config.library;
		if(!config.library) {
			throw new DynamlError({
				type: 'no library',
				message: 'complement instantiated without library reference; can\'t decode node references',
				complement: this,
				complements: [this],
				config: config,
			});
		}
		
		/**
		 * @cfg {String/App.dynamic.Node} sourceNode
		 * Name or reference to the node which will become #property-sourceNode
		 */
		/**
		 * @property {App.dynamic.Node} sourceNode
		 */
		this.sourceNode = this.library.getNode(config.sourceNode);
		/**
		 * @cfg {String/App.dynamic.Node} node
		 * Name or reference to the node which will become #property-targetNode
		 */
		/**
		 * @property {App.dynamic.Node} targetNode
		 */
		this.targetNode = this.library.getNode(config.node);

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
				nodes: [config.sourceNode, config.targetNode],
				ports: [config.source, config.target],
				complements: [this],
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
				nodes: [config.sourceNode, config.targetNode],
				ports: [config.source, config.target],
				complements: [this],
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
				nodes: [config.sourceNode, config.targetNode],
				ports: [config.source, config.target],
				complements: [this],
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
				nodes: [config.sourceNode, config.targetNode],
				ports: [config.source, config.target],
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
		/**
		 * Returns the type of this relationship, either `output` or `bridge`
		 */
		getType: function() {
			if(this.getTargetPort().role == 'input' && this.getSourcePort().role == 'output') {
				return 'output';
			}
			if(this.getTargetPort().role == this.getSourcePort().role == 'bridge') {
				return 'bridge';
			}
		},
		serialize: function() {
			var out = _.copy(this);
			
			if(out.sourceNode && !_.isString(out.sourceNode)) { out.sourceNode = out.sourceNode.getName() }
			if(out.targetNode && !_.isString(out.targetNode)) { out.targetNode = out.targetNode.getName() }
			if(out.sourcePort && !_.isString(out.sourcePort)) { out.sourcePort = out.sourcePort.getName() }
			if(out.targetPort && !_.isString(out.targetPort)) { out.targetPort = out.targetPort.getName() }
			
			if(out.strand) { delete out.strand }
			if(out.domain) { delete out.domain }
			if(out.node) { delete out.node }
			if(out.library) { delete out.library; }
			return _.serialize(out);
		}
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
		 * which will be interpolated by {@link _#template}. The scope used will be
		 * the configuration object passed to the #constructor. Allows you to generate
		 * human-readable messages that references specific data in the error. 
		 * For example:
		 *
		 *     throw new DynamlError({
		 *         type : 'invalid complement',
		 *         message : 'In complement between Node <%= sourceNode %> and Node <%= targetNode %>, source port <%= sourcePort %> not found.',
		 *         sourceNode : config.sourceNode,
		 *         targetNode : config.node,
		 *         sourcePort : config.source,
		 *         targetPort : config.target,
		 *     });
		 */
		if(config.message) {
			config.message = _.template(config.message, config);
		}
		/**
		 * @cfg {String} type
		 * A short string representing the type of error which occurred
		 */
		_.copyTo(this, config);
	}
	
	/**
	 * Serializes the error as a simple JSON object
	 * @return {Object} 
	 */
	DynamlError.prototype.serialize = function() {
		return _.serialize(_.copy(this));
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
		
		// necessary to avoid weird bugs with the UI since these objects are modified
		this.motifs = _.clone(this.motifs);
		this.nodes = _.clone(this.nodes);
		this['import'] = _.clone(this['import']);
		
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
			 * An array of objects, each with `type` and `name` properties. `type` should be either `motif` or
			 * `node`. `name` should refer to an object of that `type` 
			 * 
			 */
			'import' : [],
			/**
			 * @cfg {Library[]} includes
			 * Array of additional {@link Library libraries} to be used in #import statements. The libraries 
			 * should already be compiled (they'll be instantiated with #fromDil). 
			 */
			includes: [],
			objects: {
				node: {},
				motif: {},
				segment: {},
			},
			parameters : {}
		});
		
		_.defaults(this.parameters,{
			segmentLength: 8,
			toeholdLength: 8,
			clampLength: 2,
		});
	}
	
	Library.prototype = {
		/**
		 * Sets up the Library by creating {@link App.dynamic.Node Node} and
		 * {@link App.dynamic.Motif Motif} objects from the #nodes, #motifs,
		 * and #import configs.
		 * 
		 * @param {Boolean} [fromDil=false]
		 * True to do a `bare import' of nodes--that is, don't copy over any
		 * properties from the node's specified {@link App.dynamic.Node#motif}.
		 * This is desirable if importing from a serialized library which has
		 * already been compiled, since we don't want to overwrite things like
		 * compiled {@link App.dynamic.Segment#identity segment identities} to
		 * be overwritten. 
		 *
		 * @throws {DynamlError} If an item referenced in #import is not found 
		 * in any of the referenced #includes or in the {@link Compiler#importObject standard library}.
		 */
		setup: function(fromDil) {
			fromDil || (fromDil = false)
			
			var library = this;
			
			// Parse included libraries
			if(library['includes']) {
				library.includes = _.map(library.includes,function(cfg) {
					return Compiler.fromDil(cfg);
				});
			}

			// Import motifs first
			if(library['import']) {
				_.each(library['import'],function(statement) {
					if(statement.type && statement.name) {
						switch(statement.type) {
							case 'motif':
								var m = this.searchIncludes(statement.type,statement.name);
								m || (m = Compiler.importObject(statement.type,statement.name,library.version));
								if(m) {
									library.motifs.unshift(m);
								} else {
									throw new DynamlError({
										type: 'unresolved import',
										message: 'Unable to import <%= importType %> "<%= importName %>"; the object could not be found.',
										importType: statement.type,
										importName: statement.name,
									});
								}
								break;
							case 'node':
								var m = this.searchIncludes(statement.type,statement.name);
								m || (m = Compiler.importObject(statement.type,statement.name,library.version));
								if(m) {
									library.nodes.unshift(m);
								} else {
									throw new DynamlError({
										type: 'unresolved import',
										message: 'Unable to import <%= importType %> "<%= importName %>"; the object could not be found.',
										importType: statement.type,
										importName: statement.name,
									});
								}								
								break;
							default:
								break;
						}
					}
				},this);
			}

			// Instantiate motifs to Motif objects
			library.motifs = _.reduce(library.motifs, function(memo,motif) {
				motif = _.copyWith(motif,{
					library: library,
					//externalMotifs: memo,
				});
				memo.push(new Motif(motif))
				return memo;
			},[]);
			
			// Instantiate nodes to Node objects
			library.nodes = _.map(library.nodes, function(node) {
				// if(node.polarity) {
					// delete node.polarity;
				// }
				
				if(fromDil) {
					node._motif = node.motif
					delete node.motif;
				}
				node.library = library;
				return new Node(node);
			});
			
		},
		searchIncludes: function (type,name) {
			var res = null;
			for(var i=0; i<this.includes.length && !res; i++) {
				res = this.includes[i].get(type,name);
			}	
			return res;
		},
		updateOutputProperties: function() {
			var library = this;
			// Build array of all Segment objects, assign Segment objects to their identity in labels
				library.allSegments = [];
				
				
				for(var i=0; i<library.nodes.length; i++) {
					var node = library.nodes[i], strands = node.getStrands();
					for(var j=0; j<strands.length; j++) {
						var strand = strands[j];
						library.allSegments = library.allSegments.concat(strand.getSegments());
					}
				}
								
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
				library.strands = _.chain(library.nodes).map(function(node) {
					return node.getStrands();
					
					// return _.map(node.getStrands(),function(strand) {
						// return new Strand(strand);
					// }); //new Strand(node);
				}).flatten().value();
		},
		getParameter : function(param, obj) {
			switch(param) {
				case 'segmentLength':
					if(this.parameters) {
						switch(obj.role) {
							case 'clamp':
								if(this.parameters.clampLength);
									return this.parameters.clampLength;
								break;
							case 'toehold':
								if(this.parameters.toeholdLength);
									return this.parameters.toeholdLength;
								break;
						}
						return this.parameters.segmentLength;
					}
			}
		},
		getNode: function(name) {
			if(name instanceof Node) return name;
			return this.objects['node'][name];
		},
		getMotif: function(name) {
			if(name instanceof Motif) return name;
			return this.objects['motif'][name];
		},
		getSegment: function(name) {
			if(name instanceof Segment) return name;
			return this.objects['segment'][name];
		},
		register: function(type,name,object) {
			if(!this.objects[type][name]) {
				this.objects[type][name] = object;
			} else {
				throw new DynamlError({
					type: 'Duplicate object',
					message: 'Attempt to define <%= kind %> <%= name %> twice in same library',
					kind: type,
					name: name,
					original: this.objects[type][name],
					second: object,
				});
			}
		},
		get: function(type,name) {
			return this.objects[type][name];
		},
		
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
		toDilOutput: function() {
			var out = this.serialize();
			if(out.imports) { delete out.imports; }
			if(out['import']) { delete out['import']; }
			return JSON.stringify(out,null,'\t');
		},
		toEnumOutput: function() {
			
			var library = this;

			var out = [];
			
			
			// print domains (segments)
			// e.g.: domain x : 7
			
			function nupackifyIdentity(id) {
				return id;
			}
			
			out.push(_.map(library.segments,function(segment) {
				return ['domain',nupackifyIdentity(segment.identity),':',segment.getLength()].join(' ');
			}).join('\n'));
			
			// print strands 
			// e.g.: strand A : a x b y z* c* y* b* x*
			
			out.push(_.map(library.strands,function(strand) {
				return ['strand',strand.getQualifiedName(),'='].concat(_.map(strand.getOrderedSegments(),function(segment) {
					return nupackifyIdentity(segment.getIdentifier());
				})).join(' ');
			}).join('\n'));
			
			// print complexes
			// e.g.: 
			// complex IA :
			// I A
			// (((( + )))).....
			
			out.push(_.map(library.nodes,function(node) {
				
				var structs = _.map(node.getStrands(),function(strand) { 
					var struct = strand.getSegmentwiseStructure();
					if(strand.getAbsolutePolarity() == -1) {
						struct = struct.reverse();
					}
					return struct;
				});
				
				var strands = _.map(node.getStrands(),function(strand) {
					return strand.getQualifiedName();
				});
				var concatamer = Structure.join(structs);
				
				return [['complex',node.getName(),':',].join(' '),strands.join(' '),concatamer.toDotParen()].join('\n');
			}).join('\n\n'));
			
			
			return out.join('\n\n');
			
		},
		/**
		 * Formats the library as (NUPACK)[http://www.nupack.org/] multi-objective design script
		 * @param {Object} options
		 * @param {Boolean} [options.multisubjective = true] True to surround domains with comment-backtick blocks for Multisubjective
		 * @param {Boolean} [options.forceDU = true] True to convert all structures to DU+
		 * @param {Boolean} [options.segmentsInStructure = false] True to export the `(structure_name).seq =` followed by lists of segments, rather than lists of strands 
		 */
		toNupackOutput: function(options) {
			options = options || {multisubjective: true,forceDU: true,segmentsInStructure: false};
			
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
			
			// stupid NUPACK doesn't allow numerical domain identifiers
			function nupackifyIdentity(id) {
				return 'd'+id;
			}
			
			// Surround with backtics for Multisubjective
			if(!!options.multisubjective) out.push('#`');
			out.push(_.map(library.segments,function(segment) {
				return ['domain',nupackifyIdentity(segment.identity),'=',segment.getSequence()].join(' ');
			}).join('\n'));
			if(!!options.multisubjective) out.push('#`');

			// print strands ("optional?")
			// e.g.: strand J = gate_toehold1* gate_duplex1* gate_toehold2
			
			out.push(_.map(library.strands,function(strand) {
				var segments = strand.getOrderedSegments();
				
				return ['strand',strand.getQualifiedName(),'='].concat(_.map(segments,function(segment) {
					return nupackifyIdentity(segment.getIdentifier());
				})).join(' ');
			}).join('\n'));
			
			// print structures
			// e.g.: structure gate_full = D30(+D30(U6+))
			// e.g.: structure haripin = Ux Hx Ux Ux
			
			out.push(_.map(library.nodes,function(node) {
				
				// var structs = _.map(node.getStrands(),function(strand) { 
					// var struct = strand.getStructure();
					// if(strand.getPolarity() == -1) {
						// struct = struct.reverse();
					// }
					// return struct;
				// });
				
				var concatamer = node.getStructure(), //Structure.join(structs), 
				concatamer_struct;
				
				// Concatamer is automatically reversed by node if polarity == -1
				// if(node.getPolarity() == -1) {
					// concatamer = concatamer.reverse();
				// }
				if(!!options.multisubjective || !!options.forceDU) {
					concatamer_struct = concatamer.toDUPlus();
				} else {
					concatamer_struct = concatamer.toDotParen();
				}
			
				
				
				return ['structure',node.getName()+'_structure','=',concatamer_struct].join(' ');
			}).join('\n'));
			
			// thread sequences onto structures 
			// e.g.: gate_full.seq = E G F
			
			if(!options.multisubjective) {
				
				out.push(_.map(library.nodes,function(node) {
					var names = _.map(node.getStrands(),function(strand) {
						return strand.getQualifiedName();
					});
					return [node.getName()+'_structure.seq','='].concat(names).join(' ');
				}).join('\n'));
			
			} else {
				
				out.push(_.map(library.nodes,function(node) {
					var names = _.map(node.getStrands(),function(strand) {
						if(options.segmentsInStructure) {							
							return _.map(strand.getOrderedSegments(),
								function(seg) { return nupackifyIdentity(seg.getIdentifier()) }).join(' ')
						} else {
							return strand.getQualifiedName();
						}
					});
					return [node.getName()+'_structure.seq','='].concat(names).join(' ');
				}).join('\n'));
				
			}
			
			return out.join('\n\n');
			
		},
		toMSOutput: function() {
			var library = this;

			var out = [];
			
			// print lengths (segments)
			// e.g.: length a = N7Y6N3
			// Y specifies an immutable base
			
			function nupackifyIdentity(id) {
				return 'd'+id;
			}
			
			function structureName(nodeName) {
				return nodeName + '_structure';
			}
			
			out.push(_.map(library.segments,function(segment) {
				return ['length',nupackifyIdentity(segment.identity),'=','N'+segment.getLength()].join(' ');
			}).join('\n'));
			
			
			// print structures
			// e.g.: hairpin A1: -
			// e.g.: static A2
			
			out.push(_.map(library.nodes,function(node) {
				if(node.type == 'hairpin') {
					return ['hairpin',structureName(node.getName()),':',(node.getPolarity() < 0 ? '-' : '+')].join(' ');
				} else if(node.type=='cooperative' || node.type=='coop') {
					var len = _.max(_.map(node.getStrands(),function(strand) { return strand.getLength() }))
					return ['coop',structureName(node.getName()),'=',len].join(' ');
				} else {
					return ['static',structureName(node.getName())].join(' ');
				}
			}).join('\n'));
			
			
			return out.join('\n\n');
		},
		toPilOutput: function() {
			
			var library = this;
			var out = [];
			
			// print sequences (segments)
			// sequence <name> = <constraints> : <length>
			// e.g.: sequence x = "6N S 13N S" : 21
			
			function nupackifyIdentity(id) {
				return 'd'+id;
			}
			
			out.push(_.map(library.segments,function(segment) {
				return ['sequence',nupackifyIdentity(segment.identity),'=',segment.getSequence()].join(' ');
			}).join('\n'));
			
			// print strands 
			// strand <name> = <list of sequences and explicit constraints> : <length>
			// e.g.: strand C = "?N" c : 44
			
			out.push(_.map(library.strands,function(strand) {
				return ['strand',strand.getQualifiedName(),'='].concat(_.map(strand.getOrderedSegments(),function(segment) {
					return nupackifyIdentity(segment.getIdentifier());
				})).join(' ');
			}).join('\n'));
			
			// print structures
			// structure <name> = <list of strands> : <secondary structure>
			// e.g.: structure Gate = X + C + S + Y : U6 H15(+ H15(U29 + U14 H15(+)))
			
			out.push(_.map(library.nodes,function(node) {
				
				var structs = _.map(node.getStrands(),function(strand) { 
					var struct = strand.getSegmentwiseStructure();
					if(strand.getAbsolutePolarity() == -1) {
						struct = struct.reverse();
					}
					return struct;
				});
				
				var strand_names = _.map(node.getStrands(),function(strand) {
					return strand.getQualifiedName();
				});
				
				var concatamer = Structure.join(structs),
					concatamer_struct = concatamer.toDotParen();
				
				
				return ['structure',node.getName()+'_structure','=',strand_names.join(' + '),':',concatamer_struct].join(' ');
			}).join('\n'));
			
			return out.join('\n\n');
			
		},
		toDomainsOutput: function() {
			return Compiler.printStrands(this,{annotations: false});
		},
		toSVGOutput: function(noHeader) {
			String.prototype.format = function() {
			  var args = arguments;
			  return this.replace(/{(\d+)}/g, function(match, number) { 
			    return typeof args[number] != 'undefined'
			      ? args[number]
			      : match
			    ;
			  });
			};
			
			var fid = {
				out: [],
				write: function(x) {
					this.out.push(x)
				},
				close: function() {
					return this.out.join('');
				}
			}
		    
		    var defaultSegmentLength = this.parameters.segmentLength;
		    
		    var roleColors = {
		    	'toehold': '#f00',
		    	'clamp': '#800',
		    }
		    
		    var cos = Math.cos, sin = Math.sin, pi = Math.PI, atan2 = Math.atan2;
			
			var x = 0,
			y = 0,
			H=300,
			V=160,
			// space allocated for each motif to be drawn in (one tile)
			R = Math.round(Math.sqrt(this.strands.length)),
			C = Math.ceil(this.strands.length/R);
			
			fid.write((!!noHeader ? '' : '<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n')+
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"\nviewBox = "0 0 ' + repr(H*C) + ' ' + repr(V*R) + '" version = "1.1">\n'+
			'<defs><path id="svgout-arrow" d="M -7 -7 L 0 0 L -7 7"/>\n<marker id="Triangle" viewBox="0 0 10 10" refX="0" refY="5" markerUnits="strokeWidth" markerWidth="4" markerHeight="3" orient="auto">\n'+
 			'<path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>\n'+
			'<style type="text/css">text { font-family: tahoma, helvetica, arial; font-size: 0.8em; text-shadow: 1px -1px 0px white; }</style>')

			for(var svgi = 0; svgi < this.nodes.length; svgi++) {
				var node = this.nodes[svgi];
				var strands = node.getStrands();
				var structure = node.getSegmentwiseStructure().toDotParen();
				
				if(structure.match(/^\.+$/)) { //initiator, straight strand without hybridization
					var strand = _.first(strands);
					fid.write('<g stroke = "rgb(139,98,61)" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} L {2} {3}" />\n'.format(x+H*.15,y+V*.5,x+H*.6,y+V*.5))
				    if (strand.getPolarity()==-1) 
				      fid.write('<use x="{0}" y="{1}" xlink:href="#svgout-arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.5,x+H*.15,y+V*.5))
				    else
				      fid.write('<use x="{0}" y="{1}" xlink:href="#svgout-arrow"/>\n'.format(x+H*.6,y+V*.5))
				    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
				    var segments = strand.getOrderedSegments();
				    for(var svgj = 0; svgj < segments.length; svgj++) {
					  var segment = segments[svgj];
				      var s = segment.getIdentifier();
				      var color = (segment.role && roleColors[segment.role]) ? roleColors[segment.role] : 'black'
				      var len = '';
				      if(segment.getLength() != defaultSegmentLength) {
				      	len = " ("+segment.getLength()+")";
				      }
				      fid.write('<text x="{0}" y="{1}" stroke="none" transform="rotate({2} {0} {1})" fill="{5}">{3}<tspan fill="grey" style="font-size: 0.8em">{4}</tspan></text>\n'.format(x+H*.15+H*(svgj+.5)/segments.length*.45,y+V*.5-V*.05,-45,s,len,color))
				    }
				    fid.write('</g>\n')
				} else if(structure.match(/^\.+\(+\.*\+\)+$/)) { // cooperative complex
			    	var segments = node.getOrderedSegments();
			    	// we're actually going to flip these back, because we're displaying from upper left, regardless
			    	if(node.getPolarity() == -1) {
			    		segments.reverse();
			    	}
			    	var strand = _.first(strands)
			    	
			    	
					var a = structure.indexOf('(');  // number of first hybridized segment

				    var b = a;
				    while(structure[b]=='(') { b++ } // number of last hybridized segment
					b--;

				    var c = structure.indexOf(')')-1;  // number of first hybridized segment after wraparound
				    // -1 because the + will be included in the structure
				    
				    var d = segments.length - 1; // number of last hybridized segment after wraparound
				    
				    var segmentLengths = _.map(segments,function(s) {return s.getLength()});
				    

				    
				    var len1 = sum(segmentLengths.slice(0,a)),  // length of the left-side toehold, in bases
				    len2 = sum(segmentLengths.slice(a,b+1)),  // length of the duplex region, in bases
				    len3 = sum(segmentLengths.slice(b+1,c)),  // length of the right-side toehold, in bases
				    len4 = sum(segmentLengths.slice(d+1));  // length of the trailing end, in bases


				    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
				    for(var svgj = 0; svgj < len2; /*segments.length;*/ svgj++) { // draw cross-lines for paired bases
			      		fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.3+H*.3*svgj/len2,y+V*.45,x+H*.3+H*.3*svgj/len2,y+V*.5))
				      }
			    	fid.write('</g>\n')
			    	fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} L {2} {3}" stroke="black"/>\n'.format(x+H*.6,y+V*.50,x+H*.3,y+V*.5))  // bottom line
			    	fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.15,y+V*.45,x+H*.75,y+V*.45))  // yellow top line
			    	if (len4>0)
			      		fid.write('<path d = "M {0} {1} L {2} {3}" stroke = "black"/>\n'.format(x+H*.3,y+V*.5,x+H*.15,y+V*.8))  // trailing end
			    	if (strand.getAbsolutePolarity() == -1) {
			      		fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#svgout-arrow" transform="rotate(180,{0},{1})"/>\n'.format(x+H*.15,y+V*.45))  // <- yellow top arrow
				        fid.write('<use x="{0}" y="{1}" xlink:href="#svgout-arrow" transform=""/>\n'.format(x+H*.6,y+V*.50))								// black bottom arrow ->

			    	} else {
			    		fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#svgout-arrow" transform=""/>\n'.format(x+H*.75,y+V*.45))  // yellow top arrow ->
				        fid.write('<use x="{0}" y="{1}" xlink:href="#svgout-arrow" transform="rotate(180,{0},{1})"/>\n'.format(x+H*.3,y+V*.5))								// <- black bottom arrow
				    }
				    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
				    
				    labelx = []
				    labely = []
				    labelr = [];
				    
				    for (var svgj = 0; svgj < a; svgj++) {
				      labelx.push(H*(.15 + .15*(svgj+.5)/a))
				      labely.push(V*.4)
				      labelr.push(-45)
				    }  // toehold
				    for (svgj = 0; svgj < b+1-a; svgj++) {
				    	
				      labelx.push(H*(.3 + .3*(svgj+.5)/(b+1-a)))
				      labely.push(V*.4)
				      labelr.push(-45)
				    }  // duplex region
				    for (svgj = 0; svgj < c-(b+1); svgj++) {
				    	
				      labelx.push(H*(.6 + .15*(svgj+.5)/(c-(b+1))))
				      labely.push(V*.4)
				      labelr.push(-45)
				    	
				    }  // right-hand toehold
				    for (svgj = 0; svgj < b+1-a; svgj++) {
				    	
				      labelx.push(H*(.6 - .3*(svgj+.5)/(b+1-a)))
				      labely.push(V*.6) // shifted down a bit because we rotate for these guys
				      labelr.push(45)
				    }  // duplex region again
				    for (svgj = 0; svgj < d+1-c; svgj++) {
				    	
				      labelx.push(H*(.3 - .15*(svgj+.5)/(d+1-c)))
				      labely.push(V*(.6 + .3*(svgj+.5)/(d+1-c)))
				      labelr.push(0)
				    }  // trailing end
				    
				    for (var svgj = 0; svgj < segments.length; svgj++) {
				      var segment = segments[svgj];
				      
				      var s = segment.getIdentifier();
				      // if (svgk>0)
				        // s = repr(svgk)
				      // else
				        // s = repr(-svgk) + '*'
				      var color = (segment.role && roleColors[segment.role]) ? roleColors[segment.role] : 'black'
				      var len = '';
				      if(segment.getLength() != defaultSegmentLength) {
				      	len = " ("+segment.getLength()+")";
				      }
				      fid.write('<text x="{0}" y="{1}" stroke="none" transform="rotate({2} {0} {1})" fill="{5}">{3}<tspan fill="grey" style="font-size: 0.8em">{4}</tspan></text>\n'.format(x+labelx[svgj],y+labely[svgj],labelr[svgj],s,len,color))
				    }
			    	fid.write('</g>\n')
			    	
			    	
				} else if(structure.match(/^\.+\(+\.+\)+(\.+)?$/)) { //hairpin loop
			    	var strand = _.first(node.getStrands());
			    	var segments = strand.getOrderedSegments();
					var a = structure.indexOf('(');  // number of first hybridized segment

					// we're actually going to flip these back, because we're displaying from upper left, regardless
			    	if(node.getPolarity() == -1) {
			    		segments.reverse();
			    	}

				    var b = a;
				    while(structure[b]=='(') { b++ } // number of last hybridized segment
					b--;

				    c = structure.indexOf(')');  // number of first hybridized segment after wraparound
				    
				    var d = c; // number of last hybridized segment after wraparound
				    while(structure[d]==')') { d++ }
				    d--;
				    
				    var segmentLengths = lengths(segments);
				    
				    var len1 = sum(segmentLengths.slice(0,a)),  // length of the initial toehold, in bases
				    len2 = sum(segmentLengths.slice(a,b+1)),  // length of the duplex region, in bases
				    len3 = sum(segmentLengths.slice(b+1,c)),  // length of the hairpin loop, in bases
				    len4 = sum(segmentLengths.slice(d+1));  // length of the trailing end, in bases


				    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
				    for(var svgj = 0; svgj < len2; /*segments.length;*/ svgj++) { // draw cross-lines for paired bases
			      		fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.3+H*.3*svgj/len2,y+V*.45,x+H*.3+H*.3*svgj/len2,y+V*.5))
				      }
			    	fid.write('</g>\n')
			    	fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} a {2} {3} 0 1 1 {4} {5} L {6} {7}" stroke="black"/>\n'.format(x+H*.6,y+V*.45,H*.085,V*.25,0,V*.05,x+H*.3,y+V*.5))  // loop and bottom line
			    	fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.15,y+V*.45,x+H*.6,y+V*.45))  // yellow top line
			    	if (len4>0)
			      		fid.write('<path d = "M {0} {1} L {2} {3}" stroke = "black"/>\n'.format(x+H*.3,y+V*.5,x+H*.15,y+V*.8))  // trailing end
			    	if (strand.getAbsolutePolarity() == -1) {
			      		fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#svgout-arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.45,x+H*.15,y+V*.45))  // yellow top arrow
			    	} else {
			    	
				      if (len4>0)
				        fid.write('<use x="{0}" y="{1}" xlink:href="#svgout-arrow" transform="rotate({2},{3},{4})"/>\n'.format(x+H*.15,y+V*.8,90+180/pi*atan2(V*.3,H*.15),x+H*.15,y+V*.8))  // bottom arrow
				      else
				        fid.write('<use x="{0}" y="{1}" xlink:href="#svgout-arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.3,y+V*.5,x+H*.3,y+V*.5))
				    }
				    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
				    
				    labelx = [];
				    labely = [];
				    labelr = [];
				    
				    for (var svgj = 0; svgj < a; svgj++) {
				      labelx.push(H*(.15 + .15*(svgj+.5)/a))
				      labely.push(V*.4)
				      labelr.push(-45)
				    }  // toehold
				    for (svgj = 0; svgj < b+1-a; svgj++) {
				    	
				      labelx.push(H*(.3 + .3*(svgj+.5)/(b+1-a)))
				      labely.push(V*.4)
				      labelr.push(-45)
				    }  // duplex region
				    for (svgj = 0; svgj < c-(b+1); svgj++) {
				    	
				      labelx.push(H*(.67 - .15*cos(2*pi*(svgj+.5)/(c-(b+1)))))
				      labely.push(V*(.49 - .35*sin(2*pi*(svgj+.5)/(c-(b+1)))))
				      labelr.push(0)
				    }  // hairpin loop
				    for (svgj = 0; svgj < b+1-a; svgj++) {
				      labelx.push(H*(.6 - .3*(svgj+.5)/(b+1-a)))
				      labely.push(V*.58)
				      labelr.push(45)
				    }  // duplex region again
				    for (svgj = 0; svgj < d+1-c; svgj++) {
				      labelx.push(H*(.3 - .15*(svgj+.5)/(d+1-c)))
				      labely.push(V*(.6 + .3*(svgj+.5)/(d+1-c)))
				      labelr.push(45)
				    }  // trailing end
				    
				    for (var svgj = 0; svgj < segments.length; svgj++) {
				      var segment = segments[svgj];
				      var s = segment.getIdentifier();
				      var color = (segment.role && roleColors[segment.role]) ? roleColors[segment.role] : 'black'
				      var len = '';
				      if(segment.getLength() != defaultSegmentLength) {
				      	len = " ("+segment.getLength()+")";
				      }
				      fid.write('<text x="{0}" y="{1}" stroke="none" transform="rotate({2} {0} {1})" fill="{5}">{3}<tspan fill="grey" style="font-size: 0.8em">{4}</tspan></text>\n'.format(x+labelx[svgj],y+labely[svgj],labelr[svgj],s,len,color))
				    }
			    	fid.write('</g>\n')
					

				}
				

				var name = node.getName();
				if(strands.length > 1) {
					name += '('+_.map(strands,function(s) {return s.getName()}).join(' + ')+')'
				}
			  fid.write('<text x="{0}" y="{1}" style="font-size: 18px; font-weight: bold;" stroke="none">{2}</text>\n'.format(x+H*.45, y+V*.9, name))
			  y += V
			  if (y>=V*R) {			  	
			    y=0
			    x += H
			  }
			}

			fid.write('</svg>\n')
			return fid.close()
			
		},
		toMotif: function() {
			var strands = _.map(this.strands,function(strand) {
				var newStrand = _.copy(strand);
				newStrand.domains = _.map(newStrand.domains || [],function(domain) {
					var newDomain = _.copy(domain);
					if(domain.expose) {
						_.extend(newDomain,domain.expose);
						delete newDomain.expose;
					} else {
						domain.role = 'structural';
					}
					if(newDomain.orphan) {
						newDomain.orphan();
					}
					if(newDomain.strand) delete newDomain.strand;
					if(newDomain.node) delete newDomain.node;
					return domain;
				});
				newStrand.polarity = strand.getAbsolutePolarity();
				delete newStrand.node;
				return newStrand; //.serialize();
			});
			return {strands: strands};
		},
		serialize: function() {
			var out = _.copy(this);
			if(out.objects) { delete out.objects; }
			return _.serialize(out);
		},
		update: function(data) {
			var me = this;
			
			// if(data.motifs) {
				// for(var name in data.motifs) {
					// var myObj = me.get('motif',name),
						// newData = data.motifs[name];
// 					
					// _.extend(myObj,newData);
				// }
			// } 
// 
			// if(data.nodes) {
				// for(var name in data.nodes) {
					// var myObj = me.get('node',name),
						// newData = data.nodes[name];
// 					
					// if(newData.strands) {
						// for(var strandName in newData.strands) {
							// var newStrand
						// }
					// }
// 					
					// _.extend(myObj,newData);
				// }
			// }
			
			if(data.segments) {
				var indexedSegments = {};
				for(var i=0;i<me.allSegments.length;i++) {
					var seg = me.allSegments[i], segId = seg.getIdentity(); 
					if(!indexedSegments[segId]) {
						indexedSegments[segId] = [];
					}
					indexedSegments[segId].push(seg);
				}
				
				for(var name in data.segments) {
					var newData = data.segments[name];
					if(indexedSegments[name]) {
						var mySegments = indexedSegments[name];
						for(var i=0;i<indexedSegments[name].length;i++) {
							_.extend(mySegments[i],newData);
						}
					} else {
						var newSegSpec = _.clone(data.segments[name]);
						newSegSpec.library = me;
						me.allSegments.push(new Segment(newSegSpec));
					}
				}
			}
		},
	};
	
	_.extend(Library,{
		/**
		 * Returns a dummy Library for orphan motifs
		 */
		dummy: function() {
			return new App.dynamic.Library({});
		},
		fromMotif: function(motif) {
			var duplicate = _.copy(motif);
			delete duplicate.library;
			return new Library(duplicate);
		},
		/**
		 * Produces a {@link App.dynamic.Library Library} object from a DIL object
		 * (a serialized Library).
		 * 
		 * @param {Object} dil
		 * 
		 * @return {App.dynamic.Library} lib
		 */
		fromDil: function(dil) {
			var lib = new Library(dil);
			lib.setup(/*fromDil*/true);
			lib.updateOutputProperties();
			return lib;
		},
	});
	
	

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
				library = JSON.parse(input);
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
			return compileLibrary(parse(jsonString));
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
				
				// Import Motifs, build Node, Motif objects
				library.setup();
				
				// Blast node polarities, but make sure at least one is set.
				var specified_polarities = 0;
				for(var i=0;i<library.nodes.length;i++) {
					if(!library.nodes[i].isInitiator) {
						delete library.nodes[i].polarity;						
					} else {
						specified_polarities++;
					}
				}
				if(specified_polarities == 0 && library.nodes.length > 0) {
					library.nodes[0].polarity = 1;
				}

				// Generate array of Complement objects
				var complementarities = _.chain(library.nodes).map(function(node) {
					node.complementarities = _.map(node.complementarities || [], function(complement) {
						complement.sourceNode = node;
						complement.library = library;
						return new Complement(complement);
					});
					
					return node.complementarities;
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

							// Calculate downstream node polarity such that targetPort's absolute polarity is opposite 
							// sourcePort's absolute polarity.
							// Recall (absolute polarity) = (relative port polarity) * (relative strand polarity) * (node polarity)
							// Therefore if (targetPort abs polarity)  = (targetPort rel port polarity) * (targetPort strand polarity) * (targetPort node polarity)
							//										  := -1 (sourcePort rel port polarity) * (sourcePort strand polarity) * (sourcePort node polarity)
							// -> (targetPort node polarity) = -1 * [(sourcePort rel port polarity) * (sourcePort strand polarity) * (sourcePort node polarity)] *
							//										[(targetPort rel port polarity) * (targetPort strand polarity)]
							var targetPolarity = -1 * complement.sourcePort.polarity * complement.sourcePort.getStrand().getPolarity() * complement.sourceNode.polarity  * complement.targetPort.polarity * complement.targetPort.getStrand().getPolarity()
							
							if(isNaN(targetPolarity)) {
								if(isNaN(complement.sourcePort.polarity)) {									
									throw new DynamlError({
										type: 'polarity unspecified',
										message: 'source port polarity is NaN',
										sourceNode: complement.sourceNode,
										sourcePort: complement.sourcePort,
										complement: complement,
										nodes: [config.sourceNode,],
										ports: [config.sourcePort,],
									});
								} else {
									throw new DynamlError({
										type: 'polarity unspecified',
										message: 'source node polarity is NaN',
										sourceNode: complement.sourceNode,
										sourcePort: complement.sourcePort,
										complement: complement,
										nodes: [config.sourceNode,],
										ports: [config.sourcePort,],
									})
								}
							}

							// If the targetNode already has a polarity and it's wrong, throw polarity error
							if(complement.targetNode.polarity != 0 && complement.targetNode.polarity == -targetPolarity) {
								throw new DynamlError({
									type : 'polarity conflict',
									message : _.template('Complementarity statement in node <%= source %> implies node <%= target %> ' + //
									'should have polarity <%= expected %>, but instead it has polarity <%= encountered %>', {
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
									nodes: [complement.sourceNode,complement.targetNode],
									ports: [complement.getSourcePort(), complement.getTargetPort(),],
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
					var complementType = complement.getType();
					
					
					// flip domains for output ports, but not for bridges
					if(complementType=='output') {
						
						// if((complement.sourcePort.getStrand().getAbsolutePolarity() == complement.targetPort.getStrand().getAbsolutePolarity()) != (complement.sourceNode.polarity == complement.targetNode.polarity)) {
							// throw 'wut';
						// }
						
						if(complement.sourcePort.getStrand().getAbsolutePolarity() == complement.targetPort.getStrand().getAbsolutePolarity()) {
						//if(complement.sourceNode.polarity == complement.targetNode.polarity) {
							targetSegments.reverse();
						}
					}
					
					var sourceDomainLength = lengths(sourceSegments);
					var targetDomainLength = lengths(targetSegments);

					// Two complementary ports should have the same basewise length
					// If they don't, try to determine the cause
					if(sum(sourceDomainLength) != sum(targetDomainLength) || sourceSegments.length != targetSegments.length) {
					
						// Either the total number of segments is mismatched
						if(sourceSegments.length != targetSegments.length) {
	
							// If there's just an extra clamp for outputs, that's okay
							if(complementType=='output' && sourceSegments.length - targetSegments.length == 1 && _.last(sourceSegments).role == 'clamp') {
								sourceSegments.pop();
							} else if(complementType=='output' && targetSegments.length - sourceSegments.length == 1 && _.last(targetSegments).role == 'clamp') {
								targetSegments.pop();
	
							} else {
								// Otherwise complain
								throw new DynamlError({
									type : 'domain length mismatch',
									message : _.template('Complementarity statement (<%= sourceNode %>.<%= sourcePort %> * <%= targetNode %>.<%= targetPort %>) '+
									'in node <%= sourceNode %> implies domain <%= targetNode %>.<%= targetPort %> ' + //
									'should have <%= expected %> segments, but instead it has <%= encountered %> segments', {
										sourceNode : complement.sourceNode.getName(),
										targetNode : complement.targetNode.getName(),
										sourcePort : complement.targetPort.getName(),
										targetPort : complement.targetPort.getName(),
										expected : sourceSegments.length,
										encountered : targetSegments.length,
									}),
									nodes : [complement.sourceNode, complement.targetNode],
									sourceNode : complement.sourceNode,
									targetNode : complement.targetNode,
									sourcePort : complement.getSourcePort(),
									targetPort : complement.getTargetPort(),
									ports : [complement.getSourcePort(),complement.getTargetPort(),],
								});
							}
						
						// ... or maybe some of the segments are of different lengths
						} else {
							// For each segment
							for(var i = 0; i<sourceSegments.length;i++) {
								var sourceSegment = sourceSegments[i],
									targetSegment = targetSegments[i];
									
								if(sourceDomainLength[i] != targetDomainLength[i]) {
									throw new DynamlError({
									type : 'segment length mismatch',
										message : _.template('Complementarity statement (<%= sourceNode %>.<%= sourcePort %> * <%= targetNode %>.<%= targetPort %>) '+
										'in node <%= sourceNode %> implies segment <%= targetNode %>.<%= targetPort %>.<%= targetSegment %> (<%= targetSegmentIndex %>/<%= targetSegmentCount %>)' + //
										'should have same length as <%= sourceNode %>.<%= sourcePort %>.<%= sourceSegment %> (<%= sourceSegmentIndex %>/<%= sourceSegmentCount %>): '+
										'<%= expected %> segments, but instead it has <%= encountered %> segments.', {
											sourceNode : complement.sourceNode.getName(),
											sourcePort : complement.sourcePort.getName(),
											sourceSegment : sourceSegment.getName(),
											sourceSegmentIndex : i,
											sourceSegmentCount : sourceSegments.length,
											
											targetNode : complement.targetNode.getName(),
											targetPort : complement.targetPort.getName(),
											targetSegment : targetSegment.getName(),
											targetSegmentIndex : i,
											targetSegmentCount : targetSegments.length,
											
											expected : sourceDomainLength[i],
											encountered : targetDomainLength[i],
										}),
										nodes : [complement.sourceNode, complement.targetNode],
										sourceNode : complement.sourceNode,
										sourcePort : complement.getSourcePort(),
										sourceSegment : sourceSegment,

										targetNode : complement.targetNode,
										targetPort : complement.getTargetPort(),
										targetSegment : targetSegment,
										
										ports : [complement.getSourcePort(),complement.getTargetPort(),],
									});
								}
							}
						}

					}
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
								var segmentIdToKeep = _.first(segments);

								var newLabel = null;

								// If segments must be equal
								if(constraint == 1) {

									// Ensure they're not already complementary
									if(labels[leftSegmentId] == -labels[rightSegmentId]) {
										var leftSeg = library.getSegment(leftSegmentId), rightSeg = library.getSegment(rightSegmentId);
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
										var leftSeg = library.getSegment(leftSegmentId), rightSeg = library.getSegment(rightSegmentId);
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

										var segment = library.getSegment(segmentId);
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
				
				// Properly number segments
				_.each(library.nodes, function(node) {
					_.each(node.getStrands(), function(strand) {
						_.each(strand.getSegments(), function(segment) {
							segment.identity = Math.abs(labels[segment.getId()]);
							segment.polarity = DNA.signum(labels[segment.getId()]);
						})
					});
				});

				library.updateOutputProperties();
				
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
	
			var defaultPolaritySpecifier = "*";
			
			function makeIdentifier(name, polarity) {
				return name + ((polarity == -1) ? defaultPolaritySpecifier : '');
			}
			
			out += _.map(library.segments,function(segment) {
				return ['sequence', /*makeIdentifier(segment.identity,segment.polarity),*/ segment.getIdentifier(),':',segment.getSequence()].join(' ')
			}).join('\n');
			
			out += '\n';
			
			out += _.map(library.strands, function(strand) {
				var name = strand.getQualifiedName();
				var domains = _.clone(strand.getDomains());
				if(strand.getAbsolutePolarity() == -1) {
					domains = domains.reverse();
				}
				
				return _([			
					// leader
					options.annotations ? 'strand' : '', 
					
					name, 
					
					// strand polarity specifier
					(options.annotations ? (strand.getAbsolutePolarity() == -1 ? '-' : '+') : ''),
					
					':',
					
					].concat(_.map(domains, function(domain) {
					
						var segments = _.clone(domain.getSegments());
						if(strand.getAbsolutePolarity() == -1) {
							segments = segments.reverse();
						}
						
						return [
							// opening domain grouping bracket
							(options.annotations ? '[' : '')
							
							// segment body
							].concat(_.map(segments,function(segment) {				
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
		
		/**
		 * Prints a textual description of a given array of strands for sequence design
		 * @param {App.dynamic.Strand[]} strands
		 * @param {Object} [options]
		 * @param {Object} [options.annotations=true] True to display brackets around domains and to indicate strand/domain polarities
		 * @param {Object} [options.originalSegmentNames=false] True to use the original {@link App.dynamic.Segment#name segment names} in the strand descriptions
		 */
		function printStrandsFromArray(strands,options) {
			options = options || {};
			_.defaults(options,{
				annotations: true,
				originalSegmentNames : false,
			});
			var out = '';
	
			var defaultPolaritySpecifier = "*";
			
			function makeIdentifier(name, polarity) {
				return name + ((polarity == -1) ? defaultPolaritySpecifier : '');
			}
			
			out += _.map(strands, function(strand) {
				var name = strand.getQualifiedName();
				var domains = _.clone(strand.getDomains());
				if(strand.getAbsolutePolarity() == -1) {
					domains = domains.reverse();
				}
				
				return _([			
					// leader
					options.annotations ? 'strand' : '', 
					
					name, 
					
					// strand polarity specifier
					(options.annotations ? (strand.getAbsolutePolarity() == -1 ? '-' : '+') : ''),
					
					':',
					
					].concat(_.map(domains, function(domain) {
					
						var segments = _.clone(domain.getSegments());
						if(strand.getAbsolutePolarity() == -1) {
							segments = segments.reverse();
						}
						
						return [
							// opening domain grouping bracket
							(options.annotations ? '[' : '')
							
							// segment body
							].concat(_.map(segments,function(segment) {				
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
		
		var roleAbbrevs = {
			'domain':{
				'i': 'input',
				'o': 'output',
				'b': 'bridge',
				's': 'structural',
				'x': 'structural',
			},
			'segment':{
				't':'toehold',
				'th':'toehold',
				'c':'clamp',
				'cl':'clamp',
			}
		};
		
		var abbrevRoles = {
			'domain' : {
				'input': 'i',
				'output': 'o',
				'bridge': 'b',
				'structural': 'x',
			},
			'segment' : {
				'toehold': 't',
				'clamp': 'c',
			}
		}
		
		function printPolarity(pol) {
			if(pol == -1) {
				return '-';
			} else if(pol == 1) {
				return '+';
			} else {
				return '0';
			}
		}
		
		/**
		 * Given a role name, abbreviates to a compact "role specifier"; inverse of
		 * #expandRole. 
		 * 
		 * @param {String} type 
		 * `domain` or `segment
		 * 
		 * @param {String} str
		 * The role name to be abbreviated
		 * 
		 * @return {String} abbrev
		 * The role specifier; see #expandRole for values.
		 */
		function abbrevRole(type,str) {
			if(abbrevRoles[type]) {
				if(abbrevRoles[type][str]) return abbrevRoles[type][str]
			}
			return str;
		}
		
		/**
		 * Expands a compact "role specifier" to a full role name. Allows shorthand role names
		 * to be used to reduce typing. Short-hand names available:
		 * 
		 * -	For {@link App.dynamic.Domain Domains}:
		 * 		-	`i` : input
		 * 		-	`o` : output
		 * 		-	`b` : bridge
		 * 		-	`s` or `x` : structural
		 * -	For {@link App.dynamic.Segment Segments}:
		 * 		-	`t` or `th` : toehold
		 * 		-	`c` or `cl` : clamp
		 * 
		 * @param {String} type 
		 * `domain` or `segment
		 * 
		 * @param {String} str
		 * The role specifier to be expanded
		 */
		function expandRole(type,str) {
			if(roleAbbrevs[type]) {
				if(roleAbbrevs[type][str]) return roleAbbrevs[type][str]
			}
			return str;
		}
		
		/**
		 * Accepts a domain list in a compact, string representation. 
		 * 
		 * ex: d1[a*(8) b* c(2)]i- d2[d:t e f*]o
		 * 
		 * The format is as follows: 
		 * _name_ [_segments_] _role (optional)_ _polarity (optional)_
		 * 
		 * 	-	`name` is any alphanumeric string (underscores allowed),
		 * 	-	`segments` is a space-separated list of segments in {@link #parseSegmentString string format}
		 * 	-	`role` is a {@link App.dynamic.Domain#role role name} or {@link #expandRole role specifier}
		 * 	-	`polarity` is an optional {@link App.dynamic.Domain#polarity} polarity specifier: `+` or `-`
		 * 
		 * @param {String} str
		 * The domain string to parse
		 * 
		 * @param {Boolean} [parseIdentifier=false] 
		 * See #parseSegmentString.
		 * 
		 * @return {App.dynamic.Domain[]}
		 */
		function parseDomainString(str,parseIdentifier) {
			parseIdentifier || (parseIdentifier = false)
			var domains = str.match(/(\w+\[[\w\(\)\*'\s:]+\]\w?[\+-]?)\s?/g);
			return _.map(domains,function(dom) {
				var parts = dom.match(/(\w+)\[([\w\(\)\*'\s:]+)](\w?)([\+-]?)/);
				//	e.g. "d1[a*(1) b* c(2)]i-"
				//	->  ["d1[a*(1) b* c(2)]i-", "d1", "a*(1) b* c(2)", "i", "-"]
				//       0                       1     2                3    4
				var d = {
					name: parts[1],
					segments: parseSegmentString(parts[2],parseIdentifier),
				};
				var role = expandRole('domain',parts[3]);
				if(!!role) {d.role = role;}
				if(!!parts[4]) {d.polarity = parts[4];}
				return d;		
			})
		}
		
		/**
		 * Accepts an array of App.Compiler.Domain objects, and produces a compact,
		 * text-based representation. Inverse of #parseDomainString.
		 * 
		 * @param {App.Compiler.Domain[]} doms
		 * @param {Number} [polarity=1] Set to -1 to flip the output segmentwise
		 * @param {Boolean} [omitLengths=false] True to output the domain string without parenthesized length specifiers
		 * 
		 */
		function printDomainString(doms,polarity,omitLengths) {
			polarity || (polarity = 1);
			omitLengths || (omitLengths = false);
			
			return order(_.map(doms,function(dom) {
				return [
					// Domain name
					dom.getName(),

					// Segments, e.g. [1 2 3* 4]
					'[',printSegmentString(order(dom.getSegments(),polarity),omitLengths),']',
					
					// Domain role identifier, e.g. i o b x
					abbrevRole('domain',dom.role || ''),

					// Polarity specifier, e.g. + - 0
					printPolarity(dom.getPolarity())
				].join('')
			}),polarity).join(' ')
		}
		
		function printStrandString(strand) {
			return strand.getName() + ' : ' + printDomainString(strand.getDomains(),strand.getPolarity());
		}
		
		/**
		 * Accepts a segment list in a compact, string representation
		 * and converts it to valid DyNAML
		 * 
		 * ex: a*(8) b*t c(2) d:c
		 * 
		 * The format is as follows:
		 * _name_ (_length (optional)_) _role_
		 * 
		 * -	`name` is any alphanumeric string (underscores allowed) with an optional {@link App.dynamic.Segment#polarity polarity specifier}
		 * 	-	`length` is the length of the Segment in bases
		 * 	-	`role` is a {@link App.dynamic.Segment#role role name} or {@link #expandRole role specifier}. If 
		 * 
		 * @param {String} str
		 * Space-separated segment string to be parsed
		 * 
		 * @param {Boolean} [parseIdentifier=false]
		 * True to parse the `name` portion into an `identity` and `polarity` using DNA#parseIdentifier 
		 * 
		 * @return {App.dynamic.Segment[]} segments
		 */
		function parseSegmentString(str,parseIdentifier) {
			parseIdentifier || (parseIdentifier = false);
			var segments = str.split(/\s+/g);
			return _.map(segments,function(seg) {
				seg.trim();
				var parts = seg.match(/(\w+\*?)(?:\(([aAtTcCgGuUnN\d]+)\))?:?(\w+)?/);
				// e.g.: "a*(6):t"
				// 	-> ["a*(6):t", "a*", "6",   "t"]
				//		0			1     2      3
				//		full		name length  role
				
				var s = { };
				
				if(parts) {
					if(parseIdentifier) {					
						_.extend(s, DNA.parseIdentifier(parts[1]));
					} else {
						s.name = parts[1];
					}
				
					var role = expandRole('segment',parts[3]);
					if(!!role) {s.role = role;}
					if(!!parts[2]) {
						if(parts[2].match(/[aAtTcCgGuUnN]+/)) {
							s.sequence = parts[2]
						} else if (parts[2].match(/\d+/)) {					
							s.length = parseInt(parts[2])
						}
					}
				}
				return s;
			})
		}
		
		/**
		 * Accepts a list of segments and prints compact segment specifiers.
		 * Inverse of #parseSegmentString.
		 * 
		 * @param {App.dynamic.Segment[]} segments
		 * 
		 * @return {String} str
		 * Space-separated segment string to be parsed
		 */
		function printSegmentString(segs,omitLengths) {
			omitLengths || (omitLengths = false)
			return _.chain(segs).compact().map(function(seg) {
				if(omitLengths) {
					var role = abbrevRole('segment',seg.role || '');
					if(role) return [seg.getIdentifier(),':',role].join('')
					else return seg.getIdentifier();
				}
				return [seg.getIdentifier(),'(',seg.getLength(),')',abbrevRole('segment',seg.role || '')].join('')
			}).value().join(' ');
		}

		/**
		 * Accepts as input either a {@link #parseDomainString Domain string} or a {@link #parseSegmentString Segment string}
		 * and returns a Domain specification
		 * @param  {String} str String to parse
		 * @param  {Boolean} parseIdentifier True to parse identifiers (see #parseDomainString)
		 * @return {Object} Domain configuration object (see #parseDomainString)
		 */
		function parseDomainOrSegmentString(str,parseIdentifier) {
			if ((/(\w+\[[\w\(\)\*'\s:]+\]\w?[\+-]?)\s?/g).test(str)) {
				return parseDomainString(str,parseIdentifier);
			} else if ((/(\w+\*?)(?:\(([aAtTcCgGuUnN\d]+)\))?:?(\w+)?/).test(str)) {
				return [{
					name: 'A',
					segments: parseSegmentString(str,parseIdentifier),
					role: '',
					polarity: 1,
				}]
			} else {
				return [];
			}
		}
		
		
		/**
		 * @property {Array} standardMotifsVersions
		 * An array containing the various versions of the standard motif library. 
		 * The current version number is given by #standardMotifsCurrentVersion,
		 * and is found in #standardMotifs. 
		 *
		 * Each element of this array contains an object mapping motif names to 
		 * {@link App.dynamic.Motif} configuration objects. Note that these are _not_
		 * full, usable motifs; they must be passed to the 
		 * {@link App.dynamic.Motif#constructor App.dynamic.Motif constructor}, along 
		 * with a {@link App.dynamic.Motif#cfg-library reference} to an active 
		 * {@link App.dynamic.Library library}, in order to be used.
		 */
		var standardMotifsVersions = [
			// Version 0
			[{
					name: 'm1',
					type: 'initiator',
					structure: '..',
				    isInitiator: true,
				    domains: [{
				    	name: 'A',
				    	role: 'output',
				    	type: 'init',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: ''},
					        {name: 'b', role: ''},
				    	]
				    }]
				},{
					name: 'm2',
					type: 'initiator',
				    isInitiator: true,
				    structure: '...',
				    domains: [{
				    	name: 'A',
				    	role: 'output',
				    	type: 'init',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: ''},
					        {name: 'b', role: ''},
					        {name: 'c', role: ''},
				    	]
				    }]
				},{
					name: 'm3',
					type: 'hairpin',
					structure: '.(.)',
				    domains: [{
				    	name: 'A',
				    	role: 'input',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: 'toehold'},
					        {name: 'b', role: ''},
				    	]
				    },{
				    	name: 'B',
				    	role: 'output',
				    	type: 'loop',
				    	polarity: '-',
				    	segments: [
					      	{name: 'c', },
					        {name: 'b*', role: ''},
				    	]
				    }]
				},{
					name: 'm4',
					type: 'hairpin',
					structure: '.((..))..',
				    domains: [{
				    	name: 'A',
				    	role: 'input',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: 'toehold'},
					        {name: 'b', role: ''},
					        {name: 'c', role: ''},
				    	]
				    },{
				    	name: 'B',
				    	role: 'output',
				    	type: 'loop',
				    	polarity: '-',
				    	segments: [
					      	{name: 'd', },
					        {name: 'e', },
					        {name: 'c*', role: ''},
				    	]
				    },{
				    	name: 'C',
				    	role: 'output',
				    	type: 'tail',
				    	polarity: '+',
				    	segments: [
					      	{name: 'b*', role: 'toehold'},
					        {name: 'f', role: ''},
					        {name: 'g', role: ''},
				    	]
				    }]	
				},{
					name: 'm5',
					type: 'hairpin',
					structure: '.((.))',
				    domains: [{
				    	name: 'A',
				    	role: 'input',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: 'toehold'},
					        {name: 'b', role: ''},
					        {name: 'c', role: ''},
				    	]
				    },{
				    	name: 'B',
				    	role: 'bridge',
				    	type: 'loop',
				    	polarity: '+',
				    	segments: [
					      	{name: 'd', },
				    	]
				    },{
				    	name: 'C',
				    	role: 'structural',
				    	type: 'stem',
				    	polarity: '+',
				    	segments: [
					      	{name: 'b*', role: ''},
					        {name: 'c*', role: ''},
				    	]
				    }]	
				},{
					name: 'm6',
					type: 'hairpin',
					structure: '.((....))..',
				    domains: [{
				    	name: 'A',
				    	role: 'input',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: 'toehold'},
					        {name: 'b', role: ''},
					        {name: 'c', role: ''},
				    	]
				    },{
				    	name: 'B',
				    	role: 'bridge',
				    	type: 'loop',
				    	polarity: '+',
				    	segments: [
					      	{name: 'd', },
				    	]
				    },{
				    	name: 'C',
				    	role: 'output',
				    	type: 'loop',
				    	polarity: '-',
				    	segments: [
					      	{name: 'e', },
					      	{name: 'f', },
					      	{name: 'g', },
					      	{name: 'c*', },
				    	]
				    },{
				    	name: 'D',
				    	role: 'output',
				    	type: 'tail',
				    	polarity: '+',
				    	segments: [
					      	{name: 'b*', role: 'toehold'},
					        {name: 'h', role: ''},
					        {name: 'i', role: ''},
				    	]
				    }]	
				},{
					name: 'm7',
					type: 'hairpin',
					structure: '.((..))..',
				    domains: [{
				    	name: 'A',
				    	role: 'input',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: 'toehold'},
					        {name: 'b', role: ''},
					        {name: 'c', role: ''},
				    	]
				    },{
				    	name: 'B',
				    	role: 'output',
				    	type: 'loop',
				    	polarity: '-',
				    	segments: [
					      	{name: 'd', },
					      	{name: 'e', },
					      	{name: 'c*', role: ''},
				    	]
				    },{
				    	name: 'C',
				    	role: 'bridge',
				    	type: 'stem',
				    	polarity: '+',
				    	segments: [
					      	{name: 'b*', role: 'toehold'},
							{name: 'e', role: ''},
					      	{name: 'f', role: ''},
				    	]
				    }]
				},{
					name: 'm8',
					type: 'hairpin',
					structure: '.((.))..',
				    domains: [{
				    	name: 'A',
				    	role: 'input',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: 'toehold'},
					        {name: 'b', role: ''},
					        {name: 'c', role: ''},
				    	]
				    },{
				    	name: 'B',
				    	role: 'bridge',
				    	type: 'loop',
				    	polarity: '+',
				    	segments: [
					      	{name: 'd', },
					      	{name: 'c*', role: ''},
				    	]
				    },{
				    	name: 'C',
				    	role: 'output',
				    	type: 'tail',
				    	polarity: '+',
				    	segments: [
					      	{name: 'b*', role: ''},
					      	{name: 'e', role: ''},
					      	{name: 'f', role: ''},
				    	]
				    }]
				},{
					name: 'm9',
					type: 'hairpin',
					structure: '.((.))',
				    domains: [{
				    	name: 'A',
				    	role: 'input',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: 'toehold'},
					        {name: 'b', role: ''},
					        {name: 'c', role: ''},
				    	]
				    },{
				    	name: 'B',
				    	role: 'bridge',
				    	type: 'loop',
				    	polarity: '+',
				    	segments: [
					      	{name: 'd', },
					      	{name: 'c*', role: ''},
				    	]
				    },{
				    	name: 'C',
				    	role: 'null',
				    	type: 'stem',
				    	polarity: '+',
				    	segments: [
					      	{name: 'b*', role: ''},
				    	]
				    }]
				},{	
					name: 'm1c',
					type: 'initiator',
				    isInitiator: true,
				    structure: '....',
				    domains: [{
				    	name: 'A',
				    	role: 'output',
				    	type: 'init',
				    	polarity: '+',
				    	segments: [
					      	{name: 'a', role: ''},
					        {name: 'w', role: 'clamp'},
					        {name: 'b', role: ''},
					        {name: 'x', role: 'clamp'},
				    	]
				    }]
				  }, {
					name: 'm19c',
					type: 'hairpin',
					structure: '.(((..)))',
					// domains: 'A[a:t w:c b x:c]+ B[y:c c x*:c b* w*:c]-'
					domains: [{
				    	name: 'A',
				    	role: 'input',
				      	polarity: '+',
				    	segments:  [
				      		{name: 'a', role: 'toehold'},
					      	{name: 'w', role: 'clamp'},
					        {name: 'b', },
					      	{name: 'x', role: 'clamp'},
				    	]
				   },{
					   name: 'B',
					   role: 'output',
					   polarity: '-',
					   segments: [
						   {name: 'y', role: 'clamp'},
						   {name: 'c', },
						   {name: 'x*', role: 'clamp'},
						   {name: 'b*', role: 'toehold'},
						   {name: 'w*', role: 'clamp'},
					   ]
				   }]
				},{
					"name":"m20",
					"type":"hairpin",
					"structure":".(((....)))..",
					"domains":"A[a:t x:c b c]i+ s[s(1)]x B[d e y:c c*:t]o- C[b*:t x*:c f g]o+"
				},{
					"name":"m21",
					"type":"hairpin",
					"structure":".(((...))).",
					"domains":"A[a:t x:c b c]i+ s[s(1)]x B[d(16) y:c c*:t]o- C[b*:t x*:c e(16)]o+"
				},{
					"name":"m22",
					"type":"cooperative",
					"structure":".(((((.+)))))",
					"strands":[{
						"name":"S1",
						"domains":"A[a:t x:c b(16)]i+ s[s(1)]x B[c(16) y:c d:t]i-"
					},{
						"name":"S2",
						"domains":"C[y*:c c*(16) s*(1) b*(16) x*:c]x"
					}]
				},{
					"name":"m23",
					"type":"initiator",
					"structure":"....",
					"domains":"A[a x:c b c]o+"
				},{
					"name":"m24",
					"type":"cooperative",
					"structure":".(((((((((((.+)))))))))))",
					"strands":[{
						"name":"S1",
						"domains":"A[a:t x:c b c]i+ s[s(1)]x B[d y:c e f]i- C[g z:c h i:t]i+"
					},{
						"name":"S2",
						"domains":"D[h* z*:c g*]x E[f* e* y*:c d*]x F[s*(1) c* b* x*:c]x"
					}]
				},{
					"name":"m25",
					"type":"initiator",
					"structure":"........",
					"domains":"A[a x:c b y:c]o+ B[z:c c w:c d]o-"
				},{
					"name":"m26",
					"type":"cooperative",
					"structure":".(((((((.+)))))))",
					"strands":[{
						"name":"S1",
						"domains":"A[a:t x:c b y:c]i+ s[s(1)]x B[z:c c w:c d]i-"
					},{
						"name":"S2",
						"domains":"C[w* c* z* s*(1) y* b* x*]x"
					}]
				},{
					name: 'm27',
					type: 'hairpin',
					structure: '.(...)',
				    domains: 'A[a b]i+ B[c d]o- C[e b*]o-'
				},{
					name: 'm27c',
					type: 'hairpin',
					structure: '.(((..)))',
					domains: 'A[a:t v:c b w:c]i+ B[x:c c y:c d]o- C[z:c e w*:c b* v*:c]o-'
				},
			],
			
			// Version 1
			[{
				"name": "m0",
				"type": "input",
				//"domains": "A[a:t x:c b d]o+",
				"domains": "A[c b x:c a:t]o-",
				"structure": "....",
				"description": "Initiator",
				"isInitiator": true
			},{
				"name": "m1",
				"type":"hairpin",
				"domains":"A[a:t x:c b c]i+ B[d e y:c c*:t]o- C[b* x*:c]x",
				"structure": ".(((...)))",
				"description": "1 input/1 output hairpin"
			},{
				"name": "m2",
				"type":"hairpin",
				"domains":"A[a:t x:c b c]i+ B[d e y:c c*:t]o- C[b*:t x*:c f g]o+",
				"structure": ".(((...)))..",
				"description": "1 input/2 output hairpin"
			},
			// {
			// 	name: "m2a",
			// 	type:"hairpin",
			// 	domains:"A[a:t x:c b c]i+ B[d e y:c c*:t]o- C[b*:t x*:c f(16)]o+",
			// 	structure: ".(((...))).",
			// 	description: "1 input/2 output hairpin (long tail)"
			// },
			{
				"name": "m3",
				"type":"hairpin",
				"domains":"A[a:t x:c b c]i+ B[d]b C[c* b* x*:c]x",
				"structure": ".(((.)))",
				"description": "1 input/1 bridge hairpin"
			},{
				"name": "m4",
				"type":"hairpin",
				"domains":"A[a:t x:c b c]i+ B[d]b C[e f y c*:t]o- D[b* x*:c]x",
				"structure": ".(((....)))",
				"description": "1 input/1 bridge/1 output hairpin"
			},{
				"name": "m5",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d e y:c c*:t]o- C[b*]b D[x*:c]x",
				"structure": ".(((...)))",
				"description": "1 input/1 output/1 bridge hairpin"
			},{
				"name": "m6",
				"type": "cooperative",
				"structure":".(((((((.+)))))))",
				"strands":[{
					"name":"S1",
					"domains":"A[a:t x:c b c]i+ s[s(1)]x B[d e y:c f:t]i-"
				},{
					"name":"S2",
					"domains":"C[y*:c e* d* s*(1) c* b* x*:c]x"
				}],
				"description":"2-input cooperative complex"
			},
			// {
			// 	name: "m6b",
			// 	type: "cooperative",
			// 	"structure":".(((((.+)))))",
			// 	"strands":[{
			// 		"name":"S1",
			// 		"domains":"A[a:t x:c b(16)]i+ s[s(1)]x B[c(16) y:c d:t]i-"
			// 	},{
			// 		"name":"S2",
			// 		"domains":"C[y*:c c*(16) s*(1) b*(16) x*:c]x"
			// 	}]
			// },
			{
				"name": "m7a",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d e y:c]x C[f g z:c h:t]o- D[f*:t y*:c e* d*]i+ E[b* x*:c]x",
				"structure": ".((.((((...))))))",
				"description": "2 input/1 output sequential AND gate"
			},{
				"name": "m7b",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d y:c e]x C[f g z:c h:t]o- D[f* e* y*:c d*:t]i- E[b* x*:c]x",
				"structure": ".((.((((...))))))",
				"description": "2 input/1 output sequential AND gate"
			},{
				"name": "m7c",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d e y:c]x C[f:t z:c g h]o+ D[f*:t y*:c e* d*]i+ E[b* x*:c]x",
				"structure": ".((.((((...))))))",
				"description": "2 input/1 output sequential AND gate"
			},{
				"name": "m7d",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d y:c e]x C[f:t z:c g h]o+ D[f* e* y*:c d*:t]i- E[b* x*:c]x",
				"structure": ".((.((((...))))))",
				"description": "2 input/1 output sequential AND gate"
			},{
				"name": "m8a",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d:t y:c e f]i+ C[g h z:c f*:t]o- D[e* y*:c c* b* x*:c]x",
				"structure": ".(((.(((...))))))",			
				"description": "2 input/1 output sequential AND gate"

			},{
				"name": "m8b",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d e y:c f:t]i- C[g h z:c f*:t]o- D[y*:c e* c* b* x*:c]x",
				"structure": ".(((.(((...))))))",
				"description": "2 input/1 output sequential AND gate"
			},{
				"name": "m8c",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d:t y:c e f]i+ C[g:t z:c h f*]o+ D[e* y*:c c* b* x*:c]x",
				"structure": ".(((.(((...))))))",
				"description": "2 input/1 output sequential AND gate"
			},{
				"name": "m8d",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d e y:c f:t]i- C[g:t z:c h f*]o+ D[y*:c e* c* b* x*:c]x",
				"structure": ".(((.(((...))))))",
				"description": "2 input/1 output sequential AND gate"
			},
			// Doesn't make sense; footprints would have to be backwards
			// {
			// 	name: "m9a",
			// 	type: "hairpin",
			// 	domains: "A[a b x:c c]i- B[d e y:c d*]o- C[c* x*:c f g]i+",
			// 	structure: "..(((..)))..",
			// 	description: "2 input/1 output OR gate",
			// },{
			// 	name: "m9b",
			// 	type: "hairpin",
			// 	domains: "A[a b x:c c]i- B[d y:c e d*]o+ C[c* x*:c f g]i+",
			// 	structure: "..(((..)))..",
			// 	description: "2 input/1 output OR gate",
			// },
			{
				"name": "m9a",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d e y:c d*:t]o- C[c* b* x*:c f:t]i-",
				"structure": ".((((..)))).",
				"description": "2 input/1 output OR gate",
			},{
				"name": "m9b",
				"type": "hairpin",
				"domains": "A[a:t x:c b c]i+ B[d:t y:c e d*]o+ C[c* b* x*:c f:t]i-",
				"structure": ".((((..)))).",
				"description": "2 input/1 output OR gate",
			}]
		];

		/**
		 * @property {Number} standardMotifsCurrentVersion
		 * Version number of the current standard library of motifs.
		 */
		var standardMotifsCurrentVersion = standardMotifsVersions.length-1,
			standardMotifs;
	
		standardMotifsVersions = _.map(standardMotifsVersions,function(motifs) {
			return _.reduce(motifs,function(memo,motif) {
				memo[motif.name] = motif;
				return memo; 
			},{});
		});

		/**
		 * @property {Object} standardMotifs
		 * Object containing the current {@link #standardMotifsCurrentVersion version} 
		 * of the {@link #standardMotifsVersions library of standard motifs}. This is a
		 * Hash containing configuration objects for each of the standard motifs, indexed by name.
		 */
		standardMotifs = standardMotifsVersions[standardMotifsCurrentVersion]
		// standardMotifs = _.reduce(standardMotifsVersions[standardMotifsCurrentVersion],function(memo,motif) {
		// 	memo[motif.name] = motif;
		// 	return memo; 
		// },{});
		
		var domainColors = {
			'init' : '#553300',
			'input' : 'orange', // '#ffa500',
			'output' : '#33ccff',
			'output.init' : '#8C6239', //'#553300', // init (brown)
			'output.loop' : '#33ccff', // blue
			'output.tail' : '#66ff33', // green
			'bridge' : '#ff1177',
			'bridge.loop' : '#ff1177', // pink
			'bridge.stem' : '#9900cc',
		}
		
		/**
		 * Returns a configuration object for the `type` of object indicated
		 * with the given name. This is used primarily to import 
		 * {@link App.dynamic.Motif motif} configuration objects from the 
		 * {@link #standardMotifsVersions standard motifs library}.
		 * @param  {'motif'} type The type of object to import
		 * @param  {String} name The name of the object (e.g. the motif) to import
		 * @param  {Number} version Version of the {@link #standardMotifsVersions standard motifs library} to use.
		 * @return {Object} configuration object for the requested type.
		 */
		function importObject(type,name,version) {
			switch(type) {
				case 'motif': 
					var standardMotifs = Compiler.standardMotifsVersions[version] || Compiler.standardMotifs; 

					if(standardMotifs[name]) {
						return standardMotifs[name];
					} else if (standardMotifs['m'+name]) {
						return standardMotifs['m'+name];
					} else {
						throw new DynamlError({
							type: 'undefined motif',
							name: name,
							message: "Couldn't find imported motif '<%= name %>'"
						});
					}
					// TODO: import from external files
			}
		}
		
		/**
		 * Returns the appropriate color for a particular {@link App.dynamic.Domain domain object}
		 * @param  {App.dynamic.Domain} domain
		 * @return {String} a CSS color
		 */
		function getColor (domain) {
			if(domain.role && domain.type) {
				return domainColors[[domain.role, domain.type].join('.')];
			}
			return domainColors[domain.role] || '#000';
		}
		
		return {
			compile: compile,
			compileLibrary: compileLibrary,
			parse: parse,
			printStrands: printStrands, 
			printStrandsFromArray: printStrandsFromArray,
			importObject : importObject,
			
			standardMotifs : standardMotifs,
			standardMotifsVersions: standardMotifsVersions,
			standardMotifsCurrentVersion: standardMotifsCurrentVersion,

			domainColors: domainColors,
			getColor : getColor,
			expandRole: expandRole,
			parseDomainString: parseDomainString,
			parseDomainsString: parseDomainString,
			parseSegmentString: parseSegmentString,
			parseSegmentsString: parseSegmentString,
			parseDomainOrSegmentString: parseDomainOrSegmentString,

			printDomainString: printDomainString,
			printStrandString : printStrandString,
			printSegmentString : printSegmentString,
		}

	})();

	return {
		Node : Node,
		Motif : Motif,
		Strand : Strand,
		Domain : Domain,
		Segment : Segment,
		Library : Library,
		Compiler : Compiler,
		DynamlError : DynamlError, 
		Structure : Structure,
	}

})(_,DNA);
