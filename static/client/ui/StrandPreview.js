/**
 * Allows visualization of secondary structures
 */
Ext.define('App.ui.StrandPreview', {
	extend : 'App.ui.D3Panel',

	alias : 'widget.strandpreview',
	requires : ['App.ui.StrandPreviewViewMenu','App.ui.SVGEditorWindow'],

	autoRender : true,
	data : '',
	fade_in_duration: 1000,
	bodyStyle: 'background-color: white',
	persistenceLength: 1,//2,
	adjacencyMode : 2,

	nodeFillMode: 'segment', // 'identity', 'segment', 'domain'
	nodeStrokeMode: 'segment', // 'identity', 'segment', 'domain'
	lineStrokeMode: 'default',
	textFillMode: 'default',
	showBubbles: true,
	loopMode: 'linear',
	
	showBases : true,
	showIndexes : true,
	showSegments : true,
	showStrands : true,

	colorSegmentLabels : true,
	colorStrandLabels : true,

	
	segmentColors : null,
	strandColors : null,
	showToolbar: true,
	simpleToolbar: true,
	createTip: false,
	tipDelegate: 'circle',

	/**
	 * @cfg {Object} viewOptions
	 */


	setValue : function(structure, strands, sequences) {
		if(structure && structure.structure && structure.strands) {
			this.data = structure;
			this.strands = structure.strands;
			this.structure = structure.structure;
			if(structure.strands) {
				this.strands = structure.strands;
			}
		} else if(arguments.length==1) {
			this.data = structure;
		} else {
			this.data = structure; 
			if(this.data) { 
				if(strands) this.data.strands = strands;
				if(sequences) this.data.sequences = sequences
			} 

			this.structure = structure; 
			this.strands = strands;
			this.sequences = sequences;
		}
		this.buildVis();
	},
	buildVis : function() {
		var panel = this.getCanvas();
		panel.selectAll('g').remove();
		this.chart = StrandPreview(panel).width(this.getWidth()).height(this.getHeight())
			.options(this);
			// .showBubbles(this.showBubbles)
			// .showBases(this.showBases)
			// .showIndexes(this.showIndexes)
			// .showSegments(this.showSegments)
			// .showStrands(this.showStrands)
			// .loopMode(this.loopMode)
			// .nodeStrokeMode(this.nodeStrokeMode)
			// .nodeFillMode(this.nodeFillMode)
			// .lineStrokeMode(this.lineStrokeMode)
			// .textFillMode(this.textFillMode);
		if(!!this.segmentColors) this.chart.segmentColors(this.segmentColors)
		if(!!this.strandColors) this.chart.strandColors(this.strandColors)
		this.preview = this.chart(panel.data([this.data]));
	},
	updateChartProperties: function() {
		if(this.rendered)
			this.buildVis();
	},
	highlight: function(criteria) {
		this.preview.highlight(criteria);
	},
	unhighlight: function(criteria) {
		this.preview.unhighlight(criteria);
	},
	initComponent : function() {
		if(this.showToolbar) {
			this.viewMenu = Ext.create('App.ui.StrandPreviewViewMenu',{view: this});
			this.bbar = {
				cls: this.simpleToolbar ? 'simple-toolbar' : '', 
				items:[{
					iconCls:'dot-paren-icon',
					handler: this.toDotParen,
					scope: this,
					tooltip: 'Show structure in dot-parenthesis notation'
				},{
					iconCls:'du-plus-icon',
					handler: this.toDUPlus,
					scope: this,
					tooltip: 'Show structure in DU-plus (Zadeh) notation'
				},{
					iconCls: 'svg',
					handler: this.toSVG,
					scope: this,
					tooltip: 'Show SVG code for structure'
				},'->',
				// {
				// 	text: 'Interactive',
				// 	enableToggle: true,
				// 	toggleHandler: this.toggleForce,
				// 	scope: this,
				// },
				this.viewMenu]
			};
		}
		this.callParent(arguments);

		this.on('afterrender', function() {
			if(this.viewOptions)
				this.viewMenu.setOptions(this.viewOptions)

			if(this.createTip) { 
				this.tip = Ext.create('Ext.tip.ToolTip', {
					target: this.getEl(),
					delegate: this.tipDelegate,
					trackMouse: true,
					showDelay: false,
					renderTo: Ext.getBody(),
					listeners: {
						// Change content dynamically depending on which element triggered the show.
						beforeshow: {
							fn: this.updateTipBody,
							scope: this
						}
					}
				});

				this.sequenceRenderer = CodeMirror.modeRenderer('sequence');
			}
		}, this);
		this.on('hide',this.onHide,this)

	},
	updateTipBody: function(tip) {
		var targetEl = Ext.get(tip.triggerElement).up('g');
		if(targetEl) { 
			targetEl = d3.select(targetEl.dom);
			var data = targetEl.datum()
			tip.update(this.getTipBody(data));
		}
	},
	getTipBody: function (data) {
		var out = '<b>'+this.sequenceRenderer(data.base)+'</b> | <b>'+data.strand+'</b> / <b>'+data.segment+'</b> / '+data.segment_index+'<br />';
		if(data.immutable) { out+='<b>Immutable</b><br />'; }
		if(data.prevented) { 
			out+=_.map(data.prevented,function(p) {
				return '<b>Prevented</b> '+this.sequenceRenderer(p.seq)+' ('+p.index+'/'+p.length+') <br />';
			},this).join('')
			
		}
		if(data.changed) { out+='<b>Changed</b> ('+data.changed.reason+')'; }
		return out;
	},
	toggleForce: function() {
		if(!this.forceEnabled) {
			this.forceEnabled = true;
			this.preview.start();
		} else {
			this.forceEnabled = false;
			this.preview.stop();
		}
	},
	showWindow: function(title,data,button,iconCls) {
		if(!this.textWindow) {
			this.textWindowBox = Ext.create('App.ui.CodeMirror',{});
			this.textWindow = Ext.create('Ext.window.Window',{
				layout: 'fit',
				items: [this.textWindowBox],
				title: title,
				closeAction: 'hide',
				width: 300,
				height:200,
				bodyBorder: false,
				border: false,
				plain: true,
				headerPosition: 'left', 
				iconCls: iconCls,
			});
		}
		this.textWindow.show();
		if(button) {
			this.textWindow.alignTo(button);
		}
		this.textWindow.setTitle(title);
		this.textWindowBox.setValue(data);
		if(iconCls)
			this.textWindowBox.setIconCls(iconCls)
	},
	/**
	 * Returns the structure currently displayed in this window, in dot-parenthesis notation
	 */
	getStructure: function () {
		return _.isString(this.data) ? this.data : this.data.dotParen || this.data.structure || null;
	},
	toDotParen: function(btn) {
		var value = this.getStructure();
		this.showWindow('Dot-Parentheses',value,btn,'dot-paren-icon');
	},
	toDUPlus: function(btn) {
		var value = DNA.dotParenToDU(this.getStructure());
		this.showWindow('DU+',value,btn,'du-plus-icon');
	},
	toSVG: function (btn) {
		if(!this.svgWindow)
			this.svgWindow = Ext.create('App.ui.SVGEditorWindow',{
				stylesUrl: 'styles/strand-preview.css',
				title: 'SVG',
				iconCls: 'svg',
				suggestedFileName: this.getSuggestedFilename(),
				closeAction: 'hide',
			});

		this.svgWindow.show()
		this.svgWindow.setValue(this.getCanvasMarkup())
		this.svgWindow.alignTo(btn)
	},
	getSuggestedFilename: function () {
		var title = this.title
		return title ? title.replace(/\s/g,'') : ''	
	},
	// toSVG: function(btn) {
	// 	if(!this.svgStyles) {
	// 		Ext.Ajax.request({
	// 		    url: 'styles/strand-preview.css',
	// 		    success: function(response){
	// 		        this.svgStyles = response.responseText;
	// 		        this.doDisplaySVGWindow()
	// 		    },
	// 		    scope: this,
	// 		});
	// 	} else {
	// 		this.doDisplaySVGWindow();
	// 	}
	// },
	// doDisplaySVGWindow: function() {
	// 	var value = '<?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'+this.getCanvasMarkup();

	// 	// Sorry Cthulhu... http://www.codinghorror.com/blog/2009/11/parsing-html-the-cthulhu-way.html
	// 	value = value.replace(/<svg(\b[^>]*)>/g,'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" $1><style type="text/css"><![CDATA[' + this.svgStyles + ']]></style>');

	// 	this.svgWindow = Ext.create('App.ui.StrandPreviewTextWindow',{
	// 		title: 'SVG',
	// 	});
	// 	this.svgWindow.show();
	// 	this.svgWindow.setValue(value);
	// 	//this.showWindow('SVG',value,btn);
	// },
	onHide: function () {
		if(this.textWindow) this.textWindow.close()
		if(this.svgWindow) this.svgWindow.close()
	},
	destroy: function() {
		if(this.textWindow) this.textWindow.destroy()
		if(this.svgWindow) this.svgWindow.destroy()
		this.callParent(arguments)
	}
});

Ext.define('App.ui.StrandPreviewTextWindow',{
	extend: 'Ext.window.Window',
	layout: 'fit',
	closeAction: 'hide',
	width: 300,
	height:200,
	bodyBorder: false,
	border: false,
	plain: true,
	headerPosition: 'left', 
	initComponent: function () {
		this.editor = Ext.create('App.usr.text.Editor');
		Ext.apply(this,{
			items: [this.editor]
		});
		this.callParent(arguments);

		if(this.value) { this.setValue(this.value); }
	},
	setValue: function() {
		return this.editor.setValue.apply(this.editor,arguments);
	},
	getValue: function() {
		return this.editor.getValue.apply(this.editor,arguments);
	},
});


