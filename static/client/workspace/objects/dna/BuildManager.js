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
			nodeProperties: ['name','motif','polarity'],
			motifProperties: ['name','dynaml'],
		},
	},
	constructor : function() {
		this.callParent(arguments);
		this.workspace.buildManager = this;
		this.nodes = [];
		this.workspace.on('create',this.onCreate,this);
		this.workspace.on('destroy',this.onDestroy,this);
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
		if(!obj) return;
		if(obj.isWType('Workspace.objects.dna.Node')) {
			this.nodes.push(obj);
			_.each(Workspace.objects.dna.BuildManager.dynaml.nodeProperties,function(prop) {
				obj.on('change:'+prop,this.needsRebuild,this);
			},this);
			this.needsRebuild();
		} else if (obj.isWType('Workspace.objects.dna.Complementarity')){
			this.needsRebuild();
		} else if (obj.isWType('Workspace.objects.dna.Motif')) {
			this.needsRebuild();
			
			_.each(Workspace.objects.dna.BuildManager.dynaml.motifProperties,function(prop) {
				obj.on('change:'+prop,this.needsRebuild,this);
			},this);
		}
	},
	onDestroy: function(obj) {
		if(!obj) return;
		if(obj.isWType('Workspace.objects.dna.Node')) {
			this.nodes = _.without(this.nodes,obj);

			_.each(Workspace.objects.dna.BuildManager.dynaml.nodeProperties,function(prop) {
				obj.un('change:'+prop,this.needsRebuild,this);
			},this);
			this.needsRebuild();
		} else if (obj.isWType('Workspace.objects.dna.Complementarity')){
			this.needsRebuild();
		} else if (obj.isWType('Workspace.objects.dna.Motif')) {
			this.needsRebuild();
			
			_.each(Workspace.objects.dna.BuildManager.dynaml.motifProperties,function(prop) {
				obj.un('change:'+prop,this.needsRebuild,this);
			},this);
		}
	},
	needsRebuild: function() {
		this.fireEvent('needsrebuild');
	},
	buildRealtime: function() {
		try {			
			
		var dynaml = this.serializeDynaml();
		this.lastDynaml = JSON.parse(JSON.stringify(dynaml));
		
			
		/**
		 * @event beforerebuild
		 * Fires before a rebuild occurs
		 * @param {Workspace.objects.dna.BuildManager} buildManager
		 * @param {Object} dynaml
		 */
		this.fireEvent('beforerebuild',this,dynaml);
		var lib;
			lib = App.dynamic.Compiler.compileLibrary(dynaml);
			this.lastLibrary = lib;
			/**
			 * @event rebuild
			 * Fires upon successful rebuild of a system
			 * @param {Workspace.objects.dna.BuildManager} buildManager
			 * @param {App.dynamic.Library} library
			 */
			this.fireEvent('rebuild',this,lib);
			
			// Match custom motifs in the DyNAML to their corresponding objects in the library
			var customMotifs = _.chain(dynaml.motifs || []).map(function(motif) {
				return _.find(lib.motifs, function(m) { return m.name == motif.name });
			}).compact().value();
			
			// Sync new custom motifs with the store
			this.syncCustomMotifStore(customMotifs);
			
			// Hide error proxies
			_.each(this.workspace.getAllObjects(),function(obj) {
				if(obj.isWType('Workspace.objects.dna.Node')) {
					obj.hideError();
				}
			})
			
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
	 * Synchronizes #customMotifStore with the passed array of 
	 * {@link App.dynamic.Motif motifs}. If there are new motifs `motifs`, but 
	 * not in #customMotifStore, they are added. If there are motifs in 
	 * `motifs` with corresponding names in #customMotifStore, they are updated
	 * in the store. 
	 * @param {App.dynamic.Motif[]} motifs
	 */
	syncCustomMotifStore: function(motifs, clobber) {
		clobber = clobber || false;
		_.each(motifs,function(motif) {
			var rec = this.customMotifStore.findRecord('number',motif.getName());
			if(rec) {
				rec.set('spec',motif);
			} else {
				this.customMotifStore.add({
					number: motif.getName(),
					spec: motif
				})
			}
		},this);
	},
	
	/**
	 * Attempts to locate an {@link Workspace.object.Object object} in the 
	 * {@link #workspace workspace} corresponding to a name, config object, or
	 * DyNAML object
	 * @param {String} type Kind of object for which to search; one of: `node`, `port`, or `connection`
	 * @param {App.dynamic.Node/App.dynamic.Domain/App.dynamic.Connection/Object/String} handle One of these many data type which could be used to identify a DyNAML object 
	 * @return {Mixed} workspaceObject The Workspace.objects.Object representing `handle`, or `null` if none was found. 
	 */
	findWorkspaceObject: function(type,obj) {
		var name;
		if(obj && obj.getName) {
			name = obj.getName();
		} else if (_.isObject(obj) && obj.name) {
			name = obj.name;
		} else if (_.isString(obj)) {
			name = obj;
		}
		
		if(name) {	
			switch (type) {
				case 'node':		
					return this.workspace.findObjectBy(function(obj) {
						return obj.isWType('Workspace.objects.dna.Node') && (obj.get('name') == name);
					});
				case 'connection':
					return null
				case 'port':
					return false;
				case 'motif':
					return this.workspace.findObjectBy(function(obj) {
						return obj.isWType('Workspace.objects.dna.Motif') && (obj.get('name') == name);
					});
			}		
		} else { 
			return null; 
		}
	},
	getRealtime: function(type,name,property) {
		if(this.lastLibrary) {
			
		switch (type) {
			case 'strand':
				var strand = this.lastLibrary.getStrand(name);
				if(!strand) return null;
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
				if(!node) return null;
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
				if(!motif) return null;
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
	/**
	 * Returns the next unique node name
	 */
	getNextNodeName: function() {
		var nextName;
		do {
			this.nodeIndex++;
			nextName = "n"+this.nodeIndex;
		} while(!!this.workspace.findObjectBy(function(obj) { return obj.get('name') == nextName; }));
		return nextName;
	},
	motifIndex: 0,
	/**
	 * Returns the next unique motif name
	 */
	getNextMotifName: function() {
		var nextName;
		do {
			this.motifIndex++;
			nextName = "c"+this.motifIndex;
		} while(!!this.workspace.findObjectBy(function(obj) { return obj.get('name') == nextName; }));
		return nextName;
	},
	/**
	 * Build a DyNAML library for a collection of {@link Workspace.objects.Object objects};
	 * these should generally be a mix of {@link Workspace.objects.dna.Node nodes},
	 * {@link Workspace.objects.dna.Motif motifs}, and {@link Workspace.objects.dna.Complementarity complements}.
	 * 
	 * @param {Workspace.objects.dna.Node[]/Workspace.objects.dna.Motif[]/Workspace.objects.dna.Complementarity[]} objects
	 * 
	 * @param {Boolean} [fromMotif=false] 
	 * True if we're compiling a library from children of a motif and should therefore look for {@link Workspace.objects.dna.NodePort#exposure exposure} properties
	 */
	buildDynaml: function(objects,fromMotif) {
		var workspace = this.workspace;
		var imports = [], nodes = [], motifs = [], complements = {}, nodeNameMap = {}, motifMap = {};
		fromMotif = fromMotif || false;

		// Sort through passed-in objects, picking out the interesting ones:
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
				
				// Build a hash mapping motif names to Workspace.objects.dna.Motif objects
				motifMap[obj.get('name')] = obj;
				motifs.push(obj);
				
			} 
			/*
			else if(fromMotif && obj.isWType(['Workspace.objects.dna.InputPort',
				'Workspace.objects.dna.OutputPort',
				'Workspace.objects.dna.BridgePort',
			])) {
				
			}
			*/
		});
		
		
		
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
		motifs = _.chain(motifs).map(function(motif) {
			var nodes = motif.get('nodes');
			if(nodes && nodes.length > 0) {
				var lib = this.buildDynaml(motif.getChildren(),true);
				return _.reduce(Workspace.objects.dna.BuildManager.dynaml.motifProperties, function(memo, property) {
					if(motif.has(property)) {
						memo[property] = motif.get(property);
					}
					return memo;					
				},lib);
			} else if(motif.get('dynaml')) {
				var dyn;
				try {				
					dyn = jsonlint.parse(motif.get('dynaml'));
				} catch (e) {
					throw { message: ["In motif",motif.get('name'),":\n",e.message].join(' ')}
				}
				return _.reduce(Workspace.objects.dna.BuildManager.dynaml.motifProperties, function(memo, property) {
					if(motif.has(property)) {
						memo[property] = motif.get(property);
					}
					return memo;					
				},dyn);
			}
		},this).compact().value();
		
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
					// This is a bit cryptic; allow me to elucidate:
					
					// Match port objects
					if(child.isWType(['Workspace.objects.dna.InputPort',
						'Workspace.objects.dna.OutputPort',
						'Workspace.objects.dna.BridgePort'])) {
						
						// Iterate across the array of properties in the static member #dynaml.domainProperties
						// Check if the child has each one, if so, put it in the dynaml
						return _.reduce(Workspace.objects.dna.BuildManager.dynaml.domainProperties, function(memo, property) {
							if(child.has(property)) {
								memo[property] = child.get(property);
							}
							return memo;
							
						// Base case of _.reduce: a few properties which have defaults or are added conditionally:
						},{
							// If the child doesn't have a name, generate one.
							name : child.get('name') || 'p' + i,
							
							// If we're making dynaml from children of a motif, this domain may be "exposed"
							// outside the motif with an "exposure" property linking it to *another*
							// Workspace.objects.dna.NodePort object. We pull properties from that object
							// to put in the dynaml
							expose: fromMotif ? (function(exposed) { 
								return exposed ? {
									role: exposed.get('role'),
									name: exposed.get('name')
								} : null;
							})(child.get('exposure')) : null
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
			motifs: motifs,
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
	buildMotif: function(spec,x,y) {
		//var spec = Workspace.objects.dna.Motifs[name], node;
		var node,name;
		//spec.serialize();
		if(spec) {
			spec = spec.serialize(); 
			spec.library = App.dynamic.Library.dummy(); 
			spec = new App.dynamic.Motif(spec);
			name = spec.name;
			//spec.serialize();
			node = this.workspace.createObject({
				wtype: 'Workspace.objects.dna.Node',
				x: x,
				y: y,
				motif: name,
				// dynaml: spec,
			});
			node.suspendLayout = true;
			_.each(spec.getDomains(), function(dom,i) {
				var port = _.clone(dom); 
				var cfg = {};
				if(_.isObject(port) && Workspace.objects.dna.PortClasses[port.role]) {
					cfg.name = port.name;//'p'+(i+1);
					cfg.wtype = Workspace.objects.dna.PortClasses[port.role];
					cfg.stroke = App.dynamic.Compiler.getColor(port);
					cfg.segments = port.segments;
					//cfg.identity = port.name;
					// cfg.dynaml = port;
					cfg.role = port.role;
					node.adopt(this.buildPort(cfg));
				}
			},this);
			node.suspendLayout = false;
			node.doLayout();
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