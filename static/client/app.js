/* ***************************************************************************
 * InfoMachine
 *
 * Copyright (c) 2010-2011 Casey Grun
 * ***************************************************************************
 * ~/client/app.js
 *
 * Defines App namespace, various utility functions
 * ***************************************************************************/

/**
 * @class App
 * Manages user data and contains several utility methods
 * @singleton
 */
App = new Ext.util.Observable();
Ext.apply(App, {
	
	/**
	 * @property
	 */
	name : 'DyNAMiC Workbench',
	
	/**
	 * @property
	 * HTML-formatted version of the name
	 */
	nameFormatted : '<b>DyNAMiC</b> Workbench',
	
	/**
	 * @property
	 * Semver-formatted version number
	 */
	version : 'unknown',
	
	/**
	 * @property
	 * Identifies the app as release- or pre-release.
	 */
	isPreRelease : true,
	
	/**
	 * Returns the full title of the application
	 */
	getFullTitle : function() {
		return App.name + ' (' + App.version + ')'
	},
	
	/**
	 * Returns a formatted HTML version of the full title of the application
	 */
	getFullTitleFormatted : function() {
		return '<span class="app-title"><span>' + App.nameFormatted + '</span> (' + App.version + ')</span>'
	},
	
	/**
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
	},
	bootstrap: function() {
		App.fireEvent('load');
	},
});

/**
 * @method loadData
 * Used for bootstrapping loading of saved workspace data. This method is invoked automatically by
 * controller code; do not call directly.
 * @deprecated
 */
App.loadData = function(data) {
	App._data = data;
}
/**
 * @method getLoadedData
 * Retrieves loaded workspace data
 * @deprecated
 */
App.getLoadedData = function() {
	return App._data;
}
/**
 * @method getDefaultWorkspace
 * @deprecated
 */
App.getDefaultWorkspace = function() {
	return App.defaultWorkspace;
}
/**
 * @class App.Endpoints
 * Allows configuration of AJAX callback URLs. Code making AJAX requests should call {@link #getEndpoint} with the
 * appropriate endpoint name to discover the URL.
 * PHP code in the view will automatically configure relevant endpoints by calling {@link #setEndpoint} immediately
 * after this file is loaded
 * @singleton
 */
App.Endpoints = App.endpoints = function() {
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
 * @inheritdocs App.endpoints#getEndpoint
 * @member App
 */
App.getEndpoint = App.endpoints.getEndpoint;
/**
 * @inheritdocs App.endpoints#setEndpoint
 * @member App
 */
 App.setEndpoint = App.endpoints.setEndpoint;

/**
 * @class App.Ribbon
 * Allows configuration of ribbon toolbar
 * @singleton
 * @deprecated
 */
App.Ribbon = App.ribbon = function() {
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
 * @deprecated
 */
App.getRibbonItems = App.ribbon.getRibbonItems;
/**
 * @member App
 * @deprecated
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
	 * @alias #extname
	 */
	getExt: function(path) {
		return App.Path.extname(path);
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
	isGuest : function() {
		return !!App.User.name && (App.User.name.match(/guest/g) != null)
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
 * @class App.Files
 * Manages file-related metadata (e.g. file types)
 */
Ext.define('App.Files',{
	singleton: true,
	getType:function(ext) {
		return App.fileTypes[ext]
	},
	getDescription: function(ext) {
		if(ext == '') { return ''; }
		return this.getTypeProperty(ext,'description');
	},
	getDesc: function(ext) {
		return this.getDescription(ext);
	},
	getTypeDescription: function(ext) {
		return this.getDescription(ext);
	},
	getTypeDesc: function(ext) {
		return this.getDescription(ext);
	},
	getName: function(ext) {
		if(ext == '') { return 'Folder'; }
		return this.getTypeProperty(ext,'name');
	},
	getTypeName: function(ext) {
		return this.getName(ext);
	},
	getTypeProperty: function(ext,prop) {
		var t = this.getType(ext);
		if(t) { return t[prop]; }
	}
});


/**
 * @class App.TaskRunner
 * Runs tasks on the server
 */
Ext.define('App.TaskRunner', {
	statics : {
		/**
		 * Defines subclasses of {@link App.TaskRunner.Task} as members of {@link App.TaskRunner}. Called by server code
		 * in order to make configured server tools available on the client.
		 * @param {Object[]} tasks 
		 * A list of task configuration objects. Each task configuration object may contain the options below, as well as
		 * any arbitrary code to override members of the {@link App.TaskRunner.Task Task} class.
		 *
		 * @param {String} tasks.route Relative URL on the server at which the task may be started
		 * @param {String} tasks.name Name of the task
		 * @param {String} tasks.iconCls [description]
		 * 
		 */
		loadTools : function(tasks) {
			_.each(tasks, function(def) {
				var name = _.compact(def.route.split('/')),
				iconCls = def.iconCls || 'app';

				name[name.length - 1] = _.last(name).capitalize();
				name = name.join('.');

				Ext.define('App.TaskRunner.' + name, Ext.apply(def, {
					extend : 'App.TaskRunner.Task'
				}, {
					iconCls : iconCls,
				}));
			});
		},
		
		/**
		 * Runs a task using the given `serverTool`
		 * @param {String} serverTool 
		 * Name of a member of App.TaskRunner; must be configred by server code calling {@link #loadTools}
		 * 
		 * @param {Object} [args] 
		 * Arguments to pass to the tool
		 * 
		 * @param {Function} [callback] 
		 * Function to call upon completion
		 *
		 * @param {Object} [scope=window] 
		 * Scope in which to execute the callback
		 * 
		 * @param {Object} [config={}] 
		 * Contains arbitrary additional configuration options for the {@link App.TaskRunner.Task subclass}. Note:
		 * these properties will be directly {@link Ext.apply applied} to the object, rather than passed as 
		 * a configuration object, since App.TaskRunner.Task will interpret configuration objects as model fields.
		 *
		 * @return {App.TaskRunner.Task/Boolean} 
		 * If the `serverTool` exists, returns the App.TaskRunner.Task instance
		 */
		run : function(serverTool, args, callback, scope, config) {
			args || (args = {});
			config || (config = {});
			if(!!callback && !!scope) {
				callback = Ext.bind(callback,scope);
			}

			if(Ext.ClassManager.get(['App.TaskRunner',serverTool].join('.'))) {
				var startDate = new Date(), target = 'local', task = Ext.create('App.TaskRunner.' + serverTool, {
					tool : serverTool,
					startDate : startDate,
					target : target,
				});
				Ext.apply(task,config);
				
				this.taskStore.add(task);
				task.start(args, callback);
				return task;
			}
			return false;
		},
		
		/**
		 * Gets the App.TaskRunner.Task subclass associated with the passed server tool name.
		 * @param {String} serverTool 
		 * @return {App.TaskRunner.Task}
		 */
		get: function(serverTool) {
			return Ext.ClassManager.get(['App.TaskRunner',Ext.String.capitalize(serverTool)].join('.'));
		},
		
		getToolProperty: function(serverTool,name) {
			var tool = App.TaskRunner.get(serverTool);
			if(tool) {
				return tool.prototype[name];
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
	/**
	 * @cfg {String[]} openOnEnd
	 * String of filenames. If a `node` property is specified, when the {@link App#filesTree files tree} is reloaded,
	 * looks for these filenames and opens them if they now exist.
	 */

	/**
	 * Custom callback to be applied upon success or failure of the task. Note: if a `callback` parameter is provided to #start,
	 * this callback will be ignored.
	 * 
	 * @param  {String} responseText 
	 * Text of the server's response
	 * 
	 * @param  {Object} arguments 
	 * Original arguments passed to the task on #starte 
	 * 
	 * @param  {Boolean} success 
	 * true if the task completed successfully, false otherwise
	 */
	callback : function(responseText, arguments, success) {
		return;
	},
	/**
	 * Logs the given message in a custom console group, named by {@link #getGroupName}
	 */
	log : function(msg, opts) {
		opts || ( opts = {});
		Ext.apply(opts, {
			group : this.getGroupName(),
			iconCls : this.iconCls,
			silent: true,
		});
		App.log(msg, opts);
	},
	/**
	 * Starts the task running on the server
	 * @param {Object} args Arguments to be passed to the tool running on the server.
	 * @param {Function} callback Callback to be invoked upon task completion. See documentation at #callback.
	 */
	start : function(args, callback, options) {
		/**
		 * Hash of arguments to be sent to server
		 * @type {Object}
		 */
		this.arguments = (args || {});
		this.callback = (callback || this.callback);
		this.onStart();
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
					this.log(Ext.String.format('Error running task on tool: "{0}". Timeout at {1} s ({2} ms)',this.name,(this.timeout / 1000),this.timeout));
				} else {
					this.log(Ext.String.format('Error running task on tool: "{0}". {1}',this.name,res.responseText));
				}
			},
			scope : this
		});
		Ext.Ajax.clearTimeout(req);
	},
	/**
	 * Override this callback to provide custom logic on start of the task. By default, opens a log window and prints a message that the task has begun.
	 */
	onStart : function() {
		this.log(Ext.String.format("Starting task '{0}' at {1} on '{2}'",this.name,this.get('startDate'),this.get('target')), {});
	},

	/**
	 * Override this callback to provide custom logic on task end. By default, logs output and, if a `node` argument is 
	 * specified, refreshes that branch of the {@link App.ui.FilesTree}
	 * 
	 * @param  {String} responseText 
	 * Text of the server's response
	 * 
	 * @param  {Object} arguments 
	 * Original arguments passed to the task on #starte 
	 * 
	 * @param  {Boolean} success 
	 * true if the task completed successfully, false otherwise
	 */
	onEnd : function(out, st, args) {
		this.log(out);
		this.log(Ext.String.format("Completed task '{0}' at {1} on '{2}'",this.name,this.get('endDate'),this.get('target')),{});
		if(this.arguments && this.arguments.node) {
			var path = App.Path.pop(this.arguments.node);
			App.ui.filesTree.refreshDocument(App.DocumentStore.tree.getNodeById(path),function(recs,operation,success) {
				/**
				 * @event refresh
				 * Fires after the task has completed if files in the `node` parameter were reloaded.
				 * 
				 * @param {Ext.data.Model[]} recs Re-loaded records
				 * @param {Ext.data.Operation} operation Operation object representing the reload action
				 * @param {Boolean} success True if the reload was successful
				 */
				this.fireEvent('refresh',recs,operation,success);

				if(this.openOnEnd && success) {
					this.openFiles(this.openOnEnd,recs);
				}
			},this);
		}
	},

	/**
	 * Attempts to find records in `recs` with file names in `openOnEnd`, and open them.
	 * @param  {String[]} openOnEnd File names to search for
	 * @param  {App.Document[]} recs Records to search within
	 */
	openFiles: function(openOnEnd,recs) {
		for(var i=0; i<openOnEnd.length; i++) {
			var target = openOnEnd[i], child;
			for(var j=0; (j<recs.length && !child); j++) {
				if(recs[j].get('node') == target) {
					child = recs[j];
				} else {
					//child = recs[j].findChild('node',target);
				}
			}
			if(child) {
				App.ui.filesTree.open(child);
			}
		}
	},

	/**
	 * Called upon task completion
	 */
	end : function(text, args, success) {
		this.set('endDate',new Date());
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
 * @method gluer
 * @param {Object} o1: {source, eventName, handler}
 * @param {Object} o2: {source, eventName, handler}
 * @member App
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
 * @method glue
 * 
 *     App.glue({
 *       source: toolButton,
 *       eventName: 'toggle',
 *       handler: function(toggleState) {  }
 *     })
 * 
 *	@member App
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
 * @method mixin
 * @param {Function} target Class to which properties will be copied
 * @param {Function} source Class from which properties will be copied
 * @member App
 */
App.mixin = function(target, source) {
	Ext.override(target, source.prototype);
}


/**
 * @class App.Registry
 * Allows creation of named type registries (e.g. classes can be registered)
 */
App.Registry = function(tname) {
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
