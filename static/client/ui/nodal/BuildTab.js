Ext.define('App.ui.nodal.BuildTab', {
	extend: 'App.ui.ToolsTab',
	alias: 'widget.nodal-buildtab',
	generateConfig: function() {
		return {
			dockedItems: [{
				xtype: 'toolbar',
				items:[{
					// 'Implementation' group
					xtype: 'buttongroup',
					title: 'Implementation',
					columns: 2,
					defaults: {
						// cellCls: 'table-cell-padded',
					},
					items: [{
						iconCls: 'build-24',
						text: 'Compile',
						rowspan: 2,
						iconAlign: 'top',
						scale: 'medium',
						// handler: function() {
						// var action = new Workspace.tools.nodal.SerializeAction({});
						// this.fireEvent('action',action);
						// },
						// scope: this,
						ref: 'serializeButton',
						handler: this.serializeTerse,
						scope: this,
						tooltip: {
							title: 'Compile System',
							text: 'Compiles the system into a domain-level specification. Several output '+
							'files will be added to this directory, including a graphical representation of the included hairpins, ' +
							'a NUPACK multi-objective script for thermodynamic sequence design, and a Domain Design specification for '+
							'interactive sequence design using Web DD. ',
							//'Serializes the workspace to the "TerseML" format accepted by the current version of the compiler; outputs to input.txt in this directory.'
						}
					},{
						iconCls: 'compile',
						text: 'Serialize',
						rowspan: 1,
						disabled: true,
						ref:'serializeMenu',
						tooltip: {
							title: 'Serialize System',
							text: 'View and edit serialized forms of nodal system, including TerseML, PIL, and SVG, for further processing (must compile first). ',
						},
						menu: [{
							text: 'TerseML',
							iconCls: 'txt',
							ref: 'txt',
							disabled: true,
							handler: _.bind(this.openFile,this,'txt'),
						},{
							text: 'PIL',
							iconCls: 'pil',
							ref: 'pil',
							disabled: true,
							handler: _.bind(this.openFile,this,'pil'),
						},{
							text: 'SVG',
							iconCls: 'svg',
							ref: 'svg',
							disabled: true,
							handler: _.bind(this.openFile,this,'svg'),
						}]
					},{
						iconCls: 'sequence',
						text: 'Sequence',
						rowspan: 1,
						disabled: true,
						ref:'sequenceMenu',
						tooltip: {
							title: 'Sequence System',
							text: 'Opens the system in a sequence editor to perform sequence design. Available sequence editors: NUPACK multi-objective, Web DD, and SpuriousC.',
						},

						//handler: this.spuriousDesign,
						//scope: this,
						menu: [{
							text: 'SpuriousC',
							iconCls: 'spurious-c',
							ref: 'spur',
							disabled: true,
							handler: _.bind(this.openFile,this,'spur'),
						},{
							text: 'NUPACK',
							iconCls: 'nupack',
							ref: 'nupack',
							disabled: true,
							handler: _.bind(this.openFile,this,'nupack'),
						},{
							text: 'Web DD',
							iconCls: 'seq',
							ref: 'domains',
							disabled: true,
							handler: _.bind(this.openFile,this,'domains'),
						}]
					}]
				},{
					xtype: 'buttongroup',
					title: 'Simulation',
					columns: 1,
					disabled: true,
					defaults: {
						// cellCls: 'table-cell-padded',
					},
					items: [{
						text: 'Enumerate',
						iconCls: 'enumerate',
						iconAlign: 'left'
					},{
						text: 'Simulate',
						iconCls: 'simulate',
						iconAlign: 'left'
					}]
				}]
			}]
		}
	},
	getDoc: function() {
		return this.ribbon.canvas.doc ? this.ribbon.canvas.doc : this.ribbon.canvas.document; 
	},
	initComponent: function() {
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		}, this);
		this.sequenceMenu.on('click',this.doUpdateMenus,this);
		this.serializeMenu.on('click',this.doUpdateMenus,this);
	},
	init: function() {
		this.updateMenus(true);
	},
	doUpdateMenus: function() {
		this.updateMenus(false);
	},
	updateMenus: function(firstTime) {
		firstTime = firstTime || false;
		if(!firstTime) {
			this.ribbon.canvas.renew();
		}
		var doc = this.getDoc(), basename = doc.getBasename();
		if(doc) {
			_.each(['txt','pil','svg','nupack','spur','domains'],function(ext) {
				if(doc.getSiblingByName(App.Path.repostfix(basename,ext))) {
					this.sequenceMenu.enable();
					this.serializeMenu.enable();
					this[ext].enable();			
				} else {
					this[ext].disable();
				}
			},this);
		}
	},
	enableMenus: function() {
		this.sequenceMenu.enable();
		this.serializeMenu.enable();			
	},
	openFile: function(ext) {
		var doc = this.getDoc(), basename = doc.getBasename();
		var sibling = doc.getSiblingByName(App.Path.repostfix(basename,ext));
		if(sibling) {
			App.ui.Launcher.launchDocument(sibling);
		}
	},
	serializeTerse: function() {
		// if(Ext.log) {
		// Ext.log(Workspace.tools.nodal.serializeForCompiler(this.workspace));
		// } else {
		// console.log(Workspace.tools.nodal.serializeForCompiler(this.workspace));
		// }

		var data = Workspace.tools.nodal.serializeForCompiler(this.ribbon.canvas.workspace),
		node = this.ribbon.canvas.doc.getPath(); //App.path.repostfix([this.ribbon.canvas.doc.getPath(),'txt']);
		App.runTask('Nodal',{
			node:node,
			data:data,
		},_.bind(function() {
			//this.enableMenus();
			Ext.msg('Nodal Build','Build of system <strong>{0}</strong> completed.',this.getDoc().getBasename());
		},this));
		// doc = this.ribbon.canvas.doc.getSiblingByName('input.txt');
		// if(!doc) {
			// doc = this.ribbon.canvas.doc.createSibling('input.txt');
		// }
		// // hack - need to find a way to wait until sibling is created
		// Ext.Function.defer( function() {
			// doc.saveBody(data, {
				// success: function() {
					// Ext.log('Workspace successfully serialized.');
				// },
				// failure: function() {
					// Ext.log('Serialization failed.');
				// },
				// scope: this,
			// })
		// },1000,this);
	},
	spuriousDesign: function() {
		var doc = this.ribbon.canvas.doc.getSiblingByName('spurious-out');
		if(doc) {
			App.runTask('Spurious', {
				node: doc.getPath()
			});
		}
	}
});

Ext.ns('Workspace.tools.nodal');

////////////////////////////////////////////////////////////////////////////////////////////////
Workspace.tools.nodal.serializeForCompiler = function(workspace) {
	var nodes = [], complementarities = [], indexMap = {}, i = 1, out = [];
	workspace.objects.each( function(obj) {
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
		var row = [obj.get('name').replace(/\s/g,'_') || ("Untitled_"+ (++untitledCount)), obj.get('motif')], complementaryPort, complementaryNode;
		obj.children.each( function(port) {
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
};