var minify = require('jake-uglify').minify, _ = require('underscore'), fs = require('fs'), path = require('path'), manifest = require('./server/manifest'), version = require('./server/version');

/**
 * Collects client-side files
 */
function collect() {
	var all = [];
	data = fs.readFileSync('build/app.jsb3', 'utf-8');
	var jsb3 = JSON.parse(data), 
		jsb3_files = jsb3.builds[0].files, 
		resources = manifest.getResources(true), // true to get only static resources
	files = _.map(jsb3_files, function(spec) {
		return spec.path + spec.name;
	});
	all = resources.scripts.concat(files);
	all = _.map(all,function(file) {
		return path.join('static',file);
	});
	var canvas = '';
	all = _.reject(all,function(item) {
		if(_.last(item.split('/'))=='canvas.js') {
			canvas = item;
			return true;
		}
		return false;
	})
	all.push(canvas);
	return all;
}

var collection = collect(); 
console.log(collection)

desc('Default task to build client-side scripts')
task({'default':['./static/all.js']});


minify({'./static/all.js':collect()},function() {
	console.log('finally');
})

// {
	// header : "/* DyNAMiC Workbench " + version + " - (c) 2011 Casey Grun, Molecular Systems Lab, Harvard University */"
// }
