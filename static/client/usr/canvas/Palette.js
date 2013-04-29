/**
 * Allows objects to be added to workspace by drag and drop
 */
Ext.define('App.usr.canvas.Palette', {
	extend:'Ext.panel.Panel',
	/**
	 * @cfg {Ext.data.Store}
	 * Store which will provide records to render in the #view
	 */
	store: null,
	/**
	 * @cfg
	 * Ext.util.XTemplate or config to use to display records from the #store
	 */
	tpl: '',
	/**
	 * @cfg
	 * CSS selector representing which elements in #tpl represent distinct records
	 */
	itemSelector: '',
	/**
	 * @cfg
	 * CSS class to apply to items upon hover
	 */
	overItemClass: 'x-view-over',
	trackOver: true,
	/**
	 * @cfg
	 * Name of a {@link Workspace.DDManager.addHandler MIME type} (can be made up) to 
	 * identify this type of object to the {@link Workspace.DDManager drag and drop manager}.
	 * You'll also need to {@link Workspace.DDManager.addHandler add a handler} for this
	 * MIME type. See {@link App.usr.nodal.MotifPalette} for an example.
	 */
	mimeType: '',
	autoScroll: true,
	
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				xtype:'dataview',
				store: this.store,
				tpl: this.tpl,
				itemSelector: this.itemSelector,
				overItemClass: this.overItemClass,
				trackOver: this.trackOver,
				itemId: 'view'
			}]
		});
		this.callParent(arguments);
		
		/**
		 * @property {Ext.view.View}
		 */
		this.view = this.getComponent('view');
		
		this.view.on('refresh',function() {
			this.onRefresh();
		},this)
		
		this.view.on('render', function(v) {
			/**
			 * @property {Ext.dd.DragZone}
			 */
			this.dragZone = new Ext.dd.DragZone(v.getEl(), {
				mimeType: this.mimeType,
					
				// On receipt of a mousedown event, see if it is within a DataView node.
				// Return a drag data object if so.
				getDragData: function(e) {

					// Use the DataView's own itemSelector (a mandatory property) to
					// test if the mousedown is within one of the DataView's nodes.
					var sourceEl = e.getTarget(v.itemSelector, 10);

					// If the mousedown is within a DataView node, clone the node to produce
					// a ddel element for use by the drag proxy. Also add application data
					// to the returned data object.
					if (sourceEl) {
						d = sourceEl.cloneNode(true);
						d.id = Ext.id();
						return {
							ddel: d,
							sourceEl: sourceEl,
							repairXY: Ext.fly(sourceEl).getXY(),
							sourceStore: v.store,
							draggedRecord: v.getRecord(sourceEl),
							mimeType: this.mimeType,
						}
					}
				},
				// Provide coordinates for the proxy to slide back to on failed drag.
				// This is the original XY coordinates of the draggable element captured
				// in the getDragData method.
				getRepairXY: function() {
					return this.dragData.repairXY;
				}
			});
		},this);
	},
	
})
