/**
 * @class
 * Record defining a complex. Use with App.usr.dil.ComplexStore
 */
Ext.define('App.usr.dil.Complex', {
	extend: 'Ext.data.Model',
	requires: ['App.usr.dil.StrandStore','App.usr.dil.SegmentStore'],
	fields: [{
		name: 'id',
		type: 'int'
	}, {
		name: 'name'
	}, {
		name: 'polarity',
		type: 'int'
	}, {
		name: 'strands' // array
	}, {
		name: 'specs',
		// array
	}, {
		name: 'sequences',
		// array
	}, {
		name: 'structure'
	}, ],
	idgen: 'sequential',
	getDynaml: function(lib) {
		return lib.getNode(this.get('name'));
	},
	getStrands: function() {
		return this.get('strands');
	},
	getStructures: function() {
		var structures = this.get('structure') || '';
		return  _.map(structures.split('+'), function(s) {
			return s.trim();
		});
	},
	fixStructure: function(strandIndex,added,removed) {
		var structures = this.getStructures(),
			struct = structures[strandIndex];
		if(struct) {
			struct = struct.split('');
			for(var i=struct.length-1; i>=0; i--) {
				if(removed.indexOf(i) != -1) {
					delete struct[i];
				}
				if(added.indexOf(i) != -1) {
					struct.splice(i,0,'.');
				}
			}
			structures[strandIndex] = _.compact(struct).join('');
			this.set('structure',structures.join('+'));
		}
	},
	proxy: 'memory',
});

/**
 * Store representing a collection of {@link App.dynamic.Complex DyNAML complexes}.
 */
Ext.define('App.usr.dil.ComplexStore', {
	extend: 'Ext.data.Store',
	model: 'App.usr.dil.Complex',
	constructor: function() {
		this.callParent(arguments);
		if(this.strandStore) {
			this.strandStore.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
				if(modifiedFieldNames.indexOf('sequence') != -1 || modifiedFieldNames.indexOf('spec') != -1) {
					this.updateComplexes();
				}
			}, this);
		}
	},

	updateComplexes: function(changedStrand) {
		var strandSpecs = {},
			strandSeqs = {},
			strands = this.strandStore.getRange(),
			complexes = this.getRange();
		for(var i = 0; i < strands.length; i++) {
			var strand = strands[i],
				name = strand.get('name');
			strandSpecs[name] = strand.get('spec');
			strandSeqs[name] = strand.get('seq');
		}

		var changedStrandName = changedStrand ? changedStrand.get('name') : null;
		for(var i = 0; i < complexes.length; i++) {
			var complex = complexes[i],
				complexStrands = complex.get('strands'),
				spec = [],
				seqs = [],
				struct = null,
				diffSpec = null;
			for(var j = 0; j < complexStrands.length; j++) {
				var strandName = complexStrands[j];
				
				// if(strandName == changedStrandName) {
				// 	var oldSpec = complex.get('spec')[j];
				// 	if(!diffSpec) {
				// 		diffSpec = changedStrand.diffSpec(oldSpec);
				// 	}

				// }
				spec.push(strandSpecs[strandName]);
				seqs.push(strandSeqs[strandName]);
			}
			complex.beginEdit();
			complex.set('spec', spec);
			complex.set('seqs', seqs);
			complex.endEdit();
		}
	},

	/**
	 * Adds a new complex to this store, automatically naming it
	 * @return {App.usr.dil.Complex} The newly added complex
	 */
	addComplex: function() {
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
			strands: [],
			specs: [],
			struture: '',
		});
	},
});
