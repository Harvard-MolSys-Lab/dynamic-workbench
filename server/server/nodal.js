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
		arguments : ['tools/nodal/compiler2b.py'],//['tools/nodal/compiler2.py'],
	},
}

exports.name = 'Nodal Compiler';
exports.iconCls = 'nodal';
exports.params = ['node', 'data', 'action'];
exports.start = function(req, res, params) {
	var node = params['node'], // fullPath = path.resolve(utils.userFilePath(node)),
	pre = prefix(node), fullPath = path.resolve(utils.userFilePath(utils.fullPrefix(node))), inFileName = postfix(fullPath, 'txt'), inFile = params['data'];
	switch(params.action) {
		case 'clean':
			async.parallel(_.map(['txt','domains','svg','nupack','np','ms','dynaml','pil','enum'],function(ext) { 
					return function(cb) {fs.unlink(postfix(fullPath,ext),function(err,res) { cb(null,res);});};
				}),
				//[
				// function(cb) {fs.unlink(postfix(fullPath,'txt'),function(err,res) { cb(null,res);});},
				// function(cb) {fs.unlink(postfix(fullPath,'domains'),function(err,res) { cb(null,res);});},
				// function(cb) {fs.unlink(postfix(fullPath,'svg'),function(err,res) { cb(null,res);});},
				// function(cb) {fs.unlink(postfix(fullPath,'nupack'),function(err,res) { cb(null,res);});},
				// function(cb) {fs.unlink(postfix(fullPath,'dynaml'),function(err,res) { cb(null,res);});},
				// function(cb) {fs.unlink(postfix(fullPath,'pil'),function(err,res) { cb(null,res);});},
				//],
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
		// [function(cb) {
					// fs.writeFile(postfix(fullPath, 'domains'),ddOut,'utf8',cb);
				// },function(cb) {
					// fs.writeFile(postfix(fullPath, 'np'),nupackOut,'utf8',cb);
				// },function(cb) {
					// var dirname = postfix(fullPath+'-ms','package');
					// fs.mkdir(dirname,function(err) {
						// var contents = {
							// iconCls:'package'
						// };
						// async.parallel([
							// function(_cb) { fs.writeFile(path.join(dirname,postfix(pre,'ms')),msOut,'utf8',_cb) },
							// function(_cb) { fs.writeFile(path.join(dirname,postfix(pre,'np')),ms_nupackOut,'utf8',_cb) },
							// function(_cb) { fs.writeFile(path.join(dirname,'contents.json'),JSON.stringify(contents),'utf8',_cb) }
						// ],cb);
					// });
				// },function(cb) {
					// fs.writeFile(postfix(fullPath, 'svg'),svgOut,'utf8',cb);
				// },function(cb) {
					// fs.writeFile(postfix(fullPath, 'dynaml'),JSON.stringify(input,null,'\t'),'utf8',cb);
				// },function(cb) {
					// fs.writeFile(postfix(fullPath, 'pil'),pilOut,'utf8',cb);
				// },function(cb) {
					// //fs.writeFile(postfix(fullPath, 'enum'),enumOut,'utf8',cb);
					// var dirname = postfix(fullPath+'-enum','package');
					// var contents = {
						// iconCls:'package'
					// };
					// fs.mkdir(dirname,function(err) {
						// async.parallel([
							// function(_cb) { fs.writeFile(path.join(dirname,postfix(pre,'enum')),enumOut,'utf8',_cb) },
							// function(_cb) { fs.writeFile(path.join(dirname,'contents.json'),JSON.stringify(contents),'utf8',_cb) }
						// ],cb);
					// });
				// },]
		
		
			try {
				var data = params["data"];
				var input = JSON.parse(data);
				var lib = dynamic.Compiler.compile(data);
				var nupackOut = lib.toNupackOutput(),
					ddOut = lib.toDomainsOutput(),
					pilOut = lib.toPilOutput(),
					msOut = lib.toMSOutput(),
					svgOut = lib.toSVGOutput(),
					enumOut = lib.toEnumOutput();
					
				var msDirPath = path.join(fullPath,pre+'-ms'),
					msPath = path.join(msDirPath,pre);
				async.series([function(cb) {
					fs.mkdir(msPath,cb);
				},function(cb) {
					fs.writeFile(postfix(msPath, 'np'),nupackOut,'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(msPath, 'ms'),msOut,'utf8',cb);
				}])
				async.parallel([function(cb) {
					fs.writeFile(postfix(fullPath, 'domains'),ddOut,'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'np'),nupackOut,'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'ms'),msOut,'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'svg'),svgOut,'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'dynaml'),JSON.stringify(input,null,'\t'),'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'pil'),pilOut,'utf8',cb);
				},function(cb) {
					fs.writeFile(postfix(fullPath, 'enum'),enumOut,'utf8',cb);
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
				if (typeof e.serialize != 'undefined') {
					res.send(e.serialize());
					return;
				}
				res.send("Build completed with errors. \n\n" + e);
				utils.log({
					level: "error",
					source: "nodal",
					message: "Unknown error",
					err: e,
					data: data,
				});
				//throw(e);
			}
	}
};
