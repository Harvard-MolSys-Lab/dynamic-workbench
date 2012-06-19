#!/usr/bin/env node
/*
 * (The MIT License)

Copyright (c) 2012 Casey Grun <casey.grun@wyss.harvard.edu> David Zhang, John Sadowski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var program = require('commander'), _ = require('underscore'), DD = require('./dd'), fs = require('fs'), path = require('path');

program.usage('[options] <input file>').version('0.4.6.0').description('Command-line Domain Designer');

/*
 * Rules and design parameters
 */
var rules = {
	rule_4g : [1, "cannot have 4 G's or 4 C's in a row", Boolean],
	rule_6at : [1, "cannot have 6 A/T or G/C bases in a row", Boolean],
	rule_ccend : [1, "domains MUST start and end with C", Boolean],
	rule_ming : [1, "design tries to minimize usage of G", Boolean],
	rule_init : [7, "allowed bases in new sequences; 15 = polyN, 7 = poly-H, 3 = poly-Y, 2 = poly-T", Number],
	rule_targetworst : [1, "target worst domain", Boolean],
	rule_gatc_avail : [15, "allowed bases in all sequences; 15 = polyN, 7 = poly-H, 3 = poly-Y, 2 = poly-T", Number],
	rule_lockold : [0, "lock all old bases", Boolean],
	rule_targetdomain : [[], "array of domain indicies to target"],
	rule_shannon : [1, "true to reward domains with a low shannon entropy", Boolean],
};
var params = ["GCstr", "ATstr", "GTstr", "MBstr", "LLstr", "DHstr", "MAX_IMPORTANCE", "LHbases", "LHstart", "LHpower", "INTRA_SCORE", "CROSSTALK_SCORE", "CROSSTALK_DIV", "GGGG_PENALTY", "ATATAT_PENALTY", "MAX_MUTATIONS", "SHANNON_BONUS", "SHANNON_ADJUST"];

/*
 * Tell commander about all the flags we'd like to generate
 */
var opts = _.reduce(rules, function(program, value, key) {
	return program.option('--' + key + ' <n>', value[1] + ' [' + value[0] + ']', value[2]);
}, program);

opts = _.reduce(params, function(program, r) {
	return program.option('--' + r + ' <n>', 'score parameter for "' + r + '"');
}, program);

program.option('-b, --bored <n>', 'stop when the score has not changed after <n> mutation attempts').option('-f, --flux <x>', 'stop when the score flux is less than <x>').option('-d, --delta <x>', 'stop when the score delta is less than <x>');

program.option('-o, --output <file>', 'file to which to send output strands')
program.option('--format <format>', 'which format to use when outputting files (dd/seq/ddjs) [seq]', 'seq')
program.option('-d, --designs <n>', 'number of designs to produce. If > 1 and output files specified, design number will be appended to filename (e.g. design-1.dd)', 1)
program.option('-u, --try-unique <n>', 'if design produced is not unique, attempt to redesign <n> times', 0)
program.option('-n, --no-reseed <n>', 'for multiple designs, do not reseed the domains for each design, but simply continue mutating until the stopping condition is met. If <n> is provided, it will override the value for the stopping '+
'condition after the first attempt', 0);

program.option('-i, --interactive', 'true to print output as mutations occur', Boolean)
program.option('-q, --quiet', 'in interactive mode, true to print only score statistics as mutations occur (no sequences)', Boolean)


program.on('--help', function(){
	console.log("");
	console.log("Copyright (c) 2012 David Zhang, Casey Grun, John Sadowski");
	console.log("(The MIT License)");
});



var argv = opts.parse(process.argv);

/*function logBlock(message,symbol) {
 if(!symbol) symbol = '#';
 console.log(Array(70).join(symbol));
 console.log(message);
 console.log(Array(70).join(symbol));
 }*/

/*
 * Build stopping condtion function
 */
var stop, // the stopping condition function
stopping_condition, // the value at which to stop for the first attempt
alt_stopping_condition; // the value at which to stop for the nth attempt (n>1)

if (program.bored) {
	stopping_condition = program.bored
	stop = function(des) {
		return des.getBoredMutations() > stopping_condition;
	}
} else if (program.flux) {
	stopping_condition = program.flux
	stop = function(des) {
		return des.getMutationFlux() < program.flux;
	}
} else if (program.delta) {
	stopping_condition = program.delta
	stop = function(des) {
		return des.getMutationDelta() < program.delta;
	}
} else {
	stopping_condition = 1000
	stop = function(des) {
		return des.getBoredMutations() > 1000;
	}
}

// if an alternative stopping condition
if (program.noReseed) {
	if (_.isNumber(program.noReseed) && program.noReseed > 1) {
		alt_stopping_condition = program.noReseed
	} else {
		alt_stopping_condition = stopping_condition
	}
}

var iterator;
if (program.interactive) {
	iterator = function(des) {
		if (!program.quiet) {
			console.log(des.printDomains().join('\n'));
		}
		var out = ['Score: ' + des.getWorstScore().toFixed(2), 'Mut: ' + des.getMutationCount(), 'Att: ' + des.getMutationAttempts(), '∆: ' + des.getMutationDelta().toFixed(1), 'd/dt: ' + des.getMutationFlux().toPrecision(3), 'bored: ' + des.getBoredMutations() + ' '];
		var o = '\r' + out.join(' | ');
		process.stdout.write(o)// + Array(80-out.length+1).join(' '));

		return stop(des)
	};
} else {
	iterator = stop;
}

/*
 * Rebuild rules and params hashes and pass to DD
 */
var dd = new DD();
var rules = _.reduce(rules, function(rules, value, r) {
	if (argv[r]) {
		rules[r] = argv[r];
	}
	return rules;
}, {});

// console.log(rules);

var params = _.reduce(params, function(params, p) {
	if (argv[p]) {
		params[p] = argv[p];
	}
	return params;
}, {});

// console.log(params);

dd.updateRules(rules);
dd.updateParams(params);

//debugger;

/*
 * Load data file
 */
var file = _.first(program.args);
try {
	var data = fs.readFileSync(file, 'utf8');
} catch (e) {
	console.log("Unable to open file: " + file);
	process.exit(1);
}

/*
 * Design
 */
var designCount = program.designs, designs = [], tryUnique = program.tryUnique;

// Multiple designs
for (var i = 0; i < designCount; i++) {
	var attempts = 0, unique = false;

	current_stopping_condition = stopping_condition

	// Multiple design attempts (for tryUnique)
	do {
		//debugger;

		attempts++;
		if (program.interactive) {
			console.log('\nDesign ' + i + ', attempt ' + attempts + ':');
		}
		if (!program.noReseed) {
			dd.loadFile(data);
		}
		dd.evaluateAllScores();
		dd.mutateUntil(iterator);
		var outputData;
		switch(program.format) {
			case 'dd':
				outputData = dd.saveFile();
				break;
			case 'ddjs':
				outputData = JSON.stringify(dd.saveState());
				break;
			case 'seq':
			default:
				outputData = dd.printDomains().join('\n');
		}

		// If we've attempted less than `tryUnique` times
		if (tryUnique && attempts < tryUnique && designs.length > 0) {

			// Search all previous designs
			for (var j = 0; j < designs.length; j++) {
				unique = (outputData != designs[j]);
				if (!unique)
					break;
			}

			// If tryUnique is disabled, or we've exceeded that number of attempts,
			// just break
		} else {
			unique = true;
		}

		current_stopping_condition = alt_stopping_condition

	} while (!unique)

	designs.push(outputData);
}
var outputFile = program.output;
if (outputFile) {
	if (designs.length == 1) {
		fs.writeFileSync(outputFile, outputData, 0, 'utf8')
	} else {
		var outputFileExt = path.extname(outputFile), outputFileBase = path.join(path.dirname(outputFile), path.basename(outputFile, outputFileExt));

		for (var i = 0; i < designs.length; i++) {
			var n = i + 1;
			fs.writeFileSync(outputFileBase + '-' + n + outputFileExt, designs[i], 0, 'utf8')
		}
	}
}
console.log(outputData);

