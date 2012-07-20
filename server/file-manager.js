/**
 * DyNAMiC Workbench
 * Copyright (c) 2011 Casey Grun, Molecular Systems Lab, Harvard University
 *
 * PRE-RELEASE CODE. DISTRIBUTION IS PROHIBITED.
 */

var auth = require('auth'), config = require('config'), version = require('./version');
var form = require('connect-form'), fs = require('fs'), path = require('path'), _ = require('underscore');
var utils = require('utils'), async = require('async'), rm = require("./rm-rf"), fileTypes = require('./file-types'), winston = require('winston');
var md = require('markdown').markdown, validate = require('validator');
var check = validate.check, sanitize = validate.sanitize;

var sendError = utils.sendError, forbidden = utils.forbidden, allowedPathSync = utils.allowedPath;
var restrict = auth.restrict;

var folderPermission = 0770;


function reportError(options,res) {
	if(options.level && (!options.user_message)) {
		if(options.level =='error') {
			if (!options.user_message) options.user_message = 'Internal Server Error'; 
			if (!options.http_status) options.http_status = 500; 
		} else if(options.http_status == 404) {
			options.user_message = 'Not Found';
		}
	}
	if(options.user_message && options.http_status) {
		sendError(res,options.user_message,options.http_status)
	}
	utils.log(options);
}

function fileRecord(file, node, stat, cb) {
	var ext = path.extname(file), type, 
	id = path.join(node, file), 
	trigger, out, transform;

	if(ext != '') {
		type = ext.substring(1);
		trigger = triggers[type] ? (triggers[type] + ':' + id) : ('txt:' + id);
	} else {
		trigger = false;
		type = '';
	}
	out = {
		text : file,
		id : id,
		node : path.join(node, file),
		type : type,
		leaf : (type != ''),
		iconCls : (type == '') ? 'folder' : (icons[type] || type),
		trigger : trigger,
		size : stat ? stat.size : false
	};
	transform = fileTypes.transforms[file] || fileTypes.transforms[ext];
	if(transform) {
		transform(out, cb);
	} else {
		cb(null, out);
	}
}

// Sanitizes a string containing a file path basename, removing non-alphanumeric/dash/dot/underscore/space characters
function sanitizeBaseName(name) {
	var preventedRegex = /[^A-Za-z0-9_\-\. ]/g;
	return name.replace(preventedRegex,"-");
}

// Sanitizes the basename of a file path
function sanitizeNode(node) {
	var base = path.basename(node), dir = path.dirname(node);
	return path.join(dir,sanitizeBaseName(base));
}

var mimetypes = fileTypes.mimetypes, triggers = fileTypes.triggers, icons = fileTypes.icons;

exports.configure = function(app, express) {
	var baseRoute = app.set('baseRoute');

	app.get('/typeslist', restrict('json'), function(req, res) {
		res.render('typeslist.ejs', {
			layout : false,
			triggers : fileTypes.triggers,
			icons : fileTypes.icons
		});
		//res.send("App.triggers = " + JSON.stringify(fileTypes.triggers) + ";App.icons=" + JSON.stringify(fileTypes.icons) + ";");
	});

	app.get('/attribution', restrict('json'), function(req, res) {
		res.render('attribution.ejs', {
			layout  : false,
			version : version
		});
	});

	app.get('/config', restrict('json'), function(req, res) {
		res.render('config.ejs', {
			layout  : false,
			client  : config.client,
			version : version
		});
	});

	app.get('/help/:page', restrict('html'), function(req, res) {
		var page = req.param('page') || 'index', fullPath = path.join('help', page) + '.md';

		fs.readFile(fullPath, 'utf8', function(err, data) {
			if(err) {
				sendError(res, 'Not Found', 404);
				utils.log({
					source: '/help/:page',
					level:"warn",
					message:"Can't find documentation. ", 
					page : page,
					fullPath : fullPath,
					err : err,
				});
				return;
			}
			res.render('layout.jade', {
				layout : false,
				body : md.toHTML(data, 'Maruku'),
				page : page,
			});
		});
	});

	app.get('/build/help', restrict('html'), function(req, res) {
		var fullPath = 'help', outPath = path.join(fullPath, 'out'), writeFile, contents;
		fs.readdir(fullPath, function(err, files) {
			if(err) {
				utils.log({level:"error", source:"/build/help",
					message:"Couldn't read directory contents: ", 
					err : err,
					fullPath : fullPath
				});
				sendError(res, 'Internal Server Error', 500);
				return;
			}
			fs.mkdir(outPath, folderPermission, function() {
				async.serial('files', function(file, cb) {
					writeFile = path.join(outPath, path.basename(file) + '.html');
					fs.writeFile(writeFile, '', function(err) {
						if(err) {
							utils.log({level:"error", source:"/build/help", message:"Couldn't make file.", 
								err : err,
								writeFile : writeFile,
							});
							sendError(res, 'Internal Server Error', 500);
							cb(err);
						}
					});
				}, function(err) {
					if(!err) {
						res.send('Help built successfully')
					}
				})
			})
		});
	})

	// app.get(/\/files\/([\s\S]*)/, restrict('json'), function(req, res) {
		// var node = req.param('node') || req.params[0], fullPath = utils.userFilePath(node), basename = path.basename(fullPath), ext = path.extname(fullPath), transform;
		// if(!allowedPathSync(fullPath)) {
			// forbidden(res);
			// winston.log("warn", "Can't enter path. ", {
				// fullPath : fullPath
			// });
			// return;
		// }
		// fs.stat(fullPath, function(err, stat) {
			// if(err) {
				// if(err.code == 'ERRNO') {
					// sendError(res, 'Not Found', 404);
					// return;
				// } else {
					// sendError(res, 'Internal Server Error', 500);
					// throw err;
				// }
			// } else if(stat.isDirectory()) {
				// sendError(res, 'Cannot send directories', 403);
				// winston.log("warn", "Cannot send directory.", {
					// fullPath : fullPath
				// });
				// return;
			// }
			// transform = fileTypes.contentTransforms[basename] || fileTypes.contentTransforms[ext];
			// if(transform) {
				// transform(fullPath, function(err, data) {
					// if(err) {
						// winston.log("error", "/files: failed to transform file.", {
							// err : err,
							// fullPath : fullPath
						// });
						// sendError(res, 'Internal Server Error', 500);
						// return;
					// }
					// res.send(data);
				// })
			// }
			// res.sendfile(fullPath);
			// // fs.readFile(fullPath, function(err,data) {
			// // if(err) {
			// // throw err;
			// // } else {
			// // res.send(data);
			// // }
			// // });
		// });
	// });
	app.get('/tree', restrict('json'), function(req, res) {
		var node = req.param('node'), fullPath = utils.userFilePath(node);

		if(!allowedPathSync(fullPath, req)) {
			forbidden(res);
			utils.log({level:"warn", message:"Can't enter path. ", 
				fullPath : fullPath
			});
			return;
		}
		
		// Get the file statistics to make sure file exists, determine if directory, etc.
		fs.stat(fullPath, function(err, stat) {
			if(err) {
				if(err.code == 'ERRNO' || err.code == 'ENOENT') {
					sendError(res, 'Not Found', 404);
					return;
				} else {
					sendError(res, 'Internal Server Error', 500);
					utils.log({
						level:"error", source:"/tree", message:"Couldn't get file stats",
						err : err,
						fullPath : fullPath,
					});
				}
			}
			fs.readdir(fullPath, function(err, files) {
				if(err) {
					sendError(res, 'Internal Server Error', 500);
					utils.log({
						message:"error", source:"/tree", message:"Couldn't read directory contents: ", 
						err : err,
						fullPath : fullPath
					});
				}
				async.map(files, function(file, cb) {
					if(file != '.DS_Store') {
						fileRecord(file, node, null, cb);
					} else {
						cb(null, null);
					}
				}, function(err, outTree) {
					if(err) {
						utils.log({
							level:"error", 
							message:"Couldn't generate file records. ", 
							fullPath : fullPath,
							err : err
						});
					}
					res.send(_.compact(outTree));
				});
			});
		});
	});
	app.post('/rename', restrict('json'), function(req, res) {
		var node = req.param('id'), //
		fullPath = utils.userFilePath(node), //
		newName = sanitizeBaseName(req.param('text')), 
		newPath;

		// if the node was dragged to a new directory
		if(req.param('parentId') != path.dirname(fullPath)) {
			
			// update the newPath to include the new directory
			newPath = utils.userFilePath(req.param('parentId'));
			newPath = path.join(newPath, newName);
		} else {
			// otherwise, just change the basename
			newPath = path.join(path.dirname(fullPath), newName);
		}
		
		// Check that both the directory of newPath and the absolute fullPath are allowed
		if(!allowedPathSync(path.dirname(newPath), req) || !allowedPathSync(fullPath, req)) {
			//if(!allowedPathSync(node) || !allowedPathSync(fullPath) || !allowedPathSync(newPath)) {
			forbidden(res);
			utils.log({message:"warn", source: "/rename", message:"Can't enter path. ", 
				fullPath : fullPath,
				newPath : newPath
			});
			return;
		}
		path.exists(fullPath, function(exists) {
			if(exists) {
				fs.rename(fullPath, newPath, function(err) {
					if(err) {
						sendError(res, 'Internal Server Error', 500);
						utils.log({
							level:"error", 
							source: "/rename", 
							message:"Error from fs.rename", 
							err : err
						});
						return
					} else {
						fs.stat(newPath, function(err, stat) {
							fileRecord(path.basename(newPath), path.relative(config.files.path,path.dirname(newPath)), null, function(err, outRec) {
								if(outRec) {
									outRec.id = node;
									res.send([outRec]);
								} else {
									res.send([]);
								}
							});
						});
					}
				});
			} else {			
				sendError(res, "Not found", 404);
				utils.log({
					level:"warn", 
					source: "/rename", 
					message:"Attempting to rename file failed because file doesn't exist",
					fullPath: fullPath, 
					err : err
				});
			}
		});
	});
	app.post('/new', restrict('json'), function(req, res) {
		var node = sanitizeNode(req.param('node')), 
		fullPath = utils.userFilePath(node);
		
		if(!allowedPathSync(path.dirname(fullPath), req)) {
			// var user = auth.getUserData(req),
			// home = fs.realpathSync(path.join(auth.filesPath,user.home)),
			// testPath = fs.realpathSync(fullPath);
			utils.log({level:"warn", source:"/new", message: "Couldn't make file/directory; access denied.", 
				fullPath : fullPath,
				node : node,
				// user : user,
				// home : home,
				// path : testPath
			});
			forbidden(res);
			return;
		}
		path.exists(fullPath, function(exists) {
			if(!exists) {
				
				// Create directory if no file extension
				if(path.extname(node) == '') {
					fs.mkdir(fullPath, folderPermission, function(err) {
						if(err) {
							utils.log({level:"error", source:"/new", message: "Couldn't make directory", 
								err : err
							});
							sendError(res, 'Internal Server Error', 500);
							return;
						} else {
							fileRecord(path.basename(node), path.dirname(node), null, function(err, rec) {
								res.send([rec]);
							});
							// fs.stat(node, function(err, stat) {
							// fileRecord(path.basename(node), path.dirname(node), stat, function(err, rec) {
							// res.send([rec]);
							// })
							// });
						}
					});
					
				
				} else {
					fs.writeFile(fullPath, '', function(err) {
						if(err) {
							winston.log("error", "/new: Couldn't make file.", {
								err : err
							});
							sendError(res, 'Internal Server Error', 500);
							return;
						} else {
							fileRecord(path.basename(node), path.dirname(node), null, function(err, rec) {
								res.send([rec]);
							});
						}
					});
				}
				
			// if file exists, complain	
			} else {
				sendError(res, "Couldn\'t make duplicate file.", 500);
				return;
			}
		});
	});
	app.post('/delete', restrict('json'), function(req, res) {
		var node = req.param('id'), fullPath = utils.userFilePath(node);
		
		if(!allowedPathSync(fullPath, req)) {
			forbidden(res);
			utils.log({level:"warn", message:"Can't enter path; access denied. ", 
				fullPath : fullPath
			});
			return;
		}
		path.exists(fullPath, function(exists) {
			if(exists) {
				fs.stat(fullPath, function(err, stat) {
					if(err) {
						sendError(res, 'Internal Server Error', 500);
						utils.log({level:"error", source:"/delete", message:"Can\'t get stats for path. ", 
							fullPath : fullPath
						});
						return;
					}
					if(stat.isDirectory()) {
						rm(fullPath, function(err) {
							if(err) {
								sendError(res, 'Internal Server Error', 500);
								utils.log({level:"error", source:"/delete", message: "Can't remove directory. ", 
									fullPath : fullPath,
									err : err
								});
								return;
							}
							res.send('');
						});
					} else {
						fs.unlink(fullPath, function(err) {
							if(err) {
								sendError(res, 'Internal Server Error', 500);
								winston.log("error", "/delete: Can't unlink path. ", {
									fullPath : fullPath,
									err : err
								});
								return;
							}
							res.send('');
						});
					}
				});
			} else {
				forbidden(res, 'Path does not exist!');
				winston.log("warn", "/delete: Can't unlink path; doesn\'t exist. ", {
					fullPath : fullPath,
				});
				return
			}
		});
	});
	app.get('/load', restrict('json'), function(req, res) {
		var node = req.param('node'), download = req.param('download'), 
		fullPath = utils.userFilePath(node), //
		ext = path.extname(node), basename = path.basename(fullPath), transform, type;
		if(type != '') {
			type = ext.substring(1);
		}
		if(allowedPathSync(fullPath, req)) {

			fs.stat(fullPath, function(err, stat) {
				if(err) {
					if(err.code == 'ERRNO' || err.code == 'ENOENT') {
						sendError(res, 'Not Found', 404);
						return;
					} else {
						sendError(res, 'Internal Server Error', 500);
						winston.log("error", "/load: Could not determine file stats.", {
							fullPath : fullPath,
							err : err,
						});
						return;
					}
				}
				transform = fileTypes.contentTransforms[basename] || fileTypes.contentTransforms[ext];

				if(transform) {
					transform(fullPath, function(err, data) {
						if(err) {
							winston.log("error", "/load: failed to transform file.", {
								err : err,
								fullPath : fullPath
							});
							sendError(res, 'Internal Server Error', 500);
							return;
						}
						if(!!download) {
							res.attachment(fullPath);
						}
						res.send(data);
					})
				} else if(stat.isDirectory()) {
					sendError(res, 'Cannot send directories', 403);
					winston.log("warn", "Cannot send directory.", {
						fullPath : fullPath
					});
					return;
				} else {
					if(!!download) {
						res.attachment(fullPath);
					}
					res.sendfile(fullPath, function(err) {
						if(err) {
							winston.log("error", "/load: Couldn't send file. ", {
								fullPath : fullPath,
								err : err
							});
							sendError("Couldn't send file: " + node);
							return;
						}
					})
					
					

					// send file directly with associated mime type if it makes sense (e.g. for PDF or SVG to pass to Viewer)
					// if(mimetypes[type]) {
						// if(!!download) {
							// res.attachment(fullPath);
						// }
						// res.sendfile(fullPath, function(err) {
							// if(err) {
								// winston.log("error", "/load: Couldn't send file. ", {
									// fullPath : fullPath,
									// err : err
								// });
								// sendError("Couldn't send file: " + node);
								// return;
							// }
						// })
					// } else {
// 						
// 						
						// // TODO: either stream the file of use res.sendfile
						// fs.readFile(fullPath, function(err, data) {
							// if(err) {
								// winston.log("warn", "/load: Can't open file. ", {
									// fullPath : fullPath,
									// node : node,
									// err : err,
								// });
								// forbidden(res, "Can't open file: " + node);
								// return;
							// } else {
								// if(!!download) {
									// res.attachment(fullPath);
								// } else {
									// res.send(data);
								// }
							// }
						// });
					// }
				}
			});
		} else {
			forbidden(res, "Not authorized.");
		}
	})
	app.post('/save', restrict('json'), function(req, res) {
		var node = sanitizeNode(req.param('node')), fullPath = utils.userFilePath(node), data = req.param('data');
		if(allowedPathSync(fullPath, req)) {
			fs.writeFile(fullPath, data, function(err) {
				if(err) {
					winston.log("error", "/save: Couldn't save file. ", {
						node : node,
						data : data,
						err : err
					});
					sendError(res, 'Internal Server Error', 500);
					return
				} else {
					res.send('');
				}
			});
		} else {
			forbidden(res, "Not authorized.");
		}
	});
	app.post('/image', restrict('json'), function(req, res) {
		var node = req.param('node'), fullPath = utils.userFilePath(node), img = req.param('img');
		var data = img.replace(/^data:image\/\w+;base64,/, "");
		var buf = new Buffer(data, 'base64');
		if(!allowedPathSync(fullPath, req)) {
			forbidden(res, "Not authorized.");
			winston.log("warn", "/image: Couldn\'t save upload; access denied.", {
				fullPath : fullPath
			})
			return;
		}
		fs.writeFile(fullPath, buf, function(err) {
			if(err) {
				winston.log('error', '/image: failed to save image', {
					fullPath : fullPath,
					err : err
				});
			}
		})
	})
	app.post('/upload', restrict('json'), function(req, res) {
		if(req.xhr) {
			//fileName = req.header('x-file-name'),
			//fileSize = req.header('x-file-size'),
			//fileType = req.header('x-file-type');
			var node = sanitizeNode(req.param('node') || req.param('userfile')), fullPath = utils.userFilePath(node);


			// Complain if attempt made to upload to a bad path
			if(!allowedPathSync(path.dirname(fullPath), req)) {
				//if(!allowedPathSync(node) || !allowedPathSync(fullPath)) {
				forbidden(res);
				winston.log("warn", "/upload: Couldn\'t save upload; access denied.", {
					fullPath : fullPath
				})
				return;
				
			// Otherwise, begin writing data
			} else {
				var ws = fs.createWriteStream(fullPath);
				req.pipe(ws);
				// req.on('data', function(data) {
					// ws.write(data);
				// });
				
				
				// Note: 'close' can fire after 'end', but not vice versa.
				req.on('end',onEnd);
				req.on('close',onClose);
				
				
				// Should be called only if onEnd doesn't get there first; this indicates an error,
				// as 'end' wasn't called to flush output before the connection closed.
				function onClose() {
					res.send({
						success : false,
						fileName : path.basename(fullPath),
						fullPath : fullPath,
						readablePath : fullPath,//path.join('files',node),
					});
				}
				
				function onEnd () { 
					res.send({
						success : true,
						fileName : path.basename(fullPath),
						fullPath : fullPath,
						readablePath : fullPath,//path.join('files',node),
					});
					req.removeListener('close',onClose);
				}
			}
		} else {
			req.form.complete(function(err, fields, files) {
				if(err) {
					sendError(res, 'Internal Server Error', 500);
					return;
				}
				if(files && files.length) {
					_.each(files, function(file) {
						var node = req.param('node'), tempPath = file.path;
						res.send({
							success : false
						});
					});
				}
			});
		}
	});
}