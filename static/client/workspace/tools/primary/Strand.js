Ext.define('Workspace.tools.primary.Strand',{
	extend: 'Workspace.tools.PolyLineTool',
	layout: 'Workspace.objects.primary.StrandLayout',
	buildObject: function() {
		var items = [];
		for(var i=0; i<this.points.length-1; i++) {
			var p = this.points[i],p2 = this.points[i+1];
			items.push(Ext.create('Workspace.objects.primary.Domain',{
				leftPoint: p,
				rightPoint: p2,
			}));
			items.push(Ext.create('Workspace.objects.primary.ControlPoint',{
				x:p[0],
				y:p[1],
			}));
		}
		return {
			wtype:'Workspace.objects.primary.Strand',
			children: items,
		};
	},
},function() {
	Workspace.Tools.register('strand',Workspace.tools.primary.Strand);
})