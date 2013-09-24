/**
 * Allows editing of scripts for the Multisubjective sequence designer
 */
Ext.define('App.usr.ms.Editor', {
	extend: 'Ext.panel.Panel',
	layout: 'border',
	border: false,
	bodyBorder: false,
	mixins: {
		app: 'App.ui.Application',
		tip: 'App.ui.TipHelper',
	},
	requires: ['App.ui.D3Panel', 'App.usr.seq.Editor',  //
	'App.usr.dd.SequenceWindow', 'App.ui.SequenceThreader', 'App.ui.AddDomainButton', 'App.ui.StrandPreviewViewMenu',
	'App.usr.dil.SegmentStore','App.usr.dil.StrandStore','App.usr.dil.ComplexStore',
	'App.usr.dil.SegmentsGrid','App.usr.dil.StrandsGrid','App.usr.dil.StrandPreviewGrid'],
	
	iconCls:'ms-icon',
	editorType: 'MS',
	mode: 'nupack',
	alias: 'widget.multisubjectiveedit',
	requires: ['App.ui.SequenceThreader','App.ui.NupackMenu'],
	/**
	 * @cfg
	 * True to show the #nupackButton
	 */
	showNupackButton:true,
	/**
	 * @cfg
	 * True to show the edit button
	 */
	showEditButton:true,
	/**
	 * @cfg
	 * True to show the save button
	 */
	showSaveButton:true,
	
	dockedItems: [{
		xtype: 'cite',
		cite: {
			authors: ['John P. Sadowski', 'Peng Yin'],
			title: 'Multisubjective: better nucleic acid design through fast identification and removal of undesired secondary structure',
			publication: 'Unpublished'
		},
	}],
	
	/**
	 * @cfg
	 * Enable additional multisubjective syntax
	 */
	multisubjective: false,
	
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
			tbar: ['->',
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
					handler: App.ui.Launcher.makeLauncher('help:multisubjective'),
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
					// handler: this.doAddComplex,
					scope: this,
				},{
					text: 'Edit',
					iconCls: 'pencil',
					// handler: this.doEditComplex,
					scope: this,
				},{
					text: 'Delete',
					iconCls: 'delete',
					// handler: this.doDeleteComplex,
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


		// this.segmentStore.on('update', function(store, rec, operation, modifiedFieldNames) {
		// 	this.updateStrandSequences();
		// }, this);

		// // Highlight items in the #strandsGrid and #complexView when they're moused over in the segments grid
		// this.segmentsGrid.on('itemmouseenter', function(grid, rec, el, e) {
		// 	this.fireEvent('updateSegmentHighlight', rec.get('identity'), 1);
		// }, this);
		// this.segmentsGrid.on('itemmouseleave', function(grid, rec, el, e) {
		// 	this.fireEvent('updateSegmentHighlight', null);
		// }, this);
		// this.on('updateSegmentHighlight', this.updateSegmentHighlight, this, {
		// 	buffer: 10,
		// });

		// // Highlight items in #segmentsGrid and #complexView when they're moused over in the strands grid
		// this.on('afterrender', function() {
		// 	this.strandsGrid.getEl().on('mouseover', function(e, el) {
		// 		var identity = el.getAttribute('data-segment-identity'),
		// 			polarity = el.getAttribute('data-segment-polarity');
		// 		this.fireEvent('updateSegmentHighlight', identity, polarity);
		// 	}, this, {
		// 		delegate: 'span.sequence-segment'
		// 	});
		// }, this);


	},
	onLoad: function() {
		if(!this.data) this.data = '';
		this.loadLibrary(this.data)

	},
	loadLibrary: function(data) {
		
		var complexStore = this.complexStore,
			strandStore = this.strandStore,
			segmentStore = this.segmentStore,
			segmentColors = d3.scale.category20();
		
		var library = DNA.structureSpec(CodeMirror.tokenize(data, 'nupack'));
		


		segmentStore.colorGenerator = segmentColors;
		var segments = [], seg, seq;
		for(seg in library.domains) {
			seq = library.domains[seg];
			segments.push({
				identity: seg,
				sequence: seq,
				color: segmentColors(seg),
			});
		}
		segmentStore.add(segments);

		var complexes = [], strands = [], complex, strand, spec, struct;
		for(var strand in library.strands) {
			spec = library.strands[strand];
			struct = library.structures[struct];

			strands.push({
				name: strand,
				sequence: 'AAAAA',
				spec: spec,
				polarity: 1,
			});
			complexes.push({
				name: strand,
				polarity: 1,
				structure: struct,
				strands: [strand],
			})
		}
		strandStore.add(strands);
		complexStore.add(complexes);

	},
	runMS: function() {
		App.runTask('Multisubjective', {
			node: this.getDocumentPath(),
			action: 'default'
		});
	},
	clean: function() {
		App.runTask('Multisubjective', {
			node: this.getDocumentPath(),
			action: 'clean'
		});
	},	

})

// /**
//  * Allows editing of scripts for the Multisubjective sequence designer
//  */
// Ext.define('App.usr.ms.Editor', {
// 	extend: 'App.usr.text.Editor',
// 	iconCls:'ms-icon',
// 	editorType: 'MS',
// 	mode: 'nupack',
// 	alias: 'widget.multisubjectiveedit',
// 	requires: ['App.ui.SequenceThreader','App.ui.NupackMenu'],
// 	/**
// 	 * @cfg
// 	 * True to show the #nupackButton
// 	 */
// 	showNupackButton:true,
// 	/**
// 	 * @cfg
// 	 * True to show the edit button
// 	 */
// 	showEditButton:true,
// 	/**
// 	 * @cfg
// 	 * True to show the save button
// 	 */
// 	showSaveButton:true,
	
// 	dockedItems: [{
// 		xtype: 'cite',
// 		cite: {
// 			authors: ['John P. Sadowski', 'Peng Yin'],
// 			title: 'Multisubjective: better nucleic acid design through fast identification and removal of undesired secondary structure',
// 			publication: 'Unpublished'
// 		},
// 	}],
	
// 	/**
// 	 * @cfg
// 	 * Enable additional multisubjective syntax
// 	 */
// 	multisubjective: false,
	
// 	initComponent: function() {
// 		this.mode = {
// 				name: 'nupack',
// 				multisubjective: true,
// 			}
		
// 		this.extraTbarItems = (this.extraTbarItems || []); 
// 		var tbar = this.extraTbarItems.concat([{
// 			text: 'Run Multisubjective',
// 			iconCls: 'ms-icon',
// 			handler: this.runMS,
// 			scope: this,
// 			xtype: 'splitbutton',
// 			menu:[{
// 				text: 'Clean',
// 				iconCls: 'clean',
// 				handler: this.clean,
// 				scope:this
// 			}]

// 		}]);
// 		if(this.showNupackButton) {
// 			tbar.push({
// 				xtype: 'splitbutton',
// 				*
// 				 * @property {Ext.button.Button} nupackButton
// 				 * Shows a menu allowing the user to open NUPACK
				 
// 				ref :'nupackButton',
// 				text: 'Open NUPACK',
// 				iconCls: 'nupack-icon',
// 				handler: App.ui.Launcher.makeLauncher('nupack'),
// 				menu: Ext.create('App.ui.NupackMenu',{
// 					listeners : {
// 						'designwindow': {
// 							fn: this.populateDesignWindow,
// 							scope: this,
// 						}
// 					}
// 				}),
// 			});
// 		}
// 		if(this.showEditButton) {
// 			tbar.push({
// 				text: 'Edit',
// 				iconCls: 'pencil',
// 				/**
// 				 * @property {Ext.button.Button} editButton
// 				 * Shows a small edit menu
// 				 */
// 				ref: 'editButton',
// 				menu: [{
// 					text: 'Thread segments to sequences',
// 					handler: this.threadStrands
// 				},]
// 			})
// 		}
// 		if(this.showSaveButton) {
// 			tbar = tbar.concat(['->',Ext.create('App.ui.SaveButton',{
// 				app: this,
// 			})]);
// 		}
// 		Ext.apply(this, {
// 			tbar: tbar
// 		})
// 		this.callParent(arguments);
// 	},
// 	runMS: function() {
// 		App.runTask('Multisubjective', {
// 			node: this.getDocumentPath(),
// 			action: 'default'
// 		});
// 	},
// 	clean: function() {
// 		App.runTask('Multisubjective', {
// 			node: this.getDocumentPath(),
// 			action: 'clean'
// 		});
// 	},	populateDesignWindow: function(menu,designWindow) {
// 		designWindow.updateDesign(this.getValue());
// 	},
// 	/**
// 	 * Opens a {@link App.ui.SequenceThreader sequence threader}, allowing the 
// 	 * user to thread together sequences based on a sequence specification into
// 	 * full strands.
// 	 */
// 	threadStrands: function() {
// 		var win = Ext.create('App.ui.SequenceThreader');
// 		win.show();
// 		win.setStrands(this.getSelection());
// 	},
// })