Ext.define('App.ui.CreateMenu', {
	extend: 'Ext.menu.Menu',
	labelText: 'File Name:',
	createText: 'Create',
	createIconCls: 'tick',
	autoCreateMenu: true,
	initComponent: function() {
		this.extraMenuItems || (this.extraMenuItems = []);
		Ext.apply(this, {
			items: [{
				text: this.labelText,
				canActivate: false,
				iconCls: 'rename',
			},{
				xtype: 'textfield',
				allowBlank: false,
				//validate: Ext.bind(this.validate,this),
				iconCls: 'rename',
				ref: 'fileNameField',
				indent: true,
			},].concat(this.extraMenuItems,[{
				text: this.createText,
				iconCls: this.createIconCls,
				ref: 'createButton',
				disabled: true,
				menu: Ext.apply(this.getCreateMenu(), {
					ref: 'createMenu',
				}),
			}])
		});
		this.callParent(arguments);
		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);
		this.fileNameField.on('validitychange', function(field, isValid) {
			this.createButton.setDisabled(!isValid);
		},this);
		this.createButton.on('click', function() {
			var name=this.fileNameField.getValue();
			this.onCreateButton(name);
		},this);
		if(this.createMenu) {
			this.createMenu.on('click', function(menu,item,e) {
				if(item) {
					var type = item.type, name=this.fileNameField.getValue(), fullName = (type!='folder') ? App.Path.addExt(name,type) : name;
					this.onCreate(type,name,fullName);
				}
			},this);
		}
	},
	// validate: function(value) {
	// return !Ext.isEmpty(value);
	// },
	onCreate: function(type,name,fullName) {
		App.ui.filesTree.newFileUnderSelection(fullName);
	},
	getCreateMenu: function() {
		if(!this.autoCreateMenu) {
			return false;
		}
		return {

			items:[{
				text: 'Nodal System',
				iconCls: 'nodal',
				type: 'nodal',
			},{
				text: 'DyNAML File',
				iconCls: 'dynaml',
				type: 'dynaml',
			},'-',{
				text: 'Pepper System',
				iconCls: 'pepper',
				type: 'sys',
			},{
				text: 'Pepper Component',
				iconCls: 'pepper',
				type: 'comp',
			},{
				text: 'Pepper Intermediate (PIL)',
				iconCls: 'pil',
				type: 'pil',
			},'-',{
				text: 'NUPACK Multi-objective script',
				iconCls: 'nupack',
				type: 'nupack',
			},{
				text: 'Sequence',
				iconCls: 'seq',
				type: 'seq',
			},'-',{
				text: 'Chemical Reaction Network',
				iconCls: 'crn',
				type: 'crn',
				disabled: true,
			},{
				text: 'SBML File',
				iconCls: 'sbml',
				type: 'sbml',
				disabled: true,
			},'-',{
				text: 'HTML File',
				iconCls: 'html',
				type: 'html',
			},{
				text: 'XML File',
				iconCls: 'xml',
				type: 'xml',
			},{
				text: 'Javascript File',
				iconCls: 'js',
				type: 'js',
			},{
				text: 'Text File',
				iconCls: 'txt',
				type: 'txt',
			},'-',{
				text: 'Folder',
				iconCls: 'folder',
				type: 'folder'
			}]
		};
	}
});