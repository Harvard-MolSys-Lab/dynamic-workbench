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

/**
 * @static
 * @property {String[]} params 
 * An array of parameters accepted by this Task and expected in the `data` parameter of the constructor. 
 * When the task is started, the client will pass, via socket.io, an object containing some amount of 
 * input data along with the request to start the task. This data is 
 * {@link TaskService#processInputData processed} by the {@link TaskService} to guard against cross-site 
 * scripting and overflow attacks. In order for this processing to occur, the Task subclass must 
 * explicitly whitelist the names of the parameters it expects to recieve, via this static property.
 *
 * See also: #files
 */
/**
 * @static
 * @property {Object} files 
 * A hash specifying some {@link #params expected parameter names} which should be treated as file paths relative to
 * the requesting user's home directory, and should be converted to absolute file paths before being passed to the 
 * task constructor. 
 *   
 * Keys of this object represent names of _new_ parameters which should be passed to the `data` parameter of this 
 * subclass's constructor. Values represent names of parameters expected from the input data. For instance, if the
 * value of #files were this:
 *
 *     {
 *         'inputFile':'node'
 *     }
 *
 * ...and the input data from the client were this:
 *
 *     {
 *         'node':'some/relative/file/path/input.txt'
 *     }
 *
 * ...then the value of the parameter `node` in the input data would be parsed, and an absolute path would be derived. 
 * If the user requesting the task was example@example.com, then the `data` passed to the constructor would be as 
 * follows:
 *
 *     {
 *         'node':'some/relative/file/path/input.txt',
 *         'inputFile':'/absolute/path/to/user/home/directories/example@example.com/some/relative/file/path/input.txt'
 *     }
 *
 * Note that the original parameter remains in the input.
 */

module.exports = Task;