Ext.define('Workspace.objects.primary.StrandLayout',{
	extend: 'Workspace.idea.BaseLayout',
	doLayout: function() {
		var ctrlPoints = [], //{}, c=0
			domains = []; // {}, d=0;
		this.getObjects().each(function(o) {
			if(o.isWType('Workspace.objects.primary.ControlPoint')) {
				ctrlPoints.push(o)
				// ctrlPoints[o.get('index')] = o;
			} else if(o.isWType('Workspace.objects.primary.Domain')) {
				domains.push(o);
				//domains[o.get('index')] = o;
			}
		});
		_.each(domains,function(domain,index) {
			domain.set('leftPoint',[ctrlPoints[index].get('x'),this.idea.get('y')]);
			domain.set('rightPoint',[ctrlPoints[index+1].get('x'),this.idea.get('y')]);
		});
	}
},function() {	
	Workspace.Layouts.register('Workspace.objects.primary.StrandLayout',Workspace.objects.primary.StrandLayout);
});