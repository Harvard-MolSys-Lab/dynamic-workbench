/**
 * Allows editing and execution of Javascript code within the interface.
 */
Ext.define('App.ui.JavascriptEditor', {
	extend : 'App.ui.TextEditor',
	iconCls : 'js',
	editorType : 'JS',
	mode : 'javascript',
	mixins : {
		'refHelper' : 'App.ui.RefHelper',
	},
	initComponent : function() {
		if(!!this.json) {
			this.mode = {
				mode: 'javascript',
				json: true,
			};
			this.editorType = 'JSON';
		}
		Ext.applyIf(this, {
			tbar : [{
				text : 'Run',
				iconCls: 'run',
				/**
				 * @property {Ext.button.Button}
				 * Button wo which the {@link #buildAppMenu app menu} is 
				 * attached; can be used to run the script in the context of an
				 * App.ui.Application
				 */
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
	/**
	 * Builds a menu containing a list of {@link App.ui.Application apps} 
	 * registered with App.ui.Launcher. 
	 * 
	 */
	buildAppMenu : function() {
		return App.ui.Launcher.getAppMenu(Ext.bind(function(app) {
				this.executeInContext(app);
			}, this));
	},
	/**
	 * Executes code in this editor in the context of the passed {@link App.ui.Application app}
	 */
	executeInContext : function(app) {
		App.ui.Launcher.console.executeInContext(this.getValue(), app, true);
	}
})