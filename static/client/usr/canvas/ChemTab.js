/**
 * @class App.usr.canvas.ChemTab
 * Allows editing {@link Workspace.objects.ChemStructureObject}s
 * @extends App.usr.canvas.ToolsTab
 */
Ext.define('App.usr.canvas.ChemTab', {
	extend:'App.usr.canvas.ToolsTab',
	requires: [],
	showIf: function(wtype) {
		return wtype == 'Workspace.objects.ChemStructureObject';
	},
	generateConfig: function() {
		return {
			items:[{
				// 'Bonds' group
				xtype: 'buttongroup',
				title: 'Atoms',
				columns: 5,
				defaults: {
					cellCls: 'table-cell-padded',
					enableToggle: true,
					toggleGroup: 'atoms',
				},
				items: [{
					text: 'C',
					tooltip: {
						text: 'Add carbon atoms'
					}
				},{
					text: 'H',
					tooltip: {
						text: 'Add hydrogen atoms'
					}
				},{
					text: 'O',
					tooltip: {
						text: 'Add oxygen atoms'
					}
				},{
					text: 'N',
					tooltip: {
						text: 'Add nitrogen atoms'
					}
				},{
					text: 'S',
					tooltip: {
						text: 'Add sulfur atoms'
					}
				},{
					text: 'P',
					tooltip: {
						text: 'Add phosphorous atoms'
					}
				},{
					text: 'F',
					tooltip: {
						text: 'Add fluorine atoms'
					}
				},{
					text: 'Cl',
					tooltip: {
						text: 'Add chlorine atoms'
					}
				},{
					text: 'Br',
					tooltip: {
						text: 'Add bromine atoms'
					}
				},{
					text: 'I',
					tooltip: {
						text: 'Add iodine atoms'
					}
				},]
			},{
				// 'Bonds' group
				xtype: 'buttongroup',
				title: 'Bonds',
				columns: 5,
				defaults: {
					cellCls: 'table-cell-padded',
					enableToggle: true,
					toggleGroup: 'chem',
				},
				items: [{
					iconCls: 'bond-single',
					tooltip: {
						title: 'Single Bond',
						text: 'Draw single bonds.'
					}
				},{
					iconCls: 'bond-single-down',
					tooltip: {
						title: 'Single Bond (Down stereochemistry)',
						text: 'Draw single bonds with down-facing stereochemistry'
					}
				},{
					iconCls: 'bond-single-up',
					tooltip: {
						title: 'Single Bond (Up stereochemistry)',
						text: 'Draw single bonds with up-facing stereochemistry'
					}
				},{
					iconCls: 'bond-double',
					tooltip: {
						title: 'Double Bond',
						text: 'Draw double bonds.'
					}
				},{
					iconCls: 'bond-triple',
					tooltip: {
						title: 'Triple',
						text: 'Draw triple bonds.'
					}
				},]
			},{
				// 'Rings' group
				xtype: 'buttongroup',
				title: 'Rings',
				columns: 5,
				defaults: {
					cellCls: 'table-cell-padded',
					enableToggle: true,
					toggleGroup: 'chem',
				},
				items: [{
					iconCls: 'cyclohexane',
					tooltip: {
						title: 'Cyclohexane',
						text: 'Draw a cyclohexane ring.'
					}
				},{
					iconCls: 'benzene',
					tooltip: {
						title: 'Benzene',
						text: 'Draw a benzene ring'
					}
				},{
					iconCls: 'cyclopropane',
					tooltip: {
						title: 'Cyclopropane',
						text: 'Draw a cyclopropane ring'
					}
				},{
					iconCls: 'cyclobutane',
					tooltip: {
						title: 'Cyclobutane',
						text: 'Draw a cyclobutane ring'
					}
				},{
					iconCls: 'cyclopentane',
					tooltip: {
						title: 'Cyclopentane',
						text: 'Draw a cyclopentane ring'
					}
				},{
					iconCls: 'cycloheptane',
					tooltip: {
						title: 'Cycloheptane',
						text: 'Draw a cycloheptane ring'
					}
				},{
					iconCls: 'cyclooctane',
					tooltip: {
						title: 'Cyclooctane',
						text: 'Draw a cyclooctane ring'
					}
				}]
			},{
				// 'Charges' group
				xtype: 'buttongroup',
				title: 'Charge',
				columns: 5,
				defaults: {
					cellCls: 'table-cell-padded',
					enableToggle: true,
					toggleGroup: 'chem',
				},
				items: [{
					iconCls: 'charge-positive',
					tooltip: {
						title: 'Formal Positive Charge',
						text: 'Adds a formal positive charge to an atom'
					}
				},{
					iconCls: 'charge-negative',
					tooltip: {
						title: 'Formal Negative Charge',
						text: 'Adds a formal positive charge to an atom'
					}
				}]
			}]
		};
	}
});