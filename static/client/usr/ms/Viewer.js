/**
 * Allows viewing of results from the Multisubjective designer
 */
Ext.define('App.usr.ms.Viewer', {
	extend : 'App.ui.D3Panel',
	mixins : {
		app : 'App.ui.Application'
	},
	iconCls : 'ms-icon',
	editorType : 'MS',
	alias : 'widget.multisubjectiveview',
	requires : ['App.ui.SequenceThreader', 'App.ui.NupackMenu'],
	dockedItems : [{
		xtype : 'cite',
		cite : {
			authors : ['John P. Sadowski', 'Peng Yin'],
			title : 'Multisubjective: better nucleic acid design through fast identification and removal of undesired secondary structure',
			publication : 'Unpublished'
		},
	}],

	autoRender : false,
	constructor : function() {
		this.callParent(arguments);
		this.mixins.app.constructor.apply(this, arguments);
		this.on('afterrender', this.loadFile, this);
	},
	onLoad : function() {
		this.afterrender();
	},
	buildVis : function() {
		var data = JSON.parse(this.data);
		var panel = this.getCanvas();

		function range(arr) {
			return _.range(arr[0], arr[1] + 1)
		}

		/*
		 "immutable":[17,308,309, ... ]
		 */

		var immutable = _.reduce(data['immutable'], function(memo, i) {
			memo[i] = true;
			return memo;
		}, {});

		/*
		 "desired":[
		 {"pair":[17,71]},
		 {"pair":[18,70]},
		 ...
		 ]
		 */

		var desired = _.reduce(data['desired'], function(memo, p) {
			if (!memo[p.pair[1]])
				memo[p.pair[0]] = p.pair[1];
			return memo;
		}, {});

		/*
		 "undesired":[
		 {"pair":[4,15]},
		 {"pair":[5,14], "changed":{"5":"N"}},
		 {"pair":[193,211], "warning":{"type":-1, "pos":[193,211]},
		 ...
		 ]
		 */

		var undesired = _.reduce(data['undesired'], function(memo, p) {
			var o = _.clone(p);
			o.target = p.pair[1];
			if (!memo[p.pair[1]]) {
				memo[p.pair[0]] = o
			}
			return memo;
		}, {})
		/*
		 "prevented":[
		 {"range":[1,4], "identity":"G", "changed":{"4":"H"}},
		 {"range":[2,5], "identity":"A"},
		 ]
		 */

		var prevented = _.reduce(data['prevented'], function(memo, p) {
			_.each(range(p.range), function(i) {
				memo[i] = p;
			});
			return memo;
		}, {});

		/*
		 "basecollide":[
		 {"warning":{"type":-5, "pos":[2,0]},
		 {"warning":{"type":-5, "pos":[11,4]},
		 ]
		 */

		/*
		 "strands":[
		 { "name":"A1", "length":79, "range":[1,79] },
		 { "name":"A2", "length":79, "range":[80,158] },
		 ]
		 */

		var strands = [];

		_.each(data['strands'], function(s, i) {
			// i = strand index

			var nodes = [];
			var strand_links = [];
			var undesired_links = [];
			var desired_links = [];
			
			var offset = s.range[0];
			_.each(range(s.range), function(j, k) {
				// j = absolute base index
				// k = strand-wise base index

				var node = {
					abs_index : j - 1,
					strand_index : i,
					strand : s.name
				};

				// immutable
				if (immutable[j]) {
					node.immutable = true;
				}

				// prevented
				if (prevented[j]) {
					node.prevented = prevented[j].identity;
				}
				nodes.push(node);

				// desired
				if (desired[j]) {
					desired_links.push({
						source : j - offset,
						target : desired[j] - offset,
						_type : 'desired'
					});
				}

				// undesired
				if (undesired[j]) {
					var l = {
						source : j - offset,
						target : undesired[j].target - offset,
						_type : 'undesired'
					}
					if (undesired[j].changed) {
						l.changed = undesired[j].changed;
					}
					undesired_links.push(l);
				}

				if (k < (s.length - 1)) {
					strand_links.push({
						source : j - offset,
						target : j - offset + 1,
						_type : 'strand'
					})
				}
			});

			strands.push({
				name: s.name,
				nodes : nodes,
				strand_links : strand_links,
				undesired_links : undesired_links,
				desired_links : desired_links
			})
		});

		
	
		var w = this.getWidth(), h = this.getHeight();	
		var views = strands.length, viewSize = viewSizeX = viewSizeY = 400, viewCountX = Math.floor(w / viewSizeX), viewCountY = Math.floor(h / viewSizeY);
		var fade_in_duration = 1000, panel_wait_duration = 1000, simultaneous_panels = 2;
		
		
		panel.append("rect").attr("fill","#fff").attr("width",viewSizeX * viewCountX).attr("height",viewSizeY * viewCountY);
		panel.call(d3.behavior.zoom());
		
		this.strandViews = panel.selectAll("g.view").data(strands).enter().append('g').attr("class", "view").attr("transform", function(d,i) {
			return "translate(" + (i % viewCountX) * viewSize + "," + (Math.floor(i / viewCountX) * viewSize) + ")";
		}).attr('width',viewSizeX).attr('height',viewSizeY).each(function(d,strand_index) {
			var nodes = d.nodes, strand_links = d.strand_links, undesired_links = d.undesired_links, desired_links = d.desired_links;
			
			var l = nodes.length
			nodes = _.map(nodes,function(n,i) {
				theta = 2*Math.PI*(i/l)
				n.x = viewSizeX/2 + Math.cos(theta) * viewSizeX/2
				n.y = viewSizeY/2 + Math.sin(theta) * viewSizeY/2
				return n;
			});
			
			var links = desired_links.concat(strand_links).concat(undesired_links);
			
			var panel = d3.select(this);
			
			var force = d3.layout.force().charge(-50).linkDistance(viewSize / 100).size([viewSizeX,viewSizeY]).linkStrength(function(l, i) {
				if (l._type == 'strand') {
					return 0.6
				} else if(l._type == 'desired') {
					return 0.5
				} else {
					return 0
				}
			}).gravity(0.1);

			force.nodes(nodes).links(links)

			var line_stroke = '#aaa';
			strokes = {
				'desired':line_stroke,
				'strand':line_stroke,
				'undesired':'#a00',
			}
			
			// Links
			var link = panel.selectAll("line.link").data(links).enter().append("line").attr("class", function(d) {
				var cls = ["link"]
				cls.push("source-" + d.source.name);
				cls.push("target-" + d.target.name);
				return cls.join(' ');
			}).style("stroke-width", 2).style('stroke', function(d){
				return strokes[d._type]
			});

			// Node Groups
			var node = panel.selectAll("g.node").data(nodes).enter().append('g').attr("class", "node").call(force.drag);

			// Node circle

			node.append("circle").attr("r", 5).style("fill", '#aaa').attr('stroke-width', 2).attr('stroke', '#fff')

			// Node text
			node.append('text').attr('class', 'node_label')
			//.style('stroke','#111')
			.style('fill', '#111')//.style('text-shadow','1px 1px 2px #222')
			.style('text-shadow', '2px 2px 2px white')
			//.attr('text-anchor','middle').attr('dy','.35em')
			.attr("dx", function(d) {
				return 5 + 5
			}).attr("dy", ".35em").text(function(d) {
				return ''
			});
			
			var doTick = function() {
				link.attr("x1", function(d) {
					return d.source.x;
				}).attr("y1", function(d) {
					return d.source.y;
				}).attr("x2", function(d) {
					return d.target.x;
				}).attr("y2", function(d) {
					return d.target.y;
				});

				node.attr("transform", function(d) {
					return "translate(" + d.x + "," + d.y + ")";
				});
			}
			
			doTick();
			
			
			
			_.delay(function() {
				force.start()
				
				panel.style("opacity", 1e-6)
				  .transition()
				    .duration(fade_in_duration)
				    .style("opacity", 1);
				
				force.on("tick", doTick);
				
				_.delay(function() {
					force.stop();
				},panel_wait_duration * simultaneous_panels)
			},panel_wait_duration * strand_index)
		});
		
		this.strandViews.append('text').attr('class', 'node_label')
		//.style('stroke','#111')
		.style('fill', '#111')//.style('text-shadow','1px 1px 2px #222')
		.style('text-shadow', '2px 2px 2px white')
		//.attr('text-anchor','middle').attr('dy','.35em')
		.attr("dx", "2em").attr("dy", "1em").text(function(d) {
			return d.name
		});
	},
	initComponent : function() {

		this.callParent(arguments);
	},
})