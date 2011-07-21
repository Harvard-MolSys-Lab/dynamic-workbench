var utils = require('../utils'),
proc = require('child_process'),
fs = require('fs'),
_ = require('underscore'),
async = require('async'),
path = require('path'),
winston = require('winston'),
DNA = require('../static/lib/dna-utils').DNA;

var sendError = utils.sendError,
forbidden = utils.forbidden,
allowedPath = utils.allowedPath;

exports.DNA = DNA;
var nupackPath =  exports.nupackPath = exports.path = path.resolve('tools/nupack3');
var maxBuffer = 800*1024;

var commands = {
	nupackAnalysis: {
		command: 'tools/nupack3/bin/complexes',
		arguments: ['-ordered','-mfe','-pairs']
	},
	nupackConc: {
		command: 'tools/nupack3/bin/concentrations',
		arguments: ['-ordered',]
	},
}


function permute(prev,alphabet) {
	var o = [];
	_.each(prev, function(item) {
		_.each(alphabet, function(ch) {
			o.push(item+ch);
		});
	});
	return o;
}

function permutations(length) {	
	var out = ['A','T','C','G'], alph = ['A','T','C','G'];
	for(var i=1;i<length;i++) {
		out = permute(out,alph);
	}
	return out;
}

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

	tasks = [

	// strand count
	// strand 1
	// strand 2
	// ...
	// max complex size
	function(cb) {
		fs.readFile(prefixPath+'.in', 'utf8', function(err,data) {

			var dataArray = _.compact(_.map(data.split('\n'), function(e) {
				return e.trim();
			}));
			cb(err, {
				strands: dataArray.slice(1,dataArray.length-1)
			});
		});
	},

	// ocx-key: complex, order, strands...
	// cx:  complex, order, strands..., dG
	// eq: complex, order, strands... dG, concentration
	function(cb) {
		fs.readFile(prefixPath+'.eq', 'utf8', function(err,data) {
			data = DNA.stripNupackHeaders(data);
			data = data.trim();
			table = DNA.tablify(data);

			// this table actually comes as a bitmap, where, for each row, row[i+2] indicates the number of times strand i+1 appears in the complex.
			table = _.map(table, function(row) {
				var newRow = [row[0],row[1]];
				row = _.compact(row);
				for(var i=0,l=row.length-4;i<l;i++) {
					if(row[i+2]>0) {
						for(n=0;n<row[i+2];n++) {
							newRow.push(i+1);
						}
					}
				}
				newRow = newRow.concat(row.slice(-2))
				return newRow;
			});
			table = DNA.indexTable(table);

			cb(err, {
				eq: table
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
				return {
					complex: complexOrder[0],
					order: complexOrder[1],
					bases: blockArray[1],
					energy: blockArray[2],
					structure: blockArray[3],
					pairs: blockArray.slice(4)
				};
			})

			cb(err, {
				ocx_mfe:ocx_mfe
			});
		});
	},

	// % %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% %
	// % complexN-orderN
	// number of bases
	// base1 base2 probability
	// base1 base2 probability
	// ...
	// % %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% %
	function(cb) {
		fs.readFile(prefixPath+'.ocx-ppairs', 'utf8', function(err,data) {
			data = DNA.stripNupackHeaders(data);
			var dataArray = data.split('% %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% %');
			dataArray = _.compact(_.map(dataArray, function(a) {
				return a.trim();
			}));
			var ppairs = DNA.indexBy('complex','order',_.map(dataArray, function(block) {
				var blockArray = block.split('\n'), complexOrder = utils.sscanf(blockArray[0].replace('% ',''),'complex%u-order%u'),
				pairsArray = blockArray.slice(2);
				return {
					complex: complexOrder[0],
					order: complexOrder[1],
					bases: blockArray[1],
					pairs: DNA.indexTable(_.map(pairsArray, function(pairRow) {
						return _.compact(pairRow.split('\t'));
					}))
				};
			}));

			cb(err, {
				ppairs:ppairs
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
		if(err) {
			callback(err,null);
			return;
		}
		var scratch = {};
		_.each(result, function(el) {
			_.extend(scratch,el);
		});
		_.each(scratch.ocx_mfe, function(rec) {
			if(scratch.eq[rec.complex] && scratch.eq[rec.complex][rec.order]) {
				var eq = _.reject(_.clone(scratch.eq[rec.complex][rec.order]), function(i) {
					return (!i || i=='0')
				}), energy, conc;
				conc = eq.pop();
				energy = eq.pop();
				eq = _.compact(eq);

				rec.concentration = conc;
				rec.strands = _.map(eq, function(strandId) {
					if(scratch.strands[strandId-1]) {
						return scratch.strands[strandId-1];
					}
				});
				rec.strandNames = eq;
			}
			if(scratch.ppairs[rec.complex] && scratch.ppairs[rec.complex][rec.order]) {
				var ppairs = _.clone(scratch.ppairs[rec.complex][rec.order].pairs);
				rec.ppairs = ppairs;
			}
		});
		callback(err,scratch);
	});
}

function nupackAnalysis(strandPair,name,fullPath,options,callback) {
	options || (options = {});
	options = _.extend({
		maxComplexSize: strandPair.length,
		monomerConcentrations: '1e-6',
		temperature: 37,
		material: 'dna',
		mg: 1,
		na: 0,
	},options);

	dirPath = path.join(fullPath,name);
	fs.mkdir(dirPath,777, function(err) {
		// ignore errors raised when the folder already exists.
		if(err && err.code!='EEXIST') {
			winston.log("error","nupackAnalysis: Couldn't make results directory. ",{err:err,fullPath:fullPath,dirPath:dirPath,name:name});
			callback(err,null);
			return;
		}
		strandPair = _.compact(_.map(strandPair, function(v) {
			return v.trim();
		}));
		var prefix = name,
		prefixPath = path.join(dirPath,prefix),
		inFileName = path.join(dirPath,prefix+'.in'),
		listFileName = path.join(dirPath,prefix+'.list'),
		conFileName = path.join(dirPath,prefix+'.con'),
		inFile = [strandPair.length,strandPair.join('\n'),options.maxComplexSize].join('\n'),
		conFile = (_.isArray(options.monomerConcentrations) ? options.monomerConcentrations : _.map(strandPair, function(el) {
				return options.monomerConcentrations;
			})).join('\n');
		complexesCmd = utils.getCommand(commands['nupackAnalysis'],[prefixPath]);
		concCmd = utils.getCommand(commands['nupackConc'],[prefixPath]);

		fs.writeFile(inFileName,inFile, function(err) {
			if(err) {
				winston.log("error","nupackAnalysis: Couldn't write infile. ",{err:err,inFileName:inFileName, inFile:inFile,});
				callback(err,null);
				return;
			} else {
				fs.writeFile(listFileName,'', function(err) {
					if(err) {
						winston.log("error","nupackAnalysis: Couldn't write listFile. ",{err:err,listFileName:listFileName,});
						callback(err,null);
						return;
					} else {
						fs.writeFile(conFileName,conFile, function(err) {
							if(err) {
								winston.log("error","nupackAnalysis: Couldn't write conFile. ",{err:err,conFileName:conFileName,conFile:conFile});
								callback(err,null);
								return;
							} else {
								async.series([

								// Run 'complexes' executable
								function(cb) {
									winston.log("info",complexesCmd);
									proc.exec(complexesCmd, {
										env: {
											'NUPACKHOME':nupackPath
										},
										maxBuffer: maxBuffer,
									}, function(err,stdout,stderr) {
										if(err) {
											winston.log("error","nupackAnalysis: Execution error. ",{err:err,fullPath:fullPath,cmd:complexesCmd,stdout:stdout,stderr:stderr});
											cb(err,{stderr:stderr,stdout:stdout});
											return;
										}
										if(!(stderr=='' || stderr==false)) {
											winston.log("error","nupackAnalysis: Execution error. ",{err:err,fullPath:fullPath,cmd:complexesCmd,stdout:stdout,stderr:stderr});
											cb(err,{stderr:stderr,stdout:stdout});
											return;
										}
										cb(null, {
											stdout: stdout
										});
									});
								},

								// Run 'concentrations' executable
								function(cb) {
									console.log(concCmd);
									proc.exec(concCmd, {
										env: {
											'NUPACKHOME':nupackPath
										},
										maxBuffer: maxBuffer,
									}, function(err,stdout,stderr) {
										if(err) {
											winston.log("error","nupackAnalysis: Execution error. ",{err:err,fullPath:fullPath,cmd:concCmd,stdout:stdout,stderr:stderr});
											cb(err,{stderr:stderr,stdout:stdout});
											return;
										}
										if(!(stderr=='' || stderr==false)) {
											winston.log("error","nupackAnalysis: Execution error. ",{err:err,fullPath:fullPath,cmd:concCmd,stdout:stdout,stderr:stderr});
											cb(err,{stderr:stderr,stdout:stdout});
											return;
										}
										cb(null, {
											stdout: stdout
										});

									});
								}], function(err,data) {
									// res.send(stdout);
									if(err) {
										callback(err,data);
										return;
									}
									var stdout = data[0].stdout,
									stderr = data[0].stderr;
									packageNupackOut(prefixPath, function(err,dat) {
										//console.log(data);
										fs.writeFile(prefixPath+'.nupack-results',JSON.stringify(dat), 'utf8', function(err) {
											if(err) {
												winston.log("error","nupackAnalysis: packaging error. ",{err:err});
											}
											callback(err,{
												stdout:stdout,
												stderr:stderr,
												data: dat,
											});
										});
									});
								})
							}

						});
					}
				});
			}
		});
	});
}

exports.combinations = combinations;
exports.permutations = permutations;
exports.packageOut = exports.packageOutput = packageNupackOut; 
exports.analysis = nupackAnalysis;