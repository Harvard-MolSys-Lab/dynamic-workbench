////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * @class Workspace.objects.IFrameObject
 * Represents a workspace object containing an iframe
 * @extends Workspace.objects.ElementObject
 */
// Workspace.objects.IFrameObject = {};
Ext.define('Workspace.objects.IFrameObject', {
	constructor: function(workspace, config) {
		Workspace.objects.IFrameObject.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.elementSpec, {
			tag: 'div',
			cls: 'iframe'
		});

		this.expose('url', true, true, true, false);
		//'getText', 'setText'); //,'text','string');
		this.on('change:url', this.setUrl, this)
	},
	extend: 'Workspace.objects.ElementObject',
	wtype: 'Workspace.objects.IFrameObject',
	isEditable: false,
	isSelectable: true,
	isResizable: true,
	name: 'New IFrame',
	iconCls: 'iframe-icon',
	width: 300,
	height: 400,
	/**
	 * @cfg {Number} padding
	 * Amount to pad the iframe element (to allow this object to be dragged from iframe edges)
	 */
	padding: 2,
	/**
	 * @cfg {String} url
	 */
	url: '',
	render: function() {
		// build iframe
		this.elementSpec.html = '<iframe src="' + this.getFullUrl() + '" />';
		Workspace.objects.IFrameObject.superclass.render.call(this, arguments);

		// update position and dimensions
		this.set('width', this.getWidth());
		this.set('height', this.getHeight());
		this.getIFrameEl().position('relative');

		// apply "padding" to this element so that iframe can be dragged
		this.getIFrameEl().setLeftTop(this.padding, this.padding);
	},
	/**
	 * getFullUrl
	 * Allows descendent classes to implement URL filtering
	 * @abstract
	 */
	getFullUrl: function() {
		return this.getUrl();
	},
	getUrl: function() {
		return this.get('url');
		//this.text;
	},
	setUrl: function(value) {
		this.getImageEl().set({
			src: value
		});
	},
	/**
	 * getImageEl
	 * Returns the DOM iframe element
	 * @return {Ext.Element}
	 */
	getIFrameEl: function() {
		if (this.getEl())
			return this.getEl().child('iframe');
	},
	updateWidth: function(w) {
		this.getIFrameEl().setWidth(w - (this.padding * 2));
		Workspace.objects.IFrameObject.superclass.updateWidth.apply(this, arguments);
	},
	updateHeight: function(h) {
		this.getIFrameEl().setHeight(h - (this.padding * 2));
		Workspace.objects.IFrameObject.superclass.updateHeight.apply(this, arguments);
	}
}, function() {
	Workspace.reg('Workspace.objects.IFrameObject', Workspace.objects.IFrameObject);
});