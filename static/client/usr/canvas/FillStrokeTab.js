/**
 * @class App.usr.canvas.FillStrokeTab
 * A ribbon tab to manage setting the fill and stroke of objects
 * @extends App.ui.BoundObjectPanel
 */
Ext.define('App.usr.canvas.FillStrokeTab', {
	extend:'App.ui.BoundObjectPanel',
	alias: 'widget.fillstroketab',
	initComponent: function() {
		Ext.apply(this, {
			tbar: [{

				// 'Fill' group
				xtype: 'buttongroup',
				title: 'Fill',
				columns: 1,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [new Ext.ux.ColorField({
					ref: '../../fillColorField',
					//fieldLabel: 'Fill Color',
					objectBinding: 'fill',
					anchor: 'left',
					width: 100,
					tooltip: {
						title: 'Fill Color',
						text: 'Color of the object\'s background (fill).'
					},
					cellCls: 'table-cell-padded-right',
				}),{
					ref: '../../fillOpacityField',
					xtype: 'slider',
					objectBinding: 'fillOpacity',
					objectBindingEvent: 'changecomplete',
					minValue: 0,
					maxValue: 1,
					decimalPrecision: 2,
					animate: true,
					tipText: function(thumb){
		                return String(thumb.value*100) + '%';
		            },
					cellCls: 'table-cell-padded-right',
					width: 100,
					tooltip: {
						title: 'Fill Opacity',
						text: 'Opacity/transparency of the stroke.'
					},
				}]
			},{

				// 'Stroke' group
				xtype: 'buttongroup',
				title: 'Stroke',
				columns: 2,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [new Ext.ux.ColorField({
					ref: '../../strokeColorField',
					anchor: 'left',
					objectBinding: 'stroke',
					width: 100,
					tooltip: {
						title: 'Stroke Color',
						text: 'Color of the object\'s outline (stroke).'
					},
				}),{
					ref: '../../strokeTypeField',
					xtype: 'combo',
					objectBinding: 'strokeDasharray',
					store: new Ext.data.ArrayStore({
						fields: ['name', 'dash_array'],
						data: [['solid', ''], ['dashed', '--'], ['dashed', '-'], ['dashed', '- '], ['dotted', '.'], ['dotted', '. '], ['dashed/dotted', '-.'], ['dashed/dotted', '-..'], ['dashed/dotted', '- .'], ['dashed/dotted', '--.'], ['dashed/dotted', '--..']]
					}),
					listConfig: {
						getInnerTpl: function() {
							return '<span>{name}</span>&nbsp;(<var>{dash_array}</var>)</span>';
						}
					},
					valueField: 'dash_array',
					displayField: 'dash_array',
					typeAhead: true,
					mode: 'local',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: true,
					width: 100,
					tooltip: {
						title: 'Stroke Type',
						text: 'Style of the stroke (solid, dashed, etc.).'
					},
					cellCls: 'table-cell-padded-right'
				},{
					ref: '../../strokeOpacityField',
					xtype: 'slider',
					objectBinding: 'strokeOpacity',
					objectBindingEvent: 'changecomplete',
					minValue: 0,
					maxValue: 1,
					decimalPrecision: 2,
					animate: true,
					tipText: function(thumb){
		                return String(thumb.value*100) + '%';
		            },
					width: 100,
					tooltip: {
						title: 'Stroke Opacity',
						text: 'Opacity/transparency of the stroke.'
					},
				},{
					ref: '../../strokeWidthField',
					xtype: 'slider',
					objectBinding: 'strokeWidth',
					objectBindingEvent: 'changecomplete',
					minValue: 0,
					maxValue: 10,
					decimalPrecision: 1,
					increment: 0.5,
					animate: true,
					tipText: function(thumb){
		                return String(thumb.value) + ' px';
		            },
					width: 100,
					cellCls: 'table-cell-padded-right',
					tooltip: {
						title: 'Stroke Width',
						text: 'Width of the object\'s outline (stroke).'
					},
				}]

			}]
		});

		App.usr.canvas.FillStrokeTab.superclass.initComponent.apply(this, arguments);

		//this.on('afterrender', this.afterrender, this);
	},
});