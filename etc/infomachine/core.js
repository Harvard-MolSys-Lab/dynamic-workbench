InfoMachine = new Ext.util.Observable();

Ext.apply(InfoMachine, {
	UNDEFINED: 'InfoMachine.UNDEFINED',
	
	objects: new Ext.util.MixedCollection(),
	types: (function() {
		var types = new Ext.util.MixedCollection(),
		Ext.apply(types,{
			createType: function(config,fields) {
				return new InfoMachine.Type(config,fields);	
			},
			getType: function(typeName) {
				return InfoMachine.types.get(typeName);	
			},
			hasType: function(typeName) {
				return InfoMachine.types.contains(typeName);	
			},
			isType: function(value,typeName) {
				var t = InfoMachine.types.get(typeName);
				if(t) {
					return t.match(value);
				} else {	
					throw new InfoMachine.exceptions.ReferenceException({ 
						description: 'An attempt was made to check an object\'s compliance with a nonexistant type.'
						typeName: typeName,
						object: value 
					});
				}
			},
			getStore: function() {
					
			}
		});
		
		return types;
	})(),
	
	nouns: new Ext.util.MixedCollection(),
	
	functions: new Ext.util.MixedCollection(),
		
	// Object/item management
	register: function(item,meta) {
		if(Ext.isFunction(item.getId)) {
			var id = item.getId()
			if(InfoMachine.objects.contains(id)) { 
				InfoMachine.objects.replace(id,item);
			} else { 
				InfoMachine.objects.add(id,item);	
			}
			switch(meta) {
				case 'type':
					InfoMachine.types.add(item.name, item);
					break;
				case 'noun':
					InfoMachine.nouns.add(item.name, item);
					break;	
				case 'function':
					InfoMachine.functions.add(item.name, item);
					break;
			}
			
			return item.id;
		} 
		
		var id = App.nextId();
		item.id = id;
		this.objects.add(id,item);

		return item.id;
	},
	unregister: function(reference) {
		var o;
		if(InfoMachine.objects.confainsKey(reference)) {
			o = InfoMachine.objects.removeKey(reference);
		}
		if(InfoMachine.objects.confains(reference)) {
			o = InfoMachine.objects.remove(reference);
		}
		if(o) {
			switch(meta) {
				case 'type':
					InfoMachine.types.removeKey(o.name);
					break;
				case 'noun':
					InfoMachine.nouns.removeKey(o.name);
					break;	
				case: 'function':
					InfoMachine.functions.removeKey(o.name);
						break;
			}
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
	},
	
	getStore: function(collection, mappings, useArray) {
		useArray = useArray || false; // default to using keys
		var store;
		
		if(useArray) { 
			
		} else {
			store = new Ext.data.Store({
				reader: new Ext.data.JsonReader({
					fields: mappings,
					root: items
				}),
				data: collection
			}); 	
			// add events
		}
		return store;
	}
});

////////////////////////////////////////////////////////////////////////

InfoMachine.data.CollectionStore = function(data, mappings, config){
    config = config || {};
    
    Ext.applyIf(config, {
    	data: data,
        reader: new Ext.data.JsonReader({
			fields: mappings,
			root: 'items'
		}),
    });

    InfoMachine.data.CollectionStore.superclass.constructor.call(this, config);
    
    data.on('add',this.collectionAdd,this);
    data.on('remove',this.collectionRemove,this);
    data.on('replace',this.collectionReplace,this);
    
    this.on('add',this.storeAdd,this);
    this.on('remove',this.storeRemove,this);
    this.on('update',this.storeUpdate,this);
    
};
Ext.extend(InfoMachine.data.CollectionStore, Ext.data.Store, {
	collectionAdd: function(i,o,k) {
		this.reader.readRecords({ items: [o] });
	},
	collectionRemove: function(o,k) {
		
	},
	collectionReplace: function() {
		
	},
	storeAdd: function() {
		
	},
	storeRemove: function() {
		
	},
	storeUpdate: function() {
		
	}
});

////////////////////////////////////////////////////////////////////////

InfoMachine.Exception = function(config) {
	Ext.applyIf(this,config);	
}

InfoMachine.exceptions = {};

InfoMachine.exceptions.TypeException = function(config) {
	Ext.applyIf(config,{
		exceptionClass: 'TypeException'
	})
	InfoMachine.Exception.call(this, config);
};

InfoMachine.exceptions.ReferenceException = function(config) {
	Ext.applyIf(config,{
		exceptionClass: 'ReferenceException'
	})
	InfoMachine.Exception.call(this, config);
};

////////////////////////////////////////////////////////////////////////

InfoMachine.Builder = function(config) {
	this.config = config;	
}

Ext.extend(InfoMachine.Builder, Ext.util.MixedCollection, {
	execute: function(value) {
			
	}
});

////////////////////////////////////////////////////////////////////////

InfoMachine.Object = function(config) {
	InfoMachine.Object.superclass.constructor.call(this, config);
	InfoMachine.register(this);
	Ext.applyIf(config,{
		owner: false,
		meta: 'object',
		parent: false,
		canonical: false
	});
	Ext.applyIf(this,config);
};

Ext.extend(InfoMachine.Object, Ext.util.MixedCollection, {
	getId: function() {
		if(this.id) {
			return this.id;
		} else {
			this.id = App.nextId();
			return this.id;	
		}
	},
	getMeta: function() {
		if(this.meta) {
			return this.meta;	
		}	
		return 'object';
	},
	getParent: function(item) {
		return this.parent;	
	},
	setParent: function(item) {
		this.parent = item;	
	},
	isRoot: function() {
		return (this.parent == false);	
	},
	getCanonical: function(canonical) {
		return this.canonical;
	},
	setCanonical: function(canonical) {
		this.canonical = canonical;
	},
	has: function(key) {
		return this.containsKey(key);	
	}
});

////////////////////////////////////////////////////////////////////////

InfoMachine.Adjective = function(config) {
	Ext.applyIf(config,{
		meta: 'adjective',
		conditions: []
	});
	
	var conditions = []
	for(var i=0, l=this.conditions.length; i<l; i++) {
		conditions[i] = new InfoMachine.Condition(this.conditions[i]);
	}
	this.conditions = conditions;
	
	InfoMachine.Adjective.superclass.constructor.call(this, config);
};

Ext.extend(InfoMachine.Adjective, InfoMachine.Object, {
	match: function() {
		var result = true;
		for(var i=0, l=this.conditions.length; i<l; i++) {
			result = (result && this.conditions[i].execute());
		}
	}
});

////////////////////////////////////////////////////////////////////////

InfoMachine.Condition = function(config) {
	Ext.applyIf(config,{
		meta: 'condition',
		func: 'typeIs',
		arguments: []
	});
	
	InfoMachine.Condition.superclass.constructor.call(this, config);
};

Ext.extend(InfoMachine.Condition, InfoMachine.Object, {
	match: function() {
		var f = InfoMachine.functions.get(this.func);
		if(f) {
			return f.execute.apply(f,this.arguments);
		} else {
			throw new InfoMachine.exceptions.ReferenceException({
				description: "An attempt was made to call a nonexistent function",
				func: this.func
			});	
		}
	},
	execute: function() {
		return this.match();	
	}
});

////////////////////////////////////////////////////////////////////////

InfoMachine.Type = function(config) {
	Ext.applyIf(config,{
		meta: 'type',
		properties: [],
		methods: [],
		events: [],
		extends: 'item',
		isPrimitive: false
	});
	
	if(this.name!='item') {
		var extends = InfoMachine.types.get(config.extends);
		
		// Manually pull default values from parent class so they can be overridden.
		this.isPrimitive = config.isPrimitive || extends.isPrimitive;
		this.accepts = extends.accepts; 
		this.parse = extends.parse;
	}
	
	InfoMachine.Type.superclass.constructor.call(this, config);
	
	var properties = [], methods = [], events = [], p = false;
	if(this.name!='item') {
		
		for(var i=0, l=extends.properties.length; i<l; i++) {
			if(extends.properties[i].name) {
				p = new InfoMachine.Property(extends.properties[i]);
				properties.push(p);
				this.add(p.name, p);
			}
		}
		for(i=0, l=extends.methods.length; i<l; i++) {
			if(extends.methods[i].name) {
				p = new InfoMachine.Method(extends.methods[i])
				methods.push(p);
				this.add(p.name, p);
			}
		}
		for(i=0, l=extends.events.length; i<l; i++) {
			if(extends.events[i].name) {
				p = new InfoMachine.Event(extends.events[i]);
				events.push(p);
				this.add(p.name, p);
			}
		}
	}
	
	
	for(var i=0, l=this.properties.length; i<l; i++) {
		if(this.properties[i].name) {
			p = new InfoMachine.Property(this.properties[i]);
			properties.push(p);
			this.add(p.name, p);
		}
	}
	for(i=0, l=this.methods.length; i<l; i++) {
		if(this.methods[i].name) {
			p = new InfoMachine.Method(this.methods[i])
			methods.push(p);
			this.add(p.name, p);
		}
	}
	for(i=0, l=this.events.length; i<l; i++) {
		if(this.events[i].name) {
			p = new InfoMachine.Event(this.events[i]);
			events.push(p);
			this.add(p.name, p);
		}
	}
	this.properties = properties;
	this.methods = methods;
	this.events = events;
	
};

Ext.extend(InfoMachine.Type, InfoMachine.Adjective, {
	instantiate: function(populate,literal) {
		var o;
		if(this.isPrimitive) { 
			o = new InfoMachine.Primitive();
			o.setLiteral(literal);	
		} else {
			o = new InfoMachine.Noun();
		}
		
		for(var i=0, l=this.properties.length; i<l; i++) {
			o.add(new InfoMachine.Property(this.properties[i]));	
		}
		for(i=0, l=this.methods.length; i<l; i++) {
			o.add(new InfoMachine.Method(this.methods[i]));	
		}
		for(i=0, l=this.events.length; i<l; i++) {
			o.add(new InfoMachine.Event(this.events[i]));	
		}
		o.populate(populate);
		return o;
	},
	match: function(o) {
		var result = true, prop = false, t = false;
		if(this.isPrimitive) {
			result = this.accepts(this.getLiteral);
			if(!result) { return false; }
		}
		for(var i=0, l=this.properties.length; i<l; i++) {
			prop = o.get(this.properties[i].name);
			if(prop) {
				t = this.properties[i].getType();
				result = t.match(prop.getValue());
				if(!result) { return false; }
			} else {
				return false;
			}
		}
		for(i=0, l=this.methods.length; i<l; i++) {
			prop = o.get(this.methods[i].name);
			if(prop) {
				t = this.properties[i].getType();
				result = t.match(prop.getType());
			}
		}
		for(i=0, l=this.events.length; i<l; i++) {
			o.add(new InfoMachine.Event(this.events[i]));	
		}
	}
});

////////////////////////////////////////////////////////////////////////

InfoMachine.Property = function(config) {
	Ext.applyIf(config,{
		meta: 'property',
		storage: 'internal', // possible values: internal, reference, linked, referenceFunction, calculated
		getter: false,
		setter: false,
		reference: false,
		link: false,
		expression: false,
		value: false,
		type: 'item'
	});
	if((this.storage == 'reference')||(this.storage == 'linked')||(this.storage == 'referenceFunction')) {
		if(!this.link) { this.link = window; }	
	}
	
	InfoMachine.Property.superclass.constructor.call(this, config);
};

Ext.extend(InfoMachine.Property, InfoMachine.Object, {
	getType: function() {
		return InfoMachine.getType(this.type);	
	},
	getValue: function() {
		switch(this.storage) {
			case: 'internal':
				return this.value;
				break;
			case: 'reference':
				return this.link[this.reference];
				break;
			case: 'linked':
				return this.link.getValue(this.reference);
				break;
			case: 'referenceFunction':
				return this.link[this.reference]();
				break;				
			case: 'calculated':
				return this.expression.execute();
				break;
		}
	},
	setValue: function(value) {
		if(InfoMachine.types.isType(value,this.type)) {
			switch(this.storage) {
				case: 'reference':
					this.link[this.reference] = value;
					break;
				case: 'linked':
					return this.link.setValue(this.reference,value);
					break;
				case: 'referenceFunction':
					return this.link[this.reference](value);
					break;		
				case: 'internal':
				case: 'calculated':
					if(value.meta == 'expression') {
						this.expression = value;
						this.storage = 'expression';
					} else {
						this.value = value;	
						this.storage = 'internal';
					}
					break;
			}
		} else {
			throw new InfoMachine.exceptions.TypeException({
				description: 'An attempt was made to set a property to a value of an invalid type',
				neededTypeName: this.type,
				value: value
			});	
		}
	},
	getStorage: function() {
		return this.storage;	
	},
	setStorage: function(storage, link, reference) {
		this.storage = storage;
		switch(storage) {
			case: 'reference':
			case: 'linked':
				this.link = link;
				this.reference = reference;
			default: 
				this.link = false;
				this.reference = false;	
		}	
	}
});

////////////////////////////////////////////////////////////////////////

InfoMachine.Item = function(config) {
	Ext.applyIf(config,{
		meta: 'item',
		type: 'item'
	});
	
	this.properties = new Ext.util.MixedCollection();
	this.methods = new Ext.util.MixedCollection();
	this.events = new Ext.util.MixedCollection();
	
	InfoMachine.Item.superclass.constructor.call(this, config);
};

Ext.extend(InfoMachine.Item, InfoMachine.Object, {
	add: function(key,obj) {
		switch(obj.meta) {
			case 'property':
				this.properties.add(key,obj);
				obj.setParent(this);
				obj.setCanonical(key);
				break;
			case 'method':
				this.methods.add(key,obj);
				obj.setParent(this);
				break;
			case 'event':
				this.events.add(key,obj);
		}
		InfoMachine.Item.superclass.add.apply(this,arguments);
	},
	getValue: function(key) {
		var p = this.properties.get(key);
		if(p) {
			return p.getValue();
		} else {
			throw new InfoMachine.exceptions.ReferenceException({
				description: 'An attempt was made to access a nonexistant property',
				property: 'key',
				item: this
			});	
		}
	},
	setValue: function(key,value) {
		var p = this.properties.get(key);
		if(p) {
			return p.setValue(value);
		} else {
			throw new InfoMachine.exceptions.ReferenceException({
				description: 'An attempt was made to set a nonexistant property',
				property: 'key',
				item: this
			});	
		}
	},
	populate: function(obj) {
		for(var key in obj) {
			if(this.has(key)) {
				this.setValue(key,obj[key]);
			}
		}	
	},
	getType: function() {
		return InfoMachine.getType(this.type);	
	}
});


////////////////////////////////////////////////////////////////////////


InfoMachine.Primitive = function(config) {
	Ext.applyIf(config,{
		meta: 'primitive',
		literal: false
	});
	
	InfoMachine.Primitive.superclass.constructor.call(this, config);
};

Ext.extend(InfoMachine.Primitive, InfoMachine.Item, {
	setLiteral: function(value) {
		this.literal = value;	
	},
	getLiteral: function() {
		return this.literal
	}
});


////////////////////////////////////////////////////////////////////////

InfoMachine.Noun = function(config) {
	Ext.applyIf(config,{
		meta: 'noun',
		type: 'noun'
	});
	
	InfoMachine.Noun.superclass.constructor.call(this, config);
};

Ext.extend(InfoMachine.Noun, InfoMachine.Item, {

});

////////////////////////////////////////////////////////////////////////

InfoMachine.Method = function(config) {
	Ext.applyIf(config,{
		meta: 'method',
		execute: function() { },
		type: 'noun'
	});
	
	InfoMachine.Method.superclass.constructor.call(this, config);
};

Ext.extend(InfoMachine.Method, InfoMachine.Object, {
	getType: function() {
		return InfoMachine.getType(this.type);	
	}
});

////////////////////////////////////////////////////////////////////////

InfoMachine.Function = function(config) {
	Ext.applyIf(config,{
		meta: 'function',
		execute: function() { return true; }
	});
	
	InfoMachine.Function.superclass.constructor.call(this, config);
};

Ext.extend(InfoMachine.Function, InfoMachine.Object, {

});

////////////////////////////////////////////////////////////////////////

InfoMachine.Expression = function(config) {
	Ext.applyIf(config,{
		meta: 'expression',
		func: function() {},
		arguments: []
	});
	
	InfoMachine.Expression.superclass.constructor.call(this, config);
};

Ext.extend(InfoMachine.Expression, InfoMachine.Object, {
	execute: function() {
		if(this.func) {
			var arguments = [];
			for(var i=0, l=this.arguments.length; i<l; i++) {
				if(this.arguments[i].meta == 'expression') {
					arguments[i] = (new InfoMachine.Expression(this.arguments[i])).execute();
				} else { 
					arguments[i] = this.arguments[i];	
				}
			}
			if(Ext.isString(this.func)) {
				this.func = InfoMachine.functions.get(this.func);
			}
			if(Ext.isFunction(this.func.execute)) {
				return this.func.execute(arguments);	
			} 
			if(Ext.isFunction(this.func)) {
				return this.func(arguments);
			}
		}
	}
});