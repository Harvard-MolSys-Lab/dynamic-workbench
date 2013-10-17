/**
 * Shows a grid allowing definition of a collection of Segments.
 */
Ext.define('App.usr.dil.SegmentsGrid',{
	extend: 'Ext.grid.Panel',
	alias: 'widget.segmentsgrid',
	requires: ['App.usr.dil.SegmentStore'],
	mixins: {
		tip: 'App.ui.TipHelper'
	},
	initComponent: function (argument) {
		this.segmentEditor = Ext.create('Ext.grid.plugin.CellEditing', {
			clicksToEdit: 1
		});

		/**
		 * @cfg {App.usr.dil.SegmentStore} store
		 * The store to contain this panel's strands
		 */
		this.segmentStore = this.store;

		Ext.apply(this,{
			tbar: [Ext.create('App.ui.AddDomainButton', {
				addDomain: Ext.bind(this.createSegment, this),
				extraMenuItems: [{
					text: 'Add many segments...',
					handler: this.showAddSegmentsWindow,
					scope: this,
				}]
			}),{
				text: 'Edit',
				iconCls: 'pencil',
				handler: this.editSegment,
				scope: this,
			},{
				text: 'Delete',
				iconCls: 'delete',
				handler: this.deleteSegment,
				scope: this,
			}],

			columns: [{
				dataIndex: 'color',
				field: {
					xtype: 'colorfield',
					pickerOptions: {
						colors: [
							"1F77B4", "AEC7E8", "FF7F0E", "FFBB78", "2CA02C", "98DF8A", "D62728", "FF9896", "9467BD", "C5B0D5", "8C564B", "C49C94", "E377C2", "F7B6D2", "7F7F7F", "C7C7C7", "BCBD22", "DBDB8D", "17BECF", "9EDAE5",
							"3182BD", "6BAED6", "9ECAE1", "C6DBEF", "E6550D", "FD8D3C", "FDAE6B", "FDD0A2", "31A354", "74C476", "A1D99B", "C7E9C0", "756BB1", "9E9AC8", "BCBDDC", "DADAEB", "636363", "969696", "BDBDBD", "D9D9D9",
							"393B79", "5254A3", "6B6ECF", "9C9EDE", "637939", "8CA252", "B5CF6B", "CEDB9C", "8C6D31", "BD9E39", "E7BA52", "E7CB94", "843C39", "AD494A", "D6616B", "E7969C", "7B4173", "A55194", "CE6DBD", "DE9ED6",
						]
					}
				},
				renderer: function(color) {
					return '<div style="width:12px;height:12px;background-color:'+color+';">&nbsp;</div>'
				},
				width: 40,
			},{
				text: 'Name',
				dataIndex: 'identity',
				flex: 1,
				editor: {
					xtype:'textfield',
					selectOnFocus:  true,
				}
			}, {
				text: 'Sequence',
				dataIndex: 'sequence',
				field: 'textfield',
				renderer: CodeMirror.modeRenderer('sequence'),
				flex: 5,
			}, {
				text: 'Length',
				dataIndex: 'sequence',
				renderer: function(seq) {
					return seq.length;
				},
				flex: 1,
			}],
			plugins: [this.segmentEditor],
		});

		this.callParent(arguments);
		this.mixins.tip.init.call(this,[]);
	},
	/**
	 * Shows a window for adding segments; populates #addSegmentsWindow.
	 */
	showAddSegmentsWindow: function() {
		var me = this;
		if(!this.addSegmentsWindow) {
			/**
			 * @property {App.ui.SequenceWindow} addSegmentsWindow 
			 * A window for adding many segments. Calls #updateSegments upon confirmation.
			 */
			this.addSegmentsWindow = Ext.create('App.ui.SequenceWindow',{
				handler: function(domains) {
					me.updateSegments(domains);
				},
				title: 'Add segments to system'
			});
		}
		this.addSegmentsWindow.show();
	},
	
	/**
	 * Adds a segment with the passed {@link DNA#parseIdentity identity} and sequence to the component
	 * @param {String} identity Identity of the new segment
	 * @param {String} sequence Sequence of bases
	 */
	addSegment: function(identity,sequence) {
		return this.segmentStore.addSegment(identity,sequence)
	},
	/**
	 * Adds several segments to the store.
	 * @param {Object} map 
	 * A hash mapping segment {@link DNA#parseIdentity identities} to their sequences. Example:
	 *
	 * 		{ '1':'AAATAGCG', 'd': 'TAATCG', '17': 'GATACA' }
	 * @return {App.usr.dil.Segment[]} Array of segment records
	 */
	addSegments: function(map) {
		return this.segmentStore.addSegments(map);
	},
	/**
	 * Updates several segments to the store.
	 * @param {Object} map 
	 * A hash mapping segment {@link DNA#parseIdentity identities} to their sequences new. Example:
	 *
	 * 		{ '1':'AAATAGCG', 'd': 'TAATCG', '17': 'GATACA' }
	 * 		
	 * @return {App.usr.dil.Segment[]} Array of modified segment records
	 */
	updateSegments: function(map) {
		return this.segmentStore.updateSegments(map);
	},
	/**
	 * Creates a segment of the given length, entirely of `N`'s
	 * @param  {Number} length Length of the new segment
	 * @return {App.usr.dil.Segment} Record for the new segment
	 */
	createSegment: function(length) {
		return _.first(this.segmentStore.addSegment(length));
	},
	/**
	 * Begins editing of the passed segment
	 * @param  {App.usr.dil.Segment} [rec] Record representing the record to begin editing; defaults to the last-selected record 
	 */
	editSegment: function editSegment (rec) {
		rec || (rec = this.segmentsGrid.getSelectionModel().getLastSelected());
		if (rec) {
			//this.segmentEditor.startEdit(rec, this.segmentsGrid.headerCt.getHeaderAtIndex(2));
			this.segmentEditor.startEdit(rec, this.headerCt.getHeaderAtIndex(2));
		}
	},
	/**
	 * @private
	 */
	doEditSegment: function() {
		return this.editSegment();
	},
	deleteSegment: function (rec) {
		// body...
	},
	/**
	 * @private
	 */
	doDeleteSegment: function() {
		return this.deleteSegment();
	},

})