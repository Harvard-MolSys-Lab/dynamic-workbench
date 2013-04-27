var BashTask = require('./task-local-bash'),
	child_process = require('child_process'),
	util = require('util');

/**
 * @class NodeTask
 * @extends {Task}
 */
function NodeTask() { 
	BashTask.apply(this,arguments);
}
util.inherits(NodeTask,BashTask);

NodeTask.prototype.getModule = function() {
	return this.module;
};

/**
 * Starts the task
 * @param  {Object} data Arbitrary data to be passed to the task
 * @param  {Function} callback Callback to be executed once the task has begun
 * @param {Error} callback.err Error if task starts unsuccessfully, or `null` if task starts successfully
 */
NodeTask.prototype.start = function(callback) {
	this.process = child_process.exec('node', [this.getModule()].concat(this.getArguments()), this.getOptions());
	this.process.stdout.pause();
	this.process.stdout.setEncoding('utf8');
	this.process.stderr.pause();
	this.process.stderr.setEncoding('utf8');
	this.process.on('exit',_.bind(this.endTaskCallback,this));
	callback(null);
};

module.exports = NodeTask;