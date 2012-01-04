Ext.define('Workspace.objects.secondary.Domain', {
	extend : 'Workspace.objects.Path',
	identity : '',
	polarity : 0,
	shimConfig : {
		property : 'identifier',
	},
	baseRadius : 3,
	baseSpacing : 10,
	angle : function(x1,y1,x2,y2) {
		return Math.atan2(y2-y1, x2-x1);
	},
	constructor : function() {
		this.callParent(arguments);
		this.on('move', this.testProximity, this);
		
		this.oldMatches = [];
		
		this.expose('identifier', function() {
			return this.workspace.complementarityManager.getIdentifier(this);
		}, false, false, false);
		this.expose('identity', function() {
			return this.workspace.complementarityManager.getIdentity(this);
		}, function(value) {
			this.identity = this.workspace.complementarityManager.checkoutIdentity(this, value);
		}, true, false);
		this.expose('polarity', true, true, true, false);

		this.expose('complementarities', function() {
			return this.workspace.complementarityManager.getComplementary(this.get('identifier'));
		}, false, false, false);
		this.expose('stroke', function() {
			return this.workspace.complementarityManager.getColor(this.get('identity'));
		}, function(value) {
			this.workspace.complementarityManager.setColor(this.get('identity'), value);
		}, true, true, false);

		this.expose('arc', function() {
			var p1 = this.get('leftPoint'), p2 = this.get('rightPoint');
			return Math.atan2(p2[1]-p1[1], p2[0]-p1[0]);
		}, false, false, false);

		this.expose('leftPoint', function() {
			return this.points[0];
		}, function(v) {
			var p = this.get('points');
			p[0] = p
			this.set('points', p);
		}, false, false);

		this.expose('rightPoint', function() {
			return _.last(this.points);
		}, function(v) {
			var p = this.get('points');
			p.pop();
			if(p.length > 0) {
				p[p.length - 1] = v;
			}
			this.set('points', p);
		}, false, false);

		this.expose('length', function() {
			var p1 = this.get('leftPoint'), p2 = this.get('rightPoint');
			return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
		}, false, false, false);

		this.on('change:identity', function(newValue, oldValue) {
			this.change('identifier', this.get('identifier'), this.workspace.complementarityManager.makeIdentifier(oldValue, this.get('polarity')));
			this.change('stroke', this.get('stroke'));
		}, this);
		this.on('change:polarity', function(newValue, oldValue) {
			this.change('identifier', this.get('identifier'), this.workspace.complementarityManager.makeIdentifier(this.get('identity'), oldValue));
			this.change('stroke', this.get('stroke'));
		}, this);
		
		this.on('change:stroke', function() {
			this.updateBases();
		},this)

		this.segmentBases = [];

	},
	interpolator: function() {
		
	},
	initialize : function() {
		this.workspace.complementarityManager.checkoutIdentity(this, this.get('identity'));
		this.callParent(arguments);
	},
	// render : function() {
	// this.updateBases();
	// },
	countBases : function(distance) {
		return Math.floor(distance / this.baseSpacing);
	},
	nextPosition : function(lastPos, angle, distance) {
		return {
			x : lastPos.x + Math.cos(angle) * distance,
			y : lastPos.y + Math.sin(angle) * distance,
		};
	},
	pointToPos : function(point) {
		return {
			x : point[0],
			y : point[1],
		}
	},
	nextPosition : function(lastPos, angle, distance) {
		return {
			x : lastPos.x + Math.cos(angle) * distance,
			y : lastPos.y + Math.sin(angle) * distance,
		};
	},
	makeBase : function() {
		var circle = this.workspace.paper.circle(0, 0, this.baseRadius);
		circle.attr({
			fill : this.get('stroke'),
			stroke : this.get('stroke'),
		});
		return circle;
	},
	updateBase : function(base, x, y) {
		base.attr({
			cx : x,
			cy : y,
			fill : this.get('stroke'),
		});
	},
	updateBases : function() {
		var distance = this.get('length'), angle = this.get('arc'), baseCount = this.countBases(distance);

		// make new bases if we need more
		if(baseCount > this.segmentBases.length) {
			// for each new base
			for(var i = 0, l = baseCount - this.segmentBases.length; i < l; i++) {
				this.segmentBases.push(this.makeBase());
			}

			// remove old bases if we've got too many
		} else if(baseCount < this.segmentBases.length) {
			for(var i = 0, l = this.segmentBases.length - baseCount; i < l; i++) {
				var base = this.segmentBases.pop();
				base.remove();
			}
		}

		var point = this.nextPosition(this.pointToPos(this.get('leftPoint')), angle, this.baseSpacing / 2);
		for(var i = 0; i < baseCount; i++) {
			this.updateBase(this.segmentBases[i], point.x, point.y);
			point = this.nextPosition(point, angle, this.baseSpacing);
		}
	},
	updatePath : function() {
		this.callParent(arguments);
		this.updateBases();
	},
	testProximity : function() {

		return false;

		function dist(p1, p2) {
			return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
		}


		_.each(this.oldMatches, function(obj) {
			obj.unhighlight();
		})
		var matches = [];

		this.workspace.objects.each(function(obj) {
			if(obj.getId() != this.getId()) {
				if(obj.isWType('Workspace.objects.secondary.Domain')) {
					var points_a = obj.get('points'), points_b = this.get('points'), p1a = _.first(points_a), p2a = _.last(points_a), p1b = _.first(points_b), p2b = _.last(points_b);

					var l1 = dist(p1a, p1b) + dist(p2a, p2b), l2 = dist(p1a, p2b) + dist(p2a, p1b), len = Math.sqrt(Math.min(l1, l2) / 2), t = Math.sqrt((dist(p1a, p2a) + dist(p1b, p2b)) / 2);

					if(len < t / 2) {
						matches.push(obj);
					}
				}
			}
		}, this);

		_.each(matches, function(obj) {
			obj.highlight ? obj.highlight() : false;
		});
		this.oldMatches = matches;
	},
	destroy : function() {
		if(!this.is('destroyed')) {
			_.each(this.bases,function(base) {
				base.remove();
			});
			delete this.bases;
		}
	},
	constrain : function(pos,handle) {
		// var length = this.get('length'), angle;
		// if(handle.index==0) {
// 			
		// } else if (handle.index==1) {
			// var point = this.get('leftPoint');
			// angle = this.angle(point[0],point[1],pos.x,pos.y);
		// }
		return pos;
	},
}, function() {
	Workspace.reg('Workspace.objects.secondary.Domain', Workspace.objects.secondary.Domain);
})