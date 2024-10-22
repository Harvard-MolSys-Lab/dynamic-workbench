/**
 * Allows editing of scripts for the NUPACK multi-objective designer
 */
Ext.define('App.usr.nupack.Editor', {
	extend: 'App.usr.text.Editor',
	iconCls:'nupack',
	editorType: 'NUPACK',
	mode: 'nupack',
	alias: 'widget.nupack',
	requires: ['App.ui.SequenceThreader','App.ui.NupackMenu'],
	/**
	 * @cfg
	 * True to show the #nupackButton
	 */
	showNupackButton:true,
	/**
	 * @cfg
	 * True to show the edit button
	 */
	showEditButton:true,
	/**
	 * @cfg
	 * True to show the save button
	 */
	showSaveButton:true,
	
	/**
	 * @cfg
	 * Enable additional multisubjective syntax
	 */
	multisubjective: false,
	
	/**
	 * @cfg
	 * Display citation bar
	 */
	showCite: true,
	cite: 'zadeh_etal_2011',
	
	initComponent: function() {
		if(this.multisubjective) {
			this.mode = {
				name: 'nupack',
				multisubjective: true,
			}
		}
		
		this.extraTbarItems = (this.extraTbarItems || []); 
		var tbar = this.extraTbarItems.concat([]);
		if(this.showNupackButton) {
			tbar.push({
				xtype: 'splitbutton',
				/**
				 * @property {Ext.button.Button} nupackButton
				 * Shows a menu allowing the user to open NUPACK
				 */
				ref :'nupackButton',
				text: 'Open NUPACK',
				iconCls: 'nupack-icon',
				handler: App.ui.Launcher.makeLauncher('nupack'),
				menu: Ext.create('App.ui.NupackMenu',{
					listeners : {
						'designwindow': {
							fn: this.populateDesignWindow,
							scope: this,
						}
					}
				}),
			});
		}
		if(this.showEditButton) {
			tbar.push({
				text: 'Edit',
				iconCls: 'pencil',
				/**
				 * @property {Ext.button.Button} editButton
				 * Shows a small edit menu
				 */
				ref: 'editButton',
				menu: [{
					text: 'Thread segments to strands',
					iconCls: 'thread-sequences',
					handler: this.threadStrands,
					scope: this,
				},]
			})
		}
		if(this.showSaveButton) {
			tbar = tbar.concat(['->',Ext.create('App.ui.SaveButton',{
				app: this,
			})]);
		}
		Ext.apply(this, {
			tbar: tbar,
			bbar: Ext.create('Ext.ux.statusbar.StatusBar',{
				ref: 'statusBar',
				items: [{
					xtype: 'tbtext',
					baseText: 'Lines: ',
					text: 'Lines: ',
					name: 'lineNo',
				},'-',{
					xtype: 'tbtext',
					baseText: 'Cols: ',
					text: 'Cols: ',
					name: 'colNo',
				}]
			})
		});
		
		if(this.showCite) {
			Ext.apply(this,{
				dockedItems: [{
					xtype: 'cite',
					cite: this.cite,
				}],
			});
		}
		
		this.callParent(arguments);
		this.selField = this.down('[name=selField]');
		this.lineNo = this.down('[name=lineNo]');
		this.colNo = this.down('[name=colNo]');
		this.editor.on('cursorchange',this.updateStatusBar,this,{buffer: 500});
		this.editor.on('cursorchange',this.updateHelp,this)
	},
	updateStatusBar: function() {
		var sel = this.getSelection(),
			selRange = this.getCursorRange();
			
		if(selRange[0].line != selRange[1].line || selRange[0].ch != selRange[1].ch) {
			this.lineNo.setText('Lines: ' + [selRange[0].line,' &rarr; ',selRange[1].line,' (',Math.abs(selRange[1].line-selRange[0].line)+1,')'].join(''));
			this.colNo.setText('Cols: ' + [selRange[0].ch,' &rarr; ',selRange[1].ch,' (',sel.length,')'].join(''));
		} else {
			this.lineNo.setText('Line: ' + selRange[0].line);
			this.colNo.setText('Col:' + selRange[0].ch);
		}
	},
	updateHelp: function() {
		// var selRange = this.getCursorRange();
		// var tokens = [];
		// var pos = selRange[0];
// 		
// 		
		// do {
			// var token = this.editor.codemirror.getTokenAt(pos);
			// tokens.push(token);
			// if(!token || (token.end > selRange[1].ch)) {
				// break;
			// }
		// } while(!!token)
// 		
// 		
		
	},
	populateDesignWindow: function(menu,designWindow) {
		designWindow.updateDesign(this.getValue());
	},
	/**
	 * Opens a {@link App.ui.SequenceThreader sequence threader}, allowing the 
	 * user to thread together sequences based on a sequence specification into
	 * full strands.
	 */
	threadStrands: function() {
		var win = Ext.create('App.ui.SequenceThreader');
		win.show();
		var seqs = _.chain(this.getValue().split('\n')).map(function(line) {
			var parts = line.match(/domain\s+([\w\d]+)\s*[=:]\s*([A-Za-z]+)/);
			if(parts != null && parts.length >= 3) {
				return parts[1] + ' : ' + parts[2];
			} else {
				return null;
			}
		}).compact().value().join('\n');
		
		var strands = _.chain(this.getValue().split('\n')).map(function(line) {
			var parts = line.match(/strand\s+([\w\d]+)\s*[=:]\s*(.+)/);
			if(parts != null && parts.length >= 3) {
				return parts[1] + ' : ' + parts[2];
			} else {
				return null;
			}
		}).compact().value().join('\n');
				
		win.setSequences(seqs);
		win.setStrands(strands);
	},
}
)