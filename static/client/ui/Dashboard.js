/**
 * Displays a dashboard allowing common actions to be performed when the IDE opens.
 */
Ext.define('App.ui.Dashboard', {
	extend: 'Ext.panel.Panel',
	initComponent: function() {

		Ext.apply(this, {
			title: 'Dashboard',
			bodyStyle:'padding:10px',
			iconCls: 'dash',
			autoLoad: {
				url: 'html/dashboard.html',
				callback: this.initDashboard,
				scope: this
			}
		});

		App.on('userNameChanged', function(name,email) {
			Ext.get('fp-user-name').update(App.User.name+' ('+App.User.email+')');
		});
		this.callParent();
	},
	/**
	 * Perform custom personization actions upon initialization of the dashboard. 
	 */
	initDashboard: function() {
		if(App.User.isLoggedIn()) {
			Ext.get('fp-user-name').update(App.User.name+' ('+App.User.email+')');
		}
	}
});