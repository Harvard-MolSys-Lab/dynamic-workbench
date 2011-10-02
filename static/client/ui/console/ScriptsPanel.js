/**
 * Console code entry window. Allows execution of arbitrary javascript within the context of the currently active
 * {@link App.ui.Application}. That is, <code>this</code> will refer to the active app. 
 */
Ext.define('App.ui.console.ScriptsPanel', {
	extend: 'Ext.panel.Panel',
	requires: ['App.ui.CodeMirror',],
	id:'x-debug-scripts',
	region: 'east',
	minWidth: 200,
	split: true,
	width: 350,
	border: false,
	layout:'fit',
	bodyBorder: false,
	padding: '0 0 5 0',
	cls: 'noborder-top',
	//	style:'border-width:0 0 0 1px;',

	initComponent : function() {
		
		/**
		 * @property {App.ui.CodeMirror} scriptField
		 * Field into which code is entered
		 */
		this.scriptField = Ext.create('App.ui.CodeMirror',{
			style:'border-width:0;',
			mode: 'javascript',
			tbar: false,
			onKeyEvent: Ext.bind(function(editor, e) {
				if(e.keyCode==13 && e.shiftKey && e.type=='keydown') {
					e.stop();
					this.evalScript();
					return false;
				}
			},this)
		});
		
		/**
		 * @property {Ext.form.Checkbox} trapBox
		 * Checked to trap errors, unchecked to allow them to bubble to the browser console
		 */
		this.trapBox = Ext.create('Ext.form.Checkbox',{
			id: 'console-trap',
			boxLabel: 'Trap Errors',
			checked: true
		});

		this.toolbar = Ext.create('Ext.Toolbar',{
			dock: 'top',
			items:[{
				text: 'Run',
				iconCls: 'run',
				scope: this,
				handler: this.evalScript
			},{
				text: 'Clear',
				iconCls: 'cross',
				scope: this,
				handler: this.clear
			},
			'->',
			this.trapBox,
			' ', ' '
			]
		});

		this.items = [this.scriptField];
		this.dockedItems = [this.toolbar];

		this.callParent(arguments);
	},
	/**
	 * Evaluates the script in {@link #scriptField}
	 */
	evalScript : function() {
		var s = this.scriptField.getValue();
		this.executeInContext(s,App.ui.active(),this.trapBox.getValue());
	},
	executeInContext: function(s,ctx,trap) {
		if(trap) {
			try {
				var rt = new Function(s);
				rt = rt.apply(ctx); //eval(s);
				Ext.dump(rt === undefined? '(no return)' : rt);
			} catch(e) {
				Ext.log(e.message || e.descript,{iconCls: 'error'});
			}
		} else {
			var rt = new Function(s);
				rt = rt.apply(ctx);
			Ext.dump(rt === undefined? '(no return)' : rt);
		}
	},
	/**
	 * Clears the script entry field
	 */
	clear : function() {
		this.scriptField.setValue('');
		this.scriptField.focus();
	}
});
