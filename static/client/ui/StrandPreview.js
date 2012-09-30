function StrandPreview() {
	/* **********************
	 * Configuration
	 */
		
		var viewSizeX = 400, viewSizeY = 400,
			fade_in_duration = 100, 
			panel_wait_duration = 1000, simultaneous_panels = 2,
			//k = Math.sqrt(nodes.length / (viewSizeX * viewSizeY));
			maxLinkDistance, strandLinkDistance, wcLinkDistance, persistenceLength = false,
			
			baseWidth = 1,
			
			nodeFillMode = 'segment', // 'identity', 'segment', 'domain'
			nodeStrokeMode = 'segment', // 'identity', 'segment', 'domain'
			lineStrokeMode = 'default', // 'segment', 'domain', 'default'
			textFillMode = 'default', // 'default', 'segment', 'domain', 'identity'
			showBubbles = true;

			line_stroke = '#aaa',
			strokes = {
				'wc': '#ccc',
				'strand' : line_stroke,
				'persistence' : '',
				'undesired' : '#a00',
			};
	
	/* **********************
	 * Utility methods
	 */	
	 
	function range(arr) {
		return _.range(arr[0], arr[1] + 1)
	}
		
	function buildNodeLayout(structure) {
		if(_.isString(structure)) {
			return DNA.generateAdjacency(structure,['A'],true,{
				persistenceLength: false,
			});
		} else if(structure.strands && structure.structure && structure.sequences) {
			return DNA.generateAdjacency3(structure.structure, structure.strands, {
				sequences: structure.sequences,
				persistenceLength: false,
			});
		} else {
			return DNA.generateAdjacency2(structure, {
				linkStrands : true,
				//persistenceLength: this.persistenceLength,
				persistenceLength: false,
			});
		}
	}
	
	function buildPointLayout(parsed_struct,viewSizeX,viewSizeY) {
		var pairs = DNA.layoutStructure(parsed_struct), layout, scale;
		
		if(pairs.length == 0) {
			return { pairs: [], zoom: 1 };
		}

		layout = DNA.arrangeLayout(pairs,{
			center: true, 
			//scale: [viewSizeX*.8,viewSizeY*.8], 
			offsets:[viewSizeX*.05,viewSizeY*.05], 
		});
		scale = DNA.getScale(layout.bounds,[viewSizeX*.8,viewSizeY*.8],/* maintainAspect */ true);
		
		return {
			pairs: layout.pairs,
			zoom: scale[0],
		};
	}
	
	function updateLinkDistances() {
		maxLinkDistance = viewSizeX / 20;
		strandLinkDistance = maxLinkDistance;
		wcLinkDistance = 1.5 * strandLinkDistance;
	}
	
	var segmentColors = d3.scale.category20(),
		baseColors = d3.scale.ordinal().domain(['A','T','C','G','N']).range(['blue','red','green','black','orange']);
			
	
	/* ******************************************
	 * Constructor
	 */	
	function chart(selection) {
		selection.each(function(data) {
			
			
			/* ******************************
			 * Parse incoming data
			 */
			var parsed_struct,			
				structure = data;			
			if(_.isString(data)) {
				parsed_struct = DNA.parseDotParen(structure);
			} else {
				if(structure.strands) {
					structure.strands = DNA.expandStrands(structure.strands);								
				}
				
				if(structure.dotParen) {								
					parsed_struct = DNA.parseDotParen(structure.dotParen);	
				} else if(structure.strands && structure.sequences) {								
					structure.dotParen = DNA.expandStructure(structure.structure, structure.strands, structure.sequences);
					parsed_struct = DNA.parseDotParen(structure.dotParen);	
				} 
			}
			
			
			/* ******************************
			 * Build nodeLayout and pointLayout
			 */
			var pointLayout, nodeLayout, nodes, links;
			
			// Build nodeLayout; this is the arrangement of nodes and links
			// which is fed to d3.
			nodeLayout = buildNodeLayout(data);
			
			// Build pointLayout; this determines the (starting) 2D positions
			// of each node. By default uses a planar graph layout
			pointLayout = buildPointLayout(parsed_struct,viewSizeX,viewSizeY);
			
			
			// Update node positions based on pointLayout
			nodes = _.map(nodeLayout.nodes, function(n, i) {
				n.x = pointLayout.pairs[i][0];
				n.y = pointLayout.pairs[i][1];
				n.theta = pointLayout.pairs[i][2];
				return n;
			});
			links = nodeLayout.links;
			
			/* *****************************
			 * Build panel
			 */
			var panel = d3.select(this)
			.attr("pointer-events", "all")
			.append('g')
				.attr('width',viewSizeX)
				.attr('height',viewSizeY)
				.call(d3.behavior.zoom().on('zoom',redraw).scale(pointLayout.zoom))
			.append('g');
			
			panel.attr("transform",
			      "translate(" + [0,0] + ")"
			      + " scale(" + pointLayout.zoom + ")");
			
			/* ******************************
			 * Build force-directed graph
			 */
			var force = d3.layout.force()
			.size([viewSizeX, viewSizeY]) //
			.charge(-45) //
			.linkDistance(function(l,i) { 
				if(l.type == 'persistence') {
					return persistenceLength * (1.2*maxLinkDistance)
				} else if(l.type == 'wc') {
					return wcLinkDistance;
				} else if(l.type == 'strand') {
					return strandLinkDistance;
				}
			}).linkStrength(function(l, i) {
				if(l.type == 'persistence') {
					return 1/persistenceLength
				} else if(l.type == 'wc') {
					return 1;
				} else if(l.type == 'strand') {
					return 0.7;
				}
			}).gravity(0.02);
			
			// Bind nodes to the force layout
			force.nodes(nodes).links(links)
			
			
			/* ******************************
			 * Build visualization
			 */
			
			panel.append("rect")
			.attr("fill","transparent")
			.attr("width",viewSizeX/pointLayout.zoom)
			.attr("height",viewSizeY/pointLayout.zoom);
			
			var nodeSel, linkSel;
			
			// Links
			linkSel = panel.selectAll("line.link").data(links);
			linkSel.exit().remove();
			var link_line = linkSel = linkSel.enter().append("line").attr("class", function(d) {
				var cls = ["link","link-"+d.type];
				cls.push("source-" + d.source.name);
				cls.push("target-" + d.target.name);
				return cls.join(' ');
			});
			link_line.style('stroke',function(d) {
				switch(lineStrokeMode) {
					case 'segment':
						return d.segment_identity ? segmentColors(d.segment_identity) : null
					case 'domain':
						return App.dynamic.Compiler.domainColors[d.domain_role] || null
					default:
						return null
				}
			})
							
			// Node Groups
			nodeSel = panel.selectAll("g.node").data(nodes);
			nodeSel.exit().remove();
			nodeSel = nodeSel.enter().append('g').attr("class", "node").call(force.drag);
	
			// Node circle
			if(showBubbles) {
				var node_circle = nodeSel.append("circle").attr("r", 0.5*baseWidth+'em').attr('stroke-width', 2);
				node_circle.style("fill", function(d) {
					switch(nodeFillMode) {
						case 'identity':
								return baseColors(d.base)
						case 'segment':
								return segmentColors(d.segment_identity)
						case 'domain':
								return App.dynamic.Compiler.domainColors[d.domain_role] || null
					}
				});
				node_circle.style("stroke", function(d) {
					switch(nodeStrokeMode) {
						case 'identity':
								return d3.rgb(baseColors(d.base)).darker().toString();
						case 'segment':
								return d3.rgb(segmentColors(d.segment_identity)).darker().toString();
						case 'domain':
								return App.dynamic.Compiler.domainColors[d.domain_role] ? 
									d3.rgb(App.dynamic.Compiler.domainColors[d.domain_role]).darker().toString() : null
					}
				});

			}
							
			// Node index
			nodeSel.append('text').attr('class', 'node_index')
			.style('text-shadow', '2px 2px 2px white')
			.attr('text-anchor','middle')
			.attr('dx', function(d) {
				return Math.cos(d.theta)+'em';
			}).attr('dy', function(d) {
				return Math.sin(d.theta)+0.35+'em';
			}).text(function(d,i) {
				return (i % 10 == 0) ? i : '';
			});
			
			// Node base
			nodeSel.append('text').attr('class', 'node_base')
			.style('font-size',baseWidth*.8+'em')
			.attr('text-anchor','middle')
			.attr('dy','.35em')
			.text(function(d) {
				return d.base || 'N'
			}).style("fill", function(d) {
				switch(textFillMode) {
					case 'identity':
							return baseColors(d.base)
					case 'segment':
							return segmentColors(d.segment_identity)
					case 'domain':
							return App.dynamic.Compiler.domainColors[d.domain_role] || null
					default:
						return null
				}
			});;
			
			// Node segment name
			nodeSel.append('text').attr('class', 'node_segment')
			//.style('fill', '#111')
			.style('text-shadow', '2px 2px 2px white')
			.attr('text-anchor','middle')
			.attr('dx', function(d) {
				return Math.cos(d.theta)*2+'em';
			}).attr('dy', function(d) {
				return Math.sin(d.theta)*2+0.35+'em';
			}).text(function(d,i) {
				return d.segment_index == 0 ? d.segment : ''
			}).attr('fill',function(d) {
				return segmentColors(d.segment_identity);
			});
			
			
			
			function redraw() {
				panel.attr("transform",
			      "translate(" + d3.event.translate + ")"
			      + " scale(" + d3.event.scale + ")");
			}
			
			function restart() {
				function doTick() {
					linkSel.attr("x1", function(d) {
						return d.source.x;
					}).attr("y1", function(d) {
						return d.source.y;
					}).attr("x2", function(d) {
						return d.target.x;
					}).attr("y2", function(d) {
						return d.target.y;
					});
		
					nodeSel.attr("transform", function(d) {
						return "translate(" + d.x + "," + d.y + ")";
					});
				}
				
				function fadeIn() {
					panel.style("opacity", 1e-6)
						.transition()
						.duration(fade_in_duration)
						.style("opacity", 1);
				}
		
				// force.start();
				// force.on("tick", doTick);

				force.start();
				doTick();
				force.stop();
				// _.delay(function() { me.force.start(); },2000);	
				
				
				fadeIn();
			}
			
			restart();
			
		});
	}
	
	/* **********************
	 * Chainable accessors
	 */
	
	chart.width = function(_) {
		if (!arguments.length) return viewSizeX;
		viewSizeX = _;
		updateLinkDistances()
		return chart;
	};

	chart.height = function(_) {
		if (!arguments.length) return viewSizeY;
		viewSizeY = _;
		updateLinkDistances()
		return chart;
	};
	
	chart.nodeStrokeMode = function(_) {
		if (!arguments.length) return nodeStrokeMode;
		nodeStrokeMode = _;
		return chart;
	};
	
	chart.nodeFillMode = function(_) {
		if (!arguments.length) return nodeFillMode;
		nodeFillMode = _;
		return chart;
	};
	
	chart.lineStrokeMode = function(_) {
		if (!arguments.length) return lineStrokeMode;
		lineStrokeMode = _;
		return chart;
	};
	
	chart.textFillMode = function(_) {
		if (!arguments.length) return textFillMode;
		textFillMode = _;
		return chart;
	};

	chart.showBubbles = function(_) {
		if (!arguments.length) return showBubbles;
		showBubbles = _;
		return chart;
	};
	updateLinkDistances();
	
	return chart;
}

/**
 * Allows viewing of secondary structures
 */
Ext.define('App.ui.StrandPreview', {
	extend : 'App.ui.D3Panel',

	alias : 'widget.strandpreview',
	requires : [],

	autoRender : true,
	data : '',
	fade_in_duration: 1000,
	bodyStyle: 'background-color: white',
	persistenceLength: 1,//2,
	adjacencyMode : 2,
	setValue : function(structure, strands) {
		this.data = structure;
		this.structure = structure; 
		this.strands = strands;

		// if(structure) {
			// this.buildVis();
		// } else {
			// this.force.nodes([]).links([])
		// }
		this.buildVis();
		// this.restart();
	},
	buildVis : function() {
		var panel = this.getCanvas();
		panel.selectAll('g').remove();
		this.chart = StrandPreview(panel).width(this.getWidth()).height(this.getHeight());
		panel.data([this.data]).call(this.chart);
	},
	
	initComponent : function() {
		this.callParent(arguments);
	},
})


// /**
 // * Allows viewing of secondary structures
 // */
// Ext.define('App.ui.StrandPreview', {
	// extend : 'App.ui.D3Panel',
// 
	// alias : 'widget.strandpreview',
	// requires : [],
// 
	// autoRender : true,
	// data : '',
	// fade_in_duration: 1000,
	// bodyStyle: 'background-color: white',
	// persistenceLength: 1,//2,
	// adjacencyMode : 2,
	// setValue : function(structure, strands) {
		// this.data = structure;
		// this.structure = structure; 
		// this.strands = strands;
// 
		// if(structure) {
			// this.buildVis();
			// // this.updateValue();
			// //this.nodeLayout = DNA.generateAdjacency(structure,strands,true);
			// // if(!this.built) {
				// // this.buildVis();
			// // } else {
				// // //this.force.reset();
				// // this.force.nodes(this.nodeLayout.nodes).links(this.nodeLayout.links);
			// // }
			// // this.vis.render();
		// } else {
			// //this.force.reset();
			// this.force.nodes([]).links([])
		// }
		// this.restart();
	// },
	// updateValue: function() {
		// var structure = this.data, strandBreaks = 0;
		// if(_.isString(structure)) {			
			// strandBreaks = structure.match(/\+/g);
			// strandBreaks = !!strandBreaks ? strandBreaks.length : 0;
			// this.parsed_struct = DNA.parseDotParen(structure);
		// } else {
			// this.parsed_struct = DNA.parseDotParen(structure.dotParen);	
		// }
// 		
		// var strands = !!this.strands ? this.strands : _.range(1,strandBreaks+2);
		// // this.nodeLayout = DNA.generateAdjacency(structure, strands, true,{
			// // persistenceLength: this.persistenceLength
		// // });
		// if(this.adjacencyMode == 2) {
			// this.nodeLayout = DNA.generateAdjacency2(structure, {
				// linkStrands : true,
				// //persistenceLength: this.persistenceLength,
				// persistenceLength: false,
			// });
		// } else {
			// this.nodeLayout = DNA.generateAdjacency(structure, strands, true, { 
				// persistenceLength: false,
			// });
		// }
// 		
	// },
	// buildPointLayout: function(nodes,viewSizeX,viewSizeY) {
		// return DNA.layoutStructure(this.parsed_struct,{center: true, scale: [viewSizeX*.8,viewSizeY*.8], offsets:[viewSizeX*.1,viewSizeY*.1], });
		// // var l = nodes.length;
		// // return _.map(nodes,function(n,i) {
			// // theta = 2*Math.PI*(i/l)
			// // return [viewSizeX/2 + Math.cos(theta) * viewSizeX/2,
				// // viewSizeY/2 + Math.sin(theta) * viewSizeY/2]
		// // });
	// },
	// buildVis : function() {
		// var panel = this.getCanvas();
// 
		// function range(arr) {
			// return _.range(arr[0], arr[1] + 1)
		// }
		// this.updateValue();
// 
		// this.doAutoSize();
// 		
// 		
		// var w = this.getWidth(), h = this.getHeight();
// 		
		// var viewSizeX = w, viewSizeY = h;
		// var fade_in_duration = this.fade_in_duration, panel_wait_duration = 1000, simultaneous_panels = 2;
// 
		// this.pointLayout = this.buildPointLayout(this.nodeLayout.nodes,viewSizeX,viewSizeY)
		// var layout = this.pointLayout;
// 
		// // panel.append("rect").attr("fill","#fff").attr("width",viewSizeX * viewCountX).attr("height",viewSizeY * viewCountY);
		// //panel.call(d3.behavior.zoom());
// 		
// 		
		// var nodes = this.nodeLayout.nodes;
		// var links = this.nodeLayout.links;
// 
		// var l = nodes.length;
		// nodes = _.map(nodes, function(n, i) {
			// n.x = layout[i][0];
			// n.y = layout[i][1];
			// n.theta = layout[i][2];
			// return n;
		// });
// 		
		// var k = Math.sqrt(nodes.length / (viewSizeX * viewSizeY));
// 		
		// var maxLinkDistance = viewSizeX / 20,
			// strandLinkDistance = maxLinkDistance,
			// wcLinkDistance = 1.5 * strandLinkDistance,
			// persistenceLength = this.persistenceLength;
		// if(!this.force) {
			// var force = this.force = d3.layout.force().size([viewSizeX, viewSizeY]).charge(-70).linkDistance(function(l,i) { 
				// if(l.type == 'persistence') {
					// return persistenceLength * (1.2*maxLinkDistance)
				// } else if(l.type == 'wc') {
					// return wcLinkDistance;
				// } else if(l.type == 'strand') {
					// return strandLinkDistance;
				// }
			// }).linkStrength(function(l, i) {
				// if(l.type == 'persistence') {
					// return 1/persistenceLength
				// } else if(l.type == 'wc') {
					// return 1;
				// } else if(l.type == 'strand') {
					// return 0.7;
				// }
			// }).gravity(0.05);
		// } else {
			// var force = this.force;
		// }
// 
		// force.nodes(nodes).links(links)
// 
		// var line_stroke = '#aaa';
		// var strokes = {
			// 'wc': '#ccc',
			// 'strand' : line_stroke,
			// 'persistence' : '',
			// 'undesired' : '#a00',
		// }
// 
		// // Links
		// this.link = panel.selectAll("line.link").data(links);
		// this.link.exit().remove();
		// this.link = this.link.enter().append("line").attr("class", function(d) {
			// var cls = ["link"]
			// cls.push("source-" + d.source.name);
			// cls.push("target-" + d.target.name);
			// return cls.join(' ');
		// }).style("stroke-width", function(l) {
			// if(l._type == 'persistence') {
				// return 0;
			// }
		// }).style('stroke', function(l) {
			// return strokes[l.type];
			// //strokes[d._type]
		// });
// 
		// // Node Groups
		// this.node = panel.selectAll("g.node").data(nodes);
		// this.node.exit().remove();
		// this.node = this.node.enter().append('g').attr("class", "node").call(force.drag);
// 
		// // Node circle
		// this.node.append("circle").attr("r", 5).style("fill", function(d) {
			// return App.dynamic.Compiler.domainColors[d.role] || '#aaa';
		// }).attr('stroke-width', 2).attr('stroke', '#fff')
// 
		// // Node text
		// this.node.append('text').attr('class', 'node_label')
		// .style('fill', '#111')
		// .style('text-shadow', '2px 2px 2px white')
		// .attr('text-anchor','middle')
		// .attr('dx', function(d) {
			// return Math.cos(d.theta)+'em';
		// }).attr('dy', function(d) {
			// return Math.sin(d.theta)+0.35+'em';
		// }).text(function(d,i) {
			// return (i % 10 == 0) ? i : '';
		// });
// 
		// this.restart();
// 
		// // _.delay(function() {
			// // force.start()
// // 
			// // fadeIn()
// // 
			// // force.on("tick", doTick);
// // 
			// // _.delay(function() {
				// // force.stop();
			// // }, panel_wait_duration * simultaneous_panels)
		// // }, panel_wait_duration * strand_index)
// 
	// },
	// restart: function() {
		// var me = this;
		// var doTick = function() {
			// me.link.attr("x1", function(d) {
				// return d.source.x;
			// }).attr("y1", function(d) {
				// return d.source.y;
			// }).attr("x2", function(d) {
				// return d.target.x;
			// }).attr("y2", function(d) {
				// return d.target.y;
			// });
// 
			// me.node.attr("transform", function(d) {
				// return "translate(" + d.x + "," + d.y + ")";
			// });
		// }
		// function fadeIn() {
			// me.getCanvas().style("opacity", 1e-6).transition().duration(me.fade_in_duration).style("opacity", 1);
		// }
// 
		// this.force.start();
		// this.force.on("tick", doTick);
		// // doTick();
		// //me.force.stop();
		// // _.delay(function() { me.force.start(); },2000);	
		// fadeIn();
	// },
	// initComponent : function() {
// 
		// this.callParent(arguments);
	// },
// })