Ext.define('Complex',{
	extend: 'Ext.data.Model',
	fields: [
		{ name: 'id', type: 'int' },
		{ name: 'name' },
		{ name: 'polarity', type: 'int' },
		{ name: 'strands' }, // array
		{ name: 'structure' },
	],
	idgen: 'sequential',
	getDynaml: function(lib) {
		return lib.getNode(this.get('name'));
	},
	getStrands: function() {
		return this.get('strands');
	},
	proxy: 'memory',
})

Ext.define('Strand',{
	extend: 'Ext.data.Model',
	fields: [
		{ name: 'id', type: 'int' },
		{ name: 'name' },
		{ name: 'polarity', type: 'int' },
		{ name: 'sequence' },
		{ name: 'domains' },
		{ name: 'spec' },
	],
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
		this.parsedSpec = App.dynamic.Compiler.parseDomainString(this.get('spec'),/*parseIdentifier*/ true);
	},
	getParsedSpec: function() {
		if(!this.parsedSpec) {
			this.updateCachedSpec();
		}
		return this.parsedSpec;
	},
	getFlatSpec: function() {
		return _.comprehend(this.getParsedSpec(),function(dom) { return dom.segments });
	},
	proxy: 'memory',
})

Ext.define('Domain',{
	extend: 'Ext.data.Model',
	fields: [
		{ name: 'name' },
	],
	// getDynaml: function(lib) {
		// return this.getStrand().getDynaml(lib).getDomain(this.get('name'));
	// }
})

Ext.define('Segment',{
	extend: 'Ext.data.Model',
	fields: [
		{ name: 'identity' },
		{ name: 'sequence' },
	],
});

Ext.define('App.ui.SegmentStore',{
	extend: 'Ext.data.Store',
	model: 'Segment',
	buildSegmentMap: function() {
		var segmentIds = this.getRange(),
			allSegments = [], segmentMap = {};
		
		// Build map of segment identities to sequences
		for(var i=0; i<segmentIds.length; i++) {
			var rec = segmentIds[i], 
				seg = { identity: rec.get('identity'), sequence: rec.get('sequence') };
			allSegments.push(seg); 
			segmentMap[seg.identity] = seg.sequence;	
		}
		return segmentMap;
	},
	getSegmentMap: function() {
		return this.buildSegmentMap()
	},
})


Ext.define('App.ui.StrandPreviewGrid',{
	extend: 'Ext.view.View',
	cellWidth: 200,
	cellHeight: 200,
	itemSelector: 'div.complex-wrap',
	trackOver: true,
	overItemCls: 'x-view-over',
	autoScroll: true,
	initComponent: function() {
		this.strandPreviews = {};
		this.tpl = ['<tpl for=".">',
	        '<div style="border:solid 1px white;padding:4px;margin:10px;float:left;width:'+this.cellWidth+'px;height:'+this.cellHeight+'px;" class="complex-wrap">',
	        //'<span>{name}</span> = <span>{[values.strands.join(" + ")]}</span> : <span>{structure}</span>',
	        '<span style="font-weight:bold;">{name}</span>',
	        '</div>',
    	'</tpl>'].join(''),
		
		this.callParent(arguments);
	},
	
	refresh: function() {
		this.callParent(arguments);
		
		var me = this,
			nodes = [], 
			records = me.store.getRange(), data = [], segmentMap = me.getSegmentMap();
		for(var i=0; i<records.length; i++) {
			var rec = records[i],
				dom = this.getNode(rec);
				
			if(dom) {
				nodes.push(dom);
				
				data.push({
					strands: _.map(rec.getStrands(),function(strandName) { 
						return { name: strandName, domains: me.strandStore.findRecord('name',strandName).getParsedSpec() }
					}),
					structure: rec.get('structure'),
					sequences: segmentMap,
				});
			}
		}
		
		if(nodes.length > 0) {
			// Configure chart prototype
			var chart = StrandPreview().width(me.cellWidth).height(me.cellHeight);
			
			// Build selection and chart
			var nodeData = d3.selectAll(nodes).data(data).append('svg');
			nodeData.call(chart);
			
			
			// this.resizers = [];
		}
	},
	getSegmentMap: function() {
		if(this.segmentMap) {
			return this.segmentMap;
		} else if(this.segmentStore) {
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

Ext.define('App.ui.StrandEdit',{
	extend: 'Ext.panel.Panel',
	layout: 'border',
	border: false,
	bodyBorder: false,
	alias: 'widget.strandedit',
	mixins : {
		app : 'App.ui.Application',
		tip : 'App.ui.TipHelper',
	},
	requires : ['App.ui.D3Panel','App.ui.SequenceEditor', 'App.ui.dd.RulesWindow', 'App.ui.dd.ScoreParametersWindow', 'App.ui.dd.SequenceWindow', 'App.ui.SequenceThreader',],
	constructor : function() {
		this.mixins.app.constructor.apply(this, arguments);
		this.callParent(arguments);
	},
	title : 'Strand Editor',
	iconCls: 'domains',
	editorType : 'System',
	initComponent: function() {
		this.complexStore = Ext.create('Ext.data.Store',{
			model: 'Complex',
		});
		this.strandStore = Ext.create('Ext.data.Store',{
			model: 'Strand',
		});
		this.segmentStore = Ext.create('App.ui.SegmentStore',{
		});
		// this.segmentIdStore = Ext.create('Ext.data.Store',{
			// model: 'SegmentIdentity',
		// });
		
		Ext.apply(this,{
			tbar: [{
				xtype: 'buttongroup',
				columns: 2,
				title: 'Sequence Design',
				items: [{
					text: 'DD',
					iconCls: 'sequence-24',
					scale: 'medium',
					iconAlign: 'top',
					rowspan: 2
				},{
					text: 'NUPACK',
					iconCls: 'nupack-icon',
				},{
					text: 'Multisubjective',
					iconCls: 'ms-icon'
				}]
			},{
				xtype: 'buttongroup',
				columns: 1,
				title: 'Enumeration',
				items: [{
					text: 'Enumerate',
					scale: 'medium',
					iconAlign: 'top',
					iconCls: 'enumerate-24',
				},]
			},{
				xtype: 'buttongroup',
				columns: 2,
				title: 'Export',
				items: [{
					text: 'SVG',
					iconCls: 'svg',
					scale: 'medium',
					iconAlign: 'top',
					rowspan: 2
				},{
					text: 'PIL',
					iconCls: 'pil'
				},{
					text: 'DyNAML',
					iconCls: 'dynaml',
				}]
			}],
			items: [{
				xtype: 'grid',
				name: 'strandsGrid',
				store: this.strandStore,
				region: 'south',
				height: 200,
				split: true,
				columns: [{
					text: 'Name',
					dataIndex: 'name',
					width: 90,
				},{
					text: 'Sequence',
					dataIndex: 'sequence',
					renderer: CodeMirror.modeRenderer('sequence'),
					flex: 1,
				},{
					text: 'Segments',
					dataIndex: 'spec',
					field: 'textfield',
					renderer: CodeMirror.modeRenderer('dil-domains','cm-s-default'),
					flex: 1,
				},{
					text: 'Complex',
					dataIndex: 'complex'
				},],
				plugins: [
			        Ext.create('Ext.grid.plugin.CellEditing', {
			            clicksToEdit: 1
			        })
			    ],
			},{
				xtype: 'grid',
				name: 'segmentsGrid',
				store: this.segmentStore,
				region: 'east',
				width: 200,
				split: true,
				collapsible: true,
				columns: [{
					text: 'Name',
					dataIndex: 'identity',
				},{
					text: 'Sequence',
					dataIndex: 'sequence',
					field: 'textfield',
					renderer: CodeMirror.modeRenderer('sequence')
				},{
					text: 'Length',
					dataIndex: 'sequence',
					renderer: function(seq) {
						return seq.length;
					}
				}],
				plugins: [
			        Ext.create('Ext.grid.plugin.CellEditing', {
			            clicksToEdit: 1
			        })
			    ],
			},{
				xtype: 'panel',
				layout: 'fit',
				region: 'center',
				items: [Ext.create('App.ui.StrandPreviewGrid',{
					name: 'complexView',
					store: this.complexStore,
					strandStore: this.strandStore,
					segmentStore: this.segmentStore,
				})]
			}]
		});
		this.on('afterrender', this.loadFile, this);
		this.callParent(arguments);
		this.strandsGrid = this.down('[name=strandsGrid]');
		this.domainsGrid = this.down('[name=domainsGrid]');
		this.complexView = this.down('[name=complexView]');
		
		this.segmentStore.on('update',function(store,rec,operation,modifiedFieldNames) {
			this.updateStrandSequences();
		},this);
		
	},
	onLoad: function() {
		if(!_.isObject(this.data) && _.isString(this.data)) {
			try {
				this.data = JSON.parse(this.data)
			} catch(e) {
				Ext.msg("Unable to load strand data.");
				console.error(e);
			}
		}
		
		this.library = App.dynamic.Library.fromDil(this.data);
		this.loadLibrary(this.library);
		_.defer(_.bind(this.complexView.refresh,this.complexView));
	},
	buildSegmentMap: function() {
		var segmentIds = this.segmentStore.getRange(),
			allSegments = [], segmentMap = {};
		
		// Build map of segment identities to sequences
		for(var i=0; i<segmentIds.length; i++) {
			var rec = segmentIds[i], 
				seg = { identity: rec.get('identity'), sequence: rec.get('sequence') };
			allSegments.push(seg); 
			segmentMap[seg.identity] = seg.sequence;	
		}
		return segmentMap;
	},
	getSegmentMap: function() {
		return this.buildSegmentMap()
	},
	updateStrandSequences: function() {
		var segmentMap = this.getSegmentMap();
		this.strandStore.each(function(strand) {
			var strandSpec = strand.getFlatSpec();
			strand.set('sequence',DNA.threadSegments(segmentMap,strandSpec));
		},this);
	},
	
	loadLibrary: function(library) {
		var complexStore = this.complexStore, 
			strandStore = this.strandStore;
			segmentStore = this.segmentStore;
		
		segmentStore.add(_.map(library.segments,function(seg) {
			return { identity: seg.getIdentity(), sequence: seg.getSequence() };
		}));
		
		complexStore.add(_.map(library.nodes,function(node) {
			
			strandStore.add(_.map(node.getStrands(),function(strand) {
				return { name: strand.getQualifiedName(), 
						sequence: strand.getSequence(), 
						complex: strand.getNode().getName(), 
						spec: strand.printDomains(),
						polarity: strand.getPolarity() };
			}));
			
			return { name: node.getName(), 
					polarity: node.getPolarity(),
					structure: node.getSegmentwiseStructure().toDotParen(), 
					strands: _.map(node.getStrands(),function(strand) { return strand.getQualifiedName() }) };
		}));
	},
	buildLibrary: function() {
		var segmentIds = this.segmentStore.getRange(),
			strandRecs = this.strandStore.getRange(),
			complexRecs = this.complexStore.getRange(),
			segmentMap = {}, allSegments = [],
			strandMap = {}, strands = [],
			nodes = [];
			
			
		// Build map of segment identities to sequences
		for(var i=0; i<segmentIds.length; i++) {
			var rec = segmentIds[i], 
				seg = { identity: rec.get('identity'), sequence: rec.get('sequence') };
			allSegments.push(seg); 
			segmentMap[seg.identity] = seg.sequence;	
		}
		
		// Build objects for strands
		for(var i=0; i<strandRecs.length; i++) {
			var rec = segmentIds[i], 
				strand, doms = _.clone(strand.getParsedSpec());
			
			// Update domain objects (built from spec) with sequence info
			for(var j=0;j<doms.length;j++) {
				var dom = doms[j];
				for(var k=0;k<dom.segments.length;k++) {
					var seg = dom.segments[k];
					seg.sequence = segmentMap[seg.identity];					
				}
			}
			
			strand = { name: rec.get('name'), domains: doms };
			strands.push(strand); 
			strandMap[strand.name] = strand;
		}
		
		// Build objects for nodes
		for(var i=0; i<complexRecs.length; i++) {
			var complex = complexRecs[i],
				complexStrands = complex.getStrands(),
				node;
			
			node = { name: complex.get('name'), 
					structure: complex.get('structure'), 
					polarity: complex.get('polarity'),
					strands: _.map(complexStrands,function(strand) { return strandMap[strand] }) };
					
			nodes.push(node);
		}
		
		// Build new library object
		var library = new Library({
			nodes: nodes,
			allSegments: allSegments
		});
		
	}
	
})