Ext.define('App.usr.nodal.ws.tools.MotifTool', {
	targetWType : 'App.usr.nodal.ws.objects.Motif',

	constructor : function(workspace, config) {
		this.callParent(arguments);
	},
	requires : ['App.usr.nodal.ws.objects.Motif'],
	extend : 'Workspace.tools.IdeaTool',
	alternateAction: function(e,item,pos) {
		var idea = this.workspace.createObject({
			wtype : this.targetWType,
			children : [],
			x: pos.x,
			y: pos.y,
		});
		idea.toBack();
		idea.select();
		this.workspace.changeTool('pointer');
	},
	buildIdeaFromSelection : function() {
		var partition = _.groupBy(this.workspace.getSelection(), 'wtype');
		var nodes = partition['App.usr.nodal.ws.objects.Node'], //
			complements = partition['App.usr.nodal.ws.objects.Complement']; //
		var nodeMap = _.reduce(nodes, function(memo, child) {
			memo[child.getId()] = child;
			return memo;
		}, {});

		// Don't add complements taht point to a node outside the new motif.
		complements = _.filter(complements, function(obj) {
			if(obj.hasWType('App.usr.nodal.ws.objects.Complement')) {
				var left = obj.get('leftObject'), right = obj.get('rightObject');
				return (left && right && !!nodeMap[left.getParent().getId()] && !!nodeMap[right.getParent().getId()]);
			}
			return false;
		});

		function xor(a, b) {
			return a ? !b : b;
		}

		var complementsToRemove = this.workspace.filterObjectsBy(function(obj) {
			if(obj.hasWType('App.usr.nodal.ws.objects.Complement')) {
				var left = obj.get('leftObject'), right = obj.get('rightObject');
				return (left && right && xor(!!nodeMap[left.getParent().getId()], !!nodeMap[right.getParent().getId()]));
			}
			return false;
		});
		this.workspace.deleteObjects(complementsToRemove);

		children = nodes.concat(complements);

		if(children.length > 0) {
			var idea = this.workspace.createObject({
				wtype : this.targetWType,
				children : children
			});
			idea.toBack();
		}
		return idea;
	},
	
}, function() {
	Workspace.Tools.register('motif', App.usr.nodal.ws.tools.MotifTool);
}); 