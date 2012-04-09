/**
 * Simple menu allowing the user to open a tab containing the Caltech [NUPACK web server](http://www.nupack.org/)
 */
Ext.define('App.ui.NupackMenu', {
	require: ['App.ui.nupack.DesignWindow','App.ui.nupack.PartitionWindow',],
	extend: 'Ext.menu.Menu',
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				text: 'Analyze...',
				handler: this.openPartitionWindow,//App.ui.Launcher.makeLauncher('nupack/analyze'),
				iconCls: 'nupack-icon',
			},{
				text: 'Design...',
				handler: this.openDesignWindow,//App.ui.Launcher.makeLauncher('nupack/design'),
				scope: this,
				iconCls: 'nupack-icon',
			},{
				text: 'Utilities',
				handler: App.ui.Launcher.makeLauncher('nupack/utilities'),
				iconCls: 'nupack-icon',
			}]
		});
		this.callParent(arguments);
	},
	openDesignWindow: function() {
		if(!this.designWindow) {		
			this.designWindow = Ext.create('App.ui.nupack.DesignWindow');
		}
		this.designWindow.show();
		this.fireEvent('designwindow',this,this.designWindow);
	},
	openPartitionWindow: function() {
		if(!this.partitionWindow) {		
			this.partitionWindow = Ext.create('App.ui.nupack.PartitionWindow');
		}
		this.partitionWindow.show();
		this.fireEvent('partitionwindow',this,this.partitionWindow);
	},
});
