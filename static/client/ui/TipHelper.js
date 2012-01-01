/**
 * Allows tooltips to be added to arbitrary components through a configuration option. 
 * To use: mixin this class on a component containing other components which require
 * tooltips. This class will search the component heirarchy and build tooltips for 
 * and children which require them.
 * 
 * Child components requiring tooltips should have a #tooltip configuration option.
 */
Ext.define('App.ui.TipHelper', {
	/**
	 * @cfg {Object} tooltip
	 * Configuration object for an {@link Ext.tip.ToolTip}. This property should be specified on child components.
	 * The tooltip will be automatically created and bound to the element for the child component. Any valid configuration
	 * options for {@link Ext.tip.ToolTip} are allowed.
	 */
	/**
	 * @property {Ext.tip.ToolTip} tip Each child component with a configured {@link #tooltip} will have a reference to
	 * the generated {@link Ext.tip.ToolTip tooltip} attached to this property.
	 */
	
	/**
	 * Initializer; should be called by the included class: <code>this.mixins.[mixinName].init.apply(this,arguments)</code>
	 */
	init : function() {
		this.tips || (this.tips = []);
		_.each(this.query('*[tooltip]'), function(field) {
			field.on('afterrender', this.buildTip, this);
		}, this);
		this.on('destroy',this.destroyTips,this);
	},
	/**
	 * Constructs a tooltip for the given field using the field's tooltip configuration parameter.
	 */
	buildTip : function(field) {
		var t = field.tooltip;
		
		/* Don't try to make tooltips for fields without them, don't make a tooltip for a 
		 * field which already has one, and don't try to make one for components like
		 * buttons which support them natively.
		 */
		if(!field.tooltip || field.tip || field.setTooltip) {
			return;
		}
		if(_.isString(t)) {
			t = {
				text : t
			};
		}
		if(t.text && !t.html) {
			t.html = t.text;
		}
		t.target = field.getEl();
		var tip = new Ext.ToolTip(t);
		this.tips || (this.tips = []);
		this.tips.push(tip);
		field.tip = tip;
	},
	/**
	 * Destroys all tooltips for this components' children.
	 */
	destroyTips : function() {
		_.each(this.tips,function(tip) {
			if (tip && tip.destroy) {
				tip.destroy();
			}
		})
	}
})