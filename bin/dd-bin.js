var program = require('commander'),
	_ = require('underscore'),
	DD = require('./dd'),
	fs = require('fs');
	
	
program.usage('[options] <input file>')

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
	return program.option('--'+key,value[1]+' (default: '+value[0]+')',value[2]);
},program);

opts = _.reduce(params,function(program,r) {
	return program.option('--'+r,r);
},program);

program.option('-b, --bored <n>','Stop when the score has not changed after <n> mutation attempts')
	.option('-f, --flux <x>','Stop when the score flux is less than <x>')
	.option('-d, --delta <x>','Stop when the score delta is less than <x>');
	
program.option('-i, --interactive','<true/false> True to print output as mutations occur',Boolean)
program.option('-o, --output <file>','File to which to send output strands')

var argv = opts.parse(process.argv);


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
		console.log(des.printDomains().join('\n'));
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
var rules = _.reduce(rules,function(rules,r) {
	if(argv[r]) {
		rules[r] = argv[r];
	}
	return rules;
},{});

var params = _.reduce(params,function(params,p) {
	if(argv[p]) {
		params[p] = argv[p];
	}
	return params;
},{});

dd.updateRules(rules);
dd.updateParams(params);


/*
 * Load data file
 */
var file = _.first(program.args);
var data = fs.readFileSync(file,'utf8');
dd.loadFile(data);

/*
 * Mutate
 */
dd.evaluateAllScores();
dd.mutateUntil(iterator);
var outputFile = program.output,
	outputData = dd.printDomains().join('\n');
if(outputFile) {
	fs.writeFileSync(outputFile,outputData,0,'utf8')
}
console.log(outputData);


