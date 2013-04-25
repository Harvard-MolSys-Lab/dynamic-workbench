var child_process = require('child_process'),
	util = require('util'),
	_ = require('underscore'),
	Task = require('./task-local');

/**
 * @class BashTask
 * @extends {Task}
 */
function BashTask() {
	_.extend(this,{
		arguments: [],
		command: '',
	});
	Task.apply(this,arguments);
}
util.inherits(BashTask,Task);


/**
 * Builds the array of arguments to be passed to `child_process.spawn`. 
 * @return {Array} Arguments 
 */
BashTask.prototype.getArguments = function() {
	return this.arguments || [];
};

/**
 * Builds the command to be passed to `child_process.spawn`.
 * @return {String} Command
 */
BashTask.prototype.getCommand = function() {
	return this.command;
};

/**
 * Gets the options to be passed to `child_process.spawn`.
 * @return {Object} Options
 */
BashTask.prototype.getOptions = function() {
	return this.options || {
		cwd: this.cwd || null,
		stdio: this.stdio || 'pipe',
		env: this.env || process.env,
	};
};

/**
 * Starts the task
 * @param  {Object} data Arbitrary data to be passed to the task
 * @param  {Function} callback Callback to be executed once the task has begun
 * @param {Error} callback.err Error if task starts unsuccessfully, or `null` if task starts successfully
 */
BashTask.prototype.start = function(callback) {
	this.process = child_process.spawn(this.getCommand(), this.getArguments(), this.getOptions());
	this.process.stdout.pause();
	this.process.stdout.setEncoding('utf8');
	this.process.stderr.pause();
	this.process.stderr.setEncoding('utf8');
	
	this.process.on('exit',_.bind(this.endTaskCallback,this));
	callback(null);
};

/**
 * Stops the task
 * @param  {Function} callback Callback to be executed once the task has stopped
 * @param {Error} callback.err Error if one occurs while stopping the task, else null
 * @return {[type]} [description]
 */
BashTask.prototype.stop = function(callback) {
	this.process.kill();
	callback(null);
};

/**
 * @protected
 */
BashTask.prototype.endTaskCallback = function(status) {
	this.emit('end',status);
};

/**
 * Gets the input {@link Stream} associated with this Task.
 * @param  {Function} callback Callback to be executed once the {@link Stream} is retrieved
 * @param {Error} callback.err Error if one occurs while retrieving the input stream, or null if no error occurrs
 * @param {Stream} callback.stream Writable stream to provide input to this tool, or null if an error occurs
 */
BashTask.prototype.getInputStream = function(callback) {
	if(this.process) {
		callback(null,this.process.stdin)
		//this.process.stdin.resume();		
	} else {
		callback(null,null);
	}
};

/**
 * Gets the readable output {@link Stream} associated with this Task.
 * @param  {Function} callback Callback to be executed once the {@link Stream} is retrieved
 * @param {Error} callback.err Error if one occurs while retrieving the input stream, or null if no error occurrs
 * @param {Stream} callback.stream Readable stream to read output from this task, or null if an error occurs
 */
BashTask.prototype.getOutputStream = function(callback) {
	if(this.process) {
		callback(null,this.process.stdout)
		this.process.stdout.resume();		
	} else {
		callback(null,null);
	}
};


/**
 * Gets the readable error {@link Stream} associated with this Task.
 * @param  {Function} callback Callback to be executed once the {@link Stream} is retrieved
 * @param {Error} callback.err Error if one occurs while retrieving the error stream, or null if no error occurrs
 * @param {Stream} callback.stream Readable stream to read errors from this task, or null if an error occurs
 */
BashTask.prototype.getErrorStream = function(callback) {
	if(this.process) {
		callback(null,this.process.stderr)
		this.process.stderr.resume();		
	} else {
		callback(null,null);
	}
};

module.exports = BashTask;