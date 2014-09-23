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
			
			// flags to show or hide parts of the visualization
			showBubbles = true,
			showBases = true,
			showIndexes = true,
			showSegments = true,
			showStrands = true,
			colorSegmentLabels = true,
			defaultSegmentColor = '#888',

			colorStrandLabels = true,
			defaultStrandColor = '#888',

			// font sizes, in em
			segmentLabelFontSize = 1.25,
			strandLabelFontSize = 1.25,
			nodeBaseFontSize = baseWidth*.8,
			nodeIndexFontSize = baseWidth*.8,

			scaleSegmentLabels = true,
			scaleStrandLabels = true,
			minFontSize = 0.25,
			segment_label_height = 2,
			strand_label_height = 5,

			arrowDistance = 60,
			arrowScale = 20,
			// loopMode = 'circular',
			loopMode = 'linear',

			line_stroke = '#aaa',
			strokes = {
				'wc': '#ccc',
				'strand' : line_stroke,
				'persistence' : '',
				'undesired' : '#a00',
			};
		var segmentColors = StrandPreview.defaultSegmentColors(), //d3.scale.category20(),
			strandColors = StrandPreview.defaultStrandColors(), //d3.scale.ordinal().range(colorbrewer.Set3[12]), //d3.scale.category20b(),
			baseColors = StrandPreview.defaultBaseColors();
	
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
		} else if(structure.dotParen && structure.strands && structure.sequences && !structure.structure) {
			return DNA.generateAdjacency4(structure.dotParen, structure.strands, {
				extraData: structure.extraData || null,
				sequences: structure.sequences,
				persistenceLength: false,
			});
		} else if(structure.strands && structure.dotParen && !structure.sequences) {
			return DNA.generateAdjacency4(structure.dotParen, structure.strands, {
				extraData: structure.extraData || null,
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
			var strand_breaks = nodeLayout.strand_positions,
			tailNodes = [],
			tailLinks = [];
			if(!strand_breaks) {
				strand_breaks = [nodes.length-1];
			}
			var lastIndex = nodes.length;
			for(var i = 0; i < strand_breaks.length; i++) {

				var breakIndex = strand_breaks[i]-1, lastNode = nodes[breakIndex-1];
				if(lastNode) { 
					var theta = lastNode.theta+Math.PI/2, //-Math.PI*5/16,
					tailNode = {
						x: lastNode.x+Math.cos(theta)*arrowDistance,
						y: lastNode.y+Math.sin(theta)*arrowDistance,
						theta: theta,
					},
					tailLink = {source: breakIndex, target: lastIndex + i, type: 'tail'};
					tailNodes.push(tailNode)
					tailLinks.push(tailLink)
				}

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
			if(tailNodes) {
				forceNodes = _.clone(nodes);
				forceNodes = forceNodes.concat(tailNodes);
				links = links.concat(tailLinks);
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
						case 'strand':
								return strandColors(d.strand)
						default:
							return '';
					}
				}
				return '';
			});
			
							
			// Node Groups
			nodeSel = panel.selectAll("g.node").data(nodes);
			nodeSel.exit().remove();
			nodeSel = nodeSel.enter().append('g').attr("class", function(d) {
				var cls = ["node"];
				if(d.immutable) { cls.push('immutable') }
				if(d.prevented) { cls.push('prevented') }
				if(d.changed) { cls.push('changed') }
				return cls.join(' ')

			}).call(force.drag);
			
			// Uncomment to draw lines showing theta for each base
			// nodeSel.append("line").attr("x1",0).attr("y1",0)
			// 	.attr("x2",function(d) { return Math.cos(d.theta)*20; })
			// 	.attr("y2",function(d) { return Math.sin(d.theta)*20; })
			// 	.attr("stroke","black").attr("stroke-width","2px")

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

			// Node strand name
			if(showStrands) {
				var node_strand = nodeSel.append('text').attr('class', 'node_strand');
				redrawNodeStrand(node_strand);
			}

			if(tailNodes) {
				var tailPathTemplate = _.template("M-<%=s%>,-<%=s%> L0,0 L-<%=s%>,<%=s%>");
				var tailSel = panel.selectAll("path.tail")
					.data(tailNodes).enter().append('path').attr('class','tail');
				tailSel.attr('d',tailPathTemplate({s:arrowScale}));
			}

			redraw(pointLayout.zoom,pointLayout.translate);
	
			// gobbles parameters that would be passed to redraw and uses d3.event stuff instead
			function zoomRedraw() {
				d3.event.sourceEvent.stopPropagation();
				return redraw(d3.event.scale,d3.event.translate );
			}

			var nodeBaseHidden = false,
				nodeIndexHidden = false,
				segmentLabelHidden = false,
				strandLabelHidden = false;

			function redraw(redraw_scale,redraw_translate) {
				panel.attr("transform",
			      "translate(" + redraw_translate + ")"
			      + " scale(" + redraw_scale + ")");

				// Hide base and index labels when we zoom out too far
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

				// If shown, scale segment labels with zoom
				if(showSegments) {
					if(!segmentLabelHidden) {
						// if(segmentLabelFontSize*redraw_scale < minFontSize) {
						// 	panel.selectAll('text.node_segment').style('display','none');
						// 	segmentLabelHidden = true;
						// }
						if(scaleSegmentLabels) {
							function nodeSegmentDx(d) {
								// if(d.segment_length) {
								// 	var phi = Math.atan2(segment_label_height,d.segment_length*baseWidth/2),
								// 	c = Math.sqrt(Math.pow(segment_label_height,2),Math.pow(d.segment_length*baseWidth/2,2));
								// 	return Math.cos(d.theta+Math.PI/2-phi)*c*redraw_scale*2+'em';
								// }
								// return Math.cos(d.theta+Math.PI/4)*2.5*redraw_scale*2+'em';
								return Math.cos(d.theta)*segment_label_height*redraw_scale+'em';
							}
							function nodeSegmentDy(d) {
								// if(d.segment_length) {
								// 	var phi = Math.atan2(segment_label_height,d.segment_length*baseWidth/2),
								// 	c = Math.sqrt(Math.pow(segment_label_height,2),Math.pow(d.segment_length*baseWidth/2,2));
								// 	return Math.sin(d.theta+Math.PI/2-phi)*c*redraw_scale*2+0.35+'em';
								// }
								// return Math.sin(d.theta+Math.PI/4)*2.5*redraw_scale*2+0.35+'em';
								return Math.sin(d.theta)*segment_label_height*redraw_scale+0.35+'em';
							}

							var sel = panel.selectAll('text.node_segment');
							sel.style('font-size',1/redraw_scale*segmentLabelFontSize+'em')
							.attr('dx', nodeSegmentDx).attr('dy', nodeSegmentDy);
						}
					}
					//  else if(segmentLabelFontSize*redraw_scale >= minFontSize && segmentLabelHidden) {
					// 	panel.selectAll('text.node_segment').style('display','');
					// 	segmentLabelHidden = false;
					// }
				}

				if(showStrands) {
					if(!strandLabelHidden) {
						// if(strandLabelFontSize*redraw_scale < minFontSize) {
						// 	panel.selectAll('text.node_strand').style('display','none');
						// 	strandLabelHidden = true;
						// }
						if(scaleStrandLabels) {
							function nodeStrandDx(d) {
								// if(d.segment_length) {
								// 	var phi = Math.atan2(segment_label_height,d.segment_length*baseWidth/2),
								// 	c = Math.sqrt(Math.pow(segment_label_height,2),Math.pow(d.segment_length*baseWidth/2,2));
								// 	return Math.cos(d.theta+Math.PI/2-phi)*c*redraw_scale*2+'em';
								// }
								return Math.cos(d.theta)*strand_label_height*redraw_scale+'em';
							}
							function nodeStrandDy(d) {
								// if(d.segment_length) {
								// 	var phi = Math.atan2(segment_label_height,d.segment_length*baseWidth/2),
								// 	c = Math.sqrt(Math.pow(segment_label_height,2),Math.pow(d.segment_length*baseWidth/2,2));
								// 	return Math.sin(d.theta+Math.PI/2-phi)*c*redraw_scale*2+0.35+'em';
								// }
								return Math.sin(d.theta)*strand_label_height*redraw_scale+0.35+'em';
							}

							var sel = panel.selectAll('text.node_strand');
							sel.style('font-size',1/redraw_scale*strandLabelFontSize+'em')
							.attr('dx', nodeStrandDx).attr('dy', nodeStrandDy);
						}
					} 
					// else if(strandLabelHidden && strandLabelFontSize*redraw_scale >= minFontSize) {
					// 	panel.selectAll('text.node_strand').style('display','');
					// 	strandLabelHidden = false;
					// }
				}

				// if(showSegments && scaleSegmentLabels && !segmentLabelHidden) {
				// 	var sel = panel.selectAll('text.node_segment');
				// 	sel.style('font-size',1/redraw_scale*segmentLabelFontSize+'em')
				// 	.attr('dx', function(d) {
				// 		if(d.segment_length) {
				// 			var phi = Math.atan2(segment_label_height,d.segment_length*baseWidth/2),
				// 			c = Math.sqrt(Math.pow(segment_label_height,2),Math.pow(d.segment_length*baseWidth/2,2));
				// 			return Math.cos(d.theta+Math.PI/2-phi)*c*redraw_scale*2+'em';
				// 		}
				// 		return Math.cos(d.theta+Math.PI/4)*2.5*redraw_scale*2+'em';
				// 	}).attr('dy', function(d) {
				// 		if(d.segment_length) {
				// 			var phi = Math.atan2(segment_label_height,d.segment_length*baseWidth/2),
				// 			c = Math.sqrt(Math.pow(segment_label_height,2),Math.pow(d.segment_length*baseWidth/2,2));
				// 			return Math.sin(d.theta+Math.PI/2-phi)*c*redraw_scale*2+0.35+'em';
				// 		}
				// 		return Math.sin(d.theta+Math.PI/4)*2.5*redraw_scale*2+0.35+'em';
				// 	});
				// } else {

				// 	// Hide segment labels when we zoom out too far
				// 	if(showSegments && segmentLabelFontSize*redraw_scale < minFontSize && !segmentLabelHidden) {
				// 		panel.selectAll('text.node_base').style('display','none');
				// 		segmentLabelHidden = true;
				// 	} else if(showSegments && segmentLabelFontSize*redraw_scale >= minFontSize && segmentLabelHidden) {
				// 		panel.selectAll('text.node_base').style('display','');
				// 		segmentLabelHidden = false;
				// 	} 
				// }
				

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
					case 'strand':
							return strandColors(d.strand)
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
					case 'strand':
							return d3.rgb(strandColors(d.strand)).darker().toString();
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
					case 'strand':
							return strandColors(d.strand)
					default:
						// Hack. Illustrator appears to ignore these values if they're set in CSS on a class
						return '#fff';
				}
			}).attr("pointer-events",function() { 
				if(showBubbles) return "none"
				else return "all"
			});
		}

		function redrawNodeSegment(node_segment) {
			node_segment
			.attr('text-anchor','middle')
			.text(function(d,i) {
				return d.segment_index == Math.floor(d.segment_length/2) ? d.segment : ''
			}).attr('fill',function(d) {
				return colorSegmentLabels ? segmentColors(d.segment_identity) : defaultSegmentColor;
			});
		}

		function redrawNodeStrand(node_strand) {
			node_strand
			.attr('text-anchor','middle')
			.text(function(d,i) {
				return d.strand_index == 0 ? d.strand : ''
			}).attr('fill',function(d) {
				return colorStrandLabels ? strandColors(d.strand) : defaultStrandColor;
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

				if(showStrands) {
					redrawNodeStrand(nodeSel.select("text.node_segment"));
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

	chart.showStrands = function(_) {
		if (!arguments.length) return showStrands;
		showStrands = _;
		return chart;
	};


	chart.colorSegmentLabels = function(_) {
		if (!arguments.length) return colorSegmentLabels;
		colorSegmentLabels = _;
		return chart;
	};

	chart.colorStrandLabels = function(_) {
		if (!arguments.length) return colorStrandLabels;
		colorStrandLabels = _;
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

	chart.strandColors = function(_) {
		if (!arguments.length) return strandColors;
		strandColors = _;
		return chart;
	};

	chart.options = function(opts) {
		if(opts.showBubbles          !== undefined) chart = chart.showBubbles(opts.showBubbles)
		if(opts.showBases            !== undefined) chart = chart.showBases(opts.showBases)
		if(opts.showIndexes          !== undefined) chart = chart.showIndexes(opts.showIndexes)
		if(opts.showSegments         !== undefined) chart = chart.showSegments(opts.showSegments)
		if(opts.showStrands          !== undefined) chart = chart.showStrands(opts.showStrands)
		if(opts.colorSegmentLabels   !== undefined) chart = chart.colorSegmentLabels(opts.colorSegmentLabels)
		if(opts.colorStrandLabels    !== undefined) chart = chart.colorStrandLabels(opts.colorStrandLabels)
		if(opts.loopMode             !== undefined) chart = chart.loopMode(opts.loopMode)
		if(opts.nodeStrokeMode       !== undefined) chart = chart.nodeStrokeMode(opts.nodeStrokeMode)
		if(opts.nodeFillMode         !== undefined) chart = chart.nodeFillMode(opts.nodeFillMode)
		if(opts.lineStrokeMode       !== undefined) chart = chart.lineStrokeMode(opts.lineStrokeMode)
		if(opts.textFillMode         !== undefined) chart = chart.textFillMode(opts.textFillMode);
		return chart;
	}

	updateLinkDistances();
	
	return chart;
}
StrandPreview.defaultSegmentColors = function () {
	return d3.scale.category20();
}
StrandPreview.defaultStrandColors = function () {
	// '#FE0'
	return d3.scale.ordinal().range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffee00","#a65628","#f781bf","#999999"])
}
StrandPreview.defaultBaseColors = function () {
	return d3.scale.ordinal().domain(['A','T','C','G','N']).range(['blue','red','green','black','orange']);
}