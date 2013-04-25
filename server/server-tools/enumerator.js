var BashTask = require('./task-local-bash'),
	events = require('events'),
	util = require('util'),
	utils = require('utils'),
	fs = require('fs'),
	_ = require('underscore'),
	path = require('path');

/**
 * Creates a new EnumeratorTask
 * @param {Object} data 
 * @param {String} data.fullPath Absolute path to the file from which to draw input
 * @param {String} data.node Path to the file from which to draw input, relative to the user's home directory.
 * @param {String} data.mode Output mode to request
 * @param {Boolean} data.condense True to condense complexes, false to report full results
 */
function EnumeratorTask(data) {
	BashTask.apply(this,arguments);

	var fullPath = data['fullPath'],
		pre = path.join(path.dirname(fullPath),utils.prefix(fullPath)), 
		mode = data['mode'] || 'pil', 
		ext = mode, args;
	if (ext == 'enjs') { mode = 'json'; }
	
	args = [utils.toolPath('enumerator/enumerator.py'),'--infile',fullPath,'-i','standard','--outfile',utils.postfix(pre+'-enum',ext),'-o',mode];
	
	if(!!data['condense'] && data['condense'] != "false") {
		args.push('-c')
	}
	
	//--infile test_files/test_input_standard_SLC.in -i standard --outfile temporary_test_output.out -o standard
	this.command = 'python';
	this.arguments = args;	

};
util.inherits(EnumeratorTask,BashTask);


EnumeratorTask.params = ['node','condense','mode'];
EnumeratorTask.files = {'fullPath':'node'};

EnumeratorTask.module = 'enumerator';
EnumeratorTask.iconCls = 'enum-icon';
EnumeratorTask.route = '/enumerator';

module.exports = EnumeratorTask;