var utils = require('../utils'),
proc = require('child_process'),
fs = require('fs'),
_ = require('underscore'),
async = require('async');

sendError = utils.sendError,
forbidden = utils.forbidden,
allowedPath = utils.allowedPath,
getCommand = utils.getCommand;

exports.name = 'SpuriousC Sequence Design';
exports.iconCls = 'seq';
exports.params = ['node'];
exports.start = function(req, res, params) {
	var node = params['node'], prefix = path.basename(node), fullPath = path.resolve(utils.userFilePath(node)),
	//rs = path.join(fullPath,prefix+'.rS'),
	st = path.join(fullPath, prefix + '.St'), wc = path.join(fullPath, prefix + '.wc'), eq = path.join(fullPath, prefix + '.eq'), out = 'output="' + path.join(fullPath, prefix + '.seq') + '"', bored = 'bored=1000';
	quiet = 'quiet=TRUE';
	cmd = getCommand('spuriousC', ['template=$st wc=$wc eq=$eq', out, bored]);
	console.log(cmd);
	proc.exec(cmd, {
		env : {
			st : st,
			wc : wc,
			eq : eq,
		},
	}, function(err, stdout, stderr) {
		if(err) {
			console.log(err);
			console.log(stderr);
		}
		res.send(stdout);
	})
}