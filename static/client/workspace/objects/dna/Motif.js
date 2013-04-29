
/**
 * Represents a single motif in a {@link App.usr.nodal.Canvas nodal system}
 */
Ext.define('Workspace.objects.dna.Motif', {
	extend: 'Workspace.objects.dna.AbstractNode',
	wtype: 'Workspace.objects.dna.Motif',
	layout: 'Workspace.objects.dna.MotifLayout',
	name: false,
	proxifyOnMove : true,
	polarity: 0,
	stroke: '#888',
	requires: ['Workspace.objects.dna.MotifLayout',],
	constructor: function() {
		this.callParent(arguments);
		this.expose('nodes',function() {
			return _.filter(this.getChildren(),function(child) { return child.hasWType('Workspace.objects.dna.Node')});
		},false,false,false);
		
		if(this.workspace.buildManager)
			this.workspace.buildManager.on('rebuild',this.onRebuild,this);
		this.expose('dynaml',true,true,true,false);

		this.on('change:dynaml',this.syncDynaml,this);
	},
	render: function() {
		this.callParent(arguments);
		// this.addShim(new Workspace.ConnectionLabel({
			// cls: 'workspace-label-plain workspace-label-small',
			// offsets:[0,2],
			// //offsets: [11,26],
			// property: 'name',
			// editable: true
		// }));

	},
	syncDynaml: function() {
		var dynaml = this.get('dynaml');
		var groups;
		if(dynaml) {
			try {
				if(_.isString(dynaml)) {
					dynaml = JSON.parse(dynaml);
				}
			} catch(e) {
				return console.log(e);
			}
			dynaml.library = App.dynamic.Library.dummy();
			var dynamlMotif = new App.dynamic.Motif(dynaml);
			
			var domainGroups = _.groupBy(dynamlMotif.getDomains(),'role');
			var childGroups = _.groupBy(this.getChildren(),'wtype');
			
			var ports = {
				input: _.groupBy(childGroups['Workspace.objects.dna.InputPort'] || [],function(p) {return p.get('name')}),
				output: _.groupBy(childGroups['Workspace.objects.dna.OutputPort'] || [],function(p) {return p.get('name')}),
				bridge: _.groupBy(childGroups['Workspace.objects.dna.BridgePort'] || [],function(p) {return p.get('name')}),
			};
			
			var portsToRemove = [];
			var portsToAdd = [];
			
			
			
			// for each `role` of domain in the dynaml
			_.each(domainGroups,function(domainList,role) {
				
				// if role is 'input', 'output', or 'bridge' (skip 'structural')
				if(ports[role]) {
					
					// for each domain in the dynaml with that role
					_.each(domainList,function(domain,name) {
						
						// if there's already a port of that role/name, great.
						if(ports[role][name]) {
							
							// we'll remove it from the list of ports we know about; ports
							// remaining after this hulaballoo will be removed
							delete ports[role][domain.getName()];
						} else {
							
							// if there's no port of that name, make one from the dynaml
							portsToAdd.push(domain)
						}
					});
					
					portsToRemove = _.chain(ports[role]).values().flatten().concat(portsToRemove).value() //.concat(_.flatten(_.values(ports[role])));
				}
			});
			
			this.workspace.deleteObjects(portsToRemove);
			this.suspendLayout = true;
			_.each(portsToAdd,function(port) {
				port = this.makePort(port);
				if(!!port)
					this.addChild(port);
			},this)
			this.suspendLayout = false;	
			this.doLayout();
		}
		
	},
	makePort: function (dom) {
		var port = _.clone(dom); 
		var cfg = {};
		if(_.isObject(port) && Workspace.objects.dna.PortClasses[port.role]) {
			cfg.name = port.name;//'p'+(i+1);
			cfg.wtype = Workspace.objects.dna.PortClasses[port.role];
			cfg.stroke = App.dynamic.Compiler.getColor(port);
			cfg.segments = port.segments;
			//cfg.identity = port.name;
			// cfg.dynaml = port;
			cfg.role = port.role;
			return this.workspace.buildManager.buildPort(cfg);
		}
	},
	nextName: function() {
		return this.workspace.buildManager.getNextMotifName()
	},
	onRebuild: function() {
		
	},
	getRealtime: function(prop) {
		if(this.workspace.buildManager)
		return this.workspace.buildManager.getRealtime('motif',this.get('name'),prop);
	},
	getLibraryObject: function() { 
		if(this.workspace.buildManager)
		return this.workspace.buildManager.getRealtime('motif',this.get('name'),'this');
	},
}, function() {
	Workspace.reg('Workspace.objects.dna.Motif',Workspace.objects.dna.Motif);

});