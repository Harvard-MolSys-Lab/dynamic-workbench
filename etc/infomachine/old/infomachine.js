InfoMachine = new Ext.util.Observable();

Ext.apply(InfoMachine, {
	UNDEFINED: 'InfoMachine.UNDEFINED',
	
	objects: new Ext.util.MixedCollection(),
	types: new Ext.util.MixedCollection(),
	verbs: new Ext.util.MixedCollection(),
	
	// Object/item management
	register: function(item) {
		if(Ext.isFunction(item.getId)) {
			if(item.getId()) {
				if(InfoMachine.objects.contains(item.id)) { 
					InfoMachine.objects.replace(item.id,item);
				} else { 
					InfoMachine.objects.add(item.id,item);	
				}
				return item.id;
			}
		} 
		
		var id = App.nextId();
		item.id = id;
		this.objects.add(id,item);

		return item.id;
	},
	unregister: function(reference) {
		if(InfoMachine.objects.confainsKey(reference)) {
			return InfoMachine.objects.removeKey(reference);
		}
		if(InfoMachine.objects.confains(reference)) {
			return InfoMachine.objects.remove(reference);
		}
	},
	
	registerType: function(type) {
		if(type.name) {
			InfoMachine.types.add(type.name,type);
			InfoMachine.register(type);	
		}
	},
	unregisterType: function(type) {
		if(InfoMachine.objects.confainsKey(type)) {
			return InfoMachine.objects.removeKey(type);
		}
		if(InfoMachine.objects.confains(type)) {
			return InfoMachine.objects.remove(type);
		}
		InfoMachine.unregister(type);
	},
	
	createType: function(config,fields) {
		return new InfoMachineType(config,fields);	
	},
	getType: function(typeName) {
		return InfoMachine.types.get(typeName);	
	},
	hasType: function(typeName) {
		return InfoMachine.types.contains(typeName);	
	},
	
	isReference: function(reference) {
		return InfoMachine.validateReference(reference);		
	},
	resolveReference: function(reference) {
		if(InfoMachine.objects.confainsKey(reference)) {
			return InfoMachine.objects.get(reference);
		} else if(InfoMachine.objects.confains(refernce)) {
			return InfoMachine.objects.get(reference);	
		}
		return InfoMachine.UNDEFINED;
	},
	validateReference: function(reference) {
		if(InfoMachine.objects.confainsKey(reference)) {
			return InfoMachine;
		} else if(InfoMachine.objects.confains(refernce)) {
			return InfoMachine;	
		}
		return false;
	},
	generateReference: function(reference) {
		if(reference.getId) {
			if(Ext.isFunction(reference.getId)) {
				return reference.getId();	
			}	
		}
		if(Ext.isString(reference)) {
			return reference;	
		}
		return false;
	}
});

var InfoMachineObject = function(config) {
	InfoMachineObject.superclass.constructor.call(this, config);
	InfoMachine.register(this);
	Ext.
};

Ext.extend(InfoMachineObject, Ext.util.Observable, {
	getId: function() {
		if(this.id) {
			return this.id;
		} else {
			this.id = App.nextId();
			return this.id;	
		}
	},
	getType: function() {
		return InfoMachine.getType(this.type);
	},
	getField: function(fieldName) {
		return this.fields.get(fieldName);
	},
	hasField: function(fieldName) {
		return this.fields.contains(fieldName);
	},
	setField: function(fieldName, property) {
		property.canonical = property.canonical || property.name;
		property.type = property.type || 'object';
		property.reference = property.reference || false;
		property.location = property.location || false;
		property.literal = property.literal || false;
		
		this.fields.add(fieldName,property);	
	},
	updateFieldSegment: function(fieldName, segment, value) {
		var f = this.fields.get(fieldName);
		f[segment] = value;
		this.fields.replace(fieldName,value);	
	},
	updateField: function(fieldName,property) {
		for(var p in property) {
			this.updateFieldSegment(fieldName,p,property[p]);
		}
	},
	updateFields: function(fields) {
		if(Ext.isArray(fields)) {
			var property;
			for(var i=0, l=fields.length; i<l; i++) {
				property = fields[i];
				if(Ext.isObject(property)) {
					property.name = property.name || ('property_'+i);
					this.setField(property.name,property);
				} else {
					this.setField(property, {});	
				}
			}
		} else if(Ext.isObject(fields)) {
			var property;
			for(propertyName in fields) {
				property = fields[propertyName];
				if(Ext.isObject(property)) {
					property.name = property.name || ('property_'+i);
					this.setField(property.name,property);
				} else {
					this.setField(property, {});	
				}
			}
		}	
	},
	getFieldNames: function() {
		return this.fields.keys;	
	},
	eachField: function(fn, scope) {
		return this.fields.eachKey(fn, scope);	
	},
	get: function(field) {
		f = this.getField(field);
		if(f) {
			if(f.literal) return f.literal;
			if(f.location) return this.resolveLocation(f.location);
			if(f.reference) return InfoMachine.resolveReference(f.reference);
		}
		return false;
	},
	set: function(field,value,isReference) {
		f = this.getField(field);
		if(f) {
			if(isReference) {
				if(InfoMachine.validateReference(value.reference)) {
					this.updateFieldSegment(field,'reference',InfoMachine.generateReference(value));
					this.fireEvent('change',field,InfoMachine.resolveReference(value));
				}
			} else if(f.location) {
				this.fireEvent('change',field,this.resolveLocation(f.location,value));
			} else { 
				this.updateFieldSegment(field,'literal',value);
				this.fireEvent('change',field,value);
			}
		} else {
			if(isReference && InfoMachine.validateReference(value)) {
				var ref = InfoMachine.resolveReference(value);
				this.setField(field,{ reference:value, type: ref.type() });
				this.fireEvent('change',field,ref);
			} else {
				this.setField(field, { literal: value, type: Ext.type(value) });
				this.fireEvent('change',field,value);	
			}
		}
		return false;
	},
	resolveLocation: function(location,value) {
		if(this[location]) {
			if(Ext.isFunction(this[location])) {
				return this[location](value);
			} else {
				if(value) this[location] = value;
				return this[location];
			}
		} else {
			if(value) {
				this[location] = value;
				return value;
			}
		}
		return InfoMachine.UNDEFINED;
	},
	expose: function(fieldName,location,type,canonical) {
		type = type || false;
		canonical = canonical || false;
		if(this.hasField(fieldName)) {
			this.setFieldSegment(fieldName,'location',location);
			if(type) this.setFieldSegment(fieldName,'type',type);
			if(canonical) this.setFieldSegment(fieldName,'canonical',canonical);
		} else {
			type = type || 'object';
			this.setField(fieldName,{location: location, type: type, canonical: canonical });
		}
	},
	conceal: function(fieldName) {
		if(this.hasField(fieldName)) {
			this.fields.remove(fieldName);
		}
	},
	serialize: function() {

	},
	is: function(adjective) {
		return InfoMachine.matchesAdjective(this,adjective);	
	}
});




var InfoMachineNoun = function(config,fields) {
	InfoMachineNoun.superclass.constructor.call(this, config);
	
	Ext.applyIf(config,{
		id: App.nextId(),
		owner: false,
		type: 'object'
	});
	
	Ext.apply(this,config);
	
	this.fields = new Ext.util.MixedCollection();
	this.updateFields(fields);
	
	
	this.addEvents(
		'change'
	);
	
	this.expose('type','type','type');
};

Ext.extend(InfoMachineNoun, InfoMachineObject, {
	getField: function(fieldName) {
		return this.fields.get(fieldName);
	},
	hasField: function(fieldName) {
		return this.fields.contains(fieldName);
	},
	setField: function(fieldName, property) {
		property.name = property.name || fieldName;
		property.canonical = property.canonical || property.name;
		property.type = property.type || 'object';
		property.reference = property.reference || false;
		property.location = property.location || false;
		property.literal = property.literal || false;
		
		this.fields.add(fieldName,property);	
	},
	updateFieldSegment: function(fieldName, segment, value) {
		var f = this.fields.get(fieldName);
		f[segment] = value;
		this.fields.replace(fieldName,value);	
	},
	updateFields: function(fields) {
		if(Ext.isArray(fields)) {
			var property;
			for(var i=0, l=fields.length; i<l; i++) {
				property = fields[i];
				if(Ext.isObject(property)) {
					property.name = property.name || ('property_'+i);
					this.setField(property.name,property);
				} else {
					this.setField(property, {});	
				}
			}
		} else if(Ext.isObject(fields)) {
			var property;
			for(propertyName in fields) {
				property = fields[propertyName];
				if(Ext.isObject(property)) {
					property.name = property.name || ('property_'+i);
					this.setField(property.name,property);
				} else {
					this.setField(property, {});	
				}
			}
		}	
	},
	getFieldNames: function() {
		return this.fields.keys;	
	},
	eachField: function(fn, scope) {
		return this.fields.eachKey(fn, scope);	
	},
	get: function(field) {
		f = this.getField(field);
		if(f) {
			if(f.literal) return f.literal;
			if(f.location) return this.resolveLocation(f.location);
			if(f.reference) return InfoMachine.resolveReference(f.reference);
		}
		return false;
	},
	set: function(field,value,isReference) {
		f = this.getField(field);
		if(f) {
			if(isReference) {
				if(InfoMachine.validateReference(value.reference)) {
					this.updateFieldSegment(field,'reference',InfoMachine.generateReference(value));
					this.fireEvent('change',field,InfoMachine.resolveReference(value));
				}
			} else if(f.location) {
				this.fireEvent('change',field,this.resolveLocation(f.location,value));
			} else { 
				this.updateFieldSegment(field,'literal',value);
				this.fireEvent('change',field,value);
			}
		} else {
			if(isReference && InfoMachine.validateReference(value)) {
				var ref = InfoMachine.resolveReference(value);
				this.setField(field,{ reference:value, type: ref.type() });
				this.fireEvent('change',field,ref);
			} else {
				this.setField(field, { literal: value, type: Ext.type(value) });
				this.fireEvent('change',field,value);	
			}
		}
		return false;
	},
	update: function(collection) {
		for(var fieldName in collection) {
			var value = collection[fieldName];
				this.set(fieldName, value, InfoMachine.isReference(value));	
		}	
	},
	resolveLocation: function(location,value) {
		if(this[location]) {
			if(Ext.isFunction(this[location])) {
				return this[location](value);
			} else {
				if(value) this[location] = value;
				return this[location];	
			}
		} else {
			if(value) {
				this[location] = value;
				return value;
			}	
		}
		return InfoMachine.UNDEFINED;
	},
	is: function(adjective) {
		return InfoMachine.matchesAdjective(this,adjective);	
	}
});

var InfoMachineAdjective = function(config,fields) {
	
	Ext.applyIf(config,{
		id: App.nextId(),
		owner: false,
		type: 'adjective',
		extends: 'object',
		iconCls: 'infoMachine_adjective'
	});
		
	InfoMachineAdjective.superclass.constructor.call(this, config,fields);

	this.expose('name','name','string');
	this.expose('extends','extends','string');
};

Ext.extend(InfoMachineAdjective,InfoMachineNoun, {
	setField: function(fieldName, property) {
		property.constraint = property.constraint || false;
		InfoMachineAdjective.superclass.setField.call(this,fieldName,property);
	},
	match: function(item) {
		var match = true;
		this.eachField(function(fieldName,field) {
			var value = item.get(fieldName);
			if(field.type) {
				var t = InfoMachine.getType(field.type);
				match = match && t.match(value);	
			}
			if(field.constraint) {
				if(Ext.isFunction(field.constraint)) {
					match = match && field.constraint(value);	
				}	
			}
		},this);
		return match;
	}
});


var InfoMachineType = function(config,fields) {
	Ext.applyIf(config,{
		id: App.nextId(),
		owner: false,
		type: 'type',
		extends: 'object',
		iconCls: 'infoMachine_object',
		editorConfig: {xtype: 'objecteditor'}
	});

	InfoMachineType.superclass.constructor.call(this, config,fields);
	
	var parent = this.getParent();
	if(parent) { parent.extend(this); }
	
	this.expose('editorConfig','editorConfig','json');
	
	InfoMachine.registerType(this);
};

Ext.extend(InfoMachineType,InfoMachineAdjective, {
	getParent: function() {
		var t = InfoMachine.getType(this.extends); 
		if(t) { 
			return t;
		} else {
			return InfoMachine.getType('object');	
		}	
	},
	extend: function(child) {
		this.eachField(function(fieldName,field) {
			if(!child.hasField(fieldName)) child.setField(fieldName, field);
		}, this);
		return child;
	},
	instantiate: function(config) {
		var instance = new InfoMachineObject({
			type: this.name
		});
		instance.extend(this);
		instance.update(config);
		instance.conceal('iconCls');
		instance.conceal('extends');
		instance.conceal('editorConfig');
	},
	getRecordDefinition: function() {
		var def = [];
		this.eachField(function(field) {
			
		});	
	}
});


