/**
 * Allows editing of Complex objects by prescribing an ordering of strands and a segment-level secondary structure.
 */
Ext.define('App.usr.dil.EditComplexPanel', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.editcomplexpanel',
	requires: ['App.usr.dil.SegmentStore','App.usr.dil.StrandStore','App.usr.dil.ComplexStore'],
	mixins: {
		tip: 'App.ui.TipHelper'
	},
	layout: 'border',
	border: false,
	bodyBorder: false,
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				xtype: 'strandpreview',
				name: 'strandPreview',
				region: 'center',
			}, {
				xtype: 'form',
				name: 'formPanel',
				region: 'west',
				width: 200,
				split: true,
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
					minHeight: 20,
					tooltip: "Enter the name(s) of your strand(s) order in which they should appear in the complex. Separate strand names with + signs." + 
					"If you do not enter a strand\'s name here, it will not appear in the complex. Strand names can be used multiple times—this will "+
					"create a complex with multiple copies of that strand. ",
					// floating: true,
					// autoRender: true,
				},
				 {
					fieldLabel: 'Strand Order',
					xtype: 'displayfield',
					name: 'segmentsField',
					cls: 'strand-glyph-well',
					minHeight: 20,
					tooltip: "Click to edit the order in which strands will appear in the complex. If you do not enter a strand\'s name here, it will not appear in the complex."
				}, {
					fieldLabel: 'Structure',
					xtype: 'textarea',
					name: 'structureField',
					validator: Ext.bind(this.validateStructure, this),
					tooltip: "Enter the structure for the complex in dot-parenthesis notation."
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

		this.mixins.tip.init.call(this,[]);
	},

	/**
	 * Loads #complexData for the record in #complex from the corresponding #strandManager
	 */
	loadData: function() {
		this.complexData = this.strandManager.getComplexData(this.complex);

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
		try { 
			this.strandPreview.setValue(this.complexData);
		} catch (e) { 
			// swallow error from invalid structure 
		}
		this.segmentsField.setValue(_.map(this.complexData.strands, function(strand) {
			return me.buildStrandGlyph(strand);
		}).join(' + ') || '(click to edit)');	
	},
	updateSegmentsView: function() {
		var me = this,
			strands = this.getStrands();

		if(strands.length > 0) {
			this.segmentsField.setValue(_.map(strands,function(name) {
				var strand = me.getStrandData(name);
				return me.buildStrandGlyph(strand,name);
			}).join(' + '));
		} else {
			this.segmentsField.setValue('(click to edit)');
		}
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
		return this.strandManager.getStrandData.apply(this.strandManager, arguments);
	},
	getComplexData: function() {
		return this.strandManager.getComplexData.apply(this.strandManager, arguments);
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