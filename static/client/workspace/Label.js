/**
 * @class Workspace.Label
 * Allows in-place plain text editing of idea labels
 * @extends Workspace.Shim
 */
Ext.define('Workspace.Label', {
	constructor : function(config) {
		Ext.applyIf(config, {
			elementSpec : {

			},
			tag : 'div',
			cls : 'workspace-label',
			/**
			 * @cfg {Array} offsets
			 * Pixels by which to offset the shim
			 */
			offsets : [0, -3]
			/**
			 * @cfg {Workspace.objects.Object} object
			 * The object to which to bind this shim
			 */
		});
		Ext.applyIf(config.elementSpec, {
			tag : config.tag,
			cls : config.cls
		});
		Workspace.Label.superclass.constructor.apply(this, arguments);
	},
	extend : 'Workspace.Shim',
	property : 'name',
	padding : 5,
	editable : true,
	render : function() {
		Workspace.Label.superclass.render.apply(this, arguments);

		if(this.editable) {
			// attach editor to DOM node
			this.editor = new Ext.ux.LabelEditor({
				labelSelector : '#' + this.getEl().id
			});
			this.editor.attachTo(this.getEl(), this.object.workspace.getEl());
			this.editor.on('complete', this.onSave, this);
		} else {
		}
		this.element.unselectable();
		// pre-build metrics object to perform sizing in #updateSize
		this.metrics = new Ext.util.TextMetrics(this.getEl());

		// load data into label
		var val = this.object.get(this.property);
		this.onChange(this.property, val);
		this.onMove();
	},
	/**
	 * Transforms the value of #object.#property to the value which is actually
	 * displayed. Override to provide a custom formatting.
	 * @param {Mixed} value Result of {@link #object}.{@link Machine.SerializableObject#get get}({@link #property})
	 * @param {String} displayValue Value to be displayed
	 */
	format: function(val) {
		return val;
	},
	/**
	 * Invoked when the attached Ext.ux.LabelEditor finishes editing; updates the attached object
	 * @private
	 * @param {Ext.ux.LabelEditor} ed
	 * @param {Mixed} value
	 */
	onSave : function(ed, value) {
		if(this.property && this.object) {
			this.object.set(this.property, value);
		}
	},
	applyTo : function() {
		Workspace.Label.superclass.applyTo.apply(this, arguments);
		if(this.object) {
			this.object.on('change', this.onChange, this);
			this.object.on('resize', this.onMove, this);
		}
	},
	/**
	 * Invoked automatically to set the height of the shim
	 * @private
	 */
	updateSize : function(val) {
		if(this.getEl())
			this.getEl().setHeight(this.metrics.getHeight(val) + this.padding);
	},
	onMove : function() {
		this.updateSize(this.object.get(this.property));
		Workspace.Label.superclass.onMove.apply(this, arguments);
	},
	/**
	 * Invoked when the attached object property changes; updates the attached element
	 * @param {String} prop The property which changes
	 * @param {Mixed} val The value which changes
	 */
	onChange : function(prop, val) {
		if(prop == this.property && !this.ignoreNext) {
			if(this.getEl()) {
				val = this.format(val);
				this.getEl().update(val);
				this.updateSize(val);
			}
		}
	},
	destroy : function() {
		this.object.un('change', this.onChange, this);
		this.object.un('resize', this.onMove, this);
		if(this.editor) {
			this.editor.destroy();
		}
		Workspace.Label.superclass.destroy.apply(this, arguments);
	}
})