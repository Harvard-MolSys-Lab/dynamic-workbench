/**
 * @class Machine.core.Serializable
 * @alias SerializableObject
 * Encapsulates functionality for storing and retrieving key value pairs and automatically serializing them.
 * @extends Ext.util.Observable
 */
Ext.define('Machine.core.Serializable', {
	extend: 'Ext.util.Observable',
	alias: 'SerializableObject',
	constructor: function() {
		/**
		 * @property {String} wtype
		 * The canonical name of the type which this object represents. Inspired by {@link Ext.Component#xtype}.
		 */
		
		this.callParent(arguments);
		//this.superclass.constructor.apply(this,arguments);
		//this.mixins.observable.constructor.apply(this,arguments);
		
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
		
		this.addEvents(
		/**
		 * @event
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
		 * @event change:*
		 * Fires when <var>x</var> is {@link #set}
		 * @param {Mixed} newValue
		 * @param {Mixed} oldValue
		 * @param {Mixed} obj This
		 */
		);
	},
	/**
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
	 * Alias for #isWType
	 */
	hasWType : function() {
		return this.isWType.apply(this,arguments);
	},
	/**
	 * Determines whether the class implements the passed wtype
	 * @param {String/Ext.Class/Machine.core.Serializable/String[]} wtype Type name or object to check. If an array of strings is passed, will return true if the object implements any of the wtypes.
	 * @param {Boolean} shallow True to check only if this object implements the passed wtype (not subclasses; defaults to false)
	 */
	isWType : function(wtype, shallow) {
		//assume a string by default
		if (Ext.isFunction(wtype)) {
			wtype = wtype.wtype; //handle being passed the class, e.g. Ext.Component
		} else if (Ext.isObject(wtype)) {
			wtype = wtype.constructor.wtype; //handle being passed an instance
		} else if (Ext.isArray(wtype)) {
			var str = ('/' + this.getWTypes() + '/');
			if(shallow) {
				return _.reduce(wtype,function(memo,wt) {
					return memo || this.constructor.wtype == wt;
				},false);
			} 
			else {
				return _.reduce(wtype,function(memo,wt) {
					return memo || str.indexOf('/' + wt + '/') != -1;
				},false);
			}
		}

		return !shallow ? ('/' + this.getWTypes() + '/').indexOf('/' + wtype + '/') != -1 : this.constructor.wtype == wtype;
	},
	/**
	 * Returns a slash (<var>/</var>) separated list of {@link #wtype}s that this class implements
	 */
	getWTypes : function() {
		var tc = this.constructor;
		if(!tc.wtypes) {
			var c = [], sc = this;
			while(sc && sc.wtype) {
				c.unshift(sc.wtype);
				sc = sc.superclass;
			}
			tc.wtypeChain = c;
			tc.wtypes = c.join('/');
		}
		return tc.wtypes;
	},
	/**
	 * Traverses this object's properties which have been {@link #expose}d as serializable, and returns an object
	 * literal containing a hash of each of the properties, serialized by {@link Workspace.Components#serialize}.
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
	/**
	 * Returns a hash of properties marked as <var>readable</var> with {@link #expose}.
	 */
	getReadableHash: function() {
		var out = {}, o;
		for (var prop in this._readable) {
			o = this.get(prop);
			if(o && o.getId) { o = o.getId(); }
			// o = Workspace.Components.serialize(o, true);
			out[prop] = o;
		}
		return out;
	},
	/**
	 * Exposes all keys in a given object hash as properties of this object
	 * @param {Object} properties A hash containing as keys the properties to be exposed
	 */
	exposeAll: function(obj) {
		for (var prop in obj) {
			this.expose(prop, true, true, true, true);
		}
	},
	/**
	 * Marks a property as readable with {@link #get} and/or writeable with {@link #set} and/or serializable with {@link #serialize}.
	 * @param {String} prop The name of the property to be exposed. This is the name that will be passed to {@link #get} and
	 * {@link #set}, but does not need to be an actual member property of this object, as long as a function or method is passed
	 * to readable and/or writeable
	 * @param {Boolean/Function/String} readable (Optional) true to mark <var>prop</var> as readable, false to mark as unreadable. A function
	 * or method name can be passed which will be invoked in the context of this object and will serve as an accessor; otherwise an
	 * accessor function will be generated which will return <var>this[prop]</var>. Defaults to false.
	 * @param {Boolean/Function/String} writeable (Optional) true to mark <var>prop</var> as writeable, false to mark as unwriteable. A function
	 * or method name can be passed which will be invoked in the context of this object and will serve as an accessor; otherwise an
	 * accessor function will be generated which will set <var>this[prop]</var> to the passed value. Defaults to false.
	 * @param {Boolean} serializable (Optional) true to include this property in serialized objects, false not to include it. The value serialized
	 * will be the value returned by {@link #get}, passed through {@link Workspace.Components#serialize}.
	 * @param {Boolean} user (Optional) true to mark as a user-defined property; false to mark as a system property. (Defaults to false)
	 */
	expose: function(prop, readable, writeable, serializable, user) {
		readable = readable || false;
		writeable = writeable || false;
		serializable = (serializable !== false);
		user = user || false;

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
		if(value != this._previous[property]) {
			var old = this.get(property);
			this._previous[property] = old;
			if (this._writeable[property]) {
				options.silent = this._writeable[property].apply(this, Array.prototype.slice.call(arguments, 1)) || options.silent;
			}
			if(!options.silent) {
				this.change(property,value,old);	
			}
		}
	},
	/**
	 * Fires the {@link #change} and {@link #change:*} events
	 */
	change: function(field,value,old) {
		this.fireEvent('change', field, value, old, this);
		this.fireEvent('change:' + field, value, old, this);
	},
	/**
	 * Applies {@link #set} on each field in <var>properties</var>
	 * @param {Object} properties
	 * @param {Object} options To be passed to {@link #set}
	 */
	setMany: function(properties,options) {
		_(properties).each(function(value, prop) {
			this.set(prop,value,options);
		},this);
	},
	/**
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
 	* Sets an event listener to watch for changes to a given property
 	* @param {String} property The property to watch
 	*/
	onChange: function() {
		this.on.apply(this, ['change:' + arguments[0]].concat(Array.prototype.slice.call(arguments, 1)))
	},
	/**
	 * Destroys the object. Fires the {@link #destroy} event
	 */
	destroy: function() {
		this.fireEvent('destroy', this);
	}
});

Ext.override(Ext.util.MixedCollection, {
	/**
	 * See {@link Machine.core.Serializable#serialize}
	 * @member Ext.util.MixedCollection
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
