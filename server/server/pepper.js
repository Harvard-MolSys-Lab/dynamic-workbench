var utils = require('utils'), //
	proc = require('child_process'), //
	path = require('path')
	fs = require('fs'), //
	_ = require('underscore'), //
	async = require('async'), //
	winston = require('winston'); //
	
var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath, getCommand = utils.getCommand;

var commands = {
	pepper : {
		command : 'python',
		arguments : ['tools/circuit_compiler/compiler.py'],
	},
}

exports.name = 'Pepper Compiler';
exports.iconCls = 'pepper';
exports.params = ['node'];
exports.start = function(req, res, params) {
	var node = params['node'], fullPath = "'" + path.resolve(utils.userFilePath(node)) + "'", cmd = getCommand(commands['pepper'], [fullPath]);
	winston.log("info",cmd);
	proc.exec(cmd, function(err, stdout, stderr) {
		if(err) {
			winston.log("error", "pepper: Execution error. ", {
				cmd : cmd,
				stderr : stderr,
				stdout : stdout,
				err : err
			});
		}
		res.send(stdout);
	})
};
