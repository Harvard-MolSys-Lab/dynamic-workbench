/**
 * @class App.ui.ToolsTab
 * Manages the tool palate and provides several object actions
 * @extends App.ui.BoundObjectPanel
 */
Ext.define('App.ui.ToolsTab', {
	requires: ['Workspace.tools.PointerTool','Workspace.tools.PencilTool','Workspace.tools.IdeaTool','Workspace.tools.ConnectorTool','Workspace.tools.IdeaAdderTool'],
	extend:'App.ui.BoundObjectPanel',
	/**
	 * @cfg {String} tool
	 * The default tool
	 */
	tool: 'pointer',
	border: false,
	generateConfig: function() {
		return {
			tbar: [{

				// 'Tools' group
				xtype: 'buttongroup',
				title: 'Tools',
				columns: 2,

				items: [{
					iconCls: 'cursor-icon',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'pointer',
					pressed: true,
					tooltip: {
						title: 'Pointer Tool',
						text: 'Select, move, and resize objects. Click objects or drag boxes around them to select. Grab and drag to move. Drag hangles to resize (objects without handles can\'t be resized).'
					}
				},{
					iconCls: 'pencil',
					enableToggle: true,
					toggleGroup: 'toolbox',
					toolName: 'pencil',
					tooltip: {
						title: 'Pencil Tool',
						text: 'Draw freehand objects. Click and drag to start drawing; release to finish.'
					}
				},{
					iconCls: 'idea',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'idea',
					tooltip: {
						title: 'Idea Tool',
						text: 'Group objects into ideas. Drag a box around a group of objects to make an idea.'
					}
				},{
					iconCls: 'connector',
					toggleGroup: 'toolbox',
					enableToggle: true,
					toolName: 'connector',
					tooltip: {
						title: 'Connector Tool',
						text: 'Draw connections between objects. Click one point or object and drag to another point or object.'
					}
				},

				/*{
				 iconCls: 'vector',
				 toggleGroup: 'toolbox',
				 enableToggle: true,
				 disabled: true,
				 tooltip: {title: 'Vector Tool', text:'Edit shapes'}
				 },*/
				]
			},{

				// 'Object' group
				xtype: 'buttongroup',
				title: 'Object',
				columns: 3,
				items: [{
					scale: 'medium',
					rowspan: 2,
					iconAlign: 'top',
					iconCls: 'delete-24',
					text: 'Delete',
					handler: this.deleteObjects,
					scope: this,
					tooltip: {
						title: 'Delete',
						text: 'Deletes the selected objects.'
					},
					enableIf: function(com,bound) {
						return bound.getCount()>0;
					}
				},{
					disabled: true,
					scale: 'medium',
					rowspan: 2,
					iconAlign: 'top',
					iconCls: 'duplicate-24',
					text: 'Duplicate',
					handler: this.duplicateObjects,
					scope: this,
					tooltip: {
						title: 'Duplicate',
						text: 'Inserts a copy of the selected objects.'
					}
				},
				// {
				//
				// ref: 'nameField', //'../../nameField',
				// fieldLabel: 'Name',
				// objectBinding: 'name',
				// xtype: 'textfield',
				// width: 150,
				// tooltip: {
				// title: 'Name',
				// text: 'The object\'s name'
				// },
				// },{
				// ref: 'typeField', // '../../typeField',
				// xtype: 'combo',
				// objectBinding: 'wtype',
				// store: Workspace.Components.getTypeStore(),
				// tpl: new Ext.XTemplate(
				// '<tpl for="."><div class="x-combo-list-item">',
				// '<img src="' + Ext.BLANK_IMAGE_URL + '" class="combo-icon {iconCls}" />&nbsp;<span>{wtype}</span>',
				// '</div></tpl>'
				// ),
				// valueField: 'wtype',
				// displayField: 'wtype',
				// typeAhead: true,
				// mode: 'local',
				// forceSelection: true,
				// triggerAction: 'all',
				// selectOnFocus: true,
				// width: 150,
				// tooltip: {
				// title: 'Type',
				// text: 'The object type.'
				// }
				// }
				]
			},{

				// 'Idea' group
				xtype: 'buttongroup',
				title: 'Idea',
				columns: 2,
				defaults: {
					cellCls: 'table-cell-padded'
				},
				items: [{
					scale: 'medium',
					rowspan: 2,
					iconAlign: 'top',
					iconCls: 'idea-form-24',
					text: 'Form idea',
					tooltip: {
						title: 'Form idea',
						text: 'Makes a new idea from the selected objects. Select the objects you want to add to an idea, then click this button'
					},
					handler: this.formIdea,
					scope: this,
					enableIf: function(com,bound) {
						return bound.getCount() > 0;
					}
				},{
					iconCls: 'idea-remove',
					text: 'Remove from Idea',
					rowspan: 1,
					handler: this.orphanObjects,
					scope: this,
					tooltip: {
						title: 'Remove from Idea',
						text: 'Removes the selected objects from the idea they\'re a part of (if any).'
					},
					enableIf: function(com,bound) {
						var p = false;
						bound.each( function(f) {
							if(f.hasParent()) {
								p = true;
								return false;
							}
						});
						return p;
					}
				},{
					iconCls: 'idea-add',
					text: 'Add to Idea',
					rowspan: 1,
					toolName: 'idea-add',
					enableToggle: true,
					toggleGroup: 'toolbox',
					tooltip: {
						title: 'Add this to Idea',
						text: 'Allows you to add the selected object(s) to an idea. Select the objects you want to add to an idea, then click this button, then click an idea.'
					}
				}]

			},
			// not implemented
			// 'Transform' group
			/*{
			 xtype:'buttongroup',
			 title:'Transform',
			 columns: 4,
			 items:[{
			 iconCls: 'rotate-left'
			 },{
			 iconCls: 'rotate-right'
			 },{
			 iconCls: 'flip-horiz'
			 },{
			 iconCls: 'flip-vert'
			 },{
			 iconCls: 'arrange-forward'
			 },{
			 iconCls: 'arrange-backwards'
			 },{
			 iconCls: 'arrange-front'
			 },{
			 iconCls: 'arrange-back'
			 }]
			 },*/
			'->',{

				// 'Workspace' group
				xtype: 'buttongroup',
				title: 'Workspace',
				columns: 4,
				items: [{
					scale: 'medium',
					iconCls: 'undo-24',
					text: 'Undo',
					rowspan: 2,
					iconAlign: 'top',
					handler: this.undo,
					scope: this,
					ref: 'undoButton', //'../undoButton',
					disabled: true
				},{
					scale: 'medium',
					iconCls: 'redo-24',
					text: 'Redo',
					rowspan: 2,
					iconAlign: 'top',
					handler: this.redo,
					scope: this,
					ref: 'redoButton', // '../undoButton',
					disabled: true
				},{
					scale: 'medium',
					iconCls: 'save-24',
					text: 'Save',
					rowspan: 2,
					iconAlign: 'top',
					handler: this.saveWorkspace,
					scope: this
				},{
					scale: 'medium',
					iconCls: 'document-24',
					text: 'Expand',
					rowspan: 2,
					iconAlign: 'top',
					handler: this.expandWorkspace,
					scope: this
				}]
			}]
		};
	},
	initComponent: function() {
		/**
		 * @event toolChange
		 */
		this.addEvents('toolChange');
		Ext.apply(this, this.generateConfig());

		App.ui.ToolsTab.superclass.initComponent.apply(this, arguments);

		_.each(this.query('*[ref]'), function(cmp) {
			this[cmp.ref] = cmp;
		},this);

		/*
		 * Dictionary of all buttons with configured toolName bindings
		 */
		this.toolButtons = new Ext.util.MixedCollection();

		// collect all buttons with tool bindings specified
		var toolButtons = this.query('component[toolName]'); //[toolname!=""]');
		/**
		 * @property {String} toolName
		 * Child buttons should have this property to specify which {@link Workspace.tools.BaseTool} to activate on toggle.
		 */

		// index buttons and add event handlers
		Ext.each(toolButtons, function(button) {
			button.addListener('toggle', this.onToggle, this);
			this.toolButtons.add(button.toolName, button);
		},
		this);

		// not implemented
		//		this.uploaderWindow = new Ext.Window({
		//			title: 'Upload files',
		//			closeAction: 'hide',
		//			frame: true,
		//			width: 500,
		//			height: 200,
		//			items: {
		//				xtype: 'awesomeuploader',
		//				gridHeight: 100,
		//				height: 160,
		//				awesomeUploaderRoot: '/scripts/awesomeuploader_v1.3.1/',
		//				listeners: {
		//					scope: this,
		//					fileupload: function(uploader, success, result){
		//						if (success) {
		//							Ext.Msg.alert('File Uploaded!', 'A file has been uploaded!');
		//						}
		//					}
		//				}
		//			}
		//		});
	},
	// not implemented
	pushUndo: function(action) {
		this.undoStack.push(action);
		this.rebuildUndo();
	},
	// not implemented
	popUndo: function() {
		var a = this.undoStack.pop();
		this.rebuildUndo();
		return a;
	},
	// not implemented
	rebuildUndo: function() {
		this.undoButton.menu.removeAll();
		this.undoButton.menu.add(this.undoStack);
		if (this.undoStack.length > 0) {
			this.undoButton.enable();
		} else {
			this.undoButton.disable();
		}
	},
	// not implemented
	undo: function() {
		this.fireEvent('undo', this);
	},
	// not implemented
	redo: function() {
		this.fireEvent('redo', this)
	},
	/**
	 * deleteObjects
	 * Generates a WorkspaceAction to delete the bound objects
	 */
	deleteObjects: function() {
		var action = new Workspace.actions.DeleteObjectAction({
			subjects: this.boundObjects.getRange()
		});
		this.fireEvent('action', action);
	},
	/**
	 * duplicateObjects
	 * Generates a WorkspaceAction to delete the bound objects
	 */
	duplicateObjects: function() {
		var action = new Workspace.actions.DuplicateObjectAction({
			objects: this.boundObjects.getRange()
		});
		this.fireEvent('action', action);
	},
	/**
	 * orphanObjects
	 * Generates a WorkspaceAction to decouple the bound objects from their parent(s)
	 */
	orphanObjects: function() {
		var action = new Workspace.actions.OrphanObjectAction({
			subjects: this.boundObjects.getRange()
		});
		this.fireEvent('action', action);
	},
	/**
	 * formIdea
	 * Generates a WorkspaceAction to build an idea from the current selection
	 */
	formIdea: function() {
		var action = new Workspace.actions.FormIdeaAction({
			subjects: this.boundObjects.getRange()
		});
		this.fireEvent('action', action);
	},
	/**
	 * Generates a WorkspaceAction to expand the size of the workspace
	 */
	expandWorkspace: function() {
		var action = new Workspace.actions.ExpandAction({});
		this.fireEvent('action', action);
	},
	/**
	 * Generates an event notifying the parent canvas to save the workspace
	 */
	saveWorkspace: function() {
		this.fireEvent('save', this);
	},
	/**
	 * Event handler automatically applied to buttons with configured {@link #toolName}s
	 * @param {Ext.Button} btn
	 * @param {Boolean} pressed
	 */
	onToggle: function(btn, pressed) {
		if (pressed) {
			this.setActiveTool(btn.toolName);
		}
	},
	/**
	 * Gets the name of the currently active tool
	 * @return {String} toolName
	 */
	getActiveTool: function() {
		return this.tool;
	},
	/**
	 * Allows Tools tab in ribbon to set the active workspace tool
	 * @param {String} tool
	 */
	setActiveTool: function(tool) {
		if (!this.ignoreToolChange) {
			this.tool = tool;
			this.fireEvent('toolChange', tool);
		}
	},
	/**
	 * Responds to workspace toolChange event and updates UI to reflect
	 * @param {String} tool
	 */
	onToolChange: function(tool) {
		var button = this.toolButtons.get(tool);
		if (button) {
			this.ignoreToolChange = true;
			button.toggle(true);
			this.tool = tool;
			this.fireEvent('toolChange');
			this.ignoreToolChange = false;
		}
	}
});