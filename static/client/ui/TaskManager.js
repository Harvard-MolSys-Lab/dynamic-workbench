/**
 * @class App.ui.TaskManager
 * Shows current and past tasks running on server
 */
Ext.define('App.ui.TaskManager', {
	extend: 'Ext.panel.Panel',
	initComponent: function() {
		this.grid = Ext.create('Ext.grid.Panel', {
			store: App.TaskRunner.taskStore,
			columns: [{
				dataIndex: 'tool',
				// renderer: function(tool) {
				// 	return '<img src="'+Ext.BLANK_IMAGE_URL+'" style="width:18px;height:18px;" class="'+App.TaskRunner.serverTools[tool].iconCls+'" />';
				// }
			},{
				header: 'Tool',
				dataIndex: 'tool'
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