var utils = require('utils'), 
	proc = require('child_process'), //
	fs = require('fs'), _ = 
	require('underscore'), 
	async = require('async'), //
	path = require('path'), 
	winston = require('winston'),
	dynamic = require('dynamic')


// Utils abbreviations
var sendError = utils.sendError,
	forbidden = utils.forbidden,
	allowedPath = utils.allowedPath,
	getCommand = utils.getCommand, 
	prefix = utils.prefix, 
	quote = utils.quote, 
	postfix = utils.postfix; 


exports.name = 'Converter';
exports.iconCls = 'convert';
exports.params = ['node','from','to'];

exports.start = function(req, res, params) {
	var node = params['node'], fullPath = utils.userFilePath(node)
	var pre = path.join(path.dirname(fullPath),prefix(fullPath));
	var to = params['to'] || 'pil';
	var from = utils.extname(fullPath)

	var inFile = fullPath
	var outFile = postfix(pre,to)

	fs.readFile(inFile, 'utf8', function(err, inText) {
		if(err) {
			res.send({message: "Could not read input file. \n\n" + err});
			utils.log({
				level: "error",
				source: "converter",
				message: "Could not read input file",
				err: err,
				fullPath: fullPath
			});
			return;
		}

		switch (from) {
			case 'pil':
				var lib = dynamic.Library.fromPil(inText);
				switch (to) {
					case 'dil':
						outText = lib.toDilOutput();
				}
		}


		fs.writeFile(outFile, outText, function(err) {
			if(err) {
				res.send({message: "Could not write output file. \n\n" + err});
				utils.log({
					level: "error",
					source: "converter",
					message: "Could not write output file",
					err: err,
					fullPath: fullPath
				});
				return;
			} else {
				res.send({message: "Output file written to '"+outFile+"'."})
			}
		})
	});
}