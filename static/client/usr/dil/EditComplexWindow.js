/**
 * Shows a window allowing editing of Complex objects
 */
Ext.define('App.usr.dil.EditComplexWindow', {
	extend: 'Ext.window.Window',
	requires: ['App.usr.dil.EditComplexPanel'],
	closable: true,
	closeAction: 'hide',
	maximizable: true,
	width: 500,
	height: 300,
	renderTo: Ext.getBody(),
	autoRender: false,
	layout: 'fit',
	border: false,
	bodyBorder: false,

	initComponent: function() {
		Ext.apply(this,{
			items: [Ext.create('App.usr.dil.EditComplexPanel',{
				complex: this.complex,
				strandManager: this.strandManager,
				segmentColors: this.segmentColors,
			})]
		});
		this.callParent(arguments);
	},

});