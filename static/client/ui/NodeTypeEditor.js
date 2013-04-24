function MotifPreview() {
	var viewSizeX = 400, viewSizeY = 400;
	function chart(selection) {
		selection.each(function(data) {
			var r = viewSizeX * 0.25, cx = viewSizeX / 2, cy = viewSizeX / 2, lr = viewSizeX*0.05;
			var panel = d3.select(this);
			panel.selectAll('*').remove();

			var spec = data;

			panel.append('circle')
				.attr('cx',cx)
				.attr('cy',cy)
				.attr('r',r)
				.attr('fill','#fff')
				.attr('stroke', '#000')
				.attr('stroke-width',4);

			panel.append('text').text(spec.name)
				.attr('font-size','2em')
				.attr('text-anchor','middle')
				.attr('dy','.35em')
				.attr('x', cx)
				.attr('y', cy);

			var domains = _.filter(spec.getDomains ? spec.getDomains() : (spec.domains || []), function(domain) {
				return (domain.role != 'null') && (domain.role != 'structural');
			}), 
			theta_0 = Math.PI, dtheta = 2 * Math.PI / domains.length;
			domains = _.map(domains,function(dom,i) {
				var port_r = 4,	theta = theta_0 + i * dtheta, rotation = theta * 180/Math.PI;
				if(dom.role == 'input') {
					rotation+=30;
				}
					return {
						cx : cx + r * Math.cos(theta),
						cy : cy + r * Math.sin(theta),
						x : cx + r * Math.cos(theta) - port_r,
						y : cy + r * Math.sin(theta) - port_r,
						lx : lr * Math.cos(theta),
						ly : lr * Math.sin(theta),
						//transform : 'r' + ((theta + (dom.role == 'input' ? 32 : 0)) * 180 / Math.PI),
						// rx: port_r,
						// ry: port_r,
						width : 2 * port_r,
						height : 2 * port_r,
						rotate: rotation,
						fill : '#fff',
						stroke : App.dynamic.Compiler.getColor(dom),
						role: dom.role,
						polarity: DNA.parsePolarity(dom.polarity),
						name: dom.name,
					};
			})

			var domainSel = panel.selectAll('g.port')
				.data(domains)
				.enter().append('g').attr('class','port')
				.attr('transform',function(d) { return "translate(" + d.x + "," + d.y + ") scale(3,3)"; });

			domainSel.append('path')
				.attr('stroke',function(d) { return d.stroke; })
				.attr('fill',function(d) { return d.fill; })
				.attr('transform',function(d) { return "rotate(" + d.rotate + ")"; })
				.attr('d',d3.svg.symbol().type(function(d) { 
					switch(d.role) {
						case 'input': return 'triangle-up';
						case 'bridge': return 'square';
						case 'output': default: return 'circle';
					}
				}));
			domainSel.append('text')
				.text(function (d) {
					var x = d.polarity;
					if(x ==-1) { return '–' }
					if(x == 1) { return '+' }
					else { return '±' } 
				})
				.attr('dy','.35em')
				.attr('text-anchor','middle');
			domainSel.append('text')
				.text(function (d) {
					return d.name;
				})
				.attr('transform',function(d) { return "translate("+d.lx+","+d.ly+")"; })
				.attr('dy','.35em')
				.attr('text-anchor','middle');

			// var shapes = [];
			// _.each(domains, function(dom, i) {
				
			// 	if(dom.role == 'input') {
			// 		var o = panel.append(''); //paper.triangle(attr.cx, attr.cy, port_r, port_r);
			// 		o.attr(attr);
			// 	} else if(dom.role == 'bridge') {
			// 		var o = paper.square(attr.cx, attr.cy, port_r, port_r);
			// 		o.attr(attr);
			// 	} else {
			// 		attr.type = 'circle';
			// 		attr.r = port_r;
			// 		shapes.push(attr);
			// 	}
			// });
			// paper.add(shapes);
		});
	}

	chart.width = function(_) {
		if (!arguments.length) return viewSizeX;
		viewSizeX = _;
		return chart;
	};

	chart.height = function(_) {
		if (!arguments.length) return viewSizeY;
		viewSizeY = _;
		return chart;
	};

	return chart;
}

Ext.define('App.ui.MotifPreview',{
	extend : 'App.ui.D3Panel',
	alias: 'widget.motifpreview',
	initComponent: function () {
		this.bbar = [{
			iconCls: 'svg',
			handler: this.toSVG,
			scope: this,
		}];
		this.callParent(arguments);
	},
	setValue : function(node) {
		this.data = node;
		this.buildVis();
	},
	buildVis : function() {
		var panel = this.getCanvas();
		panel.selectAll().remove();
		this.chart = MotifPreview(panel).width(this.getWidth()).height(this.getHeight());
		this.preview = this.chart(panel.data([this.data]));
	},
	toSVG: function(btn) {
		// if(!this.svgStyles) {
		// 	Ext.Ajax.request({
		// 	    url: 'styles/strand-preview.css',
		// 	    success: function(response){
		// 	        this.svgStyles = response.responseText;
		// 	        this.doDisplaySVGWindow()
		// 	    },
		// 	    scope: this,
		// 	});
		// } else {
		// 	this.doDisplaySVGWindow();
		// }
		this.doDisplaySVGWindow();
	},
	doDisplaySVGWindow: function() {
		var value = '<?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'+this.getCanvasMarkup();

		// Sorry Cthulhu... http://www.codinghorror.com/blog/2009/11/parsing-html-the-cthulhu-way.html
		value = value.replace(/<svg(\b[^>]*)>/g,'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" $1>'); //'<style type="text/css"><![CDATA[' + this.svgStyles + ']]></style>');

		this.svgWindow = Ext.create('App.ui.StrandPreviewTextWindow',{
			title: 'SVG',
		});
		this.svgWindow.show();
		this.svgWindow.setValue(value);
		//this.showWindow('SVG',value,btn);
	},
})

Ext.define('App.ui.NodeTypeEditor',{
	extend:'Ext.panel.Panel',
	layout: 'border',
	border: false,
	bodyBorder: false,
	initComponent: function() {

		this.segmentStore = Ext.create('App.ui.SegmentStore', {});
		this.strandStore = Ext.create('App.ui.StrandStore', {
			segmentStore: this.segmentStore
		});
		this.complexStore = Ext.create('App.ui.ComplexStore', {
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
		var motif = this.buildMotif();
		this.motifPreview.setValue(motif);
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

	loadMotif: function(motif) {
		motif || (motif = {});
		var complexStore = this.complexStore,
			strandStore = this.strandStore,
			segmentStore = this.segmentStore,
			segmentColors = d3.scale.category20();

		segmentStore.colorGenerator = segmentColors;
		segmentStore.add(_.map(motif.getSegments() || [], function(seg) {
			return {
				identity: seg.getIdentity(),
				sequence: seg.getSequence(),
				color: !!seg.color ? seg.color : segmentColors(seg.getIdentity()),
			};
		}));

		complexStore.add([(function(node) {
			strandStore.add(_.map(node.getStrands() || [], function(strand) {
				return {
					name: strand.getName(),
					sequence: strand.getSequence(),
					complex: node.getName(),
					spec: strand.printDomains( /* omitLengths */ true),
					polarity: strand.getPolarity(),
				};
			}));

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
		this.strandStore.remove(this.strandStore.getRange());
		this.segmentStore.remove(this.segmentStore.getRange());

		this.data = data;
		this.loadDynaml(this.data);
	}
});


Ext.define('App.ui.NodeTypeEditorWindow',{
	extend: 'Ext.window.Window',
	requires: ['App.ui.NodeTypeEditor'],
	border: false,
	bodyBorder: false,
	width: 600,
	height: 400,
	layout: 'fit',
	initComponent: function() {
		this.nodeTypeEditor = Ext.create('App.ui.NodeTypeEditor',{
			data: this.data,
		});
		this.items = [this.nodeTypeEditor];
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


// Ext.define('App.ui.MotifPreviewGrid', {
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