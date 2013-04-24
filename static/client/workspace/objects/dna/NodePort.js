////////////////////////////////////////////////////////////////////////////////////////////////

Ext.define('Workspace.objects.dna.NodePort', {
	requires : ['Workspace.objects.Ellipse', 'Workspace.ConnectionLabel'],
	constructor : function() {
		this.expose('dynaml', true, true, true, false);
		this.expose('role', true, true, true, false);
		this.expose('identity', true, true, true, false);
		this.expose('type', true, true, true, false);
		this.expose('polarity',true,true,true,false);
		this.expose('exposure',true,true,true,false);
		this.expose('computedPolarity', function() {
			var obj = this.getLibraryObject();
			return obj ? obj.getAbsolutePolarity() : 0;
		}, false, false, false);
		this.expose('footprint',function() {
			var obj = this.getLibraryObject();
			return obj ? _.map(obj.getSegments(),function footprint (seg) {
				return seg.getLength();
			}) : [];
		}, false, false, false);
		this.expose('segments',function() {
			var obj = this.getLibraryObject();
			return obj ? _.clone(obj.getSegments()) : [];
		}, false, false, false);
		
		if(this.workspace.buildManager)
			this.workspace.buildManager.on('rebuild', this.onRebuild, this);

	},
	//	wtype: 'Workspace.objects.dna.NodePort',
	role : '',
	fill : '#fff',
	iconCls: 'node-ports',
	strokeWidth : 2,
	isResizable : false,
	preventDragSelect : true,
	render : function() {
		this.addShim(Ext.create('Workspace.ConnectionLabel', {
			cls : 'workspace-label-plain-small workspace-label-port',
			offsets : [0, 4],
			property : 'computedPolarity',
			editable : false,
			format : function(polarity) {
				return polarity == 1 ? '+' : (polarity == -1 ? '–' : '±');
			}
		}));
		this.footprintShim = Ext.create('Workspace.Label', {
			cls : 'workspace-label-xsmall workspace-label-footprint',
			offsets : [0, 4],
			property : 'segments',
			editable : false,
			format : function(segments,obj) {
				// var pol = obj.get('computedPolarity');
				// return (pol==-1 ? "5'–" : "3'–") + _.map(segments,function footprint (seg) {
				// 	return (seg.role && seg.role == 'toehold') ? '<u>'+seg.getLength()+'</u>' : seg.getLength();
				// }).join(' ') + (pol==-1 ? "–3'" : "–5'");
				return _.map(segments,function footprint (seg) {
					return (seg.role && seg.role == 'toehold') ? '<u>'+seg.getLength()+'</u>' : seg.getLength();
				}).join(' ');
			}
		});
		this.addShim(this.footprintShim);
		this.hideFootprint();
		this.on('mouseover',this.showFootprint,this);
		this.on('mouseout',this.hideFootprint,this);
	},
	hideFootprint: function() {
		this.footprintShim.hide();
	},
	showFootprint: function () {
		this.footprintShim.show();	
	},
	highlightError: function() {
		if(!this.errorProxy) {
			this.errorProxy = this.getHighlightProxy();
			this.errorProxy.stroke = '#aa0000';
		}
		this.errorProxy.render(this.vectorElement);
		this.errorProxy.attachTo(this);
		this.errorProxy.show();
	},
	hideError: function() {
		if(this.errorProxy)
			this.errorProxy.hide();
	},
	onRebuild : function() {
		this.change('computedPolarity', this.get('computedPolarity'));
		this.change('footprint', this.get('footprint'));
		this.change('segments', this.get('segments'));
	},
	getRealtime : function(prop) {
		var obj = this.getLibraryObject();
		return obj ? obj[prop] : false;
	},
	getLibraryObject : function() {
		if(this.parent && this.getParent().isWType('Workspace.objects.dna.Node')) {
			var node = this.parent.getLibraryObject(), name = this.get('name');
			if(node) {
				var me = _.find(node.getDomains(), function(dom) {
					return dom.getName() == name;
				});
				return me;
			}
		}
		return null;
	},
}, function() {
	Workspace.objects.dna.NodePort.borrow(Workspace.objects.Ellipse, ['getRadiusX', 'getRadiusY', 'getCenterX', 'getCenterY']);
});
