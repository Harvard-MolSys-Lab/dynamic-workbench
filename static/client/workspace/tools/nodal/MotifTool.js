Ext.define('Workspace.tools.nodal.MotifTool', {
	targetWType : 'Workspace.objects.dna.Motif',

	constructor : function(workspace, config) {
		this.callParent(arguments);
	},
	requires : ['Workspace.objects.dna.Motif'],
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
		var nodes = partition['Workspace.objects.dna.Node'], //
			complements = partition['Workspace.objects.dna.Complementarity']; //
		var nodeMap = _.reduce(nodes, function(memo, child) {
			memo[child.getId()] = child;
			return memo;
		}, {});

		// Don't add complements taht point to a node outside the new motif.
		complements = _.filter(complements, function(obj) {
			if(obj.hasWType('Workspace.objects.dna.Complementarity')) {
				var left = obj.get('leftObject'), right = obj.get('rightObject');
				return (left && right && !!nodeMap[left.getParent().getId()] && !!nodeMap[right.getParent().getId()]);
			}
			return false;
		});

		function xor(a, b) {
			return a ? !b : b;
		}

		var complementsToRemove = this.workspace.filterObjectsBy(function(obj) {
			if(obj.hasWType('Workspace.objects.dna.Complementarity')) {
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
	Workspace.Tools.register('motif', Workspace.tools.nodal.MotifTool);
}); 