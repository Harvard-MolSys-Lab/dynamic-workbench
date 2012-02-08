Ext.define('App.ui.nodal.StrandPreview', {
	extend : 'Ext.panel.Panel',
	viewBox : true,
	render : function() {
		this.on('afterrender', function() {

			this.paper = Raphael(this.body.dom, this.getWidth(), this.getHeight());
			this.on('bodyresize', function(c, w, h) {
				this.paper.setSize(this.getWidth(), this.getHeight());
			}, this);
		}, this);
		this.callParent(arguments);
	},
	setValue : function(motif) {

		var x = 0, y = 0, H = this.getWidth(), V = this.getHeight();
		var SEGLEN = 7;
		var sqrt = Math.sqrt;
		var polarity = 1;

		var motifSpec = Workspace.objects.dna.Motifs[motif];
		var paths = [];

		if(motifSpec) {
			var ports = {
				init : (motifSpec.indexOf('init') != -1),
				input : (motifSpec.indexOf('input') != -1),
				pink : (motifSpec.indexOf('pink') != -1),
				blue : (motifSpec.indexOf('blue') != -1),
				green : (motifSpec.indexOf('green') != -1),
				purple : (motifSpec.indexOf('purple') != -1),
			};

			if(ports.init) {
				paths.push({
					type : 'path',
					path : Ext.String.format("M {0} {1} L {2} {3}", x + H * .15, y + V * .45, x + H * .6, y + V * .45),
					stroke : Workspace.objects.dna.Ports.init.stroke,
					'stroke-width' : 2,
					'arrow-start' : (polarity == -1 ? 'classic-medium-long' : 'none'),
					'arrow-end' : (polarity == 1 ? 'classic-medium-long' : 'none'),
				});
			} else {

				// yellow top line; rgb(241,139,17)
				if(ports.input) {
					paths.push({
						type : 'path',
						path : Ext.String.format("M {0} {1} L {2} {3}", x + H * .15, y + V * .45, x + H * .6, y + V * .45),
						stroke : Workspace.objects.dna.Ports.input.stroke,
						'stroke-width' : 2,
						'arrow-start' : (polarity == -1 ? 'classic-medium-long' : 'none'),
					});
				}

				// pink loop; rgb(224,0,109)
				if(ports.pink) {
					paths.push({
						type : 'path',
						path : ports.blue ? (Ext.String.format("M {0} {1} a {2} {3} 0 0 1 {4} {5}", x + H * .6, y + V * .45, H * .1, V * .25, H * .1 * sqrt(.99), V * (.05 / 2 - .25))) : (Ext.String.format("M {0} {1} a {2} {3} 0 1 1 {4} {5}", x + H * .6, y + V * .45, H * .05, V * .25, 0, V * .05)),
						stroke : Workspace.objects.dna.Ports.pink.stroke,
						'stroke-width' : 2,
					});
				}

				// blue loop and bottom line; rgb(69,181,215)
				if(ports.blue) {
					paths.push({
						type : 'path',
						path : Ext.String.format("M {0} {1} a {2} {3} 0 1 1 {4} {5} L {6} {7}", ports.pink ? (x + H * .6 + H * .1 * sqrt(.99)) : (x + H * .6), ports.pink ? (y + V * (.45 + .05 / 2 - .25)) : (y + V * .45), ports.pink ? (H * .1) : (H * .07), ports.pink ? (V * .25) : (V * .25), ports.pink ? (-H * .1 * sqrt(.99)) : 0, ports.pink ? (V * (.25 + .05 / 2)) : (V * .05), x + H * .45, y + V * .5),
						stroke : Workspace.objects.dna.Ports.blue.stroke,
						'stroke-width' : 2,
						'arrow-end' : (polarity == 1 && !ports.green && !ports.purple ? 'classic-medium-long' : 'none'),
					});
				}

				if(ports.purple) {
					paths.push({
						type : 'path',
						path : Ext.String.format("M {0} {1} L {2} {3}", x + H * .45, y + V * .5, x + H * .3, y + V * .5),
						stroke : Workspace.objects.dna.Ports.purple.stroke,
						'stroke-width' : 2,
						'arrow-end' : (polarity == 1 && !ports.green ? 'classic-medium-long' : 'none'),
					});
				}

				if(ports.green) {
					paths.push({
						type : 'path',
						path : Ext.String.format("M {0} {1} L {2} {3} L {4} {5}", x + H * .45, y + V * .5, x + H * .3, y + V * .5, x + H * .15, y + V * .8),
						stroke : Workspace.objects.dna.Ports.green.stroke,
						'stroke-width' : 2,
						'arrow-end' : (polarity == 1 && !ports.purple ? 'classic-medium-long' : 'none'),
					});
				}

				if(!ports.blue && !ports.purple && !ports.green) {
					paths.push({
						type : 'path',
						path : Ext.String.format("M {0} {1} L {2} {3}", x + H * .3, y + V * .5, x + H * .6, y + V * .5),
						stroke : '#000',
						'stroke-width' : 2,
						'arrow-end' : (polarity == 1 ? 'classic-medium-long' : 'none'),
					});

				}

			}

		}

		// Draw basepair lines
		// for(var i=0; i<SEGLEN; i++){
		// paths.push({
		// type: 'path',
		// path: Ext.String.format("M {0} {1} L {2} {3}",x+H*.45+H*.15*i/SEGLEN,y+V*.45,x+H*.45+H*.15*i/SEGLEN,y+V*.5)
		// })
		// }

		this.paper.clear();

		// this.surface.add({
		// type : 'circle',
		// radius : 10,
		// fill : '#0f0',
		// x : 50,
		// y : 50,
		// });

		this.paper.add(paths);
	},
})