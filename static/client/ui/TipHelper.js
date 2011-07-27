Ext.define('App.ui.TipHelper', {
	init : function() {
		this.tips = [];
		_.each(this.query('*[tooltip]'), function(field) {
			field.on('afterrender', this.buildTip, this);
		}, this);
		this.on('destroy',this.destroyTips,this);
	},
	buildTip : function(field) {
		var t = field.tooltip;
		// Don't try to make tooltips for fields without them, and don't make a tooltip for a field which already has one.
		if(!field.tooltip || field.tip) {
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
		this.tips.push(tip);
		field.tip = tip;
	},
	destroyTips : function() {
		_.each(this.tips,function(tip) {
			if (tip && tip.destroy) {
				tip.destroy();
			}
		})
	}
})