////////////////////////////////////////////////////////////////////////////////////////////////
/*
* @class Workspace.objects.SegmentedPath
* Represents a {@link Workspace.objects.Path path} whose segments are treated as separate objects
*/
Ext.define('Workspace.objects.SegmentedPath', {
	extend : 'Workspace.objects.Path',
	strokeWidth : 10,
	stroke : '#000',
	strokeOpacity : 0.5,
	strokeLinecap : 'round',
	strokeLinejoin : 'round',
	childWType : 'Workspace.objects.Path',
	constructor : function() {
		this.callParent(arguments);
		this.indexedChildren = [];
	},
	addChild : function(child) {
		this.callParent(arguments);
		child.expose('index', true, true, true, false);
		child.on('change:points', this.childChangePoints, this);
		child.on('change:path',this.childChangePath,this);
		this.indexedChildren[child.get('index')] = child;
	},
	removeChild : function(child) {
		this.callParent(arguments)
		child.un('change:points', this.childChangePoints, this);
		var index = child.get('index');
		var points = this.get('points');

		points.splice(index, 1);
		this.indexedChildren.splice(index, 1);
		for(var i = index; i < this.indexedChildren.length; i++) {
			this.indexedChildren[i].set('index', i);
		}
		this.set('points', points);
	},
	render : function() {
		this.callParent(arguments);
		this.toBack();
	},
	childChangePath : function() {
		if(!this.ignoreChangeChildPoints && !this.ignoreChangeChildPath) {
			this.ignoreChangeChildPath = true;
			this.buildPath();
			this.ignoreChangeChildPath = false;
		}
	},
	childChangePoints : function(points, oldPoints, child) {
		if(!this.ignoreChangeChildPoints) {
			var myPoints = this.get('points');
			myPoints[child.index] = points[0];
			myPoints[child.index + 1] = points[1];
			this.set('points', myPoints);
		}
	},
	/**
	 * Called when {@link #points} changes; builds the SVG path string.
	 */
	buildPath : function() {
		var points = this.get('points');
		var p1, p2, child;
		var path = [];

		// same number of children
		if(this.children.getCount() > 0) {
			if(this.children.getCount() == points.length - 1) {
				for(var i = 0, l = points.length - 1; i < l; i++) { p1 = points[i], p2 = points[i + 1];
					child = this.indexedChildren[i];
					this.ignoreChangeChildPoints = true;
					child.set('points', [p1, p2]);
					this.ignoreChangeChildPoints = false;
					path.push(child.interpolate(child.get('points')));
				}
			}
			this.set('path',path.join(' '));
		} else {
			// first time
			for(var i = 0, l = points.length - 1; i < l; i++) { p1 = points[i], p2 = points[i + 1];
				child = this.makeChild({
					points : [p1, p2]
				});
				path.push(child.interpolate(child.get('points')));
			}
			this.set('path',path.join(' '));
		}
		//this.callParent(arguments);

	},
	/**
	 * @param {Number} index The index before which to insert the new point
	 */
	addPoint : function(point, index) {
		var leftChild, rightChild, newChild, points = this.get('points');
		if(index > 0) {
			leftChild = this.indexedChildren[index - 1];
			leftChild.set('points', [points[index], point]);
		}
		newChild = this.makeChild();

		if(index < this.indexedChildren.length) {
			leftChild = this.indexedChildren[index];
			leftChild.set('points', [point, points[index + 1]]);
		}

		points.splice(index, 0, point);
		this.set('points', points);
	},
	deletePoint : function(index) {

	},
	makeChild : function(config) {
		var child = this.workspace.createObject(Ext.apply(config || {}, {
			wtype : this.childWType,
			strokeWidth : 4,
			stroke : '#aaa',
			fillOpacity : 0,
			index : this.getNextIndex(),
			showTitle : true,
			//editable: false,
		}));
		this.addChild(child);
		if(this.is('rendered')) {
			child.insertAfter(this);
		}
		return child;
	},
	getSegment : function(index) {
		return this.indexedChildren(index);
	},
	getNextIndex : function() {
		return this.indexedChildren.length;
	},
	childCanMove : function() {
		return false;
	},
}, function() {
	Workspace.reg('Workspace.objects.SegmentedPath', Workspace.objects.SegmentedPath);
});
