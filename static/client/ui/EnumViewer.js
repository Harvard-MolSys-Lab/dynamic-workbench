Ext.define('App.ui.EnumViewer', {
	extend : 'App.ui.D3Panel',
	requires : ['App.ui.nodal.StrandPreview'],
	mixins : {
		app : 'App.ui.Application'
	},
	editorType : 'Enumerator',
	autoRender : false,
	constructor : function() {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this, arguments);
		this.on('afterrender', this.loadFile, this);
		this.complexWindows = {};
		this.previewPanels = {};
	},
	onLoad : function() {
		this.afterrender();
	},
	buildVis : function() {
		/* ****
		 * Visualization utilities
		 */

		var curve = d3.svg.line().interpolate("cardinal-closed").tension(.85);

		var fill = d3.scale.category20();

		function nodeid(n) {
			return n.size ? "_g_" + n.group : n.name;
		}

		function linkid(l) {
			var u = nodeid(l.source), v = nodeid(l.target);
			return u < v ? u + "|" + v : v + "|" + u;
		}

		function getGroup(n) {
			return n.group;
		}

		// constructs the network to visualize
		function network(data, prev, index, expand) {
			expand = expand || {};
			var gm = {}, // group map
			nm = {}, // node map
			lm = {}, // link map
			gn = {}, // previous group nodes
			gc = {}, // previous group centroids
			nodes = [], // output nodes
			links = [];
			// output links

			// process previous nodes for reuse or centroid calculation
			if (prev) {
				prev.nodes.forEach(function(n) {
					var i = index(n), o;
					if (n.size > 0) {
						gn[i] = n;
						n.size = 0;
					} else {
						o = gc[i] || (gc[i] = {
							x : 0,
							y : 0,
							count : 0
						});
						o.x += n.x;
						o.y += n.y;
						o.count += 1;
					}
				});
			}

			// determine nodes
			for (var k = 0; k < data.nodes.length; ++k) {
				var n = data.nodes[k], i = index(n), l;
				if(!i) {
					// the node isn't part of a group; just pass it through
					nm[n.name] = nodes.length;
					nodes.push(n);
					continue;
				}

				l = gm[i] || (gm[i] = gn[i]) || (gm[i] = {
					group : i,
					size : 0,
					nodes : []
				});

				if (expand[i]) {
					// the node should be directly visible
					nm[n.name] = nodes.length;
					nodes.push(n);
					if (gn[i]) {
						// place new nodes at cluster location (plus jitter)
						n.x = gn[i].x + Math.random();
						n.y = gn[i].y + Math.random();
					}
				} else {
					// the node is part of a collapsed cluster
					if (l.size == 0) {
						// if new cluster, add to set and position at centroid of leaf nodes
						nm[i] = nodes.length;
						nodes.push(l);
						if (gc[i]) {
							l.x = gc[i].x / gc[i].count;
							l.y = gc[i].y / gc[i].count;
						}
					}
					l.nodes.push(n);
				}
				// always count group size as we also use it to tweak the force graph strengths/distances
				l.size += 1;
				n.group_data = l;
			}

			for (i in gm) {
				gm[i].link_count = 0;
			}

			// determine links
			for ( k = 0; k < data.links.length; ++k) {
				var e = data.links[k], u = index(e.source), v = index(e.target);
				if(gm[u] && gm[v]) {
					if (u != v) {
						gm[u].link_count++;
						gm[v].link_count++;
					}
				}
				// If u is undefined (no group) or expanded, pass the link 
				// through to its normal target. Else link to the collapsed group 
				u = (!u || expand[u]) ? nm[e.source.name] : nm[u];
				v = (!v || expand[v]) ? nm[e.target.name] : nm[v];
				var i = (u < v ? u + "|" + v : v + "|" + u), l = lm[i] || (lm[i] = {
					source : u,
					target : v,
					size : 0
				});
				l.size += 1;
			}
			for (i in lm) {
				links.push(lm[i]);
			}

			return {
				nodes : nodes,
				links : links
			};
		}

		function convexHulls(nodes, index, offset) {
			var hulls = {};

			// create point sets
			for (var k = 0; k < nodes.length; ++k) {
				var n = nodes[k], i, l;
				if (n.size)
					continue;

				i = index(n);
				if(!i) continue;

				l = hulls[i] || (hulls[i] = []);
				l.push([n.x - offset, n.y - offset]);
				l.push([n.x - offset, n.y + offset]);
				l.push([n.x + offset, n.y - offset]);
				l.push([n.x + offset, n.y + offset]);
			}

			// create convex hulls
			var hullset = [];
			for (i in hulls) {
				hullset.push({
					group : i,
					path : d3.geom.hull(hulls[i])
				});
			}

			return hullset;
		}

		function drawCluster(d) {
			return curve(d.path);
			// 0.8
		}
		
		// --------------------------------------------------------

		/* ******************************
		 * Load data, build graph data structures
		 */

		var data = JSON.parse(this.data);

		console.log(data);

		var complexes, reactions, restingStates, initial_complexes = _.reduce(data['initial_complexes'], function(memo, c) {
			memo[c.name] = true;
			return memo;
		}, {});

		//
		// if(data['condensed_reactions']) {
		// reactions = data['condensed_reactions'];
		// var l = 0;
		// var restingStates = _.map(data['resting_states'],function(x) {
		//
		// })
		// } else {
		reactions = data['reactions'];

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

		// }

		// Map complexes to their containing resting state
		var restingStateMap = {};
		if (data['resting_states']) {
			for (var i = 0; i < data['resting_states'].length; i++) {
				var resting_state = data['resting_states'][i];
				for (var j = 0; j < resting_state.complexes.length; j++) {
					restingStateMap[resting_state.complexes[j]] = resting_state.name;
				}
			}
		}
		console.log(restingStateMap);

		// Build data for the complex nodes
		var nodeData = _.map(complexes, function(x, i) {
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
		var nodeMap = _.reduce(nodeData, function(memo, x, i) {
			memo[x.name] = x;
			return memo;
		}, {});

		// Build data for the reaction noes
		reactions = _.map(reactions, function(x, i) {
			x._type = 'reaction';
			x.name = 'reaction_' + i;
			x._index = i + nodeData.length;
			x.fast = !(x.reactants.length > 1);
			x.slow = !x.fast;
			x.group = nodeMap[x.reactants[0]].group;
			for(var j=0;j<x.reactants.length;j++) {
				if(nodeMap[x.reactants[j]].group != x.group) {
					x.outgoing = true;
					x.group = null;
					break;
				}
			}
			if(!x.outgoing) {
				for(var j=0;j<x.products.length;j++) {
					if(nodeMap[x.products[j]].group != x.group) {
						x.outgoing = true;
						x.group = null;
						break;
					}
				}
			}	
			return x
		});

		console.log(nodeData);

		// Collect node data
		var allNodes = nodeData.concat(reactions);

		// Build links
		var links = _.flatten(_.map(reactions, function(reaction) {
			return _.map(reaction.reactants, function(reactant) {
				return {
					'source' : nodeMap[reactant]._index,
					'target' : reaction._index
				}
			}).concat(_.map(reaction.products, function(product) {
				return {
					'source' : reaction._index,
					'target' : nodeMap[product]._index
				}
			}))
		}), /* true to flatten only one level */true);


		/* ******************************
		 * Build resting state groups thing
		 */
		
		var data = { nodes: allNodes, links: links };
		var expand = {};
		var o;
		
		for(var i=0; i<data.nodes.length;i++) {
			o = data.nodes[i];
			if(o.group) {
				expand[nodeid(o)] = true;
			}
		}
		
		for (var i=0; i<data.links.length; ++i) {
			o = data.links[i];
			o.source = data.nodes[o.source];
			o.target = data.nodes[o.target];
		}
		

		/* ******************************
		 * Build visualization
		 */
		
		// One-time initialization
		var panel = this.getCanvas();
		var line_stroke = '#aaa'

		// panel.call(d3.behavior.zoom());
		panel.append("svg:defs").selectAll("marker").data(["reaction-arrow"]).enter().append("svg:marker").attr("id", String).attr("viewBox", "0 -5 10 10").attr("refX", 15).attr("refY", -1.5).attr("markerWidth", 4).attr("markerHeight", 4).attr("orient", "auto").append("svg:path").attr("d", "M0,-5L10,0L0,5").style('stroke', line_stroke).style('fill', line_stroke);
		
		
		var hullg = panel.append("g");
		var linkg = panel.append("g");
  		var nodeg = panel.append("g");
		
		var dr = 4,      // default point radius
    		off = 15;    // cluster hull offset
		var dist = 50;
		
		
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
		
		var radius = function(d) {
			return d._type == 'complex' ? d.strands.length * 5 : 5
		};
		
		
		function highlightLinks(d) {
			panel.selectAll("line.link-reaction").attr("opacity", 0.3);

			panel.selectAll("line.link-reaction.source-" + d.name).each(function(r, i) {
				panel.selectAll("line.link-reaction.target-" + r.target.name).attr("opacity", 0.8);
			}).attr("opacity", 1.0)

			panel.selectAll("line.link-reaction.target-" + d.name).each(function(r, i) {
				panel.selectAll("line.link-reaction.source-" + r.source.name).attr("opacity", 0.8);
			}).attr("opacity", 1.0)
		}

		function unhighlightLinks() {
			panel.selectAll("line.link-reaction").attr("opacity", 1.0)
		}

		function init() {
					
			var net = network(data, net, getGroup, expand);

			// Build force graph
			// me.force = d3.layout.force().charge(-100).linkDistance(function(l, i) {
			// 	if (!!l.source.fast || !!l.target.fast) {
			// 		return 0.4 * dist
			// 	} else {
			// 		return 0.7 * dist
			// 	}
			// }).size([me.getWidth(), me.getHeight()]).linkStrength(function(l, i) {
			// 	if (!!l.source.fast || !!l.target.fast) {
			// 		return 0.7
			// 	} else {
			// 		return 0.4
			// 	}
			// }).gravity(0.01);
			
			me.force = d3.layout.force()
			.size([me.getWidth(), me.getHeight()])
			.linkDistance(function(l, i) {
			    var n1 = l.source, n2 = l.target;
				// larger distance for bigger groups:
				// both between single nodes and _other_ groups (where size of own node group still counts),
				// and between two group nodes.
				// 
				// reduce distance for groups with very few outer links,
				// again both in expanded and grouped form, i.e. between individual nodes of a group and
				// nodes of another group or other group node or between two group nodes.
				//
				// The latter was done to keep the single-link groups ('blue', rose, ...) close.
				return 30 + 
				  Math.min(20 * Math.min((n1.size || (n1.group != n2.group && n1.group_data ? n1.group_data.size : 0)), 
				                         (n2.size || (n1.group != n2.group && n2.group_data? n2.group_data.size : 0))), 
						   -30 + 
						   30 * Math.min((n1.link_count || (n1.group != n2.group && n1.group_data ? n1.group_data.link_count : 0)),
						                 (n2.link_count || (n1.group != n2.group && n2.group_data ? n2.group_data.link_count : 0))), 
						   100);
			    //return 150;
			  })
			  .linkStrength(function(l, i) {
				return 1;
			  })
			  .gravity(0.05)   // gravity+charge tweaked to ensure good 'grouped' view (e.g. green group not smack between blue&orange, ...
			  .charge(-600)    // ... charge is important to turn single-linked groups to the outside
			  .friction(0.5)   // friction adjusted to get dampened display: less bouncy bouncy ball [Swedish Chef, anyone?]
			// .chargeConstant(-30).springConstant(0.1).dragConstant(0.4).bound(true)
			// .springLength(50);
	
			me.force.nodes(net.nodes).links(net.links).start();
			
			// Convex hulls
			hullg.selectAll("path.hull").remove();
			var hull = hullg.selectAll("path.hull")
			      .data(convexHulls(net.nodes, getGroup, off))
			    .enter().append("path")
			      .attr("class", "hull resting-state-hull")
			      .attr("d", drawCluster)
			      // .style("fill", function(d) { return fill(d.group); })
			      .on("click", function(d) { 
					console.log("hull click", d, arguments, this, expand[d.group]);	  
				    expand[d.group] = false; init(); 
				  });
			
			me.link = linkg.selectAll("line.link-reaction").data(net.links, linkid);
			  me.link.exit().remove();
			  me.link.enter().append("line")
			      .attr("class", function(d) {
					var cls = ["link-reaction"]
					cls.push("source-" + d.source.name);
					cls.push("target-" + d.target.name);
					return cls.join(' ');
				  }).attr("x1", function(d) { return d.source.x; })
			      .attr("y1", function(d) { return d.source.y; })
			      .attr("x2", function(d) { return d.target.x; })
			      .attr("y2", function(d) { return d.target.y; })
			      .style("stroke-width", function(d) { return d.size || 1; })
			      .attr("marker-end", function(d) {
					return "url(#reaction-arrow)";
				});;
			
			

			me.node = nodeg.selectAll("g.node").data(net.nodes, nodeid);
			  me.node.exit().remove();
			  me.node.enter().append("g")
			  	.attr('class','node')
			  	.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				})
			  	.on('mouseover', highlightLinks)
			  	.on('mouseout', unhighlightLinks)
			  	.on('dblclick', function(d) {
					if (d._type == 'complex')
						me.showWindow(d, this);
				})

			me.node.append('text').attr('class', 'node_label')
			.style('fill', '#111')
			.style('text-shadow', '1px 1px 2px white')
			.attr("dx", function(d) {
				return radius(d) + 5
			}).attr("dy", ".35em").text(function(d) {
				if (d._type == 'complex') {
					return d.name
				} else {
					return ''
				}
			});

			me.node.append('circle')
			      // if (d.size) -- d.size > 0 when d is a group node.
			      .attr("class", function(d) { 
			      	switch(d._type) {
			      		case 'complex':
			      			return 'complex '+ (d.resting ? 'complex-resting' : 'complex-transient');
			      		case 'reaction':
			      			return '' + (d.fast ? 'reaction-fast' : 'reaction-slow');
			      		default:
			      			if(d.size != 0) {
			      				return 'resting-state'
			      			}
			      			return '';
			      	} 
			      })
			      .attr("r", function(d) { return d.size ? d.size + dr : dr+1; })
			      // .attr("cx", function(d) { return d.x; })
			      // .attr("cy", function(d) { return d.y; })
			      //.style("fill", function(d) { return fill(d.group); })
			      .on("click", function(d) {
					if(d.group) {
						console.log("node click", d, arguments, this, expand[d.group]);	  
				        expand[d.group] = !expand[d.group]; 
						init(); 
					}
			      });
			
		  me.node.call(me.force.drag);
			
		
		  me.force.on("tick", function() {
			    if (!hull.empty()) {
			      hull.data(convexHulls(net.nodes, getGroup, off))
			          .attr("d", drawCluster);
			    }
			
			    me.link.attr("x1", function(d) { return d.source.x; })
			        .attr("y1", function(d) { return d.source.y; })
			        .attr("x2", function(d) { return d.target.x; })
			        .attr("y2", function(d) { return d.target.y; });
			

				me.node.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});
			    // me.node.attr("cx", function(d) { return d.x; })
			    //     .attr("cy", function(d) { return d.y; });
			  });
			
		}	

		// // Links
		// this.link = panel.selectAll("line.link").data(net.links).enter().append("line").attr("class", function(d) {
			// var cls = ["link"]
			// cls.push("source-" + d.source.name);
			// cls.push("target-" + d.target.name);
			// return cls.join(' ');
		// }).style("stroke-width", 2).style('stroke', line_stroke).attr("marker-end", function(d) {
			// return "url(#reaction-arrow)";
		// });
// 
		// // Node Groups
		// this.node = panel.selectAll("g.node").data(net.nodes).enter()
		// .append('g').attr("class", "node").classed('transient', function(d) {
		// 	return d.transient
		// }).classed('resting', function(d) {
		// 	return d.resting
		// }).call(this.force.drag).on('mouseover', function(d) {
		// 	panel.selectAll("line.link").attr("opacity", 0.3);

		// 	panel.selectAll("line.link.source-" + d.name).each(function(r, i) {
		// 		panel.selectAll("line.link.target-" + r.target.name).attr("opacity", 0.8);
		// 	}).attr("opacity", 1.0)

		// 	panel.selectAll("line.link.target-" + d.name).each(function(r, i) {
		// 		panel.selectAll("line.link.source-" + r.source.name).attr("opacity", 0.8);
		// 	}).attr("opacity", 1.0)
		// }).on('mouseout', function(d) {
		// 	panel.selectAll("line.link").attr("opacity", 1.0)
		// }).on('click', function(d) {
		// 	if (d._type == 'complex')
		// 		me.showWindow(d, this);
		// });
// 
		// // Node circles

// 
		// this.node.append("circle").attr("r", 5)
		// //.attr("stroke",function() {return d3.rgb(this.attr('fill')).darker().toString(); })
		// .style("fill", function(d) {
			// if (d.resting) {
				// return colors['resting'];
			// }
			// if (d._type == 'reaction') {
				// if (!!d.fast) {
					// return colors['reaction-fast'];
				// } else {
					// return colors['reaction-slow'];
				// }
			// }
			// return colors[d._type];
		// }).attr('stroke-width', 2).attr('stroke', function(d) {
			// if (d._type == 'complex' && d.initial) {
				// return strokes['initial']
			// }
			// return strokes[d._type];
		// }).attr('r', radius)

		// // Node text
		// this.node.append('text').attr('class', 'node_label')
		// //.style('stroke','#111')
		// .style('fill', '#111')//.style('text-shadow','1px 1px 2px #222')
		// .style('text-shadow', '1px 1px 2px white')
		// //.attr('text-anchor','middle').attr('dy','.35em')
		// .attr("dx", function(d) {
			// return radius(d) + 5
		// }).attr("dy", ".35em").text(function(d) {
			// if (d._type == 'complex') {
				// return d.name
			// } else {
				// return ''
			// }
		// });
		
		
		
		// Legend
		this.legend = panel.selectAll('g.legend').data([{
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

		this.legend.append('circle').attr('fill', function(d) {
			return fills[d.type]
		}).attr('stroke', function(d) {
			return strokes[d.type]
		}).attr('r', 8).attr('stroke-width', 2)
		this.legend.append('text').style('fill', '#111').text(function(d) {
			return d.name
		}).attr("dx", function(d) {
			return radius(d) + 5
		}).attr("dy", ".35em")


		init();

		// var me = this;
		// this.force.on("tick", function() {
			// me.link.attr("x1", function(d) {
				// return d.source.x;
			// }).attr("y1", function(d) {
				// return d.source.y;
			// }).attr("x2", function(d) {
				// return d.target.x;
			// }).attr("y2", function(d) {
				// return d.target.y;
			// });
			// // me.link.attr("d", function(d) {
			// // var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math.sqrt(dx * dx + dy * dy);
			// // return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
			// // });
// 
			// me.node.attr("transform", function(d) {
				// return "translate(" + d.x + "," + d.y + ")";
			// });
// 
		// });

	},
	showWindow : function(d, node) {
		if (!this.complexWindows[d.name]) {
			var strands = d['strands'];

			// this.previewPanels[d.name] = Ext.create('App.ui.nodal.StrandPreview', {
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
