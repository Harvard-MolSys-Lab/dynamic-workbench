////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.ConnectorHandle
 * Allows connector objects to be retargeted
 * @extends Workspace.tools.Handle
 */

Ext.define('Workspace.tools.ConnectorHandle', {
	extend:'Workspace.tools.Handle',
	constructor: function() {
		Workspace.tools.ConnectorHandle.superclass.constructor.apply(this,arguments);

		this.item.on('move', this.onItemMove, this);
		this.item.on('resize', this.onItemMove, this);

		this.onItemMove();
	},
	/**
	 * accept
	 * Determines whether to accept a hover/drop on an item;
	 * @param {Mixed} item The item to be tested
	 * @return true if an item is passed; false otherwise.
	 */
	accept: function(item) {
		// TODO: reject leftobject
		return (item != null);
	},
	setHoverItem: function(item) {
		this.dropTarget = item;
	},
	drag: function() {
		var pos = this.getPosition(),
		point = Workspace.ConnectionObject.getPoint(pos.x,pos.y),
		left, right;
		switch(this.location) {
			case 'right':
				left = this.item.get('leftObject');
				right = point;
				break;
			case 'left':
				left = point;
				right = this.item.get('rightObject');
				break;
		}
		this.item.applyPath(this.item.buildPath(left,right));
	},
	dragEndHandler: function() {
		if(this.dragging) {
			Workspace.tool.ConnectorHandle.superclass.dragEndHandler.apply(this,arguments);
			if(!this.dropTarget) {
				var pos = this.getPosition();
				this.dropTarget = Workspace.ConnectionObject.getPoint(pos.x,pos.y);
			}
			if(this.dropTarget) {
				switch(this.location) {
					case 'right':
						this.item.set('rightObject',this.dropTarget);
						break;
					case 'left':
						this.item.set('leftObject',this.dropTarget);
						break;
				}
				this.item.rebuildPath();
			}
			this.dropTarget = false;
		}
	},
	onItemMove: function() {
		var point;
		switch(this.location) {
			case 'left':
				point = this.item.getLeftPoint();
				break;
			case 'right':
				point = this.item.getRightPoint();
				break;
		}
		this.setPosition(point[0],point[1]);
	},
	destroy: function() {
		Workspace.tools.ConnectorHandle.superclass.destroy.apply(this,arguments);
		this.item.un('move', this.onItemMove, this);
		this.item.un('resize', this.onItemMove, this);
	}
})