/**
 * Model representing a Segment. To be used with App.usr.dil.SegmentStore
 */
Ext.define('App.usr.dil.Segment', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'identity'
	}, {
		name: 'sequence'
	}, {
		name: 'color',
	}],
});

/**
 * Store representing a collection of {@link App.dynamic.Segment DyNAML segments}.
 */
Ext.define('App.usr.dil.SegmentStore', {
	extend: 'Ext.data.Store',
	model: 'App.usr.dil.Segment',
	constructor: function() {
		this.callParent(arguments);
		this.on('update', function(segmentStore, rec, op, modifiedFieldNames) {
			
			// If the sequence of one segment has changed, we can just update that
			if(modifiedFieldNames.indexOf('sequence') != -1) {
				this.updateSegmentMap(rec);
			}

			// If the field names have changed, we need to rebuild the whole 
			// segment map to get rid of the entry for the old name(s)
			if(modifiedFieldNames.indexOf('identity') != -1) {
				this.updateSegmentMap();
			}

			// If the color has changed, we need to update the color map
			if(modifiedFieldNames.indexOf('color') != -1) {
				this.updateSegmentColorMap(rec);	
			}
		}, this);
		this.on('add', function(strandStore, recs, index) {
			this.updateSegmentMap(recs);
			this.updateSegmentColorMap(recs);
		}, this);
	},
	buildSegmentMap: function() {
		var segmentIds = this.getRange(),
			allSegments = [],
			segmentMap = {};

		// Build map of segment identities to sequences
		for(var i = 0; i < segmentIds.length; i++) {
			var rec = segmentIds[i],
				seg = {
					identity: rec.get('identity'),
					sequence: rec.get('sequence')
				};
			allSegments.push(seg);
			segmentMap[seg.identity] = seg.sequence;
		}
		return segmentMap;
	},
	/**
	 * Gets a hash mapping segments to their sequences. Does not include complements
	 * as a separate sequences; if you need a hash containing each segment and its 
	 * complement (e.g. a and a* instead of just a), use #getSegmentMapWithComplements.
	 * 
	 * @return {Object} 
	 * Hash mapping segments to their sequences. Example:
	 * 
	 * 		{ 'a':'AATNNNN', '5':'CAAG' }
	 * 		
	 */
	getSegmentMap: function() {
		if(this.segmentMap) {
			return this.segmentMap;
		} else {
			this.segmentMap = this.buildSegmentMap();
		}
	},
	/**
	 * Gets a hash mapping segments to their sequences. Includes complement pairs 
	 * (e.g. 1/1*, a/a*, etc.) as separate sequences. Use #getSegmentMap is you don't 
	 * want the complements.
	 * 
	 * @return {Object} 
	 * Hash mapping segments to their sequences. Example:
	 * 
	 * 		{ 'a':'AATNNNN', 'a*':'NNNNATT', '5':'CAAG', '5*':'GTTC' }
	 * 		
	 */
	getSegmentMapWithComplements: function() {
		var segmentMap = this.getSegmentMap();
		return DNA.hashComplements(segmentMap);
	},
	/**
	 * Updates the cached #segmentMap with data from the given record, so it does not
	 * need to be re-generated.
	 * @param  {App.usr.dil.Segment} rec Record representing the segment to be updated
	 */
	updateSegmentMap: function(rec) {
		if(rec && this.segmentMap) {
			if(_.isArray(rec)) {
				for(var i = 0; i < rec.length; i++) {
					this.segmentMap[rec[i].get('identity')] = rec[i].get('sequence');
				}
			} else {
				this.segmentMap[rec.get('identity')] = rec.get('sequence');
			}
		} else {
			this.segmentMap = this.buildSegmentMap();
		}
		return this.segmentMap;
	},
	buildSegmentColorMap: function() {
		var segmentIds = this.getRange(),
			segmentMap = {};

		// Build map of segment identities to sequences
		for(var i = 0; i < segmentIds.length; i++) {
			var rec = segmentIds[i];
			segmentMap[rec.get('identity')] = rec.get('color');
		}
		return segmentMap;
	},
	/**
	 * Gets a hash mapping each segment to its color.
	 * @return {Object} 
	 * Hash mapping each segment to its color. Example:
	 * 		{ 'a': '#ADADAD', 'b':'#CDCDCD' }
	 */
	getSegmentColorMap: function() {
		if(this.segmentColorMap) {
			return this.segmentColorMap;
		} else {
			this.segmentColorMap = this.buildSegmentColorMap();
		}
	},
	/**
	 * Updates the cached #segmentColorMap with data from the given record, so it does not
	 * need to be re-generated.
	 * @param  {App.usr.dil.Segment} rec Record representing the segment to be updated
	 */
	updateSegmentColorMap: function(rec) {
		if(rec && this.segmentColorMap) {
			if(_.isArray(rec)) {
				for(var i = 0; i < rec.length; i++) {
					this.segmentColorMap[rec[i].get('identity')] = rec[i].get('color');
				}
			} else {
				this.segmentColorMap[rec.get('identity')] = rec.get('color');
			}
		} else {
			this.segmentColorMap = this.buildSegmentColorMap();
		}
		return this.segmentColorMap;
	},
	/**
	 * Returns a D3 color scale describing the segments in this store
	 * @return {[type]} [description]
	 */
	getSegmentColorScale: function() {
		var me = this;
		return function segmentColorScale(_) {
			return me.segmentColorMap[_];
		};
	},
	getColorGenerator: function() {
		if(!this.segmentColors) {
			this.segmentColors = d3.scale.category20();
		}
		return this.segmentColors;
	},
	/**
	 * Gets the color associated with a particular segment identity
	 * @param  {String} identity Identity of the segment
	 * @return {String} Color of the segment
	 */
	getColor: function(identity) {
		var gen = this.getColorGenerator();
		return gen(identity);
	},

	/**
	 * Adds a new segment consisting of `N`s of the prescribed length 
	 * @param {Number} length Length of the segment
	 * @return {App.usr.dil.Segment} Record representing the new segment
	 */
	addSegment: function(length) {
		var segmentMap = this.getSegmentMap(),
			identity = _.max(_.map(_.keys(segmentMap), function(key) {
				return isNaN(+key) ? 0 : (+key);
			}));
		identity < 0 ? (identity = 1) : identity+=1;

		return this.add({
			identity: identity,
			sequence: Array(length + 1).join('N'),
			color: this.getColorGenerator()(identity),
		});
	},
});