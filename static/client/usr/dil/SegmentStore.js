Ext.define('Segment', {
	extend: 'Ext.data.Model',
	fields: [{
		name: 'identity'
	}, {
		name: 'sequence'
	}, {
		name: 'color',
	}],
});

Ext.define('App.usr.dil.SegmentStore', {
	extend: 'Ext.data.Store',
	model: 'Segment',
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
	getSegmentMap: function() {
		if(this.segmentMap) {
			return this.segmentMap;
		} else {
			this.segmentMap = this.buildSegmentMap();
		}
	},
	getSegmentMapWithComplements: function() {
		var segmentMap = this.getSegmentMap();
		return DNA.hashComplements(segmentMap);
	},
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
	getSegmentColorMap: function() {
		if(this.segmentColorMap) {
			return this.segmentColorMap;
		} else {
			this.segmentColorMap = this.buildSegmentColorMap();
		}
	},
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
	getColor: function(identity) {
		var gen = this.getColorGenerator();
		return gen(identity);
	},
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