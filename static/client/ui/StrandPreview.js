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
	setValue : function(structure, strands) {
		this.data = structure;


		if(structure) {
			this.buildVis();
			// this.updateValue();
			//this.nodeLayout = DNA.generateAdjacency(structure,strands,true);
			// if(!this.built) {				// this.buildVis();			// } else {				// //this.force.reset();				// this.force.nodes(this.nodeLayout.nodes).links(this.nodeLayout.links);			// }
			// this.vis.render();
		} else {
			//this.force.reset();
			this.force.nodes([]).links([])
		}
		this.restart();
	},
	updateValue: function() {
		var structure = this.data, strandBreaks = structure.match(/\+/g);
		strandBreaks = !!strandBreaks ? strandBreaks.length : 0;
		var parsed_struct = DNA.parseDotParen(structure);
		var strands = _.range(1,strandBreaks+1);
		this.nodeLayout = DNA.generateAdjacency(structure, strands, true);
		this.pointLayout = DNA.layoutStructure(parsed_struct);
	},
	buildVis : function() {
		var panel = this.getCanvas();

		function range(arr) {
			return _.range(arr[0], arr[1] + 1)
		}
		this.updateValue();

		var layout = this.pointLayout;
		
		var w = this.getWidth(), h = this.getHeight();
		
		this.doAutoSize();
		
		var viewSizeX = w, viewSizeY = h;
		var fade_in_duration = this.fade_in_duration, panel_wait_duration = 1000, simultaneous_panels = 2;

		// panel.append("rect").attr("fill","#fff").attr("width",viewSizeX * viewCountX).attr("height",viewSizeY * viewCountY);
		//panel.call(d3.behavior.zoom());
		
		
		var nodes = this.nodeLayout.nodes;
		var links = this.nodeLayout.links;

		var l = nodes.length;
		nodes = _.map(nodes, function(n, i) {
			n.x = layout[i][0];
			n.y = layout[i][1];
			return n;
		});
		
		if(!this.force) {
			var force = this.force = d3.layout.force().charge(-50).linkDistance(viewSizeX / 100).size([viewSizeX, viewSizeY]).linkStrength(function(l, i) {
				// if (l._type == 'strand') {
				// return 0.6
				// } else if(l._type == 'desired') {
				// return 0.5
				// } else {
				// return 0
				// }
				return 1;
			}).gravity(0.1);
		} else {
			var force = this.force;
		}

		force.nodes(nodes).links(links)

		var line_stroke = '#aaa';
		strokes = {
			'pair' : '#ccc',
			'strand' : line_stroke,
			'undesired' : '#a00',
		}

		// Links
		this.link = panel.selectAll("line.link").data(links);
		this.link.exit().remove();
		this.link = this.link.enter().append("line").attr("class", function(d) {
			var cls = ["link"]
			cls.push("source-" + d.source.name);
			cls.push("target-" + d.target.name);
			return cls.join(' ');
		}).style("stroke-width", 2).style('stroke', function(d) {
			return line_stroke;
			//strokes[d._type]
		});

		// Node Groups
		this.node = panel.selectAll("g.node").data(nodes);
		this.node.exit().remove();
		this.node = this.node.enter().append('g').attr("class", "node").call(force.drag);

		// Node circle
		this.node.append("circle").attr("r", 5).style("fill", '#aaa').attr('stroke-width', 2).attr('stroke', '#fff')

		// Node text
		this.node.append('text').attr('class', 'node_label')
		.style('fill', '#111')
		.style('text-shadow', '2px 2px 2px white')
		.attr("dx", function(d) {
			return 5 + 5
		}).attr("dy", ".35em").text(function(d,i) {
			return i;
		});

		this.restart();

		// _.delay(function() {
			// force.start()
// 
			// fadeIn()
// 
			// force.on("tick", doTick);
// 
			// _.delay(function() {
				// force.stop();
			// }, panel_wait_duration * simultaneous_panels)
		// }, panel_wait_duration * strand_index)

	},
	restart: function() {
		var me = this;
		var doTick = function() {
			me.link.attr("x1", function(d) {
				return d.source.x;
			}).attr("y1", function(d) {
				return d.source.y;
			}).attr("x2", function(d) {
				return d.target.x;
			}).attr("y2", function(d) {
				return d.target.y;
			});

			me.node.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			});
		}
		function fadeIn() {
			me.getCanvas().style("opacity", 1e-6).transition().duration(me.fade_in_duration).style("opacity", 1);
		}

		this.force.start();
		doTick();
		me.force.stop();
		_.delay(function() { me.force.start(); },2000);	
		fadeIn();
	},
	initComponent : function() {

		this.callParent(arguments);
	},
})