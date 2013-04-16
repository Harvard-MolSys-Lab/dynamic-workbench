var child_process = require('child_process');
var Task = require('task-local');

/**
 * @class NodeTask
 * @extends {Task}
 */
function NodeTask() { 
	BashTask.apply(this,arguments);
}
utils.inherits(NodeTask,BashTask);

NodeTask.prototype.getCommand = function() {
	return this.module;
};

/**
 * Starts the task
 * @param  {Object} data Arbitrary data to be passed to the task
 * @param  {Function} callback Callback to be executed once the task has begun
 * @param {Error} callback.err Error if task starts unsuccessfully, or `null` if task starts successfully
 */
NodeTask.prototype.start = function(data, callback) {
	this.process = child_process.fork(this.getCommand(), this.getArguments(), this.getOptions());
	child_process.on('exit',_.bind(this.endTaskCallback,this));
	callback(null);
};