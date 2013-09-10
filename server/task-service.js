var _ = require('underscore'),
	events = require('events'),
	path = require('path'),
	Dispatcher = require('./dispatcher'),
	auth = require('auth'),
	utils = require('utils'),
	config = require('config'),

	async = require('async'), //
	validate = require('validator'); //
	
// Validate abbreviations
var check = validate.check, sanitize = validate.sanitize;

/**
 * @class JoinStore
 * Stores bidirectional mappings between keys (sources) and values (targets). 
 * One source can have several targets, and vice-versa
 *  
 */
function JoinStore () {
	var sources = {};
	var targets = {};
	_.extend(this,{

		/**
		 * Registers a (source,target) pair
		 * @param  {String} source One key of the pair
		 * @param  {String} target The other key
		 */
		register: function(source,target) {
			if(!sources[target]) {
				sources[target] = [];
			} 
			if(!targets[source]) {
				targets[source] = [];
			}
			sources[target].push(source);
			targets[source].push(target);
		},
		/**
		 * Unregisters a (source,target) pair
		 * @param  {String} source One key of the pair
		 * @param  {String} target The other key
		 */
		unregister: function unregister (source,target) {
			var i;
			if(sources[target]) {
				i = sources[target].indexOf(source);
				sources[target].splice(i,1);
			}
			if(targets[source]) {
				i = targets[source].indexOf(target);
				targets[source].splice(i,1);
			}
		},
		/**
		 * Gets the targets associated with a particular `source`
		 * @param  {String} source The `source` key
		 * @return {String[]} Array of values (`target`s) associated with the source
		 */
		getTargets: function getTargets (source) {
			return _.clone(targets[source]) || [];
		},
		/**
		 * Gets the sources associated with a particular `target`
		 * @param  {String} target The `target` value
		 * @return {String[]} Array of keys (`source`s) associated with the source
		 */
		getSources: function getSources (target) {
			return _.clone(sources[target]) || [];
		},
	});
}


var toolPath = config.tools.codePath;
var baseRoute = config.client.baseUrl;

/**
 * @class TaskService
 *
 * Realtime service managing starting, stopping, and data from server-side computational tools
 * 
 * @param  {Realtime} rt [description]
 * @param  {Object} options [description]
 */
function TaskService(rt, options) {
	var me = this,
		app = rt.app,
		io = rt.io;

	// Create store to track users' running Tasks
	this.userTaskStore = new JoinStore();

	// Create new Dispatcher to handle Tasks
	this.dispatcher = new Dispatcher(rt);

	// Generate list of tools
	var toolsList = require('./live-tools-list').list;
	me.tools = _.reduce(toolsList, function(memo, name) {
		modulePath = path.join(toolPath, name)
		utils.log({ level: 'info', message: 'Loading Tool: '+modulePath })
		memo[name] = require(modulePath);
		return memo;
	}, {});

	// Expose a list of tools to be automatically defined as {@link App.TaskRunner.Tool} subclasses on the client
	var clientParams = ['name', 'iconCls', 'route', 'module'], 
	clientTools = _.map(me.tools, function(tool, name) {
		var out = _.pick(tool,clientParams);
		out['module'] || (out['module'] = out['route']);
		out['endpoint'] = path.join(baseRoute, tool.route);
		return out;
	});
	app.get(path.join(baseRoute, '/toolslist'), auth.restrict('json'), function(req, res) {
		res.send('App.TaskRunner.loadTools(' + JSON.stringify(clientTools) + ')')
	});

	// Expose a list of running tasks to be automatically loaded when the client connects
	app.get(path.join(baseRoute,'/tasklist'), auth.restrict('json'), function(req, res) {
		var runningTasks = me.userTaskStore.getTargets(userId);
		res.send('App.TaskRunner.loadTasks(' + JSON.stringify(runningTasks) + ')')
	});

	// Handle incoming connections from new users
	io.of('/tasks').on('connection',function onConnect (socket) {
		
		// Get Express session data
		var user = auth.getUserData(socket.handshake);
		var userId = user.email;

		// Lookup existing tasks that the user is running
		var runningTasks = me.userTaskStore.getTargets(userId);
		for(var i=0; i<runningTasks.length; i++) {
			
			// Subscribe the user to recieve data from the task
			me.subscribe(runningTasks[i],socket);

			// Watch for the task to end
			me.watchForEnd(runningTasks[i], userId, socket);
		}

		// Listen for user requests to start tasks via io
		socket.on('start',function startTask (payload) {
			// TODO: Check if tool exists

			var input = me.processInputData(payload.toolName,payload.data);
			me.dispatcher.start(payload.toolName,input, function (err, taskId) {
				if(err) {
					utils.log({err:err,'message':'Unable to start task','toolName':payload.toolName,'userId':userId});
				}	
				me.startTaskHandler(taskId,userId,socket,payload);
			});
		});
	
		// Listen for user requests to stop tasks via io
		socket.on('stop',function stopTask (payload) {
			var taskId = payload.id;
			me.dispatcher.stopTask(taskId, function (err, status) {
				if(err) {
					utils.log({err:err,'message':'Unable to stop task','taskId':taskId,'userId':userId});
				}
				me.endTaskHandler(taskId,userId,socket,payload);			
			});
		});	

		// Listen for task input
		socket.on('input',function onInput (payload) {
			var room = payload.room, data = payload.data, taskId, task;
			taskId = me.dispatcher.getRoomTask(room);
			
			me.dispatcher.sendInput(taskId,data,function (err) {
				// TODO: error handling
			});
		})

	});

};

TaskService.prototype.processInputData = function(toolName, rawData) {
	var me = this,
		spec = me.tools[toolName],
		params = {};

	if(!spec || !spec.params) { return params; }

	// parse parameters
	for(var i=0; i<spec.params.length; i++) {
		var raw = rawData[spec.params[i]] || '';
		if(_.isString(raw)) {
			params[spec.params[i]] = sanitize(raw).xss();
		} else {
			params[spec.params[i]] = raw;
		}
	}

	// automatically translate file paths for the tools
	for(var destParamName in (spec.files || {})) {
		if(_.has(spec.files,destParamName)) {
			var sourceParamName = spec.files[destParamName],
				relFilePath = params[sourceParamName];
			params[destParamName] = path.resolve(utils.userFilePath(relFilePath));
		}
	}

	return params;
};

TaskService.prototype.startTaskHandler = function(taskId, userId, socket, data) {
	var me = this;

	// Remember that the user is running the associated task
	me.userTaskStore.register(userId,taskId);

	// Notify the client of the correct ID for the task
	socket.emit('identify',{tempId: data.tempId, taskId: taskId});

	// Subscribe the user to data from the task
	me.subscribe(taskId,socket);

	// Watch the dispatcher for events indicating the task has completed
	me.watchForEnd(taskId, userId, socket);

};

TaskService.prototype.endTaskHandler = function(taskId, userId, socket, data) {
	var me = this;

	// Forget that the user is running the associated task
	me.userTaskStore.unregister(userId,taskId);

	// Unsubscribe the user from data from the task
	me.unsubscribe(taskId,socket);

	// Notify the client that the task has ended
	socket.emit('end',{taskId: taskId, data:data});

};

TaskService.prototype.watchForEnd = function(taskId, userId, socket) {
	var me = this;

	// Watch for the task to end
	me.dispatcher.on('end:'+taskId,function(status) {
		me.endTaskHandler(taskId,userId,socket,status);
	});
};

TaskService.prototype.subscribe = function(taskId, socket) {
	var me = this;
	
	// Subscribe the user to data from the task
	socket.join(me.dispatcher.getTaskRoom(taskId));
};


TaskService.prototype.unsubscribe = function(taskId, socket) {
	var me = this;
	socket.leave(me.dispatcher.getTaskRoom(taskId));
};

TaskService.prototype.getTasksByUser = function(user) {
	return this.userTaskStore.getTargets(user);
};

TaskService.prototype.getUsersByTask = function(task) {
	return this.userTaskStore.getSources(task);
};

module.exports = TaskService;