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
					strandManager: this,
					complex: this.complex,
					border: false,
					bodyBorder: false,
				},{
					region: 'east',
					xtype: 'd3panel',
					width: 200,
					border: false,
					bodyBorder: false,
					split: true,
				}]
			}]
		});	

		this.callParent(arguments);
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
		this.library || (this.library = App.dynamic.Library.dummy());
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

			return {
				name: node.getName(),
				polarity: node.getPolarity(),
				structure: node.getSegmentwiseStructure().toDotParen(),
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
	setValue: function () {
		this.nodeTypeEditor
	}
})
