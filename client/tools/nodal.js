/***********************************************************************************************
 * InfoMachine
 * 
 * 
 * Copyright (c) 2010-2011 Casey Grun
 * 
 ***********************************************************************************************
 * ~/client/tools/nodal.js
 * 
 * Defines {Workspace.tool.BaseTool} subclasses which implement interactions for construction of
 * reaction graphs using the DNA hairpin-based nodal abstraction
 ***********************************************************************************************/
 
Ext.ns('Workspace.tool.nodal');

Workspace.tool.nodal.PortTool = Ext.extend(Workspace.tool.BaseTool,{
	click: function(e,item) {
		var pos = this.getAdjustedXY(e), port;
		if(item && this.accept(item)) {
			if(e.altKey) {
				port = this.workspace.createObject(Workspace.objects.dna.OutputPort,{
					x: pos.x,
					y: pos.y
				});
			} else {
				port = this.workspace.createObject(Workspace.objects.dna.InputPort,{
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
});

App.mixin(Workspace.tool.nodal.PortTool,Workspace.tool.Highlightable);
Workspace.Tools.register('port', Workspace.tool.nodal.PortTool);

////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.tool.nodal.NodeTool = Ext.extend(Workspace.tool.BaseTool,{
	defaultMotif: '0',
	click: function(e,item) {
		var pos = this.getAdjustedXY(e);
		this.buildMotif(this.defaultMotif,pos.x,pos.y);
	},
	buildMotif: function(name,x,y) {
		var spec = Workspace.objects.dna.Motifs[name], node;
		if(spec) {
			node = this.workspace.createObject(Workspace.objects.dna.Node,{
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
		return Workspace.tool.nodal.PortTool.prototype.buildPort.apply(this,arguments);
	}
});

Workspace.Tools.register('node', Workspace.tool.nodal.NodeTool);

////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.tool.nodal.ComplementarityTool = Ext.extend(Workspace.tool.ConnectorTool,{
	acceptLeft: function() {
		return Workspace.objects.dna.Complementarity.prototype.acceptLeft.apply(this,arguments);
	},
	acceptRight: function() {
		return Workspace.objects.dna.Complementarity.prototype.acceptRight.apply(this,arguments);
	},
	canConnect: function() {
		return Workspace.objects.dna.Complementarity.prototype.canConnect.apply(this,arguments);
	},
	targetWType: 'Workspace.objects.dna.Complementarity'
});

Workspace.Tools.register('complementarity',Workspace.tool.nodal.ComplementarityTool);


////////////////////////////////////////////////////////////////////////////////////////////////

Workspace.tool.nodal.serializeForCompiler = function(workspace) {
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
	
	Ext.each(nodes,function(obj) {
		var row = [obj.get('motif')], complementaryPort, complementaryNode;
		obj.children.each(function(port) {
			if(port.isWType('Workspace.objects.dna.OutputPort')) {
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

Workspace.tool.nodal.SerializeAction = Ext.extend(WorkspaceAction,{
	constructor: function(config){
	    Ext.apply(this, config, {
	        
	    });
	    Workspace.tool.nodal.SerializeAction.superclass.constructor.apply(this, arguments);
	    Ext.applyIf(this, {
	        scope: this
	    });
	},
	handler: function() {
		if(Ext.log) {
			Ext.log(Workspace.tool.nodal.serializeForCompiler(this.workspace));
		} else {
			console.log(Workspace.tool.nodal.serializeForCompiler(this.workspace));
		}
	}
})
