/**
 * Manages serializing a graphical nodal system to DyNAML or TerseML and then
 * compiling to domains with either engine
 */
Ext.define("Workspace.objects.dna.BuildManager", {
	extend : 'Workspace.objects.Object',
	errorClsName: 'dynaml-error-message',
	statics: {
		dynaml: {
			domainProperties: ['name', 'identity','role',],
			nodeProperties: ['name','motif',],
		},
	},
	constructor : function() {
		this.callParent(arguments);
		this.workspace.buildManager = this;
		this.nodes = [];
		this.workspace.on('create',this.onCreate,this);
		this.addEvents('needsrebuild','beforerebuild','rebuild','error');
		
		this.on('needsrebuild',this.buildRealtime,this,{
			buffer: 1000
		});
		
	},
	// render: function() {
		// this.errorEl = Ext.get(Ext.core.DomHelper.append(this.workspace.getContainerEl(),{
	        // cls: this.errorClsName,
	    // }));
	    // this.errorEl.hide();
	// },
	// showError: function(message) {
		// this.errorEl.alignTo(this.workspace.getEl(),'tl-tl');
		// var size = this.workspace.getVisibleSize();
		// this.errorEl.setWidth(size.width);
		// this.errorEl.update(message);
		// this.errorEl.slideIn('t', {duration: 300, easing:'easeOut'});
	// },
	onCreate: function(obj) {
		if(obj && obj.isWType('Workspace.objects.dna.Node')) {
			this.nodes.push(obj);
			_.each(Workspace.objects.dna.BuildManager.dynaml.nodeProperties,function(prop) {
				obj.on('change:'+prop,this.needsRebuild,this);
			},this);
			this.needsRebuild();
		} else if (obj.isWType('Workspace.objects.dna.Complementarity')){
			this.needsRebuild();
		}
	},
	needsRebuild: function() {
		this.fireEvent('needsrebuild');
	},
	buildRealtime: function() {
		var dynaml = this.serializeDynaml();
		this.lastDynaml = dynaml;
			
		/**
		 * @event beforerebuild
		 * Fires before a rebuild occurs
		 * @param {Workspace.objects.dna.BuildManager} buildManager
		 * @param {Object} dynaml
		 */
		this.fireEvent('beforerebuild',this,dynaml);
		var lib;
		try {			
			lib = App.dynamic.Compiler.compileLibrary(dynaml);
			this.lastLibrary = lib;
			/**
			 * @event rebuild
			 * Fires upon successful rebuild of a system
			 * @param {Workspace.objects.dna.BuildManager} buildManager
			 * @param {App.dynamic.Library} library
			 */
			this.fireEvent('rebuild',this,lib);
		} catch(e) {
			if(e.nodes) {
				_.each(e.nodes,function(node) {
					var workspaceNode = this.findWorkspaceObject('node',node);
					if(workspaceNode) {
						workspaceNode.highlightError();
					} 
				},this);
			}
			if(e.ports) {
				_.each(e.ports,function(port) {
					var workspacePort = this.findWorkspaceObject('port',port);
					if(workspacePort) {
						workspacePort.highlightError();
					}
				},this);
			}
			//this.showError(e.message);
			/**
			 * @event error
			 * Fires upon an error during a real-time build
			 * @param {String} msg
			 * @param {App.dynamic.DynamlError} e
			 */
			this.fireEvent('error',e.message,e);
			this.lastError = e;
		}
		
	},
	/**
	 * Attempts to locate an {@link Workspace.object.Object object} in the 
	 * {@link #workspace workspace} corresponding to a name, config object, or
	 * DyNAML object
	 * @param {String} type Kind of object for which to search; one of: `node`, `port`, or `connection`
	 * @param {App.dynamic.Node/App.dynamic.Domain/App.dynamic.Connection/Object/String} handle One of these many data type which could be used to identify a DyNAML object 
	 */
	findWorkspaceObject: function(type,obj) {
		switch (type) {
			case 'node':
				var name;
				if(obj instanceof App.dynamic.Node) {
					name = obj.getName();
				} else if (_.isObject(obj) && obj.name) {
					name = obj.name;
				} else if (_.isString(obj)) {
					name = obj;
				}
				
				return this.workspace.findObjectBy(function(obj) {
					return obj.isWType('Workspace.objects.dna.Node') && (obj.get('name') == name);
				});
			case 'port':
				return false;
				var name, node;
				if(obj instanceof App.dynamic.Domain) {
					name = obj.getName();
				} else if (_.isObject(obj) && obj.name) {
					name = obj.name;
				} else if (_.isString(obj)) {
					name = obj;
				}
		}
	},
	getRealtime: function(type,name,property) {
		if(this.lastLibrary) {
			
		switch (type) {
			case 'strand':
				var strand = this.lastLibrary.getStrand(name);
				switch (property) {
					case 'this':
						return strand;
					case 'domains':
						return strand.getDomains();
					case 'polarity':
						return strand.getPolarity();
					case 'absolutePolarity': 
						return strand.getAbsolutePolarity();
					case 'dynaml':
						return (this.lastDynaml && this.lastDynaml.strands) ? _.find(this.lastDynaml.nodes,function(x) { return x.name == name }) : false
						break;
					default:
						return strand[property]; 
				}
				break;
			case 'node':
				var node = this.lastLibrary.getNode(name);
				switch (property) {
					case 'this':
						return node;
					case 'domains':
						return node.getDomains();
					case 'strands':
						return node.getStrands();
					case 'polarity':
						return node.getPolarity();
					case 'dynaml':
						return (this.lastDynaml && this.lastDynaml.nodes) ? _.find(this.lastDynaml.nodes,function(x) { return x.name == name }) : false
						break;
					default:
						return node[property]; 
				}
				break;
			case 'motif':
				var motif = this.lastLibrary.getMotif(name);
				switch (property) {
					case 'this':
						return motif;
					
					case 'dynaml':
						return (this.lastDynaml && this.lastDynaml.motifs) ? _.find(this.lastDynaml.motifs,function(x) { return x.name == name }) : false
						break;
					default:
						return node[property]; 
				}
				break;
		}
		} else { return null; }
	},
	nodeIndex: 0,
	getNextNodeName: function() {
		var nextName;
		do {
			this.nodeIndex++;
			nextName = "n"+this.nodeIndex;
		} while(!!this.workspace.findObjectBy(function(obj) { return obj.get('name') == nextName; }));
		return nextName;
	},
	motifIndex: 0,
	getNextMotifName: function() {
		var nextName;
		do {
			this.motifIndex++;
			nextName = "m"+this.motifIndex;
		} while(!!this.workspace.findObjectBy(function(obj) { return obj.get('name') == nextName; }));
		return nextName;
	},
	buildDynaml: function(objects) {
		var workspace = this.workspace;
		var imports = [], nodes = [], motifs = [], complements = {}, nodeNameMap = {};

		_.each(objects,function(obj) {
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
			} else if(obj.isWType('Workspace.objects.dna.Motif')) {
				motifs.push(obj);
			}
		});
		
		// Build a hash mapping motif names to Workspace.objects.dna.Motif objects
		var motifMap = _.reduce(motifs,function(memo,motif) {
			memo[motif.get('name')] = motif; return memo;
		},{});
		
		// Remove motifs which we've defined in the workspace
		imports = _.chain(imports).uniq().filter(function(name) {
			return !motifMap[name];
		}).map(function(name) {
			// Convert to the type of import objects accepted by DyNAMiC
			return {
				type : 'motif',
				name : name
			};
		}).value();
		
		// Build DyNAML objects for motifs
		motifs = _.map(motifs,function(motif) {
			if(motif.get('nodes')) {
				var lib = this.buildDynaml(motif.get('nodes'));
			} else if(motif.get('dynaml')) {
				
			}
		},this);
		
		// Build DyNAML objects for nodes
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
					if(child.isWType('Workspace.objects.dna.InputPort') || 
						child.isWType('Workspace.objects.dna.OutputPort') || 
						child.isWType('Workspace.objects.dna.BridgePort')) {
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
	serializeDynaml : function() {
		return this.buildDynaml(this.workspace.getRootObjects());
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