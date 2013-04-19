Ext.define('Complex', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'id',
		type: 'int'
	}, {
		name: 'name'
	}, {
		name: 'polarity',
		type: 'int'
	}, {
		name: 'strands' // array
	}, {
		name: 'specs',
		// array
	}, {
		name: 'sequences',
		// array
	}, {
		name: 'structure'
	}, ],
	idgen: 'sequential',
	getDynaml: function(lib) {
		return lib.getNode(this.get('name'));
	},
	getStrands: function() {
		return this.get('strands');
	},
	getStructures: function() {
		var structures = this.get('structure') || '';
		return  _.map(structures.split('+'), function(s) {
			return s.trim();
		});
	},
	fixStructure: function(strandIndex,added,removed) {
		var structures = this.getStructures(),
			struct = structures[strandIndex];
		if(struct) {
			struct = struct.split('');
			for(var i=struct.length-1; i>=0; i--) {
				if(removed.indexOf(i) != -1) {
					delete struct[i];
				}
				if(added.indexOf(i) != -1) {
					struct.splice(i,0,'.');
				}
			}
			structures[strandIndex] = _.compact(struct).join('');
			this.set('structure',structures.join('+'));
		}
	},
	proxy: 'memory',
});

Ext.define('Strand', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'id',
		type: 'int'
	}, {
		name: 'name'
	}, {
		name: 'polarity',
		type: 'int'
	}, {
		name: 'sequence'
	}, {
		name: 'domains'
	}, {
		name: 'spec'
	}, ],
	idgen: 'sequential',
	set: function(fieldName,newValue) {
		if(fieldName == 'spec') {
			if(newValue!=this.get('spec')) {
				this.updateCachedSpec(newValue);	
			}
		}
		this.callParent(arguments);
		
	},
	getDynaml: function(lib) {
		return lib.getStrand(this.get('name'));
	},
	diffSpec: function(spec) {
		var oldSpec = spec,
			newSpec = this.parsedSpec;
		var oldSegments = _.comprehend(oldSpec,function(dom) { return dom.segments; }),
			newSegments = _.comprehend(newSpec,function(dom) { return dom.segments; });
		var removed = _.difference(oldSegments,newSegments),
			added = _.difference(newSegments,oldSegments);
		var removedIndices = _.map(removed,function(seg) { return oldSegments.indexOf(seg)}),
			addedIndices = _.map(added,function(seg) { return newSegments.indexOf(seg)});			
		return {
			removed: removed,
			added: added,
			removedIndices: removedIndices, 
			addedIndices: addedIndices,
		}
	},
	updateCachedSpec: function(newValue,oldValue) {
		// if(newValue && oldValue) {
		// 	var oldSpec = this.parsedSpec,
		// 		newSpec = App.dynamic.Compiler.parseDomainString(newValue);
		// 	var oldSegments = _.comprehend(oldSpec,function(dom) { return dom.segments; }),
		// 		newSegments = _.comprehend(newSpec,function(dom) { return dom.segments; });
		// 	var removed = _.difference(oldSegments,newSegments),
		// 		added = _.difference(newSegments,oldSegments);
		// 	var removedIndices = _.map(removed,function(seg) { return oldSegments.indexOf(seg)}),
		// 		addedIndices = _.map(added,function(seg) { return newSegments.indexOf(seg)});			

		// 	this.parsedSpec = App.dynamic.Compiler.parseDomainString(newValue, /*parseIdentifier*/ true);
		//} else 
		if(newValue) {
			this.parsedSpec = App.dynamic.Compiler.parseDomainOrSegmentString(newValue, /*parseIdentifier*/ true);
		} else {
			this.parsedSpec = App.dynamic.Compiler.parseDomainOrSegmentString(this.get('spec'), /*parseIdentifier*/ true);
		}
	},
	getParsedSpec: function() {
		if(!this.parsedSpec) {
			this.updateCachedSpec();
		}
		return this.parsedSpec;
	},
	getFlatSpec: function() {
		return _.comprehend(this.getParsedSpec(), function(dom) {
			return dom.segments
		});
	},
	proxy: 'memory',
})

Ext.define('Domain', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'name'
	}, ],
	// getDynaml: function(lib) {
	// return this.getStrand().getDynaml(lib).getDomain(this.get('name'));
	// }
})

Ext.define('Segment', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'identity'
	}, {
		name: 'sequence'
	}, {
		name: 'color',
	}],
});

Ext.define('App.ui.SegmentStore', {
	extend: 'Ext.data.Store',
	model: 'Segment',
	constructor: function() {
		this.callParent(arguments);
		this.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
			if(modifiedFieldNames.indexOf('sequence') != -1) {
				this.updateSegmentMap(rec);
			}
			if(modifiedFieldNames.indexOf('color') != -1) {
				this.updateSegmentColorMap(rec);	
			}
		}, this);
		this.on('add', function(strandStore, recs, index) {
			this.updateSegmentMap(recs);
			this.updateSegmentColorMap(recs);
		}, this);
	},
	buildSegmentMap: function() {
		var segmentIds = this.getRange(),
			allSegments = [],
			segmentMap = {};

		// Build map of segment identities to sequences
		for(var i = 0; i < segmentIds.length; i++) {
			var rec = segmentIds[i],
				seg = {
					identity: rec.get('identity'),
					sequence: rec.get('sequence')
				};
			allSegments.push(seg);
			segmentMap[seg.identity] = seg.sequence;
		}
		return segmentMap;
	},
	getSegmentMap: function() {
		if(this.segmentMap) {
			return this.segmentMap;
		} else {
			this.segmentMap = this.buildSegmentMap();
		}
	},
	getSegmentMapWithComplements: function() {
		var segmentMap = this.getSegmentMap();
		return DNA.hashComplements(segmentMap);
	},
	updateSegmentMap: function(rec) {
		if(rec && this.segmentMap) {
			if(_.isArray(rec)) {
				for(var i = 0; i < rec.length; i++) {
					this.segmentMap[rec[i].get('identity')] = rec[i].get('sequence');
				}
			} else {
				this.segmentMap[rec.get('identity')] = rec.get('sequence');
			}
		} else {
			this.segmentMap = this.buildSegmentMap();
		}
		return this.segmentMap;
	},
	buildSegmentColorMap: function() {
		var segmentIds = this.getRange(),
			segmentMap = {};

		// Build map of segment identities to sequences
		for(var i = 0; i < segmentIds.length; i++) {
			var rec = segmentIds[i];
			segmentMap[rec.get('identity')] = rec.get('color');
		}
		return segmentMap;
	},
	getSegmentColorMap: function() {
		if(this.segmentColorMap) {
			return this.segmentColorMap;
		} else {
			this.segmentColorMap = this.buildSegmentColorMap();
		}
	},
	updateSegmentColorMap: function(rec) {
		if(rec && this.segmentColorMap) {
			if(_.isArray(rec)) {
				for(var i = 0; i < rec.length; i++) {
					this.segmentColorMap[rec[i].get('identity')] = rec[i].get('color');
				}
			} else {
				this.segmentColorMap[rec.get('identity')] = rec.get('color');
			}
		} else {
			this.segmentColorMap = this.buildSegmentColorMap();
		}
		return this.segmentColorMap;
	},
	getSegmentColorScale: function() {
		var me = this;
		return function segmentColorScale(_) {
			return me.segmentColorMap[_];
		};
	},
	getColorGenerator: function() {
		if(!this.segmentColors) {
			this.segmentColors = d3.scale.category20();
		}
		return this.segmentColors;
	},
	getColor: function(identity) {
		var gen = this.getColorGenerator();
		return gen(identity);
	},
	addSegment: function(length) {
		var segmentMap = this.getSegmentMap(),
			identity = _.max(_.map(_.keys(segmentMap), function(key) {
				return isNaN(+key) ? 0 : (+key);
			}));
		identity < 0 ? (identity = 1) : identity+=1;

		return this.add({
			identity: identity,
			sequence: Array(length + 1).join('N'),
			color: this.getColorGenerator()(identity),
		});
	},
});

Ext.define('App.ui.StrandStore', {
	extend: 'Ext.data.Store',
	model: 'Strand',
	constructor: function() {
		this.callParent(arguments);
		if(this.segmentStore) {
			this.segmentStore.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
				if(modifiedFieldNames.indexOf('sequence') != -1) {
					this.updateStrandSequences();
				}
			}, this);
		}
		this.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
				if(modifiedFieldNames.indexOf('spec') != -1) {
					this.updateStrandSequence(rec);
				}
		},this)
	},
	updateStrandSequence: function updateStrandSequence (rec) {
		var segmentMap = this.segmentStore.getSegmentMap(),
		strand = rec,
		strandSpec = rec.getFlatSpec();
		strand.set('sequence',DNA.threadSegments(segmentMap,strandSpec));
	},
	updateStrandSequences: function() {
		var segmentMap = this.segmentStore.getSegmentMap(),
			strands = this.getRange();

		for(var i = 0; i < strands.length; i++) {
			var strand = strands[i],
				strandSpec = strand.getFlatSpec();
			strand.set('sequence', DNA.threadSegments(segmentMap, strandSpec));
		}
	},
	getSegmentMap: function() {
		return this.segmentStore.getSegmentMap();
	},
	getSegmentMapWithComplements: function() {
		return this.segmentStore.getSegmentMapWithComplements();
	},
	addStrand: function() {
		var name = _.max(_.map(this.getRange(), function(rec) {
			var k = rec.get('name').match(/\d+/g);

			return (!!k && k.length > 0 && !isNaN(k[0])) ? k : 0;
		}));
		name < 0 ? (name = 0) : name;
		var existing;
		do {
			name+=1;
			existing = this.find('name',name);	
		} while (existing != -1)

		return this.add({
			name: 'n'+name,
			spec: '',
		});
	},
})

Ext.define('App.ui.ComplexStore', {
	extend: 'Ext.data.Store',
	model: 'Complex',
	constructor: function() {
		this.callParent(arguments);
		if(this.strandStore) {
			this.strandStore.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
				if(modifiedFieldNames.indexOf('sequence') != -1 || modifiedFieldNames.indexOf('spec') != -1) {
					this.updateComplexes();
				}
			}, this);
		}
	},
	updateComplexes: function(changedStrand) {
		var strandSpecs = {},
			strandSeqs = {},
			strands = this.strandStore.getRange(),
			complexes = this.getRange();
		for(var i = 0; i < strands.length; i++) {
			var strand = strands[i],
				name = strand.get('name');
			strandSpecs[name] = strand.get('spec');
			strandSeqs[name] = strand.get('seq');
		}

		var changedStrandName = changedStrand ? changedStrand.get('name') : null;
		for(var i = 0; i < complexes.length; i++) {
			var complex = complexes[i],
				complexStrands = complex.get('strands'),
				spec = [],
				seqs = [],
				struct = null,
				diffSpec = null;
			for(var j = 0; j < complexStrands.length; j++) {
				var strandName = complexStrands[j];
				
				// if(strandName == changedStrandName) {
				// 	var oldSpec = complex.get('spec')[j];
				// 	if(!diffSpec) {
				// 		diffSpec = changedStrand.diffSpec(oldSpec);
				// 	}

				// }
				spec.push(strandSpecs[strandName]);
				seqs.push(strandSeqs[strandName]);
			}
			complex.beginEdit();
			complex.set('spec', spec);
			complex.set('seqs', seqs);
			complex.endEdit();
		}
	},
	addComplex: function() {
		var name = _.max(_.map(this.getRange(), function(rec) {
			var k = rec.get('name').match(/\d+/g);

			return (!!k && k.length > 0 && !isNaN(k[0])) ? k : 0;
		}));
		name < 0 ? (name = 0) : name;
		var existing;
		do {
			name+=1;
			existing = this.find('name',name);	
		} while (existing != -1)

		return this.add({
			name: 'n'+name,
			strands: [],
			specs: [],
			struture: '',
		});
	},
});


Ext.define('App.ui.StrandPreviewGrid', {
	extend: 'Ext.view.View',
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


	initComponent: function() {
		this.strandPreviews = {};
		this.tpl = ['<tpl for=".">', '<div style="border:solid 1px white;padding:4px;margin:10px;float:left;width:' + this.cellWidth + 'px;height:' + this.cellHeight + 'px;" class="complex-wrap">',
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
		this.tpl = new Ext.XTemplate(['<tpl for=".">', '<div style="border:solid 1px white;padding:4px;margin:10px;float:left;width:' + this.cellWidth + 'px;height:' + this.cellHeight + 'px;" class="complex-wrap">',
		//'<span>{name}</span> = <span>{[values.strands.join(" + ")]}</span> : <span>{structure}</span>',
		'<span style="font-weight:bold;">{name}</span>', '</div>', '</tpl>'].join(''));

		this.getChart(true);
		this.refresh();
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

Ext.define('App.ui.EditComplexWindow', {
	extend: 'Ext.window.Window',
	closable: true,
	closeAction: 'hide',
	maximizable: true,
	width: 500,
	height: 300,
	renderTo: Ext.getBody(),
	autoRender: false,
	layout: 'fit',
	border: false,
	bodyBorder: false,

	initComponent: function() {
		Ext.apply(this,{
			items: [Ext.create('App.ui.EditComplexPanel',{
				complex: this.complex,
				strandEditor: this.strandEditor,
				segmentColors: this.segmentColors,
			})]
		});
		this.callParent(arguments);
	},

});

Ext.define('App.ui.EditComplexPanel', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	border: false,
	bodyBorder: false,
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				xtype: 'strandpreview',
				name: 'strandPreview',
				region: 'west',
				width: 300,
				height: 300,
				split: true,
			}, {
				xtype: 'form',
				name: 'formPanel',
				region: 'center',
				frame: true,
				defaults: {
					labelAlign: 'top',
					anchor: '100%',
				},
				items: [
				{
					//fieldLabel: 'Strands',
					xtype: 'textarea',
					name: 'strandsField',
					validator: Ext.bind(this.validateStrands, this),
					// floating: true,
					// autoRender: true,
				},
				 {
					fieldLabel: 'Strands',
					xtype: 'displayfield',
					name: 'segmentsField',
					cls: 'strand-glyph-well',
				}, {
					fieldLabel: 'Structure',
					xtype: 'textarea',
					name: 'structureField',
					validator: Ext.bind(this.validateStructure, this),
				}]
			}],
		});

		this.callParent(arguments);

		this.formPanel = this.down('[name=formPanel]');
		this.strandPreview = this.down('[name=strandPreview]');


		this.segmentsField = this.down('[name=segmentsField]');
		this.structureField = this.down('[name=structureField]');

		this.strandsField = this.down('[name=strandsField]');
		this.strandsField.on('blur',function() {
			this.updateSegmentsView();
		},this);
		// this.strandsField = Ext.create('Ext.form.field.TextArea',{
		// 	validator: Ext.bind(this.validateStrands, this),
		// });
		this.strandsFieldEditor = Ext.create('Ext.Editor',{
			field: this.strandsField ,
			hideEl: false,
			autoSize: {
				width:'boundEl',
				height:'boundEl',
			},
			alignment: 'tl-tl?',
		});
		this.on('afterrender',function () {
			this.segmentsField.getEl().on('click',function() {
				this.strandsFieldEditor.startEdit(this.segmentsField.inputEl,this.complex.getStrands().join('+'));
			},this);
		});

		this.on('afterrender', this.loadData, this);
		this.on('show',this.loadData,this);
		
		this.formPanel.on('validitychange',function(panel,valid) {
			if(valid) this.updateComplex();
		},this,{buffer: 100});
	},

	/**
	 * Loads #complexData for the record in #complex from the corresponding #strandEditor
	 */
	loadData: function() {
		this.complexData = this.strandEditor.getComplexData(this.complex);

		this.strandsField.setValue(this.complex.getStrands().join('+'));
		this.structureField.setValue(this.complexData.structure);
		this.updateView();
	},

	/**
	 * Updates the record stored in #complex with the data from #getStrands and #getStructure.
	 * Updates the #complexData and {@link #updateView updates the view}.
	 */
	updateComplex: function() {
		this.complex.beginEdit();
		this.complex.set('strands',this.getStrands());
		this.complex.set('structure',this.getStructure());
		this.complex.endEdit();
		this.complexData = this.getComplexData(this.complex);
		this.updateView();
	},

	updateView: function() {
		var me = this;
		if(!!this.segmentColors) this.strandPreview.segmentColors = this.segmentColors;
		this.strandPreview.setValue(this.complexData);
		this.segmentsField.setValue(_.map(this.complexData.strands, function(strand) {
			return me.buildStrandGlyph(strand);
		}).join(' + '));	
	},
	updateSegmentsView: function() {
		var me = this,
			strands = this.getStrands();
		this.segmentsField.setValue(_.map(strands,function(name) {
			var strand = me.getStrandData(name);
			return me.buildStrandGlyph(strand,name);
		}).join(' + '));
	},
	buildStrandGlyph: function(strand,name) {
		var out = '<div class="strand-glyph'+(strand?'':' strand-glyph-unknown')+'">';

		if(strand) { 
			out += '<span class="strand-glyph-name">'+strand.name+'</span>'+ _.map(strand.segments, function(seg) {
				return DNA.makeIdentifier(seg.identity, seg.polarity);
			}).join(' ');
		} else {
			out += '<span class="strand-glyph-name">'+name+'</span>'+' ? '
		}

		out+='</div>';
		return out;
	},
	
	getStrands: function() {
		var strands = this.strandsField.getValue() || '';
		return  _.map(strands.split('+'), function(s) {
			return s.trim();
		});
	},
	getStructure: function() {
		return this.structureField.getValue() || '';
	},
	getStrandData: function() {
		return this.strandEditor.getStrandData.apply(this.strandEditor, arguments);
	},
	getComplexData: function() {
		return this.strandEditor.getComplexData.apply(this.strandEditor, arguments);
	},
	validateStrands: function() {
		var strands = this.getStrands();

		for(var i = 0; i < strands.length; i++) {
			var strand = this.getStrandData(strands[i]);
			if(!strand) {
				return "Unknown strand '" + strands[i] + "'";
			}
		}
		this.structureField.validate();
		return true;
	},
	validateStructure: function() {
		var strands = this.getStrands(),
			structure = this.getStructure();
		
		// ensure input structure is valid dot-paren
		var err = DNA.validateDotParen(structure,/* report errors as strings */ true, /* prohibit unrecognized chars */ true);
		if(err !== true) {
			return err;	
		}

		// split into strand-wise structure
		structures = structure.split('+');

		// test overall length equality
		if(strands.length != structures.length) {
			return Ext.String.format("Strand count and structure count do not match; {0} strands and {1} structures. "+
				"Make sure to separate structures for different strands with + signs.", strands.length, structures.length);
		} else {

			// test segment-wise length dimensioning
			for(var i = 0; i < strands.length; i++) {

				// should not be encountered, but in case unrecognized strand is encountered
				var strand = this.getStrandData(strands[i]);
				if(!strand) {
					return "Please correct strand field to remove unrecognized strand.";
				}

				if(strand.segments.length != structures[i].length) {
					return Ext.String.format("Strand length mismatch; strand '{0}' has {1} segments, but its structure has {2} elements.", strands[i], strand.segments.length, structures[i].length);
				}
			}
			return true;
		}
	},
})

Ext.define('App.ui.StrandEdit', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	border: false,
	bodyBorder: false,
	alias: 'widget.strandedit',
	mixins: {
		app: 'App.ui.Application',
		tip: 'App.ui.TipHelper',
	},
	requires: ['App.ui.D3Panel', 'App.ui.SequenceEditor', 'App.ui.dd.RulesWindow', 'App.ui.dd.ScoreParametersWindow', //
	'App.ui.dd.SequenceWindow', 'App.ui.SequenceThreader', 'App.ui.AddDomainButton', 'App.ui.StrandPreviewViewMenu'],
	constructor: function() {
		this.mixins.app.constructor.apply(this, arguments);
		this.editComplexWindows = {};

		this.callParent(arguments);
	},
	title: 'Strand Editor',
	iconCls: 'domains',
	editorType: 'System',
	initComponent: function() {
		this.segmentStore = Ext.create('App.ui.SegmentStore', {});
		this.strandStore = Ext.create('App.ui.StrandStore', {
			segmentStore: this.segmentStore
		});
		this.complexStore = Ext.create('App.ui.ComplexStore', {
			strandStore: this.strandStore
		});

		this.segmentEditor = Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 1
		});

		this.strandEditor = Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 1
		});

		Ext.apply(this, {
			tbar: [{
				xtype: 'buttongroup',
				columns: 2,
				title: 'Design Sequences',
				items: [{
					text: 'DD',
					width: 64,
					iconCls: 'sequence-24',
					scale: 'medium',
					iconAlign: 'top',
					rowspan: 2,
					handler: this.buildDD,
					scope: this,
				}, {
					text: 'NUPACK',
					iconCls: 'nupack-icon',
					handler: this.buildNupack,
					scope: this,
				}, {
					text: 'Multisubjective',
					iconCls: 'ms-icon',
					handler: this.buildMS,
					scope: this,
					disabled: true,
				}]
			}, {
				xtype: 'buttongroup',
				columns: 2,
				title: 'Kinetics',
				items: [{
					text: 'Enumerate',
					scale: 'medium',
					rowspan: 2,
					iconAlign: 'top',
					iconCls: 'enumerate-24',
					handler: this.buildEnum,
					scope: this,
				}, {
					text: 'to PIL',
					iconCls: 'pil',
				}, {
					text: 'to Graph (ENJS)'
				}],
				//disabled: true,
			}, {
				xtype: 'buttongroup',
				columns: 2,
				title: 'Thermodynamics',
				items: [{
					text: 'Predict structures',
					scale: 'medium',
					rowspan: 2,
					iconAlign: 'top',
					iconCls: 'secondary-24',
					handler: this.buildTherm,
					scope: this,
				}, {
					text: 'Complexes',
				}, {
					text: 'MFE structure'
				}],
				//disabled: true,
			}, {
				xtype: 'buttongroup',
				columns: 2,
				title: 'Export',
				items: [{
					text: 'SVG',
					iconCls: 'svg',
					scale: 'medium',
					iconAlign: 'top',
					rowspan: 2,
					handler: this.displaySVGWindow,
					scope: this,
				}, {
					text: 'PIL',
					iconCls: 'pil',
					handler: this.buildPil,
					scope: this,
				}, {
					text: 'DyNAML',
					iconCls: 'dynaml',
					disabled: true,
				}]
			}, '->',
			{
				xtype: 'buttongroup',
				columns: 1,
				title: 'Workspace',
				items: [Ext.create('App.ui.SaveButton', {
					app: this
				}),
				{
					text: 'Help',
					iconCls: 'help',
					handler: App.ui.Launcher.makeLauncher('help:dil'),
				}]
			}],
			items: [{
				xtype: 'grid',
				name: 'strandsGrid',
				store: this.strandStore,
				region: 'south',
				collapsible: true,
				titleCollapse: true,
				title: 'Strands',
				height: 200,
				split: true,

				tbar: [{
					text: 'Add',
					iconCls: 'plus',
					handler: this.doAddStrand,
					scope: this,
				},{
					text: 'Edit',
					iconCls: 'pencil',
					handler: this.doEditStrand,
					scope: this,
				},{
					text: 'Delete',
					iconCls: 'delete',
					handler: this.doDeleteStrand,
					scope: this,
				}],

				columns: [{
					text: 'Name',
					dataIndex: 'name',
					allowBlank: false,
					width: 90,
				}, {
					text: 'Sequence',
					dataIndex: 'sequence',
					allowBlank: false,
					renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
						var spec = record.getParsedSpec(),
							pos = 0,
							// base-wise index within strand, updated as we iterate below
							segmentMap = record.store.getSegmentMapWithComplements(),
							out = [],
							renderer = CodeMirror.getModeRenderer('sequence', {
								renderer: function(text, style, col) {
									var index = pos + col - 1;
									if(style) return "<span class='sequence-base cm-" + style + "' data-base-index='" + index + "'>" + text + "</span>"
									else return "<span class='sequence-base' data-base-index='" + index + "'>" + text + "</span>"

								}
							});

						for(var i = 0; i < spec.length; i++) {
							var dom = spec[i];
							for(var j = 0; j < dom.segments.length; j++) {
								var seg = dom.segments[j],
									seq = segmentMap[DNA.makeIdentifier(seg.identity, seg.polarity)];
								out.push('<span class="sequence-segment" data-segment-identity="' + seg.identity + '" data-segment-polarity="' + seg.polarity + '">' + renderer(seq) + '</span>');
								pos += seq.length;
							}
						}
						return out.join('');
					},
					scope: this,
					flex: 1,
				}, {
					text: 'Segments',
					dataIndex: 'spec',
					field: {
						xtype: 'textfield',
						validator: Ext.bind(function(value) {
							var segmentMap = this.getSegmentMap();
							var doms = App.dynamic.Compiler.parseDomainString(value,/*parseIdentifier*/ true);
							for(var i=0; i<doms.length; i++) {
								var segs = doms[i].segments;
								for(var j=0; j<segs.length; j++) {
									var seg = segs[j];
									if(!segmentMap[seg.identity]) {
										return "Unknown segment: '"+seg.identity+"'";
									}
								}
							}
							return true;
						},this),
						listeners: {
							// 'focus': {
							// 	fn: function onFocus (cmp,e) {
							// 		cmp.origVal = cmp.getValue();
							// 	},
							// 	scope: this,
							// }
							// 'blur':  {
							// 	fn: function onBlur (cmp,e) {
							// 		var value = cmp.getValue();
							// 		if(value != cmp.origVal && cmp.isValid()) {

							// 		}
							// 		delete cmp.origVal;
							// 	},
							// 	scope: this,
							// }
						}
					},
					renderer: function(str) {
						var spec = App.dynamic.Compiler.parseDomainString(str);
						return _.map(spec,function(dom) {
							return '<div class="domain-glyph domain-glyph-'+dom.role+'"><span class="domain-glyph-name">'+dom.name+'</span>'+
								_.map(dom.segments,function(seg) { return '<span class="segment-glyph segment-glyph-'+seg.role+'">'+seg.name+'</span>' }).join(' ')+'</div>'
						}).join(' ');
					}, // CodeMirror.modeRenderer('dil-domains', 'cm-s-default'),
					flex: 1,
				}, {
					text: 'Complex',
					dataIndex: 'complex'
				}, ],
				plugins: [this.strandEditor],
				highlightSegment: function(identity, polarity) {
					if(polarity === undefined) polarity = 1;
					var el = this.getEl();
					el.select('[data-segment-identity="' + identity + '"][data-segment-polarity="' + polarity + '"]').addCls('sequence-highlight');
					el.select('[data-segment-identity="' + identity + '"][data-segment-polarity="' + (-1 * polarity) + '"]').addCls('sequence-highlight-complement');
				},
				unhighlightSegment: function() {
					var el = this.getEl();
					el.select('.sequence-highlight').removeCls('sequence-highlight');
					el.select('.sequence-highlight-complement').removeCls('sequence-highlight-complement');

				},
			}, {
				xtype: 'grid',
				name: 'segmentsGrid',
				store: this.segmentStore,
				title: 'Segments',
				titleCollapse: true,
				collapsible: true,
				region: 'east',
				width: 200,
				split: true,
				tbar: [Ext.create('App.ui.AddDomainButton', {
					addDomain: Ext.bind(this.createSegment, this),
					extraMenuItems: [{
						text: 'Add many segments...',
						handler: this.showAddSegmentsWindow,
						scope: this,
					}]
				}),{
					text: 'Edit',
					iconCls: 'pencil',
					handler: this.editSegment,
					scope: this,
				},{
					text: 'Delete',
					iconCls: 'delete',
					handler: this.deleteSegment,
					scope: this,
				}],

				columns: [{
					dataIndex: 'color',
					field: {
						xtype: 'colorfield',
						pickerOptions: {
							colors: [
								"1F77B4", "AEC7E8", "FF7F0E", "FFBB78", "2CA02C", "98DF8A", "D62728", "FF9896", "9467BD", "C5B0D5", "8C564B", "C49C94", "E377C2", "F7B6D2", "7F7F7F", "C7C7C7", "BCBD22", "DBDB8D", "17BECF", "9EDAE5",
								"3182BD", "6BAED6", "9ECAE1", "C6DBEF", "E6550D", "FD8D3C", "FDAE6B", "FDD0A2", "31A354", "74C476", "A1D99B", "C7E9C0", "756BB1", "9E9AC8", "BCBDDC", "DADAEB", "636363", "969696", "BDBDBD", "D9D9D9",
								"393B79", "5254A3", "6B6ECF", "9C9EDE", "637939", "8CA252", "B5CF6B", "CEDB9C", "8C6D31", "BD9E39", "E7BA52", "E7CB94", "843C39", "AD494A", "D6616B", "E7969C", "7B4173", "A55194", "CE6DBD", "DE9ED6",
							]
						}
					},
					renderer: function(color) {
						return '<div style="width:12px;height:12px;background-color:'+color+';">&nbsp;</div>'
					},
					width: 40,
				},{
					text: 'Name',
					dataIndex: 'identity',
					flex: 1,
				}, {
					text: 'Sequence',
					dataIndex: 'sequence',
					field: 'textfield',
					renderer: CodeMirror.modeRenderer('sequence'),
					flex: 5,
				}, {
					text: 'Length',
					dataIndex: 'sequence',
					renderer: function(seq) {
						return seq.length;
					},
					flex: 1,
				}],
				plugins: [this.segmentEditor],
			}, {
				xtype: 'panel',
				layout: 'fit',
				region: 'center',
				items: [Ext.create('App.ui.StrandPreviewGrid', {
					name: 'complexView',
					store: this.complexStore,
					strandStore: this.strandStore,
					segmentStore: this.segmentStore,
					listeners: {
						'itemdblclick': {
							fn: function(view, complex, node) {
								this.showEditComplexWindow(complex, node);
							},
							scope: this,
						}
					}
				})],
				bbar: [{
					text: 'Add',
					iconCls: 'plus',
					handler: this.doAddComplex,
					scope: this,
				},{
					text: 'Edit',
					iconCls: 'pencil',
					handler: this.doEditComplex,
					scope: this,
				},{
					text: 'Delete',
					iconCls: 'delete',
					handler: this.doDeleteComplex,
					scope: this,
					disabled: true,
				},'->',
				Ext.create('App.ui.StrandPreviewViewMenu',{view:null,name:'complexViewMenu'})],
			}]
		});
		this.on('afterrender', this.loadFile, this);
		this.callParent(arguments);
		this.strandsGrid = this.down('[name=strandsGrid]');
		this.segmentsGrid = this.down('[name=segmentsGrid]');
		this.complexView = this.down('[name=complexView]');

		this.down('[name=complexViewMenu]').view = this.complexView;

		this.segmentStore.on('update', function(store, rec, operation, modifiedFieldNames) {
			this.updateStrandSequences();
		}, this);

		this.segmentsGrid.on('itemmouseenter', function(grid, rec, el, e) {
			this.fireEvent('updateSegmentHighlight', rec.get('identity'), 1);
		}, this);
		this.segmentsGrid.on('itemmouseleave', function(grid, rec, el, e) {
			this.fireEvent('updateSegmentHighlight', null);
		}, this);


		this.on('updateSegmentHighlight', this.updateSegmentHighlight, this, {
			buffer: 10,
		});



		this.on('afterrender', function() {
			this.strandsGrid.getEl().on('mouseover', function(e, el) {
				var identity = el.getAttribute('data-segment-identity'),
					polarity = el.getAttribute('data-segment-polarity');
				this.fireEvent('updateSegmentHighlight', identity, polarity);
			}, this, {
				delegate: 'span.sequence-segment'
			});

			this.tip = Ext.create('Ext.tip.ToolTip', {
				target: this.strandsGrid.getEl(),
				delegate: 'span.sequence-base',
				trackMouse: true,
				showDelay: false,
				renderTo: Ext.getBody(),
				title: ' ',
				listeners: {
					// Change content dynamically depending on which element triggered the show.
					beforeshow: {
						fn: function updateTipBody(tip) {
							var segmentElement = Ext.get(tip.triggerElement).up('span.sequence-segment'),
								identity = segmentElement.getAttribute('data-segment-identity'),
								polarity = segmentElement.getAttribute('data-segment-polarity'),
								index = tip.triggerElement.getAttribute('data-base-index');
							tip.setTitle(DNA.makeIdentifier(identity, polarity));
							tip.update(index);
							//this.fireEvent('updateSegmentHighlight',identity);
						},
						scope: this
					}
				}
			});
		}, this);

		// this.segmentsGrid.on('containermouseout',function(grid,rec,el,e) {
		// 	this.unhighlightSegment();
		// },this);
	},
	onLoad: function() {
		if(!_.isObject(this.data) && _.isString(this.data) && !! this.data) {
			try {
				this.data = JSON.parse(this.data)
			} catch(e) {
				Ext.msg("Unable to load strand data.");
				console.error(e);
			}
		} else {
			this.data = {};
		}

		this.library = App.dynamic.Library.fromDil(this.data);
		this.loadLibrary(this.library);
		_.defer(_.bind(this.complexView.refresh, this.complexView));
	},

	showAddSegmentsWindow: function() {
		if(!this.addSegmentsWindow) {
			this.addSegmentsWindow = Ext.create('App.ui.SequenceWindow',{
				handler: function(domains) {
					this.strandEditor.updateSegments(domains);
				},
				strandEditor: this,
				title: 'Add segments to system'
			});
		}
		this.addSegmentsWindow.show();
	},
	
	addSegment: function(identity,sequence) {
		return _.first(this.segmentStore.add({
			identity: identity,
			sequence: sequence,
			color: this.segmentStore.getColor(identity),
		}));
	},
	addSegments: function(map) {
		var me = this;
		return this.segmentStore.add(_.map(map,function(sequence,identity) {
			return {
				identity: identity,
				sequence: sequence,
				color: me.segmentStore.getColor(identity),
			}
		}));
	},
	updateSegments: function(map) {
		var me = this;
		return _.map(map,function(sequence,identity) {
			var seg = me.segmentStore.findRecord('identity',identity);
			if(seg) {
				seg.set('sequence',sequence);
				return seg;
			} else {
				return _.first(me.segmentStore.add({
					identity: identity,
					sequence: sequence,
					color: me.segmentStore.getColor(identity),
				}));
			}
		});
	},
	createSegment: function(length) {
		return _.first(this.segmentStore.addSegment(length));
	},
	editSegment: function editSegment (rec) {
		rec || (rec = this.segmentsGrid.getSelectionModel().getLastSelected());
		if (rec) {
			this.segmentEditor.startEdit(rec, this.segmentsGrid.headerCt.getHeaderAtIndex(2));
		}
	},
	doEditSegment: function() {
		return this.editSegment();
	},
	deleteSegment: function deleteSegment (rec) {
		// body...
	},
	doDeleteSegment: function() {
		return this.deleteSegment();
	},
	addStrand: function() {
		return _.first(this.strandStore.addStrand());
	},
	doAddStrand: function() {
		var rec = this.addStrand();
		this.editStrand(rec);
	},
	editStrand: function editStrand (rec) {
		rec || (rec = this.strandsGrid.getSelectionModel().getLastSelected());
		if (rec) {
			this.strandEditor.startEdit(rec, this.strandsGrid.headerCt.getHeaderAtIndex(2));
		}
	},
	doEditStrand: function() {
		return this.editStrand();
	},
	deleteStrand: function deleteStrand (rec) {
		// body...
	},
	doDeleteStrand: function() {
		return this.deleteStrand();
	},
	addComplex: function() {
		return _.first(this.complexStore.addComplex());
	},
	doAddComplex: function() {
		var rec = this.addComplex();
		this.editComplex(rec);
	},
	editComplex: function editComplex (rec) {
		rec || (rec = this.complexView.getSelectionModel().getLastSelected());
		if (rec) {
			this.showEditComplexWindow(rec);
		}
	},
	doEditComplex: function() {
		this.editComplex();
	},
	deleteSegment: function (rec) {
		// body...
	},
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

	updateSegmentHighlight: function(identity, polarity) {
		if(identity) {
			this.highlightSegment(identity, polarity);
		} else {
			this.unhighlightSegment();
		}
	},
	highlightSegment: function(segment, polarity) {
		this.complexView.preview.fade();
		this.complexView.preview.highlight({
			'segment_identity': segment,
			'segment_polarity': polarity
		}, 'node-highlight');
		this.complexView.preview.highlight({
			'segment_identity': segment,
			'segment_polarity': -1 * polarity
		}, 'node-highlight-complement');

		this.strandsGrid.unhighlightSegment();
		this.strandsGrid.highlightSegment(segment, polarity);
	},
	unhighlightSegment: function(segment, polarity) {
		this.complexView.preview.unfade();
		this.complexView.preview.unhighlight(null, 'node-highlight');
		this.complexView.preview.unhighlight(null, 'node-highlight-complement');

		this.strandsGrid.unhighlightSegment();
	},
	buildTarget: function(target) {

		this.requestDocument(function(doc) {
			var data = this.serializeDil(),
				node = this.getDocumentPath(),
				outNode, action, ext;

			switch(target) {
			case 'dd':
				action = 'dd', ext = 'domains', target = 'DD';
				break;
			case 'nupack':
				action = 'nupack', ext = 'np', target = 'NUPACK';
				break;
			case 'ms':
				action = 'ms', ext = 'ms', target = 'Multisubjective';
				break;
			case 'pil':
				action = 'pil', ext = 'pil', target = 'PIL';
				break;
			case 'enum':
				action = 'enum', ext = 'enum', 'Enumerator';
				break;
			case 'svg':
				action = 'svg', ext = 'svg', 'SVG';
				break;
			}
			outNode = App.path.repostfix(node, ext);

			App.runTask('Nodal', {
				node: node,
				data: data,
				action: action,
			}, function(responseText, args, success) {
				if(success) App.msg('DIL Output', 'Output of system <strong>{0}</strong> to {1} completed.', doc.getBasename(), target);
				else App.msg('DIL Output error', 'Output of system <strong>{0}</strong> to {1} failed! See Console for details.', {
					params: [doc.getBasename(), target],
					handler: 'console'
				})
			}, this, {
				openOnEnd: [outNode],
			});

		}, this);
	},

	buildDD: function() {
		this.buildTarget('dd')
	},
	buildNupack: function() {
		this.buildTarget('nupack')
	},
	buildMS: function() {
		this.buildTarget('ms')
	},
	buildPil: function() {
		this.buildTarget('pil')
	},
	buildSVG: function() {
		this.buildTarget('svg')
	},
	buildEnum: function() {
		this.buildTarget('enum')
	},
	displaySVGWindow: function() {
		this.complexView.getMarkup(Ext.bind(this.doDisplaySVGWindow,this));
	},
	doDisplaySVGWindow: function (value) {
		this.svgWindow = Ext.create('App.ui.StrandPreviewTextWindow',{
			title: 'SVG',
		});
		this.svgWindow.show();
		this.svgWindow.setValue(value);
	},
	getSegmentMap: function() {
		return this.segmentStore.getSegmentMap()
	},
	updateStrandSequences: function() {
		var segmentMap = this.getSegmentMap();
		this.strandStore.each(function(strand) {
			var strandSpec = strand.getFlatSpec();
			strand.set('sequence', DNA.threadSegments(segmentMap, strandSpec));
		}, this);
	},

	loadLibrary: function(library) {
		library || (library = {});
		var complexStore = this.complexStore,
			strandStore = this.strandStore,
			segmentStore = this.segmentStore,
			segmentColors = d3.scale.category20();

		segmentStore.colorGenerator = segmentColors;
		segmentStore.add(_.map(library.segments || [], function(seg) {
			return {
				identity: seg.getIdentity(),
				sequence: seg.getSequence(),
				color: !!seg.color ? seg.color : segmentColors(seg.getIdentity()),
			};
		}));

		complexStore.add(_.map(library.nodes || [], function(node) {

			strandStore.add(_.map(node.getStrands() || [], function(strand) {
				return {
					name: strand.getQualifiedName(),
					sequence: strand.getSequence(),
					complex: strand.getNode().getName(),
					spec: strand.printDomains( /* omitLengths */ true),
					polarity: strand.getPolarity()
				};
			}));

			return {
				name: node.getName(),
				polarity: node.getPolarity(),
				structure: node.getSegmentwiseStructure().toDotParen(),
				strands: _.map(node.getStrands(), function(strand) {
					return strand.getQualifiedName()
				})
			};
		}));
	},
	buildLibrary: function() {
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

		// Build objects for nodes
		for(var i = 0; i < complexRecs.length; i++) {
			var complex = complexRecs[i],
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
		}

		// Build new library object
		return new App.dynamic.Library({
			nodes: nodes,
			allSegments: allSegments
		});
	},
	serializeDil: function() {
		var lib = this.buildLibrary();
		return lib.toDilOutput();
	},
	getSaveData: function() {
		return this.serializeDil();
	},
	getSegmentColorScale: function() {
		return this.complexView.getSegmentColorScale();
	},
	showEditComplexWindow: function(complex, node) {
		var name = complex.get('name');
		node || (this.complexView.getNode(complex));
		if(!this.editComplexWindows[name]) {
			this.editComplexWindows[name] = Ext.create('App.ui.EditComplexWindow', {
				complex: complex,
				renderTo: Ext.getBody(),
				title: name,
				strandEditor: this,
				segmentColors: this.getSegmentColorScale(),
			});
		}
		this.editComplexWindows[name].show();
		if(node) {
			this.editComplexWindows[name].alignTo(node, 'tl-tl');
		}
	}
})