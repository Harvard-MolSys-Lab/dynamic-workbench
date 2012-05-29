/*
 * file-types.js
 * Centralized definition of various file types and how they should be handled. Various exports defined in this module are passed to the client.
 */

var _ = require('underscore'), utils = require('./utils'), path = require('path'), fs = require('fs'), winston = require('winston');

var types = [{
	"type" : ["whiteboard","workspace"],
	"trigger" : "whiteboard",
	"iconCls" : "whiteboard",
	"name" : "Whiteboard",
}, {
	"type" : ["tex", 'latex'],
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
	"type" : "json",
	"trigger" : "json",
	"iconCls" : "json",
	"name" : "Javascript Object Notation (JSON) File"
}, {
	"type" : "coffee",
	"trigger" : "coffee",
	"iconCls" : "coffee",
	"name" : "CoffeeScript File"
}, {
	"type" : "xml",
	"trigger" : "xml",
	"iconCls" : "xml",
	"name" : "XML File"
}, {
	"type" : "sbml",
	"trigger" : "xml",
	"iconCls" : "document-sbml",
	"name" : "Systems Biology Markup Language (SBML) File"
}, {
	"type" : ["html", "htm"],
	"trigger" : "html",
	"iconCls" : "html",
	"name" : "HTML File"
}, {
	"type" : ["md", "markdown"],
	"trigger" : "md",
	"iconCls" : "md",
	"name" : "Markdown File"
}, {
	"type" : "rst", 
	"trigger" : "rst",
	"iconCls" : "rst",
	"name" : "ReStructuredText File"
}, {
	"type" : ["dynaml", "dsml", "dyn"],
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
	"name" : "Pepper Intermediate Language (PIL) File"
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
	"trigger" : "dd",
	"iconCls" : "dd",
	"name" : "Domain Design"
}, {
	"type" : "ddjs",
	"trigger" : "dd",
	"iconCls" : "dd",
	"name" : "Advanced Domain Design"
}, {
	"type" : "domains",
	"trigger" : "dd",
	"iconCls" : "dd",
	"name" : "Domain Design"
}, {
	"type" : ["nupack","np"],
	"trigger" : "nupackedit",
	"iconCls" : "nupack",
	"name" : "NUPACK Multi-objective Script"
}, {
	"type" : "ms",
	"trigger" : "msedit",
	"iconCls" : "ms",
	"name" : "Multisubjective Design Script"
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
}, {
	"type" : "package",
	"iconCls" : "package",
	"trigger" : "package",
	"name" : "Package"
}, {
	"type" : "app",
	"iconCls" : "app",
	"trigger" : "app",
	"name" : "Application"
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
var triggers = {}, icons = {}
_.each(types, function(block) {
	if(_.isArray(block.type)) {
		_.each(block.type, function(ext) {
			triggers[ext] = block.trigger;
			icons[ext] = block.iconCls;
		});
	} else {
		triggers[block.type] = block.trigger;
		icons[block.type] = block.iconCls;
	}
});
var mimetypes = {
	'svg' : 'image/svg+xml',
	'pdf' : 'application/pdf',
};

var packageContentsJsonKeys = {
	'redirect' : function(data, value) {
		return path.join(data.node, value);
	},
	'text' : true,
	'iconCls' : true,
};

function contentsJson(data, contents, contentsJsonKeys) {
	_.each(contentsJsonKeys, function(trans, key) {
		var value = contents[key];
		if(value) {
			if(_.isFunction(trans)) {
				value = trans(data, value);
			}
			data[key] = value;
		}
	});
	_.extend(data, contents);
	return data;
}

var transforms = {
	'.app' : function(data, callback) {
		var fullPath = path.join(utils.userFilePath(data.node), 'contents.json');
		fs.readFile(fullPath, function(err, contents) {
			if(err) {
				callback(err, null);
				return;
			}
			contents = JSON.parse(contents);
			data = contentsJson(data, contents, packageContentsJsonKeys);
			callback(null, data);
		});
	},
	'.package' : function(data, callback) {
		var fullPath = path.join(utils.userFilePath(data.node), 'contents.json');
		fs.readFile(fullPath, function(err, contents) {
			if(err) {
				winston.log("warn", "Couldn\'t read package.json", {
					fullPath : fullPath,
					code : err.code,
					err : err
				});
				callback(err, data);
				return;
			}
			try {
				contents = JSON.parse(contents);
			} catch(e) {
				contents = {};
				err = e;
				winston.log("error", "Error parsing contents.json. ", {
					contents : contents
				});
			}
			data = contentsJson(data, contents, packageContentsJsonKeys);
			data.leaf = false;
			callback(err, data);
		});
	},
	'contents.json' : function(data, callback) {
		data.text = "Package contents";
		data.preventRename = true;
		data.iconCls = 'manifest';
		callback(null, data);
	},
	'preferences.json' : function(data, callback) {
		data.text = "Preferences";
		data.iconCls = "preferences";
		data.preventRename = true;
		callback(null, data);
	},
};

var contentTransforms = {
	'.package' : function(fullPath, callback) {
		var fullPath = path.join(fullPath, 'contents.json');
		fs.readFile(fullPath, function(err, contents) {
			if(err) {
				winston.log("error", "Failed to transform package file; couldn't read contents.json", {
					fullPath : fullPath,
					err : err
				})
				callback(err, null);
				return;
			}
			try {
				contents = JSON.parse(contents);
			} catch(e) {
				contents = {};
				err = e;
				winston.log("error", "Error parsing contents.json. ", {
					contents : contents
				});
			}
			if(contents.data) {
				callback(null, contents.data);
			} else if(contents.redirect) {
				fs.readFile(path.join(path.dirname(fullPath), contents.redirect), function(err, data) {
					callback(err, data);
				});
			} else {
				winston.log("error", "Failed to transform package file; contents.json doesn't contain anything relevant.", {
					fullPath : fullPath,
					err : err,
					contents : contents
				})
				callback(null, null);
			}
		});
	}
}

exports.contentTransforms = contentTransforms;
exports.transforms = transforms;
exports.types = types;
exports.icons = icons;
exports.triggers = triggers;
exports.mimetypes = mimetypes;
