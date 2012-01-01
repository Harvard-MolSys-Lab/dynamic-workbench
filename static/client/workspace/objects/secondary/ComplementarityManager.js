/**
 * Allows centralized management of {@link Workspace.object.Object objects}, 
 * many of which may have complementarity or equality relationships between
 * their abstract identities. For instance, this could be used to manage the 
 * names (identities) of segments or domains in a secondary structure system,
 * or ports in a Nodal system. 
 */
Ext.define("Workspace.objects.secondary.ComplementarityManager", {
	extend : 'Workspace.objects.Object',
	nameIndex: -1,
	defaultPolaritySpecifier: "*",
	constructor : function() {
		this.callParent(arguments);
		this.identities = {};
		this.objectIdentitiesCache = {};
		this.expose('identities',true,true,true,false);
		this.expose('nameIndex',true,true,true,false);
		this.workspace.complementarityManager = this;
	},
	/**
	 * Forms an identifier string consisting of a name and an optional 
	 * polarity specifier
	 * @param {String} name,
	 * @param {Number} polarity
	 * @return {String} identifier
	 */
	makeIdentifier: function(name,polarity) {
		return name + ((polarity == -1) ? this.defaultPolaritySpecifier : ''); 
	},
	/**
	 * Provides the identity of an object
	 * @param {Workspace.objects.Object} object
	 * @return {String} identity
	 */
	getIdentity : function(object) {
		if(object && object.getId) return this.objectIdentitiesCache[object.getId()];
	},
	/**
	 * Provides the identifier string (identity + polarity) for an object
	 * @param {Workspace.objects.Object} object
	 * @param {Number} [polarity=1] Optionally flip the polarity the object in the identifier
	 * @return {String} identifier
	 */
	getIdentifier : function(object,polarity) {
		polarity || (polarity = 1);
		if(object && object.getId) return this.makeIdentifier(this.getIdentity(object),object.get('polarity')*polarity);
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
	/**
	 * Generates, reserves, or adds a new identity for an object.
	 */
	checkoutIdentity: function(object,id) {
		id = id || this.nextName();
		id = this.normalizeIdentity(id);
		if(!this.identities[id]) {
			this.identities[id] = [];
		}
		this.cacheObjectId(object,id);
		this.identities[id].push(object);
		object.set('polarity',this.getPolarity(id));
		return id;
	},
	/**
	 * Strips the polarity indicator (* or ') from an identifier
	 * @param {String} identifier 
	 */
	normalizeIdentity: function(identifier) {
		if(this.getPolarity(identifier)==-1) {
			return identifier.substring(0,identifier.length - 1);
		}
		return identifier;
	},
	/**
	 * Gets objects which have the given identity (of either polarity)
	 * @return {Workspace.object.Object[]} objects
	 */
	getWithIdentity: function(identifier) {
		identifier = this.normalizeIdentity(identifier);
		return this.identities[identifier];
	},
	/**
	 * Gets the polarity of a given identifier string. Strings ending with * or
	 * ' are assumed to have negative (3' to 5') polarity.
	 * @param {String} identifier
	 * @return {Number} polarity 1 for 5' -> 3', -1 for 3' -> 5'
	 */
	getPolarity: function(identifier) {
		return identifier ? ((identifier[identifier.length - 1] == '*' || identifier[identifier.length - 1] == "'") ? -1 : 1) : 0;
	},
	/**
	 * Returns all objects with a given identity and polarity
	 * @param {String} identifier
	 * @param {Number} polarity 1 for 5' -> 3', -1 for 3' -> 5'
	 * @return {Workspace.object.Object[]} objects
	 */
	getEqual: function(identifier,polarity) {
		if(polarity == 0) {
			polarity = this.getPolarity(identifier);
		}
		var ids = this.getWithIdentity(identifier);
		return _.filter(ids,function(object) {
			return object.get('polarity')==polarity;
		});
	},
	/**
	 * Returns all objects with a given identity and the opposite polarity
	 * to that given.
	 * @param {String} identifier
	 * @param {Number} polarity 1 for 5' -> 3', -1 for 3' -> 5'
	 * @return {Workspace.object.Object[]} objects
	 */
	getComplementary: function(identifier,polarity) {
		if(polarity==0) polarity = this.getPolarity(identifier);
		return this.getEqual(identifier,polarity*-1);
	},
	/**
	 * Updates a cache which maintains the identity associated with each object 
	 * by {@link Machine.core.serializable#id InfoMachine object ID}. This 
	 * allows fast lookup of object identity within #getIdentity.
	 * @private
	 */
	cacheObjectId: function(object,identity) {
		this.objectIdentitiesCache[object.getId()] = identity;
	},
	/**
	 * Merges the right identity into the left identity. Updates the identity 
	 * and polarity of all strands with the right identity to match that of 
	 * the left.
	 * @param {String} left Left Identity
	 * @param {String} right Right Identity
	 */
	mergeIdentifiers: function(left,right) {
		var leftId = left ? this.normalizeIdentity(left) : false,
			leftPol = left ? this.getPolarity(left) : false,
			rightId = right ? this.normalizeIdentity(right) : false,
			rightPol = right ? this.getPolarity(right) : false;
		var newEqualStrands,newComplementStrands, newStrands;
		
		if(leftId && this.identities[leftId]) {
			newEqualStrands = this.getEqual(rightId,rightPol);
			newComplementStrands = this.getComplementary(rightId,rightPol);
			newStrands = newEqualStrands.concat(newComplementStrands);
			
			this.identities[leftId] = this.identities[leftId].concat(newStrands);
			
			_.each(newEqualStrands,function(strand) {
				strand.set('polarity',leftPol);
				this.cacheObjectId(strand,leftId);
				strand.change('identity',leftId,rightId);
			},this);
			
			_.each(newComplementStrands,function(strand) {
				strand.set('polarity',-leftPol);
				this.cacheObjectId(strand,leftId);
				strand.change('identity',leftId,rightId);
			},this);
		}
	},
	/**
	 * Makes two objects complementary by merging their identities. Merges are 
	 * left to right; all objects with the identity of the right object will 
	 * become left*, while all objects with the right* will become left. 
	 * @param {String} left Left object
	 * @param {String} right Right object
	 */
	makeComplementary: function(left,right) {
		this.mergeIdentifiers(this.getIdentifier(left),this.getIdentifier(right,-1));
	},
	
}, function() {
	Workspace.reg('Workspace.objects.secondary.ComplementarityManager', Workspace.objects.secondary.ComplementarityManager);
})