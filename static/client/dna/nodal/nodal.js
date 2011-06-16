/***********************************************************************************************
 * InfoMachine
 *
 *
 * Copyright (c) 2010-2011 Casey Grun
 *
 ***********************************************************************************************
 * ~/client/tools/nodal.js
 *
 * Defines {Workspace.tools.BaseTool} subclasses which implement interactions for construction of
 * reaction graphs using the DNA hairpin-based nodal abstraction
 ***********************************************************************************************/

Ext.ns('Workspace.tools.nodal');

Ext.define('Workspace.tools.nodal.PortTool', {
	extend:'Workspace.tools.BaseTool',
	mixins: {
		highlightable: 'Workspace.tools.Highlightable'
	},
	click: function(e,item) {
		var pos = this.getAdjustedXY(e), port;
		if(item && this.accept(item)) {
			if(e.altKey) {
				port = this.workspace.createObject(Workspace.objects.dna.OutputPort, {
					x: pos.x,
					y: pos.y
				});
			} else {
				port = this.workspace.createObject(Workspace.objects.dna.InputPort, {
					x: pos.x,
					y: pos.y
				});
			}
			item.adopt(port);
		}
	},
	accept: function(item) {
		return (item.isWType('Workspace.objects.dna.Node'));
	},
	buildPort: function(name) {
		return this.workspace.createObject(Workspace.objects.dna.Ports[name]);
	}
}, function() {
	Workspace.Tools.register('port', Workspace.tools.nodal.PortTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.tools.nodal.NodeTool', {
	extend:'Workspace.tools.BaseTool',
	defaultMotif: '0',
	click: function(e,item) {
		var pos = this.getAdjustedXY(e);
		this.buildMotif(this.defaultMotif,pos.x,pos.y);
	},
	buildMotif: function(name,x,y) {
		var spec = Workspace.objects.dna.Motifs[name], node;
		if(spec) {
			node = this.workspace.createObject(Workspace.objects.dna.Node, {
				x: x,
				y: y,
				motif: name
			});
			for(var i=0; i<spec.length; i++) {
				node.adopt(this.buildPort(spec[i]));
			}
		}
		return node;
	},
	buildPort: function() {
		return Workspace.tools.nodal.PortTool.prototype.buildPort.apply(this,arguments);
	}
}, function() {
	Workspace.Tools.register('node', Workspace.tools.nodal.NodeTool);
});
////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.tools.nodal.ComplementarityTool', {
	extend:'Workspace.tools.ConnectorTool',
	acceptLeft: function() {
		return Workspace.objects.dna.Complementarity.prototype.acceptLeft.apply(this,arguments);
	},
	acceptRight: function() {
		return Workspace.objects.dna.Complementarity.prototype.acceptRight.apply(this,arguments);
	},
	canConnect: function() {
		return Workspace.objects.dna.Complementarity.prototype.canConnect.apply(this,arguments);
	},
	onConnect: function(conn,left,right) {
		if(left.isWType('Workspace.objects.dna.BridgePort') && right.isWType('Workspace.objects.dna.BridgePort')) {
			conn.setBoth = true;
			conn.updateProperty();
		}
	},
	targetWType: 'Workspace.objects.dna.Complementarity'
}, function() {
	Workspace.Tools.register('complementarity',Workspace.tools.nodal.ComplementarityTool);
});
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
// Ext.define('Workspace.tools.nodal.SerializeAction', {
	// extend: 'Workspace.actions.Action',
	// constructor: function(config) {
		// Ext.apply(this, config, {
// 
		// });
		// Workspace.tools.nodal.SerializeAction.superclass.constructor.apply(this, arguments);
		// Ext.applyIf(this, {
			// scope: this
		// });
	// },
	// handler: function() {
		// // if(Ext.log) {
			// // Ext.log(Workspace.tools.nodal.serializeForCompiler(this.workspace));
		// // } else {
			// // console.log(Workspace.tools.nodal.serializeForCompiler(this.workspace));
		// // }
// 		
		// var data = Workspace.tools.nodal.serializeForCompiler(this.ribbon.canvas.workspace),
			// doc = this.ribbon.canvas.doc.getSiblingByName('input.txt');
		// if(!doc) {
			// doc = this.ribbon.canvas.doc.createSibling('input.txt');
		// }
		// Ext.Function.defer(function() {
			// doc.saveBody({
				// success:function() {
					// Ext.log('Workspace successfully serialized.');
				// },
				// failure:function() {
					// Ext.log('Serialization failed.');
				// },
				// scope: this,
			// })
		// },1000,this);
	// }
// });