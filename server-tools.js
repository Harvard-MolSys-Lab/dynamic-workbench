var utils = require('./utils'),
proc = require('child_process'),
fs = require('fs'),
_ = require('underscore'),
async = require('async');
DNA = require('./static/client/lib/dna-utils').DNA;

var sendError = utils.sendError,
forbidden = utils.forbidden,
allowedPath = utils.allowedPath;

function getCommand(tool,args) {
	if(tools[tool]) {
		var fullArgs = tools[tool].arguments.concat(args);
		fullArgs.unshift(tools[tool].command);
		return fullArgs.join(' ');
	}
	return false;
}

var tools = {
	pepper: {
		command: 'python',
		arguments: ['tools/circuit_compiler/compiler.py'],
	},
	nupackAnalysis: {
		command: 'tools/nupack3/bin/complexes',
		arguments: ['-ordered','-mfe',]
	},
	spuriousC: {
		command: 'tools/spuriousC/spuriousC',
		arguments: [],
	}
};

var nupackPath = path.resolve('tools/nupack3');

exports.configure = function(app,express) {
	var baseRoute = app.set('baseRoute');

	app.post(baseRoute+'/pepper', function(req,res) {
		var node = req.param('node'),
		fullPath = "'"+path.resolve(utils.userFilePath(node))+"'",
		cmd = getCommand('pepper',[fullPath]);
		console.log(cmd);
		proc.exec(cmd, function(err,stdout,stderr) {
			if(err) {
				console.log(err);
			}
			res.send(stdout);
		})
	});
	// app.post(baseRoute+'/nupack/analysis', function(req,res) {
	// var node = req.param('node'),
	// strands = req.param('strands'),
	// maxComplex = req.param('max'),
	// cmd;
	// console.log(strands);
	// fs.mkdir(dirPath,777, function(err) {
	// // ignore errors raised when the folder already exists.
	// if(err && err.code!='EEXIST') {
	// callback(err);
	// console.log(err);
	// return;
	// }
	// var strandList = _.compact(strands);//_.compact(strands.split('\n'));
	// fullPath = path.dirname(path.resolve(utils.userFilePath(node)));
	// prefixPath = path.join(fullPath,'complexes')
	// inFileName = path.join(fullPath,'complexes.in');
	// listFileName = path.join(fullPath,'complexes.list');
	// inFile = [strandList.length,strandList.join('\n'),maxComplex].join('\n');
	// cmd = getCommand('nupackAnalysis',[prefixPath]);
	// console.log(cmd);
	// fs.writeFile(inFileName,inFile, function(err) {
	// if(err) {
	// sendError(res,'Couldn\'t write '+inFileName,500);
	// } else {
	// fs.writeFile(listFileName,'', function(err) {
	// if(err) {
	// sendError(res,'Couldn\'t write '+listFileName,500);
	// } else {
	// proc.exec(cmd, {
	// env: {
	// 'NUPACKHOME':nupackPath
	// }
	// }, function(err,stdout,stderr) {
	// if(err) {
	// console.log(err);
	// }
	// if(!(stderr=='' || stderr==false)) {
	// res.send(stderr);
	// }
	// res.send(stdout);
	// });
	// }
	// });
	// }
	// });
	// });
	// });
	app.post(baseRoute+'/nupack/analysis', function(req,res) {
		var node = req.param('node'),
		strands = req.param('strands'),
		maxComplex = req.param('max'),
		fullPath = utils.userFilePath(node),
		cmd;
		console.log(strands);
		if(!allowedPath(node) || !allowedPath(fullPath)) {
			forbidden(res);
			console.log("Can't enter path: '"+fullPath+"'");
		}
		// console.log('fullPath:'+fullPath);
		// console.log('node:'+node);
		// console.log('basename:'+path.basename(fullPath));
		// console.log('dirname:'+path.dirname(fullPath));
		pairwise(strands,path.basename(fullPath),path.dirname(fullPath), function(out) {
			if(out.err) {
				console.log(out.err);
			}

			if(!(out.stderr=='' || out.stderr==false)) {
				res.send(out.stderr);
			}
			res.send(out.stdout);

		});
	});
	function combinations(strands) {
		var s1, s2, combs = [];
		for (i=0;i<strands.length;i++) {
			s1 = strands[i];
			for(j=i+1;j<strands.length;j++) {
				s2 = strands[j];
				combs.push([s1,s2]);
			}
		}
		return combs;
	}

	function packageNupackOut(prefixPath,callback) {
		// console.log('prefixPath: '+prefixPath);

		tasks = [

		// strand count
		// strand 1
		// strand 2
		// ...
		// max complex size
		function(cb) {
			fs.readFile(prefixPath+'.in', 'utf8', function(err,data) {
				// console.log(typeof data);

				var dataArray = _.compact(_.map(data.split('\n'), function(e) {
					return e.trim();
				}));
				cb(err, {
					strands: dataArray.slice(1,dataArray.length-1)
				});
			});
		},

		// complex, order, strands..., dG
		function(cb) {
			fs.readFile(prefixPath+'.ocx-key', 'utf8', function(err,data) {
				//console.log('begin parse ocx');
				data = DNA.stripNupackHeaders(data);
				data = data.trim();
				//console.log('data: '+data);
				table = DNA.tablify(data);
				// console.log('table: ')
				// console.log(table);
				table = DNA.indexTable(table);

				// console.log(table);

				cb(err, {
					ocx: table
				});
			});
		},

		// % %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% %
		// % complexN-orderN
		// number of bases
		// mfe
		// structure
		// base1 base2
		// base1 base2
		// ...
		// % %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% %
		function(cb) {
			fs.readFile(prefixPath+'.ocx-mfe', 'utf8', function(err,data) {
				data = DNA.stripNupackHeaders(data);
				var dataArray = data.split('% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% %');
				dataArray = _.compact(_.map(dataArray, function(a) {
					return a.trim();
				}));
				var ocx_mfe = _.map(dataArray, function(block) {
					var blockArray = block.split('\n'), complexOrder = utils.sscanf(blockArray[0].replace('% ',''),'complex%u-order%u');
					// console.log('blockArray');
					// console.log(blockArray);
					// console.log('blockArray[0]: '+blockArray[0]);
					return {
						complex: complexOrder[0],
						order: complexOrder[1],
						bases: blockArray[1],
						energy: blockArray[2],
						structure: blockArray[3],
						pairs: blockArray.slice(4)
					};
				})
				// console.log('ocx_mfe: ');
				// console.log(ocx_mfe);
				// console.log('end ocx_mfe');

				cb(err, {
					ocx_mfe:ocx_mfe
				});
			});
		},

		// actually, this file is mostly useless; all the relevant information is in ocx, near as I can tell
		// // complex, order, strands...
		// function(cb) {
		// fs.readFile(prefixPath+'.ocx-key',cb);
		// },
		];

		async.series(tasks, function(err,result) {
			// console.log('begin err: ');
			// console.log(err);
			// console.log('end err. ');
			// console.log('begin result: ');
			// console.log(result);
			// console.log('end result. ');
			var scratch = {};
			_.each(result, function(el) {
				_.extend(scratch,el);
			});
			// console.log('begin ocx: ');
			// console.log(scratch.ocx);
			// console.log('end ocx. ');
			_.each(scratch.ocx_mfe, function(rec) {
				//console.log(rec.complex-1,rec.order-1)
				if(scratch.ocx[rec.complex] && scratch.ocx[rec.complex][rec.order]) {
					rec.strands = _.map(_.compact(scratch.ocx[rec.complex][rec.order]), function(strandId) {
						if(scratch.strands[strandId-1]) {
							return scratch.strands[strandId-1];
						}
					});
				}
			});
			console.log(scratch);
			callback(scratch);
		});
	}

	function pairwise(strandPair,name,fullPath,callback) {
		dirPath = path.join(fullPath,name);
		fs.mkdir(dirPath,777, function(err) {
			// ignore errors raised when the folder already exists.
			if(err && err.code!='EEXIST') {
				console.log(fullPath);
				console.log(name);
				console.log(dirPath);
				console.log(err);
				callback({
					err:err
				});
				return;
			}
			strandPair = _.compact(_.map(strandPair, function(v) {
				return v.trim();
			}));
			var prefix = name,
			prefixPath = path.join(dirPath,prefix),
			inFileName = path.join(dirPath,prefix+'.in'),
			listFileName = path.join(dirPath,prefix+'.list'),
			inFile = [strandPair.length,strandPair.join('\n'),strandPair.length].join('\n');
			cmd = getCommand('nupackAnalysis',[prefixPath]);
			console.log(cmd);
			fs.writeFile(inFileName,inFile, function(err) {
				if(err) {
					//sendError(res,'Couldn\'t write '+inFileName,500);
					console.log(err);
					callback({
						err:err
					});
					return;
				} else {
					fs.writeFile(listFileName,'', function(err) {
						if(err) {
							//sendError(res,'Couldn\'t write '+listFileName,500);
							console.log(err);
							callback({
								err:err
							});
							return;
						} else {
							proc.exec(cmd, {
								env: {
									'NUPACKHOME':nupackPath
								}
							}, function(err,stdout,stderr) {
								if(err) {
									console.log(err);
									callback({
										err:err
									});
									return;
								}
								if(!(stderr=='' || stderr==false)) {
									console.log(err);
									callback({
										err:err,
										stderr:stderr,
									});
									return;
								}
								// res.send(stdout);
								packageNupackOut(prefixPath, function(data) {
									console.log(data);
									fs.writeFile(prefixPath+'.nupack-results',JSON.stringify(data), 'utf8', function(err) {
										console.log('finished!');
										callback({
											err: err,
											stdout:stdout,
											stderr:stderr,
											data: data,
										});
									});
								});
							});
						}
					});
				}
			});
		});
	}

	app.post(baseRoute+'/nupack/pairwise', function(req,res) {
		var node = req.param('node'),
		strands = req.param('strands'),
		maxComplex = req.param('max'),
		cmd,
		strandList = _.compact(strands),//_.compact(strands.split('\n'));
		combs = combinations(strandList),
		combsLabels = combinations(_.range(1,strandList.length+1));
		fullPath = path.dirname(path.resolve(utils.userFilePath(node)));

		var tasks = [];
		_.each(combs, function(comb,index) {
			console.log([comb,'combination-'+combsLabels[index].join(','),fullPath].join(';'));
			tasks.push(_.bind(pairwise, {},comb,'combination-'+combsLabels[index].join(','),fullPath));
		});
		async.serial(tasks, function(err,results) {
			res.send(results);
		})
	});
	app.post(baseRoute+'/spurious', function(req,res) {
		var node = req.param('node'),
		prefix = path.basename(node),
		fullPath = path.resolve(utils.userFilePath(node)),
		//rs = path.join(fullPath,prefix+'.rS'),
		st = path.join(fullPath,prefix+'.St'),
		wc = path.join(fullPath,prefix+'.wc'),
		eq = path.join(fullPath,prefix+'.eq'),
		out = 'output="'+path.join(fullPath,prefix+'.seq')+'"',
		bored = 'bored=1000';
		quiet = 'quiet=TRUE';

		cmd = getCommand('spuriousC',['template=$st wc=$wc eq=$eq',out,bored]);
		console.log(cmd);
		proc.exec(cmd, {
			env: {
				st: st,
				wc: wc,
				eq: eq,
			},
		}, function(err,stdout,stderr) {
			if(err) {
				console.log(err);
				console.log(stderr);
			}
			res.send(stdout);
		})
	});
}