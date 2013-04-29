Ext.define('App.usr.seq.Stats', {
	extend: 'Ext.menu.Menu',
	minWidth: 300,
	minHeight: 400,
	initComponent: function() {
		this.store = new Ext.data.JsonStore({
			fields: [{
				name: 'name',
				type: 'string'
			},{
				name: 'count',
				type: 'int'
			},{
				name: 'percent',
				type: 'float',
			},
			],
			data: []
		});
		this.chartStore = new Ext.data.JsonStore({
			fields: [{
				name: 'name',
				type: 'string'
			},{
				name: 'count',
				type: 'int'
			},{
				name: 'percent',
				type: 'float',
			},
			],
			data: []
		});
		this.grid = new Ext.grid.Panel({
			store: this.store,
			columns: [{
				header: 'Sequence',
				dataIndex: 'name',
				flex: 2,
				renderer: function(v) {
					return v.toUpperCase();
				},
			},{
				header: 'Count',
				dataIndex: 'count',
				flex: 1,
			},{
				header: 'Percent',
				dataIndex: 'percent',
				flex: 1,
				renderer: function(v) {
					return (v*100)+'%';
				}
			}]
		});
		this.chart = new Ext.chart.Chart({
			store: this.chartStore,
			shadow: false,
			legend: false,
			height: 200,
			//insetPadding: 60,
			theme: 'Base:gradients',
			series: [{
				type: 'pie',
				field: 'percent',
				showInLegend: false,
				donut: false,
				highlight: {
					segment: {
						margin: 20
					}
				},
				label: {
					field: 'name',
					display: 'middle',
					contrast: true,
					font: '14px helvetica',
					renderer: function(v) {
						return v.toUpperCase();
					}
				}
			}],
			destroy : function() {
				// TODO : remove on upgrade
				// hack to fix a bug in Ext 4.0.1
				if(!this.surface) {
					this.surface = {destroy:function(){}};
				}
			}
		});
		Ext.apply(this, {
			items: [
			this.chart,
			this.grid]
		});

		this.callParent(arguments);
	},
	loadSequence: function(sequence) {
		var data = DNA.sequenceStats(sequence);
		this.store.loadData(data.full);
		this.chartStore.loadData(data.abbr);
	},
});