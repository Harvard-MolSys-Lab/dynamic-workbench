var utils = require('utils'), //
proc = require('child_process'), //
fs = require('fs'), //
_ = require('underscore'), // 
async = require('async'), //
path = require('path'), //
winston = require('winston'), //
dynamic = require('dynamic');

// Utils abbreviations
var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath, getCommand = utils.getCommand, prefix = utils.prefix, quote = utils.quote, postfix = utils.postfix; 

var commands = {
	nodal : {
		command : 'python',
		'arguments' : ['tools/nodal/compiler2b.py'],//['tools/nodal/compiler2.py'],
	},
};


function nodalLoadLibrary(data,callback) {
	try {
		var input = JSON.parse(data);
		utils.log({
			level: "info",
			message: "Input system successfully parsed",
			source: "nodal",
		});
		var lib = dynamic.Library.fromDil(input);
		utils.log({
			level: "info",
			message: "Input system compiled to library",
			source: "nodal",
		});
		callback(null,lib,input);
	} catch(e) {
		callback(e);
	}
}


var targets = {
	'nupack': function(lib,input,fullPath) {
		return function(cb) {
			var nupackOut = lib.toNupackOutput();
			fs.writeFile(postfix(fullPath, 'np'),nupackOut,'utf8',cb);
		}
	},
	'domains': function(lib,input,fullPath) {
		return function(cb) {
			var ddOut = lib.toDomainsOutput();
			utils.log({
				level:'info',
				source: 'nodal',
				message: 'Domains (DD) output',
				ddOut: ddOut,
			})
			fs.writeFile(postfix(fullPath, 'domains'),ddOut,'utf8',cb);
		};
	},
	'ms': function(lib,input,fullPath) { 
		return function(cb) {
			var msOut = lib.toMSOutput();
			fs.writeFile(postfix(fullPath, 'ms'),msOut,'utf8',cb);
		};
	},
	'svg': function(lib,input,fullPath) { 
		return function(cb) {
			var svgOut = lib.toSVGOutput();
			fs.writeFile(postfix(fullPath, 'svg'),svgOut,'utf8',cb);
		};
	},
	'dynaml': function(lib,input,fullPath) { 
		return function(cb) {
			fs.writeFile(postfix(fullPath, 'dynaml'),JSON.stringify(input,null,'\t'),'utf8',cb);
		};
	},
	'dil': function(lib,input,fullPath) { 
		return function(cb) {
			var dilOut = lib.toDilOutput();
			fs.writeFile(postfix(fullPath, 'dil'),dilOut,'utf8',cb);
		};
	},
	'pil': function(lib,input,fullPath) { 
		return function(cb) {
			var pilOut = lib.toPilOutput();
			fs.writeFile(postfix(fullPath, 'pil'),pilOut,'utf8',cb);
		};
	},
	'enum': function(lib,input,fullPath) { 
		return function(cb) {
			var enumOut = lib.toEnumOutput();
			fs.writeFile(postfix(fullPath, 'enum'),enumOut,'utf8',cb);
		}
	},

};

exports = function NodalTask() {};

exports.name = 'Nodal Compiler';
exports.iconCls = 'nodal';
exports.params = ['node', 'data', 'action'];

NodalTask.prototype.start = function(params) {
	
	var me = this,

	// Acquire the file path in which we'll operate
	node = params['node'], 

	// basename prefix; e.g. node = "/system1/3_arm.nodal" -> pre = "3_arm"
	pre = prefix(node),  

	// full path prefix; e.g. node = "/system1/3_arm.nodal" -> fullPath = "files/user@example.com/system1/3_arm"
	fullPath = path.resolve(utils.userFilePath(utils.fullPrefix(node))), 
	inFileName = postfix(fullPath, 'txt'), inFile = params['data'];


	function acquireData(type,callback) {
		var data = params["data"];
		if(!!data) {
			callback(data,req,res);

		} else {
			if(params["node"]) {
				fs.readFile(postfix(fullPath,type),'utf8',function(err,data) {

					if(err) {
						res.send({message: "Build completed with errors: Could not read input file. \n\n" + err});
						utils.log({
							level: "error",
							source: "nodal",
							message: "Could not read input file",
							err: err,
							fullPath: fullPath,
							data: data,
						});
						return;
					}
					callback(data,req,res);
				});
			}
		}
	}

	/**
	 * Function factory to generate functions which will output to a given target
	 * @param  {String} target 
	 * One of the tutput target names, specified in #targets
	 * 
	 * @param  {String} message Message to output upon completion
	 * @return {Function} func
	 * @return {Error} func.err An error object, or null if no error occurs
	 * @return {Object} func.lib
	 * @return {Object} func.input
	 */	
	function outputTarget(target,message) {
		return function(err,lib,input) {
			if(err) {
				utils.log({
					level: "error",
					source: "nodal",
					message: "Unable to load library when outputting target",
					err: err,
				});
				return sendError(res,{message:'Unable to load library when outputting target.'},500);
			}
			targets[target](lib,input,fullPath)(function(err) {
				if(err) {
					utils.log({
						level: "error",
						source: "nodal",
						message: "Unable to write output file when outputting target",
						err: err,
					});
					return sendError(res,{message:'Unable to write output file.'},500);
				}
				res.send({message:message});
			});
		};
	}

	/**
	 * Function factory which generates functions to load a library from a JSON string,
	 * then output the library to the provided target
	 * @param  {String} target One of the output target names specified in #targets
	 * @param  {String} message Message to output upon task completion
	 * 
	 * @return {Function} func
	 * @return {String} func.data Input JSON data
	 */
	function loadLibraryOutputTarget(target, message) {
		var output = outputTarget(target,message);
		return function(data) {
			return nodalLoadLibrary(data,output);
		};
	}

	/**
	 * Parses an input JSON string to a library, compiles the library, and outputs all targets
	 * @param  {String} data Input JSON string
	 */
	function nodalCompileAllTargets(data) {
		try {
			var input = JSON.parse(data);
			var lib = dynamic.Compiler.compile(data);
			utils.log({
				level: "info",
				message: "Input system successfully parsed",
				source: "nodal",
				data: data,
				user:req.user,
			});

			nodalOutputAllTargets(lib,input);

		} catch(e) {
			if (typeof e.serialize != 'undefined') {
				res.send(e.serialize());
				utils.log({
					level: "info",
					source: "nodal",
					data: data,
					err: e,
					user:req.user,
				})
				return;
			}
			sendError(res, JSON.stringify({message: 'Unable to deserialize input data.'}), 500);
			utils.log({
				level: "error",
				source: "nodal",
				message: "Unable to deserialize input data.",
				err: e,
				data: data,
			});
			//throw(e);
		}	
	}

	function nodalCompileDil(data) {
		try {
			var input = JSON.parse(data);
			var lib = dynamic.Compiler.compile(data);
			utils.log({
				level: "info",
				message: "Input system successfully parsed",
				source: "nodal",
				data: data,
				user:req.user,
			});

			outputTarget('dil','DIL output complete.')(null,lib,input);

		} catch(e) {
			if (typeof e.serialize != 'undefined') {
				res.send(e.serialize());
				utils.log({
					level: "info",
					source: "nodal",
					data: data,
					err: e,
					user:req.user,
				})
				return;
			}
			sendError(res, JSON.stringify({message: 'Unable to deserialize input data.'}), 500);
			utils.log({
				level: "error",
				source: "nodal",
				message: "Unable to deserialize input data.",
				err: e,
				data: data,
			});
			//throw(e);
		}	
	}

	function nodalOutputAllTargets(lib,input) {
		var allTargets = _.map(targets,function(f,key) {
			return f(lib,input,fullPath);
		});
		async.parallel(allTargets,function(err) {
			if(err) {
				utils.log({
					level: "error",
					source: "nodal",
					message: "Error outputting target",
					err: err,
					data: data,
				});
				if(err.serialize) {
					sendError(res, JSON.stringify(err.serialize()), 500)
				} else {
					sendError(res, JSON.stringify({message: 'Error outputting targets.'}), 500);
				}
				return;
			} else {
				res.send(JSON.stringify({message:"Build completed."}));
			}
		})
	
}


	switch(params.action) {
		case 'clean':
			async.parallel(_.map(['txt','domains','svg','nupack','np','ms','dynaml','pil','dil','enum'],function(ext) { 
				return function(cb) {fs.unlink(postfix(fullPath,ext),function(err,res) { cb(null,res);});};
			}),
			function(err,results) {
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

		case 'dynamic':
		case 'all':
			// Compile system, output all targets
			return acquireData('dynaml',nodalCompileAllTargets);

		case 'dil':
			return acquireData('dynaml',nodalCompileDil);

		case 'output':
			// Load DIL system, output all targets
			return acquireData('dil',function(data) {
				nodalLoadLibrary(data,nodalOutputAllTargets);
			});
		case 'nupack':
			return acquireData('dil',loadLibraryOutputTarget('nupack','NUPACK output complete.'));
		case 'ms':
			return acquireData('dil',loadLibraryOutputTarget('ms','Multisubjective output complete.'));
		case 'enum':
			return acquireData('dil',loadLibraryOutputTarget('enum','Enumerator output complete.'));
		case 'dd': case 'DD': case 'domains':
			return acquireData('dil',loadLibraryOutputTarget('domains','DD output complete.'));
		case 'pil':
			return acquireData('dil',loadLibraryOutputTarget('pil','PIL output complete.'));
		case 'svg':
			return acquireData('dil',loadLibraryOutputTarget('svg','SVG output complete.'));

		case 'legacy':
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
	}
};


