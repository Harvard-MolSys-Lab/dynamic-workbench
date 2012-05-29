var utils = require('../utils'), proc = require('child_process'), //
fs = require('fs'), _ = require('underscore'), async = require('async'), //
path = require('path'), winston = require('winston'), //
DNA = require('../../static/common/dna-utils');

var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath, getCommand = utils.getCommand;

var commands = {
	ms : {
		command : 'tools/multisubjective/multisubjective',
		arguments : [''],
	},
}


function prefix(str) {
	var x = path.basename(str).split('.');
	if(x.length > 1) {
		x.pop();
	}
	return x.join('.');
}

function postfix(str, ext) {
	return [str, ext].join('.');
}

function quote(str) {
	return "'" + str + "'";
}

exports.name = 'Multisubjective';
exports.iconCls = 'ms-icon';
exports.params = ['node','mode']
exports.start = function(req, res, params) {
	var node = params['node'], fullPath = utils.userFilePath(node), cmd;

	if (!allowedPath(node) || !allowedPath(fullPath)) {
		forbidden(res);
		console.log("Can't enter path: '" + fullPath + "'");
	}
	// console.log('fullPath:'+fullPath);
	// console.log('node:'+node);
	// console.log('basename:'+path.basename(fullPath));
	// console.log('dirname:'+path.dirname(fullPath));


	// modes:
	/*
	 * Load:
	 * d - load dd
	 * m - load multiple dd
	 * f - fill with random bases
	 * n - load NUPACK mo file (sequences.npo)
	 * a - autofill from last web submission
	 * j - job number
	 */
	
	/*
	 * Iteration:
	 * o - run DD once
	 * l - run DD 10 times
	 * w - submit to NUPACK web server using spec.np
	 * r - random bases in a loop
	 * x - no designer
	 */

	var mode = params['mode'] || 'fw';



	var prefix = path.basename(fullPath,'.ms');
	var working_dir = path.dirname(fullPath);

	cmd = getCommand(commands['ms'], 
	['-m', mode,'-d',working_dir,'-i',prefix,'-o',prefix,'-w']);
	
	var env = {"NUPACKHOME":utils.toolPath("nupack3")};
	winston.log("info", cmd);
	winston.log("info",env);
	proc.exec(cmd, {env: env},function(err, stdout, stderr) {
		if (err) {
			utils.log("error", "ms: Execution error. ", {
				cmd : cmd,
				stderr : stderr,
				stdout : stdout,
			});
		}
		if (stderr) {
			res.send("Task completed with errors. \n\n" + stderr);
		} else {
			res.send(stdout);
		}
	})
};
