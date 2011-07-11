var utils = require('../utils'), 
proc = require('child_process'), 
fs = require('fs'), 
_ = require('underscore'), 
async = require('async'),
DNA = require('../static/client/lib/dna-utils').DNA;

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
	var node = params['node'], fullPath = "'" + path.resolve(utils.userFilePath(node)) + "'", 
	cmd = getCommand(commands['pepper'], [fullPath]);
	console.log(cmd);
	proc.exec(cmd, function(err, stdout, stderr) {
		if(err) {
			console.log(err);
		}
		res.send(stdout);
	})
};
