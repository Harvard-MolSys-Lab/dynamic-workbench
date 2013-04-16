var LocalTask = require('./task-local'),
	events = require('events'),
	util = require('util'),
	fs = require('fs'),
	_ = require('underscore');

function SimpleTask(data) {
	LocalTask.apply(this,arguments);
};
util.inherits(SimpleTask,LocalTask);

SimpleTask.prototype.start = function(callback) {
	callback(null);
	var me = this;
	setTimeout(function() {
		me.emit('end',1);
	},1000);
};

SimpleTask.prototype.stop = function(callback) {
	callback(null);
};

SimpleTask.prototype.getOutputStream = function(callback) {
	if(!this.outstream) {
		this.outstream = fs.createReadStream('/home/webserver-user/app/server/server-tools/simple.js',{'encoding':'utf8'});
	}
	callback(null,this.outstream);
};

SimpleTask.module = 'simple';
SimpleTask.iconCls = 'tick';
SimpleTask.route = '/simple';

module.exports = SimpleTask;