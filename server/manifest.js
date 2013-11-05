var _ = require('underscore');

var scriptPath = 'client';
var commonPath = 'common';
var libPath = 'lib';
// scriptPath + '/lib';
var extPath = libPath + '/ext-4.1.0';
var stylePath = 'static/styles';
var extStyles = extPath + '/resources/css/ext-all';
var codeMirrorVersion = '2.24';
var codeMirrorPath = libPath + '/CodeMirror-'+codeMirrorVersion;
var raphaelVersion = '2.0.1';//'1.5.2';

var styles = [extStyles, 'styles/canvas', 'styles/icons', 'styles/infomachine', 'styles/colaborate/stylesheet', //
'styles/strand-preview', //
'styles/enumerator', //
libPath + '/color-field-1.0.0/color-field', codeMirrorPath + '/lib/codemirror', //
libPath + '/valums-file-uploader/client/fileuploader', libPath + '/ux/css/CheckHeader', //
libPath + '/extjs-boxselect/src/BoxSelect', libPath+'/object-browser/css/tree-node-icons',
libPath + '/ChemDoodleWeb/install/ChemDoodleWeb',libPath + '/ChemDoodleWeb/install/sketcher/jquery-ui-1.8.7.custom',];

var libs = ['jquery-1.5.1.min', 'underscore', 'string', 'color-field-1.0.0/color-field', //
'raphael-'+raphaelVersion+'/raphael-min', 'raphael-'+raphaelVersion+'//plugins/raphael.primitives', //
'zaach-jsonlint/web/jsonlint',//
'CodeMirror-'+codeMirrorVersion+'/lib/codemirror', 
// 'CodeMirror-'+codeMirrorVersion+'/lib/util/runmode', 
// 'CodeMirror-'+codeMirrorVersion+'/lib2/util/formatting', //
'valums-file-uploader/client/fileuploader', // 
'jquery-animate-css-rotate-scale/jquery-css-transform', //
'jquery-animate-css-rotate-scale/jquery-animate-css-rotate-scale', 'Ext.ux.StatusBar', //
'protovis-3.2/protovis-d3.2',
'd3-v2/d3.v2','d3-v2/lib/colorbrewer/colorbrewer',
// 'd3-v3/d3.v3','d3-v3/lib/colorbrewer/colorbrewer',

'dagre-master/dagre','/extjs-boxselect/src/BoxSelect','object-browser/ObjectBrowser',//
//'ChemDoodleWeb/install/ChemDoodleWeb-libs-nojQuery',
//'ChemDoodleWeb/install/ChemDoodleWeb',
//'ChemDoodleWeb/src/ChemDoodleWeb-unpacked',
//'ChemDoodleWeb/install/sketcher/jquery-ui-1.8.7.custom.min',
//'ChemDoodleWeb/src/ChemDoodleWeb-sketcher-unpacked',
//'ChemDoodleWeb/install/sketcher/ChemDoodleWeb-sketcher',//
'naturalSort',
];//

var uxs = ['RowExpander', 'CheckColumn'];
var modes = ['javascript', 'stex', 'gfm','rst', 'xml', 'diff', 'htmlmixed', 'css', 'clike','python','ruby','coffeescript',];
var cm_utils = ['runmode','foldcode','dialog','searchcursor',/*'search'*/,'match-highlighter']
var scripts = ['ext-bug-fixes','core','canvas','workspace',]; 
scripts = scripts.concat(['console','codemirror-modes']);

var common = ['geometry','dna-utils','dynamic','dd'];

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
	
	// CodeMirror utilities	
	_.each( cm_utils, function( util ) {
		js.push(codeMirrorPath+'/lib/util/'+util+'.js');
		if(util=='dialog' || util=='simple-hint') 
			links.push(codeMirrorPath+'/lib/util/'+util+'.css');
		
	})
	
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
	
	_.each( common, function(script) {
		js.push(commonPath+'/'+script+'.js')
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