/**
 * @class App.ui.GeometryTab
 * Ribbon panel which displays the position and dimensions of an object
 * @extends App.ui.BoundObjectPanel
 */
Ext.define('App.ui.GeometryTab', {
	extend:'App.ui.BoundObjectPanel',
	initComponent: function() {
		Ext.apply(this, {
			tbar: [{

				// Position group
				xtype: 'buttongroup',
				title: 'Position',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					ref: '../../xField',
					fieldLabel: 'X',
					objectBinding: 'x',
					xtype: 'numberfield',
					width: 100,
					tooltip: {
						title: 'x position',
						text: 'The object\'s x position'
					},
				},{
					ref: '../../yField',
					fieldLabel: 'Y',
					objectBinding: 'y',
					xtype: 'numberfield',
					width: 100,
					tooltip: {
						title: 'y position',
						text: 'The object\'s y position'
					},
				}]
			},{

				// Dimensions group
				xtype: 'buttongroup',
				title: 'Dimensions',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					ref: '../../widthField',
					fieldLabel: 'Width',
					objectBinding: 'width',
					xtype: 'numberfield',
					width: 100,
					tooltip: {
						title: 'Width',
						text: 'The object\'s width'
					},
				},{
					ref: '../../heightField',
					fieldLabel: 'Height',
					objectBinding: 'height',
					xtype: 'numberfield',
					width: 100,
					tooltip: {
						title: 'Height',
						text: 'The object\'s height'
					},
				}]
			}]
		});

		App.ui.GeometryTab.superclass.initComponent.apply(this, arguments);

		//this.on('afterrender', this.afterrender, this);
	},
	afterrender: function() {
		var tips = [this.xField, this.tField, this.widthField, this.heightField];
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