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
	childWType: 'Workspace.objects.Path',
	constructor : function() {
		this.callParent(arguments);
		this.indexedChildren = [];
	},
	addChild : function(child) {
		this.callParent(arguments);
		child.expose('index', true, true, true, false);
		this.indexedChildren[child.get('index')] = child;
	},
	render : function() {
		this.callParent(arguments);
		this.toBack();
	},
	/**
	 * Called when {@link #points} changes; builds the SVG path string.
	 */
	buildPath : function() {
		var points = this.get('points');
		var p1, p2, child;

		// same number of children
		if(this.children.getCount() > 0) {
			if(this.children.getCount() == points.length - 1) {
				for(var i = 0, l = points.length - 1; i < l; i++) { p1 = points[i], p2 = points[i + 1];
					child = this.indexedChildren[i];
					child.set('points', [p1, p2]);
				}
			}
		} else {
			// first time
			for(var i = 0, l = points.length - 1; i < l; i++) { p1 = points[i], p2 = points[i + 1];
				this.makeChild({
					points : [p1, p2]
				});
			}
		}
		this.callParent(arguments);

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
		child = this.workspace.createObject(Ext.apply(config || {}, {
			wtype : this.childWType,
			strokeWidth : 4,
			stroke : '#aaa',
			index : this.getNextIndex(),
			showTitle : true,
			editable: false,
		}));
		this.addChild(child);
		if(this.is('rendered')) {
			child.insertAfter(this);
		}
	},
	getNextIndex: function() {
		return this.indexedChildren.length;
	},
	childCanMove : function() {
		return false;
	},
}, function() {
	Workspace.reg('Workspace.objects.SegmentedPath', Workspace.objects.SegmentedPath);
});
