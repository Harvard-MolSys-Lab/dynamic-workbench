/**
 * @class App.ui.BoundObjectPanel
 * Allows ribbon tabs to be bound to {@link Workspace.Object}s and fields within the panel to be bound to object properties.
 * Components within this panel which contain an {@link #objectBinding} property will be set to the value of that property when objects are bound, and
 * changes to those components triggering the change event (or another event specified in {@link #objectBindingEvent}) will cause {@link WorkspaceAction}s
 * to be generated and applied to the attached workspace.
 * @extends Ext.Panel
 */
Ext.define('App.ui.BoundObjectPanel', {
	extend:'Ext.panel.Panel',
	initComponent: function() {
		App.ui.BoundObjectPanel.superclass.initComponent.apply(this, arguments);

		this.addEvents('action');

		// objects which have been bound to this panel with #bind
		this.boundObjects = Ext.create('Workspace.objects.ObjectCollection', {});

		// fields which specify an objectBinding
		this.boundFields = new Ext.util.MixedCollection();

		// fields which specify a displayIf or an enableIf function
		this.dynamicFields = new Ext.util.MixedCollection();

		// collect all fields with object bindings specified
		var boundFields = this.query('component[objectBinding]'), //[objectBinding!=""]');
		// this.findBy( function(cmp) {
		// return (Ext.isDefined(cmp.objectBinding) && cmp.objectBinding != '');
		// },this),
		dynamicFields = this.query('component[enableIf]','component[showIf]');
		// this.findBy( function(cmp) {
		// return (Ext.isFunction(cmp.enableIf) || Ext.isFunction(cmp.showIf));
		// },this);
		// oh, yeah and look in the toolbar too since that's where they're ALL going to be
		// if (this.topToolbar) {
		// boundFields = boundFields.concat(this.topToolbar.findBy( function(cmp) {
		// return (Ext.isDefined(cmp.objectBinding) && cmp.objectBinding != '');
		// },this));
		// dynamicFields = dynamicFields.concat(this.topToolbar.findBy( function(cmp) {
		// return (Ext.isFunction(cmp.enableIf) || Ext.isFunction(cmp.showIf));
		// },this));
		// }

		// index fields and add event handlers
		Ext.each(boundFields, function(field) {
			var eventName = field.objectBindingEvent || 'change';
			field.addListener(eventName, this.updateObjects, this);
			this.boundFields.add(field.objectBinding, field);
		},this);
		this.dynamicFields.addAll(dynamicFields);

		this.on('afterrender', this.buildTips, this);
		this.on('afterrender', this.updateDynamicFields, this);
	},
	buildTips: function() {
		/*
		 // collect all fields with tooltip configs specified
		 var tips = this.findBy( function(cmp) {
		 return (Ext.isDefined(cmp.tooltip) && cmp.tooltip != '' && !cmp.isXType('button', true));
		 },
		 this);

		 // oh, yeah and look in the toolbar too since that's where they're ALL going to be
		 if (this.topToolbar) {
		 tips = tips.concat(this.topToolbar.findBy( function(cmp) {
		 return (Ext.isDefined(cmp.tooltip) && cmp.tooltip != '' && !cmp.isXType('button', true));
		 },
		 this));
		 }
		 this.tips = [];
		 Ext.each(tips, function(field) {
		 if (field.tooltip) {
		 var t = field.tooltip;
		 if (t.text && !t.html) {
		 t.html = t.text;
		 }
		 t.target = field.getEl();
		 this.tips.push(new Ext.ToolTip(t));
		 }
		 },
		 this)
		 */
	},
	/**
	 * updateObjects
	 * listener invoked by bound field on change (or other {@link #objectBinding} event); generates a {@link WorkspaceAction} to update
	 * the specified propery in all bound objects
	 * @param {Object} field
	 * @param {Object} newValue
	 * @param {Object} oldValue
	 */
	updateObjects: function(field, newValue, oldValue) {
		if (!this.ignoreNext) {
			if (field.objectBinding) {
				var values = {},
				action;
				values[field.objectBinding] = newValue;

				// Build WorkspaceAction
				action = new Workspace.actions.ChangePropertyAction({
					values: values,
					subjects: this.boundObjects.getRange()
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
	updateFields: function(item) {
		this.boundFields.each( function(field) {
			if (item.has(field.objectBinding)) {
				field.setValue(item.get(field.objectBinding));
			}
		},
		this);
	},
	/**
	 * updateFieldsHandler
	 * Called when bound objects change
	 * @param {Object} prop
	 * @param {Object} val
	 * @param {Object} item
	 */
	updateFieldsHandler: function(prop, val, item) {
		if (this.boundFields.containsKey(prop)) {
			var f = this.boundFields.get(prop);
			this.ignoreNext = true;
			f.setValue(val);
			this.ignoreNext = false;
		}
	},
	updateDynamicFields: function() {
		var common = this.boundObjects.getCommonWType();
		this.dynamicFields.each( function(f) {
			if(Ext.isFunction(f.showIf)) {
				if(f.showIf(common,this.boundObjects,this))
					f.show();
				else
					f.hide();
			}
			if(Ext.isFunction(f.enableIf)) {
				if(f.enableIf(common,this.boundObjects,this))
					f.enable();
				else
					f.disable();
			}
		},this);
	},
	/**
	 * bind
	 * Attaches the given object to this panel, so that changes in the panel will be reflected in the object
	 * @param {Workspace.Object} item
	 */
	bind: function(item) {
		if (!this.boundObjects.containsKey(item.getId())) {
			this.boundObjects.add(item.getId(), item);
			if (this.boundObjects.length == 1) {
				this.updateFields(item);
			}
			this.mon(item, 'change', this.updateFieldsHandler, this);
			this.updateDynamicFields();
		}
	},
	/**
	 * unbind
	 * Detaches the given object from this panel
	 * @param {Workspace.Object} item
	 */
	unbind: function(item) {
		if (item) {
			if (this.boundObjects.containsKey(item.getId())) {
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
	destroy: function() {
		Ext.each(this.tips, function(tip) {
			tip.destroy();
		});
		App.ui.BoundObjectPanel.superclass.destroy.apply(this, arguments);

	}
});