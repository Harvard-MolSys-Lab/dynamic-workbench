/**
 * Allows motifs to be added to workspace by drag and drop
 */
Ext.define('App.ui.MotifPalette', {
	extend:'Ext.panel.Panel',
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				xtype:'dataview',
				store: Workspace.objects.dna.motifStore,
				tpl: '<tpl for=".">'+
				'<div class="motif-template">'+
				//'<img src="images/motifs/{number}.gif" />'+
				'</div>'+
				'</tpl><div class="x-clear" />',
				itemSelector: 'div.motif-template',
				overItemClass: 'x-view-over',
				trackOver: true,
				itemId: 'view'
			}]
		});
		this.callParent(arguments);
		
		/**
		 * @property {Ext.view.View}
		 */
		this.view = this.getComponent('view');
		
		this.view.on('refresh',function() {
			this.drawMotifs();
		},this)
		
		this.view.on('render', function(v) {
			/**
			 * @property {Ext.dd.DragZone}
			 */
			this.dragZone = new Ext.dd.DragZone(v.getEl(), {

				// On receipt of a mousedown event, see if it is within a DataView node.
				// Return a drag data object if so.
				getDragData: function(e) {

					// Use the DataView's own itemSelector (a mandatory property) to
					// test if the mousedown is within one of the DataView's nodes.
					var sourceEl = e.getTarget(v.itemSelector, 10);

					// If the mousedown is within a DataView node, clone the node to produce
					// a ddel element for use by the drag proxy. Also add application data
					// to the returned data object.
					if (sourceEl) {
						d = sourceEl.cloneNode(true);
						d.id = Ext.id();
						return {
							ddel: d,
							sourceEl: sourceEl,
							repairXY: Ext.fly(sourceEl).getXY(),
							sourceStore: v.store,
							draggedRecord: v.getRecord(sourceEl),
							mimeType: 'ext/motif'
						}
					}
				},
				// Provide coordinates for the proxy to slide back to on failed drag.
				// This is the original XY coordinates of the draggable element captured
				// in the getDragData method.
				getRepairXY: function() {
					return this.dragData.repairXY;
				}
			});
		},this);
	},
	drawMotifs: function() {
		var store = this.view.getStore(), view = this.view;
		if(!this.papers) { this.papers = {}; }
		_.each(store.getRange(),function(rec) {
			var node = Ext.get(view.getNode(rec)),
				id = node.id,
				paper = this.papers[id] || (this.papers[id] = Raphael(node.dom, node.getWidth(), node.getHeight()));
			this.drawMotif(paper,rec.get('spec'));
		},this);
	},
	drawMotif: function(paper, spec) {
		var r = paper.width*0.35,
			cx = paper.width/2,
			cy = paper.height/2;
		paper.clear();
		paper.add([{
			type: 'circle',
			cx: cx,
			cy: cy,
			r: r,
			rx: r, 
			ry: r,
			stroke: '#000',
			'stroke-width': 2.5,
		}]);
		var domains = _.filter(spec.getDomains(),function(domain) { return (domain.role != 'null') && (domain.role != 'structural') }),
			theta_0 = Math.PI,
			dtheta = 2*Math.PI / domains.length;
		var shapes = [];
		_.each(domains,function(dom, i) {
			var port_r = 4;
			var theta = theta_0 + i * dtheta
			var attr = {
				cx: cx + r*Math.cos(theta),
				cy: cy + r*Math.sin(theta),
				x: cx + r*Math.cos(theta) - port_r,
				y: cy + r*Math.sin(theta) - port_r,
				transform: 'r'+((theta + (dom.role == 'input' ? 32 : 0))* 180/Math.PI),
				// rx: port_r, 
				// ry: port_r,
				width: 2*port_r, 
				height: 2*port_r,
				fill: '#fff',
				stroke: App.dynamic.Compiler.getColor(dom),
				'stroke-width': 2,
			};
			if(dom.role == 'input') {
				var o = paper.triangle(attr.cx,attr.cy,port_r,port_r);
				o.attr(attr);
			} else if(dom.role == 'bridge') {
				var o = paper.square(attr.cx,attr.cy,port_r,port_r);
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
