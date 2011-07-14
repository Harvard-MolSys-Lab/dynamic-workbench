////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.ImageObject
 * Represents a workspace object containing an image
 * @extends Workspace.objects.ElementObject
 */
// Workspace.objects.ImageObject = {};
Ext.define('Workspace.objects.ImageObject', {
	constructor: function(workspace, config) {
		Workspace.objects.ImageObject.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.elementSpec, {
			tag: 'div',
			cls: 'image'
		});

		this.expose('url', true, true, true, false);
		//'getText', 'setText'); //,'text','string');
		this.on('change:url', this.setText, this)
	},
	extend: 'Workspace.objects.ElementObject',
	wtype: 'Workspace.objects.ImageObject',
	name: 'New Image',
	iconCls: 'image-icon',
	/**
	 * @cfg {String} url
	 * URL to the image to be displayed
	 */
	url: '/canvas/uploads/',
	render: function() {
		// build inner HTML
		this.elementSpec.html = '<img src="' + this.get('url') + '" />';
		Workspace.objects.ImageObject.superclass.render.call(this, arguments);

		// auto-calculate position and dimensions if not specified in config
		if (this.get('width') == 0) {
			$(this.getImageEl().dom).load( function() {
				var imageEl = this.getImageEl();
				this.set('width', imageEl.getWidth());
				this.set('height', imageEl.getHeight());
				/*
				 this.set('x', this.getX());
				 this.set('y', this.getY());
				 */
			}.createDelegate(this))
		}
	},
	getUrl: function() {
		return this.get('url');
		//this.text;
	},
	/**
	 * setUrl
	 * Updates the URL; called automatically when url property is set
	 * @private
	 * @param {Object} value
	 */
	setUrl: function(value) {
		this.getImageEl().set({
			src: value
		});
	},
	/**
	 * getImageEl
	 * Returns the DOM img element
	 * @return {Ext.Element}
	 */
	getImageEl: function() {
		if (this.getEl())
			return this.getEl().child('img');
	},
	/**
	 * updateWidth
	 * Updates the element's dimensions. Called automatically when width property is changed
	 * @param {Object} w
	 */
	updateWidth: function(w) {
		this.getImageEl().setWidth(w);
		Workspace.objects.ImageObject.superclass.updateWidth.apply(this, arguments);
	},
	/**
	 * updateHeight
	 * Updates the element's dimensions. Called automatically when height property is changed
	 * @param {Object} h
	 */
	updateHeight: function(h) {
		this.getImageEl().setHeight(h);
		Workspace.objects.ImageObject.superclass.updateHeight.apply(this, arguments);
	}
}, function() {
	Workspace.reg('Workspace.objects.ImageObject', Workspace.objects.ImageObject);
});