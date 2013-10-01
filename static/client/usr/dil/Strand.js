/**
 * Record representing a single strand in a DIL system; use with App.usr.dil.StrandStore
 */
Ext.define('App.usr.dil.Strand', {
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