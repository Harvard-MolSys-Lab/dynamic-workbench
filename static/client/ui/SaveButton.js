Ext.define('App.ui.SaveButton', {
	extend : 'Ext.button.Split',
	text: 'Save',
	iconCls: 'save',
	saveText : 'Save',
	createText : 'Create',
	initComponent : function() {

		this.overwrite = Ext.create('Ext.menu.CheckItem', {
			text : 'Overwrite exiting file',
			checked : !!(this.app && this.app.document),
			tooltip : {
				title : 'Overwrite',
				text : 'Check this to overwrite the selected file with the contents of this document. ' +
				 'Uncheck to make a new document with the name you\'ve entered above.',
				anchorToTarget : true,
				anchor : 'left',
			}
		})

		this.saveMenu = Ext.create('App.ui.CreateMenu', {
			extraMenuItems : [this.overwrite],
			autoCreateMenu : false,
			createText : this.createText,
			onCreateButton : Ext.bind(function(fullName) {
				var file;
				if(this.overwrite.checked) {
					// overwrite the selected file
					file = App.ui.filesTree.getSelectionModel().getLastSelected();
				} else {
					// make a new file under/parallel to selection	
					file = App.ui.filesTree.newFileUnderSelection(fullName);
				}

				this.app.bindDocument(file);
				this.app.saveFile();
			}, this),
		});
		this.saveMenu.fileNameField.on('afterrender', this.afterrender, this)

		Ext.apply(this, {
			handler : this.click,
			scope : this,
			menu : this.saveMenu,
		});
		this.callParent(arguments);
		this.on('menushow', this.menushow, this);
		this.on('menuhide', this.menuhide, this);

		this.overwrite.on('checkchange', this.changeOverwrite, this);
	},
	selectionChange : function(sm, rec) {
		rec = sm.getLastSelected();
		if(rec) {
			this.overwrite.setDisabled(!rec.isLeaf());
		}
	},
	changeOverwrite : function(item, checked) {
		this.saveMenu.fileNameField.setDisabled(checked);
		this.saveMenu.createButton.setText( checked ? this.saveText : this.createText)
	},
	afterrender : function() {
		this.tip = Ext.create('Ext.tip.ToolTip', {
			target : this.saveMenu.fileNameField.getEl(),
			autoHide : true,
			anchorToTarget : true,
			anchor : 'left',
			//defaultAlign : 'tl-tr?',
			//closable : true,
			title : 'Save file',
			html : 'Select a folder in the <b>Files</b> pane to the left, then enter a file name here.',
			// autoShow : true,
		});
	},
	menushow : function() {
		this.changeOverwrite(this.overwrite,this.overwrite.checked);
		App.ui.filesTree.getSelectionModel().on('selectionchange', this.selectionChange, this);
		if(this.app && this.app.document) {
			this.saveMenu.fileNameField.setValue(this.app.document.get('text'));
			App.ui.filesTree.getSelectionModel().select(this.app.document);
		}
	},
	menuhide : function() {
		App.ui.filesTree.getSelectionModel().un('selectionchange', this.selectionChange, this);
	},
	click : function() {
		if(this.app) {
			if(this.app.document) {
				this.app.saveFile();
			} else {
				this.showMenu();
			}
		}
	}
})