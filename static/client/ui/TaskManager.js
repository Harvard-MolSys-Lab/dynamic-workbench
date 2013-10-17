/**
 * Shows current and past tasks running on server
 */
Ext.define('App.ui.TaskManager', {
	extend: 'Ext.panel.Panel',
	initComponent: function() {
		this.grid = Ext.create('Ext.grid.Panel', {
			border: false, bodyBorder: false,
			store: App.TaskRunner.taskStore,
			columns: [{
				dataIndex: 'tool',
				renderer: function(tool) {
					return '<div style="width:18px;height:18px;" class="'+App.TaskRunner.getToolProperty(tool,'iconCls')+'">&nbsp;</div>';
				}
			},{
				header: 'Tool',
				dataIndex: 'tool',
				flex: 1,
			},{
				header: 'Date Submitted',
				dataIndex: 'startDate'
			},{
				header: 'Date Completed',
				dataIndex: 'endDate'
			}]
		});
		Ext.apply(this, {
			items: [this.grid]
		});
		this.callParent(arguments);
	}
})