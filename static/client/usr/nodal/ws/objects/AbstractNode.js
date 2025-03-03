
/**
 * Represents a single node in a {@link App.usr.nodal.Canvas nodal system}
 */
Ext.define('App.usr.nodal.ws.objects.AbstractNode', {
	extend: 'Workspace.objects.IdeaObject',
	wtype: 'App.usr.nodal.ws.objects.AbstractNode',
	layout: 'App.usr.nodal.ws.objects.NodeLayout',
	requires: ['Workspace.objects.Ellipse','App.usr.nodal.ws.objects.NodeLayout','App.usr.nodal.ws.objects.InputPort','App.usr.nodal.ws.objects.OutputPort','App.usr.nodal.ws.objects.BridgePort','App.usr.nodal.ws.objects.Motifs','Workspace.ConnectionLabel'],
	statics: {
		nextName: function() {
			var i = -1, s='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			return function() {
				i++;
				var r = '', n = i;
				do {
					r = r + s.charAt(n % 26);
					n -= 25;
				} while(n>0)
				return r;
			};
		}()
	},
	motif: '0',
	name: false,
	shape: 'ellipse',
	width: 30,
	height: 30,
	strokeWidth: 2.5,
	autoFill: false,
	fill: '#ffffff',
	stroke: '#000000',
	theta: 180,
	destroyChildren: true,
	isResizable: false,
	polarity: 0,
	portCounter: -1,
	constructor: function() {
		this.shimConfig = {
			cls: 'workspace-label-callout',
			offsets: [0,-5]
		};
		//App.usr.nodal.ws.objects.Node.superclass.constructor.apply(this,arguments);
		this.callParent(arguments);
		
		this.expose('polarity',true,true,true,false);
		this.expose('theta',true,true,true,false);
		
		if(this.workspace.buildManager)
			this.workspace.buildManager.on('rebuild',this.onRebuild,this);

		if(!this.name) {
			this.name = this.nextName(); //App.usr.nodal.ws.objects.Node.nextName();
		}
		this.on('change:theta', function() {
			this.layout.doLayout();
		},this);
	},
	render: function() {
		this.arguments = [this.get('x') + this.getRadiusX(), this.get('y') + this.getRadiusY(), this.getRadiusX(), this.getRadiusY()];
		//Workspace.objects.Ellipse.superclass.render.call(this);
		//debugger;
		this.callParent(arguments);
		this.toBack();
		// this.addShim(new Workspace.ConnectionLabel({
		// 	cls: 'workspace-label-plain workspace-label-small',
		// 	offsets:[0,2],
		// 	//offsets: [11,26],
		// 	property: 'motif',
		// 	editable: false
		// }));
		this.layout.doFirstLayout();

	},
	/**
	 * Draws a {@link Workspace.Proxy proxy} around this element to indicate
	 * it caused a DyNAML error.
	 */
	highlightError: function() {
		if(!this.errorProxy) {
			/**
			 * @property {Workspace.Proxy} errorProxy
			 * Proxy drawn to indicate this element caused a DyNAML error
			 * during real-time recalculation.
			 */
			this.errorProxy = this.getHighlightProxy();
			this.errorProxy.stroke = '#aa0000';
		}
		this.errorProxy.render(this.vectorElement);
		this.errorProxy.attachTo(this);
		this.errorProxy.show();
	},
	/**
	 * Hides the #errorProxy drawn with #highlightErrror.
	 */
	hideError: function() {
		if(this.errorProxy)
			this.errorProxy.hide();
	},
	// addChild: function() {
		// this.callParent(arguments);
		// this.layout.doLayout();
	// },
	nextPortName: function() {
		var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var nextName;
		var children = _.filter(this.getChidren,function(child) {
			return child.isWType(['App.usr.nodal.ws.objects.InputPort','App.usr.nodal.ws.objects.OutputPort','App.usr.nodal.ws.objects.BridgePort']);
		})
		do {
			this.portCounter++;
			nextName = s[this.portCounter];
		} while(!!_.find(children,function(obj) { return obj.get('name') == nextName; }));
		return nextName;
	},
	
	/**
	 * @abstract
	 * Gets the next name for this type of object from the 
	 * {@link App.usr.nodal.ws.objects.BuildManager buildManager}.
	 * @returns {String} name
	 */
	nextName: function() {
		
	},
	/**
	 * @abstract
	 * Action to perform upon real-time 
	 * {@link App.usr.nodal.ws.objects.BuildManager#rebuild rebuild}.
	 * This should fire #change events for any properties which depend on
	 * real-time recalculation
	 */
	onRebuild: function() {

	},
	/**
	 * @abstract
	 * Gets a property of this object that is recalculated in real-time; 
	 * override depending on implementation to get this from the 
	 * {@link App.usr.nodal.ws.objects.BuildManager buildManager}.
	 * @param {String} property
	 * @returns {Mixed} value
	 */
	getRealtime: function(prop) {
		
	},
	/**
	 * @abstract
	 * Gets the object in the most recent
	 * {@link App.dynamic.Library compiled DyNAMiC Library}
	 * which represents this object. Override depending on implementation
	 * to get this from the 
	 * {@link App.usr.nodal.ws.objects.BuildManager buildManager}.
	 * @returns {App.dynamic.Node/App.dynamic.Motif/Mixed} libraryObject
	 */
	getLibraryObject: function() { 

	},
	destroy: function() {
		if(this.errorProxy) {
			this.errorProxy.destroy();
			delete this.errorProxy;
		}
		this.callParent(arguments);
	}
}, function() {
	App.usr.nodal.ws.objects.AbstractNode.borrow(Workspace.objects.Ellipse,['getRadiusX','getRadiusY','getCenterX','getCenterY','updateX','updateY','updateWidth','updateHeight']);
	Workspace.reg('App.usr.nodal.ws.objects.AbstractNode',App.usr.nodal.ws.objects.AbstractNode);
	Workspace.regAlias('Workspace.objects.dna.AbstractNode','App.usr.nodal.ws.objects.AbstractNode');


});