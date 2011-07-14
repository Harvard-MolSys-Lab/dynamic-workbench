////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.MathEquationObject
 * Represents a workspace object containing an editable mathematical equation
 * @extends Workspace.objects.ElementObject
 */
// Workspace.objects.MathEquationObject = {};
Ext.define('Workspace.objects.MathEquationObject', {
	constructor: function(workspace, config) {
		Ext.applyIf(config, {

		})

		Workspace.objects.MathEquationObject.superclass.constructor.call(this, workspace, config);

		Ext.apply(this.elementSpec, {
			tag: 'div',
			cls: 'math'
		});

		this.expose('latex', true, true, true, false);
	},
	extend: 'Workspace.objects.ElementObject',
	wtype: 'Workspace.objects.MathEquationObject',
	name: 'New Equation',
	iconCls: 'math-icon',
	isEditable: true,
	isSelectable: true,
	isResizable: true,
	/**
	 * @cfg {String} latex
	 * The LaTeX string to be rendered in this element
	 */
	latex: '',
	editor: 'mathquill',
	render: function() {
		Workspace.objects.MathEquationObject.superclass.render.call(this, arguments);
		this.showImage(this.get('latex'));
		// $(this.getEl().dom).mathquill('latex',this.get('latex'));
	},
	/**
	 * Render LaTeX as image using a free service
	 * @param {Object} text
	 */
	showImage: function(text) {
		var url = 'http://latex.codecogs.com/gif.latex?';
		url += encodeURIComponent(text);
		this.getEl().update('<img src="' + url + '" />');
	},
	/**
	 * activate
	 * Makes this element editable using Mathquill; automatically invoked by the configured editor
	 * @private
	 */
	activate: function() {
		var el = this.getEl();
		el.update('');
		$(el.dom).mathquill('editable').mathquill('latex', this.get('latex'));
	},
	/**
	 * deactivate
	 * Restores this element to a non-editable image; automatically invoekd by the configured editor
	 * @private
	 */
	deactivate: function() {
		var el = this.getEl(),
		text = $(el.dom).mathquill('latex');

		this.set('latex', text);

		$(this.element.dom).mathquill('revert');
		this.element = Ext.get(this.element.dom);
		this.showImage(text)
	}
}, function() {
	Workspace.reg('Workspace.objects.MathEquationObject', Workspace.objects.MathEquationObject);
});
