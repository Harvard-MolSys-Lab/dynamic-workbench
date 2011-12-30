/**
 * Simple menu allowing the user to open a tab containing the Caltech [NUPACK web server](http://www.nupack.org/)
 */
Ext.define('App.ui.NupackMenu', {
	extend: 'Ext.menu.Menu',
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				text: 'Analyze',
				handler: App.ui.Launcher.makeLauncher('nupack/analyze'),
				iconCls: 'nupack-icon',
			},{
				text: 'Design',
				handler: App.ui.Launcher.makeLauncher('nupack/design'),
				iconCls: 'nupack-icon',
			},{
				text: 'Utilities',
				handler: App.ui.Launcher.makeLauncher('nupack/utilities'),
				iconCls: 'nupack-icon',
			}]
		});
		this.callParent(arguments);
	}
});
