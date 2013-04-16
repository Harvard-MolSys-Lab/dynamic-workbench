var events = require('events'),
	util = require('util'),
	_ = require('underscore');

/**
 * @class Task
 */
function Task(config) {
	events.EventEmitter.call(this);
	_.extend(this,config);
	/**
	 * @event start
	 * Fires when the task begins execution
	 */
	/**
	 * @event stop
	 * Fires when task execution is halted by intervention
	 */
	/**
	 * @event end
	 * Fires when the task completes (successfully or not)
	 * @param {Mixed} status Status of the task
	 */
};

util.inherits(Task,events.EventEmitter);

/**
 * Starts the task
 * @param  {Object} data Arbitrary data to be passed to the task
 * @param  {Function} callback Callback to be executed once the task has begun
 * @param {Error} callback.err Error if task starts unsuccessfully, or `null` if task starts successfully
 */
Task.prototype.start = function(data, callback) {
	// body...
};

/**
 * Stops the task
 * @param  {Function} callback Callback to be executed once the task has stopped
 * @param {Error} callback.err Error if one occurs while stopping the task, else null
 * @return {[type]} [description]
 */
Task.prototype.stop = function(callback) {
	// body...
};

/**
 * Gets the input {@link Stream} associated with this Task.
 * @param  {Function} callback Callback to be executed once the {@link Stream} is retrieved
 * @param {Error} callback.err Error if one occurs while retrieving the input stream, or null if no error occurrs
 * @param {Stream} callback.stream Writable stream to provide input to this tool, or null if an error occurs
 */
Task.prototype.getInputStream = function(callback) {

};

/**
 * Gets the readable output {@link Stream} associated with this Task.
 * @param  {Function} callback Callback to be executed once the {@link Stream} is retrieved
 * @param {Error} callback.err Error if one occurs while retrieving the input stream, or null if no error occurrs
 * @param {Stream} callback.stream Readable stream to read output from this task, or null if an error occurs
 */
Task.prototype.getOutputStream = function(callback) {

};

/**
 * Gets the readable error {@link Stream} associated with this Task.
 * @param  {Function} callback Callback to be executed once the {@link Stream} is retrieved
 * @param {Error} callback.err Error if one occurs while retrieving the error stream, or null if no error occurrs
 * @param {Stream} callback.stream Readable stream to read errors from this task, or null if an error occurs
 */
Task.prototype.getErrorStream = function(callback) {

};

module.exports = Task;