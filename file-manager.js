var form = require('connect-form'), auth = require('./auth'), fs = require('fs'), path = require('path'), _ = require('underscore');
var utils = require('./utils'), async = require('async'), rm = require("./rm-rf"), fileTypes = require('./file-types'), winston = require('winston');

var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath;
var restrict = auth.restrict;

function fileRecord(file, node, stat, cb) {
	var ext = path.extname(file), type, id = path.join(node, file), trigger, out, transform;

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

var mimetypes = fileTypes.mimetypes, triggers = fileTypes.triggers, icons = fileTypes.icons;

exports.configure = function(app, express) {
	var baseRoute = app.set('baseRoute');

	app.get(/\/files\/([\s\S]*)/, restrict('json'), function(req, res) {
		var node = req.param('node') || req.params[0], fullPath = utils.userFilePath(node), basename = path.basename(fullPath), ext = path.extname(fullPath), transform;
		if(!allowedPath(node) || !allowedPath(fullPath)) {
			forbidden(res);
			winston.log("warn", "Can't enter path. ", {
				fullPath : fullPath
			});
			return;
		}
		fs.stat(fullPath, function(err, stat) {
			if(err) {
				if(err.code == 'ERRNO') {
					sendError(res, 'Not Found', 404);
					return;
				} else {
					sendError(res, 'Internal Server Error', 500);
					throw err;
				}
			} else if(stat.isDirectory()) {
				sendError(res, 'Cannot send directories', 403);
				winston.log("warn", "Cannot send directory.", {
					fullPath : fullPath
				});
				return;
			}
			transform = fileTypes.contentTransforms[basename] || fileTypes.contentTransforms[ext];
			if(transform) {
				transform(fullPath, function(err, data) {
					if(err) {
						winston.log("error", "/files: failed to transform file.", {
							err : err,
							fullPath : fullPath
						});
						sendError(res, 'Internal Server Error', 500);
						return;
					}
					res.send(data);
				})
			}
			res.sendfile(fullPath);
			// fs.readFile(fullPath, function(err,data) {
			// if(err) {
			// throw err;
			// } else {
			// res.send(data);
			// }
			// });
		});
	});
	app.get('/tree', restrict('json'), function(req, res) {
		var node = req.param('node'), fullPath = utils.userFilePath(node);

		if(!allowedPath(node) || !allowedPath(fullPath)) {
			forbidden(res);
			winston.log("warn", "Can't enter path. ", {
				fullPath : fullPath
			});
			return;
		}
		fs.stat(fullPath, function(err, stat) {
			if(err) {
				if(err.code == 'ERRNO' || err.code == 'ENOENT') {
					sendError(res, 'Not Found', 404);
					return;
				} else {
					sendError(res, 'Internal Server Error', 500);
					winston.log("error", "/tree: Couldn't get file stats", {
						err : err,
						fullPath : fullPath,
					});
				}
			}
			fs.readdir(fullPath, function(err, files) {
				if(err) {
					winston.log("error", "/tree: Couldn't read directory contents: ", {
						err : err,
						fullPath : fullPath
					});
					sendError(res, 'Internal Server Error', 500);
				}
				async.map(files, function(file, cb) {
					if(file != '.DS_Store') {
						fileRecord(file, node, null, cb);
					}
				}, function(err, outTree) {
					if(err) {
						winston.log("error", "Couldn't generate file records. ", {
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
		var node = req.param('id'), fullPath = utils.userFilePath(node), newName = req.param('text'), newPath;

		// if the node was dragged to a new directory
		if(req.param('parentId') != path.dirname(fullPath)) {
			// update the new path to include the new directory
			newPath = utils.userFilePath(req.param('parentId'));
			newPath = path.join(newPath, newName);
			// otherwise, just change the basename
		} else {
			newPath = path.join(path.dirname(fullPath), newName);
		}

		if(!allowedPath(node) || !allowedPath(fullPath) || !allowedPath(newPath)) {
			forbidden(res);
			winston.log("warn", "Can't enter path. ", {
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
						winston.log("error", "Error from /rename", {
							err : err
						});
					} else {
						fs.stat(newPath, function(err, stat) {
							fileRecord(path.basename(newPath), path.dirname(newPath), null, function(outRec) {
								outRec.id = node;
								res.send([outRec]);
							});
						});
					}
				});
			}
		});
	});
	app.post('/new', restrict('json'), function(req, res) {
		var node = req.param('node'), fullPath = utils.userFilePath(node);
		if(!allowedPath(node)) {
			forbidden(res);
			return;
		}
		path.exists(fullPath, function(exists) {
			if(!exists) {
				if(path.extname(node) == '') {
					fs.mkdir(fullPath, 777, function(err) {
						if(err) {
							winston.log("error", "/new: Couldn't make directory", {
								err : err
							});
							sendError(res, 'Internal Server Error', 500);
							return;
						} else {
							fs.stat(node, function(err, stat) {
								fileRecord(path.basename(node), path.dirname(node), stat, function(err, rec) {
									res.send([rec]);
								})
							});
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
			} else {
				res.send('');
			}
		});
	});
	app.post('/delete', restrict('json'), function(req, res) {
		var node = req.param('id'), fullPath = utils.userFilePath(node);
		if(!allowedPath(node)) {
			forbidden(res);
			winston.log("warn", "Can't enter path; access denied. ", {
				fullPath : fullPath
			});
			return;
		}
		path.exists(fullPath, function(exists) {
			if(exists) {
				fs.stat(fullPath, function(err, stat) {
					if(err) {
						sendError(res, 'Internal Server Error', 500);
						winston.log("error", "/delete: Can\'t get stats for path. ", {
							fullPath : fullPath
						});
						return;
					}
					if(stat.isDirectory()) {
						rm(fullPath, function(err) {
							if(err) {
								sendError(res, 'Internal Server Error', 500);
								winston.log("error", "/delete: Can't remove directory. ", {
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
			}
		});
	});
	app.get('/load', restrict('json'), function(req, res) {
		var node = req.param('node'), download = req.param('download'), fullPath = utils.userFilePath(node), ext = path.extname(node), basename = path.basename(fullPath), transform, type;
		if(type != '') {
			type = ext.substring(1);
		}

		fs.stat(fullPath, function(err, stat) {
			if(err) {
				if(err.code == 'ERRNO') {
					sendError(res, 'Not Found', 404);
					return;
				} else {
					sendError(res, 'Internal Server Error', 500);
					throw err;
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

				// send file directly with associated mime type if it makes sense (e.g. for PDF or SVG to pass to Viewer)
				if(mimetypes[type]) {
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
				} else {
					// TODO: either stream the file of use res.sendfile
					fs.readFile(fullPath, function(err, data) {
						if(err) {
							winston.log("warn", "/load: Can't open file. ", {
								fullPath : fullPath,
								node : node,
								err : err,
							});
							forbidden(res, "Can't open file: " + node);
							return;
						} else {
							if(!!download) {
								res.attachment(fullPath);
							}
							res.send(data);
						}
					});
				}
			}
		});
	})
	app.post('/save', restrict('json'), function(req, res) {
		var node = req.param('node'), fullPath = utils.userFilePath(node), data = req.param('data');
		fs.writeFile(fullPath, data, function(err) {
			if(err) {
				winston.log("error", "/save: Couldn't save file. ", {
					node : node,
					data : data,
					err : err
				});
				sendError(res, 'Internal Server Error', 500);
			} else {
				res.send('');
			}
		});
	});
	app.post('/upload', restrict('json'), function(req, res) {
		if(req.xhr) {
			//fileName = req.header('x-file-name'),
			//fileSize = req.header('x-file-size'),
			//fileType = req.header('x-file-type');
			var node = req.param('node') || req.param('userfile'), fullPath = utils.userFilePath(node);

			if(!allowedPath(node) || !allowedPath(fullPath)) {
				forbidden(res);
				winston.log("warn", "/upload: Couldn\'t save upload; access denied.", {
					fullPath : fullPath
				})
				return;
			} else {
				var ws = fs.createWriteStream(fullPath);
				req.on('data', function(data) {
					ws.write(data);
				});
				res.send({
					success : true,
					fileName : path.basename(fullPath),
					fullPath : fullPath,
					readablePath : fullPath,//path.join('files',node),
				});
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