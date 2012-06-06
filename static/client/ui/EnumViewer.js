// Ext.define('App.ui.EnumViewer', {
// extend : 'App.ui.ProtovisPanel',
// mixins : {
// app : 'App.ui.Application'
// },
// editorType : 'Enumerator',
// autoRender : false,
// constructor : function() {
// this.callParent(arguments);
// this.mixins.app.constructor.apply(this, arguments);
// this.on('afterrender', this.loadFile, this);
// this.complexWindows = {};
// this.previewPanels = {};
// },
// onLoad : function() {
// this.afterrender();
// },
// buildVis : function() {
// var data = JSON.parse(this.data);
// var complexes;
// if (data['transient_complexes']) {
// complexes = data['resting_complexes'].concat(data['transient_complexes'])
// } else {
// complexes = data['resting_complexes']
// }
// var nodeData = _.map(complexes, function(x, i) {
// x._type = 'complex';
// x._index = i;
// return x
// });
// var nodeMap = _.reduce(nodeData, function(memo, x, i) {
// memo[x.name] = x;
// return memo;
// }, {});
//
// var reactions = _.map(data['reactions'], function(x, i) {
// x._type = 'reaction';
// x._index = i + nodeData.length;
// return x
// });
//
// var allNodes = nodeData.concat(reactions);
//
// var links = _.flatten(_.map(reactions, function(reaction) {
// return _.map(reaction.reactants, function(reactant) {
// return {
// 'source' : nodeMap[reactant]._index,
// 'target' : reaction._index
// }
// }).concat(_.map(reaction.products, function(product) {
// return {
// 'source' : reaction._index,
// 'target' : nodeMap[product]._index
// }
// }))
// }), true);
// // true to flatten only one level
//
// var panel = this.getCanvas().fillStyle("white");;
//
// this.force = panel.add(pv.Layout.Force)//
// .chargeConstant(-30).springConstant(0.1).dragConstant(0.4).bound(true)
// .springLength(50);
//
// this.force.nodes(allNodes).links(links);
//
// var colors = {
// 'reaction' : 'blue',
// 'complex' : 'red',
// };
// this.force.link.add(pv.Line).interpolate('basis').add(pv.Dot).data(function(l) {
// return [{
// x : l.targetNode.x - 2.6 * Math.cos(Math.atan2(l.targetNode.y - l.sourceNode.y, l.targetNode.x - l.sourceNode.x)),
// y : l.targetNode.y - 2.6 * Math.sin(Math.atan2(l.targetNode.y - l.sourceNode.y, l.targetNode.x - l.sourceNode.x))
// }]
// }).angle(function(n, l) {
// return Math.atan2(l.targetNode.y - l.sourceNode.y, l.targetNode.x - l.sourceNode.x) - Math.PI / 2
// }).shape("triangle").fillStyle("#999").size(.5);
// ;
//
// this.force.node.add(pv.Dot).fillStyle(function(d) {
// return colors[d._type]
// }).lineWidth(1).strokeStyle(function() {
// return this.fillStyle().darker()
// }).size(function(d) {return d._type == 'complex' ? d.strands.length*5 : 5
// }).event('click',function(d) {
// if(d._type == 'complex')
// me.showWindow(d);
// });
//
//
// this.force.label.add(pv.Label).text(function(d, l) {
// return d.name;
// }).visible(function(d) {
// return d._type == 'complex'
// });
//
//
// // legend
// var legend = panel.add(pv.Panel).left(10).top(10);
// legend.data([{type: 'complex'},{type: 'reaction'}]);
// legend.add(pv.Dot)
// .left(10)
// .top(function() {return this.index * 12 + 10})
// .fillStyle(function(d) {return colors[d.type]})
// .strokeStyle(null)
// .anchor("right").add(pv.Label)
// .text(function(d) {return d.type});
//
// var me = this;
// },
// showWindow: function(d) {
// if(!this.complexWindows[d.name]) {
// this.previewPanels[d.name] = Ext.create('App.ui.nodal.StrandPreview',{
// adjacencyMode: 1,
// cls: 'simple-header',
// });
// this.complexWindows[d.name] = Ext.create('Ext.window.Window',{
// items: [this.previewPanels[d.name]],
// layout: 'fit',
// closeAction: 'hide',
// width: 200,
// height: 200,
// });
//
// }
// this.complexWindows[d.name].setTitle("Complex: "+d.name)
// this.complexWindows[d.name].showAt(d.x+30,d.y+30);
// var strands = d['strands'];
// this.previewPanels[d.name].setTitle(strands.join(" + "))
// this.previewPanels[d.name].setValue(d['dot-paren'],strands);
// }
// });

Ext.define('App.ui.EnumViewer', {
	extend : 'App.ui.D3Panel',
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
		var data = JSON.parse(this.data);
		var complexes;
		var initial_complexes = _.reduce(data['initial_complexes'], function(c, memo) {
			memo[c.name] = true;
			return memo;
		}, {});

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
		var nodeData = _.map(complexes, function(x, i) {
			x._type = 'complex';
			if(initial_complexes[x.name]) {
				x.initial = true;
			}
			x._index = i;
			return x
		});
		var nodeMap = _.reduce(nodeData, function(memo, x, i) {
			memo[x.name] = x;
			return memo;
		}, {});
		
		
		var reactions;
		if(data['condensed_reactions']) {
			reactions = data['condensed_reactions'];
		} else {
			reactions = data['reactions'];
		}
		reactions = _.map(reactions, function(x, i) {
			x._type = 'reaction';
			x.name = 'reaction_' + i;
			x._index = i + nodeData.length;
			x.fast = !(x.reactants.length > 1)
			return x
		});

		var allNodes = nodeData.concat(reactions);

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
		}), true);
		// true to flatten only one level

		var panel = this.getCanvas();

		var line_stroke = '#aaa'

		panel.call(d3.behavior.zoom());

		panel.append("svg:defs").selectAll("marker").data(["reaction-arrow"]).enter().append("svg:marker").attr("id", String).attr("viewBox", "0 -5 10 10").attr("refX", 15).attr("refY", -1.5).attr("markerWidth", 4).attr("markerHeight", 4).attr("orient", "auto").append("svg:path").attr("d", "M0,-5L10,0L0,5").style('stroke', line_stroke).style('fill', line_stroke);

		this.force = d3.layout.force().charge(-100).linkDistance(function(l,i) {
			if(l.fast) {
				return 75
			} else {
				return 150
			}
		}).size([this.getWidth(), this.getHeight()]).linkStrength(function(l,i) {
			if(l.fast) {
				return 0.7
			} else {
				return 0.4
			}
		}).gravity(0.01);

		// .chargeConstant(-30).springConstant(0.1).dragConstant(0.4).bound(true)
		// .springLength(50);

		this.force.nodes(allNodes).links(links).start();

		var colors, fills, strokes;
		fills = colors = {
			'reaction' : '#01c',
			'transient' : '#a00',
			'complex' : '#a00',
			'initial' : '#c00',
			'resting' : '#a00'
		};
		strokes = {
			'reaction': '#fff',
			'transient': '#fff',
			'complex': '#fff',
			'initial': '#fff',
			'resting': 'yellow',
		};
		
		// Links
		this.link = panel.selectAll("line.link").data(links).enter().append("line").attr("class", function(d) {
			var cls = ["link"]
			cls.push("source-" + d.source.name);
			cls.push("target-" + d.target.name);
			return cls.join(' ');
		}).style("stroke-width", 2).style('stroke', line_stroke).attr("marker-end", function(d) {
			return "url(#reaction-arrow)";
		});

		// Node Groups
		this.node = panel.selectAll("g.node").data(allNodes).enter().append('g').attr("class", "node")
		.classed('transient',function(d) {
			return d.transient
		})
		.classed('resting',function(d) {
			return d.resting
		})
		.call(this.force.drag).on('mouseover', function(d) {
			panel.selectAll("line.link").attr("opacity", 0.3);

			panel.selectAll("line.link.source-" + d.name).each(function(r, i) {
				panel.selectAll("line.link.target-" + r.target.name).attr("opacity", 0.8);
			}).attr("opacity", 1.0)

			panel.selectAll("line.link.target-" + d.name).each(function(r, i) {
				panel.selectAll("line.link.source-" + r.source.name).attr("opacity", 0.8);
			}).attr("opacity", 1.0)
		}).on('mouseout', function(d) {
			panel.selectAll("line.link").attr("opacity", 1.0)
		}).on('click', function(d) {
			if (d._type == 'complex')
				me.showWindow(d, this);
		});
		
		// Node circles
		var radius = function(d) {
			return d._type == 'complex' ? d.strands.length * 5 : 5
		};
		
		this.node.append("circle").attr("r", 5)
		//.attr("stroke",function() {return d3.rgb(this.attr('fill')).darker().toString(); })
		.style("fill", function(d) {
			if(d.initial) {
				return colors['initial']; 
			}
			return colors[d._type];
		}).attr('stroke-width',2).attr('stroke',function(d) {
			if(d._type == 'complex' && d.resting) {
				return strokes['resting']
			}
			return strokes[d._type];
		}).attr('r', radius)
		
		// Node text
		this.node.append('text').attr('class','node_label')
		//.style('stroke','#111')
		.style('fill','#111') //.style('text-shadow','1px 1px 2px #222')
		.style('text-shadow','2px 2px 2px white')
		//.attr('text-anchor','middle').attr('dy','.35em')
		.attr("dx", function(d) { return radius(d) + 5 }).attr("dy", ".35em")
		.text(function(d) { if(d._type == 'complex') { return d.name } else { return '' } }) 
		
		// Legend
		this.legend = panel.selectAll('g.legend').data([
			{name:'Resting Complex',type:'complex'},{name:'Transient Complex',type:'transient'},{name:'Reaction',type:'reaction'},{name:'Initial Complex',type:'initial'}]).enter().append('g').attr('class','legend')
		.attr('transform',function(d,i) {return "translate(15," + (20 * i + 15) + ")"});
		
		this.legend.append('circle').attr('fill',function(d) {return fills[d.type]}).attr('stroke',function(d) {return strokes[d.type]}).attr('r',8).attr('stroke-width',2)
		this.legend.append('text').style('fill','#111').text(function(d) { return d.name }).attr("dx", function(d) { return radius(d) + 5 }).attr("dy", ".35em")


		var me = this;
		this.force.on("tick", function() {
			me.link.attr("x1", function(d) {
				return d.source.x;
			}).attr("y1", function(d) {
				return d.source.y;
			}).attr("x2", function(d) {
				return d.target.x;
			}).attr("y2", function(d) {
				return d.target.y;
			});
			// me.link.attr("d", function(d) {
			// var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math.sqrt(dx * dx + dy * dy);
			// return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
			// });
			
			me.node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
			// me.node.attr("cx", function(d) {
				// return d.x;
			// }).attr("cy", function(d) {
				// return d.y;
			// });
// 			
			// me.node_label.attr("x", function(d) {
				// return d.x;
			// }).attr("y", function(d) {
				// return d.y;
			// });
		});
		// this.force.label.add(pv.Label).text(function(d, l) {
		// return d.name;
		// }).visible(function(d) {
		// return d._type == 'complex'
		// });

		// legend
		// var legend = panel.add(pv.Panel).left(10).top(10);
		// legend.data([{type: 'complex'},{type: 'reaction'}]);
		// legend.add(pv.Dot)
		// .left(10)
		// .top(function() {return this.index * 12 + 10})
		// .fillStyle(function(d) {return colors[d.type]})
		// .strokeStyle(null)
		// .anchor("right").add(pv.Label)
		// .text(function(d) {return d.type});

	},
	showWindow : function(d, node) {
		if (!this.complexWindows[d.name]) {
			this.previewPanels[d.name] = Ext.create('App.ui.nodal.StrandPreview', {
				adjacencyMode : 1,
				cls : 'simple-header',
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
				autoRender : true,
				title : "Complex: " + d.name,
			});

			var strands = d['strands'];
			this.complexWindows[d.name].show();
			this.previewPanels[d.name].setTitle(strands.join(" + "))
			this.previewPanels[d.name].setValue(d['dot-paren'], strands);
		} else {
			if(this.complexWindows[d.name].isVisible()) {
				this.complexWindows[d.name].hide();
			} else {
				this.complexWindows[d.name].show();
			}
		}
	}
});
