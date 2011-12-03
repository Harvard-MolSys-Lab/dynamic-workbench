Ext.define("Workspace.objects.secondary.ComplementarityManager", {
	extend : 'Workspace.objects.Object',
	constructor : function() {
		this.callParent(arguments);
		this.identities = {};
		this.nameIndex = -1;
		this.expose('identities',true,true,true,false);
		this.workspace.complementarityManager = this;
	},
	nextName : function() {
		var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		this.nameIndex++;
		var r = '', n = this.nameIndex;
		do {
			r = r + s.charAt(n % 26);
			n -= 25;
		} while(n>0)
		return r;
	},
	checkoutIdentity: function(object,id) {
		id = id || this.nextName();
		id = this.normalizeIdentity(id);
		if(!this.identities[id]) {
			this.identities[id] = [];
		}
		this.identities[id].push(object);
		object.set('identity',id);
		object.set('polarity',this.getPolarity(id));
		return id;
	},
	normalizeIdentity: function(identifier) {
		if(this.getPolarity(identifier)==-1) {
			return identifier.substring(0,identifier.length - 1);
		}
		return identifier;
	},
	getStrandsWithIdentity: function(identifier) {
		identifier = this.normalizeIdentity(identifier);
		return this.identities[identifier];
	},
	getPolarity: function(identifier) {
		return identifier ? ((identifier[identifier.length - 1] == '*' || identifier[identifier.length - 1] == "'") ? -1 : 1) : 0;
	},
	getEqualStrands: function(identifier,polarity) {
		if(polarity == 0) {
			polarity = this.getPolarity(identifier);
		}
		var ids = this.getStrandsWithIdentity();
		return _.map(ids,function(object) {
			return object.get('polarity')==polarity;
		});
	}
}, function() {
	Workspace.reg('Workspace.objects.secondary.ComplementarityManager', Workspace.objects.secondary.ComplementarityManager);
})