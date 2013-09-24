/**
 * Allows editing of DyNAMiC Intermediate Language (DIL) systems via a graphical interface.
 */
Ext.define('App.usr.dil.DilEditor', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	border: false,
	bodyBorder: false,
	alias: 'widget.strandedit',
	mixins: {
		app: 'App.ui.Application',
		tip: 'App.ui.TipHelper',
	},
	requires: ['App.ui.D3Panel', 'App.usr.seq.Editor',  //
	'App.usr.dd.SequenceWindow', 'App.ui.SequenceThreader', 'App.ui.AddDomainButton', 'App.ui.StrandPreviewViewMenu',
	'App.usr.dil.SegmentStore','App.usr.dil.StrandStore','App.usr.dil.ComplexStore',
	'App.usr.dil.SegmentsGrid','App.usr.dil.StrandsGrid','App.usr.dil.StrandPreviewGrid'],
	constructor: function() {
		this.mixins.app.constructor.apply(this, arguments);
		this.editComplexWindows = {};

		this.callParent(arguments);
	},
	title: 'Strand Editor',
	iconCls: 'domains',
	editorType: 'System',
	initComponent: function() {
		/**
		 * Stores segments in the system
		 * @type {App.usr.dil.SegmentStore}
		 */
		this.segmentStore = Ext.create('App.usr.dil.SegmentStore', {});
		
		/**
		 * Stores strands in the system
		 * @type {App.usr.dil.StrandStore}
		 */
		this.strandStore = Ext.create('App.usr.dil.StrandStore', {
			segmentStore: this.segmentStore
		});

		/**
		 * Stores complexes in the system
		 * @type {App.usr.dil.ComplexStore}
		 */
		this.complexStore = Ext.create('App.usr.dil.ComplexStore', {
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
					// disabled: true,
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
				xtype: 'strandsgrid',
				name: 'strandsGrid',
				store: this.strandStore,
				segmentStore: this.segmentStore,
				region: 'south',
				collapsible: true,
				titleCollapse: true,
				title: 'Strands',
				height: 200,
				split: true,
			}, {
				xtype: 'segmentsgrid',
				name: 'segmentsGrid',
				store: this.segmentStore,
				title: 'Segments',
				titleCollapse: true,
				collapsible: true,
				region: 'east',
				width: 200,
				split: true,
			}, {
				xtype: 'panel',
				layout: 'fit',
				region: 'center',
				items: [Ext.create('App.usr.dil.StrandPreviewGrid', {
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
				{
					xtype: 'slider',
					fieldLabel: 'Size',
					labelWidth: 40,
					width: 100,
					minValue: 100,
					maxValue: 400,
					value: 200,
					increment: 10,
					listeners: {
						'changecomplete': {
							fn: function (slider, newValue) {
								this.complexView.setCellSize(newValue);
							},
							scope: this,
						}
					}
				},'-', Ext.create('App.ui.StrandPreviewViewMenu',{view:null,name:'complexViewMenu'}), 
				
				// {
				// 	xtype: 'slider',
				// 	fieldLabel: 'Zoom',
				// 	labelWidth: 40,
				// 	width: 200,
				// 	minValue: 100,
				// 	maxValue: 400,
				// 	value: 200,
				// 	increment: 10,
				// 	listeners: {
				// 		'changecomplete': {
				// 			fn: function (slider, newValue) {
				// 				this.complexView.setZoom(newValue);
				// 			},
				// 			scope: this,
				// 		}
				// 	}
				// },
				],
			}]
		});
		this.on('afterrender', this.loadFile, this);
		this.callParent(arguments);

		/**
		 * Grid that displays a preview of the assembled strands in the system
		 * @type {App.usr.dil.StrandsGrid}
		 */
		this.strandsGrid = this.down('[name=strandsGrid]');

		/**
		 * Grid that displays a preview of each segment in the system
		 * @type {App.usr.dil.SegmentsGrid}
		 */
		this.segmentsGrid = this.down('[name=segmentsGrid]');

		/**
		 * Grid that displays a preview of each assembled complex in the system
		 * @type {App.usr.dil.StrandPreviewGrid}
		 */
		this.complexView = this.down('[name=complexView]');
		this.down('[name=complexViewMenu]').view = this.complexView;


		this.segmentStore.on('update', function(store, rec, operation, modifiedFieldNames) {
			this.updateStrandSequences();
		}, this);

		// Highlight items in the #strandsGrid and #complexView when they're moused over in the segments grid
		this.segmentsGrid.on('itemmouseenter', function(grid, rec, el, e) {
			this.fireEvent('updateSegmentHighlight', rec.get('identity'), 1);
		}, this);
		this.segmentsGrid.on('itemmouseleave', function(grid, rec, el, e) {
			this.fireEvent('updateSegmentHighlight', null);
		}, this);
		this.on('updateSegmentHighlight', this.updateSegmentHighlight, this, {
			buffer: 10,
		});

		// Highlight items in #segmentsGrid and #complexView when they're moused over in the strands grid
		this.on('afterrender', function() {
			this.strandsGrid.getEl().on('mouseover', function(e, el) {
				var identity = el.getAttribute('data-segment-identity'),
					polarity = el.getAttribute('data-segment-polarity');
				this.fireEvent('updateSegmentHighlight', identity, polarity);
			}, this, {
				delegate: 'span.sequence-segment'
			});
		}, this);


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

	/* ------------------------------------------------------------------------------------------- 
	   Complex management                                                                        */


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
	
	/* ------------------------------------------------------------------------------------------- 
	   Data handling                                                                             */

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

	/**
	 * Gets a hash mapping the {@link DNA.parseIdentifier identifier} of each segment in the #segmentStore
	 * to its sequence. Calls {@link App.usr.dil.SegmentStore#getSegmentMap}.
	 * @return {[type]} [description]
	 */
	getSegmentMap: function() {
		return this.segmentStore.getSegmentMap()
	},
	/**
	 * Gets a D3 qualitative color scale for the segments displayed by the #complexView
	 * @return {[type]} [description]
	 */
	getSegmentColorScale: function() {
		return this.complexView.getSegmentColorScale();
	},

	/**
	 * Instructs the #strandStore to update all of its calculated sequences based on the sequence data
	 * in #segmentStore. Calls #getSegmentMap to procure this data.
	 */
	updateStrandSequences: function() {
		var segmentMap = this.getSegmentMap();
		this.strandStore.each(function(strand) {
			var strandSpec = strand.getFlatSpec();
			strand.set('sequence', DNA.threadSegments(segmentMap, strandSpec));
		}, this);
	},
	showEditComplexWindow: function(complex, node) {
		var name = complex.get('name');
		node || (this.complexView.getNode(complex));
		if(!this.editComplexWindows[name]) {
			this.editComplexWindows[name] = Ext.create('App.usr.dil.EditComplexWindow', {
				complex: complex,
				renderTo: Ext.getBody(),
				title: name,
				strandManager: this,
				segmentColors: this.getSegmentColorScale(),
			});
		}
		this.editComplexWindows[name].show();
		if(node) {
			this.editComplexWindows[name].alignTo(node, 'tl-tl');
		}
	},

	/* ------------------------------------------------------------------------------------------- 
	   Visualization                                                                             */

	updateSegmentHighlight: function(identity, polarity) {
		if(identity) {
			this.highlightSegment(identity, polarity);
		} else {
			this.unhighlightSegment();
		}
	},
	/**
	 * Highlights the passed segment with the given polarity in the #complexView and #strandsGrid
	 * @param  {String} segment Segment identity
	 * @param  {Number} polarity Segment polarity (-1 or 1)
	 */
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
	/**
	 * Unhighlights the passed segment with the given polarity in the #complexView and #strandsGrid
	 * @param  {String} segment Segment identity
	 * @param  {Number} polarity Segment polarity (-1 or 1)
	 */
	unhighlightSegment: function(segment, polarity) {
		this.complexView.preview.unfade();
		this.complexView.preview.unhighlight(null, 'node-highlight');
		this.complexView.preview.unhighlight(null, 'node-highlight-complement');

		this.strandsGrid.unhighlightSegment();
	},

	/* ------------------------------------------------------------------------------------------- 
	   Builds                                                                                    */

	/**
	 * Executes a task on the server to build the library currently displayed by the component
	 * into the appropriate type of file
	 * @param  {String} target 
	 * A valid DyNAMiC build target (type of file to build from this library); one of:
	 * 	- `dd`
	 * 	- `nupack`
	 * 	- `ms`
	 * 	- `pil`
	 * 	- `enum`
	 * 	- `svg`
	 */
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
	
	/**
	 * Populates the component's stores (in #segmentStore, #strandStore, and #complexStore) with data from a DyNAML library
	 * @param  {App.dynamic.Library} library Library from which to load data
	 */
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
	/**
	 * Generates a new DyNAML library from the current data in the component (in #segmentStore, #strandStore, and #complexStore)
	 * @return {App.dynamic.Library} Generated library
	 */
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
	
})