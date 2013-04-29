Ext.define('App.ui.Console', {
	extend : 'Ext.panel.Panel',
	iconCls : 'terminal',
	region : 'south',
	height : 200,
	split : true,
	collapsible : true,
	collapsed : true,
	collapseMode : 'mini',
	titleCollapse : true,
	title : 'Console',
	layout : 'border',
	initComponent : function() {
		var scriptPanel = this.scriptPanel = Ext.create('Ext.debug.ScriptsPanel');
		var logView = this.logView = new Ext.create('Ext.debug.LogPanel');
		cp = logView;
		Ext.apply(this, {
			items : [scriptPanel, logView],
		});
		
		this.callParent(arguments);
	},
	executeInContext: function() {
		this.scriptPanel.executeInContext.apply(this.scriptPanel,arguments);
	}
});
