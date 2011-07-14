var utils = require('../../utils'),
proc = require('child_process'),
fs = require('fs'),
_ = require('underscore'),
async = require('async'),
nupack = require('../nupack');

var DNA = nupack.DNA,
sendError = utils.sendError,
forbidden = utils.forbidden,
allowedPath = utils.allowedPath,
getCommand = utils.getCommand,
nupackAnalysis = nupack.analysis,
nupackPath = nupack.path;

exports.name = 'NUPACK Pairwise';
exports.iconCls = 'nupack-icon';
exports.params = ['node', 'strands', 'max'];
exports.start = function(req, res, params) {
	var node = params['node'], strands = params['strands'], maxComplex = params['max'], fullPath = utils.userFilePath(node), cmd;
	console.log(strands);
	if(!allowedPath(node) || !allowedPath(fullPath)) {
		forbidden(res);
		console.log("Can't enter path: '" + fullPath + "'");
	}
	// console.log('fullPath:'+fullPath);
	// console.log('node:'+node);
	// console.log('basename:'+path.basename(fullPath));
	// console.log('dirname:'+path.dirname(fullPath));
	nupackAnalysis(strands, path.basename(fullPath), path.dirname(fullPath), {
		maxComplexSize : 2
	}, function(err, out) {
		if(err) {
			console.log(err);
			sendError(res, 'Internal server error', 500);
			return;
		}

		if(!!out.stderr) {
			res.send(out.stderr);
			return;
		}
		res.send(out.stdout);

	});
};
