var utils = require('../utils'), proc = require('child_process'), fs = require('fs'), 
_ = require('underscore'), async = require('async'), path = require('path'), //
winston = require('winston'), dynamic = require('../../static/common/dynamic');

var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath, getCommand = utils.getCommand;

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

var commands = {
	nodal : {
		command : 'python',
		arguments : ['tools/nodal/compiler2b.py'],//['tools/nodal/compiler2.py'],
	},
}

exports.name = 'Nodal Compiler';
exports.iconCls = 'nodal';
exports.params = ['node', 'data', 'action'];
exports.start = function(req, res, params) {
	var node = params['node'], // fullPath = path.resolve(utils.userFilePath(node)),
	pre = prefix(node), fullPath = path.resolve(utils.userFilePath(path.join(path.dirname(node), pre))), inFileName = postfix(fullPath, 'txt'), inFile = params['data'];
	switch(params.action) {
		case 'clean':
			async.parallel([
				function(cb) {fs.unlink(postfix(fullPath,'txt'),function(err,res) { cb(null,res);});},
				function(cb) {fs.unlink(postfix(fullPath,'domains'),function(err,res) { cb(null,res);});},
				function(cb) {fs.unlink(postfix(fullPath,'svg'),function(err,res) { cb(null,res);});},
				function(cb) {fs.unlink(postfix(fullPath,'nupack'),function(err,res) { cb(null,res);});},
				function(cb) {fs.unlink(postfix(fullPath,'dynaml'),function(err,res) { cb(null,res);});},
				function(cb) {fs.unlink(postfix(fullPath,'pil'),function(err,res) { cb(null,res);});},

			],function(err,results) {
				if(err) {
					utils.log({
						level: "error",
						source: "nodal",
						message: "Cleaning error",
						err: err,
					});
					res.send("Cleaning error.");
				} else {
					res.send("Files cleaned.");
				}
				
			})
			break;
		case 'legacy':
		case 'all':
		default:
			fs.writeFile(inFileName, inFile, function(err) {
				if(err) {
					winston.log("error", "nodal: Couldn't write inFile. ", {
						err : err,
						inFileName : inFileName,
						inFile : inFile,
					});
					sendError(res, 'Internal Server Error', 500)
					return;
				} else {
					cmd = getCommand(commands['nodal'], ['-i', quote(inFileName), '-d', quote(postfix(fullPath, 'domains')), '-n', quote(postfix(fullPath, 'nupack')), '-s', quote(postfix(fullPath, 'svg'))]);
					winston.log("info", cmd);
					proc.exec(cmd, function(err, stdout, stderr) {
						if(err) {
							winston.log("error", "nodal: Execution error. ", {
								cmd : cmd,
								stderr : stderr,
								stdout : stdout,
							});
						}
						if(stderr) {
							res.send("Build completed with errors. \n\n" + stderr);
						} else {
							res.send(stdout + "\n Build completed.");
						}
					})
				}
			});
			break;
		case 'dynamic':
			try {
				var data = params["data"];
				var input = JSON.parse(data);
				var lib = dynamic.Compiler.compile(data);
				var nupackOut = lib.toNupackOutput(),
					ddOut = lib.toDomainsOutput(),
					pilOut = lib.toPilOutput(),
					svgOut = lib.toSVGOutput();
				async.parallel([function(cb) {
					fs.writeFile(postfix(fullPath, 'domains'),ddOut,'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'nupack'),nupackOut,'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'svg'),svgOut,'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'dynaml'),JSON.stringify(input,null,'\t'),'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'pil'),pilOut,'utf8',cb);
				},],function(err) {
					if(err) {
						utils.log({
							level: "error",
							source: "nodal",
							message: "Unknown error",
							err: err,
							data: data,
						});
						if(err.serialize) {						
							sendError(res, JSON.stringify(err.serialize()), 500)
						} else {
							sendError(res, JSON.stringify({message: 'Unknown error'}), 500);
						}
						return;
					} else {
						res.send(JSON.stringify({message:"Build completed."}));
					}
				})
			} catch(e) {
				if (e instanceof dynamic.DynamlError) {
					res.send(e.serialize());
					return;
				}
				res.send("Build completed with errors. \n\n" + e);
			}
	}
};
