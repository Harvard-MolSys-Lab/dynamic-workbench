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
	proxy: 'memory',
})

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
	set: function(fieldName) {
		this.callParent(arguments);
		if(fieldName == 'spec') {
			this.updateCachedSpec();
		}
	},
	getDynaml: function(lib) {
		return lib.getStrand(this.get('name'));
	},
	updateCachedSpec: function() {
		this.parsedSpec = App.dynamic.Compiler.parseDomainString(this.get('spec'), /*parseIdentifier*/ true);
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
	}, ],
});

Ext.define('App.ui.SegmentStore', {
	extend: 'Ext.data.Store',
	model: 'Segment',
	constructor: function() {
		this.callParent(arguments);
		this.on('update', function(strandStore, rec, op, modifiedFieldNames) {
			if(modifiedFieldNames.indexOf('sequence') != -1) {
				this.updateSegmentMap(rec);
			}
		}, this);
		this.on('add', function(strandStore, recs, index) {
			this.updateSegmentMap(recs);
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
	addSegment: function(length) {
		var segmentMap = this.getSegmentMap(),
			identity = _.max(_.map(_.keys(segmentMap), function(key) {
				return isNaN(+key) ? 0 : (+key);
			}));

		this.add({
			identity: (identity + 1),
			sequence: Array(length + 1).join('N')
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
	}
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
	updateComplexes: function() {
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

		for(var i = 0; i < complexes.length; i++) {
			var complex = complexes[i],
				complexStrands = complex.get('strands'),
				spec = [],
				seqs = [];
			for(var j = 0; j < complexStrands.length; j++) {
				var strandName = complexStrands[j];
				spec.push(strandSpecs[strandName]);
				seqs.push(strandSeqs[strandName]);
			}
			complex.beginEdit();
			complex.set('spec', spec);
			complex.set('seqs', seqs);
			complex.endEdit();
		}
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

	initComponent: function() {
		this.strandPreviews = {};
		this.tpl = ['<tpl for=".">', '<div style="border:solid 1px white;padding:4px;margin:10px;float:left;width:' + this.cellWidth + 'px;height:' + this.cellHeight + 'px;" class="complex-wrap">',
		//'<span>{name}</span> = <span>{[values.strands.join(" + ")]}</span> : <span>{structure}</span>',
		'<span style="font-weight:bold;">{name}</span>', '</div>', '</tpl>'].join(''),

		this.on('itemadd', this.addComplexes);
		this.on('itemupdate', this.updateComplex);
		this.on('itemremove', this.removeComplex);

		this.on('itemmouseenter', function(view, rec, el, e) {
			this.fireEvent('updateToolbar', el);
		}, this);
		// this.on('itemmouseleave',function(view,rec,el,e) {
		// 	this.fireEvent('updateToolbar',null);
		// },this);
		// this.on('updatetoolbar',this.updateToolbar,this,{buffer: 10});
		this.callParent(arguments);

		// this.toolbar = Ext.create('Ext.toolbar.Toolbar',{
		// 	renderTo: Ext.getBody(),
		// 	width: 100,
		// 	floating: true,
		// 	items: [{
		// 		iconCls: 'wrench',
		// 	}]
		// });
		// this.toolbar.on('mouseover',function() {
		// 	this.fireEvent('updatetoolbar',true);
		// },this);
	},
	// updateToolbar: function(el) {
	// 	if(el) {
	// 		if(el !== true)
	// 			this.showToolbar(el);
	// 	} else {
	// 		this.hideToolbar();
	// 	}
	// },
	// showToolbar: function(item) {
	// 	this.toolbar.show();
	// 	this.toolbar.alignTo(item,'tr-tr');
	// },
	// hideToolbar: function() {
	// 	this.toolbar.hide();
	// },
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
			.loopMode(this.loopMode)
			.nodeStrokeMode(this.nodeStrokeMode)
			.nodeFillMode(this.nodeFillMode)
			.lineStrokeMode(this.lineStrokeMode)
			.textFillMode(this.textFillMode);
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
		this.preview = chart(nodeData);

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
	highlight: function(criteria) {
		this.preview.highlight(criteria);
	},
	unhighlight: function(criteria) {
		this.preview.unhighlight(criteria);
	},
})

Ext.define('App.ui.EditComplexWindow', {
	extend: 'Ext.window.Window',
	closable: true,
	closeAction: 'hide',
	width: 500,
	height: 300,
	renderTo: Ext.getBody(),
	autoRender: false,
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
				items: [{
					fieldLabel: 'Strands',
					xtype: 'textarea',
					name: 'strandsField',
					validator: Ext.bind(this.validateStrands, this),
				}, {
					fieldLabel: 'Segments',
					xtype: 'textarea',
					name: 'segmentsField',
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

		this.strandsField = this.down('[name=strandsField]');
		this.segmentsField = this.down('[name=segmentsField]');
		this.structureField = this.down('[name=structureField]');
		this.on('afterrender', this.updateData, this);

		this.formPanel.on('validitychange',function(panel,valid) {
			if(valid) this.updateComplex();
		},this,{buffer: 100});
	},
	updateData: function() {
		this.complexData = this.strandEditor.getComplexData(this.complex);
		this.strandsField.setValue(this.complex.getStrands().join('+'));
		this.structureField.setValue(this.complexData.structure);
		this.updateView();
	},
	updateView: function() {
		this.strandPreview.setValue(this.complexData);
		this.segmentsField.setValue(_.map(this.complexData.strands, function(strand) {
			return _.map(strand.segments, function(seg) {
				return DNA.makeIdentifier(seg.identity, seg.polarity);
			}).join(' ');
		}).join(' + '));
	},
	updateComplex: function() {
		this.complex.beginEdit();
		this.complex.set('strands',this.getStrands());
		this.complex.set('structure',this.getStructure());
		this.complex.endEdit();
		this.complexData = this.strandEditor.getComplexData(this.complex);
		this.updateView();
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
			return Ext.String.format("Strand count and structure count do not match; {0} strands and {1} structures", strands.length, structures.length);
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
	requires: ['App.ui.D3Panel', 'App.ui.SequenceEditor', 'App.ui.dd.RulesWindow', 'App.ui.dd.ScoreParametersWindow', 'App.ui.dd.SequenceWindow', 'App.ui.SequenceThreader', 'App.ui.AddDomainButton', ],
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
				title: 'Enumerate Reactions',
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
				}, {
					text: 'to Graph (ENJS)'
				}],
				disabled: true,
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
					handler: this.buildSVG,
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
				//collapsed: true,
				title: 'Strands',
				height: 200,
				split: true,
				columns: [{
					text: 'Name',
					dataIndex: 'name',
					width: 90,
				}, {
					text: 'Sequence',
					dataIndex: 'sequence',
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
					// field: 'textfield',
					renderer: CodeMirror.modeRenderer('dil-domains', 'cm-s-default'),
					flex: 1,
				}, {
					text: 'Complex',
					dataIndex: 'complex'
				}, ],
				plugins: [
				Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit: 1
				})],
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
				region: 'east',
				width: 200,
				split: true,
				collapsible: true,
				tbar: [Ext.create('App.ui.AddDomainButton', {
					addDomain: Ext.bind(this.addSegment, this),
				})],

				columns: [{
					text: 'Name',
					dataIndex: 'identity',
				}, {
					text: 'Sequence',
					dataIndex: 'sequence',
					field: 'textfield',
					renderer: CodeMirror.modeRenderer('sequence')
				}, {
					text: 'Length',
					dataIndex: 'sequence',
					renderer: function(seq) {
						return seq.length;
					}
				}],
				plugins: [
				Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit: 1
				})],
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
				bbar: ['->',
				{
					text: 'View',
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
				}],
			}]
		});
		this.on('afterrender', this.loadFile, this);
		this.callParent(arguments);
		this.strandsGrid = this.down('[name=strandsGrid]');
		this.segmentsGrid = this.down('[name=segmentsGrid]');
		this.complexView = this.down('[name=complexView]');
		this.showBubbles = this.down('[name=showBubbles]');

		this.coloringSegments = this.down('[name=coloringSegments]');
		this.coloringSequences = this.down('[name=coloringSequences]');
		this.coloringDomains = this.down('[name=coloringDomains]');

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

	addSegment: function(length) {
		this.segmentStore.addSegment(length);
	},

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
	getStrandData: function(rec) {
		if(_.isString(rec)) {
			rec = this.strandStore.findRecord('name', rec);
		}
		if(rec) {
			return {
				name: rec.get('name'),
				domains: rec.getParsedSpec(),
				segments: rec.getFlatSpec(),
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

	setComplexViewMode: function(mode) {
		this.complexViewMode = mode;

		switch(mode) {
		case 'segment':
			if(this.showBubbles.checked) {
				this.complexView.nodeStrokeMode = 'segment';
				this.complexView.nodeFillMode = 'segment';
				this.complexView.lineStrokeMode = 'default';
				this.complexView.textFillMode = 'default';
			} else {
				this.complexView.textFillMode = 'segment';
			}
			break;
		case 'domain':
			if(this.showBubbles.checked) {
				this.complexView.lineStrokeMode = '';
				this.complexView.nodeFillMode = 'domain';
				this.complexView.nodeStrokeMode = 'domain';
				this.complexView.textFillMode = 'default';
			} else {
				this.complexView.textFillMode = 'domain';
			}
			break;
		case 'identity':
			if(this.showBubbles.checked) {
				this.complexView.lineStrokeMode = 'default';
				this.complexView.nodeStrokeMode = 'identity';
				this.complexView.nodeFillMode = 'identity';
				this.complexView.textFillMode = 'default';
			} else {
				this.complexView.textFillMode = 'identity';
			}
			break;

		}

		this.complexView.updateChartProperties();

	},
	setComplexViewBubbles: function(showBubbles) {
		this.complexView.showBubbles = showBubbles;
		this.setComplexViewMode(this.complexViewMode);
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
		var complexStore = this.complexStore,
			strandStore = this.strandStore;
		segmentStore = this.segmentStore;

		segmentStore.add(_.map(library.segments, function(seg) {
			return {
				identity: seg.getIdentity(),
				sequence: seg.getSequence()
			};
		}));

		complexStore.add(_.map(library.nodes, function(node) {

			strandStore.add(_.map(node.getStrands(), function(strand) {
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
					sequence: rec.get('sequence')
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
	showEditComplexWindow: function(complex, node) {
		var name = complex.get('name');
		if(!this.editComplexWindows[name]) {
			this.editComplexWindows[name] = Ext.create('App.ui.EditComplexWindow', {
				complex: complex,
				renderTo: Ext.getBody(),
				strandEditor: this,
			})
		}
		this.editComplexWindows[name].show();
		if(node) {
			this.editComplexWindows[name].alignTo(node, 'tl-tl');
		}
	},
	showWindow: function(d, node) {
		if(!this.complexWindows[d.name]) {
			var strands = d['strands'];

			// this.previewPanels[d.name] = Ext.create('App.ui.nodal.StrandPreview', {
			// 	adjacencyMode : 1,
			// 	cls : 'simple-header',
			// 	title : strands.join(" + "),
			// 	autoRender : true,
			// 	value : '',
			// });
			this.previewPanels[d.name] = Ext.create('App.ui.StrandPreview', {
				cls: 'simple-header',
				title: strands.join(" + "),
				autoRender: true,
				value: '',
			});

			this.complexWindows[d.name] = Ext.create('Ext.tip.ToolTip', {
				target: node,
				anchor: 'left',
				constrainPosition: true,
				items: [this.previewPanels[d.name]],
				layout: 'fit',
				autoHide: false,
				closable: true,
				closeAction: 'hide',
				width: 200,
				height: 200,
				draggable: true,
				title: "Complex: " + d.name,
				resizable: true,
				autoRender: true,
			});

			this.complexWindows[d.name].show();
			this.previewPanels[d.name].setTitle(strands.join(" + "))
			this.previewPanels[d.name].setValue( !! d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'], strands);
		} else {
			if(this.complexWindows[d.name].isVisible()) {
				this.complexWindows[d.name].hide();
			} else {
				this.complexWindows[d.name].show();
			}
		}
	}

})