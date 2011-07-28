Ext.define('App.ui.TabPanel', {
	extend : 'Ext.tab.Panel',
	bodyCls : 'x-docked-noborder-top',
	items : [],
	initComponent : function() {
		this.mon(this, {
			scope : this,
			afterlayout : this.onAfterLayout,
			single : true
		});
		this.callParent(arguments);
	},
	onAfterLayout : function() {
		this.mon(this.tabBar.el, {
			scope : this,
			contextmenu : this.onContextMenu,
			delegate : 'div.x-tab'
		});
	},
	onContextMenu : function(event, target) {
		App.ui.Launcher.getAppMenu().showAt(event.getXY());
		event.preventDefault();
	}
})