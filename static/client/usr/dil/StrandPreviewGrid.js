/**
 * Shows a 2D Grid of {@link App.ui.StrandPreview DNA complex previews}.
 */
Ext.define('App.usr.dil.StrandPreviewGrid', {
	extend: 'Ext.view.View',
	requires: ['App.usr.dil.SegmentStore','App.usr.dil.ComplexStore'],
	/**
	 * @cfg
	 */
	cellWidth: 200,
	/**
	 * @cfg
	 */
	cellHeight: 200,

	itemSelector: 'div.complex-wrap',
	trackOver: true,
	overItemCls: 'x-view-over',
	multiSelect: false,
	singleSelect: true,
	autoScroll: true,
	paddingWidth: 6,
	paddingHeight: 14,

	/**
	 * @cfg nodeFillMode
	 * One of `identity`, `segment`, or `domain`
	 */
	nodeFillMode: 'segment', // 'identity', 'segment', 'domain'
	/**
	 * @cfg nodeStrokeMode
	 * One of `identity`, `segment`, or `domain`
	 */
	nodeStrokeMode: 'segment', // 'identity', 'segment', 'domain'
	/**
	 * @cfg lineStrokeMode
	 */
	lineStrokeMode: 'default',
	/**
	 * @cfg textFillMode
	 */
	textFillMode: 'default',

	/**
	 * @cfg showBubbles
	 * True to show node "bubbles," false to hide them
	 */
	showBubbles: true,

	/**
	 * @cfg loopMode
	 */
	loopMode: 'linear',

	/**
	 * @cfg showBases
	 */
	showBases : true,
	/**
	 * @cfg showIndexes
	 */
	showIndexes : true,
	/**
	 * @cfg showSegments
	 */
	showSegments : true,

	/**
	 * @cfg {'segment'/'base'} structureMode
	 * Determines whether the {@link App.usr.dil.Complex#structure} field 
	 * should be interpreted to be a base-wise or a segment-wise structure.
	 * If a segment-wise structure, it will be {@link DNA#expandStructure expanded}
	 * by the underlying StrandPreview.
	 */
	structureMode: 'segment',

	zoom: -1,

	initComponent: function() {
		this.strandPreviews = {};
		this.tpl = this.generateTemplate(),

		this.on('itemadd', this.addComplexes);
		this.on('itemupdate', this.updateComplex);
		this.on('itemremove', this.removeComplex);

		this.on('itemmouseenter', function(view, rec, el, e) {
			this.fireEvent('updateToolbar', el);
		}, this);
		
		/**
		 * @cfg {App.usr.dil.ComplexStore} store (required)
		 * Store containing the Complexes
		 */
		/**
		 * @cfg {App.usr.dil.SegmentStore} segmentStore (required)
		 */
		this.segmentStore.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
			if(modifiedFieldNames.indexOf('color') != -1) {
				this.refresh();
			}
		},this,{buffer: 100});

		this.callParent(arguments);
	},
	/**
	 * Returns a StrandPreview chart object
	 * @param  {Boolean} [update=false]
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
		this.tpl = new Ext.XTemplate(this.generateTemplate());

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

	/**
	 * Rebuilds the view based on data in the #store
	 */
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
				data.push(me.getComplexData(rec, segmentMap));
			}
		}

		if(nodes.length > 0) {
			// Configure chart prototype
			var chart = me.getChart();

			// Build selection and chart
			var nodeData = d3.selectAll(nodes).data(data).append('svg');
			this.preview = chart(nodeData);

		}
	},
	/**
	 * Adds the passed complexes to the view. Called by the underlying view on the #itemadd event
	 * @param {App.usr.dil.Complex[]} records Records to be added
	 * @param {Number} index Index at which the records are added
	 * @param {HTMLElement[]} nodes Array of nodes corresponding to the complexes to be added
	 */
	addComplexes: function(records, index, nodes) {

		var me = this,
			data = [],
			segmentMap = me.getSegmentMap();

		for(var i = 0; i < records.length; i++) {
			var rec = records[i];
			data.push(me.getComplexData(rec, segmentMap));
		}

		if(nodes.length > 0) {
			// Configure chart prototype
			var chart = me.getChart();

			// Build selection and chart
			var nodeData = d3.selectAll(nodes).data(data).append('svg');
			this.preview = chart(nodeData);

		}
	},
	/**
	 * Updates the passed complex in the view. Called by the underlying view on the #itemupdate event
	 * @param {App.usr.dil.Complex[]} records Record to be updated
	 * @param {Number} index Index at which the records are updated
	 * @param {HTMLElement[]} node Node corresponding to the complexes to be added
	 */
	updateComplex: function(record, index, node) {
		var me = this,
			rec = record,
			segmentMap = this.getSegmentMap(),
			data = [me.getComplexData(rec, segmentMap)];
		var chart = me.getChart();

		var nodeData = d3.select(node).data(data).append('svg');
		chart(nodeData);
		this.preview.expandSelection(nodeData);

	},
	removeComplex: function(record, index) {

	},

	/**
	 * @private
	 * Gets the object that will serve as the data for StrandPreview visualization
	 * @param  {[type]} rec [description]
	 * @param  {[type]} segmentMap [description]
	 * @return {[type]} [description]
	 */
	getComplexData: function(rec, segmentMap) {
		var me = this;
		segmentMap = segmentMap || me.getSegmentMap();

		return {
			strands: _.map(rec.getStrands(), function(strandName) {
				return {
					name: strandName,
					domains: me.strandStore.findRecord('name', strandName).getParsedSpec()
				}
			}),
			structure: this.structureMode == 'segment' ? rec.get('structure') : undefined,
			dotParen: this.structureMode == 'base' ? rec.get('structure') : undefined,
			sequences: segmentMap,
			extraData: this.extraData || null,
		}
	},
	/**
	 * @private
	 * Gets the segment map associated with this view's #segmentStore
	 * @return {Object} segmentMap
	 */
	getSegmentMap: function() {
		if(this.segmentMap) {
			return this.segmentMap;
		} else if(this.segmentStore) {
			return this.segmentStore.getSegmentMap();
		}
	},
	/**
	 * @private
	 * Gets the color scale associated with this view's #segmentStore
	 * @return {Object} colorScale
	 */
	getSegmentColorScale: function() {
		return this.segmentStore.getSegmentColorScale()
	},
	highlight: function(criteria) {
		this.preview.highlight(criteria);
	},
	unhighlight: function(criteria) {
		this.preview.unhighlight(criteria);
	},

	/**
	 * Generates the text to be passed to the Ext.XTemplate constructor. Reflects updated values of #cellWidth, #cellHeight, and #paddingHeight.
	 * @return {String} Template string
	 */
	generateTemplate: function () {
		return ['<tpl for=".">', 
			'<div style="border:solid 1px white;padding:4px;margin:10px;float:left;width:' + this.cellWidth + 'px;height:' + (this.cellHeight+this.paddingHeight) + 'px;" class="complex-wrap">',
			//'<span>{name}</span> = <span>{[values.strands.join(" + ")]}</span> : <span>{structure}</span>',
			'<span style="position:absolute;">{name}</span>', '</div>', 
		'</tpl>'].join('');
	},

	/**
	 * @private
	 * @param  {Function} cb Callback to be passed the markup
	 * @param {String} cb.markup The generated markup
	 */
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