/**
 * @class Workspace.Shim
 * Renders an object (such as an idea label) which follows the movement of a Workspace.objects.Object
 * @extends Ext.util.Observable
 */
Ext.define('Workspace.Shim', {
	constructor : function(config) {
		Workspace.Shim.superclass.constructor.apply(this, arguments);
		Ext.applyIf(this, config, {
			/**
			 * @cfg {Object} elementSpec
			 * An Ext.DomHelper spec used to create the shim's element
			 */
			elementSpec : {
				tag : 'div',
				cls : 'workspace-label'
			},
			// offsets: [0,0]
		});
	},
	extend : 'Ext.util.Observable',
	position : 'tl-bl?',
	animate : false,
	passThroughEvents : true,
	/**
	 * @cfg {Boolean} True to hide the shim when the #object is hidden
	 */
	hideOnHide: true,
	/**
	 * @cfg {Boolean} True to show the shim when the #object is shown
	 */
	showOnShow: true,
	/**
	 * Links this shim to a {@link Workspace.objects.Object}
	 * @param {Workspace.objects.Object} object
	 */
	applyTo : function(obj) {
		if(obj.getEl) {
			this.object = obj;
			obj.on('move', this.onMove, this);
			if(this.hideOnHide) obj.on('hide', this.hide, this);
			if(this.showOnShow) obj.on('show', this.show, this);
			obj.on('destroy', this.destroy, this);
			if(obj.is('rendered')) {
				this.render();
			} else {
				obj.on('render', this.render, this, {
					single : true
				});
			}
		}
	},
	/**
	 * Invoked when the element moves; repositions the shim
	 * @private
	 */
	onMove : function() {
		if(this.object) {
			var oEl = this.object.getEl();
			if(oEl) {
				var el = this.getEl();
				//el.alignTo(Ext.fly(oEl),this.position,this.offsets,this.animate);
				el.position('absolute');
				el.setLeftTop(this.getLeft(el) + this.offsets[0], this.getTop(el) + this.offsets[1]);
			}
		}
	},
	getLeft: function(el) {
		return this.object.getX();		
	},
	getTop: function(el) {
		return this.object.getY() - el.getHeight()
	},
	/**
	 * Creates an element for the shim in the DOM. Automatically applied or scheduled by {@link #applyTo}
	 * @private
	 */
	render : function() {
		this.element = this.object.workspace.addElement(this.elementSpec);
		this.element.position('absolute');
		if(this.passThroughEvents) {
			this.element.on('click', this.object.click, this.object);
			this.element.on('mousedown', this.object.mousedown, this.object);
			this.element.on('mouseup', this.object.mouseup, this.object);
			this.element.on('mouseover', this.object.mouseover, this.object);
			this.element.on('mouseout', this.object.mouseout, this.object);
		}
	},
	/**
	 * getEl
	 */
	getEl : function() {
		return this.element;
	},
	/**
	 * hide
	 */
	hide : function() {
		if(this.element)
			this.getEl().hide();
	},
	/**
	 * show
	 */
	show : function() {
		if(this.element)
			this.getEl().show();
	},
	/**
	 * destroy
	 */
	destroy : function() {
		if(this.element)
			Ext.destroy(this.element);
	}
})

/**
 * @class Ext.ux.LabelEditor
 * Allows in-place plain text editing on elements
 * @extends Ext.Editor
 * @see Workspace.Label
 */
Ext.ux.LabelEditor = {};
Ext.define('Ext.ux.LabelEditor', {
	extend : 'Ext.Editor',
	alignment : "tl-tl",
	hideEl : false,
	//cls : "x-small-editor",
	shim : false,
	completeOnEnter : true,
	cancelOnEsc : true,

	constructor : function(cfg) {
		Ext.applyIf(cfg, {
			field : {
				xtype : 'textfield',
				allowBlank : false,
				growMin : 90,
				growMax : 240,
				grow : true,
				selectOnFocus : true
			}
		});

		Ext.ux.LabelEditor.superclass.constructor.call(this, cfg);
	},
	/**
	 * attachTo
	 * Links this editor to a DOM node
	 * @param {Ext.Element} targetEl The DOM node to which this editor should be applied
	 */
	attachTo : function(targetEl, renderEl) {
		this.targetEl = targetEl;
		this.renderEl = renderEl;
		targetEl.on('click', this.startEdit, this);

	},
	/**
	 * startEdit
	 * Begins editing the label
	 */
	startEdit : function() {
		if(this.renderEl) {
			Ext.ux.LabelEditor.superclass.startEdit.call(this, this.targetEl);
			//this.renderEl,this.targetEl.innerHTML);
		}
	}
});