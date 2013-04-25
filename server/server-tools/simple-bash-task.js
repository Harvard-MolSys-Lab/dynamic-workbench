var BashTask = require('./task-local-bash'),
	events = require('events'),
	util = require('util'),
	fs = require('fs'),
	_ = require('underscore');

function SimpleBashTask(data) {
	BashTask.apply(this,arguments);
};
util.inherits(SimpleBashTask,BashTask);

/**
 * Builds the array of arguments to be passed to `child_process.spawn`. 
 * @return {Array} Arguments 
 */
SimpleBashTask.prototype.getArguments = function() {
	return ['-u','/home/webserver-user/app/tools/etc/test.py'];
};

/**
 * Builds the command to be passed to `child_process.spawn`.
 * @return {String} Command
 */
SimpleBashTask.prototype.getCommand = function() {
	return 'python';
};

SimpleBashTask.module = 'simple-bash-task';
SimpleBashTask.iconCls = 'tick';
SimpleBashTask.route = '/simple-bash-task';

module.exports = SimpleBashTask;