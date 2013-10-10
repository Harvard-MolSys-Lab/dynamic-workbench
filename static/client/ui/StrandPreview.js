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
			showBubbles = true,
			showBases = true,
			showIndexes = true,
			showSegments = true,

			segmentLabelFontSize = 1,
			nodeBaseFontSize = baseWidth*.8,
			nodeIndexFontSize = baseWidth*.8,

			scaleSegmentLabels = true,
			minFontSize = 0.25,
			segment_label_height = 2,

			arrowDistance = 60,
			arrowScale = 20,
			loopMode = 'circular',

			line_stroke = '#aaa',
			strokes = {
				'wc': '#ccc',
				'strand' : line_stroke,
				'persistence' : '',
				'undesired' : '#a00',
			};
		var segmentColors = d3.scale.category20(),
			baseColors = d3.scale.ordinal().domain(['A','T','C','G','N']).range(['blue','red','green','black','orange']);
	
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
		} else if(structure.dotParen && !structure.structure) {
			return DNA.generateAdjacency4(structure.dotParen, structure.strands, {
				extraData: structure.extraData || null,
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
		var pairs = DNA.layoutStructure(parsed_struct,{
			loopMode:loopMode,
			arrangeLayout: false,
		}), layout, scale;
		
		if(pairs.length == 0) {
			return { pairs: [], zoom: 1, translate: [0,0] };
		}

		layout = DNA.arrangeLayout(pairs,{
			center: true, 
			//scale: [viewSizeX*.8,viewSizeY*.8], 
			offsets:[viewSizeX*.05,viewSizeY*.05], 
			loopMode: loopMode,
		});
		scale = DNA.getScale(layout.bounds,[viewSizeX*.8,viewSizeY*.8],/* maintainAspect */ true);
		
		return {
			pairs: layout.pairs,
			zoom: scale[0]*0.9,
			translate: DNA.getOffset(layout.bounds,[viewSizeX*.8,viewSizeY*.8],scale[0]*.9)
		};
	}
	
	function updateLinkDistances() {
		maxLinkDistance = viewSizeX / 20;
		strandLinkDistance = maxLinkDistance;
		wcLinkDistance = 1.5 * strandLinkDistance;
	}
	
	
			
	
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
					structure.dotParen = DNA.expandStructure(structure.structure, structure.strands, structure.sequences,true);
					parsed_struct = DNA.parseDotParen(structure.dotParen);	
				} 
			}
			
			
			/* ******************************
			 * Build nodeLayout and pointLayout
			 */
			var pointLayout, nodeLayout, nodes, links;
			
			// Build nodeLayout; this is the arrangement of nodes and links
			// which is fed to d3.
			nodeLayout = buildNodeLayout(structure);
			// nodeLayout = buildNodeLayout(data);
			
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
			
			// Build node for 3' tail
			var lastIndex = nodes.length-1, lastNode = nodes[lastIndex-1];
			if(lastNode) { 
				var theta = lastNode.theta+Math.PI/2,
				tailNode = {
					x: lastNode.x+Math.cos(theta)*arrowDistance,
					y: lastNode.y+Math.sin(theta)*arrowDistance,
					theta: theta,
				},
				tailLink = {source: lastIndex, target: lastIndex+1, type: 'tail'};
			}

			/* *****************************
			 * Build panel
			 */
			var panel = d3.select(this)
			.attr("pointer-events", "all")
			.append('g')
				//.attr('width',viewSizeX)
				//.attr('height',viewSizeY)
				.call(d3.behavior.zoom().on('zoom',zoomRedraw).scale(pointLayout.zoom).translate(pointLayout.translate))
			.append('g');

			panel.attr("transform",
			      "translate(" + pointLayout.translate + ")"
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
			}).gravity(0.005);
			
			// Bind nodes to the force layout
			var forceNodes = nodes;
			if(tailNode) {
				forceNodes = _.clone(nodes);
				forceNodes.push(tailNode);
				links.push(tailLink);
			}
			force.nodes(forceNodes).links(links)
			
			/* ******************************
			 * Build visualization
			 */
			
			panel.append("rect")
			.classed('strand-preview-drag',true)
			//.attr("fill","transparent")
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
			}).style('stroke',function(d) {
				if(d.type == 'strand') {
					switch(lineStrokeMode) {
						case 'identity':
								return baseColors(d.base)
						case 'segment':
								return segmentColors(d.segment_identity)
						case 'domain':
								return App.dynamic.Compiler.domainColors[d.domain_role] || null
						default:
							return '';
					}
				}
				return '';
			});
			
							
			// Node Groups
			nodeSel = panel.selectAll("g.node").data(nodes);
			nodeSel.exit().remove();
			nodeSel = nodeSel.enter().append('g').attr("class", "node").call(force.drag);
	
			// Node circle
			if(showBubbles) {
				var node_circle = nodeSel.append("circle").attr("r", 0.5*baseWidth+'em');
				redrawNodeCircles(node_circle);
			}
							
			// Node index
			if(showIndexes) {
				var node_index = nodeSel.append('text').attr('class', 'node_index');
				redrawNodeIndex(node_index);
			}

			// Node base
			if(showBases) {
				var node_base = nodeSel.append('text').attr('class', 'node_base');
				redrawNodeBase(node_base);
			}

			// Node segment name
			if(showSegments) {
				var node_segment = nodeSel.append('text').attr('class', 'node_segment');
				redrawNodeSegment(node_segment);
			}

			if(tailNode) {
				var tailSel = panel.selectAll("path.tail")
					.data([tailNode]).enter().append('path').attr('class','tail');
				tailSel.attr('d',Ext.String.format('M-{0},-{0} L0,0 L-{0},{0}',arrowScale));
			}

			redraw(pointLayout.zoom,pointLayout.translate);
	
			// gobbles parameters that would be passed to redraw and uses d3.event stuff instead
			function zoomRedraw() {
				d3.event.sourceEvent.stopPropagation();
				return redraw(d3.event.scale,d3.event.translate );
			}

			var nodeBaseHidden = false,
				nodeIndexHidden = false,
				segmentLabelHidden = false;

			function redraw(redraw_scale,redraw_translate) {
				panel.attr("transform",
			      "translate(" + redraw_translate + ")"
			      + " scale(" + redraw_scale + ")");

				if(showBases && nodeBaseFontSize*redraw_scale < minFontSize && !nodeBaseHidden) {
					panel.selectAll('text.node_base').style('display','none');
					nodeBaseHidden = true;
				} else if (showBases && nodeBaseFontSize*redraw_scale >= minFontSize && nodeBaseHidden) {
					panel.selectAll('text.node_base').style('display','');
					nodeBaseHidden = false;
				}
				if(showIndexes && nodeIndexFontSize*redraw_scale < minFontSize && !nodeIndexHidden) {
					panel.selectAll('text.node_index').style('display','none');
					nodeIndexHidden = true;
				} else if(showIndexes && nodeIndexFontSize*redraw_scale < minFontSize && nodeIndexHidden) {
					panel.selectAll('text.node_index').style('display','');
					nodeIndexHidden = false;
				}

				if(showSegments && scaleSegmentLabels && !segmentLabelHidden) {
					var sel = panel.selectAll('text.node_segment');
					sel.style('font-size',1/redraw_scale*segmentLabelFontSize+'em')
					.attr('dx', function(d) {
						if(d.segment_length) {
							var phi = Math.atan2(segment_label_height,d.segment_length*baseWidth/2),
							c = Math.sqrt(Math.pow(segment_label_height,2),Math.pow(d.segment_length*baseWidth/2,2));
							return Math.cos(d.theta+Math.PI/2-phi)*c*redraw_scale*2+'em';
						}
						return Math.cos(d.theta+Math.PI/4)*2.5*redraw_scale*2+'em';
					}).attr('dy', function(d) {
						if(d.segment_length) {
							var phi = Math.atan2(segment_label_height,d.segment_length*baseWidth/2),
							c = Math.sqrt(Math.pow(segment_label_height,2),Math.pow(d.segment_length*baseWidth/2,2));
							return Math.sin(d.theta+Math.PI/2-phi)*c*redraw_scale*2+0.35+'em';
						}
						return Math.sin(d.theta+Math.PI/4)*2.5*redraw_scale*2+0.35+'em';
					});
				} else {
					if(showSegments && segmentLabelFontSize*redraw_scale < minFontSize && !segmentLabelHidden) {
						panel.selectAll('text.node_base').style('display','none');
						segmentLabelHidden = true;
					} else if(showSegments && segmentLabelFontSize*redraw_scale >= minFontSize && segmentLabelHidden) {
						panel.selectAll('text.node_base').style('display','');
						segmentLabelHidden = false;
					} 
				}
				

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

					if(tailSel) {
						tailSel.attr('transform',function(d) {
							return "translate(" + d.x + "," + d.y + ") rotate("+d.theta*180/Math.PI+")";
						});
					}
				}
				
				function fadeIn() {
					panel.style("opacity", 1e-6)
						.transition()
						.duration(fade_in_duration)
						.style("opacity", 1);
				}
					
				data.force = force;

				// force.start();
				force.start();
				doTick();
				force.stop();
				//force.on("tick", doTick);

				// _.delay(function() { me.force.start(); },2000);	
				
				
				fadeIn();
			}
			
			restart();
			
		});
		
		var c = {
			highlight: highlight,
			unhighlight: unhighlight,
			fade: fade,
			unfade: unfade,
			redrawNodes: redrawNodes,
			each: each,
			expandSelection: expandSelection,
			start: start,
			stop: stop, 
		};

		return c;

		function each(f) {
			selection.each(f);
			return c;
		}

		function expandSelection(newSelection) {
			for(var i=0; i<newSelection.length; i++) {
				for(var j=0; j<selection.length; j++) {
					if(selection[j] == newSelection[i]) {
						selection[j] = newSelection[i];
						newSelection[i] = null;
					}
				}
			}
			for(var i=0; i<newSelection.length; i++) {
				if(newSelection[i] != null) {
					selection.push(newSelection[i]);
				}
			}

		}

		function redrawNodeCircles(node_circle) {
			node_circle.style("fill", function(d) {
				switch(nodeFillMode) {
					case 'identity':
							return baseColors(d.base)
					case 'segment':
							return segmentColors(d.segment_identity)
					case 'domain':
							return App.dynamic.Compiler.domainColors[d.domain_role] || null
				}
			})
			.style("stroke", function(d) {
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

		function redrawNodeIndex(node_index) {
			node_index.style('font-size',nodeIndexFontSize+'em')
			.attr('text-anchor','middle')
			.attr('dx', function(d) {
				return Math.cos(d.theta)+'em';
			}).attr('dy', function(d) {
				return Math.sin(d.theta)+0.35+'em';
			}).text(function(d,i) {
				return (i % 10 == 0) ? i : '';
			});
		}

		function redrawNodeBase(node_base) {
			node_base.style('font-size',nodeBaseFontSize+'em')
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
						// Hack. Illustrator appears to ignore these values if they're set in CSS on a class
						return '#fff';
				}
			});
	}

		function redrawNodeSegment(node_segment) {
			node_segment
			.attr('text-anchor','middle')
			.text(function(d,i) {
				return d.segment_index == 0 ? d.segment : ''
			}).attr('fill',function(d) {
				return segmentColors(d.segment_identity);
			});
		}

		function redrawNodes() {
			each(function(data) {
				var panel = d3.select(this);
				var nodeSel = panel.selectAll("g.node");

				// Node circle
				if(showBubbles) {
					redrawNodeCircles(nodeSel.select("circle"));
				}

				// Node index
				if(showIndexes) {
					redrawNodeIndex(nodeSel.select("text.node_index"));	
				}
				// Node base
				if(showBases) {
					redrawNodeBase(nodeSel.select("text.node_base"));
				}

				// Node segment name
				if(showSegments) {
					redrawNodeSegment(nodeSel.select("text.node_segment"));
				}
				
			})
		}

		function fade() {
			return each(function(data) {
				d3.select(this).selectAll('g.node').classed('node-faded',true);
			});
		}

		function unfade() {
			return each(function(data) {
				d3.select(this).selectAll('g.node').classed('node-faded',false);
			});
		}

		function highlight(criteria,className) {
			className || (className = 'node-highlight');
			if(!criteria) {
				return each(function(data) {
					d3.select(this).selectAll('g.node').classed(className,true);
				})
			}
			return each(function(data) {
				d3.select(this).selectAll('g.node').classed(className,function(d) {
					if(!criteria) { return true; }
					var keep = true;
					for(var key in criteria) {
						keep = keep && (d[key] == criteria[key]);
					}
					return keep;
				});
			});
		}
		function unhighlight(criteria,className) {
			className || (className = 'node-highlight');
			if(!criteria) {
				return each(function(data) {
					d3.select(this).selectAll('g.node').classed(className,false);
				});
			}
			return each(function(data) {
				d3.select(this).selectAll('g.node').classed(className,function(d) {
					var keep = true;
					for(var key in criteria) {
						keep = keep && (d[key] == criteria[key]);
					}
					return !keep;
				});
			});
		}

		function start() {
			each(function(data) {
				data.force.resume();
			})
		}

		function stop() {
			each(function(data) {
				data.force.stop();
			})
		}
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

	chart.showBases = function(_) {
		if (!arguments.length) return showBases;
		showBases = _;
		return chart;
	};

	chart.showIndexes = function(_) {
		if (!arguments.length) return showIndexes;
		showIndexes = _;
		return chart;
	};

	chart.showSegments = function(_) {
		if (!arguments.length) return showSegments;
		showSegments = _;
		return chart;
	};


	chart.loopMode = function(_) {
		if (!arguments.length) return loopMode;
		loopMode = _;
		return chart;
	};

	chart.segmentColors = function(_) {
		if (!arguments.length) return segmentColors;
		segmentColors = _;
		return chart;
	};

	updateLinkDistances();
	
	return chart;
}

/**
 * Allows visualization of secondary structures
 */
Ext.define('App.ui.StrandPreview', {
	extend : 'App.ui.D3Panel',

	alias : 'widget.strandpreview',
	requires : ['App.ui.StrandPreviewViewMenu'],

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
	segmentColors : null,

	showToolbar: true,
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
		this.chart = StrandPreview(panel).width(this.getWidth()).height(this.getHeight())
			.showBubbles(this.showBubbles)
			.showBases(this.showBases)
			.showIndexes(this.showIndexes)
			.showSegments(this.showSegments)
			.loopMode(this.loopMode)
			.nodeStrokeMode(this.nodeStrokeMode)
			.nodeFillMode(this.nodeFillMode)
			.lineStrokeMode(this.lineStrokeMode)
			.textFillMode(this.textFillMode);
		if(!!this.segmentColors) this.chart.segmentColors(this.segmentColors)
		this.preview = this.chart(panel.data([this.data]));
	},
	updateChartProperties: function() {
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
			this.bbar = [{
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
				Ext.create('App.ui.StrandPreviewViewMenu',{view: this})];
		}
		this.callParent(arguments);
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
	showWindow: function(title,data,button) {
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
			});
		}
		this.textWindow.show();
		if(button) {
			this.textWindow.alignTo(button);
		}
		this.textWindow.setTitle(title);
		this.textWindowBox.setValue(data);
	},
	/**
	 * Returns the structure currently displayed in this window, in dot-parenthesis notation
	 */
	getStructure: function () {
		return _.isString(this.data) ? this.data : this.data.dotParen || this.data.structure || null;
	},
	toDotParen: function(btn) {
		var value = this.getStructure();
		this.showWindow('Dot-Parentheses',value,btn);
	},
	toDUPlus: function(btn) {
		var value = DNA.dotParenToDU(this.getStructure());
		this.showWindow('DU+',value,btn);
	},
	toSVG: function(btn) {
		if(!this.svgStyles) {
			Ext.Ajax.request({
			    url: 'styles/strand-preview.css',
			    success: function(response){
			        this.svgStyles = response.responseText;
			        this.doDisplaySVGWindow()
			    },
			    scope: this,
			});
		} else {
			this.doDisplaySVGWindow();
		}
	},
	doDisplaySVGWindow: function() {
		var value = '<?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'+this.getCanvasMarkup();

		// Sorry Cthulhu... http://www.codinghorror.com/blog/2009/11/parsing-html-the-cthulhu-way.html
		value = value.replace(/<svg(\b[^>]*)>/g,'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" $1><style type="text/css"><![CDATA[' + this.svgStyles + ']]></style>');

		this.svgWindow = Ext.create('App.ui.StrandPreviewTextWindow',{
			title: 'SVG',
		});
		this.svgWindow.show();
		this.svgWindow.setValue(value);
		//this.showWindow('SVG',value,btn);
	},
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


