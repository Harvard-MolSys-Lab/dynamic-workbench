/**
 * Allows motifs to be added to workspace by drag and drop
 */
Ext.define('App.ui.MotifPalette', {
	extend:'Ext.panel.Panel',
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				xtype:'dataview',
				store: Workspace.objects.dna.motifStore,
				tpl: '<tpl for=".">'+
				'<div class="motif-template">'+
				'<img src="images/motifs/m{number}.gif" />'+
				'</div>'+
				'</tpl><div class="x-clear" />',
				itemSelector: 'div.motif-template',
				overItemClass: 'x-view-over',
				trackOver: true,
				itemId: 'view'
			}]
		});
		this.callParent(arguments);
		
		/**
		 * @property {Ext.view.View}
		 */
		this.view = this.getComponent('view');

		this.view.on('render', function(v) {
			/**
			 * @property {Ext.dd.DragZone}
			 */
			this.dragZone = new Ext.dd.DragZone(v.getEl(), {

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
							mimeType: 'ext/motif'
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
	}
})
