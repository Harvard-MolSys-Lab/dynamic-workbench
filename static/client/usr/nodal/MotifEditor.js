/**
 * Provides facilities for designing and editing Motifs
 */
Ext.define('App.usr.nodal.MotifEditor',{
	extend:'Ext.panel.Panel',
	mixins: {
		tip: 'App.ui.TipHelper',
	},
	requires: ['App.usr.dil.SegmentStore','App.usr.dil.StrandStore','App.usr.dil.ComplexStore',
	'App.usr.dil.StrandsGrid','App.usr.dil.SegmentsGrid','App.usr.nodal.MotifPreview','App.usr.dil.EditComplexPanel'],
	layout: 'border',
	border: false,
	bodyBorder: false,
	initComponent: function() {

		this.segmentStore = Ext.create('App.usr.dil.SegmentStore', {});
		this.strandStore = Ext.create('App.usr.dil.StrandStore', {
			segmentStore: this.segmentStore
		});
		this.complexStore = Ext.create('App.usr.dil.ComplexStore', {
			strandStore: this.strandStore
		});

		this.loadDynaml(this.data);

		this.segmentStore.on('update',this.refresh,this);
		this.strandStore.on('update',this.refresh,this);
		this.complexStore.on('update',this.refresh,this);

		Ext.apply(this,{
			items: [{
				region: 'north',
				layout: 'border',
				height: 200,
				split: true,
				border: false,
				bodyBorder: false,
				items: [{
					region: 'west',
					xtype: 'segmentsgrid',
					name: 'segmentsGrid',
					store: this.segmentStore,
					title: 'Segments',
					width: 200,
					split: true,
				},{
					region: 'center',
					xtype: 'strandsgrid',
					name: 'strandsGrid',
					store: this.strandStore,
					segmentStore: this.segmentStore,
					collapsible: true,
					titleCollapse: true,
					title: 'Strands',
					
				}]
			},{
				region: 'center',
				title: 'Structure',
				layout: 'border',
				border: false,
				bodyBorder: false,
				items: [{
					region: 'center',
					xtype: 'editcomplexpanel',
					name: 'complexPanel',
					strandManager: this,
					complex: this.complex,
					border: false,
					bodyBorder: false,
					viewOptions: {
						showBubbles: false,
						showIndexes: false,
						showBases: false,
						complexViewMode: 'domain'
					}
				},{
					region: 'east',
					xtype: 'motifpreview',
					name: 'motifPreview',
					width: 200,
					border: true,
					bodyBorder: false,
					split: true,
				}]
			}]
		});
		this.callParent(arguments);
		this.strandsGrid = this.down('[name=strandsGrid]');
		this.segmentsGrid = this.down('[name=segmentsGrid]');
		this.complexPanel = this.down('[name=complexPanel]');
		this.motifPreview = this.down('[name=motifPreview]');
	},

	refresh: function () {
		if(!this.suspendRefresh) {
			var motif = this.buildMotif();
			this.motifPreview.setValue(motif);

			//this.complexPanel.updateComplex();
		}
	},

	/* ------------------------------------------------------------------------------------------- 
	   Data handling                                                                             

	/**
	 * Gets the names of strands, the structure, and the sequences for segments comprising a complex.
	 * @param  {String/Complex} rec A record or name representing the complex in question
	 * @return {Object} An object containing the complexData
	 * @return {Object[]} return.strands (see #getStrandData)
	 * @return {String} return.structure
	 * @return {Object} return.sequences (see #getSegmentMap)
	 */
	getComplexData: function(rec) {
		if(_.isString(rec)) {
			rec = this.complexStore.findRecord('name', rec);
		}
		if(rec) {
			return {
				strands: _.map(rec.getStrands(), this.getStrandData, this),
				structure: rec.get('structure'),
				sequences: this.getSegmentMap(),
			}
		}
	},
	/**
	 * Gets the name, the list of domains, and the list of segments in a strand
	 * @param  {String/Strand} rec A record or name representing the strand in question
	 * @return {Object} An object containing the strandData
	 * @return {String} return.name
	 * @return {Object[]} return.domains
	 * @return {Object[]} return.segments
	 */
	getStrandData: function(rec) {
		if(_.isString(rec)) {
			rec = this.strandStore.findRecord('name', rec);
		}
		if(rec) {
			return {
				name: rec.get('name'),
				domains: _.clone(rec.getParsedSpec()),
				segments: _.clone(rec.getFlatSpec()),
			}
		}
	},

	getSegmentMap: function() {
		return this.segmentStore.getSegmentMap();
	},
	updateStrandSequences: function() {
		var segmentMap = this.getSegmentMap();
		this.strandStore.each(function(strand) {
			var strandSpec = strand.getFlatSpec();
			strand.set('sequence', DNA.threadSegments(segmentMap, strandSpec));
		}, this);
	},

	/**
	 * Loads data from a DyNAML string. The string should be a valid DyNAML depiction of a {@link App.dynamic.Motif}.
	 * @param  {String} input DyNAML string describing a motif
	 */
	loadDynaml: function(input) {
		input || (input = '{}');
		var cfg;
		try {
			cfg = JSON.parse(input);
		} catch(e) {

		}
		_.defaults(input,{
			name: '',
			structure: '',
		})
		//this.library || (this.library = App.dynamic.Library.dummy());
		this.library = App.dynamic.Library.dummy();
		cfg.library = this.library;
		var motif = new App.dynamic.Motif(cfg);
		this.loadMotif(motif);
		this.complex = this.complexStore.getAt(0) || _.first(this.complexStore.addComplex());
	},

	/**
	 * Loads data from a {@link App.dynamic.Motif Motif} object.
	 * @param  {App.dynamic.Motif} motif 
	 */
	loadMotif: function(motif) {
		motif || (motif = {});
		var complexStore = this.complexStore,
			strandStore = this.strandStore,
			segmentStore = this.segmentStore,
			segmentColors = d3.scale.category20();

		segmentStore.colorGenerator = segmentColors;

		this.suspendRefresh = true;

		// this.segmentStore.suspendEvents();
		// this.strandStore.suspendEvents();
		// this.complexStore.suspendEvents();
		
		var segData = _.map(motif.getSegments() || [], function(seg) {
			return {
				identity: seg.getIdentity(),
				sequence: seg.getSequence(),
				color: !!seg.color ? seg.color : segmentColors(seg.getIdentity()),
			};
		}), newSegData = [];
		for(var i=0; i<segData.length; i++) {
			var data = segData[i],
				rec = segmentStore.findRecord('identity',data.identity);
			if(rec) {
				rec.beginEdit();
				rec.set('identity',data.identity);
				rec.set('sequence',data.sequence);
				rec.set('color',data.color);
				rec.endEdit();
			} else {
				newSegData.push(data);
			}
		}
		segmentStore.add(newSegData);



		complexStore.add([(function(node) {
			var strandData = _.map(node.getStrands() || [], function(strand) {
				return {
					name: strand.getName(),
					sequence: strand.getSequence(),
					complex: node.getName(),
					spec: strand.printDomains( /* omitLengths */ true),
					polarity: strand.getPolarity(),
				};
			}),newStrandData = [];
			for(var i=0; i<strandData.length; i++) {
				var data = strandData[i],
					rec = strandStore.findRecord('name',data.name);
				if(rec) {
					rec.beginEdit();
					rec.set('name',data.name);
					rec.set('sequence',data.sequence);
					rec.set('complex',data.complex);
					rec.set('spec',data.spec);
					rec.set('polarity',data.polarity);
					rec.endEdit();
				} else {
					newStrandData.push(data);
				}
			}
			strandStore.add(newStrandData);

			var structure;
			try {
				structure = node.getSegmentwiseStructure().toDotParen()
			} catch(e) {
				structure = '';
			}

			return {
				name: node.getName(),
				polarity: node.getPolarity(),
				structure: structure,
				strands: _.map(node.getStrands(), function(strand) {
					return strand.getName();
				})
			};
		})(motif)]);

		this.suspendRefresh = false;

		// this.segmentStore.resumeEvents();
		// this.strandStore.resumeEvents();
		// this.complexStore.resumeEvents();

	},
	buildMotif: function() {
		var segmentIds = this.segmentStore.getRange(),
			strandRecs = this.strandStore.getRange(),
			complexRecs = this.complexStore.getRange(),
			segmentMap = {},
			allSegments = [],
			strandMap = {},
			strands = [],
			nodes = [];


		// Build map of segment identities to sequences
		for(var i = 0; i < segmentIds.length; i++) {
			var rec = segmentIds[i],
				seg = {
					identity: rec.get('identity'),
					sequence: rec.get('sequence'),
					color: rec.get('color')
				};
			allSegments.push(seg);
			segmentMap[seg.identity] = seg.sequence;
		}

		// Build objects for strands
		for(var i = 0; i < strandRecs.length; i++) {
			var rec = strandRecs[i],
				strand, doms = _.clone(rec.getParsedSpec());

			// Update domain objects (built from spec) with sequence info
			for(var j = 0; j < doms.length; j++) {
				var dom = doms[j];
				for(var k = 0; k < dom.segments.length; k++) {
					var seg = dom.segments[k];
					seg.sequence = segmentMap[seg.identity];
				}
			}

			strand = {
				name: rec.get('name'),
				domains: doms
			};
			strands.push(strand);
			strandMap[strand.name] = strand;
		}

		// Build objects for motif
		// for(var i = 0; i < complexRecs.length; i++) {
			var complex = complexRecs[0],
				complexStrands = complex.getStrands(),
				node;

			node = {
				name: complex.get('name'),
				structure: complex.get('structure'),
				polarity: complex.get('polarity'),
				strands: _.map(complexStrands, function(strand) {
					return strandMap[strand]
				})
			};

			nodes.push(node);
		//}

		// Build new library object
		// return new App.dynamic.Library({
		// 	nodes: nodes,
		// 	allSegments: allSegments
		// });
		
		var lib = App.dynamic.Library.dummy();
		node.library = lib;

		return new App.dynamic.Motif(node);
	},
	getValue: function() {
		var motif = this.buildMotif();
		return JSON.stringify(motif.serialize(),null,'\t');
	},
	setValue: function (data) {
		this.complexStore.remove(this.complexStore.getRange());
		//this.strandStore.remove(this.strandStore.getRange());
		//this.segmentStore.remove(this.segmentStore.getRange());

		this.data = data;
		this.loadDynaml(this.data);
	}
});


Ext.define('App.usr.nodal.MotifEditorWindow',{
	extend: 'Ext.window.Window',
	requires: ['App.usr.nodal.MotifEditor'],
	border: false,
	bodyBorder: false,
	width: 600,
	height: 400,
	layout: 'fit',
	initComponent: function() {
		this.nodeTypeEditor = Ext.create('App.usr.nodal.MotifEditor',{
			data: this.data,
		});
		this.items = [this.nodeTypeEditor];
		this.buttons || (this.buttons = []);
		this.buttons.unshift(Ext.create('App.ui.HelpButton',{topic: 'nodal#motif-editor'}));
		this.callParent(arguments);
	},
	getValue: function () {
		return this.nodeTypeEditor.getValue();
	},
	setValue: function (data) {
		this.nodeTypeEditor.setValue(data);
	}
});


/* ------ */


// Ext.define('App.usr.nodal.MotifPreviewGrid', {
// 	extend: 'Ext.view.View',
// 	cellWidth: 200,
// 	cellHeight: 200,
// 	itemSelector: 'div.complex-wrap',
// 	trackOver: true,
// 	overItemCls: 'x-view-over',
// 	multiSelect: false,
// 	singleSelect: true,

// 	autoScroll: true,
// 	paddingWidth: 6,
// 	paddingHeight: 14,

// 	nodeFillMode: 'segment', // 'identity', 'segment', 'domain'
// 	nodeStrokeMode: 'segment', // 'identity', 'segment', 'domain'
// 	lineStrokeMode: 'default',
// 	textFillMode: 'default',
// 	showBubbles: true,
// 	loopMode: 'linear',
// 	showBases : true,
// 	showIndexes : true,
// 	showSegments : true,


// 	initComponent: function() {
// 		this.strandPreviews = {};
// 		this.tpl = this.generateTemplate();

// 		this.on('itemadd', this.addComplexes);
// 		this.on('itemupdate', this.updateComplex);
// 		this.on('itemremove', this.removeComplex);
		

// 		this.callParent(arguments);
// 	},
// 	generateTemplate: function () {
// 		return ['<tpl for=".">', 
// 		'<div style="border:solid 1px white;padding:4px;margin:10px;float:left;width:' + this.cellWidth + 'px;height:' + (this.cellHeight+this.paddingHeight) + 'px;" class="complex-wrap">',
// 		//'<span>{name}</span> = <span>{[values.strands.join(" + ")]}</span> : <span>{structure}</span>',
// 		'<span style="position:absolute;">{name}</span>', '</div>', '</tpl>'].join('');
// 	}
// 	/**
// 	 * Returns a StrandPreview chart object
// 	 * @param  {Boolean} update
// 	 * True to force the chart to be updated with #cellHeight, #cellWidth, #nodeStrokeMode, etc. properties.
// 	 *
// 	 * @return {[type]}
// 	 */
// 	getChart: function(update) {
// 		update || (update = false);
// 		if(!this.chart || update) {
// 			this.chart = StrandPreview().width(this.cellWidth - this.paddingWidth).height(this.cellHeight - this.paddingHeight)
// 			.showBubbles(this.showBubbles)
// 			.showBases(this.showBases)
// 			.showIndexes(this.showIndexes)
// 			.showSegments(this.showSegments)
// 			.loopMode(this.loopMode)
// 			.nodeStrokeMode(this.nodeStrokeMode)
// 			.nodeFillMode(this.nodeFillMode)
// 			.lineStrokeMode(this.lineStrokeMode)
// 			.textFillMode(this.textFillMode);
// 			this.chart.segmentColors(this.getSegmentColorScale());

// 			//if(!!this.segmentColors) this.chart.segmentColors(this.segmentColors)
// 		}
// 		return this.chart;
// 	},
// 	getMotifChart: function (update) {
// 		update || (update = false);
// 		if(!this.motifChart || update) {
// 			this.motifChart = MotifPreview().width(this.cellWidth - this.paddingWidth).height(this.cellHeight - this.paddingHeight)
// 		}
// 		return this.motifChart;
// 	}
// 	updateChartProperties: function() {
// 		this.tpl = new Ext.XTemplate(this.generateTemplate());

// 		this.getChart(true);
// 		this.getMotifChart(true);
// 		this.refresh();
// 	},
// 	refresh: function() {
// 		this.callParent(arguments);

// 		var me = this,
// 			data = this.data,
// 			nodes = [],
// 			motifPrevData = [],
// 			strandPrevData = [];
// 		for(var i = 0; i < data.length; i++) {
// 			var rec = records[i],
// 				dom = this.getNode(rec);

// 			if(dom) {
// 				nodes.push(dom);

// 				data.push({
// 					strands: _.map(rec.getStrands(), function(strandName) {
// 						return {
// 							name: strandName,
// 							domains: me.strandStore.findRecord('name', strandName).getParsedSpec()
// 						}
// 					}),
// 					structure: rec.get('structure'),
// 					sequences: segmentMap,
// 				});
// 			}
// 		}

// 		if(nodes.length > 0) {
// 			// Configure chart prototype
// 			var chart = me.getChart();

// 			// Build selection and chart
// 			var nodeData = d3.selectAll(nodes).data(data).append('svg');
// 			this.preview = chart(nodeData);


// 			// this.resizers = [];
// 			// for(var i=0; i<nodes.length; i++) {
// 			// this.resizers.push(Ext.create('Ext.resizer.Resizer',{target:nodes[i]}));
// 			// }
// 		}
// 	},
// 	addComplexes: function(records, index, nodes) {

// 		var me = this,
// 			data = [],
// 			segmentMap = me.getSegmentMap();

// 		for(var i = 0; i < records.length; i++) {
// 			var rec = records[i];

// 			data.push({
// 				strands: _.map(rec.getStrands(), function(strandName) {
// 					return {
// 						name: strandName,
// 						domains: me.strandStore.findRecord('name', strandName).getParsedSpec()
// 					}
// 				}),
// 				structure: rec.get('structure'),
// 				sequences: segmentMap,
// 			});
// 		}

// 		if(nodes.length > 0) {
// 			// Configure chart prototype
// 			var chart = me.getChart();

// 			// Build selection and chart
// 			var nodeData = d3.selectAll(nodes).data(data).append('svg');
// 			this.preview = chart(nodeData);


// 			// this.resizers = [];
// 			// for(var i=0; i<nodes.length; i++) {
// 			// this.resizers.push(Ext.create('Ext.resizer.Resizer',{target:nodes[i]}));
// 			// }
// 		}
// 	},
// 	updateComplex: function(record, index, node) {
// 		var me = this,
// 			rec = record,
// 			segmentMap = this.getSegmentMap(),
// 			data = [{
// 				strands: _.map(rec.getStrands(), function(strandName) {
// 					return {
// 						name: strandName,
// 						domains: me.strandStore.findRecord('name', strandName).getParsedSpec()
// 					}
// 				}),
// 				structure: rec.get('structure'),
// 				sequences: segmentMap,
// 			}];
// 		var chart = me.getChart();

// 		var nodeData = d3.select(node).data(data).append('svg');
// 		chart(nodeData);
// 		this.preview.expandSelection(nodeData);

// 	},
// 	removeComplex: function(record, index) {

// 	},
// 	getSegmentMap: function() {
// 		if(this.segmentMap) {
// 			return this.segmentMap;
// 		} else if(this.segmentStore) {
// 			return this.segmentStore.getSegmentMap();
// 		}
// 	},
// 	getSegmentColorScale: function() {
// 		return this.segmentStore.getSegmentColorScale()
// 	},
// 	highlight: function(criteria) {
// 		this.preview.highlight(criteria);
// 	},
// 	unhighlight: function(criteria) {
// 		this.preview.unhighlight(criteria);
// 	},
// 	getMarkup: function(cb) {
// 		if(!this.svgStyles) {
// 			Ext.Ajax.request({
// 			    url: 'styles/strand-preview.css',
// 			    success: function(response){
// 			        this.svgStyles = response.responseText;
// 			        this.doGetMarkup(cb);
// 			    },
// 			    scope: this,
// 			});
// 		} else {
// 			this.doGetMarkup(cb);
// 		}
// 	},
// 	doGetMarkup: function(cb) {
// 		var me = this, 
// 			rowLength = 6,
// 			x_offset = 10,
// 			y_offset = 10,
// 			markup = _.map(this.getNodes(),function(node,index) {
// 				var x = index % rowLength, y = Math.floor(index / rowLength),
// 					markup = node.innerHTML.replace(/<span(\b[^>]*)>([^<]*)<\/span>/g,'<text class="complex-label">$2</text>')
// 						.replace(/<svg(\b[^>]*)>/g,'').replace('</svg>','');
// 				return '<g transform="translate('+[x_offset+x*me.cellWidth,y_offset+y*me.cellHeight]+')">'+markup+'</g>';
// 			}).join('\n');

// 		var value = '<?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'+
// 		'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
// 		'<style type="text/css"><![CDATA[' + this.svgStyles + ']]></style>'+
// 		markup+'</svg>';

// 		cb(value);
// 	},
// })