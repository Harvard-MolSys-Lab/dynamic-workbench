////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.BaseTool
 * Base class for all user interactions with the workspace. A tool represents a set of functions to handle
 * various mouse-based interactions with the workspace, as well as an optional Ext.KeyMap. Each of the mouse
 * handler functions below is invoked by the workspace, and is passed the Ext.EventObject for the event,
 * as well as a reference to a Workspace.Object, if the event occurred in a workspace object.
 * @extends Ext.util.Observable
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.BaseTool', {
	constructor: function(workspace, config) {
		Workspace.tools.BaseTool.superclass.constructor.call(this); //, arguments);
		Ext.apply(this, config, {
			keyMapping: false
		});
		this.workspace = workspace;
		if (this.keyMapping) {
			this.keyMap = new Ext.KeyMap(this.workspace.element, this.keyMapping);
			this.keyMap.stopEvent = true;
			this.keyMap.disable();
		}
	},
	extend:'Ext.util.Observable',
	click: function(e, item) {

	},
	dblclick: function(e, item) {

	},
	mousedown: function(e, item) {

	},
	mouseup: function(e, item) {

	},
	mousemove: function(e, item) {

	},
	mouseover: function(e, item) {

	},
	mouseout: function(e, item) {

	},
	getAdjustedXY: function(e) {
		return this.getAdjustedXYcoords(e.getPageX(), e.getPageY());
	},
	getAdjustedXYcoords: function(x, y) {
		var pos = this.workspace.lens.getAdjustedXYcoords(
		(x - this.workspace.element.getX()),
		(y - this.workspace.element.getY())
		);
		return pos;
	},
	/**
	 * activate
	 * Performs a tool's set-up
	 */
	activate: function() {
		if (this.keyMap)
			this.keyMap.enable();
	},
	/**
	 * deactivate
	 * Performs a tool's clean-up before another tool takes over
	 */
	deactivate: function() {
		if (this.keyMap)
			this.keyMap.disable();
	}
});