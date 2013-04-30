/**
 * Shows a grid of {@link App.dynamic.Strand DyNAML strands}. Allows editing of strand definition using DyNAML short syntax. 
 * Renders the sequence for the strands based on their segment composition.
 */
Ext.define('App.usr.dil.StrandsGrid',{
	extend: 'Ext.grid.Panel',
	alias: 'widget.strandsgrid',
	requires: ['App.usr.dil.StrandStore'],
	mixins: {
		tip: 'App.ui.TipHelper'
	},
	/**
	 * @cfg {App.usr.dil.StrandStore} store (required)
	 * Store containing Strand records
	 */	
	/**
	 * @cfg {App.usr.dil.SegmentStore} segmentStore (required)
	 * Store containing Segment records
	 */
	initComponent: function () {

		this.strandEditor = Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 1
		});
		this.strandStore = this.store;

		this.segmentsField = Ext.create('Ext.form.field.Text',{
			//xtype: 'textfield',
			tooltip: { 
				html: "Describe the segments that comprise this strand, using the DyNAML short notation. "+
				"For example, to describe a strand with two domains, an input A containing segments 1, 2, and 3, "+
				"and an output B (containing segments 4, 5, and 6), you could write: <pre>\tA[1 2 3]i B[4 5 6]o</pre> <a href=\""+App.ui.Help.getLink('dynaml#short-notation')+"\">Details</a>",
				hideDelay: 2000,
				anchor: "bottom",
				anchorToTarget: true,
			},
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
		});

		Ext.apply(this,{
			tbar: [{
				text: 'Add',
				iconCls: 'plus',
				handler: this.doAddStrand,
				scope: this,
				tooltip: "Click to add a strand. You'll also need to add a strand to a complex in order for it to appear in the design."
			},{
				text: 'Edit',
				iconCls: 'pencil',
				handler: this.doEditStrand,
				scope: this,
				tooltip: "Click to edit the definition of the selected strand."
			},{
				text: 'Delete',
				iconCls: 'delete',
				handler: this.doDeleteStrand,
				scope: this,
				tooltip: "Click to delete the selected strand(s)."
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
				field: this.segmentsField,
				renderer: function(str) {
					var spec = App.dynamic.Compiler.parseDomainOrSegmentString(str, /*parseIdentifier*/ true); // App.dynamic.Compiler.parseDomainString(str);
					return _.map(spec,function(dom) {
						return '<div class="domain-glyph domain-glyph-'+dom.role+'">' + (dom.name ? '<span class="domain-glyph-name">'+dom.name+'</span>':'')+
							_.map(dom.segments,function(seg) { 
								return '<span class="segment-glyph segment-glyph-'+seg.role+'">'+seg.identity+'</span>'+(seg.polarity==-1?'<sup>*</sup>':'') 
							}).join(' ')+
							'</div>'
					}).join(' ');
				}, // CodeMirror.modeRenderer('dil-domains', 'cm-s-default'),
				flex: 1,
			}, {
				text: 'Complex',
				dataIndex: 'complex'
			}, ],
			plugins: [this.strandEditor],
		});
		
		this.callParent(arguments);
		this.mixins.tip.init.call(this,[this.segmentsField]);
	},
	getSegmentMap: function () {
		return this.segmentStore.getSegmentMapWithComplements()
	},
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
	addStrand: function() {
		return _.first(this.strandStore.addStrand());
	},
	doAddStrand: function() {
		var rec = this.addStrand();
		this.editStrand(rec);
	},
	editStrand: function editStrand (rec) {
		rec || (rec = this.getSelectionModel().getLastSelected());
		if (rec) {
			this.strandEditor.startEdit(rec, this.headerCt.getHeaderAtIndex(2));
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
});
