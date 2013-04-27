var JSONStream = require('json-stream');
var DD = require('../../static/common/dd');


var stream, designer; 

process.stdin.pause();
stream = new JSONStream();
process.stdin.pipe(stream);

designer = new DD();

stream.once('data',main);
process.on('exit',finish);

process.stdin.resume();

process.stdout.write('hello world!')

function main(options) {
	designer.loadState(options);
	process.stdout.write(JSON.stringify(options)+'\n');
	process.nextTick(mutationLoop);
}

function mutationLoop() {
	mutate(designer,1000);
	writeState(designer);
	process.nextTick(mutationLoop);
}

function finish () {
	writeState(designer);
}

function mutate(designer,count) {
	for(var i=0; i<count; i++) {
		designer.mutate();
	}
}

function writeState(designer) {
	var state = designer.saveState();
	console.log(JSON.stringify(designer.saveState()));
}
