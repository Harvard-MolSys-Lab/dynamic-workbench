var utils = require('utils'), //
DNA = require('dna'), //
proc = require('child_process'), //
path = require('path'), //
fs = require('fs'), //
_ = require('underscore'), 
async = require('async'), //
winston = require('winston'), //
glob = require('glob');

// Utils abbreviations
var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath, getCommand = utils.getCommand, prefix = utils.prefix, quote = utils.quote, postfix = utils.postfix; 

var commands = {
	ms : {
		command : 'tools/multisubjective/multisubjective',
		arguments : [''],
	},
}

var maxBuffer = 1000 * 1024;

exports.name = 'Multisubjective';
exports.iconCls = 'ms-icon';
exports.params = ['node', 'mode', 'action']
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
	var action = params['action'] || 'default';

	var pre = path.basename(fullPath, '.ms');
	var working_dir = path.dirname(fullPath);

	switch(action) {
		case 'clean':
			glob(path.join(working_dir, pre) + '{-*.{dd,msq,},.mso,.log}', function(err, files) {
				if (err) {
					utils.log({
						level : "error",
						source : "ms",
						message : "Cleaning error",
						err : err,
					});
					res.send("Cleaning error.");
					return
				}
				if(!!files) utils.log({
					level: 'info', source: 'ms', message: 'Cleaning files: '+files.join(', ')
				})

				async.map(files, function(file, cb) {
					fs.unlink(file, function(err, res) {
						cb(null, res);
					})
				}, function(err, results) {
					if (err) {
						utils.log({
							level : "error",
							source : "ms",
							message : "Cleaning error",
							err : err,
						});
						res.send("Cleaning error.");
					} else {
						res.send("Files cleaned.");
					}
				})
			});
			return;
		default:
		case 'default':
			cmd = getCommand(commands['ms'], ['-m', mode, '-d', working_dir, '-i', pre, '-o', pre, '-w']);

			var env = {
				"NUPACKHOME" : utils.toolPath("nupack3"),
				"HOME" : '/home/webserver-user'
			};
			winston.log("info", cmd);
			winston.log("info", env);

			// cmd = 'valgrind --leak-check=full -v '+cmd
			proc.exec(cmd, {
				env : env,
				maxBuffer : maxBuffer
			}, function(err, stdout, stderr) {
				if (err) {
					utils.log("error", "Node execution error. ", {
						cmd : cmd,
						stderr : stderr,
						stdout : stdout,
						err : err,
					});
				}
				if (stderr) {
					utils.log({
						level : "error",
						source : "ms",
						message : "MS execution error. ",
						cmd : cmd,
						stderr : stderr,
						stdout : stdout,
					});
					res.send("Task completed with errors. \n\n" + stderr + '\n' + stdout);
				} else {
					res.send(stdout);
				}
			})
	}
};
