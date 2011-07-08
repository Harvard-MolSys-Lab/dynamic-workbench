/**
 * @class App.ui.InsertTab
 * Allows insertion of various vector and HTML objects
 * @extends App.ui.ToolsTab
 */
Ext.define('App.ui.InsertTab', {
	extend:'App.ui.ToolsTab',
	generateConfig: function() {
		return {
			tbar:[{
				// 'Insert' group
				xtype: 'buttongroup',
				title: 'Insert',
				columns: 5,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					iconCls: 'line',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'line',
					tooltip: {
						title: 'Line',
						text: 'Draw straight lines. Click and drag to draw a line; release to finish.'
					}
				},{
					iconCls: 'rect',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'rect',
					tooltip: {
						title: 'Rectangle',
						text: 'Draw rectangles. Click and drag a box to draw; release to finish.'
					}
				},{
					iconCls: 'ellipse',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'ellipse',
					tooltip: {
						title: 'Ellipse',
						text: 'Draw ellipses. Click and drag to draw; release to finish.'
					}
				},{
					iconCls: 'polygon',
					toggleGroup: 'toolbox',
					enableToggle: true,
					tooltip: {
						title: 'Polygon',
						text: 'Draw closed polygons. Click once to start drawing; each click adds a point. Double-click to finish'
					},
					toolName: 'polygon'

				},{
					iconCls: 'path',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'polyline',
					tooltip: {
						title: 'Polylines',
						text: 'Draw open polygons. Click once to start drawing; each click adds a point. Double-click to finish'
					}
				},{
					iconCls: 'text-icon',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'textbox',
					tooltip: {
						title: 'Text Tool',
						text: 'Enter and edit text. Click or click and drag to insert a textbox. Click a textbox to edit text.'
					}
				},{
					iconCls: 'math-icon',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'math',
					tooltip: {
						title: 'Equations',
						text: 'Insert mathematical equations. Click and drag to draw an equation box.'
					}
				},]
				/*{
				 iconCls: 'curve',
				 toggleGroup: 'toolbox',
				 enableToggle: true,
				 toolName: 'curve',
				 disabled: true,
				 },{
				 iconCls: 'image',
				 enableToggle: false,
				 disabled: true,
				 handler: function() {
				 this.uploaderWindow.show();
				 },
				 scope: this
				 }*/

			}]
		};
	}
});