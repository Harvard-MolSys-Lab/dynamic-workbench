Ext.define('App.ui.EnumViewer', {
	extend : 'App.ui.D3Panel',
	requires: ['App.ui.nodal.StrandPreview'],
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
		var initial_complexes = _.reduce(data['initial_complexes'], function(memo,c) {
			memo[c.name] = true;
			return memo;
		}, {});
		
		
		var reactions;
		var restingStates;
		
		
		
		// TEMPORARY
		if(data['condensed_reactions']) {
			delete data['condensed_reactions'];
		}
		
		if(data['condensed_reactions']) {
			reactions = data['condensed_reactions'];
			var l = 0;
			var restingStates = _.map(data['resting_states'],function(x) {
				
			}) 
		} else {
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
		
		}
		
		var nodeData = _.map(complexes, function(x, i) {
			x._type = 'complex';
			if(!!initial_complexes[x.name]) {
				x.initial = true;
			}
			x._index = i;
			return x
		});
		var nodeMap = _.reduce(nodeData, function(memo, x, i) {
			memo[x.name] = x;
			return memo;
		}, {});
		
		
		
		reactions = _.map(reactions, function(x, i) {
			x._type = 'reaction';
			x.name = 'reaction_' + i;
			x._index = i + nodeData.length;
			x.fast = !(x.reactants.length > 1);
			x.slow = !x.fast;
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


		var dist = 50;
		
		this.force = d3.layout.force().charge(-100).linkDistance(function(l,i) {
			if(!!l.source.fast || !!l.target.fast) {
				return 0.4*dist
			} else {
				return 0.7*dist
			}
		}).size([this.getWidth(), this.getHeight()]).linkStrength(function(l,i) {
			if(!!l.source.fast || !!l.target.fast) {
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
			'reaction' : '',
			'reaction-fast' : '#01c',
			'reaction-slow' : '#a00',
			'transient' : '#0a0',
			'complex' : 'green',
			'resting' : 'green',
			'initial' : 'green',
		};
		strokes = {
			'reaction-fast': '#fff',
			'reaction-slow': '#fff',
			'transient': '#fff',
			'complex': '#fff',
			'initial': 'yellow',
			'resting': 'white',
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
			if(d.resting) {
				return colors['resting']; 
			}
			if(d._type == 'reaction') {
				if(!!d.fast) {				
					return colors['reaction-fast'];
				} else {
					return colors['reaction-slow'];
				}
			}
			return colors[d._type];
		}).attr('stroke-width',2).attr('stroke',function(d) {
			if(d._type == 'complex' && d.initial) {
				return strokes['initial']
			}
			return strokes[d._type];
		}).attr('r', radius)
		
		// Node text
		this.node.append('text').attr('class','node_label')
		//.style('stroke','#111')
		.style('fill','#111') //.style('text-shadow','1px 1px 2px #222')
		.style('text-shadow','1px 1px 2px white')
		//.attr('text-anchor','middle').attr('dy','.35em')
		.attr("dx", function(d) { return radius(d) + 5 }).attr("dy", ".35em")
		.text(function(d) { if(d._type == 'complex') { return d.name } else { return '' } }) 
		
		// Legend
		this.legend = panel.selectAll('g.legend').data([
			{name:'Resting Complex',type:'resting'},{name:'Transient Complex',type:'transient'},
			{name:'Fast (unimolecular) Reaction',type:'reaction-fast'},{name:'Slow (bimolecular) Reaction',type:'reaction-slow'},
			{name:'Initial Complex',type:'initial'}]).enter().append('g').attr('class','legend')
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

		});

	},
	showWindow : function(d, node) {
		if (!this.complexWindows[d.name]) {
			var strands = d['strands'];

			this.previewPanels[d.name] = Ext.create('App.ui.nodal.StrandPreview', {
				adjacencyMode : 1,
				cls : 'simple-header',
				title: strands.join(" + "),
				autoRender : true,
				value: '',
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
				resizable: true,
				autoRender : true,
			});

			this.complexWindows[d.name].show();
			this.previewPanels[d.name].setTitle(strands.join(" + "))
			this.previewPanels[d.name].setValue(!!d['dot-paren-full'] ? d['dot-paren-full'] : d['dot-paren'], strands);
		} else {
			if(this.complexWindows[d.name].isVisible()) {
				this.complexWindows[d.name].hide();
			} else {
				this.complexWindows[d.name].show();
			}
		}
	}
});
