var utils = require('utils'), proc = require('child_process'), //
fs = require('fs'), _ = require('underscore'), async = require('async'), //
path = require('path'), winston = require('winston'); //

// Utils abbreviations
var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath, getCommand = utils.getCommand, prefix = utils.prefix, quote = utils.quote, postfix = utils.postfix; 

var commands = {
	// python enumerator.py --infile test_files/test_input_standard_SLC.in -i standard --outfile temporary_test_output.out -o standard
	enumerator : {
		command : 'python',
		arguments : [utils.toolPath('enumerator/enumerator.py')],
	},
}

var maxBuffer = 1000*1024;

exports.name = 'Enumerator';
exports.iconCls = 'enum-icon';
exports.params = ['node','mode','condense','max-complex-size']
exports.start = function(req, res, params) {
	var node = params['node'], fullPath = utils.userFilePath(node), cmd;

	if (!allowedPath(node) || !allowedPath(fullPath)) {
		forbidden(res);
		console.log("Can't enter path: '" + fullPath + "'");
	}



	var pre = path.join(path.dirname(fullPath),prefix(fullPath));
	var mode = params['mode'] || 'pil';
	var ext = mode;
	if (ext == 'enjs') { mode = 'json' }

	var args = ['--infile',fullPath,'-i','standard','--outfile',postfix(pre+'-enum',ext),'-o',mode];
	
	if(!!params['max-complex-size']) { 
		args = args.concat(['--max-complex-size', params['max-complex-size']]) 
	}
	
	if(!!params['condense'] && params['condense'] != "false") {
		args.push('-c')
	}
	
	//--infile test_files/test_input_standard_SLC.in -i standard --outfile temporary_test_output.out -o standard
	cmd = getCommand(commands['enumerator'], 
	args)
	
	winston.log("info", cmd);
	
	proc.exec(cmd, {maxBuffer: maxBuffer},function(err, stdout, stderr) {
		if (err) {
			utils.log({
				level: "error", 
				message: "Enumerator execution error. ", 
				source: 'enumerator',
				cmd : cmd,
				stderr : stderr,
				stdout : stdout,
				err : err,
			});
		}
		if (stderr) {
			utils.log({
				level: "error", 
				source: "enumerator", 
				message: "Enumerator execution error. ", 
				cmd : cmd,
				stderr : stderr,
				stdout : stdout,
			});
			return res.send("Task completed with errors. \n\n" + stderr + '\n'+ stdout,200);
		} else {
			return res.send(stdout,200);
		}
	})
};
