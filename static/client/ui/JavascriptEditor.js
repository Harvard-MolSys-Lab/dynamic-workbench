Ext.define('App.ui.JavascriptEditor', {
	extend : 'App.ui.TextEditor',
	iconCls : 'js',
	editorType : 'JS',
	mode : 'javascript',
	mixins : {
		'refHelper' : 'App.ui.RefHelper',
	},
	initComponent : function() {
		Ext.applyIf(this, {
			tbar : [{
				text : 'Run',
				iconCls: 'run',
				ref : 'runButton',
				xtype : 'splitbutton',
				menu: this.buildAppMenu(),
				handler : function() {
					this.executeInContext(this)
				},
				scope: this,
			}, '->', Ext.create('App.ui.SaveButton', {
				text : 'Save',
				iconCls : 'save',
				app : this,
			})],
			items : [{
				xtype : 'codemirror',
				itemId : 'editor',
				border : false,
				mode : this.mode,
			}],
		});
		this.callParent(arguments);
		this.mixins.refHelper.init.apply(this);
		this.runButton.on('arrowclick', function(btn) {
			btn.menu = this.buildAppMenu();
		},this);
	},
	buildAppMenu : function() {
		return App.ui.Launcher.getAppMenu(Ext.bind(function(app) {
				this.executeInContext(app);
			}, this));
	},
	executeInContext : function(app) {
		App.ui.Launcher.console.executeInContext(this.getValue(), app, true);
	}
})