/**
 * @class App.ui.ObjectProperties
 * Allows creation and editing object properties
 * @extends App.ui.BoundObjectPanel
 */

Ext.define('App.ui.ObjectProperties', {
	extend:'App.ui.BoundObjectPanel',
	constructor: function() {
		App.ui.ObjectProperties.superclass.constructor.apply(this, arguments);
	},
	initComponent: function() {
		this.grid = Ext.create('Ext.grid.property.Grid', {
			border: false,
			bodyBorder: false,
			source: {},
			title: 'All Properites'
		});
		Ext.apply(this, {
			title: 'Selected Object',
			layout: 'accordion',
			items: [this.grid]
		});
		App.ui.ObjectProperties.superclass.initComponent.apply(this,arguments);
		this.grid.on('propertychange',this.onPropertyChange,this);
	},
	bind: function(obj) {
		this.unbind();
		this.boundObject = obj;
		this.boundObject.on('change',this.onObjectChange,this);
		this.grid.setSource(obj.getReadableHash());
	},
	unbind: function(obj) {
		if(this.boundObject) {
			if((obj == this.boundObject) || (!obj)) {
				this.boundObject.un('change',this.onObjectChange,this);
				this.grid.setSource({});
				this.boundObject = false
			}
		}
	},
	onObjectChange: function(prop, val) {
		if(!this.ignore)
			this.grid.setProperty(prop,val,true);
	},
	onPropertyChange: function(src,prop,value) {
		if(this.boundObject) {
			this.ignore = true;
			this.boundObject.set(prop,value);
			this.ignore = true;
		}
	},
	attachTo: function(workspace) {
		this.workspace = workspace;

		// bind ribbon to objects when selected in workspace
		this.mon(this.workspace, 'select', this.bind, this);
		this.mon(this.workspace, 'unselect', this.unbind, this);

	},
})