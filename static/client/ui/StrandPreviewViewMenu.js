Ext.define('App.ui.StrandPreviewViewMenu',{
	extend: 'Ext.button.Button',
	text: 'View',
	iconCls: 'view',
	complexViewMode: 'segment',
	segmentIconCls: 'domain',
	domainIconCls: 'domain-caps',
	sequenceIconCls: 'sequence',
	initComponent: function() {
		Ext.apply(this,{
			menu: [{
				text: 'Segments',
				checked: true,
				iconCls: this.segmentIconCls,
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
				iconCls: this.domainIconCls,
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
				iconCls: this.sequenceIconCls,
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
			},{
				text: 'Show base labels',
				checked: true,
				name: 'showBases',
				xtype: 'menucheckitem',
				handler: function(item) {
					this.setComplexViewShow('bases',item.checked);
				},
				scope: this
			},{
				text: 'Show base numbering',
				checked: true,
				name: 'showBaseNumbers',
				xtype: 'menucheckitem',
				handler: function(item) {
					this.setComplexViewShow('indexes',item.checked);
				},
				scope: this
			},{
				text: 'Show segment labels',
				checked: true,
				name: 'showSegments',
				xtype: 'menucheckitem',
				handler: function(item) {
					this.setComplexViewShow('segments',item.checked);
				},
				scope: this
			},
			// {
			// 	text: 'Advanced',
			// 	menu: [{
			// 		title: 'Base text color',
			// 		menu:{
			// 			xtype: 'colormenu',
			// 			listeners: {
			// 				'select':{
			// 					fn: function(picker,color) { this.changeBaseColor(color) },
			// 					scope: this,
			// 				}
			// 			},
			// 		}
			// 	}]
			// }
			]
		});
		this.callParent(arguments);

		this.setIconCls(this.segmentIconCls);

		this.showBubbles = this.menu.down('[name=showBubbles]');
		this.showBases = this.menu.down('[name=showBases]');

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
				this.setIconCls(this.segmentIconCls);

				if(this.showBubbles.checked) {
					opts = {
						nodeStrokeMode : 'segment',
						nodeFillMode : 'segment',
						lineStrokeMode : 'default',
						textFillMode : 'default',
					};
				} else if(this.showBases.checked) {
					opts = { textFillMode : 'segment' };
				} else {
					opts = { lineStrokeMode: 'segment' };
				}
				break;
			case 'domain':
				this.setIconCls(this.domainIconCls);

				if(this.showBubbles.checked) {
					opts = {
						lineStrokeMode : '',
						nodeFillMode : 'domain',
						nodeStrokeMode : 'domain',
						textFillMode : 'default',
					};
				} else if(this.showBases.checked) {
					opts = { textFillMode : 'domain' };
				} else {
					opts = { lineStrokeMode: 'domain' };
				}
				break;
			case 'identity':
				this.setIconCls(this.sequenceIconCls);

				if(this.showBubbles.checked) {
					opts = {
						lineStrokeMode : 'default',
						nodeStrokeMode : 'identity',
						nodeFillMode : 'identity',
						textFillMode : 'default',
					};
				} else if(this.showBases.checked) {
					opts = { textFillMode : 'identity' };
				} else {
					opts = { lineStrokeMode: 'identity' };
				}
				break;
		}
		this.updateView(opts);
	},
	changeBaseColor: function(color) {
		this.updateView({'baseColor':color});
	},
	updateView: function(opts) {
		Ext.apply(this.view,opts);
		this.view.updateChartProperties();
	},
	setComplexViewBubbles: function(showBubbles) {
		this.setComplexViewShow('bubbles',showBubbles);
	},
	setComplexViewShow: function(property,show) {
		switch(property) {
			case 'bubbles':
				this.view.showBubbles = show;
				break;
			case 'bases':
				this.view.showBases = show;
				break;
			case 'indexes':
				this.view.showIndexes = show;
				break;
			case 'segments':
				this.view.showSegments = show;
				break;
		}
		this.setComplexViewMode(this.complexViewMode);
	},
})