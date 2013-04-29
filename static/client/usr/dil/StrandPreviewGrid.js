Ext.define('App.usr.dil.StrandPreviewGrid', {
	extend: 'Ext.view.View',
	requires: ['App.usr.dil.SegmentStore','App.usr.dil.ComplexStore'],
	cellWidth: 200,
	cellHeight: 200,
	itemSelector: 'div.complex-wrap',
	trackOver: true,
	overItemCls: 'x-view-over',
	multiSelect: false,
	singleSelect: true,

	autoScroll: true,
	paddingWidth: 6,
	paddingHeight: 14,

	nodeFillMode: 'segment', // 'identity', 'segment', 'domain'
	nodeStrokeMode: 'segment', // 'identity', 'segment', 'domain'
	lineStrokeMode: 'default',
	textFillMode: 'default',
	showBubbles: true,
	loopMode: 'linear',
	showBases : true,
	showIndexes : true,
	showSegments : true,
	zoom: -1,

	initComponent: function() {
		this.strandPreviews = {};
		this.tpl = ['<tpl for=".">', '<div style="border:solid 1px white;padding:4px;margin:10px;float:left;width:' + this.cellWidth + 'px;height:' + (this.cellHeight+this.paddingHeight) + 'px;" class="complex-wrap">',
		//'<span>{name}</span> = <span>{[values.strands.join(" + ")]}</span> : <span>{structure}</span>',
		'<span style="position:absolute;">{name}</span>', '</div>', '</tpl>'].join(''),

		this.on('itemadd', this.addComplexes);
		this.on('itemupdate', this.updateComplex);
		this.on('itemremove', this.removeComplex);

		this.on('itemmouseenter', function(view, rec, el, e) {
			this.fireEvent('updateToolbar', el);
		}, this);
		
		this.segmentStore.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
			if(modifiedFieldNames.indexOf('color') != -1) {
				this.refresh();
			}
		},this,{buffer: 100});

		this.callParent(arguments);
	},
	/**
	 * Returns a StrandPreview chart object
	 * @param  {Boolean} update
	 * True to force the chart to be updated with #cellHeight, #cellWidth, #nodeStrokeMode, etc. properties.
	 *
	 * @return {[type]}
	 */
	getChart: function(update) {
		update || (update = false);
		if(!this.chart || update) {
			this.chart = StrandPreview().width(this.cellWidth - this.paddingWidth).height(this.cellHeight - this.paddingHeight)
			.showBubbles(this.showBubbles)
			.showBases(this.showBases)
			.showIndexes(this.showIndexes)
			.showSegments(this.showSegments)
			.loopMode(this.loopMode)
			.nodeStrokeMode(this.nodeStrokeMode)
			.nodeFillMode(this.nodeFillMode)
			.lineStrokeMode(this.lineStrokeMode)
			.textFillMode(this.textFillMode);
			this.chart.segmentColors(this.getSegmentColorScale());

			//if(!!this.segmentColors) this.chart.segmentColors(this.segmentColors)
		}
		return this.chart;
	},
	updateChartProperties: function() {
		this.tpl = new Ext.XTemplate(['<tpl for=".">', '<div style="border:solid 1px white;padding:4px;margin:10px;float:left;width:' + this.cellWidth + 'px;height:' + (this.cellHeight+this.paddingHeight) + 'px;" class="complex-wrap">',
		//'<span>{name}</span> = <span>{[values.strands.join(" + ")]}</span> : <span>{structure}</span>',
		'<span style="position:absolute;">{name}</span>', '</div>', '</tpl>'].join(''));

		this.getChart(true);
		this.refresh();
	},
	setCellSize: function(sizeX,sizeY) {
		if(arguments.length < 2) {
			sizeY = sizeX;
		}
		this.cellWidth = sizeX;
		this.cellHeight = sizeY;

		this.updateChartProperties();
	},
	setZoom: function (zoom) {
		this.zoom = zoom;
		this.updateChartProperties();
	},
	refresh: function() {
		this.callParent(arguments);

		var me = this,
			nodes = [],
			records = me.store.getRange(),
			data = [],
			segmentMap = me.getSegmentMap();
		for(var i = 0; i < records.length; i++) {
			var rec = records[i],
				dom = this.getNode(rec);

			if(dom) {
				nodes.push(dom);

				data.push({
					strands: _.map(rec.getStrands(), function(strandName) {
						return {
							name: strandName,
							domains: me.strandStore.findRecord('name', strandName).getParsedSpec()
						}
					}),
					structure: rec.get('structure'),
					sequences: segmentMap,
				});
			}
		}

		if(nodes.length > 0) {
			// Configure chart prototype
			var chart = me.getChart();

			// Build selection and chart
			var nodeData = d3.selectAll(nodes).data(data).append('svg');
			this.preview = chart(nodeData);


			// this.resizers = [];
			// for(var i=0; i<nodes.length; i++) {
			// this.resizers.push(Ext.create('Ext.resizer.Resizer',{target:nodes[i]}));
			// }
		}
	},
	addComplexes: function(records, index, nodes) {

		var me = this,
			data = [],
			segmentMap = me.getSegmentMap();

		for(var i = 0; i < records.length; i++) {
			var rec = records[i];

			data.push({
				strands: _.map(rec.getStrands(), function(strandName) {
					return {
						name: strandName,
						domains: me.strandStore.findRecord('name', strandName).getParsedSpec()
					}
				}),
				structure: rec.get('structure'),
				sequences: segmentMap,
			});
		}

		if(nodes.length > 0) {
			// Configure chart prototype
			var chart = me.getChart();

			// Build selection and chart
			var nodeData = d3.selectAll(nodes).data(data).append('svg');
			this.preview = chart(nodeData);


			// this.resizers = [];
			// for(var i=0; i<nodes.length; i++) {
			// this.resizers.push(Ext.create('Ext.resizer.Resizer',{target:nodes[i]}));
			// }
		}
	},
	updateComplex: function(record, index, node) {
		var me = this,
			rec = record,
			segmentMap = this.getSegmentMap(),
			data = [{
				strands: _.map(rec.getStrands(), function(strandName) {
					return {
						name: strandName,
						domains: me.strandStore.findRecord('name', strandName).getParsedSpec()
					}
				}),
				structure: rec.get('structure'),
				sequences: segmentMap,
			}];
		var chart = me.getChart();

		var nodeData = d3.select(node).data(data).append('svg');
		chart(nodeData);
		this.preview.expandSelection(nodeData);

	},
	removeComplex: function(record, index) {

	},
	getSegmentMap: function() {
		if(this.segmentMap) {
			return this.segmentMap;
		} else if(this.segmentStore) {
			return this.segmentStore.getSegmentMap();
		}
	},
	getSegmentColorScale: function() {
		return this.segmentStore.getSegmentColorScale()
	},
	highlight: function(criteria) {
		this.preview.highlight(criteria);
	},
	unhighlight: function(criteria) {
		this.preview.unhighlight(criteria);
	},
	getMarkup: function(cb) {
		if(!this.svgStyles) {
			Ext.Ajax.request({
			    url: 'styles/strand-preview.css',
			    success: function(response){
			        this.svgStyles = response.responseText;
			        this.doGetMarkup(cb);
			    },
			    scope: this,
			});
		} else {
			this.doGetMarkup(cb);
		}
	},
	doGetMarkup: function(cb) {
		var me = this, 
			rowLength = 6,
			x_offset = 10,
			y_offset = 10,
			markup = _.map(this.getNodes(),function(node,index) {
				var x = index % rowLength, y = Math.floor(index / rowLength),
					markup = node.innerHTML.replace(/<span(\b[^>]*)>([^<]*)<\/span>/g,'<text class="complex-label">$2</text>')
						.replace(/<svg(\b[^>]*)>/g,'').replace('</svg>','');
				return '<g transform="translate('+[x_offset+x*me.cellWidth,y_offset+y*me.cellHeight]+')">'+markup+'</g>';
			}).join('\n');

		var value = '<?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'+
		'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
		'<style type="text/css"><![CDATA[' + this.svgStyles + ']]></style>'+
		markup+'</svg>';

		cb(value);
	},
})