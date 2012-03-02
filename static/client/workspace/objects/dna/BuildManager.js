/**
 * Manages serializing a graphical nodal system to DyNAML or TerseML and then
 * compiling to domains with either engine
 */
Ext.define("Workspace.objects.dna.BuildManager", {
	extend : 'Workspace.objects.Object',
	statics: {
		dynaml: {
			domainProperties: ['name', 'identity','role',],
			nodeProperties: ['name','motif',],
		},
	},
	constructor : function() {
		this.callParent(arguments);
		this.workspace.buildManager = this;
	},
	nodeIndex: 0,
	getNextNodeName: function() {
		this.nodeIndex++;
		return "n"+this.nodeIndex;
	},
	serializeDynaml : function() {
		var workspace = this.workspace;
		var imports = [], nodes = [], complements = {}, nodeNameMap = {};

		workspace.objects.each(function(obj) {
			if(obj.isWType('Workspace.objects.dna.Node')) {
				nodeNameMap[obj.get('name')] = obj;
				nodes.push(obj);

				if(obj.get('motif')) {
					imports.push(obj.get('motif'));
				}
			} else if(obj.isWType('Workspace.objects.dna.Complementarity')) {
				var leftPort = obj.get('leftObject'), leftNode, leftNodeId;
				if(leftPort) {
					leftNode = leftPort.getParent();
				} else {
					return;
				}
				if(leftNode) {
					leftNodeId = leftNode.getId();
				} else {
					return;
				}
				if(!complements[leftNodeId])
					complements[leftNodeId] = [];

				complements[leftNodeId].push(obj);
			}
		});
		imports = _.chain(imports).uniq().map(function(name) {
			return {
				type : 'motif',
				name : name
			};
		}).value();
		nodes = _.map(nodes, function(node) {
			var polarity = node.get('polarity');
			return {
				name : node.get('name'),
				motif : node.get('motif'),
				polarity : (isNaN(polarity) ? 0 : polarity),
				complementarities : _.map(complements[node.getId()] || [], function(complement) {
					return {
						source : complement.get('leftObject').get('name'),
						target : complement.get('rightObject').get('name'),
						node : complement.get('rightObject').get('parent').get('name')
					};
				}),
				domains : _.map(node.getChildren(), function(child, i) {
					if(child.isWType('Workspace.objects.dna.InputPort') || child.isWType('Workspace.objects.dna.OutputPort') || child.isWType('Workspace.objects.dna.BridgePort')) {
						return _.extend(_.reduce(Workspace.objects.dna.BuildManager.dynaml.domainProperties, function(memo, property) {
							if(child.has(property)) {
								memo[property] = child.get(property);
							}
							return memo;
						}, {}), {
							name : child.get('name') || 'p' + i
						});
					}
					// if(child.isWType('Workspace.objects.dna.InputPort')) {
					// return {
					// name : child.get('name') || 'p'+i,
					// identity : child.get('identity')
					// }
					// } else if(child.isWType('Workspace.objects.dna.OutputPort')) {
					// return {
					// name : child.get('name') || 'p'+i,
					// identity : child.get('identity')
					// }
					// } else if(child.isWType('Workspace.objects.dna.BridgePort')) {
					// return {
					// name : child.get('name') || 'p'+i,
					// identity : child.get('identity')
					// }
					// }
				})
			};
		});
		return {
			'import' : imports,
			nodes : nodes,
		}
	},
	serializeTerse : function() {
		var workspace = this.workspace;
		var nodes = [], complementarities = [], indexMap = {}, i = 1, out = [];
		workspace.objects.each(function(obj) {
			if(obj.isWType('Workspace.objects.dna.Node')) {
				indexMap[obj.getId()] = i;
				i++;

				nodes.push(obj);
			} else if(obj.isWType('Workspace.objects.dna.Complementarity')) {
				complementarities.push(obj);
			}
		});
		out.push(nodes.length.toString());

		var untitledCount = 0;
		Ext.each(nodes, function(obj) {
			var motif = obj.get('motif');
			if(isNaN(parseInt(motif))) {
				motif = parseInt(_.first(motif.match(/\d+/g)));
			} else {
				motif = parseInt(motif);
			}
			var row = [obj.get('name').replace(/\s/g, '_') || ("Untitled_" + (++untitledCount)), motif], complementaryPort, complementaryNode;
			obj.children.each(function(port) {
				if(port.isWType('Workspace.objects.dna.OutputPort') || port.isWType('Workspace.objects.dna.BridgePort')) {
					if(port.get('complementarity')) {
						complementaryPort = port.get('complementarity');
						if(complementaryPort.hasParent()) {
							complementaryNode = complementaryPort.get('parent');
							if(complementaryNode) {
								row.push(indexMap[complementaryNode.getId()]);
								return true;
							}
						}
					}
					row.push('0');
				}
			});
			out.push(row.join(' '));
		});
		return out.join('\n');
	},
	
	/**
	 * Builds a node of the given motif type at the provided coordinates
	 * @param {String} type The name of the motif in Workspace.objects.dna.Motifs
	 * @param {Number} x
	 * @param {Number} y
	 * @returns {Workspace.objects.dna.Node} node
	 */
	buildMotif: function(name,x,y) {
		var spec = Workspace.objects.dna.Motifs[name], node;
		spec.serialize();
		if(spec) {
			spec = new App.dynamic.Motif(spec);
			spec.serialize();
			node = this.workspace.createObject({
				wtype: 'Workspace.objects.dna.Node',
				x: x,
				y: y,
				motif: name,
				// dynaml: spec,
			});
			_.each(spec.getDomains(), function(dom,i) {
				var port = _.clone(dom); 
				var cfg = {};
				if(_.isObject(port)) {
					cfg.name = port.name;//'p'+(i+1);
					//cfg.identity = port.name;
					cfg.wtype = Workspace.objects.dna.PortClasses[port.role];
					cfg.stroke = App.dynamic.Compiler.getColor(port);
					cfg.segments = port.segments;
					// cfg.dynaml = port;
					cfg.role = port.role;
				}
				node.adopt(this.buildPort(cfg));
			},this);
		}
		return node;
	},
	/**
	 * Constructs a {@link Workspace.objects.nodal.NodePort port}
	 * @param {String/Object} config String name of a port class in Workspace.objects.dna.Ports or configuration object for a Workspace.objects.nodal.NodePort. 
	 */
	buildPort: function(config) {
		config || (config = {});
		if(_.isString(config)) {
			return this.workspace.createObject(Workspace.objects.dna.Ports[config]);
		} else {
			if(!config.name) {
				
			}
			return this.workspace.createObject(config);
		}
	}
	
}, function() {
	Workspace.reg('Workspace.objects.dna.BuildManager', Workspace.objects.dna.BuildManager);
})