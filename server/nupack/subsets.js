var utils = require('../../utils'),
proc = require('child_process'),
fs = require('fs'),
_ = require('underscore'),
async = require('async'),
nupack = require('../nupack');

var DNA = nupack.DNA,
sendError = utils.sendError,
forbidden = utils.forbidden,
allowedPath = utils.allowedPath,
getCommand = utils.getCommand,
nupackAnalysis = nupack.analysis;

exports.name = 'NUPACK Subsets';
exports.iconCls = 'nupack-icon';
exports.params = ['node', 'strands', 'max','wc',];
exports.start = function(req, res) {
	var node = params['node'], strands = params['strands'], maxComplex = params['max'],
		wc = params['wc'], 
		fullPath = utils.userFilePath(node),
		cmd, newStrands;
		//console.log(strands);
		if(!allowedPath(node) || !allowedPath(fullPath)) {
			forbidden(res);
			console.log("Can't enter path: '"+fullPath+"'");
		}
		
		
		fs.mkdir(fullPath,777, function(err) {
			if(err && err.code!='EEXIST') {
				console.log(err);
				sendError(res,'Internal Server Error',500);
				return;
			}
			if(wc) {
				newStrands = _.map(strands,function(strand) {
					return DNA.reverseComplement(strand);
				});
			} else {
				newStrands = strands;
			}
			
			var combs = _.map(strands,function(strand) {
				return [strand].concat(newStrands);
			}), combsLabels = _.range(1,strands.length);
			
			var tasks = [];
			_.each(combs, function(comb,index) {
				//console.log([comb,'subset-'+index,fullPath].join(';'));
				tasks.push(_.bind(function(comb,label,path,options,cb) {
					nupackAnalysis(comb,label,path,options,function(err,out) {
						cb(err,out);
					}); 
				}, {},comb,'subset-'+index,fullPath,{maxComplexSize: maxComplex}));
			});
			async.series(tasks, function(err,results) {
				res.send(results.join('\n\n%%%%%%%%%%%%%%%%%%%%%%%%%%%\n\n'));
			});
		});
	}