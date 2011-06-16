Ext.define('Workspace.components.WorkspacePanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.workspacepanel',
	wtype: 'workspacepanel',
	mixins: {
		noun: 'Machine.nouns.ComponentNoun'
	},
	constructor: function() {
		var config = this.mixins.noun.constructor.apply(this,arguments);
		this.superclass.constructor.call(this,config);
		this.expose('title',true,this.setTitle,true,false);
		this.expose('html',true,this.update,true,false);
	},
});

Ext.onReady( function() {
	ws = Ext.ComponentManager.create({
		xtype: 'viewport',
		items:[{
			xtype: 'workspace',
			layout: 'auto',
			items:[{
				xtype:'workspacepanel',
				title: 'Hello World',
				layout: 'auto',
				items: [{
					xtype: 'panel',
					title: 'Subpanel',
					html: 'Lorem ipsum sit dolor amet',
					//resizable: {handles: 'all'},
					floating: true,
					draggable: true,
					width: 200,
					height: 200,
					autoShow: true,
					x: 100,
					y: 100,
				}],
				floating: true,
				draggable: true,
				autoShow: true,
				x: 20,
				y: 30,
				width: 500,
				height: 500,
			}],
			renderTo: document.body,
		}]
	});

	/*
	 Ext.create('Ext.window.Window', {
	 title: 'Hello',
	 width: 100,
	 height: 100,
	 html: 'Hello World',
	 }).show();

	 Ext.create('Ext.container.Viewport', {
	 layout: 'fit',
	 items: [{
	 xtype: 'panel',
	 layout: 'border',
	 tbar: {
	 items: [{
	 text: 'InfoMachine 2'
	 },'|',{
	 text: 'New',
	 menu: {
	 items: [{
	 text: 'Nodal system...'
	 },{
	 text: 'Strand system...'
	 },{
	 text: 'Species...'
	 }]
	 }
	 },{
	 text: 'Open',
	 menu: {
	 items: [{
	 text: 'From upload...',
	 },{
	 text: 'From share...'
	 }]
	 }
	 }]
	 },
	 items: [{
	 xtype: 'panel',
	 region: 'west',
	 width: 200,
	 split: true,
	 collapsible: true,
	 title: 'Files',
	 frame: false,
	 border: true,
	 margins: '5 0 5 5',
	 },{
	 xtype: 'panel',
	 region: 'center',
	 margins: '5 5 5 0'
	 }]
	 }]
	 });
	 */

});