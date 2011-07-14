////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.ElementObject
 * Represents a workspace object rendered by an HTML element
 * @extends Workspace.objects.Object2d
 * @abstract
 */
// Workspace.objects.ElementObject = {};
Ext.define('Workspace.objects.ElementObject', {
	constructor : function(workspace, config) {
		Workspace.objects.ElementObject.superclass.constructor.call(this, workspace, config);

		Ext.applyIf(this, {
			/**
			 * @cfg elementSpect
			 * An Ext.DomHelper spec describing the element to be created
			 */
			elementSpec : {}
		});

		Ext.applyIf(this.elementSpec, {
			tag : 'div',
			cls : ''
		});

	},
	requires: ['Workspace.Proxy'],
	alias : 'Workspace.ElementObject',
	extend : 'Workspace.objects.Object2d',
	wtype : 'Workspace.objects.ElementObject',
	/**
	 * render
	 * Builds this object's element and sets its position
	 */
	render : function() {
		this.element = this.workspace.addElement(this.elementSpec);
		this.element.addCls('workspace-object');
		this.element.set({
			'objectId' : this.getId()
		});
		this.element.position('absolute');
		this.element.setLeft(this.x);
		this.element.setTop(this.y);
		this.element.setWidth(this.width);
		this.element.setHeight(this.height);
		this.buildEvents();
		Workspace.objects.ElementObject.superclass.render.apply(this, arguments);
	},
	/**
	 * buildEvents
	 * Attaches event handlers to the object to invoke appropriate methods.
	 * Should be called if contentEditable is changed on the element, which breaks attached event listeners
	 */
	buildEvents : function() {
		this.element.un('click', this.click, this);
		this.element.un('dblclick', this.dblclick, this);
		this.element.un('mouseup', this.mouseup, this);
		this.element.un('mousedown', this.mousedown, this);
		this.element.un('mousemove', this.mousemove, this);
		this.element.un('mouseover', this.mouseover, this);
		this.element.un('mouseout', this.mouseout, this);

		this.element.on('click', this.click, this);
		this.element.on('dblclick', this.dblclick, this);
		this.element.on('mouseup', this.mouseup, this);
		this.element.on('mousedown', this.mousedown, this);
		this.element.on('mousemove', this.mousemove, this);
		this.element.on('mouseover', this.mouseover, this);
		this.element.on('mouseout', this.mouseout, this);

	},
	/**
	 * updateX
	 * Updates the element's position. Called automatically when x property is changed
	 * @private
	 * @param {Object} x
	 */
	updateX : function(x) {
		this.element.setLeft(x);
		Workspace.objects.ElementObject.superclass.updateX.call(this, x);
	},
	/**
	 * updateY
	 * Updates the element's position. Called automatically when y property is changed
	 * @private
	 * @param {Object} y
	 */
	updateY : function(y) {
		this.element.setTop(y);
		Workspace.objects.ElementObject.superclass.updateY.call(this, y);
	},
	/**
	 * updateWidth
	 * Updates the element's dimensions. Called automatically when width property is changed
	 * @private
	 * @param {Object} w
	 */
	updateWidth : function(w) {
		this.element.setWidth(w);
		Workspace.objects.ElementObject.superclass.updateWidth.call(this, w);
	},
	/**
	 * updateHeight
	 * Updates the element's dimensions. Called automatically when height property is changed
	 * @private
	 * @param {Object} h
	 */
	updateHeight : function(h) {
		this.element.setHeight(h);
		Workspace.objects.ElementObject.superclass.updateHeight.call(this, h);
	},
	/**
	 * getEl
	 * @return {Ext.Element}
	 */
	getEl : function() {
		return this.element;
	},
	destroy : function() {
		Ext.destroy(this.element);
		Workspace.objects.ElementObject.superclass.destroy.apply(this, arguments);
	}
}, function() {
	Workspace.reg('Workspace.objects.ElementObject', Workspace.objects.ElementObject);
});