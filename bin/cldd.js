var program = require('commander'),
	_ = require('underscore'),
	DD = require('./dd'),
	fs = require('fs'),
	path = require('path');
	
	
program.usage('[options] <input file>')
	.version('0.4.5')
	.description('Command-line Domain Designer');

/*
 * Rules and design parameters
 */
var rules = {
	rule_4g : [1, "cannot have 4 G's or 4 C's in a row", Boolean],
	rule_6at : [1, "cannot have 6 A/T or G/C bases in a row", Boolean],
	rule_ccend : [1, "domains MUST start and end with C", Boolean],
	rule_ming : [1, "design tries to minimize usage of G", Boolean],
	rule_init : [7, "allowed bases in new sequences; 15 = polyN, 7 = poly-H, 3 = poly-Y, 2 = poly-T", Number],
	rule_targetworst : [1, "target worst domain",Boolean],
	rule_gatc_avail : [15, "allowed bases in all sequences; 15 = polyN, 7 = poly-H, 3 = poly-Y, 2 = poly-T",Number],
	rule_lockold : [0, "lock all old bases",Boolean],
	rule_targetdomain : [[], "array of domain indicies to target"],
	rule_shannon : [1,	"true to reward domains with a low shannon entropy",Boolean],
};
var params = ["GCstr", "ATstr", "GTstr", "MBstr", "LLstr", "DHstr", "MAX_IMPORTANCE", "LHbases", "LHstart", "LHpower", "INTRA_SCORE", "CROSSTALK_SCORE", "CROSSTALK_DIV", 
	"GGGG_PENALTY", "ATATAT_PENALTY", "MAX_MUTATIONS", "SHANNON_BONUS", "SHANNON_ADJUST"];

/*
 * Tell commander about all the flags we'd like to generate
 */
var opts = _.reduce(rules,function(program,value,key) {
	return program.option('--'+key+' <n>',value[1]+' ['+value[0]+']',value[2]);
},program);

opts = _.reduce(params,function(program,r) {
	return program.option('--'+r+' <n>','score parameter for "'+r+'"');
},program);

program.option('-b, --bored <n>','stop when the score has not changed after <n> mutation attempts')
	.option('-f, --flux <x>','stop when the score flux is less than <x>')
	.option('-d, --delta <x>','stop when the score delta is less than <x>');
	
program.option('-o, --output <file>','file to which to send output strands')
program.option('--format <format>','which format to use when outputting files (dd/seq/ddjs) [seq]','seq')
program.option('-d, --designs <n>','number of designs to produce. If > 1 and output files specified, design number will be appended to filename (e.g. design-1.dd)',1)
program.option('-u, --try-unique <n>','if design produced is not unique, attempt to redesign <n> times',0)

program.option('-i, --interactive','true to print output as mutations occur',Boolean)
program.option('-q, --quiet','in interactive mode, true to print only score statistics as mutations occur (no sequences)',Boolean)


var argv = opts.parse(process.argv);

function logBlock(message,symbol) {
	if(!symbol) symbol = '#';
	console.log(Array(70).join(symbol));
	console.log(message);
	console.log(Array(70).join(symbol));
}


/*
 * Build stopping condtion function
 */
var stop;
if(program.bored) {
	stop = function(des) {
		return des.getBoredMutations() > program.bored;
	}
} else if (program.flux) {
	stop = function(des) {
		return des.getMutationFlux() < program.flux;
	}
} else if (program.delta) {
	stop = function(des) {
		return des.getMutationDelta() < program.delta;
	}
} else {
	stop = function(des) {
		return des.getBoredMutations() > 1000;
	}
}

var iterator;
if(program.interactive) {
	iterator = function(des) {
		if(!program.quiet) {		
			console.log(des.printDomains().join('\n'));
		}
		var out = [
		'Score: '+des.getWorstScore(),
		'Mutations: '+des.getMutationCount(),
		'Attempts: '+des.getMutationAttempts(),
		'∆: '+des.getMutationDelta(),
		'd/dt: '+des.getMutationFlux(),
		'bored: '+des.getBoredMutations()];
		console.log(out.join(' | '));
		
		return stop(des)
	};
} else {
	iterator = stop;
}


/*
 * Rebuild rules and params hashes and pass to DD
 */
var dd = new DD();
var rules = _.reduce(rules,function(rules,value,r) {
	if(argv[r]) {
		rules[r] = argv[r];
	}
	return rules;
},{});

// console.log(rules);

var params = _.reduce(params,function(params,p) {
	if(argv[p]) {
		params[p] = argv[p];
	}
	return params;
},{});


// console.log(params);

dd.updateRules(rules);
dd.updateParams(params);

//debugger;

/*
 * Load data file
 */
var file = _.first(program.args);
try {
	var data = fs.readFileSync(file,'utf8');
} catch (e) {
	console.log("Unable to open file: "+file);
	process.exit(1);
}

/*
 * Design
 */
var designCount = program.designs,
	designs = [], tryUnique = program.tryUnique;
	
for(var i=0;i<designCount;i++) {
	var attempts = 0, unique = false;
	if(program.interactive) {
		logBlock('Design number: '+i,'=');
	}
	
	// Multiple design attempts (for tryUnique)
	do {
		//debugger;
		attempts++;
		if(program.interactive) {
			logBlock('Design attempt: '+attempts,'-');
		}
		dd.loadFile(data);
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
		if(tryUnique && attempts < tryUnique && designs.length > 0) {
			
			// Search all previous designs
			for(var j=0;j<designs.length;j++) {
				unique = (outputData != designs[j]);
				if(!unique) break;
			}
			
		// If tryUnique is disabled, or we've exceeded that number of attempts,
		// just break
		} else {
			unique = true;
		}
		
	} while (!unique)
	
	designs.push(outputData);
}
var outputFile = program.output;
if(outputFile) {
	if(designs.length == 1) {	
		fs.writeFileSync(outputFile,outputData,0,'utf8')
	} else {
		var outputFileExt = path.extname(outputFile),
			outputFileBase = path.join(path.dirname(outputFile), path.basename(outputFile,outputFileExt));
			
		for(var i=0;i<designs.length;i++) {
			var n = i+1;
			fs.writeFileSync(outputFileBase+'-'+n+outputFileExt,designs[i],0,'utf8')
		}
	}
}
console.log(outputData);


