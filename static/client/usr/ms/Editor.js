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
	
	constructor: function() {
		this.mixins.app.constructor.apply(this, arguments);
		this.editComplexWindows = {};

		this.callParent(arguments);
	},


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
				title: 'Design',
				items: [{
					xtype: 'splitbutton',
					text: 'Run',
					width: 64,
					iconCls: 'sequence-24',
					scale: 'medium',
					iconAlign: 'top',
					rowspan: 2,
					handler: this.runMS,
					scope: this,
					menu: [{
						text: 'Clean',
						iconCls: 'clean',
						handler: this.clean,
						scope: this
					}]
				},{

					/*
					 * Load:
					 * d - load dd
					 * m - load multiple dd
					 * f - fill with random bases
					 * n - load NUPACK mo file (sequences.npo)
					 * a - autofill from last web submission
					 * j - job number
					 */

					/*
					 * Iteration:
					 * o - run DD once
					 * l - run DD 10 times
					 * w - submit to NUPACK web server using spec.np
					 * r - random bases in a loop
					 * x - no designer
					 */
					text: 'Input mode',
					menu: {
						name: 'inputMenu',
						defaults: { group: 'inputMode', checked: false },
						items: [{
							text: 'Load sequences from DD file', mode: 'd'
						},{
							text: 'Load sequences from multiple DD files', mode: 'm'
						},{
							text: 'Fill with random bases', mode: 'f', checked: true,
						},{
							text: 'Load sequences from NUPACK multiobjective file (.npo)', mode: 'n'
						},{
							text: 'Autofill from last NUPACK web submission', mode: 'a'
						},{
							text: 'Load from NUPACK job number...', mode: 'j'
						}]
					}
				},{
					text: 'Iteration mode',
					menu: {
						name: 'iterationMenu',
						defaults: { group: 'iterationMode', checked: false },
						items: [
							{ text: "Run DD once", mode: 'o', checked: true },
							{ text: "Run DD 10 times", mode: 'l' },
							{ text: "Submit to NUPACK web server", mode: 'w' },
							{ text: "Make random mutations in a loop", mode: 'r' },
							{ text: "No designer (analysis only)", mode: 'x' },
						]
					}
				}]
			},{
				xtype: 'buttongroup',
				columns: 1,
				title: 'Design',
				items: [{
					text: 'Load results',
					width: 64,
					iconCls: 'sequence-24',
					scale: 'medium',
					iconAlign: 'top',
					rowspan: 2,
					handler: function() { this.openMSO() },
					scope: this,
				}]
			},'->',{
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
			items: [Ext.create('App.usr.dil.StrandsGrid',{
				// xtype: 'strandsgrid',
				name: 'strandsGrid',
				store: this.strandStore,
				segmentStore: this.segmentStore,
				region: 'south',
				collapsible: true,
				titleCollapse: true,
				title: 'Strands',
				height: 200,
				split: true,
			}), Ext.create('App.usr.dil.SegmentsGrid',{
				// xtype: 'segmentsgrid',
				name: 'segmentsGrid',
				store: this.segmentStore,
				title: 'Segments',
				titleCollapse: true,
				collapsible: true,
				region: 'east',
				width: 200,
				split: true,
			}), {
				xtype: 'panel',
				layout: 'fit',
				region: 'center',
				items: [Ext.create('App.usr.dil.StrandPreviewGrid', {
					name: 'complexView',
					store: this.complexStore,
					strandStore: this.strandStore,
					segmentStore: this.segmentStore,
					structureMode: 'base',
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


		this.iterationMenu = this.down('[name=iterationMenu]');
		this.inputMenu = this.down('[name=inputMenu]');


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
		// _.defer(_.bind(this.complexView.refresh, this.complexView));
		_.defer(_.bind(this.refresh, this));

	},
	refresh: function () {
		// this.complexView.extraData = this.extraData;
		this.complexView.refresh();
	},
	loadLibrary: function(data) {
		
		var complexStore = this.complexStore,
			strandStore = this.strandStore,
			segmentStore = this.segmentStore,
			segmentColors = d3.scale.category20();
		
		var library = DNA.structureSpec(CodeMirror.tokenize(data, {name: 'nupack', ms: true}));
		this.extraLines = library.others;

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

			strandStore.add({
				name: strand,
				sequence: 'AAAAA',
				spec: spec,
				polarity: 1,
			})

		} 

		var segmentMap = segmentStore.getSegmentMapWithComplements();
		for(var complex in library.complexes) {
			
			var items = library.complexes[complex] || ''; items = _.compact(items.join(' ').split(' ')), 
				struct = DNA.DUtoDotParen(library.structures[complex]),
				structMap = DNA.dotParenToBaseMap(struct),
				strands = [], strand = [];

			// look at the first element of this list of items; if it's a strand, assume all subsequent 
			// items are strands.
			if (library.strands[items[0]]) {
				strands = items;
			}

			// otherwise assume subsequent elements are _segments_. create strands as specified by the 
			// structure
			else {
				// iterate across each segment in the specification
				for(var i = 0, base = 0; i < items.length; i++) {

					// figure length of segment
					var segment = items[i];
					base += segmentMap[segment].length;

					// record segment in growing specification for current strand
					strand.push(segment);

					// if at a break
					if(structMap.breaks[base] || i == items.length - 1) {
						
						// add strand to list for this complex
						var strandName = complex + '_' + (strands.length + 1);
						strands.push(strandName);

						// create strand in store
						strandStore.add({
							name: strandName,
							sequence: 'AAAAA',
							spec: strand.join(' '),
							polarity: 1,
						})

						// prepare new strand
						strand = [];
					}
				}
			}

			complexes.push({
				name: complex,
				polarity: 1,
				structure: struct,
				strands: strands,
			})
		}

		//strandStore.add(strands);
		complexStore.add(complexes);

		console.log([segments,strands,complexes])

	},
	buildMS: function() {
		var segmentIds = this.segmentStore.getRange(),
			strandRecs = this.strandStore.getRange(),
			complexRecs = this.complexStore.getRange(),
			segmentMap = {},
			allSegments = [],
			strandMap = {},
			strandSegments = {},
			strands = [],
			nodes = [],
			output = [];


		output = output.concat(_.map(this.extraLines, function(line) { 
			if(line[0][1] != '#`') { 
				return _.pluck(line,1).join(' '); 
			} else { 
				return ''; 
			} 
		}));
		output.push('#`');

		// Build map of segment identities to sequences
		for(var i = 0; i < segmentIds.length; i++) {
			var rec = segmentIds[i],
				seg = {
					identity: rec.get('identity'),
					sequence: rec.get('sequence'),
					color: rec.get('color')
				};
			segmentMap[seg.identity] = seg.sequence;

			output.push('domain '+seg.identity+' = '+seg.sequence);
		}

		output.push('#`')


		// Build objects for strands
		for(var i = 0; i < strandRecs.length; i++) {
			var rec = strandRecs[i],
				strand, strandName, doms = _.clone(rec.getParsedSpec()), segments = [], segmentString = [];

			// Replace domains with corresponding segments
			for(var j = 0; j < doms.length; j++) {
				segments = segments.concat(doms[j].segments);
			}

			// Build segment string
			for(var j=0; j < segments.length; j++) {
				segmentString.push(DNA.printIdentifier(segments[j]))
			}

			strandName = rec.get('name');
			strand = {
				name: strandName,
				segments: segments,
			};
			strandMap[strandName] = strand;
			strandSegments[strandName] = segmentString.join(' ')

			output.push(strand.name+' = ' + strandSegments[strandName]);
		}

		// Build objects for complexes
		for(var i = 0; i < complexRecs.length; i++) {
			var complex = complexRecs[i],
				complexStrands = complex.getStrands(),
				complexSpec,
				node;

			node = {
				name: complex.get('name'),
				structure: complex.get('structure'),
				polarity: complex.get('polarity'),
				strands: _.map(complexStrands, function(strand) {
					return strandMap[strandName]
				})
			};

			if(this.outputStrands) {
				complexSpec = complexStrands.join(' ');
			} else {
				complexSpec = _.map(complexStrands, function(strandName) {
					return strandSegments[strandName] ? strandSegments[strandName] : '';
				}).join(' ')
			}
			output.push('structure ' + node.name + ' = ' + DNA.dotParenToDU(node.structure))
			output.push(node.name+'.seq = ' + complexSpec)
		}

		return output.join('\n')
	},

	updateFromMSO: function(data) {

		// e.g.:
		// 		"immutable":[17,308,309, ... ]
		var immutable = _.reduce(data['immutable'], function(memo, i) {
			memo[i] = true;
			return memo;
		}, {});

		// e.g.:
		// 		 "desired":[
		// 		 	{"pair":[17,71]},
		// 		 	{"pair":[18,70]},
		// 		 ...
		// 		 ]
		var desired = _.reduce(data['desired'], function(memo, p) {
			if (!memo[p.pair[1]])
				memo[p.pair[0]] = p.pair[1];
			return memo;
		}, {});

		// e.g.:
		// 	"undesired":[
		// 		{"pair":[4,15]},
		// 		{"pair":[5,14], "changed":{"5":"N"}},
		// 		{"pair":[193,211], "warning":{"type":-1, "pos":[193,211]},
		// 		...
		// 	]
		var undesired = _.reduce(data['undesired'], function(memo, p) {
			var o = _.clone(p);
			o.target = p.pair[1];
			if (!memo[p.pair[1]]) {
				memo[p.pair[0]] = o
			}
			return memo;
		}, {})

		// e.g.:
		// 		"prevented":[
		// 			{"range":[1,4], "identity":"G", "changed":{"4":"H"}},
		// 			{"range":[2,5], "identity":"A"},
		// 		]
		var prevented = _.reduce(data['prevented'], function(memo, p) {
			for(var i = p.range[0]; i < p.range[1]; i++) {
				memo[i] = p;
			}
			return memo;
		}, {});


		// e.g.:
		// 		"basecollide":[
		// 				{"warning":{"type":-5, "pos":[2,0]},
		// 				{"warning":{"type":-5, "pos":[11,4]},
		// 		]
		

		// e.g.:
		// 		"strands":[
		// 			{ "name":"A1", "length":79, "range":[1,79] },
		// 			{ "name":"A2", "length":79, "range":[80,158] },
		// 		]
		var complexes = {};

		// iterate across each "strand;" because of the perverse way 
		// multisubjective defines 'strand', this actually corresponds to each 
		// _complex_.
		for(var i=0; i<data['strands'].length; i++) {
			// i = complex index
			
			// e.g.: 
			// { "name":"A1", "length":79, "range":[1,79] } 
			var s = data['strands'][i];
			var offset = s.range[0];

			// build an object that will contain any extra links associated with this complex (`links`),
			// as well as any additional data associated with particular bases (`bases`)
			var complexData = {
				bases: {},
				links: [],
			};

			for(var j=offset, k = 0; j < s.range[1]; j++, k++) {
				// j = absolute base index
				// k = complex-wise base index


				// add extra links to represent undesired interactions
				if (undesired[j]) {
					var l = {
						source : j - offset,
						target : undesired[j].target - offset,
						type : 'undesired'
					}
					if (undesired[j].changed) {
						l.changed = undesired[j].changed;
					}
					complexData.links.push(l);
				}

				// add extra data for particular bases to indicate if they're immutable 
				// or were changed as part of a prevented sequence.
				if (immutable[j] || prevented[j]) {
					complexData.bases[k] = {}
				}
				if(immutable[j]) {
					complexData.bases[k].immutable = true;
				}
				if(prevented[j]) {
					complexData.bases[k].prevented = prevented[j].identity;
				}

			}

			// associate the complexData with this strand
			complexes[s.name] = complexData;

			var rec = this.complexStore.findRecord('name',s.name);
			if(rec) {
				rec.set('extraData',complexData);
			}

		}

		// this.extraData = strands;

		this.refresh();

	},
	loadMSO: function(text) {
		try {
			var data = JSON.parse(text);
		} catch(e) {
			App.msg('Unable to update Multisubjective view','Could not parse output from multisubjective.');
			App.log(e);
		}
		if(data) this.updateFromMSO(data);
	},
	openMSO: function (path) {
		var doc = this.document, basename = doc.getBasename(), ext = 'mso', sibling;
		path = path || basename; 
		sibling = doc.getSiblingByName(App.Path.repostfix(path,ext));
		
		if(sibling) {
			sibling.loadBody({
				success: function (responseText) {
					this.loadMSO(responseText);
				},
				failure: function (responseText) {
					App.msg('Unable to update Multisubjective view', 'Could not load multisubjective output file')
				},
				scope: this
			})
		}
	},

	runMS: function() {
		// build NUPACK file
		var ms = this.buildMS();

		// calculate running mode
		var mode = '';
		this.inputMenu.items.each(function(item) {
			if(item.checked) mode += item.mode;
		})
		this.iterationMenu.items.each(function(item) {
			if(item.checked) mode += item.mode;
		})
		console.log(ms);

		App.runTask('Multisubjective', {
			node: this.getDocumentPath(),
			text: ms,
			mode: mode,
			action: 'default'
		},function(responseText, arguments, success) {
			if(success) {
				this.openMSO()
			}
		}, this);
	},
	clean: function() {
		App.runTask('Multisubjective', {
			node: this.getDocumentPath(),
			action: 'clean'
		});
	},	

})





// for(var complex in library.complexes) {
			
		// 	strands = library.complexes[complex] || ''; strands = _.compact(strands.join(' ').split(' '));
		// 	struct = DNA.DUtoDotParen(library.structures[complex]);
		// 	var structMap = DNA.dotParenToBaseMap(struct);

		// 	// Now we have to do some stupid bullshit to turn this into the right thing, because
		// 	// the strand specification can be either a list of strands, a list of domains, or 
		// 	// _both_... so we need to look through every element and figure out whether it's actually
		// 	// a domain; if so, we need to wrap it in a strand and add that.
			
		// 	var newStrands = [], currentStrand = [], base = 0;
		// 	for(var i = 0; i < strands.length; i++) {
		// 		var item = strands[i];

		// 		// if item is a domain
		// 		if (segmentMap[item]) {
		// 			currentStrand.push(item);
		// 		}
		// 		// otherwise item is a strand
		// 		else 
		// 		{	
		// 			// make a new strand for all the preceding domains
		// 			if(currentStrand.length > 0) {
		// 				var newStrandName = complex + '_' + (newStrands.length+1)
		// 				strandStore.add({
		// 					name: newStrandName,
		// 					sequence: 'AAAA',
		// 					spec: currentStrand.join(' '),
		// 					polarity: 1
		// 				});
		// 				newStrands.push(newStrandName);
		// 				currentStrand = [];
		// 			}
		// 			newStrands.push(item);
		// 		}
		// 	}

		// 	// finish last strand
		// 	if(currentStrand.length > 0) {
		// 		if(currentStrand.length > 0) {
		// 			var newStrandName = complex + '_' + (newStrands.length+1)
		// 			strandStore.add({
		// 				name: newStrandName,
		// 				sequence: 'AAAA',
		// 				spec: currentStrand.join(' '),
		// 				polarity: 1
		// 			});
		// 			newStrands.push(newStrandName);
		// 			currentStrand = [];
		// 		}
		// 	}


		// 	complexes.push({
		// 		name: complex,
		// 		polarity: 1,
		// 		structure: struct,
		// 		strands: newStrands, //strands,
		// 	})
		// }









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