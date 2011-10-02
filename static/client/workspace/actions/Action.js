

/**
 * @class Workspace.actions.Action
 * Encapsulates a single, un-doable change to the workspace.
 * @abstract
 * @extends Ext.Action
 */
Ext.define('Workspace.actions.Action', {
	alias: 'WorkspaceAction',
	extend:'Ext.Action',
	constructor: function(config) {
		Workspace.actions.Action.superclass.constructor.apply(this, arguments);
		Ext.apply(this,config);
	},
	/**
	 * @cfg handler
	 * The function to invoke on execution
	 */
	handler: function() {
	},
	/**
	 * getUndo
	 * Gets the action which can be invoked to undo this action. This method must be called before (preferrably immediately before)
	 * the action is invoked
	 * @return {Workspace.actions.Action}
	 */
	getUndo: function() {
	},
	/**
	 * Serialized
	 * Returns a serialized version of this action
	 */
	serialize: function() {
	},
	/**
	 * attachTo
	 * Attaches this action to the given workspace
	 * @param {Workspace} workspace
	 */
	attachTo: function(workspace) {
		this.workspace = workspace;
	},
	/**
	 * execute
	 * Performs the action on the attached workspace.
	 */
	execute: function() {
		if (this.handler) {
			this.handler.apply(this.scope);
		} else {
			Workspace.actions.Action.superclass.execute.apply(this, arguments);
		}
	}
});
