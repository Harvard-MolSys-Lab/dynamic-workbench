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
	}, {
		name: 'extraData' // object
	} ],
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