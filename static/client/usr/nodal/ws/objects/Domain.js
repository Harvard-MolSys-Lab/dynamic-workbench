/**
 * @class App.usr.nodal.ws.objects.Domain
 * @extends Workspace.objects.Line
 */
Ext.define('App.usr.nodal.ws.objects.Domain', {
	extend : 'Workspace.objects.Path',
	buildPathPolar : function(x1, y1, length, arc) {
		return [['M', x1, x2], ['L', x1 + Math.cos(arc) * v, y1 + Math.sin(arc) * v]];
	},
	buildPath : function() {
		if(!this.path) {
			return this.rebuildPath();
		}
		return this.path;
	},
	rebuildPath : function() {
		var left = this.get('leftPoint'), right = this.get('rightPoint'), length = this.get('length'), arc = this.get('arc'), path = [];
		if(left && left.length > 1) {
			path[0] = ['M'].concat(left);
		} else {
			path[0] = ['M', 0, 0];
		}
		if(right && right.length > 1) {
			path[1] = ['L'].concat(right);
		} else if(length > 0 && arc !== false) {
			path = this.buildPathPolar.apply(this, path[0].slice(1).concat([length, arc]));
		} else {
			path[1] = ['L', 0, 0];
		}
		this.path = path;
		return path;
	},
	constructor : function() {
		this.callParent(arguments);

		this.expose('hybridize', true, true, true, false);

		this.expose('length', true, function(v) {
			this.length = v;
			var p = this.get('leftPoint')
			this.set('path', this.buildPath(p[0], p[1], v, this.get('arc')));
		}, true, false);
		this.expose('complement', function() {
			return App.usr.nodal.ws.objects.Domain.getComplement(this);
		}, function(value) {
			return App.usr.nodal.ws.objects.Domain.setComplement(this, value);
		}, true, false);
		this.expose('arc', function() {
			return Math.atan2(this.getHeight(), this.getWidth());
		});
		this.expose('leftPoint', function() {
			return this.path[0].slice(1);
		}, function(v) {
			var p = this.get('path');
			p[0] = ['M'].concat(v);
			this.set('path', p);
		});
		this.expose('rightPoint', function() {
			return this.path[1].slice(1);
		}, function(v) {
			var p = this.get('path');
			p[1] = ['L'].concat(v);
			this.set('path', p);
		});
	},
	statics : {
		getComplement : function(x) {
			return x.complement;
		},
		setComplement : function(x, v) {
			x.complement = v;
		},
		ntLength : 5,
	}
})
