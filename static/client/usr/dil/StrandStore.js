
Ext.define('Domain', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'name'
	}, ],
	// getDynaml: function(lib) {
	// return this.getStrand().getDynaml(lib).getDomain(this.get('name'));
	// }
})


/**
 * Store representing a collection of {@link App.dynamic.Strand DyNAML strands}.
 */
Ext.define('App.usr.dil.StrandStore', {
	extend: 'Ext.data.Store',
	model: 'App.usr.dil.Strand',
	requres: ['App.usr.dil.Strand'],
	constructor: function() {
		this.callParent(arguments);
		if(this.segmentStore) {
			this.segmentStore.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
				if(modifiedFieldNames.indexOf('sequence') != -1) {
					this.updateStrandSequences();
				}
			}, this);
		}
		this.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
				if(modifiedFieldNames.indexOf('spec') != -1) {
					this.updateStrandSequence(rec);
				}
		},this)
	},
	updateStrandSequence: function updateStrandSequence (rec) {
		var segmentMap = this.segmentStore.getSegmentMap(),
		strand = rec,
		strandSpec = rec.getFlatSpec();
		strand.set('sequence',DNA.threadSegments(segmentMap,strandSpec));
	},
	updateStrandSequences: function() {
		var segmentMap = this.segmentStore.getSegmentMap(),
			strands = this.getRange();

		for(var i = 0; i < strands.length; i++) {
			var strand = strands[i],
				strandSpec = strand.getFlatSpec();
			strand.set('sequence', DNA.threadSegments(segmentMap, strandSpec));
		}
	},
	getSegmentMap: function() {
		return this.segmentStore.getSegmentMap();
	},
	getSegmentMapWithComplements: function() {
		return this.segmentStore.getSegmentMapWithComplements();
	},
	addStrand: function() {
		var name = _.max(_.map(this.getRange(), function(rec) {
			var k = rec.get('name').match(/\d+/g);

			return (!!k && k.length > 0 && !isNaN(k[0])) ? k : 0;
		}));
		name < 0 ? (name = 0) : name;
		var existing;
		do {
			name+=1;
			existing = this.find('name',name);	
		} while (existing != -1)

		return this.add({
			name: 'n'+name,
			spec: '',
		});
	},
})