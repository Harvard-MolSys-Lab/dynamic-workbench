var NodeTask = require('./task-local-node'),
	JSONStream = require('json-stream'),
	events = require('events'),
	util = require('util'),
	utils = require('utils'),
	fs = require('fs'),
	_ = require('underscore'),
	path = require('path');

/**
 * Creates a new DDTask
 * @param {Object} data 
 * @param {Object} data.state Object containing the state of the designer to load.
 */
function DDTask(data) {
	NodeTask.apply(this,arguments);

	this.module = '../../tools/dd/dd-worker.js';
	this.state = data.state;
}
util.inherits(DDTask,NodeTask);

DDTask.prototype.start = function(callback) {
	NodeTask.prototype.start.call(this,_.bind(function() {
//		this.outStream = new JSONStream();
//		this.process.stdout.pipe(this.outStream);

		callback.apply(global,arguments);
		this.process.stdin.write(JSON.stringify(this.state),'utf8');
		this.process.stdout.pipe(fs.createWriteStream('/home/webserver-user/test/dd.out',{encoding: 'utf8'}));

	},this));
};

// DDTask.prototype.getOutputStream = function(callback) {
// 	if(this.process) {
// 		callback(null,this.outStream);
// 		this.process.stdout.resume();
// 		this.outStream.resume();
// 	} else {
// 		callback(null,null);
// 	}
// };


DDTask.params = ['state'];

DDTask.module = 'dd';
DDTask.iconCls = 'dd';
DDTask.route = '/dd';

module.exports = DDTask;