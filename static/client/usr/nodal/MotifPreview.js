function MotifPreview() {
	var viewSizeX = 400, viewSizeY = 400;
	function chart(selection) {
		selection.each(function(data) {
			var r = viewSizeX * 0.25, cx = viewSizeX / 2, cy = viewSizeX / 2, lr = viewSizeX*0.05;
			var panel = d3.select(this);
			panel.selectAll('*').remove();

			var spec = data;

			panel.append('circle')
				.attr('cx',cx)
				.attr('cy',cy)
				.attr('r',r)
				.attr('fill','#fff')
				.attr('stroke', '#000')
				.attr('stroke-width',4);

			panel.append('text').text(spec.name)
				.attr('font-size','2em')
				.attr('text-anchor','middle')
				.attr('dy','.35em')
				.attr('x', cx)
				.attr('y', cy);

			var domains = _.filter(spec.getDomains ? spec.getDomains() : (spec.domains || []), function(domain) {
				return (domain.role != 'null') && (domain.role != 'structural');
			}), 
			theta_0 = Math.PI, dtheta = 2 * Math.PI / domains.length;
			domains = _.map(domains,function(dom,i) {
				var port_r = 4,	theta = theta_0 + i * dtheta, rotation = theta * 180/Math.PI;
				if(dom.role == 'input') {
					rotation+=30;
				}
					return {
						cx : cx + r * Math.cos(theta),
						cy : cy + r * Math.sin(theta),
						x : cx + r * Math.cos(theta) - port_r,
						y : cy + r * Math.sin(theta) - port_r,
						lx : lr * Math.cos(theta),
						ly : lr * Math.sin(theta),
						//transform : 'r' + ((theta + (dom.role == 'input' ? 32 : 0)) * 180 / Math.PI),
						// rx: port_r,
						// ry: port_r,
						width : 2 * port_r,
						height : 2 * port_r,
						rotate: rotation,
						fill : '#fff',
						stroke : App.dynamic.Compiler.getColor(dom),
						role: dom.role,
						polarity: DNA.parsePolarity(dom.polarity),
						name: dom.name,
					};
			})

			var domainSel = panel.selectAll('g.port')
				.data(domains)
				.enter().append('g').attr('class','port')
				.attr('transform',function(d) { return "translate(" + d.x + "," + d.y + ") scale(3,3)"; });

			domainSel.append('path')
				.attr('stroke',function(d) { return d.stroke; })
				.attr('fill',function(d) { return d.fill; })
				.attr('transform',function(d) { return "rotate(" + d.rotate + ")"; })
				.attr('d',d3.svg.symbol().type(function(d) { 
					switch(d.role) {
						case 'input': return 'triangle-up';
						case 'bridge': return 'square';
						case 'output': default: return 'circle';
					}
				}));
			domainSel.append('text')
				.text(function (d) {
					var x = d.polarity;
					if(x ==-1) { return '–' }
					if(x == 1) { return '+' }
					else { return '±' } 
				})
				.attr('dy','.35em')
				.attr('text-anchor','middle');
			domainSel.append('text')
				.text(function (d) {
					return d.name;
				})
				.attr('transform',function(d) { return "translate("+d.lx+","+d.ly+")"; })
				.attr('dy','.35em')
				.attr('text-anchor','middle');

			// var shapes = [];
			// _.each(domains, function(dom, i) {
				
			// 	if(dom.role == 'input') {
			// 		var o = panel.append(''); //paper.triangle(attr.cx, attr.cy, port_r, port_r);
			// 		o.attr(attr);
			// 	} else if(dom.role == 'bridge') {
			// 		var o = paper.square(attr.cx, attr.cy, port_r, port_r);
			// 		o.attr(attr);
			// 	} else {
			// 		attr.type = 'circle';
			// 		attr.r = port_r;
			// 		shapes.push(attr);
			// 	}
			// });
			// paper.add(shapes);
		});
	}

	chart.width = function(_) {
		if (!arguments.length) return viewSizeX;
		viewSizeX = _;
		return chart;
	};

	chart.height = function(_) {
		if (!arguments.length) return viewSizeY;
		viewSizeY = _;
		return chart;
	};

	return chart;
}

Ext.define('App.usr.nodal.MotifPreview',{
	extend : 'App.ui.D3Panel',
	alias: 'widget.motifpreview',
	initComponent: function () {
		this.bbar = [{
			iconCls: 'svg',
			handler: this.toSVG,
			scope: this,
		}];
		this.callParent(arguments);
	},
	setValue : function(node) {
		this.data = node;
		this.buildVis();
	},
	buildVis : function() {
		var panel = this.getCanvas();
		panel.selectAll().remove();
		this.chart = MotifPreview(panel).width(this.getWidth()).height(this.getHeight());
		this.preview = this.chart(panel.data([this.data]));
	},
	toSVG: function(btn) {
		// if(!this.svgStyles) {
		// 	Ext.Ajax.request({
		// 	    url: 'styles/strand-preview.css',
		// 	    success: function(response){
		// 	        this.svgStyles = response.responseText;
		// 	        this.doDisplaySVGWindow()
		// 	    },
		// 	    scope: this,
		// 	});
		// } else {
		// 	this.doDisplaySVGWindow();
		// }
		this.doDisplaySVGWindow();
	},
	doDisplaySVGWindow: function() {
		var value = '<?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'+this.getCanvasMarkup();

		// Sorry Cthulhu... http://www.codinghorror.com/blog/2009/11/parsing-html-the-cthulhu-way.html
		value = value.replace(/<svg(\b[^>]*)>/g,'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" $1>'); //'<style type="text/css"><![CDATA[' + this.svgStyles + ']]></style>');

		this.svgWindow = Ext.create('App.ui.StrandPreviewTextWindow',{
			title: 'SVG',
		});
		this.svgWindow.show();
		this.svgWindow.setValue(value);
		//this.showWindow('SVG',value,btn);
	},
})