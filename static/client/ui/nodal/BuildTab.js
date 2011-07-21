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
						disabled: false,
						menu: [{
							text: 'TerseML',
							iconCls: 'txt',
						},{
							text: 'PIL',
							iconCls: 'pil',
						},{
							text: 'SVG',
							iconCls: 'svg',
						}]
					},{
						iconCls: 'sequence',
						text: 'Sequence',
						rowspan: 1,
						disabled: false,
						//handler: this.spuriousDesign,
						//scope: this,
						menu: [{
							text: 'SpuriousC',
							iconCls: 'spurious-c',
						},{
							text: 'NUPACK',
							iconCls: 'nupack',
						},{
							text: 'Web DD',
							iconCls: 'seq'
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
	initComponent: function() {
		this.callParent(arguments);
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
		});
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

	Ext.each(nodes, function(obj) {
		var row = [obj.get('motif')], complementaryPort, complementaryNode;
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