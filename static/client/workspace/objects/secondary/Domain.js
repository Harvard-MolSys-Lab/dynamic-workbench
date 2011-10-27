Ext.define('Workspace.objects.secondary.Domain',{
	extend: 'Workspace.objects.Path',
	constructor: function() {
		this.callParent(arguments);
		this.on('move',this.testProximity,this);
		this.oldMatches = [];
	},
	testProximity: function() {
		function dist(p1, p2) {
			return Math.sqrt(Math.pow(p1[0]-p2[0],2)+Math.pow(p1[1]-p2[1],2));
		}
		
		_.each(this.oldMatches,function(obj) {
			obj.unhighlight();
		})
		
		var matches = [];
		
		this.workspace.objects.each(function(obj) {
			if(obj.getId() != this.getId()) {
				if(obj.isWType('Workspace.objects.secondary.Domain')) {
					var points_a = obj.get('points'),
						points_b = this.get('points'),
						p1a = _.first(points_a),
						p2a = _.last(points_a),
						p1b = _.first(points_b),
						p2b = _.last(points_b);
						
					var l1 = dist(p1a,p1b) + dist(p2a,p2b),
						l2 = dist(p1a,p2b) + dist(p2a,p1b),
						len = Math.sqrt(Math.min(l1,l2)/2),
						t = Math.sqrt((dist(p1a,p2a)+dist(p1b,p2b))/2);
					
					if(len < t/2) {
						matches.push(obj);
					}
				}
			}
		},this);
		
		_.each(matches,function(obj) {
			obj.highlight ? obj.highlight() : false;
		});
		this.oldMatches = matches;
	},
}, function() {
	Workspace.reg('Workspace.objects.secondary.Domain', Workspace.objects.secondary.Domain);
})
