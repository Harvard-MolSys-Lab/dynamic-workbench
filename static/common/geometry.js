App.geom = App.Geom = (function() {

function Point(cfg) {
	this.x = cfg.x;
	this.y = cfg.y;
}

_.extend(Point.prototype,{
	toArray: function() {
		return [this.x,this.y];
	},
	toPos: function() {
		return {x: this.x, y: this.y};
	},
	add : function(cfg) {
		var pt = Point.fromMixed(cfg);
		return new Point({x :this.x + pt.x, y: this.y + pt.y});
	},
	subtract : function(cfg) {
		var pt = Point.fromMixed(cfg);
		return new Point({x :this.x - pt.x, y: this.y - pt.y}); 
	},
	distance :  function(cfg) {
		var pt = Point.fromMixed(cfg);
		return Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2));
	},
	angle : function(cfg) {
		if(cfg) {
			var pt = Point.fromMixed(cfg);
			return Math.atan2(pt.y - this.y, pt.x - this.x);
		} else {
			return Math.atan2(this.y,this.x);
		}
	},
	addPolar : function(theta, radius) {
		
		return new Point({
			x : this.x + Math.cos(theta)*radius, 
			y : this.y + Math.sin(theta)*radius,
		});
		return this;
	},
	midpoint : function(cfg) {
		var pt = Point.fromMixed(cfg);
		return new Point({
			x : this.x+(pt.x - this.x) / 2,
			y : this.y+(pt.y - this.y) / 2,
		});
	}
});

_.extend(Point,{
	fromArray: function(cfg) {
		return new Point({
			x: cfg[0],
			y: cfg[1],
		});
	},
	fromPos: function(cfg) {
		return new Point(cfg);
	},
	fromMixed: function(cfg) {
		if(cfg instanceof Point) {
			return cfg;
		}
		if(_.isArray(cfg)) {
			return Point.fromArray(cfg);
		} else if (_.isObject(cfg) && cfg.x && cfg.y) {
			return Point.fromPos(cfg);
		}
	}
});


function Angle(theta) {
	this.theta = theta;
}
_.extend(Angle.prototype,{
	rad : function() {
		if(this.type == 'rad') {
			return this.theta;
		} else {
			return this.theta * Math.PI / 180;
		}
	},
	deg : function() {
		if(this.type == 'deg') {
			return this.theta;
		} else {
			return this.theta / 180 * Math.PI;
		}
	}
});

_.extend(Angle,{
	fromRad : function(theta) {
		var a = new Angle(theta);
		a.type = 'rad';
		return a;
	},
	fromDeg : function(theta) {
		var a = new Angle(theta);
		a.type = 'deg';
		return a;
	}
})

return {
	Point : Point,
}

})();

