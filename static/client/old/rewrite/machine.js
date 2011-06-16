/********************************************
 * InfoMachine
 *
 * Copyright (c) 2010 Casey Grun
 *********************************************/

Ext.ns('Workspace');


Machine = {
	access: {
		modes: {}
	},
	nouns: function() {
		var nouns = objects = new Ext.util.MixedCollection();
		return {
			/**
	 		* get
	 		* Gets an object by its id. Unlike {@link Workspace#getObjectById}, this method locates an object within the entire application
	 		* @param {String} id
	 		*/
			get: function(id) {
				return objects.get(id);
				// TODO: fix this
			},
			/**
	 		* has
	 		* Determines whether an object in the application has the given id.
	 		* @param {String} id
	 		*/
			has: function(id) {
				return objects.containsKey(id);
			},
			/**
	 		* create
	 		* Instantiates an object of the passed class or configured wtype.
	 		* @param {Function} objectClass Constructor to which <var>config</var> should be passed. May be omitted if <var>config</var> contains a registered wtype.
	 		* @param {Object} config Object containing configuration parameters
	 		* @return {SerializableObject} object
	 		*/
			create: function() {
				var config,
				objectClass, o;
				if (arguments.length == 1) {
					config = arguments[0]
					o = Ext.ComponentManager.create(config);
				} else {
					objectClass = arguments[0];
					config = arguments[1];
					if (config && objectClass && Ext.isFunction(objectClass)) {
						o = new objectClass(config);
					}
				}
				if(o) {
					objects.add(o.getId(), o);
					return o;
				}
				return false;
			},
			build: function() {
				return Machine.nouns.create.apply(this,arguments);
			},
			/**
	 		* realize
	 		* Realizes a complex object (any object with an id and a wtype) by either instantiating the object or resolving the reference.
	 		* That is, if an object with the given wtype and id already exists in the application, it is returned. Otherwise, an object
	 		* with the given wtype is instantiated using parameters in config. If the value passed to config has already been instantiated,
	 		* it is returned unmodified.
	 		* @param {Object} config Object containing configuration parameters. Must include a registered <var>wtype</var>!
	 		* @return {SerializableObject} object
	 		*/
			realize: function(o) {
				var v = Ext.getCmp(o.id);
				v || (v = Machine.nouns.create(o));
				return v;
				/*
				var v;
				if (o.wtype) {
					if (o.getId) {
						v = o;
					} else if (o.id && Machine.nouns.has(o.id)) {
						v = Machine.nouns.get(o.id);
					} else {
						v = Machine.nouns.create(o);
					}
					if(v && (!o.isRef && !o.isChild)) {
						delete o.id;
						delete o.wtype;
						delete o.head;
						v.populate(o);
					}
				}
				*/
			},
			/**
	 		* serialize
	 		* Traverses properties/elements of the passed item and serializes them. If o is an array, returns an array
	 		* containing the results of applying this function to every element. If o is an object, returns a hash containing
	 		* the results of applying this function to each value in the object. If o has its own <var>serialize</var> function,
	 		* (e.g. if o is a {@link SerializableObject}), returns the result of that function.
	 		* Note: this function still returns a Javascript Object; it does *not* encode the object to a JSON string. That
	 		* process is performed by Ext.encode.
	 		* @param {Object/Array/SerializableObject} o An object to serialize
	 		* @param {Boolean} isChild true to serialize this object as a reference (ie: don't copy any of its properties; just
	 		* @return {Object} serialized An object literal containing each of the serialized properties
	 		*/
			serialize: function(o, isChild) {
				// if o defines its own serialization function (ie: for higher level objects), use that
				if (o && o.serialize && Ext.isFunction(o.serialize)) {
					return o.serialize(isChild)
				}
	
				// serialize an array
				if (Ext.isArray(o)) {
					var r = [];
					for (var i = 0, l = o.length; i < l; i++) {
						r.push(Machine.nouns.serialize(o[i], true));
					}
					return r;
				}
	
				// serialize a simple object hash (allow for complex objects contained in the hash)
				if (Ext.isObject(o)) {
					var r = {};
					for (var p in o) {
						r[p] = Machine.nouns.serialize(o[p], true);
					}
					return r;
				}
	
				// no serialization needed; Ext will take care of the .toString()s
				return o;
			},
			/**
	 		* deserialize
	 		* Deserializes an object hash serialized by {@link #serialize}.
	 		* Note: to deserialize complex objects, each object must contain a registered wtype.
	 		* Note 2: this method still accepts Javascript objects; it does not decode JSON strings. That function
	 		* is performed by Ext.decode.
	 		* @param {Object/Array} o
	 		*/
			deserialize: function(o) {
				// if o is a javscript object
				if (Ext.isObject(o)) {
	
					// if o is a complex object, realize it by either instantiating it or populating the reference
					if (o.wtype) {
						return Workspace.Components.realize(o);
	
						// if o is a normal object, deserialize each component
					} else {
						return Workspace.Components.deserializeHash(o);
					}
	
					// if o is an array, deserialize each element
				} else if (Ext.isArray(o)) {
					return Workspace.Components.deserializeArray(o);
	
					// otherwise no deserialization needed
				} else {
					return o;
				}
			},
			/**
	 		* deserializeHash
	 		* @private
	 		*/
			deserializeHash: function(o) {
				var r = {};
				for (var p in o) {
					r[p] = Workspace.Components.deserialize(o[p], true);
				}
				return r;
			},
			/**
	 		* deserializeArray
	 		* @private
	 		*/
			deserializeArray: function(o) {
				var r = [];
				for (var i = 0, l = o.length; i < l; i++) {
					r.push(Workspace.Components.deserialize(o[i], true));
				}
				return r;
			}
			
		}
	}(),
	build: function() {
		return Machine.heads.build.apply(this,arguments);
	},
	realize: function(obj) {
		return Machine.nouns.realize.apply(this,arguments);
	},
	nextId: function() {
		return App.nextId();
	}
};

/**
 * @class Machine.components
 * @singleton
 */
Machine.components = Machine.heads = Machine.types = (function() {
	Ext.regModel('Type',{
		fields: [
			{name: 'wtype'},
			{name: 'name'},
			{name: 'iconCls'}
		]
	});
	
	var types = {},
	typeStore = new Ext.data.Store({
		model: 'Type'
	});

	return {
		/**
 		* register
 		* Registers the passed <var>wtype</var> with a constructor so that objects deserialized with
 		* {@link Workspace.Components#deserialize}, {@link Workspace.Components#create}, {@link Workspace#createObject}, etc.
 		* may have their constructor automatically detected, similar to Ext's xtypes
 		* @param {String} wtype The canonical name of this type
 		* @param {Function} type The constructor function
 		*/
		register: function(wtype, type) {
			type.prototype.wtype = wtype;
			type.wtype = wtype;
			types[wtype] = type;
			var rec = { wtype: wtype };
			if(type.prototype) {
				if(type.prototype.iconCls) {
					rec.iconCls = type.prototype.iconCls;
				}
			}
			typeStore.add(new typeStore.recordType(rec));
			return type;
		},
		/**
 		* getType
 		* Returns the class corresponding to the passed wtype
 		* @param {String} wtype The mneumonic name of the type to lookup
 		*/
		getType: function(wtype) {
			return types[wtype];
		},
		get: function() {
			return Machine.heads.getType.apply(this,arguments);
		},
		has: function(wtype) {
			return Ext.isDefined(types[wtype]);
		},
		getTypeStore: function() {
			return typeStore;
		},

		isWType: function(o,wtype) {
			if(Ext.isString(o)) {
				if(this.has(o)) {
					if(o==wtype) {
						return true;
					}
					var t = this.getType(o);
					do {
						if(t && t.prototype && t.prototype.superclass) {
							t = t.prototype.superclass.constructor;
						} else {
							break;
						}
					} while(t.wtype!=wtype)
					return t && t.wtype && (t.wtype == wtype);
				}
			} else if(Ext.isFunction(o.isWType)) {
				return o.isWType(wtype);
			}
		},
	};
})();

/**
 * @class Machine.BaseNoun
 * Encapsulates base functionality for storing and retrieving key value pairs and automatically serializing them.
 * @extends Ext.util.Observable
 */
Ext.define('Machine.nouns.BaseNoun', {
	alias: 'SerializableObject',
	constructor: function(config) {
		// directory of readable properties and their getter functions
		this._readable = {};
		// directory of writeable properties and their setter functions
		this._writeable = {};
		// directory of serializable properties
		this._serializable = {};
		// directory of user properties
		this._userProperties = {};
		
		// holds previous values during change events
		this._previous = {};
		
		// items
		this._items = [];
		
		// fields
		this._data = {};
		
		// head/wtype
		this._head = this._wtype = this.wtype = config.head || config.wtype;
		
		
		this.id = config.id || Machine.nextId();
		
		this.addEvents(
		/**
 		* @event change
 		* Fired when one of this object's properties is {@link #set}
 		* @param {String} property The name of the property
 		* @param {Mixed} value The new value of the property
 		*/
		'change',
		/**
 		* @event destroy
 		* Fired when this object is {@link #destroy}ed
 		*/
		'destroy',
		/**
 		* @event meta
 		* Fired when a property is exposed
 		* @param {String} property The name of the property
 		* @param {Object} data Hash containing the property's new meta description
 		*/
		'meta'
		/**
 		* @event change_(prop)
 		* <var>x</var> is {@link #set}
 		*/
		);
		
	},
	mixins: {
		observable: 'Ext.util.Observable',
	},

	/**
 	* getId
 	* Gets this object's global id
 	* @return {String} id
 	*/
	getId: function() {
		if (this.id) {
			return this.id;
		} else {
			this.id = App.nextId();
			return this.id;
		}
	},
	

	/**
	 * isWtype
	 * Determines if this noun has the given head (wtype) or any of its descendents
	 * @returns {Bool}
	 */
	isWType : function(wtype, shallow) {
		//assume a string by default
		if (Ext.isFunction(wtype)) {
			wtype = wtype.wtype; //handle being passed the class, e.g. Ext.Component
		} else if (Ext.isObject(wtype)) {
			wtype = wtype.constructor.wtype; //handle being passed an instance
		}

		return !shallow ? ('/' + this.getWTypes() + '/').indexOf('/' + wtype + '/') != -1 : this.constructor.wtype == wtype;
	},
	/**
 	* getWTypes
 	* @returns {String} wtypes List of wtypes, separated by '/'
 	*/
	getWTypes : function() {
		var tc = this.constructor;
		if(!tc.wtypes) {
			var c = [], sc = this;
			while(sc && sc.constructor.wtype) {
				c.unshift(sc.constructor.wtype);
				sc = sc.constructor.superclass;
			}
			tc.wtypeChain = c;
			tc.wtypes = c.join('/');
		}
		return tc.wtypes;
	},
	/**
 	* serialize
 	* Traverses this object's properties which have been {@link #expose}d as serializable, and returns an object
 	* literal containing a hash of each of the properties, serialized by {@link Workspace.Components.serialize}.
 	* @param {Boolean} isChild true to serialize this object as a reference (ie: don't copy any of its properties; just
 	* save its id and wtype).
 	* @return {Object} serialized An object literal containing each of the serialized properties
 	*/
	serialize: function(isChild) {
		isChild = isChild || false;

		var out = {
			wtype: this.wtype,
			id: this.getId()
		};
		if (!isChild) {
			var o;
			for (var prop in this._serializable) {
				o = this.get(prop);
				o = Workspace.Components.serialize(o, true);
				out[prop] = o;
			}
		} else {
			out.isReference = true;
		}
		return out;
	},
	// deprecated
	deserialize: function(obj) {
		for (var prop in obj) {
			this.set(prop, Workspace.Utils.deserialize(obj[prop]));
		}
	},
	getReadableHash: function() {
		var out = {}, o;
		for (var prop in this._readable) {
			o = this.get(prop);
			o = Workspace.Components.serialize(o, true);
			out[prop] = o;
		}
		return out;
	},
	/**
 	* exposeAll
 	* Exposes all keys in a given object hash as properties of this object
 	* @param {Object} properties A hash containing as keys the properties to be exposed
 	*/
	exposeAll: function(obj) {
		for (var prop in obj) {
			this.expose(prop, true, true, true, true);
		}
	},
	/**
 	* expose
 	* Marks a property as readable with {@link #get} and/or writeable with {@link #set} and/or serializable with {@link #serialize}.
 	* @param {String} prop The name of the property to be exposed. This is the name that will be passed to {@link #get} and
 	* {@link #set}, but does not need to be an actual member property of this object, as long as a function or method is passed
 	* to readable and/or writeable
 	* @param {Array} mode (Optional) Preferred syntax; accepts an array as described in {@link Machine.nouns.modes}.
 	* @param {Boolean/Function/String} readable (Optional) true to mark <var>prop</var> as readable, false to mark as unreadable. A function
 	* or method name can be passed which will be invoked in the context of this object and will serve as an accessor; otherwise an
 	* accessor function will be generated which will return <var>this[prop]</var>. Defaults to false.
 	* @param {Boolean/Function/String} writeable (Optional) true to mark <var>prop</var> as writeable, false to mark as unwriteable. A function
 	* or method name can be passed which will be invoked in the context of this object and will serve as an accessor; otherwise an
 	* accessor function will be generated which will set <var>this[prop]</var> to the passed value. Defaults to false.
 	* @param {Boolean} serializable (Optional) true to include this property in serialized objects, false not to include it. The value serialized
 	* will be the value returned by {@link #get}, passed through {@link Workspace.Components.serialize}.
 	* @param {Boolean} user (Optional) true to mark as a user-defined property; false to mark as a system property. (Defaults to false)
 	*/
	expose: function(prop, readable, writeable, serializable, user) {
		if (Ext.isArray(readable)) {
			var mode = readable;
			readable = mode[0] || false;
			writeable = mode[1] || false;
			serializable = (mode[2] !== false);
			user = mode[3] || false;
		} else {
			readable = readable || false;
			writeable = writeable || false;
			serializable = (serializable !== false);
			user = user || false;
		}
		
		if (readable) {
			readable = (Ext.isFunction(readable) ? readable:
				(Ext.isFunction(this[readable]) ? this[readable] : readable));
			if (Ext.isFunction(readable)) {
				this._readable[prop] = readable;
				//readable.createDelegate(this);
			} else {
				this._readable[prop] = this._makeGetter(prop);
			}
		}
		if (writeable) {
			writeable = (Ext.isFunction(writeable) ? writeable:
				(Ext.isFunction(this[writeable]) ? this[writeable] : writeable));
			if (Ext.isFunction(writeable)) {
				this._writeable[prop] = writeable;
				//writeable.createDelegate(this);
			} else {
				this._writeable[prop] = this._makeSetter(prop);
			}
		}
		if (serializable) {
			this._serializable[prop] = true;
		}
		if (user) {
			this._userProperties[prop] = true;
		}

		this.fireEvent('meta', prop, {
			readable: readable,
			writeable: writeable,
			serializable: serializable,
			user: user
		});
	},
	/**
	 * exposeMany
	 * Applies {@link #expose} to each property
	 * @param {Object} properties Hash in the form property:mode. See {@link #expose}
	 */
	exposeMany: function(properties) {
		if(Ext.isObject(properties)) {
			_(properties).each(function(mode, key) {
				this.expose(key,mode);
			},this);
		}
	},
	/**
 	* _makeGetter
 	* Creates a getter function which returns <var>this[property]</var>
 	* @private
 	* @param {String} property
 	* @return {Function} getter
 	*/
	_makeGetter: function(property) {
		return Ext.bind(function(prop) {
			return this[prop];
		},this, [property], true);
	},
	/**
 	* _makeGetter
 	* Creates a getter function which sets <var>this[property]</var> to the passed <var>value</var>
 	* @private
 	* @param {@String} property
 	* @return {Function} setter
 	*/
	_makeSetter: function(property) {
		return Ext.bind(function(value, prop) {
			this[prop] = value;
		},this, [property], true);
	},
	/**
 	* get
 	* Returns the given property {@link #expose}d by this object, if that property is readable.
 	* @param {String} property
 	* @return {Mixed} value The value returned by invoking this property's accessor
 	*/
	get: function(property) {
		return (this._readable[property] ? this._readable[property].apply(this, Array.prototype.slice.call(arguments, 1)) : false);
	},
	/**
 	* has
 	* Reports whether this object {@link #expose}s the given property as readable.
 	* @param {String} property
 	* @return {Boolean} readable True if the property can be accessed by {@link #get}, false if it cannot.
 	*/
	has: function(property) {
		return (this._readable[property] ? true: false);
	},
	/**
 	* set
 	* Sets the given property to the given value, if the property is writeable. Fires the 'change' event, as well as
 	* change:(property). See {@link #change:*}
 	* @param {String} property The property to write to
 	* @param {Mixed} value The value to write
 	* @param {Object} options Options: silent – true to prevent events firing
 	*/
	set: function(property, value, options) {
		options || (options = {});
		options.silent || (options.silent = false);
		var old = this.get(property);
		this._previous[property] = old;
		if (this._writeable[property]) {
			options.silent = this._writeable[property].apply(this, Array.prototype.slice.call(arguments, 1)) || options.silent;
		}
		if(!options.silent) {
			this.change(property,value,old);	
		}
	},
	change: function(field,value,old) {
		this.fireEvent('change', field, value, old, this);
		this.fireEvent('change:' + field, value, old, this);
	},
	/**
	 * setMany
	 */
	setMany: function(properties,options) {
		_(properties).each(function(value, prop) {
			this.set(prop,value,options);
		},this);
	},
	/**
	 * previous
	 * Retrieves the previous value of the given key during {@link #change} events
	 * @param {String} property The property to retrieve
	 * @returns {Mixed} value The previous value
	 */
	previous: function(property) {
		return _.clone(this._previous[property]);
	},
	previousValues: function() {
		return this._previous;
	},
	realize: function() {
		// vestigial
	},
	/**
 	* onChange
 	* Sets an event listener to watch for changes to a given property
 	* @param {String} property The property to watch
 	*/
	onChange: function() {
		this.on.apply(this, ['change:' + arguments[0]].concat(Array.prototype.slice.call(arguments, 1)))
	},
	/**
 	* destroy
 	* Destroys the object. Fires the {@link #destroy} event
 	*/
	destroy: function() {
		this.fireEvent('destroy', this);
	}
});

Ext.define('Machine.nouns.Noun',{
	extend:'Machine.nouns.BaseNoun'
});

Ext.define('Machine.nouns.ComponentNoun',{
	mixins: {
		'base': 'Machine.nouns.BaseNoun'
	},
	superConstructor: function() {
		var _conf = Machine.nouns.ComponentNoun.prototype.constructor.apply(this,arguments);
		this.superclass.constructor.call(this,conf);
	},
	constructor: function(config) {
		Machine.nouns.BaseNoun.prototype.constructor.call(this,config);

		var _config = {}, items = config.items
		delete config.items;
		_(config).each(function(value,key) {
			// TODO: move this logic to Machine.nouns?
			if(value && value.wtype) {
				_config[key] = Machine.nouns.realize(value);
			} else {
				_config[key] = value;
			}
		});
		if(items) {
			_config.items = [];
			_(items).each(function(value) {
				if(value && value.wtype) {
					_config.items.push(Machine.nouns.realize(value));	
				} else {
					_config.items.push(value);
				}
			});
		}
		
		if(this.boundFields) {
			var apply, get, set;
			_.each(this.boundFields,function(exposedField,targetField) {
				apply = this.makeComponentApplyer(targetField);
				if(apply) {
					this['apply'+targetField.capitalize()] = apply;
					get = this.makeComponentGetter(targetField);
					set = this.makeComponentSetter(targetField);
					this.expose(exposedField,get,set,
						true,  // serializable
						false); // not a 'user' property
				} else {
					this.expose(exposedField,
						true,  // readable
 						true,  // writeable
						true,  // serializable
						false);
				}
			},this);
		}
		this.expose('items',true,true,false,false);
		this.expose('xtype',this.getXType,false,true,false);
		this.expose('wtype',true,false,true,false);
		this.wtype || (this.wtype = this.get('xtype'));

		return _config;
	},
	/**
	 * @private
	 * builds a function which is called by the Ext component's set_ method to invoke a 'change' event. Takes over the change()
	 * event firing from the normal set() function 
	 */
	makeComponentApplyer: function(targetField) {
		var apply = this['apply'+targetField.capitalize()];
		if(Ext.isFunction(apply)) {
			return _.bind(_.wrap(apply,function(f) {
				var q = f.apply(this,Array.prototype.slice.call(arguments, 1));
				this.change();
				return q;
			}),this);
		}
		return false;
	},
	makeComponentGetter: function(targetField) {
		return _.bind(this['get'+targetField.capitalize()],this._component);
	},
	/**
	 * @private
	 * builds a 'set' accessor function which invokes the native Ext set_ function and returns false to prevent 
	 * {@link ComponentNoun#set} from firing change events
	 */
	makeComponentSetter: function(targetField) {
		var set = this['set'+targetField.capitalize()];
		
		return _.bind(function(f) {
			return function() {
				f.apply(this,arguments);
				return false;
			}	
		}(set),this);
	},
	
	serialize: function(isRef,serialized) {
		isRef || (isRef = _.contains(serialized,this.getId()));
		if(!isRef) {
			var o = Machine.nouns.BaseNoun.prototype.serialize.call(this,isRef,serialized);
			if(this.items) {
				o.items = Machine.nouns.serialize(this.items,false);
			}
			return o;
		}
		Machine.nouns.BaseNoun.prototype.serialize.call(this,isRef,serialized);
		
	},
})

Ext.override(Ext.util.MixedCollection, {
	/**
 	* serialize
 	* See {@link SerializeableObject#serialize}
 	*/
	serialize: function(isChild) {
		isChild = isChild || false;
		var result = false;
		if (this.keys.length > 0) {
			result = {};
			this.eachKey( function(key, value) {
				result[key] = Workspace.Components.serialize(value, isChild);
			})
		} else {
			result = []
			this.each( function(value) {
				result.push(Workspace.Components.serialize(value, isChild));
			});
		}
		return result;
	}
});

Ext.define('Workspace.components.ComponentCollection',{
	extend: 'Ext.util.MixedCollection',
	getCommonWType: function() {
		var wtype = false, t = false;
		this.each( function(item) {
			if(!wtype) {
				wtype = item.wtype;
				t = Workspace.Components.getType(wtype);
			} else {
				while (!item.isWType(wtype) && t.superclass) {
					wtype = t.superclass.wtype;
					t = Workspace.Components.getType(wtype);
				}
			}
		});
		return wtype;
	},
	getCommonXType: function() {
		var xtype = false, t = false;
		this.each( function(item) {
			if(!xtype) {
				xtype = item.getXType();
				t = Ext.getClass(item);
			} else {
				while (!item.isXType(xtype) && t.superclass) {
					if(!t.superclass.xtype) {
						if(t.superclass.alias) {
							var a = t.superclass.alias.split('widget.');
							if(a.length>0) {
								xtype = _.last(a);
							} else {
								break;
							}
						} else {
							break;
						}
					} else {
						xtype = t.superclass.xtype;
					}
					if(xtype) {
						t = t.superclass; //Ext.ComponentManager.types[xtype];
					} else {
						break;
					}
				}
			}
		});
		return xtype;
	}
})
