/***********************************************************************************************
 * InfoMachine
 *
 *
 * Copyright (c) 2010-2011 Casey Grun
 *
 ***********************************************************************************************
 * ~/client/app.js
 *
 * Defines App namespace, various utility functions
 ***********************************************************************************************/

/**
 * @class App
 * Manages user data and contains several utility methods
 * @singleton
 */
App = new Ext.util.Observable();
Ext.apply(App, {

	name : 'DyNAMiC Workbench',
	nameFormatted : '<b>DyNAMiC</b> Workbench',
	version : '0.3.2a',
	isPreRelease : true,
	getFullTitle : function() {
		return App.name + ' (' + App.version + ')'
	},
	getFullTitleFormatted : function() {
		return '<span class="app-title"><span>' + App.nameFormatted + '</span> (' + App.version + ')</span>'
	},
	/**
	 * nextId
	 * Generates a random UUID
	 */
	nextId : function() {
		// if the time isn't unique enough, the addition
		// of random chars should be
		var t = String(new Date().getTime()).substr(4);
		var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		for(var i = 0; i < 4; i++) {
			t += s.charAt(Math.floor(Math.random() * 26));
		}
		return t;
	}
});

/**
 * loadData
 * Used for bootstrapping loading of saved workspace data. This method is invoked automatically by
 * controller code; do not call directly.
 */
App.loadData = function(data) {
	App._data = data;
}
/**
 * getLoadedData
 * Retrieves loaded workspace data
 */
App.getLoadedData = function() {
	return App._data;
}
App.getDefaultWorkspace = function() {
	return App.defaultWorkspace;
}
/**
 * @class App.endpoints
 * Allows configuration of AJAX callback URLs. Code making AJAX requests should call {@link #getEndpoint} with the
 * appropriate endpoint name to discover the URL.
 * PHP code in the view will automatically configure relevant endpoints by calling {@link #setEndpoint} immediately
 * after this file is loaded
 * @singleton
 */
App.endpoints = function() {
	var endpoints = {};
	return {
		/**
		 * Returns the endpoint of the given name
		 * @param {String} name Name of the endpoint
		 */
		getEndpoint : function(name) {
			return App.baseUrl + '/' + endpoints[name];
		},
		/**
		 * Sets the endpoint with the given name
		 * @param {String} name
		 * @param {String} value The URL of the endpoint
		 */
		setEndpoint : function(name, value) {
			endpoints[name] = value;
		}
	}
}();
/**
 * @member App
 */
App.getEndpoint = App.endpoints.getEndpoint;
/**
 * @member App
 */
 App.setEndpoint = App.endpoints.setEndpoint;

/**
 * @class App.ribbon
 * Allows configuration of ribbon toolbar
 * @singleton
 */
App.ribbon = function() {
	var ribbon = false;
	return {
		getRibbonItems : function() {
			return ribbon;
		},
		setRibbonItems : function(r) {
			ribbon = r;
		},
	}
}();
/**
 * @member App
 */
App.getRibbonItems = App.ribbon.getRibbonItems;
/**
 * @member App
 */
App.setRibbonItems = App.ribbon.setRibbonItems;

/**
 * @class App.Path
 * Contains utilities for working with paths
 * @singleton
 */
App.Path = App.path = {
	/**
	 * Appends the given extension to a filename, if it is not already included.
	 * @param {String} name
	 * @param {String} ext The extension
	 */
	addExt : function(name, ext) {
		if(_.last(name.split('.')) != ext) {
			return name + '.' + ext;
		} else {
			return name;
		}
	},
	/**
	 * Determines whether the given filename represents a folder
	 */
	isFolder : function(name) {
		return (name && !!App.Path.extname(name));
	},
	/**
	 * Joins several file paths.
	 * 		App.Path.join(['hello','world','file.txt']); // -> 'hello/world/file.txt'
	 */
	join : function() {
		if(arguments.length > 1) {
			paths = arguments;
		} else {
			paths = arguments[0];
		}
		return _.flatten(_.map(paths, function(p) {
		return p.split('/')
		})).join('/');
	},
	/**
	 * Returns the file extension of the path
	 * @param {String} path
	 */
	extname: function(path) {
		return _.last(App.Path.basename(path).split('.'));
	},
	/**
	 * Returns the last portion of the path (the portion following the final <var>/</var>)
	 */
	basename : function(path) {
		var a = path.split('/');
		return a.length > 0 ? _.last(a) : path;
	},
	/**
	 * Returns the last portion of the path, with a minimum length
	 * @param {String} path
	 * @param {Number} minLength
	 */
	pop : function(path, minLength) {Ext.isDefined(minLength) || ( minLength = 1);
		var a = path.split('/');
		return (a.length) > minLength ? a.slice(0,a.length-1).join('/') : path;
	},
	/**
	 * Returns <var>newPath</var> such that it is in the same directory as the file <var>oldPath</var>
	 * @param {String} oldPath
	 * @param {String} newPath
	 */
	sameDirectory : function(oldPath, newPath) {
		return App.Path.join(App.Path.pop(oldPath), newPath);
	},
	/**
	 * Returns a file in the same directory as <var>oldPath</var>, but with <var>ext</var>
	 * @param {String} oldPath
	 * @param {String} ext
	 */
	repostfix : function(oldPath, ext) {
		if(App.path.basename(oldPath).indexOf('.')!=-1) {
			oldPath = oldPath.split('.');
			oldPath.pop();
			return oldPath.concat([ext]).join('.');
		} else {
			return [oldPath,ext].join('.');
		}
	},
}

/**
 * @class App.User
 * Contains data about the currently logged-in user
 * @singleton
 */
App.User = {
	/**
	 * @property {Number}
	 * The user's ID
	 */
	id : -1,
	/**
	 * @property {String}
	 * The user's name
	 */
	name : false,
	/**
	 * @property {String}
	 * The user's email address
	 */
	email : false,
	/**
	 * Returns true if a user is logged in
	 * @return {Boolean}
	 */
	isLoggedIn : function() {
		return App.User.id != -1;
	},
	/**
	 * Loads data about the logged-in user. This method is invoked automatically by controller code; do not call
	 * directly.
	 * @param {Object} data Data blob with the keys <code>id</code>, <code>name</code>, and <code>email</code>
	 */
	setUser : function(data) {
		if(data.id) {
			App.User.id = data.id;
			App.User.name = data.name;
			App.User.email = data.email;
		}
	}
};

/**
 * @class App.TaskRunner
 * Runs tasks on the server
 */
Ext.define('App.TaskRunner', {
	statics : {
		/**
		 * Defines subclasses of {@link App.TaskRunner.Task} as members of {@link App.TaskRunner}. Called by server code
		 * in order to make configured server tools available on the client.
		 */
		loadTools : function(tasks) {
			_.each(tasks, function(def) {
				var name = _.compact(def.route.split('/'));
				name[name.length - 1] = _.last(name).capitalize();
				name = name.join('.');
				//def.route.replace(/\//g,'.');
				Ext.define('App.TaskRunner.' + name, Ext.apply(def, {
					extend : 'App.TaskRunner.Task'
				}, {
					iconCls : 'app',
				}));
			});
		},
		
		/**
		 * Runs a task using the given serverTool
		 * @param {String} serverTool Name of a member of App.TaskRunner; must be configred by server code calling {@link #loadTools}
		 * @param {Array} args Arguments to pass to the tool
		 * @param {Function} callback Function to call upon completion
		 */
		run : function(serverTool, args, callback) {
			if(Ext.ClassManager.get(['App.TaskRunner',serverTool].join('.'))) {
				var startDate = new Date(), target = 'local', task = Ext.create('App.TaskRunner.' + serverTool, {
					tool : serverTool,
					startDate : startDate,
					target : target,
				});
				this.taskStore.add(task);
				task.start(args, callback);
			}
		},
		register : function(serverTool, config) {
			this.serverTools[serverTool] = config;
		},
	},
});

/**
 * @member App
 * Shortcut for {@link App.TaskRunner#run}
 */
App.runTask = function() {
	App.TaskRunner.run.apply(App.TaskRunner, arguments);
}
/**
 * @class App.TaskRunner.Task
 * Represents a Task running on the server
 */
Ext.define('App.TaskRunner.Task', {
	extend : 'Ext.data.Model',
	endpoint : '',
	iconCls : '',
	timeout : 6000 * 60 * 1000,
	fields : [{
		name : 'tool',
		type : 'string',
	}, {
		name : 'startDate',
		type : 'date',
	}, {
		name : 'endDate',
		type : 'date'
	}, {
		name : 'target',
		type : 'string',
	}],
	callback : function() {
		return;
	},
	/**
	 * Logs the given message in a custom console group, named by {@link #getGroupName}
	 */
	log : function(msg, opts) {
		opts || ( opts = {});
		Ext.apply(opts, {
			group : this.getGroupName(),
			iconCls : this.iconCls
		});
		Ext.log(msg, opts);
	},
	/**
	 * Starts the task running on the server
	 */
	start : function(args, callback) {
		this.arguments = (args || {});
		this.callback = (callback || this.callback);
		this.onStart();
		this.log('Starting \"' + this.name + '\" task at ' + this.get('startDate') + ' on \"' + this.get('target') + '\"', {});
		var req = Ext.Ajax.request({
			url : this.endpoint,  //'/canvas/index.php/workspaces/save',
			method : 'POST',
			params : args,
			timeout : this.timeout,
			success : function(res) {
				this.end(res.responseText, args, true);
			},
			failure : function(res) {
				this.end(res.responseText, args, false);
				if(res.timedout == 0) {
					this.log('Error running task on tool: "' + this.name + '". Timeout at ' + this.timeout + 'ms (' + (this.timeout / 1000) + 's)');
				} else {
					this.log('Error running task on tool: "' + this.name + '". ' + res.responseText);
				}
			},
			scope : this
		});
		Ext.Ajax.clearTimeout(req);
	},
	/**
	 * Override this callback to provide custom logic on start of the task
	 */
	onStart : function() {

	},
	/**
	 * Called upon task completion
	 */
	end : function(text, args, success) {
		this.onEnd(text, args, success);
		if(Ext.isFunction(this.callback)) {
			this.callback(text, this.arguments, success);
		}
	},
	/**
	 * Returns the name of the tool concatenated with the start date
	 */
	getNameTimestamp: function() {
		return this.get('tool')+': '+this.get('startDate')+'';
	},
	/**
	 * Returns the name to display as the title of the group in the {@link Ext.debug.LogPanel}
	 */
	getGroupName : function() {
		return this.getNameTimestamp() + ' (' + (this.arguments.node ? this.arguments.node : 'no path') + ')'
	},
	onEnd : function(out, st, args) {
		this.log(out);
		if(this.arguments && this.arguments.node) {
			var path = App.Path.pop(this.arguments.node);
			App.ui.filesTree.refresh(App.DocumentStore.tree.getNodeById(path))
		}
	},
});

// Ext.define('App.TaskRunner.Pepper', {
// extend : 'App.TaskRunner.Task',
// name : 'Pepper Compiler',
// iconCls : 'pepper',
// endpoint : '/pepper',
// });
// Ext.define('App.TaskRunner.NupackAnalysis', {
// extend : 'App.TaskRunner.Task',
// name : 'NUPACK Complex Analysis',
// iconCls : 'nupack-icon',
// endpoint : '/nupack/analysis',
// });
// Ext.define('App.TaskRunner.NupackPairwise', {
// extend : 'App.TaskRunner.Task',
// name : 'NUPACK Pairwise Analysis',
// iconCls : 'nupack-icon',
// endpoint : '/nupack/pairwise',
// });
// Ext.define('App.TaskRunner.NupackSubsets', {
// extend : 'App.TaskRunner.Task',
// name : 'NUPACK Subsets Analysis',
// iconCls : 'nupack-icon',
// endpoint : '/nupack/subsets',
// });
// Ext.define('App.TaskRunner.Spurious', {
// extend : 'App.TaskRunner.Task',
// name : 'SpuriousC Design',
// iconCls : 'seq',
// endpoint : '/spurious',
// });

App.TaskRunner.taskStore = Ext.create('Ext.data.Store', {
	model : 'App.TaskRunner.Task',
	proxy : {
		type : 'memory',
		reader : 'json'
	},
	data : []
});

/**
 * @class App.Stylesheet
 * Contains various centrally configured visual information which can't be described in CSS (e.g. vector graphic
 * style properties for elements of the UI rendered by Raphael).
 * @singleton
 */
// TODO: move to external file
App.Stylesheet = {
	Highlight : {
		strokeWidth : 10,
		fill : '#FF9',
		stroke : '#FF9',
		opacity : 0.7,
		padding : 0
	},
	Draw : {
		fill : '#fff',
		'fill-opacity' : 0.5,
		stroke : '#000',
		'stroke-width' : '1px',
		'stroke-dasharray' : '--',
	},
	Proxy : {
		/**
		 * @cfg {Number} strokeWidth
		 * Width of the vector stroke
		 */
		strokeWidth : 0.5,  //'0.5px',
		/**
		 * @cfg {String} stroke
		 * Color of the vector stroke
		 */
		stroke : '#99BBE8',
		/**
		 * @cfg {String} fill
		 * Color of the fill
		 */
		fill : '#99BBE8',
		/**
		 * @cfg {Number} fillOpacity
		 * Opacity of the fill
		 */
		fillOpacity : 0.5,
		/**
		 * @cfg {Number} opacity
		 */
		opacity : 0.5,
	}

}

/**
 * @param {Object} o1: {source, eventName, handler}
 * @param {Object} o2: {source, eventName, handler}
 */
App.gluer = function(o1, o2) {
	this.id = App.getId();
	this.o1 = o1;
	this.o2 = o2;
	this.o1.source.on(o1.eventName, this.onO1, this);
	this.o2.source.on(o2.eventName, this.onO2, this);
	this.o1.source.on('destroy', this.destroy, this);
	this.o2.source.on('destroy', this.destroy, this);
	this.ignore = false;
}
Ext.extend(App.gluer, {
	onO1 : function() {
		if(!this.ignore) {
			this.ignore = true;
			this.o2.handler.apply(this.o2.source, arguments);
			this.ignore = false;
		}
	},
	onO2 : function() {
		if(!this.ignore) {
			this.ignore = true;
			this.o1.handler.apply(this.o1.source, arguments);
			this.ignore = false;
		}
	},
	destroy : function() {
		this.o1.source.un(o1.eventName, this.onO1, this);
		this.o2.source.un(o2.eventName, this.onO2, this);
		this.o1.source.un('destroy', this.destroy, this);
		this.o2.source.un('destroy', this.destroy, this);
		App.unglue(this.id, false)
	}
});

/**
 * App.glue({
 *   source: toolButton,
 *   eventName: 'toggle',
 *   handler: function(toggleState) {  }
 * })
 */
App.glue = function() {
	var gluers = {};
	App.unglue = function(id, destroy) {
		destroy = destroy || false;
		if(destroy && gluers[id]) {
			gluers[id].destroy();
		} delete
		gluers[id];
	};
	return function(o1, o2) {
		var g = new App.gluer(o1, o2);
		gluers[g.id] = g;
	};
}();
/**
 * App.mixin
 * @param {Function} target Class to which properties will be copied
 * @param {Function} source Class from which properties will be copied
 */
App.mixin = function(target, source) {
	Ext.override(target, source.prototype);
}
/**
 * @class App.registry
 * Allows creation of named type registries (e.g. classes can be registered)
 */
App.registry = function(tname) {
	this.tname = tname;
	var types = {};
	Ext.apply(this, {
		/**
		 * register
		 * Registers the passed <var>wtype</var> with a constructor so that objects deserialized with
		 * {@link Workspace.Components#deserialize}, {@link Workspace.Components#create}, {@link Workspace#createObject}, etc.
		 * may have their constructor automatically detected, similar to Ext's xtypes
		 * @param {String} typeName The canonical name of this type
		 * @param {Function} type The constructor function
		 */
		register : function(typeName, type) {
			types[typeName] = type;
			type.prototype[this.tname] = typeName;
			type[this.tname] = typeName;
		},
		/**
		 * getType
		 * Returns the class corresponding to the passed wtype
		 * @param {String} typeName The mneumonic name of the type to lookup
		 */
		getType : function(typeName) {
			return types[typeName];
		},
		hasType : function(typeName) {
			return (this.getType(typeName) != false)
		},
		/**
		 * create
		 * Instantiates an object of the passed class or configured wtype.
		 * @param {String} typeName
		 * @param {Object} config
		 */
		create : function(typeName, config) {
			if(this.hasType(typeName)) {
				var t = this.getType(typeName);
				return new t(config);
			}
		},
	});
};
