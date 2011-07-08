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
	initDashboard: function() {
		if(App.User.isLoggedIn()) {
			Ext.get('fp-user-name').update(App.User.name+' ('+App.User.email+')');
		}
	}
});