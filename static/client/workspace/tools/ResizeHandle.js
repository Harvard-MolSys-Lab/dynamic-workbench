
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.ResizeHandle
 * @extends Workspace.tools.Handle
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.ResizeHandle', {
	constructor: function(workspace, config) {
		Workspace.tools.ResizeHandle.superclass.constructor.call(this, workspace, config);

		Ext.applyIf(this, {
			location: 'tl'
		});

		if (this.item) {
			if (this.item.vectorElement) {
				this.vectorElement = this.item.vectorElement;
			}
		}

		this.addEvents();

		this.item.on('move', this.onItemMove, this);
		this.item.on('resize', this.onItemMove, this);
		this.proxy = this.item.getProxy();
		this.proxy.on('move', this.onProxyMove, this);
		this.proxy.on('resize', this.onProxyMove, this);

		this.onItemMove();
	},
	extend:'Workspace.tools.Handle',
	drag: function() {
		var box = this.item.getBox();
		var pos = this.getPosition();

		switch (this.location) {
			case 'tl':
				this.proxy.setBox(pos.x, pos.y, box.br.x, box.br.y);
				break;
			case 'tr':
				this.proxy.setBox(box.tl.x, pos.y, pos.x, box.br.y);
				break;
			case 'bl':
				this.proxy.setBox(pos.x, box.tl.y, box.br.x, pos.y);
				break;
			case 'br':
				this.proxy.setBox(box.tl.x, box.tl.y, pos.x, pos.y);
				break;
		}
	},
	dragStartHandler: function() {
		this.item.applyProxy();
		Workspace.tools.ResizeHandle.superclass.dragStartHandler.apply(this, arguments);
	},
	dragEndHandler: function() {
		if (this.dragging) {
			this.item.restoreFromProxy();
			Workspace.tools.ResizeHandle.superclass.dragEndHandler.apply(this, arguments);
			return false;
		}
	},
	onItemMove: function() {
		this.move(this.item.getBox());
	},
	onProxyMove: function() {
		this.move(this.proxy.getBox());
	},
	move: function(box) {
		switch (this.location) {
			case 'tl':
				this.setPosition(box.tl.x, box.tl.y);
				break;
			case 'tr':
				this.setPosition(box.tr.x, box.tr.y);
				break;
			case 'bl':
				this.setPosition(box.bl.x, box.bl.y);
				break;
			case 'br':
				this.setPosition(box.br.x, box.br.y);
				break;
		}
	},
	destroy: function() {
		//Workspace.tools.ResizeHandle.superclass.destroy.call(this);
		this.callParent(arguments);
		this.item.un('move', this.onItemMove, this);
		this.item.un('resize', this.onItemMove, this);
		this.proxy.un('move', this.onProxyMove, this);
		this.proxy.un('resize', this.onProxyMove, this);
	}
});