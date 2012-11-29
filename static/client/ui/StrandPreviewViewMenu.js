Ext.define('App.ui.StrandPreviewViewMenu',{
	extend: 'Ext.button.Button',
	text: 'View',
	iconCls: 'view',
	initComponent: function() {
		Ext.apply(this,{
			menu: [{
				text: 'Segments',
				checked: true,
				iconCls: 'domain',
				name: 'coloringSegments',
				group: 'coloring',
				xtype: 'menucheckitem',
				handler: function() {
					this.setComplexViewMode('segment');
				},
				scope: this
			}, {
				text: 'Domains',
				checked: false,
				iconCls: 'domain-caps',
				name: 'coloringDomains',
				group: 'coloring',
				xtype: 'menucheckitem',
				handler: function() {
					this.setComplexViewMode('domain');
				},
				scope: this
			}, {
				text: 'Base identity',
				checked: true,
				iconCls: 'sequence',
				name: 'coloringSequences',
				group: 'coloring',
				xtype: 'menucheckitem',
				handler: function() {
					this.setComplexViewMode('identity');
				},
				scope: this
			}, '-',
			{
				text: 'Show bubbles',
				checked: true,
				name: 'showBubbles',
				xtype: 'menucheckitem',
				handler: function(item) {
					this.setComplexViewBubbles(item.checked);
				},
				scope: this
			}]
		});
		this.callParent(arguments);

		this.showBubbles = this.menu.down('[name=showBubbles]');

		this.coloringSegments = this.menu.down('[name=coloringSegments]');
		this.coloringSequences = this.menu.down('[name=coloringSequences]');
		this.coloringDomains = this.menu.down('[name=coloringDomains]');
	},
	getComplexViewMode: function() {
		return this.complexViewMode;
	},
	setComplexViewMode: function(mode) {
		this.complexViewMode = mode;
		var opts;
		switch(mode) {
			case 'segment':
				if(this.showBubbles.checked) {
					opts = {
						nodeStrokeMode : 'segment',
						nodeFillMode : 'segment',
						lineStrokeMode : 'default',
						textFillMode : 'default',
					};
				} else {
					opts = { textFillMode : 'segment' };
				}
				break;
			case 'domain':
				if(this.showBubbles.checked) {
					opts = {
						lineStrokeMode : '',
						nodeFillMode : 'domain',
						nodeStrokeMode : 'domain',
						textFillMode : 'default',
					};
				} else {
					opts = { textFillMode : 'domain' };
				}
				break;
			case 'identity':
				if(this.showBubbles.checked) {
					opts = {
						lineStrokeMode : 'default',
						nodeStrokeMode : 'identity',
						nodeFillMode : 'identity',
						textFillMode : 'default',
					};
				} else {
					opts = { textFillMode : 'identity' };
				}
				break;
		}
		this.updateView(opts);
	},
	updateView: function(opts) {
		Ext.apply(this.view,opts);
		this.view.updateChartProperties();
	},
	setComplexViewBubbles: function(showBubbles) {
		this.view.showBubbles = showBubbles;
		this.setComplexViewMode(this.complexViewMode);
	},
})