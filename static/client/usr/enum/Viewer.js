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

	fontSize: 1,
	linkWidth: 2,
	arrowThreshold: 0.25,

	constructor : function() {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this, arguments);
		this.on('afterrender', this.loadFile, this);
		this.complexWindows = {};
		this.previewPanels = {};

		this.reactionPanel = Ext.create('App.usr.enum.ReactionViewer')
		this.reactionWindow = Ext.create('Ext.window.Window',{
			items: [ this.reactionPanel ],
			layout: 'fit',
			width: 700,
			height: 200,
			border: false, bodyBorder: false,
		});
	},
	onLoad : function() {
		this.afterrender();
		this.reactionWindow.show();
	},
	redraw: function (translate,scale) {
		

		this.callParent(arguments);
		this.node.selectAll('text.node-label').style('font-size',this.fontSize/scale+'em');
		this.link.style('stroke-width',this.linkWidth/scale);
		this.link.classed("link-reaction-noarrow", scale < this.arrowThreshold)
		// this.legendg.attr("transform","translate("+ [(-translate[0]),(-translate[1])] +") scale("+ Math.min(1/scale,10) +")");
	},
	loadData: function() {
		var data = this.data = JSON.parse(this.data);
		
		var initial_complexes = this.initial_complexes = _.reduce(data['initial_complexes'], function(memo, c) {
			memo[c.name] = true;
			return memo;
		}, {});

		var reactions = this.reactions = data['reactions'];

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
				.interpolate("bundle").tension(.6);

		function spline(e) {
			var points = e.dagre.points.slice(0);
			var source = dagre.util.intersectRect(e.source.dagre, points[0]);
			var target = dagre.util.intersectRect(e.target.dagre, points[points.length - 1]);
			points.unshift(source);
			points.push(target);

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
		var legendg = this.legendg = panel.append("g");

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
			'transient' : '#0a0',
			'complex' : 'green',
			'resting' : 'green',
			'initial' : 'green',
		};
		strokes = {
			'reaction-fast' : '#fff',
			'reaction-slow' : '#fff',
			'transient' : '#fff',
			'complex' : '#fff',
			'initial' : 'yellow',
			'resting' : 'white',
		};


		// Construct Legend
		me.legend = buildLegend(legendg,me);

		init();

		
		function radius(d) {
			return d._type == 'complex' ? d.strands.length * 50 : dr
		}
		
		
		function highlightLinks(d) {
			var color = d3.scale.category20();

			panel.selectAll("path.link-reaction").classed("link-reaction-blurred",true);
			panel.selectAll("g.node").classed("node-blurred",true)

			panel.selectAll('g.node[name="'+d.name+'"]').classed("node-blurred",false);


			// Select all paths that point out of this node
			panel.selectAll("path.link-reaction.source-" + d.name).each(function(r, i) {
				// panel.selectAll("path.link-reaction.target-" + r.target.name).classed("link-reaction-blurred",false);
				panel.selectAll('g.node[name="'+r.target.name+'"]').classed("node-blurred",false);

			}).classed("link-reaction-blurred",false).classed("link-reaction-reactant",true).style("stroke",function(d) { 
				return color(d.target.name); 
			});

			// Select all paths that point into this node
			panel.selectAll("path.link-reaction.target-" + d.name).each(function(r, i) {
				// panel.selectAll("path.link-reaction.source-" + r.source.name).classed("link-reaction-blurred",false);
				panel.selectAll('g.node[name="'+r.source.name+'"]').classed("node-blurred",false);

			}).classed("link-reaction-blurred",false).classed("link-reaction-product",true).style("stroke",function(d) { 
				return color(d.source.name); 
			});
		}

		function unhighlightLinks() {
			panel.selectAll("path.link-reaction").classed("link-reaction-blurred",false)
				.classed("link-reaction-reactant",false).classed("link-reaction-product",false).style("stroke",null);

			panel.selectAll("g.node").classed("node-blurred",false)

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
			}).attr("x1", function(d) {
				return d.source.x;
			}).attr("y1", function(d) {
				return d.source.y;
			}).attr("x2", function(d) {
				return d.target.x;
			}).attr("y2", function(d) {
				return d.target.y;
			}).style("stroke-width", function(d) {
				return d.size || 1;
			}).style("fill","none")
			.classed("link-reaction-noarrow",false);

			return linkSel;
		}

		function buildNodes (nodeg,net,me) {
			var nodeSel = nodeg.selectAll("g.node").data(net.nodes, nodeid);
			nodeSel.exit().remove();
			nodeSel.enter().append("g")
				.attr('class', 'node')
				.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			})
			.attr('name',function (d) {
				return d.name;
				// switch (d._type) {
				// 	case 'complex':
				// 		return 'complex_'+d.name;
				// 	case 'reaction':
				// 		return d.name;
				// }
			})
			.on('mouseover', highlightLinks)
			.on('mouseout', unhighlightLinks)
			.on('dblclick', function(d) {
				if (d._type == 'complex') {
					var el = d3.select(this).select('svg');
					me.renderPreview(d, el.node());
					d3.event.stopPropagation();
				} else if (d._type=='reaction') {
					me.showReaction(d);
				}
			})

			nodeSel.append('text').attr('class', 'node-label')
			.attr("dx", function(d) {
				return radius(d) + 5;
			}).attr("dy", ".35em").text(function(d) {
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
						return 'complex ' + (d.resting ? 'complex-resting' : 'complex-transient');
					case 'reaction':
						return '' + (d.fast ? 'reaction-fast' : 'reaction-slow');
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

			nodeSel.each(function(d) {
			    var bbox = this.getBBox();
			    d.bbox = bbox;
			    d.width = bbox.width + (2 * nodePadding);
			    d.height = bbox.height + (2 * nodePadding);
			  });

			return nodeSel;
		}

		function buildLegend(legendg,me) {
			var legend = legendg.selectAll('g.legend').data([{
				name : 'Resting Complex',
				type : 'resting'
			}, {
				name : 'Transient Complex',
				type : 'transient'
			}, {
				name : 'Fast (unimolecular) Reaction',
				type : 'reaction-fast'
			}, {
				name : 'Slow (bimolecular) Reaction',
				type : 'reaction-slow'
			}, {
				name : 'Initial Complex',
				type : 'initial'
			}]).enter().append('g').attr('class', 'legend').attr('transform', function(d, i) {
				return "translate(15," + (20 * i + 15) + ")"
			});

			legend.append('circle').attr('fill', function(d) {
				return fills[d.type]
			}).attr('stroke', function(d) {
				return strokes[d.type]
			}).attr('r', 8).attr('stroke-width', 2)
			
			legend.append('text').style('fill', '#111').text(function(d) {
				return d.name
			}).attr("dx", function(d) {
				return radius(d) + 5
			}).attr("dy", ".35em")

			return legend;
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
			me.link.each(function(d) {
				var points = d.dagre.points;
				if (!points.length) {
					var s = e.source.dagre;
					var t = e.target.dagre;
					points.push({
						x: Math.abs(s.x - t.x) / 2,
						y: Math.abs(s.y + t.y) / 2
					});
				}

				if (points.length === 1) {
					points.push({
						x: points[0].x,
						y: points[0].y
					});
				}
			});

			me.node.attr("transform", function(d) { 
				return 'translate('+ (d.dagre.x - d.dagre.width/2) +','+ (d.dagre.y - d.dagre.height/2) +')'; 
			});

			me.link
			// Set the id. of the SVG element to have access to it later
			    .attr('id', function(e) { return e.dagre.id; })
			    .attr("d", function(e) { return spline(e); });


			var svgBBox = panel.node().getBBox();
			panel.attr("width", svgBBox.width + 10);
			panel.attr("height", svgBBox.height + 10);
			me.rect.attr("width", svgBBox.width + 10);
			me.rect.attr("height", svgBBox.height + 10);
			
		}	
		

	},
	showReaction: function (d) {
		if(d._type=='reaction')	{
			var me = this,
				reactants = _.map(d.reactants, function(r) { return me.complexMap[r] }),
				products = _.map(d.reactants, function(r) { return me.complexMap[r] });

			this.reactionPanel.setValue(d,reactants,products)
		}
	},
	renderPreview: function(d,node) {
		var data = !!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'],
			panel = d3.select(node);

		this.previewPanels[d.name] = StrandPreview(panel).width(d.width).height(d.height)
		this.complexWindows[d.name] = this.previewPanels[d.name] (panel.data([data]));
	},
	showWindow : function(d, node) {
		if (!this.complexWindows[d.name]) {
			var strands = d['strands'];

			// this.previewPanels[d.name] = Ext.create('App.usr.nodal.StrandPreview', {
			// 	adjacencyMode : 1,
			// 	cls : 'simple-header',
			// 	title : strands.join(" + "),
			// 	autoRender : true,
			// 	value : '',
			// });
			this.previewPanels[d.name] = Ext.create('App.ui.StrandPreview', {
				cls : 'simple-header',
				title : strands.join(" + "),
				autoRender : true,
				value : '',
				adjacencyMode: 2,
			});

			this.complexWindows[d.name] = Ext.create('Ext.tip.ToolTip', {
				target : node,
				anchor : 'left',
				constrainPosition : true,
				items : [this.previewPanels[d.name]],
				layout : 'fit',
				autoHide : false,
				closable : true,
				closeAction : 'hide',
				width : 200,
				height : 200,
				draggable : true,
				title : "Complex: " + d.name,
				resizable : true,
				autoRender : true,
			});

			this.complexWindows[d.name].show();
			this.previewPanels[d.name].setTitle(strands.join(" + "))
			this.previewPanels[d.name].setValue(!!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'], strands);
		} else {
			if (this.complexWindows[d.name].isVisible()) {
				this.complexWindows[d.name].hide();
			} else {
				this.complexWindows[d.name].show();
			}
		}
	}
});

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
	border: false, bodyBorder: false,
	
	constructor : function() {
		this.reactant1 = Ext.create('App.ui.StrandPreview',{
			cls : 'simple-header',
			title : ' ',
			autoRender : true,
			value : '',
			adjacencyMode: 2,
			flex: 1,
			border: false, bodyBorder: false,
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

			reactantViews[i].setValue(structure,strands);
			reactantViews[i].setTitle(strands.join('+'));

		}
		if(reactants.length<2) { this.reactant2.hide(); this.reactant_plus.hide(); }
		else { this.reactant2.show(); this.reactant_plus.show(); }

		for(var i=0; i<Math.min(productViews.length,products.length); i++) {
			var d = reactants[i],
				structure = !!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'],
				strands = d['strands'];		

			productViews[i].setValue(structure,strands);
			productViews[i].setTitle(strands.join('+'));
		}

		if(products.length<2) { this.product2.hide(); this.product_plus.hide(); }
		else { this.product2.show(); this.product_plus.show(); }
	}
});
