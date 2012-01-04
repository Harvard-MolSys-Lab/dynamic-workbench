/**
 * Base class for all user interactions with the workspace. A tool represents a set of functions to handle
 * various mouse-based interactions with the workspace, as well as an optional Ext.KeyMap. Each of the mouse
 * handler functions below is invoked by the workspace, and is passed the Ext.EventObject for the event,
 * as well as a reference to a Workspace.Object, if the event occurred in a workspace object.
 * @extends Ext.util.Observable
 */
Ext.define('Workspace.tools.BaseTool', {
	/**
	 * @constructor
	 * @param {Object} workspace
	 * @param {Object} config
	 */
	constructor : function(workspace, config) {
		this.callParent([config]);

		Ext.apply(this, config, {
			/**
			 * @cfg {Object} keyMapping
			 * Config object for an {@link Ext.KeyMap} object which will be
			 * automatically activated upon {@link #activate activation} of this
			 * tool.
			 */
			keyMapping : false
		});
		this.workspace = workspace;
		if(this.keyMapping) {
			/**
			 * @property {Ext.KeyMap} keyMap
			 * {@link Ext.KeyMap Key map} created from the #keyMapping config.
			 */
			this.keyMap = new Ext.KeyMap(this.workspace.element, this.keyMapping);
			this.keyMap.stopEvent = true;
			this.keyMap.disable();
		}
	},
	extend : 'Ext.util.Observable',
	/**
	 * Handles click events on {@link Workspace.object.Object workspace objects}
	 * while this tool is active.
	 * @param {Ext.EventObject} e
	 * @param {Workspace.objects.Object} item
	 */
	click : function(e, item) {

	},
	/**
	 * Handles double-click events on {@link Workspace.object.Object workspace objects}
	 * while this tool is active.
	 * @param {Ext.EventObject} e
	 * @param {Workspace.objects.Object} item
	 */
	dblclick : function(e, item) {

	},
	/**
	 * Handles mousedown events on {@link Workspace.object.Object workspace objects}
	 * while this tool is active.
	 * @param {Ext.EventObject} e
	 * @param {Workspace.objects.Object} item
	 */

	mousedown : function(e, item) {

	},
	/**
	 * Handles mouseup events on {@link Workspace.object.Object workspace objects}
	 * while this tool is active.
	 * @param {Ext.EventObject} e
	 * @param {Workspace.objects.Object} item
	 */

	mouseup : function(e, item) {

	},
	/**
	 * Handles mousemove events on {@link Workspace.object.Object workspace objects}
	 * while this tool is active.
	 * @param {Ext.EventObject} e
	 * @param {Workspace.objects.Object} item
	 */

	mousemove : function(e, item) {

	},
	/**
	 * Handles mouseover events on {@link Workspace.object.Object workspace objects}
	 * while this tool is active.
	 * @param {Ext.EventObject} e
	 * @param {Workspace.objects.Object} item
	 */
	mouseover : function(e, item) {

	},
	/**
	 * Handles mouseout events on {@link Workspace.object.Object workspace objects}
	 * while this tool is active.
	 * @param {Ext.EventObject} e
	 * @param {Workspace.objects.Object} item
	 */
	mouseout : function(e, item) {

	},
	/**
	 * Returns the adjusted X and Y coordinates for a given mouse event
	 * @param {Ext.EventObject} e
	 */
	getAdjustedXY : function(e) {
		return this.getAdjustedXYcoords(e.getPageX(), e.getPageY());
	},
	/**
	 * @inheritdocs Workspace.Lens.getAdjustedXYcoords
	 */
	getAdjustedXYcoords : function(x, y) {
		var pos = this.workspace.lens.getAdjustedXYcoords((x - this.workspace.element.getX()), (y - this.workspace.element.getY()));
		return pos;
	},
	/**
	 * Performs a tool's set-up. Called by {@link Workspace} upon activation.
	 */
	activate : function() {
		if(this.keyMap)
			this.keyMap.enable();
	},
	/**
	 * Performs a tool's clean-up before another tool takes over. Called by
	 * {@link Workspace} upon deactivation.
	 */
	deactivate : function() {
		if(this.keyMap)
			this.keyMap.disable();
	}
});
