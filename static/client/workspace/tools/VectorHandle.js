
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.VectorHandle
 * @extends Workspace.tools.Handle
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.VectorHandle', {
	constructor: function(workspace, config) {
		Workspace.tools.VectorHandle.superclass.constructor.call(this, workspace, config);

		Ext.applyIf(this, {
			location: 'tl'
		});

		if (this.item) {
			if (this.item.vectorElement) {
				this.vectorElement = this.item.vectorElement;
			}
		}

		this.addEvents();
		
		this.item.on('change:points',this.onItemMove,this);
		this.item.on('move', this.onItemMove, this);
		this.item.on('resize', this.onItemMove, this);
		
		this.onItemMove();
	},
	extend:'Workspace.tools.Handle',
	drag: function() {
		//this.callParent(arguments);
	},
	dragStartHandler: function() {
		this.callParent(arguments);
	},
	dragEndHandler: function() {
		if (this.dragging) {
			var points = this.item.get('points'), pos = this.getPosition();
			points[this.index] = [pos.x,pos.y];
			this.item.set('points',points);
		}
		this.callParent(arguments);
	},
	getPoint: function() {
		if(this.item)
			return this.item.get('points')[this.index];
		return [0,0];
	},
	onItemMove: function() {
		this.move(this.getPoint());
	},
	move: function(point) {
		this.setPosition(point[0],point[1]);
	},
	destroy: function() {
		Workspace.tools.VectorHandle.superclass.destroy.call(this);
		this.item.un('move', this.onItemMove, this);
		this.item.un('resize', this.onItemMove, this);
		this.item.un('change:points',this.onItemMove,this);

	}
});