/**
 * Handles synchornizing highlighting among a {@link App.usr.dil.SegmentsGrid}, {@link App.usr.dil.StrandsGrid}, and {@link App.usr.dil.StrandPreviewGrid}.
 */
Ext.define('App.usr.dil.HighlightManager',{
	mixins: {
        observable: 'Ext.util.Observable'
    },
	constructor: function(config) {
		this.mixins.observable.constructor.apply(this, arguments);
		Ext.apply(this,config);

		// Highlight items in the #strandsGrid and #complexView when they're moused over in the segments grid
		this.segmentsGrid.on('itemmouseenter', function(grid, rec, el, e) {
			this.fireEvent('updateSegmentHighlight', rec.get('identity'), 1);
		}, this);
		this.segmentsGrid.on('itemmouseleave', function(grid, rec, el, e) {
			this.fireEvent('updateSegmentHighlight', null);
		}, this);
		this.on('updateSegmentHighlight', this.updateSegmentHighlight, this, {
			buffer: 10,
		});

		
	},

	/**
	 * Highlight items in #segmentsGrid and #complexView when they're moused over in the strands grid
	 * @return {[type]} [description]
	 */
	afterrender: function() {
		this.strandsGrid.getEl().on('mouseover', function(e, el) {
			var identity = el.getAttribute('data-segment-identity'),
				polarity = el.getAttribute('data-segment-polarity');
			this.fireEvent('updateSegmentHighlight', identity, polarity);
		}, this, {
			delegate: 'span.sequence-segment'
		});
	},

	updateSegmentHighlight: function(identity, polarity) {
		if(identity) {
			this.highlightSegment(identity, polarity);
		} else {
			this.unhighlightSegment();
		}
	},
	/**
	 * Highlights the passed segment with the given polarity in the #complexView and #strandsGrid
	 * @param  {String} segment Segment identity
	 * @param  {Number} polarity Segment polarity (-1 or 1)
	 */
	highlightSegment: function(segment, polarity) {
		this.complexView.preview.fade();
		this.complexView.preview.highlight({
			'segment_identity': segment,
			'segment_polarity': polarity
		}, 'node-highlight');
		this.complexView.preview.highlight({
			'segment_identity': segment,
			'segment_polarity': -1 * polarity
		}, 'node-highlight-complement');

		this.strandsGrid.unhighlightSegment();
		this.strandsGrid.highlightSegment(segment, polarity);
	},
	/**
	 * Unhighlights the passed segment with the given polarity in the #complexView and #strandsGrid
	 * @param  {String} segment Segment identity
	 * @param  {Number} polarity Segment polarity (-1 or 1)
	 */
	unhighlightSegment: function(segment, polarity) {
		this.complexView.preview.unfade();
		this.complexView.preview.unhighlight(null, 'node-highlight');
		this.complexView.preview.unhighlight(null, 'node-highlight-complement');

		this.strandsGrid.unhighlightSegment();
	},
});