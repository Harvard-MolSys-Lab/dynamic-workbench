var _ = require('underscore');

var types = [{
	"type" : ["tex",'latex'],
	"trigger" : "tex",
	"iconCls" : "tex",
	"name" : "TeX Document"
}, {
	"type" : "txt",
	"trigger" : "txt",
	"iconCls" : "txt",
	"name" : "Plain Text"
}, {
	"type" : "js",
	"trigger" : "js",
	"iconCls" : "js",
	"name" : "Javascript File"
}, {
	"type" : "xml",
	"trigger" : "xml",
	"iconCls" : "xml",
	"name" : "XML File"
}, {
	"type" : ["html","htm"],
	"trigger" : "html",
	"iconCls" : "html",
	"name" : "HTML File"
}, {
	"type" : ["dynaml","dsml","dyn"],
	"trigger" : "dynaml",
	"iconCls" : "dynaml",
	"name" : "DyNAML Document"
}, {
	"type" : "diff",
	"trigger" : "diff",
	"iconCls" : "diff",
	"name" : "Diff comparison"
}, {
	"type" : "pil",
	"trigger" : "pil",
	"iconCls" : "pil",
	"name" : "PIL File"
}, {
	"type" : "pepper",
	"trigger" : "pepper",
	"iconCls" : "pepper",
	"name" : "Pepper File"
}, {
	"type" : "sys",
	"trigger" : "pepper",
	"iconCls" : "sys",
	"name" : "Pepper System"
}, {
	"type" : "comp",
	"trigger" : "pepper",
	"iconCls" : "comp",
	"name" : "Pepper Component"
}, {
	"type" : "crn",
	"trigger" : "crn",
	"iconCls" : "crn",
	"name" : "Chemical Reaction Network"
}, {
	"type" : "nodal",
	"trigger" : "nodal",
	"iconCls" : "nodal",
	"name" : "Nodal System"
}, {
	"type" : "seq",
	"trigger" : "sequence",
	"iconCls" : "seq",
	"name" : "Sequence"
}, {
	"type" : "dd",
	"trigger" : "sequence",
	"iconCls" : "dd",
	"name" : "Domain Design"
}, {
	"type" : "domains",
	"trigger" : "dd",
	"iconCls" : "dd",
	"name" : "Domain Design"
}, {
	"type" : "nupack",
	"trigger" : "nupackedit",
	"iconCls" : "nupack",
	"name" : "NUPACK Multi-objective Script"
}, {
	"type" : "svg",
	"trigger" : "viewer",
	"iconCls" : "svg",
	"name" : "SVG"
}, {
	"type" : "pdf",
	"trigger" : "viewer",
	"iconCls" : "pdf",
	"name" : "PDF"
}, {
	"type" : "nupack-results",
	"trigger" : "nupackresults",
	"iconCls" : "nupack-results",
	"name" : "NUPACK Results Package"
}, {
	"type" : "primary",
	"trigger" : "primary",
	"iconCls" : "primary",
	"name" : "Primary Structure"
}, {
	"type" : "secondary",
	"trigger" : "secondary",
	"iconCls" : "secondary",
	"name" : "Secondary Structure"
}];

// var triggers = {
	// tex : 'tex',
	// latex : 'tex',
	// txt : 'txt',
	// js : 'js',
	// xml : 'xml',
	// html : 'html',
	// htm : 'html',
	// dsml : 'dynaml',
	// dyn : 'dynaml',
	// dynaml : 'dynaml',
	// diff : 'diff',
	// pil : 'pil',
	// pepper : 'pepper',
	// sys : 'pepper',
	// comp : 'pepper',
	// crn : 'crn',
	// nodal : 'nodal',
	// seq : 'sequence',
	// dd : 'sequence',
	// nupack : 'nupackedit',
	// svg : 'viewer',
	// pdf : 'viewer',
	// 'nupack-results' : 'nupackresults',
	// primary : 'primary',
	// secondary : 'secondary',
// };
var triggers = {};
_.each(types,function(block) {
	if(_.isArray(block.type)) {
		_.each(block.type,function(ext) {
			triggers[ext] = block.trigger;
		});
	} else {
		triggers[block.type] = block.trigger
	}
});

var mimetypes = {
	'svg' : 'image/svg+xml',
	'pdf' : 'application/pdf',
};

exports.types = types;
exports.triggers = triggers;
exports.mimetypes = mimetypes;
