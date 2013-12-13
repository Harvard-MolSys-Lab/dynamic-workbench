/**
 * Allows visualization of the results of enumeration for files in the ENJS format.
 */
Ext.define('App.usr.enum.Viewer', {
	extend : 'App.ui.D3Panel',
	requires : ['App.usr.nodal.StrandPreview'],
	mixins : {
		app : 'App.ui.Application'
	},
	editorType : 'Enumerator',
	autoRender : false,
	iconCls: 'enum-icon',
	fontSize: 1,
	linkWidth: 2,
	arrowThreshold: 0.25,
	highlightLinkWidth : 2,

	createTip: true,
	tipDelegate: 'rect',

	constructor : function() {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this, arguments);
		this.on('afterrender', this.loadFile, this);
		this.previewPanels = {};
		this.previewCharts = {};

		this.complexWindows = {};
		this.complexPanels = {};

		this.reactionPanels = {};
		this.reactionWindows = {};
		
		this.currentScale = 1;
	},
	onLoad : function() {
		this.afterrender();
		// this.reactionWindow.show();
	},
	
	initComponent: function() {
		this.viewMenu = Ext.create('App.ui.StrandPreviewViewMenu',{ view:null });
		this.viewMenu.setOptions({
			showIndexes: false,
			showBases: false,
			showBubbles: false,
			showSegments: false,
			complexViewMode: 'strand',
		})
		Ext.apply(this,{
			tbar: [{
				text: 'Show details',
				iconCls: 'window-secondary',
				handler: this.viewDetails,
				scope: this,
			},{
				text: 'Export',
				iconCls: 'document-export',
				menu: [{
					text: 'To SVG',
					iconCls: 'svg',
					handler: this.toSVG,
					scope: this,
				}]
			},this.viewMenu]
		})

		this.callParent(arguments);
		this.on('afterrender', function() {
			this.legendWindow = Ext.create('Ext.window.Window',{
				items: [Ext.create('App.usr.enum.LegendPanel')],
				layout: 'fit',
				width: 300, height: 200,
				title: 'Legend',
			});
			this.legendWindow.showAt(350,100); //.showAt(this.getEl().getX(),this.getEl().getY());

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
		this.viewMenu.updateView = Ext.bind(this.updatePreviews,this);
	
	},
	toSVG: function (btn) {
		this.svgWindow = Ext.create('App.ui.SVGEditorWindow',{
			stylesUrl: 'styles/enumerator.css',
			title: 'SVG',
		});
		this.svgWindow.show()
		this.svgWindow.setValue(this.getCanvasMarkup())
	},
	redraw: function (translate,scale) {
		var me = this;
		this.currentScale = scale;
		this.callParent(arguments);
		this.node.selectAll('text.node-label').style('font-size',this.fontSize/scale+'em');
		this.node.selectAll('rect.complex').style('stroke-width',this.linkWidth/scale);
		this.node.selectAll('rect.reaction').style('stroke-width',this.linkWidth/scale);
		
		this.link.style('stroke-width',this.linkWidth/scale);
		this.link.selectAll('link-reaction-reactant, link-reaction-product').style('stroke-width',me.highlightLinkWidth * me.linkWidth/me.currentScale)
		this.link.classed("link-reaction-noarrow", scale < this.arrowThreshold)
		// this.legendg.attr("transform","translate("+ [(-translate[0]),(-translate[1])] +") scale("+ Math.min(1/scale,10) +")");
	},
	viewDetails: function() {
		var elements = this.getSelection(), data = !!elements ? elements.data() : [];
		if(elements.length > 0) {
			for(var i = 0; i < elements.length; i++) {
				var node = elements[i], d = data[i];
				switch(d._type) {
					case 'complex':
						this.showPreviewWindow(d,node);
					case 'reaction':
						this.showReaction(d,node);
				}
			}
		}
	},
	getSelection: function() {
		var panel = this.getCanvas();
		return panel.selectAll('.enum-selected');
	},
	loadData: function() {
		var data = this.data = JSON.parse(this.data);
		
		var initial_complexes = this.initial_complexes = _.reduce(data['initial_complexes'], function(memo, c) {
			memo[c.name] = true;
			return memo;
		}, {});

		// Grab reaction data
		var reactions = this.reactions = data['reactions'];

		// Map domain names to specifications
		var domains = data['domains'], domainMap = {};
		for(var i=0; i<domains.length; i++) {
			var domain = domains[i];
			domainMap[domain.name] = {
				sequence: Array(domain.length+1).join('N'),
				name: domain.name,
			};
		}

		// Map strand names to specifications
		var strands = data['strands'], strandMap = {};
		for(var i =0; i<strands.length; i++) {
			var strand = strands[i];
			strand.domains = _.map(strand.domains, function(dom) { return domainMap[dom] });
			strand.domains = [strand.domains];
			strandMap[strand.name] = strand;
		}



		var complexes;
		if (data['transient_complexes']) {
			complexes = _.map(data['resting_complexes'], function(x) {
				x.resting = true;
				return x;
			}).concat(_.map(data['transient_complexes'], function(x) {
				x.transient = true;
				return x;
			}));
		} else {
			complexes = _.map(data['resting_complexes'], function(x) {
				x.resting = true;
				return x;
			})
		}

		// Map complexes to their containing resting state
		var restingStateMap = this.restingStateMap = {};
		if (data['resting_states']) {
			for (var i = 0; i < data['resting_states'].length; i++) {
				var resting_state = data['resting_states'][i];
				for (var j = 0; j < resting_state.complexes.length; j++) {
					restingStateMap[resting_state.complexes[j]] = resting_state.name;
				}
			}
		}

		// Build data for the complex nodes
		var complexData = this.complexData = _.map(complexes, function(x, i) {
			x._type = 'complex';
			if (!!initial_complexes[x.name]) {
				x.initial = true;
			}
			if (!!restingStateMap[x.name]) {
				x.group = restingStateMap[x.name];
			} else {
				//x.group = x.name;
				x.group = null;
			}
			x._index = i;
			x.strands = _.map(x.strands,function(strand) { return strandMap[strand]; })
			return x
		});
		var complexMap = this.complexMap = _.reduce(complexData, function(memo, x, i) {
			memo[x.name] = x;
			return memo;
		}, {});

		// Build data for the reaction noes
		var reactionData = this.reactionData = _.map(reactions, function(x, i) {
			x._type = 'reaction';
			x.name = 'reaction_' + i;
			x._index = i + complexData.length;
			x.fast = !(x.reactants.length > 1);
			x.slow = !x.fast;
			x.group = complexMap[x.reactants[0]].group;
			for(var j=0;j<x.reactants.length;j++) {
				if(complexMap[x.reactants[j]].group != x.group) {
					x.outgoing = true;
					x.group = null;
					break;
				}
			}
			if(!x.outgoing) {
				for(var j=0;j<x.products.length;j++) {
					if(complexMap[x.products[j]].group != x.group) {
						x.outgoing = true;
						x.group = null;
						break;
					}
				}
			}	
			return x
		});
	},
	buildVis : function() {
		/* ****
		 * Visualization utilities
		 */

		// var curve = d3.svg.line().interpolate("cardinal-closed").tension(.85);

		var fill = d3.scale.category20();

		function nodeid(n) {
			return n.size ? "_g_" + n.group : n.name;
		}

		function linkid(l) {
			var u = nodeid(l.source), v = nodeid(l.target);
			return u < v ? u + "|" + v : v + "|" + u;
		}
		
		var splinePathGenerator = d3.svg.line()
				.x(function(d) { return d.x; })
				.y(function(d) { return d.y; })
				.tension(.95)
				.interpolate("bundle");

		function spline(e) {
			// var points = e.dagre.points.slice(0);
			// var source = dagre.util.intersectRect(e.source.dagre, points[0]);
			// var target = dagre.util.intersectRect(e.target.dagre, points[points.length - 1]);
			// points.unshift(source);
			// points.push(target);

			var points = e.dagre.points.slice(0),
				source = e.source.dagre,
				target = e.target.dagre,
				p0 = points.length == 0 ? source :  points[0],
				p1 = points.length == 0 ? target :  points[points.length - 1];

			points.unshift(dagre.util.intersectRect(source, p0));
			points.push(dagre.util.intersectRect(target, p1));


			// points = [source,target]
			return splinePathGenerator(points);
		}

		// --------------------------------------------------------

		/* ******************************
		 * Load data, build graph data structures
		 */

		this.loadData();
		var complexes = this.complexes,
			complexData = this.complexData,
			complexMap = this.complexMap,
			reactionData = this.reactionData,
			reactions = this.reactions;

		// Collect node data
		var nodes = _.map(complexData.concat(reactionData),function(x) {
			if(!x.edges) x.edges = [];
			return x;
		});

		// Build links
		var links = _.flatten(_.map(reactions, function(reaction) {
			return _.map(reaction.reactants, function(reactant) {
				var l = {
					'source' : complexMap[reactant],
					'target' : reaction
				};
				complexMap[reactant].edges.push(l);
				reaction.edges.push(l);
				return l; 
			}).concat(_.map(reaction.products, function(product) {
				var l = {
					'source' : reaction,
					'target' : complexMap[product]
				};
				reaction.edges.push(l);
				complexMap[product].edges.push(l);
				return l;
			}))
		}), /* true to flatten only one level */true);


		/* ******************************
		 * Build resting state groups thing
		 */
		
		var data = { nodes: complexMap, links: links };		

		/* ******************************
		 * Build visualization
		 */
		
		// One-time initialization
		var panel = this.getCanvas();
		var line_stroke = '#aaa'

		panel.append("svg:defs").selectAll("marker")
			.data(["reaction-arrow"])
			.enter()
				.append("svg:marker")
					.attr("id", String)
					.attr("viewBox", "0 -5 10 10")
					.attr("refX", 0)
					.attr("refY", -1)
					.attr("markerWidth", 4)
					.attr("markerHeight", 4)
					.attr("orient", "auto")
				.append("svg:path")
					.attr("d", "M0,-5L10,0L0,5")
					.style('stroke', line_stroke)
					.style('fill', line_stroke);
			
		var linkg = this.linkg = panel.append("g");
  		var nodeg = this.nodeg = panel.append("g");
		// var legendg = this.legendg = panel.append("g");

		var dr = 50,      // default point radius
    		cr = 100, 	 // default complex point radius
    		off = 15;    // cluster hull offset
		var dist = 50,
			nodePadding = 0; //5;
		
		
		var me = this;
		
		var colors, fills, strokes;
		fills = colors = {
			'reaction' : '',
			'reaction-fast' : '#01c',
			'reaction-slow' : '#a00',
			'transient' : '#fff',
			'complex' : '#fff',
			'resting' : '#fff',
			'initial' : '#fff',
		};
		strokes = {
			'reaction-fast' : '#fff',
			'reaction-slow' : '#fff',
			'transient' : '#ddd',
			'complex' : '#ddd',
			'initial' : 'yellow',
			'resting' : '#ddd',
		};


		// Construct Legend
		// me.legend = buildLegend(legendg,me);

		init();
		me.redraw([0,0],1);

		
		function radius(d) {
			return d._type == 'complex' ? d.strands.length * 50 : dr
		}
		

		function highlightLinks(d) {
			var incoming_color = d3.scale.ordinal().range(_.reverse(colorbrewer.BuPu[4])),
				outgoing_color = d3.scale.ordinal().range(_.reverse(colorbrewer.OrRd[4]));

			// blur all complexes, links
			panel.selectAll("path.link-reaction").classed("link-reaction-blurred",true);
			panel.selectAll("g.enum-node").classed("node-blurred",true)

			// un-blur this complex
			panel.selectAll('g.enum-node[name="'+d.name+'"]').classed("node-blurred",false);


			// Select all paths that point out of this node
			panel.selectAll("path.link-reaction.source-" + d.name).each(function(r, i) {
				panel.selectAll('g.enum-node[name="'+r.target.name+'"]').classed("node-blurred",false);

			}).classed("link-reaction-blurred",false).classed("link-reaction-reactant",true).style("stroke",function(d) { 
				return outgoing_color(d.target.name); 
			})
			.style('stroke-width',me.highlightLinkWidth * me.linkWidth/me.currentScale)
			.style("stroke-dasharray", "0,1000000")
		    	.transition()
				.ease("cubic-in")
				.style("stroke-dasharray", function() { var l = 2*this.getTotalLength(); return l+','+l } );


			// Select all paths that point into this node
			panel.selectAll("path.link-reaction.target-" + d.name).each(function(r, i) {
				panel.selectAll('g.enum-node[name="'+r.source.name+'"]').classed("node-blurred",false);

			}).classed("link-reaction-blurred",false).classed("link-reaction-product",true).style("stroke",function(d) { 
				return incoming_color(d.source.name); 
			})
			.style('stroke-width',me.highlightLinkWidth * me.linkWidth/me.currentScale)
			.style("stroke-dasharray", "0,1000000")
		    	.transition()
				.ease("cubic-in")
				.style("stroke-dasharray", function() { var l = this.getTotalLength(); return l+','+l } );
		}

		function unhighlightLinks() {
			panel.selectAll("path.link-reaction").classed("link-reaction-blurred",false)
				.classed("link-reaction-reactant",false).classed("link-reaction-product",false).style("stroke",null)
				.style('stroke-width',me.linkWidth/me.currentScale);

			panel.selectAll("g.enum-node").classed("node-blurred",false)

		}

		function selectNode(d) {
			panel.selectAll(".enum-node.enum-selected").classed("enum-selected",false);
			d3.select(this).classed("enum-selected",true);
		}

		function dragNode(d) {
			d.x = d.dagre.x = d3.event.x, 
			d.y = d.dagre.y = d3.event.y;
			d3.select(this).attr("transform",'translate('+ (d.dagre.x - d.dagre.width/2) +','+ (d.dagre.y - d.dagre.height/2) +')');
			me.link.filter(function(l) { return l.source === d; }).each(updateLink).attr("d",spline)
			me.link.filter(function(l) { return l.target === d; }).each(updateLink).attr("d",spline);
		}


		function dragLink(l) {
			if(l.dagre.points.length > 0) {
				l.dagre.points[l._dragPoint].x = d3.event.x;
				l.dagre.points[l._dragPoint].y = d3.event.y;
			}
			d3.select(this).attr("d",spline(l))
		}

		function updateLink(l) {
			// var points = l.dagre.points;
			// if (!points.length) {
			// 	var s = l.source.dagre;
			// 	var t = l.target.dagre;
			// 	points.push({
			// 		x: Math.abs(s.x - t.x) / 2,
			// 		y: Math.abs(s.y + t.y) / 2
			// 	});
			// }

			// if (points.length === 1) {
			// 	points.push({
			// 		x: points[0].x,
			// 		y: points[0].y
			// 	});
			// }
		}

		function buildLinks(linkg,net,me) {
			var linkSel = linkg.selectAll("path.link-reaction").data(net.links, linkid);
			linkSel.exit().remove();
			linkSel.enter().append("path")
			.attr("class", function(d) {
				var cls = ["link-reaction"]
				cls.push("source-" + d.source.name);
				cls.push("target-" + d.target.name);
				return cls.join(' ');
			})
			.style("stroke-width", function(d) {
				return d.size || 1;
			}).style("fill","none")
			.classed("link-reaction-noarrow",false)
			.attr("pointer-events","stroke");

			linkSel.call(d3.behavior.drag()
		        .origin(function(l) { 
		        	var k = 0, // index of point with lowest distance
		        		dist = 0;
		        	for(var i=0; i<l.dagre.points.length; i++) {
		        		if(Math.sqrt( (l.dagre.points[i].x - d3.event.x)^2 + 
		        			(l.dagre.points[i].y - d3.event.y)^2 ) < dist || i == 0) {

		        			dist = Math.sqrt( (l.dagre.points[i].x - d3.event.x)^2 + (l.dagre.points[i].y - d3.event.y)^2 )
		        			k = i;
		        		}
		        	}
		        	l._dragPoint = k;
		        	return l.dagre.points[k]; 
		        })
		        .on("drag", dragLink));


			return linkSel;
		}

		function buildNodes (nodeg,net,me) {
			var nodeSel = nodeg.selectAll("g.enum-node").data(net.nodes, nodeid);
			nodeSel.exit().remove();
			nodeSel.enter().append("g")
				.attr('class', 'enum-node')
				.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			})
			.attr('name',function (d) {
				return d.name;
			})
			.on('mouseenter', highlightLinks)
			.on('mouseleave', unhighlightLinks)
			.on('dblclick', function(d) {
				if (d._type == 'complex') {
					me.showPreviewWindow(d,this);
				} else if (d._type=='reaction') {
					me.showReaction(d, this);
				}
			})
			// .on('click', selectNode)
			.on('click',function(d) {
				selectNode.call(this,d)
				if (d._type == 'complex') {
					var el = d3.select(this).select('svg');
					me.renderPreview(d, el.node());
					//d3.event.stopPropagation();
				}
			})

			nodeSel.append('text').attr('class', 'node-label')
			.attr("dx", function(d) {
				return radius(d) + 5;
			})
			.attr("dy", ".35em")
			.text(function(d) {
				if (d._type == 'complex') {
					return d.name;
				} else {
					return '';
				}
			});

			nodeSel.append('rect')
			.attr("class", function(d) {
				switch (d._type) {
					case 'complex':
						return 'complex ' + (d.resting ? 'complex-resting' : 'complex-transient') + 
							' ' + (d.initial ? 'complex-initial': '');
					case 'reaction':
						return 'reaction ' + (d.fast ? 'reaction-fast' : 'reaction-slow');
					default:
						if (d.size != 0) {
							return 'resting-state';
						}
						return '';
				}
			})
			.attr("width", radius)
			.attr("height", radius)
			.attr("rx", function(d) {
				switch (d._type) {
					case 'complex': return 10;
					default: return d.size ? d.size + dr : dr + 1;
				}
			})
			.attr("ry", function(d) {
				switch (d._type) {
					case 'complex': return 10;
					default: return d.size ? d.size + dr : dr + 1;
				}
			});

			nodeSel.append("svg")
			.attr("width", radius)
			.attr("height", radius);

			nodeSel.call(d3.behavior.drag()
		        .origin(function(d) { return d.dagre; })
		        .on("drag", dragNode));


			nodeSel.each(function(d) {
			    var bbox = this.getBBox();
			    d.bbox = bbox;
			    d.width = bbox.width + (2 * nodePadding);
			    d.height = bbox.height + (2 * nodePadding);
			  });

			return nodeSel;
		}

		function init() {

			var net = {
				links: links,
				nodes: nodes,
			};

			// Build selections for links and nodes
			me.link = buildLinks(linkg,net,me)
			me.node = buildNodes(nodeg,net,me)

			dagre.layout()
				.nodeSep(50)
				.edgeSep(10)
				.rankSep(50)
				.nodes(net.nodes)
				.edges(net.links)
				.debugLevel(1)
				.run();

			// Ensure that we have at least two points between source and target
			me.link.each(updateLink);

			me.node.attr("transform", function(d) { 
				return 'translate('+ (d.dagre.x - d.dagre.width/2) +','+ (d.dagre.y - d.dagre.height/2) +')'; 
			});

			me.link
			// Set the id. of the SVG element to have access to it later
			    .attr('id', function(e) { 
			    	return e.dagre.id; 
			    })
			    .attr("d", function(l) { 
			    	return spline(l); 
			    });


			var svgBBox = panel.node().getBBox();
			panel.attr("width", svgBBox.width + 10);
			panel.attr("height", svgBBox.height + 10);
			me.rect.attr("width", svgBBox.width + 10);
			me.rect.attr("height", svgBBox.height + 10);
		}	
	},
	
	updateTipBody: function(tip) {
		var helpText = '(click to show/select | double-click to open window | drag to move)';
		var targetEl = Ext.get(tip.triggerElement).up('g');
		if(targetEl) { 
			targetEl = d3.select(targetEl.dom);
			if(targetEl.classed('enum-node')) {
				var data = targetEl.datum()
				tip.update(this.getNodeDetails(data)+
					'<br />'+helpText);
			} else {
				return false;
			}
		}
	},
	getReactionDetails: function(data,breakLines) {
		breakLines =  breakLines || false;

		var out = [];
		var arity;
		var type;
		switch(data.reactants.length) {
			case 1: arity = 'Unimolecular'; break;
			case 2: arity = 'Bimolecular'; break;
			case 3: arity = 'Trimolecular'; break;
			default: arity = 'High order'; break;
		}
		if(data.reactants.length > data.products.length) {
			type = 'Association';
		}
		else if(data.reactants.length < data.products.length) {
			type = 'Dissociation';
		}
		else {
			type = 'Rearrangement';
		}
		out.push('<b>'+arity+' '+type+'</b> Reaction ');
		out.push(
			'<span class="enum-reaction-well">'+
			_.map(data.reactants,function(r) { return '<b>'+r+'</b>' }).join(' + ') +
			' &rarr; ' +
			_.map(data.products,function(r) { return '<b>'+r+'</b>' }).join(' + ')+
			'</span>'
		)
		
		if(data.fast) { out.push(' (<b>Fast</b>)'); }
		if(data.slow) { out.push(' (<b>Slow</b>)'); }

		if(breakLines) return out.join('<br />')
		else return out.join('')
	},
	getComplexDetails: function (data) {
		var out = '';
		out += 'Complex <b>'+data.name+'</b><br />';
		out += '<span class="enum-strands-well">'+_.map(data.strands,function(s) {return '<b>'+s.name+'</b>';}).join(' + ')+'</span><br />'
		if(data.initial) { out+='<b>Initial Complex</b><br />'; }
		if(data.resting) { out+='<b>Resting State</b><br />'; }
		if(data['transient']) { out+='<b>Transient</b><br />'; }
		return out;
	},
	getNodeDetails: function (data) {
		// var out = '<b>'+this.sequenceRenderer(data.base)+'</b> | <b>'+data.strand+'</b> / <b>'+data.segment+'</b> / '+data.segment_index+'<br />';
		// if(data.immutable) { out+='<b>Immutable</b><br />'; }
		// if(data.prevented) { out+='<b>Prevented</b> ('+this.sequenceRenderer(data.prevented)+')<br />'; }
		// if(data.changed) { out+='<b>Changed</b> ('+data.changed.reason+')'; }
		var out = '';
		switch(data._type) {
			case 'complex':
				out = this.getComplexDetails(data);
				break;
			case 'reaction':
				out = this.getReactionDetails(data,true)
				break;
		}
		return out;
	},
	renderPreview: function(d,node) {
		var structure = !!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'],
			strands = d['strands'] || null,
			panel = d3.select(node),
			data = { dotParen: structure, strands: strands },
			options = this.viewMenu.getOptions();

		if(!this.previewCharts[d.name]) {
			this.previewCharts[d.name] = StrandPreview(panel).width(d.width).height(d.height)
				.segmentColors(this.getSegmentColorScale())
				.strandColors(this.getStrandColorScale())
				.options(options);
			this.previewPanels[d.name] = this.previewCharts[d.name] (panel.data([data]));
			this.previewPanels[d.name]._node = panel;
			this.previewPanels[d.name]._data = data;
		}
	},
	updatePreviews: function(options) {
		var data, panel, charts = _.clone(this.previewCharts);
		for(var name in charts) {
			panel = this.previewPanels[name]._node;
			data = this.previewPanels[name]._data;
			panel.selectAll('g').remove();
			this.previewCharts[name] = this.previewCharts[name].options(options);
			this.previewPanels[name] = this.previewCharts[name] (panel.data([data]))
			this.previewPanels[name]._node = panel;
			this.previewPanels[name]._data = data;
		}
	},
	getViewOptions: function() {
		var options = this.viewMenu.getOptions();
		options.complexViewMode = this.viewMenu.getComplexViewMode();
		return options;
	},
	showPreviewWindow: function(d,node) {
		function names(strands) {
			return _.map(strands,function(s) { return s.name }).join(" + ");
		}

		var structure = !!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'],
			strands = d['strands'] || null,
			data = { dotParen: structure, strands: strands },
			options = this.getViewOptions();


		if (!this.complexWindows[d.name]) {
			var strands = d['strands'];
			this.complexPanels[d.name] = Ext.create('App.ui.StrandPreview', {
				cls : 'simple-header',
				title : names(strands),
				autoRender : true,
				value : '',
				adjacencyMode: 2,
				region: 'center',
				border: true,
				viewOptions: options,
				segmentColors: this.getSegmentColorScale(),
				strandColors: this.getStrandColorScale(),
			});
			this.complexWindows[d.name] = Ext.create('Ext.window.Window', {
				// target : node,
				// anchor : 'left',
				// constrainPosition : true,
				items : [this.complexPanels[d.name],{
					html: this.getNodeDetails(d),
					frame: true,
					region: 'east',
					split: true,
					width: 100,
				}],
				layout : 'border',
				autoHide : false,
				closable : true,
				closeAction : 'hide',
				width : 300,
				height : 200,
				draggable : true,
				title : "Complex: " + d.name,
				resizable : true,
				autoRender : true,
				border: false, bodyBorder: false
			});
			this.complexWindows[d.name].show();
			this.complexPanels[d.name].setTitle(names(strands))
			this.complexPanels[d.name].setValue(data);
			// this.complexPanels[d.name].setValue(!!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'], strands);
		} else {
			if (this.complexWindows[d.name].isVisible()) {
				this.complexWindows[d.name].hide();
			} else {
				this.complexWindows[d.name].show();
			}
		}
	},
	showReaction: function (d, node) {
		if(d._type=='reaction')	{
			
			var me = this,
				reactants = _.map(d.reactants, function(r) { return me.complexMap[r] }),
				products = _.map(d.products, function(r) { return me.complexMap[r] }),
				name = d.name,
				options = this.getViewOptions();

			if(!this.reactionPanels[d.name]) {
				this.reactionPanels[d.name] = Ext.create('App.usr.enum.ReactionViewer', { 
					viewOptions: options,
					segmentColors: this.getSegmentColorScale(),
					strandColors: this.getStrandColorScale(),
				})
				this.reactionWindows[d.name] = Ext.create('Ext.window.Window',{
					items: [ this.reactionPanels[d.name] ],
					layout: 'fit',
					width: 700,
					height: 200,
					closeAction: 'hide',
					border: false, bodyBorder: false,
					title: this.getReactionDetails(d),
				});
			}
			this.reactionWindows[d.name].show()
			this.reactionPanels[d.name].setValue(d,reactants,products)
			this.reactionPanels[d.name].setTitle(this.getReactionDetails(d));
		}
	},
	getSegmentColorScale: function() {
		if(!this.segmentColors) {
			this.segmentColors = StrandPreview.defaultSegmentColors();
		}
		return this.segmentColors;
	},
	getStrandColorScale: function() {
		if(!this.strandColors) {
			this.strandColors = StrandPreview.defaultStrandColors(); //d3.scale.ordinal().range(colorbrewer.Set3[12]); //d3.scale.category20b();
		}
		return this.strandColors;	
	},
});

Ext.define('App.usr.enum.LegendPanel',{
	extend: 'App.ui.D3Panel',
	autoRender: true,
	border: false, bodyBorder: false,
	pan: false, zoom: false,
	buildVis: function() {
		function buildLegend(legendg,me) {
			var radius = 8,
			legend = legendg.selectAll('g.legend').data([{
				name : 'Resting Complex',
				type : 'complex complex-resting'
			}, {
				name : 'Transient Complex',
				type : 'complex complex-transient'
			}, {
				name : 'Fast (unimolecular) Reaction',
				type : 'reaction reaction-fast'
			}, {
				name : 'Slow (bimolecular) Reaction',
				type : 'reaction reaction-slow'
			}, {
				name : 'Initial Complex',
				type : 'complex complex-initial'
			}]).enter().append('g').attr('class', 'legend').attr('transform', function(d, i) {
				return "translate(15," + (20 * i + 15) + ")"
			});

			legend.append('circle').attr("class",function(d) { return d.type })
			// .attr('fill', function(d) {
			// 	return fills[d.type]
			// }).attr('stroke', function(d) {
			// 	return strokes[d.type]
			// })
			.attr('r', radius).attr('stroke-width', 2)
			
			legend.append('text').style('fill', '#111').text(function(d) {
				return d.name
			}).attr("dx", radius + 5).attr("dy", ".35em")

			return legend;
		}



		var panel = this.getCanvas(),
			legendg = this.legendg = panel.append("g");
			legend = this.legend = buildLegend(legendg,this);
	},
	// updateVis: function() {
	// 	this.path.attr("transform", "translate(" + (this.getWidth() / 2) + "," + (this.getHeight() / 2) + ")")
	// },


})

Ext.define('App.ui.PlusPanel', {
	extend: 'App.ui.D3Panel',
	autoRender: true,
	border: false, bodyBorder: false,
	pan: false, zoom: false,
	buildVis: function() {
		var panel = this.getCanvas(),
			c = d3.svg.symbol().type('cross');
		this.path = panel.append('path')
			.attr('d', c())
			.attr("transform", "translate(" + (this.getWidth() / 2) + "," + (this.getHeight() / 2) + ")")
	},
	updateVis: function() {
		this.path.attr("transform", "translate(" + (this.getWidth() / 2) + "," + (this.getHeight() / 2) + ")")
	},

	width: 50,
});

Ext.define('App.ui.ArrowPanel', {
	extend: 'App.ui.D3Panel',
	autoRender: true,
	border: false, bodyBorder: false,
	pan: false, zoom: false,
	buildVis: function() {
		var panel = this.getCanvas();

		panel.append("svg:defs").selectAll("marker")
			.data(["reaction-arrow-large"])
			.enter()
				.append("svg:marker")
					.attr("id", String)
					.attr("viewBox", "0 -5 10 10")
					.attr("refX", 0)
					.attr("refY", -1)
					.attr("markerWidth", 4)
					.attr("markerHeight", 4)
					.attr("orient", "auto")
				.append("svg:path")
					.attr("d", "M0,-5L10,0L0,5")
					.style('stroke', '#000')
					.style('fill', '#000');
			
		this.path = panel.append('path').attr("d","M-5,0L5,0").attr("marker-end","url(#reaction-arrow-large)")
			.style('stroke-width','2px')
			.style('stroke', '#000')
			.style('fill', '#000');
	},
	updateVis: function() {
		this.path.attr("transform", "translate(" + (this.getWidth() / 2) + "," + (this.getHeight() / 2) + ")")
	},
	width: 50,
});


Ext.define('App.usr.enum.ReactionViewer', {
	extend : 'Ext.panel.Panel',
	requires : ['App.usr.nodal.StrandPreview'],
	layout: 'hbox',
	align: 'stretch',
	border: false, bodyBorder: true,
	
	initComponent : function() {
		this.viewOptions = this.viewOptions || {};
		this.reactant1 = Ext.create('App.ui.StrandPreview',{
			cls : 'simple-header',
			title : ' ',
			autoRender : true,
			value : '',
			adjacencyMode: 2,
			flex: 1,
			border: false, bodyBorder: false,
			viewOptions: this.viewOptions,
			segmentColors: this.segmentColors,
			strandColors: this.strandColors,
		});
		this.reactant_plus = Ext.create('App.ui.PlusPanel');
		this.reactant2 = Ext.create('App.ui.StrandPreview',{
			cls : 'simple-header',
			title : ' ',
			autoRender : true,
			value : '',
			adjacencyMode: 2,
			flex: 1,
			border: false, bodyBorder: false,
			viewOptions: this.viewOptions,
			segmentColors: this.segmentColors,
			strandColors: this.strandColors,
		});

		this.reaction_arrow = Ext.create('App.ui.ArrowPanel');

		this.product1 = Ext.create('App.ui.StrandPreview',{
			cls : 'simple-header',
			title : ' ',
			autoRender : true,
			value : '',
			adjacencyMode: 2,
			flex: 1,
			border: false, bodyBorder: false,
			viewOptions: this.viewOptions,
			segmentColors: this.segmentColors,
			strandColors: this.strandColors,
		})
		this.product_plus = Ext.create('App.ui.PlusPanel');
		this.product2 = Ext.create('App.ui.StrandPreview',{
			cls : 'simple-header',
			title : ' ',
			autoRender : true,
			value : '',
			adjacencyMode: 2,
			flex: 1,
			border: false, bodyBorder: false,
			viewOptions: this.viewOptions,
			segmentColors: this.segmentColors,
			strandColors: this.strandColors,
		})

		Ext.apply(this,{
			layout: {
		    	type: 'hbox',
		    	align: 'stretch'
		    },
		    defaults: {
		    	bodyBorder: false,
		    	border: false,
		    },
			items: [
				this.reactant1,
				this.reactant_plus,
				this.reactant2,
				this.reaction_arrow,
				this.product1,
				this.product_plus,
				this.product2,
			]
		});

		this.callParent(arguments)
	},
	setValue: function(reaction,reactants,products) {
		var reactantViews = [this.reactant1,this.reactant2],
			productViews = [this.product1, this.product2];

		for(var i=0; i<Math.min(reactantViews.length,reactants.length); i++) {
			var d = reactants[i],
				structure = !!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'],
				strands = d['strands'];

			reactantViews[i].setValue({dotParen: structure,strands: strands});
			reactantViews[i].setTitle(_.map(strands,function(s) {return s.name;}).join(' + '));

		}
		if(reactants.length<2) { this.reactant2.hide(); this.reactant_plus.hide(); }
		else { this.reactant2.show(); this.reactant_plus.show(); }

		for(var i=0; i<Math.min(productViews.length,products.length); i++) {
			var d = products[i],
				structure = !!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'],
				strands = d['strands'];		

			productViews[i].setValue({dotParen: structure,strands: strands});
			productViews[i].setTitle(_.map(strands,function(s) {return s.name;}).join(' + '));
		}

		if(products.length<2) { this.product2.hide(); this.product_plus.hide(); }
		else { this.product2.show(); this.product_plus.show(); }
	},
	getSegmentColorScale: function() {
		if(!this.segmentColors) {
			this.segmentColors = d3.scale.category20();
		}
		return this.segmentColors;
	},
	getStrandColorScale: function() {
		if(!this.strandColors) {
			this.strandColors = d3.scale.category20();
		}
		return this.strandColors;	
	},
});
