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
		if(this.workspace.buildManager)
			this.workspace.buildManager.on('rebuild', this.onRebuild, this);

	},
	//	wtype: 'Workspace.objects.dna.NodePort',
	role : '',
	fill : '#fff',
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
				return polarity == 1 ? '+' : (polarity == -1 ? '-' : '0');
			}
		}));
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
