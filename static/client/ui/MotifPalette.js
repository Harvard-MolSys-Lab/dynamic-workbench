/**
 * Allows motifs to be added to workspace by drag and drop
 */
Ext.define('App.ui.MotifPalette', {
	extend : 'App.ui.Palette',
	requires : ['Workspace.objects.dna.Motifs'],
	tpl : '<tpl for=".">' + '<div class="motif-template">' +
	//'<img src="images/motifs/{number}.gif" />'+
	'</div>' + '</tpl><div class="x-clear" />',
	itemSelector : 'div.motif-template',
	mimeType : 'ext/motif',
	overflow: 'auto',
	constructor : function(config) {
		if(!config.store) {
			//Ext.apply(this,{
			Ext.apply(config, {
				store : Workspace.objects.dna.motifStore,
			});
		}
		this.callParent(arguments);
		this.view.on('itemupdate',this.redrawMotif,this);
	},
	onRefresh : function() {
		this.drawMotifs();
	},
	drawMotifs : function() {
		var store = this.view.getStore(), view = this.view;
		if(!this.papers) {
			this.papers = {};
		}
		_.each(store.getRange(), function(rec) {
			var node = view.getNode(rec);
			this.redrawMotif(rec, null, node);
		}, this);
	},
	redrawMotif : function(rec, index, node) {
		node = Ext.get(node);
		var id = node.id, 
			/* if index != null, that means this is coming from Ext's itemupdate event, so we definitely need to generate a new paper, 
			 * since Ext just deleted it.
			 */
			paper = (this.papers[id] && index==null) || 
			(this.papers[id] = Raphael(node.dom, node.getWidth(), node.getHeight()));
		this.drawMotif(paper, rec.get('spec'));
	},
	drawMotif : function(paper, spec) {
		var r = paper.width * 0.35, cx = paper.width / 2, cy = paper.height / 2;
		paper.clear();
		paper.add([{
			type : 'circle',
			cx : cx,
			cy : cy,
			r : r,
			rx : r,
			ry : r,
			stroke : '#000',
			'stroke-width' : 2.5,
		},{
			type: 'text',
			text: spec.name,
			'text-anchor':'middle',
			x: cx,
			y: cy,
		}]);
		var domains = _.filter(spec.getDomains(), function(domain) {
			return (domain.role != 'null') && (domain.role != 'structural')
		}), theta_0 = Math.PI, dtheta = 2 * Math.PI / domains.length;
		var shapes = [];
		_.each(domains, function(dom, i) {
			var port_r = 4;
			var theta = theta_0 + i * dtheta
			var attr = {
				cx : cx + r * Math.cos(theta),
				cy : cy + r * Math.sin(theta),
				x : cx + r * Math.cos(theta) - port_r,
				y : cy + r * Math.sin(theta) - port_r,
				transform : 'r' + ((theta + (dom.role == 'input' ? 32 : 0)) * 180 / Math.PI),
				// rx: port_r,
				// ry: port_r,
				width : 2 * port_r,
				height : 2 * port_r,
				fill : '#fff',
				stroke : App.dynamic.Compiler.getColor(dom),
				'stroke-width' : 2,
			};
			if(dom.role == 'input') {
				var o = paper.triangle(attr.cx, attr.cy, port_r, port_r);
				o.attr(attr);
			} else if(dom.role == 'bridge') {
				var o = paper.square(attr.cx, attr.cy, port_r, port_r);
				o.attr(attr);
			} else {
				attr.type = 'circle';
				attr.r = port_r;
				shapes.push(attr);
			}
		});
		paper.add(shapes);
	}
})