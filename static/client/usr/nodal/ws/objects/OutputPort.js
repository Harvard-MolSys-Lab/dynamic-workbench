////////////////////////////////////////////////////////////////////////////////////////////////
Ext.define('App.usr.nodal.ws.objects.OutputPort', {
	extend: 'Workspace.objects.Ellipse',
	mixins: {
		port: 'App.usr.nodal.ws.objects.NodePort'
	},
	wtype: 'App.usr.nodal.ws.objects.OutputPort',
	shape: 'ellipse',
	stroke: '#33ccff',
	strokeWidth: 2,
	name: 'Output Port',
	role: 'output',
	width: 8,
	height: 8,
	polarity: 1,
	rotation: 0,
	isResizable: false,
	preventRotate: true,
	constructor: function() {
		this.callParent(arguments);
		this.mixins.port.constructor.apply(this,arguments);
		//App.usr.nodal.ws.objects.OutputPort.superclass.constructor.apply(this,arguments);
		this.expose('complementarity',true,true,true,false);
	},
	initialize: function() {
		if(this.complementarity) {
			this.set('complementarity', Workspace.Components.realize(this.complementarity));
		}
		//this.set('rotation',0)
		this.callParent(arguments);
	},
	getTransform: function() {
		return '';
	},
	render: function() {
		this.callParent(arguments);
		this.mixins.port.render.apply(this,arguments);
		Workspace.objects.VectorObject.prototype.updateAttr.call(this,'rotation',0);
	},
	updateAttr: function(attrName, value) {
		if(attrName!='rotation') {
			return this.callParent(arguments);
		} else {
			return this.callParent([attrName,0]);
		}
	},
	attributes: function(attrArray) {
		if(!attrArray) {
			attrArray = _.clone(App.usr.nodal.ws.objects.OutputPort.attrArray);
		} else {
			attrArray = _.filter(attrArray,function(attr) { return attr != 'rotation'});
		}
		return this.callParent([attrArray]);
	},
}, function() {
	App.usr.nodal.ws.objects.OutputPort.attrArray = _.filter(Workspace.objects.VectorObject.attrArray,function(attr) { return attr != 'rotation'});
	Workspace.reg('App.usr.nodal.ws.objects.OutputPort',App.usr.nodal.ws.objects.OutputPort);
	Workspace.regAlias('Workspace.objects.dna.OutputPort','App.usr.nodal.ws.objects.OutputPort');
});