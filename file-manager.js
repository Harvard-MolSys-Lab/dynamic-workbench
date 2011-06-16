var form = require('connect-form'),
fs = require('fs');
path = require('path');
_ = require('underscore'),
mongoose = require('mongoose'),
mongooseAuth = require('mongoose-auth'),
utils = require('./utils'),
async = require('async');//,
//mime = require('mime');

var sendError = utils.sendError,
forbidden = utils.forbidden,
allowedPath = utils.allowedPath;

function fileRecord(file,node,stat) {
	var type = path.extname(file),
	id = path.join(node,file),
	trigger;

	if(type != '') {
		type = type.substring(1);
		trigger = triggers[type] ? (triggers[type]+':'+id) : ('txt:'+id);
	} else {
		trigger = false;
	}

	return {
		text: file,
		id: id,
		node: path.join(node,file),
		type: type,
		leaf: (type!=''),
		iconCls: (type=='') ? 'folder' : type,
		trigger: trigger,
		size: stat ? stat.size : false
	};
}

var triggers = {
	tex: 'tex',
	latex: 'tex',
	txt: 'txt',
	js: 'js',
	xml: 'xml',
	html: 'html',
	htm: 'html',
	dsml: 'dynaml',
	dyn: 'dynaml',
	dynaml: 'dynaml',
	diff: 'diff',
	pil: 'pil',
	pepper: 'pepper',
	sys: 'pepper',
	comp: 'pepper',
	crn: 'crn',
	nodal: 'nodal',
	seq: 'sequence',
	nupack: 'nupackedit',
	svg: 'viewer',
	pdf: 'viewer',
};

var mimetypes = {
	'svg':'image/svg+xml',
	'pdf':'application/pdf',
};

exports.configure = function(app,express) {
	var baseRoute = app.set('baseRoute');

	app.get('/', function(req,res) {
		//res.render('index.jade',{layout: false});
		res.render('test.jade', {
			layout: false
		});
	});
	app.get(/\/files\/([\s\S]*)/, function(req,res) {
		var node = req.param('node') || req.params[0],
		fullPath = utils.userFilePath(node);
		// console.log('req.param: '+JSON.stringify(req.params));
		// console.log('node: '+node+'\n');
		// console.log('full path:'+fullPath+'\n');
		if(!allowedPath(node) || !allowedPath(fullPath)) {
			forbidden(res);
			console.log("Can't enter path: '"+fullPath+"'");
			return;
		}
		fs.stat(fullPath, function(err,stat) {
			if(err) {
				if(err.code=='ERRNO') {
					sendError(res,'Not Found',404);
					return;
				} else {
					sendError(res,'Internal Server Error',500);
					throw err;
				}
			} else if(stat.isDirectory()) {
				sendError(res,'Cannot send directories',403);
				return;
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
	app.get('/tree', function(req,res) {
		var node = req.param('node'),
		fullPath = utils.userFilePath(node);

		if(!allowedPath(node) || !allowedPath(fullPath)) {
			forbidden(res);
			console.log("Can't enter path: '"+fullPath+"'");
			return;
		}
		fs.stat(fullPath, function(err,stat) {
			if(err) {
				if(err.code=='ERRNO') {
					sendError(res,'Not Found',404);
					return;
				} else {
					sendError(res,'Internal Server Error',500);
					throw err;
				}
			}
			fs.readdir(fullPath, function(err,files) {
				var outTree = [];
				_.each(files, function(file) {
					if(file!='.DS_Store') {
						outTree.push(fileRecord(file,node));
					}
				});
				//out.push({text: '(node):'+node});
				res.send(outTree);
				//res.send({path: node, files: out});
			});
		});
	});
	app.post('/rename', function(req,res) {
		var node = req.param('id'),
		fullPath = utils.userFilePath(node),
		newName = req.param('text'),
		newPath;

		// if the node was dragged to a new directory
		if(req.param('parentId')!=path.dirname(fullPath)) {
			// update the new path to include the new directory
			newPath = utils.userFilePath(req.param('parentId'));
			newPath = path.join(newPath,newName);
			// otherwise, just change the basename
		} else {
			newPath = path.join(path.dirname(fullPath),newName);
		}

		if(!allowedPath(node) || !allowedPath(fullPath) || !allowedPath(newPath)) {
			forbidden(res);
			console.log("Can't enter path: '"+fullPath+"' or '"+newPath+"'");

			return;
		}
		path.exists(fullPath, function(exists) {
			if(exists) {
				fs.rename(fullPath,newPath, function(err) {
					if(err) {
						sendError(res,'Internal Server Error',500);
					} else {
						fs.stat(newPath, function(err,stat) {
							var outRec = fileRecord(path.basename(newPath),path.dirname(newPath));
							outRec.id = node;
							res.send([outRec]);
						});
					}
				});
			}
		});
	});
	app.post('/new', function(req,res) {
		var node = req.param('node'),
		fullPath = utils.userFilePath(node);
		if(!allowedPath(node)) {
			forbidden(res);
			return;
		}
		path.exists(fullPath, function(exists) {
			if(!exists) {
				if(path.extname(node)=='') {
					fs.mkdir(fullPath,777, function(err) {
						if(err) {
							sendError(res,'Internal Server Error',500);
						} else {
							fs.stat(node, function(err,stat) {
								res.send([fileRecord(path.basename(node),path.dirname(node),stat)]);
							});
						}
					});
				} else {
					fs.writeFile(fullPath,'', function(err) {
						if(err) {
							sendError(res,'Internal Server Error',500);
						} else {
							res.send([fileRecord(path.basename(node),path.dirname(node))]);
						}
					});
				}
			} else {
				res.send('');
			}
		});
	});
	app.post('/delete', function(req,res) {
		var node = req.param('id'),
		fullPath = utils.userFilePath(node);
		if(!allowedPath(node)) {
			forbidden(res);
			console.log("Can't enter path: '"+fullPath+"'");

			return;
		}
		path.exists(fullPath, function(exists) {
			if(exists) {
				fs.stat(fullPath, function(err,stat) {
					if(err) {
						sendError(res,'Internal Server Error',500);
						console.log("Couldn't get stats for path: '"+fullPath+"'");

						return;
					}
					if(stat.isDirectory()) {
						fs.rmdir(fullPath, function(err) {
							if(err) {
								if(err.code=='ENOTEMPTY') {
									fs.readdir(fullPath, function(err,files) {
										var tasks = [];
										function delFile(fn,cb) {
											fs.unlink(path.join(fullPath,fn),cb);
										}

										_.each(files, function(file) {
											tasks.push(_.bind(delFile, {},file));
										});
										
										async.parallel(tasks, function(results) {
											res.send(results);
										});
									});
									return;
								} else {
									sendError(res,'Internal Server Error',500);
									console.log("Can't remove directory at path: '"+fullPath+"'; "+err);
									return;
								}
							}
							res.send('');
						});
					} else {
						fs.unlink(fullPath, function(err) {
							if(err) {
								sendError(res,'Internal Server Error',500);
								console.log("Can't unlink path: '"+fullPath+"'; "+err);
								return;
							}
							res.send('');
						});
					}
				});
			} else {
				forbidden(res,'Path does not exist!');
				console.log("Can't unlink path: '"+fullPath+"'; doesn't exist.");
			}
		});
		// fs.stat(fullPath,function(err,stat) {
		//
		// });
	});
	app.get('/load', function(req,res) {
		var node = req.param('node'),
		fullPath = utils.userFilePath(node);
		fs.readFile(fullPath, function(err,data) {
			if(err) {
				console.log('node: '+node+'\n');
				console.log('full path:'+fullPath+'\n');
				console.log(JSON.stringify(err));
				forbidden(res,"Can't open file: "+node);
			} else {
				var ext = path.extname(node);
				if(ext!='') {
					ext = ext.substring(1);
				}
				console.log('node: '+node);
				console.log('ext: '+ext);
				console.log('mime: '+mimetypes[ext]);
				if(mimetypes[ext]) {
					// res.header('Content-Type',mimetypes[ext]);
					// res.header('Content-Disposition','inline');
					// res.write()
					res.sendfile(fullPath,function(err) {
						if(err) {
							console.log(err);
							sendError("Couldn't send file: "+node);
						}
					})
				} else {
					res.send(data);
				}
			}
		});
	})
	app.post('/save', function(req,res) {
		var node = req.param('node'),
		fullPath = utils.userFilePath(node),
		data = req.param('data');
		fs.writeFile(fullPath,data, function(err) {
			if(err) {
				console.log('node: '+node+'\n');
				console.log('full path:'+fullPath+'\n');
				throw err;

			} else {
				res.send('');
			}
		});
	});
	app.post('/newdir', function(req,res) {
		var node = req.param('node'),
		fullPath = utils.userFilePath(node);
		if(!allowedPath(node)) {
			forbidden(res);
			return;
		}
		fs.mkdir(fullPath,777, function(err) {
			if(err) {
				console.log('node: '+node+'\n');
				console.log('full path:'+fullPath+'\n');
				throw err;
			} else {
				res.send('');
			}
			res.send('');
		})
	});
	app.post('/upload', function(req,res) {
		if(req.xhr) {
			var //fileName = req.header('x-file-name'),
			//fileSize = req.header('x-file-size'),
			//fileType = req.header('x-file-type');
			node = req.param('node') || req.param('userfile'),
			fullPath = utils.userFilePath(node);

			if(!allowedPath(node)) {
				forbidden(res);
				return;
			} else {
				var ws = fs.createWriteStream(fullPath);
				req.on('data', function(data) {
					ws.write(data);
				});
				res.send({
					success: true,
					fileName: path.basename(fullPath),
					fullPath: fullPath,
					readablePath: fullPath,//path.join('files',node),
				});
			}
		} else {
			req.form.complete( function(err, fields, files) {
				if(err) {
					sendError(res,'Internal Server Error',500);
					return;
				}
				if(files && files.length) {
					_.each(files, function(file) {
						var node = req.param('node'),
						tempPath = file.path;
						res.send({
							success: false
						});
					});
				}
			});
		}
	});
}