/**
 * Application to show results of a NUPACK complexes and concentrations calculation.
 * Note: see the server-side nupackAnalysis section for details on the input format to this application
 * @consumes *.nupack-results
 */
Ext.define('App.ui.NupackResults', {
	extend: 'Ext.panel.Panel',
	requires: ['App.ui.nupack.Panel'],
	template: '<div class="app-nupack-complex-wrap">'+
	'<div>'+
	'<span class="app-nupack-complex">Complex: {complex}</span>'+
	'&nbsp;|&nbsp;'+
	'<span class="app-nupack-order">Order: {order}</span>'+
	'</div>'+
	'<div class="app-nupack-force"></div>'+
	'</div>',
	mixins: {
		app: 'App.ui.Application',
	},
	html: '<fieldset class="x-fieldset x-fieldset-default"><legend class="x-fieldset-header x-fieldset-header-default nupack-strand-summary-title">Distinct strands</legend><pre class="nupack-strand-summary cm-s-default"></pre></fieldset>'+
	'<fieldset class="x-fieldset x-fieldset-default"><legend class="x-fieldset-header x-fieldset-header-default nupack-strand-summary-title">Complex Minimum Free Energy</legend><div class="nupack-mfe-summary"></div></fieldset>'+
	'<div class="nupack-concentration-summary"></div>',
	bodyPadding: 5,
	autoScroll: true,
	requires: [''],
	constructor: function(config) {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this,arguments);
	},
	initComponent: function() {
		this.callParent(arguments);
		this.on('afterrender',this.loadFile,this);
	},
	onLoad: function() {
		if(this.data) {
			if(!this.xt) {
				this.xt = new Ext.XTemplate(this.template);
			}

			this.sourceData = Ext.decode(this.data);

			// determine the highest concentration in the ensemble; scale against that
			// TODO: replace this with the sum of the starting concentrations
			var maxConcentration = _.reduce(this.sourceData.ocx_mfe, function(memo,complexData) {
				var x = Math.abs(parseFloat(complexData.concentration)*1000); //.toFixed());
				if(x > memo) {
					memo = x;
				}
				return memo;
			}, 0);
			// determine the highest-order complex in the ensemble
			var maxComplexSize = _.max(_.map(this.sourceData.ocx_mfe, function(a) {
				return a.strands.length;
			})),
			// sort the source data blobs by concentration (descending)
			sorted = _.sortBy(this.sourceData.ocx_mfe, function(a) {
				return -(parseFloat(a.concentration))*1000;
			}),
			// find the highest energy in this ensemble
			maxMfe = _.max(_.map(this.sourceData.ocx_mfe, function(a) {
				return Math.abs(parseFloat(a.energy));
			}));
			// print a list of the strands and strand indexes
			var strandSummary = this.getEl().down('.nupack-strand-summary'),
			// generate whole number indicies
			strandNames = this.sourceData.strandNames ? this.sourceData.strandNames : _.range(1,this.sourceData.strands.length+1);
			// syntax highlighting
			CodeMirror.runMode(_.map(_.zip(strandNames,this.sourceData.strands), function(x) {
				return x.join(' : ');
			}).join('\n'),'sequence',strandSummary.dom);
			this.getEl().down('.nupack-strand-summary-title').update(this.sourceData.strands.length+' distinct strands')

			// MFE bar graph
			var w = 600,
			h = 10*sorted.length,
			xScale = pv.Scale.linear(0, maxMfe).nice().range(0, w),
			yScale = pv.Scale.ordinal(pv.range(0,sorted.length)).splitBanded(0, h, 4/5),
			mfe = new pv.Panel()
			.canvas(this.getEl().down('.nupack-mfe-summary').dom)
			.width(w)
			.height(h)
			.top(10)
			.bottom(20)
			.left(50)
			.right(10);

			var bar = mfe.add(pv.Bar)
			.data(sorted)
			.top( function() {
				return yScale(this.index)
			})
			.height(yScale.range().band)
			.left(0)
			.width( function(d) {
				return xScale(Math.abs(parseFloat(d.energy)))
			});
			/* The value label. */
			bar.anchor("right").add(pv.Label)
			.textStyle("white")
			.text( function(d) {
				return d.energy
			});
			/* The variable label. */
			bar.anchor("left").add(pv.Label)
			.textMargin(5)
			.textAlign("right")
			.text( function(d) {
				return d.strandNames.join('+')
			});
			/* X-axis ticks. */
			mfe.add(pv.Rule)
			.data(xScale.ticks(5))
			.left(xScale)
			.strokeStyle( function(d) {
				return d ? "rgba(255,255,255,.3)" : "#000"
			} )
			.add(pv.Rule)
			.bottom(0)
			.height(5)
			.strokeStyle("#000")
			.anchor("bottom").add(pv.Label)
			.text(xScale.tickFormat);

			mfe.render();
			
			// this.suspendLayout = true;
			
			// render each complex block
			var items = _.map(sorted, Ext.bind( function(complexData) {
				//return {
				return Ext.create('App.ui.nupack.Panel', {
					xtype: 'resultspanel',
					complexData: complexData,
					maxConcentration: maxConcentration, 
					renderTo: this.body,
				});
				//};
			},this));
			
			
			
			// var resultsContainer = Ext.create('Ext.panel.Panel',{
				// items: items,
				// renderTo: this.body,
			// });
// 			
			// this.suspendLayout = false;
			// this.doLayout();
		}
	},
},function() {
	// Ext.Loader sucks
	
});