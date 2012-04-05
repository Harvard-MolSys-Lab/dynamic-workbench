/**
 * Allows ribbon tabs to be bound to {@link Workspace.objects. Object}s and fields within the panel to be bound to object properties.
 * Components within this panel which contain an {@link #objectBinding} property will be set to the value of that property when objects are bound, and
 * changes to those components triggering the change event (or another event specified in {@link #objectBindingEvent}) will cause {@link WorkspaceAction}s
 * to be generated and applied to the attached workspace.
 */
Ext.define('App.ui.BoundObjectPanel', {
	extend : 'Ext.panel.Panel',
	/**
	 * @cfg {Boolean} Allows the binding of {@link Machine.core.Serializable#expose object properties} to fields
	 * within this component to be categorically disabled.  
	 */
	enableBoundFields : true,
	initComponent : function() {
		//App.ui.BoundObjectPanel.superclass.initComponent.apply(this, arguments);
		this.callParent(arguments);
		this.initialize();
	},
	initialize : function() {
		this.addEvents('action');

		/**
		 * @property {Workspace.objects.ObjectCollection}
		 * Objects which have been bound to this panel with #bind
		 */
		this.boundObjects = Ext.create('Workspace.objects.ObjectCollection', {});

		/*
		 * @property {Ext.util.MixedCollection}
		 * Fields which specify an {@link #objectBinding}
		 */
		this.boundFields = new Ext.util.MixedCollection();

		/*
		 * @property {Ext.util.MixedCollection}
		 * Fields which specify a {@link #displayIf} or {@link #enableIf} function
		 */
		this.dynamicFields = new Ext.util.MixedCollection();

		// collect all fields with object bindings specified

		/**
		 * @property {String} objectBinding
		 * To be applied to child items:
		 * Name of an exposed field in a {@link Machine.core.Serializable} object bound to this panel. When the value
		 * of the {@link Ext.form.field.Field} with the <var>objectBinding</var> property set changes, the {@link #boundObjects}
		 * are updated with {@link Machine.core.Serializable#set}.
		 */
		if(this.enableBoundFields) {
			// index fields and add event handlers
			Ext.each(this.query('component[objectBinding]'), function(field) {
				/**
				 * @property {String} objectBindingEvent
				 * Event to watch for changes to the {@link #boundObjects}
				 */
				var eventName = field.objectBindingEvent || 'change';
				field.addListener(eventName, this.updateObjects, this);
				if(!this.boundFields.containsKey(field.objectBinding)) {
					this.boundFields.add(field.objectBinding, [field]);
				} else {
					var list = this.boundFields.getByKey(field.objectBinding);
					list.push(field);
					this.boundFields.add(field.objectBinding, list);
				}

			}, this);
		}

		this.dynamicFields.addAll(this.query('component[enableIf], component[showIf]'));

		this.on('afterrender', this.buildTips, this);
		this.on('afterrender', this.updateDynamicFields, this);
	},
	buildTips : function() {

	},
	/**
	 * listener invoked by bound field on change (or other {@link #objectBinding} event); generates a {@link Workspace.actions.Action} to update
	 * the specified propery in all bound objects
	 * @param {Object} field
	 * @param {Object} newValue
	 * @param {Object} oldValue
	 */
	updateObjects : function(field, newValue, oldValue) {
		if(!this.ignoreNext) {
			if(field.objectBinding) {
				var values = {}, action;
				values[field.objectBinding] = field.getValue(); //	newValue;

				// Build WorkspaceAction
				action = new Workspace.actions.ChangePropertyAction({
					values : values,
					subjects : this.boundObjects.getRange()
				});

				this.fireEvent('action', action);
			}
		}
	},
	/**
	 * updateFields
	 * Updates the fields in this ribbon to match the values in this object
	 * @param {Workspace.Object} item
	 */
	updateFields : function(item) {
		this.boundFields.each(function(list) {
			_.each(list, function(field) {
				if(item.has(field.objectBinding)) {
					field.setValue(item.get(field.objectBinding));
				}
			});
		}, this);
	},
	/**
	 * Called when bound objects change
	 * @param {Object} prop
	 * @param {Object} val
	 * @param {Object} item
	 */
	updateFieldsHandler : function(prop, val, item) {
		if(this.boundFields.containsKey(prop)) {
			var list = this.boundFields.get(prop);
			this.ignoreNext = true;
			_.each(list, function(f) {
				f.setValue(val);
			});
			this.ignoreNext = false;
		}
	},
	/**
	 * Updates child elements with #showIf and/or #enableIf methods. Called upon item binding/unbinding.
	 */
	updateDynamicFields : function() {
		var common = this.boundObjects.getCommonWType();
		this.dynamicFields.each(function(f) {
			/**
			 * @method showIf
			 * Override on child components to determine whether they should be shown for a particular selection
			 * @param {String} common The most specific common WType among the bound objects
			 * @param {Ext.util.MixedCollection} boundObjects A list of all bound objects
			 * @param {App.ui.BoundObjectPanel} this
			 * @return {Boolean} show
			 */
			if(Ext.isFunction(f.showIf)) {

				if(f.showIf(common, this.boundObjects, this))
					f.show();
				else

					f.hide();
			}
			/**
			 * @method enableIf
			 * Override on child components to determine whether they should be enabled for a particular selection
			 * @param {String} common The most specific common WType among the bound objects
			 * @param {Ext.util.MixedCollection} boundObjects A list of all bound objects
			 * @param {App.ui.BoundObjectPanel} this
			 * @return {Boolean} show
			 */
			if(Ext.isFunction(f.enableIf)) {
				if(f.enableIf(common, this.boundObjects, this))
					f.enable();
				else
					f.disable();
			}
		}, this);
	},
	/**
	 * Attaches the given object to this panel, so that changes in the panel will be reflected in the object
	 * @param {Workspace.Object} item
	 */
	bind : function(item) {
		if(!this.boundObjects.containsKey(item.getId())) {
			// this.boundObjects.add(item.getId(), item);
			// if(this.boundObjects.length == 1) {
				// this.updateFields(item);
			// }
			if(this.boundObjects.length == 0) {
				this.updateFields(item);
			}
			this.boundObjects.add(item.getId(), item);
			this.mon(item, 'change', this.updateFieldsHandler, this);
			this.updateDynamicFields();
		}
	},
	/**
	 * Detaches the given object from this panel
	 * @param {Workspace.Object} item
	 */
	unbind : function(item) {
		if(item) {
			if(this.boundObjects.containsKey(item.getId())) {
				this.boundObjects.removeAtKey(item.getId());
				this.mun(item, 'change', this.updateFieldsHandler, this);
			}
		} else {
			this.boundObjects.clear();
		}
		this.updateDynamicFields();
	},
	/**
	 * destroy
	 */
	destroy : function() {
		Ext.each(this.tips, function(tip) {
			tip.destroy();
		});
		App.ui.BoundObjectPanel.superclass.destroy.apply(this, arguments);

	}
});
