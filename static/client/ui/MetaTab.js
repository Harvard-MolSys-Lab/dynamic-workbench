/**
 * @class App.ui.MetaTab
 * Ribbon panel which displays properties of an object
 * @extends App.ui.BoundObjectPanel
 */
Ext.define('App.ui.MetaTab', {
	extend:'App.ui.BoundObjectPanel',
	initComponent: function() {
		Ext.apply(this, {
			tbar: [{

				// Name group
				xtype: 'buttongroup',
				title: 'Name',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					ref: '../../nameField',
					fieldLabel: 'Name',
					objectBinding: 'name',
					xtype: 'textfield',
					width: 200,
					tooltip: {
						title: 'Name',
						text: 'The object\'s name'
					},
				},{
					ref: '../../typeField',
					xtype: 'combo',
					objectBinding: 'wtype',
					store: Workspace.Components.getTypeStore(),
					tpl: new Ext.XTemplate(
					'<tpl for="."><div class="x-combo-list-item">',
					'<img src="' + Ext.BLANK_IMAGE_URL + '" class="combo-icon {iconCls}" />&nbsp;<span>{wtype}</span>',
					'</div></tpl>'
					),
					valueField: 'wtype',
					displayField: 'wtype',
					typeAhead: true,
					mode: 'local',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: true,
					width: 200,
					tooltip: {
						title: 'Type',
						text: 'The object type.'
					},
					cellCls: 'table-cell-padded-right'
				}]
			},{

				// Properties group
				xtype: 'buttongroup',
				title: 'Properties',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: []
			}]
		});

		App.ui.MetaTab.superclass.initComponent.apply(this, arguments);

		//this.on('afterrender', this.afterrender, this);
	},
	afterrender: function() {
		var tips = [this.nameField];
		this.tips = [];
		Ext.each(tips, function(field) {
			if (field.tooltip) {
				var t = field.tooltip;
				if (t.text && !t.html) {
					t.html = t.text;
				}
				t.target = field.getEl();
				this.tips.push(new Ext.ToolTip(t));
			}
		},
		this)
	}
});