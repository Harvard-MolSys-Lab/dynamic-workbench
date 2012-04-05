Ext.define('App.ui.CommandTab', {
	extend: 'App.ui.ToolsTab',
	alias: 'widget.commandtab',
	requires: ['App.ui.CodeMirror'],
	generateConfig: function() {
		this.codemirror = Ext.create('App.ui.CodeMirror',{
			style:'border-width:0;',
			mode: 'javascript',
			bodyStyle: 'background: #fff !important;',
			frame: false,
			rbar: [{
				iconCls: 'run',
				handler: this.runCommand,
				scope: this,
			}],
			onKeyEvent: Ext.bind(function(editor, e) {
				if(e.keyCode==13 && e.shiftKey && e.type=='keydown') {
					e.stop();
					this.runCommand();
					return false;
				}
			},this)
		});
		return {
			layout: 'fit',
			items: [this.codemirror]
		}
	},
	runCommand: function() {
		var selection = this.ribbon.workspace.getSelection();
		App.ui.Launcher.console.executeInContext(this.codemirror.getValue(),this.ribbon.workspace,true,{
			selection:selection,
		});
	},
},function() {

});

