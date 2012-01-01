var _ = require('underscore');

var scriptPath = 'client';
var libPath = 'lib';
// scriptPath + '/lib';
var extPath = libPath + '/ext-4.0.1';
var stylePath = 'static/styles';
var extStyles = extPath + '/resources/css/ext-all';
var codeMirrorVersion = '2.13';
var codeMirrorPath = libPath + '/CodeMirror-'+codeMirrorVersion;
var raphaelVersion = '2.0.1';//'1.5.2';

var styles = [extStyles, 'styles/canvas', 'styles/icons', 'styles/infomachine', 'styles/colaborate/stylesheet', libPath + '/color-field-1.0.0/color-field', codeMirrorPath + '/lib/codemirror', codeMirrorPath + '/theme/default', libPath + '/valums-file-uploader/client/fileuploader', libPath + '/ux/css/CheckHeader',
libPath + '/extjs-boxselect/src/BoxSelect'];
var libs = ['jquery-1.5.1.min', 'underscore', 'string', 'color-field-1.0.0/color-field', 'raphael-'+raphaelVersion+'/raphael-min', 'raphael-'+raphaelVersion+'//plugins/raphael.primitives', 'CodeMirror-'+codeMirrorVersion+'/lib/codemirror', 'CodeMirror-'+codeMirrorVersion+'/lib/runmode', 'valums-file-uploader/client/fileuploader', 'dna-utils', 'jquery-animate-css-rotate-scale/jquery-css-transform', 'jquery-animate-css-rotate-scale/jquery-animate-css-rotate-scale', 'Ext.ux.StatusBar', 'protovis-3.2/protovis-d3.2','/extjs-boxselect/src/BoxSelect'];
var uxs = ['RowExpander', 'CheckColumn'];
var modes = ['javascript', 'stex', 'xml', 'diff', 'htmlmixed', 'css', 'clike','python','ruby','coffeescript',];

var scripts = ['ext-bug-fixes','core','canvas','workspace',]; //'objects/objects', 'objects/element', 'objects/vector', 'objects/semantics','tools/tools','tools/draw','tools/annotate',
scripts = scripts.concat(['console','codemirror-modes','dd']); //'dna/nodal/nodal-canvas','dna/nodal/dna','dna/nodal/nodal', 'dna/secondary/secondary', 'dna/primary/primary',]);

var bootstrap = scriptPath+'/bootstrap.js';

function getResources(staticOnly,env) {
	staticOnly = staticOnly || false;
	env = env || 'production';
	
	var links = [], js = [];
	
	_.each(styles,function(sheet) {
	  links.push(sheet+".css")
	});
	// ExtJS 4
	//js.push(extPath+"/bootstrap.js")
	if(env != 'production') {
		js.push(extPath+"/bootstrap.js");
		js.push(scriptPath+'/loader.js')
	} else {
		js.push(extPath+'/ext-all.js');
	}
	
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
	
	// Mathquill
	js.push(libPath+'/mathquill/build/mathquill.js');
	links.push(libPath+'/mathquill/mathquill.css');
	
	// Aloha
	// var alohaPath = libPath+'/aloha-0.9.3/aloha';//'/Aloha-Editor/build/out/aloha-nightly';
	// js.push(libPath+'/aloha-dependencies.js');
	// js.push(alohaPath+'/aloha-nodeps.js');
	//links.push(alohaPath+'/css/aloha.css');
	
	// App and InfoMachine
	js.push(scriptPath+"/app.js")
	
	
	js.push(scriptPath+"/endpoints.js")
	if(!staticOnly) {
	js = js.concat(getDynamicResources())
	}
	
	js.push(scriptPath+"/documents.js")
	
	// Canvas workspace
	_.each( scripts ,function( script ) {
	  js.push(scriptPath+'/'+script+'.js')
	});
	
	return {links: links, scripts:js};
}

function getDynamicResources() {
	var js = [];
		js.push("/config");
		js.push("/user");
		js.push("/toolslist");
		js.push("/typeslist");

	return js;	
}

module.exports = {
	scriptPath : scriptPath, 
	libPath : libPath,
	styles : styles,
	libs : libs,
	uxs : uxs,
	scripts : scripts, 
	getResources : getResources,
	getDynamicResources : getDynamicResources,
	bootstrap: bootstrap,
}