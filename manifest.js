var scriptPath = 'client';
var libPath = 'lib';
// scriptPath + '/lib';
var extPath = libPath + '/ext-4.0.1';
var stylePath = 'static/styles';
var extStyles = extPath + '/resources/css/ext-all';
var codeMirrorPath = libPath + '/CodeMirror-2.11';

var styles = [extStyles, 'styles/canvas', 'styles/icons', 'styles/infomachine', 'styles/colaborate/stylesheet', libPath + '/color-field-1.0.0/color-field', codeMirrorPath + '/lib/codemirror', codeMirrorPath + '/theme/default', libPath + '/valums-file-uploader/client/fileuploader', libPath + '/ux/css/CheckHeader'];
var libs = ['jquery-1.5.1.min', 'underscore', 'string', 'color-field-1.0.0/color-field', 'raphael/raphael-min', 'raphael/plugins/raphael.primitives', 'CodeMirror-2.11/lib/codemirror', 'CodeMirror-2.11/lib/runmode', 'valums-file-uploader/client/fileuploader', 'dna-utils', 'Ext.ux.StatusBar', 'protovis-3.2/protovis-d3.2'];
var uxs = ['RowExpander', 'CheckColumn'];
var modes = ['javascript', 'stex', 'xml', 'diff', 'htmlmixed', 'css', 'clike'];

var scripts = ['ext-bug-fixes','core','canvas','workspace',]; //'objects/objects', 'objects/element', 'objects/vector', 'objects/semantics','tools/tools','tools/draw','tools/annotate',
scripts = scripts.concat(['console','codemirror-modes','dd']); //'dna/nodal/nodal-canvas','dna/nodal/dna','dna/nodal/nodal', 'dna/secondary/secondary', 'dna/primary/primary',]);


function getResources(staticOnly) {
	staticOnly = staticOnly || false;
	var links = [], js = [];
	
	_.each(styles,function(sheet) {
	  links.push(sheet+".css")
	});
	// ExtJS 4
	js.push(extPath+"/bootstrap.js")
	
	// Libraries
	_.each(libs ,function(lib) {
	  js.push(libPath+"/"+lib+".js")
	});
	
	// Ext UX
	_.each( uxs ,function( ux ) {
	  js.push(libPath+"/ux/"+ux+".js")
	});
	
	// CodeMirror modes
	_.each( modes ,function( mode ) {
	    js.push(codeMirrorPath+"/mode/"+mode+"/"+mode+".js")
	    if(mode == 'diff')
	        links.push(codeMirrorPath+"/mode/"+mode+"/"+mode+".css")
	});
	
	// App and InfoMachine
	js.push(scriptPath+"/app.js")
	
	js.push(scriptPath+"/endpoints.js")
	if(!staticOnly) {
		js.push("/user")
		js.push("/toolslist")
	}
	
	js.push(scriptPath+"/documents.js")
	
	// Canvas workspace
	_.each( scripts ,function( script ) {
	  js.push(scriptPath+'/'+script+'.js')
	});
	
	return {links: links, scripts:js};
}

module.exports = {
	scriptPath : scriptPath, 
	libPath : libPath,
	styles : styles,
	libs : libs,
	uxs : uxs,
	scripts : scripts, 
	getResources : getResources,
}