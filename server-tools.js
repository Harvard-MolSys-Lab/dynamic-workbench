var utils = require('./utils'),
proc = require('child_process'),
fs = require('fs'),
_ = require('underscore'),
async = require('async');
DNA = require('./static/client/lib/dna-utils').DNA;

var sendError = utils.sendError,
forbidden = utils.forbidden,
allowedPath = utils.allowedPath,
getCommand = utils.getCommand;

var toolsList = require('./tools-list').list,
	tools = _.reduce(toolsList,function(memo,name) {
		memo[name] = require('./'+path.join('server',name));
		_.defaults(memo[name],{
			route: name,
			params: [],
			start: function(cb) {},
			interrupt: function(err,cb) {},
			after: function(err) {},
			command: '',
			arguments: [],
		});
		return memo;
	}, {});

// var tools = {
	// pepper: {
		// command: 'python',
		// arguments: ['tools/circuit_compiler/compiler.py'],
	// },
	// nupackAnalysis: {
		// command: 'tools/nupack3/bin/complexes',
		// arguments: ['-ordered','-mfe','-pairs']
	// },
	// nupackConc: {
		// command: 'tools/nupack3/bin/concentrations',
		// arguments: ['-ordered',]
	// },
	// spuriousC: {
		// command: 'tools/spuriousC/spuriousC',
		// arguments: [],
	// }
// };




exports.configure = function(app,express) {
	var baseRoute = app.set('baseRoute');
	_.each(tools,function(spec,name) {
		app.post(path.join(baseRoute,spec.route),function(spec,name) {
			return function(req,res) {
				// parse parameters
				var params = _.reduce(spec.params,function(memo,param) {
					memo[param] = req.param(param);
					return memo;
				},{});
				
				spec.start(req,res,params,function() {});
			}
		}(spec,name));
	});
	app.get(path.join(baseRoute,'/toolslist'),function(req,res) {
		var clientParams = ['name','iconCls','route'],
			clientTools = _.map(tools,function(block,name) {
				var out = {};
				_.each(clientParams,function(param) {
					if(block[param]) out[param] = block[param];
				});
				out['endpoint'] = path.join(baseRoute,block.route);
				return out;
			});
		res.send('App.TaskRunner.loadTools('+JSON.stringify(clientTools)+')')
	});
	// app.post(baseRoute+'/pepper', function(req,res) {
		// var node = req.param('node'),
		// fullPath = "'"+path.resolve(utils.userFilePath(node))+"'",
		// cmd = getCommand('pepper',[fullPath]);
		// console.log(cmd);
		// proc.exec(cmd, function(err,stdout,stderr) {
			// if(err) {
				// console.log(err);
			// }
			// res.send(stdout);
		// })
	// });
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
	// app.post(baseRoute+'/nupack/analysis', function(req,res) {
		// var node = req.param('node'),
		// strands = req.param('strands'),
		// maxComplex = req.param('max'),
		// fullPath = utils.userFilePath(node),
		// cmd;
		// console.log(strands);
		// if(!allowedPath(node) || !allowedPath(fullPath)) {
			// forbidden(res);
			// console.log("Can't enter path: '"+fullPath+"'");
		// }
		// // console.log('fullPath:'+fullPath);
		// // console.log('node:'+node);
		// // console.log('basename:'+path.basename(fullPath));
		// // console.log('dirname:'+path.dirname(fullPath));
		// nupackAnalysis(strands,path.basename(fullPath),path.dirname(fullPath), {}, function(err,out) {
			// if(err) {
				// console.log(err);
				// sendError(res,'Internal server error',500);
				// return;
			// }
// 			
			// if(!!out.stderr) {
				// res.send(out.stderr);
				// return;
			// }
			// res.send(out.stdout);
// 
		// });
	// });
	
	// app.post(baseRoute+'/nupack/pairwise', function(req,res) {
		// var node = req.param('node'),
		// strands = req.param('strands'),
		// maxComplex = req.param('max'),
		// fullPath = utils.userFilePath(node),
		// cmd;
		// console.log(strands);
		// if(!allowedPath(node) || !allowedPath(fullPath)) {
			// forbidden(res);
			// console.log("Can't enter path: '"+fullPath+"'");
		// }
		// // console.log('fullPath:'+fullPath);
		// // console.log('node:'+node);
		// // console.log('basename:'+path.basename(fullPath));
		// // console.log('dirname:'+path.dirname(fullPath));
		// nupackAnalysis(strands,path.basename(fullPath),path.dirname(fullPath), {
			// maxComplexSize:2
		// }, function(err,out) {
			// if(err) {
				// console.log(err);
				// sendError(res,'Internal server error',500);
				// return;
			// }
// 
			// if(!!out.stderr) {
				// res.send(out.stderr);
				// return;
			// }
			// res.send(out.stdout);
// 
		// });
	// });
	
	// app.post(baseRoute+'/nupack/subsets', function(req,res) {
		// var node = req.param('node'),
		// strands = req.param('strands'),
		// maxComplex = req.param('max'),
		// wc = req.param('wc'), 
		// fullPath = utils.userFilePath(node),
		// cmd, newStrands;
		// //console.log(strands);
		// if(!allowedPath(node) || !allowedPath(fullPath)) {
			// forbidden(res);
			// console.log("Can't enter path: '"+fullPath+"'");
		// }
// 		
// 		
		// fs.mkdir(fullPath,777, function(err) {
			// if(err && err.code!='EEXIST') {
				// console.log(err);
				// sendError(res,'Internal Server Error',500);
				// return;
			// }
			// if(wc) {
				// newStrands = _.map(strands,function(strand) {
					// return DNA.reverseComplement(strand);
				// });
			// } else {
				// newStrands = strands;
			// }
// 			
			// var combs = _.map(strands,function(strand) {
				// return [strand].concat(newStrands);
			// }), combsLabels = _.range(1,strands.length);
// 			
			// var tasks = [];
			// _.each(combs, function(comb,index) {
				// //console.log([comb,'subset-'+index,fullPath].join(';'));
				// tasks.push(_.bind(function(comb,label,path,options,cb) {
					// nupackAnalysis(comb,label,path,options,function(err,out) {
						// cb(err,out);
					// }); 
				// }, {},comb,'subset-'+index,fullPath,{maxComplexSize: maxComplex}));
			// });
			// async.series(tasks, function(err,results) {
				// res.send(results.join('\n\n%%%%%%%%%%%%%%%%%%%%%%%%%%%\n\n'));
			// });
		// });
	// });
	// app.post(baseRoute+'/brute', function(req,res) {
		// var node = req.param('node'),
		// strands = req.param('strands'),
		// length = req.param('length'),
		// fullPath = utils.userFilePath(node),
		// cmd;
		// //console.log(strands);
		// if(!allowedPath(node) || !allowedPath(fullPath)) {
			// forbidden(res);
			// console.log("Can't enter path: '"+fullPath+"'");
		// }
// 
		// function brute(strands,length) {
// 
			// var designer = new DD();
			// nMers = permutations(length),
			// nMerIndex = 0;
			// designer.addDomains(strands);
			// nMerIndex = designer.getDomainCount();
// 
			// return scores = _.reduce(nMers, function(memo,nMer) {
				// designer.addDomains([nMer]);
				// // true to force recalculation of scores
				// memo[nMer] = designer.getScore(nMerIndex,true)
				// designer.popDomain();
				// return memo;
			// }, {});
// 
		// }
// 
		// nupackAnalysis(strands,path.basename(fullPath),path.dirname(fullPath), {
			// maxComplexSize:2
		// }, function(err,out) {
			// if(err) {
				// console.log(err);
				// sendError(res,'Internal Server Error',500);
				// return;
			// }
// 
			// if(!!out.stderr) {
				// res.send(out.stderr);
				// return;
			// }
			// res.send(out.stdout);
// 
		// });
		// /*
		 // // var node = req.param('node'),
		 // // strands = req.param('strands'),
		 // // maxComplex = req.param('max'),
		 // // cmd,
		 // // strandList = _.compact(strands),//_.compact(strands.split('\n'));
		 // // combs = combinations(strandList),
		 // // combsLabels = combinations(_.range(1,strandList.length+1));
		 // // fullPath = path.dirname(path.resolve(utils.userFilePath(node)));
		 // //
		 // // var tasks = [];
		 // // _.each(combs, function(comb,index) {
		 // // console.log([comb,'combination-'+combsLabels[index].join(','),fullPath].join(';'));
		 // // tasks.push(_.bind(pairwise, {},comb,'combination-'+combsLabels[index].join(','),fullPath));
		 // // });
		 // // async.serial(tasks, function(err,results) {
		 // // res.send(results);
		 // // })
		 // // nupackAnalysis(strandList,path.basename(fullPath),path.dirname(fullPath), {maxComplexSize:2}, function(out) {
		 // // if(out.err) {
		 // // console.log(out.err);
		 // // }
		 // //
		 // // if(!!out.stderr) {
		 // // res.send(out.stderr);
		 // // return;
		 // // }
		 // // res.send(out.stdout);
		 // //
		 // // });
		 // */
	// });
	
	

	// app.post(baseRoute+'/spurious', function(req,res) {
		// var node = req.param('node'),
		// prefix = path.basename(node),
		// fullPath = path.resolve(utils.userFilePath(node)),
		// //rs = path.join(fullPath,prefix+'.rS'),
		// st = path.join(fullPath,prefix+'.St'),
		// wc = path.join(fullPath,prefix+'.wc'),
		// eq = path.join(fullPath,prefix+'.eq'),
		// out = 'output="'+path.join(fullPath,prefix+'.seq')+'"',
		// bored = 'bored=1000';
		// quiet = 'quiet=TRUE';
// 
		// cmd = getCommand('spuriousC',['template=$st wc=$wc eq=$eq',out,bored]);
		// console.log(cmd);
		// proc.exec(cmd, {
			// env: {
				// st: st,
				// wc: wc,
				// eq: eq,
			// },
		// }, function(err,stdout,stderr) {
			// if(err) {
				// console.log(err);
				// console.log(stderr);
			// }
			// res.send(stdout);
		// })
	// });
}