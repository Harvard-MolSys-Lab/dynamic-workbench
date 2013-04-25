var utils = require('utils'), //
	util = require('util'), //
	config = require('config'), //
	events = require('events'), // 
	auth = require('auth'), //
	DNA = require('dna'), //
	proc = require('child_process'), //
	fs = require('fs'), //
	path = require('path'), //
	_ = require('underscore'), //
	async = require('async'), //
	validate = require('validator'), //
	winston = require('winston');


var toolPath = config.tools.codePath;
var baseRoute = config.client.baseUrl;


/* ------------------------------------------------------------------------ */

function Store() {
	var data = {};
	_.extend(this,{
		get: function get (name) {
				return data[name];
		},
		register: function register (name, object) {
			data[name] = object;
		},
		unregister: function unregister (name) {
			var object = this.get(name);
			delete data[name];
		},
		getAll: function getAll () {
			return _.clone(data);
		},
	});
}

function MultiStore() {
	var data = {};
	_.extend(this,{
		get: function get (name) {
				return _.clone(data[name]) || [];
		},
		register: function register (name, object) {
			if(!data[name]){
				data[name] = [];
			}
			data[name].push(object);
		},
		unregister: function unregister (name, object) {
			var i = -1;
			if(data[name]) { 
				i = data[name].indexOf(object);
			}
			if(i != -1) {
				data[name].splice(i,1);
			}
			return object;
		},
		unregisterAll: function unregisterAll (name) {
			var objects = this.get(name);
			delete data[name];
			return objects;
		},
		getAll: function getAll () {
			return _.clone(data);
		},
	}); 
}



/* ------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------ */

/**
 * @class Dispatcher
 * @param  {Realtime} rt [description]
 */
function Dispatcher(rt) {
	events.EventEmitter.call(this);

	/**
	 * @property {Store} tasks 
	 * Store containing the tasks managed by this Dispatcher
	 */
	this.tasks = new Store();
	
	/**
	 * @property {Store} inputStreams
	 * Store containing the input streams for various tasks
	 */
	this.inputStreams = new Store();
	
	this.rt = rt;
};
util.inherits(Dispatcher,events.EventEmitter);

module.exports = Dispatcher;

/**
 * Pipes data to users via socket.io by calling {@link #rt}.{@link Realtime#iopipe iopipe}.
 * @param  {[type]} stream [description]
 * @param  {[type]} room [description]
 * @param  {[type]} event [description]
 * @return {[type]} [description]
 */
Dispatcher.prototype.iopipe = function(stream,room,event) {
	this.rt.iopipe(stream,'/tasks',room,event);
};

/**
 * Generates a new UUID
 * @return {String} uuid
 */
Dispatcher.prototype.getUUID = function() {
	// TODO: Replace with something better
	// if the time isn't unique enough, the addition
	// of random chars should be
	var t = String(new Date().getTime()).substr(4);
	var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for(var i = 0; i < 4; i++) {
		t += s.charAt(Math.floor(Math.random() * 26));
	}
	return t;
};

/**
 * Starts a Task with the passed `toolName` and `data`
 * @param  {String} toolName Name of the module containing the Tool class
 * @param  {Object} data Arbitrary data to be passed to the Tool
 * @param  {Function} cb Callback to be executed upon starting the Task
 * @param  {Error} cb.err Error if Task starts unsuccessfully	
 * @param {String} cb.taskId The ID of the Task object if started successfully
 */
Dispatcher.prototype.start = function(toolName,data,cb) {
	var me = this,
		toolClass = require(path.join(toolPath,toolName)),
		// TODO: Error handling
		task, taskId, taskRoom;

		if(!toolClass) {
			cb(new Error('Unknown tool' + toolName));
		}

		task = new toolClass(data);
		taskId = this.getUUID();
		taskRoom = this.getTaskRoom(taskId);

	task.id = taskId;
	this.tasks.register(taskId,task);
	
	// Attempt to start the task
	task.start(function (err) {

		// Report errors if the task starts unsuccessfully
		if(err) {
			return cb(err,null);
		}

		// Send the output and error streams to the client
		task.getOutputStream(function(err, outStream) {
			me.iopipe(outStream,taskRoom,'stream');
		});
		task.getErrorStream(function(err, errStream) {
			me.iopipe(errStream,taskRoom,'error');
		});
		task.getInputStream(function (err,inStream) {
			me.inputStreams.register(taskId, inStream)
		})
		
		// Handle the task's completion (successfully or unsuccessfully)
		task.on('end',function(status) {
			me.endTaskHandler(task.id,status);
		});

		me.emit('start',task.id);
		cb(null,task.id);
	});
};

/**
 * Stops the Task with the given ID
 * @param  {String} id Task ID
 * @param  {Function} cb Callback to be executed upon stopping the Task
 * @param {Error} cb.err Error if the Task stops unsuccessfully
 * @param {Mixed} cb.status Status if the task is stopped successfully
 */
Dispatcher.prototype.stop = function(id,cb) {
	var task = this.tasks.get(id);
	var me = this;

	if(!task) {
		// TODO: error handling
	}
	task.stop(function(err,status) {
		me.endTaskHandler(id,status);
	});
};

/**
 * Sends input to the associated task
 * @param  {String} taskId 
 * @param {Mixed} input The input data
 * @param  {Function} callback 
 * @param {Error} callback.err 
 */
Dispatcher.prototype.sendInput = function(taskId,input,callback) {
	var inputStream = this.inputStreams.get(taskId);
	if(inputStream) {
		inputStreams.write(input,'utf8'); 
		callback(null);
	} else {
		callback(new Error("Unable to write input to stream; input stream for taskId '"+taskId+"' could not be found."));
	}
};

/**
 * Tries to report error information related to a task to associated clients
 * @param  {String} taskId ID of the task
 * @param {Object} err Error data
 * @param {Function} callback 
 * @param {Error} callback.err Error if one occurs during error reporting
 */
Dispatcher.prototype.reportError = function(taskId,err,callback) {
	var room = this.getTaskRoom(taskId);
	this.rt.iopush(err,'/tasks',room,'error');
	callback(null);
};

/**
 * Gets the task with the associated id
 * @param  {String} taskId id of the task
 * @param {Function} callback
 * @param {Error} callback.err 
 * @param {Task} callback.task The Task object 
 */
Dispatcher.prototype.getTask = function(taskId, cb) {
	return cb(null,this.tasks.get(taskId));
};

/**
 * @private
 * Returns the socket.io room corresponding to the task
 * @param  {String} id The ID of the task 
 * @return {String} The name of the socket.io room
 */
Dispatcher.prototype.getTaskRoom = function(id) {
	return 'task/'+id;
};

/**
 * @private
 * Returns the task ID corresponding to the socket.io room; opposite of #getTaskRoom
 * @param  {String} room The name of the socket.io room
 * @return {String} The ID of the task
 */
Dispatcher.prototype.getRoomTask = function(room) {
	return _.last(room.split('task/'));
};

Dispatcher.prototype.endTaskHandler = function(id,status) {
	this.tasks.unregister(id);
	this.emit('end',id,status);
	this.emit('end:'+id,status);
};