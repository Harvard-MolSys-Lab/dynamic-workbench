Ext.define('Strand', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'id',
		type: 'int'
	}, {
		name: 'name'
	}, {
		name: 'polarity',
		type: 'int'
	}, {
		name: 'sequence'
	}, {
		name: 'domains'
	}, {
		name: 'spec'
	}, ],
	idgen: 'sequential',
	set: function(fieldName,newValue) {
		if(fieldName == 'spec') {
			if(newValue!=this.get('spec')) {
				this.updateCachedSpec(newValue);	
			}
		}
		this.callParent(arguments);
		
	},
	getDynaml: function(lib) {
		return lib.getStrand(this.get('name'));
	},
	diffSpec: function(spec) {
		var oldSpec = spec,
			newSpec = this.parsedSpec;
		var oldSegments = _.comprehend(oldSpec,function(dom) { return dom.segments; }),
			newSegments = _.comprehend(newSpec,function(dom) { return dom.segments; });
		var removed = _.difference(oldSegments,newSegments),
			added = _.difference(newSegments,oldSegments);
		var removedIndices = _.map(removed,function(seg) { return oldSegments.indexOf(seg)}),
			addedIndices = _.map(added,function(seg) { return newSegments.indexOf(seg)});			
		return {
			removed: removed,
			added: added,
			removedIndices: removedIndices, 
			addedIndices: addedIndices,
		}
	},
	updateCachedSpec: function(newValue,oldValue) {
		// if(newValue && oldValue) {
		// 	var oldSpec = this.parsedSpec,
		// 		newSpec = App.dynamic.Compiler.parseDomainString(newValue);
		// 	var oldSegments = _.comprehend(oldSpec,function(dom) { return dom.segments; }),
		// 		newSegments = _.comprehend(newSpec,function(dom) { return dom.segments; });
		// 	var removed = _.difference(oldSegments,newSegments),
		// 		added = _.difference(newSegments,oldSegments);
		// 	var removedIndices = _.map(removed,function(seg) { return oldSegments.indexOf(seg)}),
		// 		addedIndices = _.map(added,function(seg) { return newSegments.indexOf(seg)});			

		// 	this.parsedSpec = App.dynamic.Compiler.parseDomainString(newValue, /*parseIdentifier*/ true);
		//} else 
		if(newValue) {
			this.parsedSpec = App.dynamic.Compiler.parseDomainOrSegmentString(newValue, /*parseIdentifier*/ true);
		} else {
			this.parsedSpec = App.dynamic.Compiler.parseDomainOrSegmentString(this.get('spec'), /*parseIdentifier*/ true);
		}
	},
	getParsedSpec: function() {
		if(!this.parsedSpec) {
			this.updateCachedSpec();
		}
		return this.parsedSpec;
	},
	getFlatSpec: function() {
		return _.comprehend(this.getParsedSpec(), function(dom) {
			return dom.segments
		});
	},
	proxy: 'memory',
})

Ext.define('Domain', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'name'
	}, ],
	// getDynaml: function(lib) {
	// return this.getStrand().getDynaml(lib).getDomain(this.get('name'));
	// }
})



Ext.define('App.usr.dil.StrandStore', {
	extend: 'Ext.data.Store',
	model: 'Strand',
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