var utils = require('../utils'), 
proc = require('child_process'), 
fs = require('fs'), 
_ = require('underscore'), 
async = require('async'),
path = require('path'),
DNA = require('../static/lib/dna-utils').DNA;

var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath, getCommand = utils.getCommand;

function prefix(str) {
	var x = path.basename(str).split('.');
	if(x.length > 1) {
		x.pop();
	}
	return x.join('.');
}

function postfix(str,ext) {
	return [str,ext].join('.');
}

function quote(str) {
	return "'"+str+"'";
}

var commands = {
	nodal : {
		command : 'python',
		arguments : ['tools/nodal/compiler2.py'],
	},
}

exports.name = 'Nodal Compiler';
exports.iconCls = 'nodal';
exports.params = ['node','data'];
exports.start = function(req, res, params) {
	var node = params['node'], // fullPath = path.resolve(utils.userFilePath(node)), 
	pre = prefix(node),
	fullPath = path.resolve(utils.userFilePath(path.join(path.dirname(node),pre))),
	inFileName = postfix(fullPath,'txt'),
	inFile = params['data'];

	fs.writeFile(inFileName,inFile, function(err) {
		if(err) {
			//sendError(res,'Couldn\'t write '+inFileName,500);
			console.log(err);
			sendError(res,'Internal Server Error',500)
			return;
		} else {

			cmd = getCommand(commands['nodal'], ['-i',quote(inFileName),'-d',quote(postfix(fullPath,'domains')),'-n',quote(postfix(fullPath,'nupack')),'-s',quote(postfix(fullPath,'svg'))]);
			console.log(cmd);
			proc.exec(cmd, function(err, stdout, stderr) {
				if(err) {
					console.log(err);
				}
				res.send(stdout);
			})
		}
	});
};