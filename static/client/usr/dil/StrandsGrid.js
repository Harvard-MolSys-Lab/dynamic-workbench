/**
 * Shows a grid of {@link App.dynamic.Strand DyNAML strands}. Allows editing of strand definition using DyNAML short syntax. 
 * Renders the sequence for the strands based on their segment composition.
 */
Ext.define('App.usr.dil.StrandsGrid',{
	extend: 'Ext.grid.Panel',
	alias: 'widget.strandsgrid',
	requires: ['App.usr.dil.StrandStore', 'App.usr.seq.Editor'],
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

		/**
		 * @cfg {App.usr.dil.StrandStore} store
		 * The store to contain this panel's strands
		 */
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
			},'-',{
				text: 'Export',
				iconCls: 'document-export',
				tooltip: 'Generate various input and output formats, or transform the strands for output',
				menu: {
					items:[{
						text: 'To FASTA',
						iconCls: 'fasta',
						handler: function () { this.exportData('fasta'); },
						scope: this,
					},{
						text: 'To NUPACK',
						iconCls: 'nupack',
						handler: function () { this.exportData('nupack'); },
						scope: this,
					},{
						text: 'To Excel/TSV',
						iconCls: 'document-excel',
						handler: function () { this.exportData('tsv'); },
						scope: this,
					},{
						text: 'To CSV',
						iconCls: 'document-csv',
						handler: function () { this.exportData('csv'); },
						scope: this,
					},{
						text: 'To Plain text',
						iconCls: 'txt',
						handler: function () { this.exportData(''); },
						scope: this,
					}],
				}
			}],
			columns: [{
				text: 'Name',
				dataIndex: 'name',
				allowBlank: false,
				width: 90,
				editor: {
	                allowBlank: false
	            }
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
								seq = segmentMap[DNA.makeIdentifier(seg.identity, seg.polarity)] || '(?)';
							out.push('<span class="sequence-segment" data-segment-identity="' + seg.identity + '" data-segment-polarity="' + seg.polarity + '">' + renderer(seq) + '</span>');
							// pos += seq.length;
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


		this.on('afterrender', function() {
			this.tip = Ext.create('Ext.tip.ToolTip', {
				target: this.getEl(),
				delegate: 'span.sequence-base',
				trackMouse: true,
				showDelay: false,
				renderTo: Ext.getBody(),
				listeners: {
					// Change content dynamically depending on which element triggered the show.
					beforeshow: {
						fn: this.updateTipBody,
						scope: this
					}
				}
			});
		}, this);

	},
	updateTipBody: function (tip) {
		var segmentElement = Ext.get(tip.triggerElement).up('span.sequence-segment'),
			identity = segmentElement.getAttribute('data-segment-identity'),
			polarity = segmentElement.getAttribute('data-segment-polarity'),
			index = parseInt(tip.triggerElement.getAttribute('data-base-index'))+1;
		tip.update(this.getTipBody(identity,polarity,index));
	},
	getTipBody: function(identity, polarity, index) {
		return 'Segment: <b>'+DNA.makeIdentifier(identity, polarity) + '</b> / Base: ' + index
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
	/**
	 * @private
	 */
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
	/**
	 * @private
	 */
	doEditStrand: function() {
		return this.editStrand();
	},
	deleteStrand: function deleteStrand (rec) {
		// body...
	},
	/**
	 * @private
	 */
	doDeleteStrand: function() {
		return this.deleteStrand();
	},
	exportData: function(mode) {
		var sequences = this.store.getSequences(),
			data = DNA.printSequences(sequences,mode);

		this.showExportWindow(data);
	},
	showExportWindow: function(data) {
		if(!this.exportWindow) {
			this.exportView = Ext.create('App.usr.seq.Editor');
			this.exportWindow = Ext.create('Ext.window.Window',{
				title: 'Export Sequences',
				iconCls: 'export',
				items: [this.exportView],
				layout: 'fit', 
				border: false, bodyBorder: false,
				width: 500,
				height: 400,
			})
		}
		this.exportWindow.show();
		this.exportView.setValue(data);
	}
});
