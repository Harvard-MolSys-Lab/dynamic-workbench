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
		name: 'specs',  // array
	},{
		name: 'sequences',  // array
	},{
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
		if (fieldName == 'spec') {
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
		if (!this.parsedSpec) {
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
	buildSegmentMap: function() {
		var segmentIds = this.getRange(),
			allSegments = [],
			segmentMap = {};

		// Build map of segment identities to sequences
		for (var i = 0; i < segmentIds.length; i++) {
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
		return this.buildSegmentMap()
	},
});

Ext.define('App.ui.StrandStore', {
	extend: 'Ext.data.Store',
	model: 'Strand',
	constructor: function() {
		this.callParent(arguments);
		if(this.segmentStore) {
			this.segmentStore.on('update',function(segmentStore,rec,op,modifiedFieldNames) {
				if(modifiedFieldNames.indexOf('sequence') != -1) {
					this.updateStrandSequences();
				}
			},this);
		}
	},
	updateStrandSequences: function() {
		var segmentMap = this.segmentStore.getSegmentMap(),
			strands = this.getRange();
		
		for(var i=0; i<strands.length;i++) {
			var strand = strands[i], 
				strandSpec = strand.getFlatSpec();	
			strand.set('sequence', DNA.threadSegments(segmentMap, strandSpec));
		}
	},
})

Ext.define('App.ui.ComplexStore',{
	extend: 'Ext.data.Store',
	model: 'Complex',
	constructor: function() {
		this.callParent(arguments);
		if(this.strandStore) {
			this.strandStore.on('update',function(segmentStore,rec,op,modifiedFieldNames) {
				if(modifiedFieldNames.indexOf('sequence') != -1 || modifiedFieldNames.indexOf('spec') != -1) {
					this.updateComplexes();
				}
			},this);
		}
	},
	updateComplexes: function() {
		var strandSpecs = {}, strandSeqs = {}, 
			strands = this.strandStore.getRange(), 
			complexes = this.getRange();
		for(var i=0; i<strands.length;i++) {
			var strand = strands[i], name = strand.get('name');
			strandSpecs[name] = strand.get('spec');
			strandSeqs[name] = strand.get('seq');
		}

		for(var i=0; i<complexes.length; i++) {
			var complex = complexes[i], complexStrands = complex.get('strands'),
				spec = [], seqs = [];
			for(var j=0; j<complexStrands.length; j++) {
				var strandName = complexStrands[j];
				spec.push(strandSpecs[strandName]);
				seqs.push(strandSeqs[strandName]);	
			}
			complex.beginEdit();
			complex.set('spec',spec);
			complex.set('seqs',seqs);
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
	autoScroll: true,
	paddingWidth: 6,
	paddingHeight: 14,
	nodeFillMode : 'segment', // 'identity', 'segment', 'domain'
	nodeStrokeMode : 'segment', // 'identity', 'segment', 'domain'
	lineStrokeMode : 'default', 
	textFillMode : 'default',
	showBubbles: true,
	initComponent: function() {
		this.strandPreviews = {};
		this.tpl = ['<tpl for=".">', '<div style="border:solid 1px white;padding:4px;margin:10px;float:left;width:' + this.cellWidth + 'px;height:' + this.cellHeight + 'px;" class="complex-wrap">',
		//'<span>{name}</span> = <span>{[values.strands.join(" + ")]}</span> : <span>{structure}</span>',
		'<span style="font-weight:bold;">{name}</span>', '</div>', '</tpl>'].join(''),

		this.on('itemadd', this.addComplexes);
		this.on('itemupdate', this.updateComplex);
		this.on('itemremove', this.removeComplex);

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
		if (!this.chart || update) {
			this.chart = StrandPreview()
				.width(this.cellWidth-this.paddingWidth)
				.height(this.cellHeight-this.paddingHeight)
				.showBubbles(this.showBubbles)
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
		for (var i = 0; i < records.length; i++) {
			var rec = records[i],
				dom = this.getNode(rec);

			if (dom) {
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

		if (nodes.length > 0) {
			// Configure chart prototype
			var chart = me.getChart();

			// Build selection and chart
			var nodeData = d3.selectAll(nodes).data(data).append('svg');
			nodeData.call(chart);


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

		for (var i = 0; i < records.length; i++) {
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

		if (nodes.length > 0) {
			// Configure chart prototype
			var chart = me.getChart();

			// Build selection and chart
			var nodeData = d3.selectAll(nodes).data(data).append('svg');
			nodeData.call(chart);


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
		nodeData.call(chart);

	},
	removeComplex: function(record, index) {

	},
	getSegmentMap: function() {
		if (this.segmentMap) {
			return this.segmentMap;
		} else if (this.segmentStore) {
			return this.segmentStore.getSegmentMap();
		}
	},
})


// Ext.define('Complex',{
// extend: 'Ext.data.Model',
// fields: [
// { name: 'id', type: 'int' },
// { name: 'name' },
// { name: 'structure' },
// ],
// //idgen: 'sequential',
// hasMany: { model: 'Strand', name: 'strands' },
// getDynaml: function(lib) {
// return lib.getNode(this.get('name'));
// },
// proxy: 'memory',
// })
// 
// Ext.define('Strand',{
// extend: 'Ext.data.Model',
// fields: [
// { name: 'id', type: 'int' },
// { name: 'name' },
// { name: 'domains' },
// { name: 'complex_id', type: 'int' }
// ],
// //idgen: 'sequential',
// //hasMany: { model: 'Domain', name: 'domains' },
// belongsTo: { model: 'Complex', name: 'complex', },
// getDynaml: function(lib) {
// return lib.getStrand(this.get('name'));
// },
// proxy: 'memory',
// })
// 
// Ext.define('Domain',{
// extend: 'Ext.data.Model',
// fields: [
// { name: 'name' },
// ],
// idProperty: 'name',
// hasMany: { model: 'Segment', name: 'segments' },
// belongsTo: { model: 'Strand', name: 'strand'},
// getDynaml: function(lib) {
// return this.getStrand().getDynaml(lib).getDomain(this.get('name'));
// }
// })
// 
// Ext.define('Segment',{
// extend: 'Ext.data.Model',
// fields: [
// { name: 'name' },
// { name: 'polarity', type: 'int' },
// { name: 'segment_id' }
// ],
// idProperty: 'segment_id',
// hasOne: { model: 'SegmentIdentity', name: 'identity', },
// belongsTo: { model: 'Domain', name: 'domain', },
// getDynaml: function(lib) {
// return lib.getSegment(this.get('id'));
// }
// })
// 
// Ext.define('SegmentIdentity',{
// extend: 'Ext.data.Model',
// fields: [
// { name: 'identity' },
// { name: 'length', type: 'int' },
// { name: 'sequence' }
// ]
// })
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
	requires: ['App.ui.D3Panel', 'App.ui.SequenceEditor', 'App.ui.dd.RulesWindow', 'App.ui.dd.ScoreParametersWindow', 'App.ui.dd.SequenceWindow', 'App.ui.SequenceThreader', ],
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
		this.strandStore = Ext.create('App.ui.StrandStore', {segmentStore: this.segmentStore});
		this.complexStore = Ext.create('App.ui.ComplexStore', {strandStore: this.strandStore});

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
				}]
			}, {
				xtype: 'buttongroup',
				columns: 1,
				title: 'Enumerate Reaction',
				items: [{
					text: 'Enumerate',
					scale: 'medium',
					iconAlign: 'top',
					iconCls: 'enumerate-24',
					handler: this.buildEnum,
					scope: this,
				}, ]
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
			}, '->',{
				xtype: 'buttongroup',
				columns: 1,
				title: 'Workspace',
				items: [Ext.create('App.ui.SaveButton',{
					app: this
				}),{
					text : 'Help',
					iconCls : 'help',
					handler : App.ui.Launcher.makeLauncher('help:dil'),
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
					renderer: CodeMirror.modeRenderer('sequence'),
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
			}, {
				xtype: 'grid',
				name: 'segmentsGrid',
				store: this.segmentStore,
				title: 'Segments',
				region: 'east',
				width: 200,
				split: true,
				collapsible: true,
				//collapsed: true,
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
							fn: function(view,complex,node) { 
								this.showEditComplexWindow(complex,node);
							}, 
							scope: this,
						}
					}
				})],
				bbar: ['->',{
					text: 'View',
					menu: [{ 
						text: 'Segments', checked: true, 
						name:'coloringSegments', group: 'coloring',
						xtype:'menucheckitem', 
						handler: function() {
							this.setComplexViewMode('segment');
						}, 
						scope: this 
					}, { 
						text: 'Domains', checked: false, 
						name:'coloringDomains', group: 'coloring',
						xtype:'menucheckitem', 
						handler: function() {
							this.setComplexViewMode('domain');
						}, 
						scope: this 
					},{ 
						text: 'Base identity', checked: true, 
						name:'coloringSequences', group: 'coloring',
						xtype:'menucheckitem', 
						handler: function() {
							this.setComplexViewMode('identity');
						}, 
						scope: this 
					}, '-', { 
						text: 'Show bubbles', checked: true, 
						name:'showBubbles', xtype:'menucheckitem', handler: function(item) {
							this.setComplexViewBubbles(item.checked);
						}, scope: this 
					}]
				}],
			}]
		});
		this.on('afterrender', this.loadFile, this);
		this.callParent(arguments);
		this.strandsGrid = this.down('[name=strandsGrid]');
		this.domainsGrid = this.down('[name=domainsGrid]');
		this.complexView = this.down('[name=complexView]');
		this.showBubbles = this.down('[name=showBubbles]');

		this.coloringSegments = this.down('[name=coloringSegments]');
		this.coloringSequences = this.down('[name=coloringSequences]');
		this.coloringDomains = this.down('[name=coloringDomains]');

		this.segmentStore.on('update', function(store, rec, operation, modifiedFieldNames) {
			this.updateStrandSequences();
		}, this);

	},
	onLoad: function() {
		if (!_.isObject(this.data) && _.isString(this.data) && !!this.data) {
			try {
				this.data = JSON.parse(this.data)
			} catch (e) {
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
	buildTarget: function(target) {

		this.requestDocument(function(doc) {
			var data = this.serializeDil(),
				node = this.getDocumentPath(), outNode, action, ext;

			switch(target) {
				case 'dd': action = 'dd', ext = 'domains', target = 'DD'; break;
				case 'nupack': action = 'nupack', ext = 'np', target = 'NUPACK'; break;
				case 'ms': action = 'ms', ext = 'ms', target = 'Multisubjective'; break;
				case 'pil': action = 'pil', ext = 'pil', target = 'PIL'; break;
				case 'enum': action = 'enum', ext = 'enum', 'Enumerator'; break;
				case 'svg': action = 'svg', ext = 'svg', 'SVG'; break;
			}
			outNode = App.path.repostfix(node, ext);

			App.runTask('Nodal',{
				node:node,
				data:data,
				action: action,
			},function(responseText,args,success) {
				if(success)
					App.msg('DIL Output','Output of system <strong>{0}</strong> to {1} completed.',doc.getBasename(),target);
				else
					App.msg('DIL Output error', 'Output of system <strong>{0}</strong> to {1} failed! See Console for details.',{params: [doc.getBasename(),target], handler:'console'})
			},this,{
				openOnEnd: [outNode],
			});

		},this);
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
		this.complexView.showBubbles = showBubbles ;
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
					spec: strand.printDomains(/* omitLengths */ true),
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
		for (var i = 0; i < segmentIds.length; i++) {
			var rec = segmentIds[i],
				seg = {
					identity: rec.get('identity'),
					sequence: rec.get('sequence')
				};
			allSegments.push(seg);
			segmentMap[seg.identity] = seg.sequence;
		}

		// Build objects for strands
		for (var i = 0; i < strandRecs.length; i++) {
			var rec = strandRecs[i], strand, 
				doms = _.clone(rec.getParsedSpec());

			// Update domain objects (built from spec) with sequence info
			for (var j = 0; j < doms.length; j++) {
				var dom = doms[j];
				for (var k = 0; k < dom.segments.length; k++) {
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
		for (var i = 0; i < complexRecs.length; i++) {
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
	showEditComplexWindow: function(node,complex) {
		if(!this.editComplexWindows[complex.name]) {
			editComplexWindows[complex.name] = Ext.create('Ext.tip.ToolTip',{
				target : node,
				anchor : 'left',
				constrainPosition : true,
				autoHide : false,
				closable : true,
				closeAction : 'hide',
				with: 200, height: 200,

				layout: 'fit',
				items : [{
					xtype: 'form',
					defaults: {
						labelAlign: 'top'
					},
					items: [{
						fieldLabel: 'Strands',
						xtype: 'textarea',
					},{
						fieldLabel: 'Structure',
						xtype: 'textarea',
					}]
				}],
			})
		}
		editComplexWindows[complex.name].show();
	},
	showWindow : function(d, node) {
		if (!this.complexWindows[d.name]) {
			var strands = d['strands'];

			// this.previewPanels[d.name] = Ext.create('App.ui.nodal.StrandPreview', {
			// 	adjacencyMode : 1,
			// 	cls : 'simple-header',
			// 	title : strands.join(" + "),
			// 	autoRender : true,
			// 	value : '',
			// });
			this.previewPanels[d.name] = Ext.create('App.ui.StrandPreview', {
				cls : 'simple-header',
				title : strands.join(" + "),
				autoRender : true,
				value : '',
			});

			this.complexWindows[d.name] = Ext.create('Ext.tip.ToolTip', {
				target : node,
				anchor : 'left',
				constrainPosition : true,
				items : [this.previewPanels[d.name]],
				layout : 'fit',
				autoHide : false,
				closable : true,
				closeAction : 'hide',
				width : 200,
				height : 200,
				draggable : true,
				title : "Complex: " + d.name,
				resizable : true,
				autoRender : true,
			});

			this.complexWindows[d.name].show();
			this.previewPanels[d.name].setTitle(strands.join(" + "))
			this.previewPanels[d.name].setValue(!!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'], strands);
		} else {
			if (this.complexWindows[d.name].isVisible()) {
				this.complexWindows[d.name].hide();
			} else {
				this.complexWindows[d.name].show();
			}
		}
	}

})