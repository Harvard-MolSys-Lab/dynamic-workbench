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
