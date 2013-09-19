/*
 * file-types.js
 * Centralized definition of various file types and how they should be handled. Various exports defined in this module are passed to the client.
 */

var _ = require('underscore'), utils = require('utils'), path = require('path'), fs = require('fs'), winston = require('winston');

var types = [{
	"type" : ["tex", 'latex'],
	"trigger" : "tex",
	"iconCls" : "tex",
	"name" : "TeX Document",
	"description": "TeX and LaTeX documents are input files for the TeX typesetting system; they are used to prepare manuscripts."
}, {
	"type" : "txt",
	"trigger" : "txt",
	"iconCls" : "txt",
	"name" : "Plain Text",
	"description": "Plain text files contain text.",
}, {
	"type" : "diff",
	"trigger" : "diff",
	"iconCls" : "diff",
	"name" : "Diff comparison",
	"description": "Diff files contain the results of comparing two text files.",
}, {
	"type" : "js",
	"trigger" : "js",
	"iconCls" : "js",
	"name" : "Javascript File",
	"description": "Javascript (JS) files contain executable Javascript source code; you can use them to run code in your web browser or to automate tasks in Workbench.",
}, {
	"type" : "json",
	"trigger" : "json",
	"iconCls" : "json",
	"name" : "Javascript Object Notation (JSON) File",
	"description": "JSON files contain data in an easily-parsable form. Some applications, such as caDNAno, store their data in JSON files.",
}, {
	"type" : "coffee",
	"trigger" : "coffee",
	"iconCls" : "coffee",
	"name" : "CoffeeScript File",
	"description": "CoffeeScript (COFFEE) files contain executable CoffeeScript source code. CoffeeScript can be compiled to Javascript and run within your web browser to automate tasks in Workbench.",
}, 
// Rich document formats
{
	"type" : "xml",
	"trigger" : "xml",
	"iconCls" : "xml",
	"name" : "XML File",
	"description": "eXtensible Markup Language (XML) files contain data in a structured format.",
}, {
	"type" : ["html", "htm"],
	"trigger" : "html",
	"iconCls" : "html",
	"name" : "HTML File",
	"description": "HyperText Markup Language (HTML) files contain documents which can be viewed in a web browser.",
}, {
	"type" : ["md", "markdown"],
	"trigger" : "md",
	"iconCls" : "md",
	"name" : "Markdown File",
	"description": "Markdown (MD) files use a simple text-based language to describe rich text documents. Markdown files can be edited as plain text, but easily translated to well-formatted HTML, LaTeX, etc.",
}, {
	"type" : "rst",
	"trigger" : "rst",
	"iconCls" : "rst",
	"name" : "ReStructuredText File",
	"description": "ReStructuredText (RST) files use a simple text-based language to describe rich text documents. ReStructuredText files can be edited as plain text, but easily translated to well-formatted HTML, LaTeX, etc.",
}, {
	"type" : ["whiteboard", "workspace"],
	"trigger" : "whiteboard",
	"iconCls" : "whiteboard",
	"name" : "Whiteboard",
	"description": "",
},
// Nodal/DyNAML
{
	"type" : ["dynaml", "dsml", "dyn"],
	"trigger" : "dynaml",
	"iconCls" : "dynaml",
	"name" : "DyNAML Document",
	"description": "Dynamic Nucleic Acid Markup Language (DyNAML) files contain text-based representations of Nodal systems",
}, { 
	"type": "dil",
	"trigger": "dil",
	"iconCls": "dil",
	"name": "DyNAMiC Intermediate Language (DIL) Document",
	"description": "DyNAMiC Intermediate Language (DIL) contain domain-level representations of DNA systems. They can be edited to change the domain-level design, consumed by various sequence designers, or enumerated with the domain-level enumerator.",
}, {
	"type" : "nodal",
	"trigger" : "nodal",
	"iconCls" : "nodal",
	"name" : "Nodal System",
	"description": "Nodal system (NODAL) files contain graphical representations of DNA behavioral designs using the nodal abstraction. Nodal systems can be compiled to domain-level representations (DIL files). ",
},
// Pepper
 {
	"type" : "pil",
	"trigger" : "pil",
	"iconCls" : "pil",
	"name" : "Pepper Intermediate Language (PIL) File",
	"description": "Pepper Intermediate Language (PIL) files contain domain-level descriptions of DNA systems. They can be consumed by several sequence designers or by the domain-level enumerator.",
}, {
	"type" : "pepper",
	"trigger" : "pepper",
	"iconCls" : "pepper",
	"name" : "Pepper File",
	"description": "",
}, {
	"type" : "sys",
	"trigger" : "pepper",
	"iconCls" : "sys",
	"name" : "Pepper System",
	"description": "Pepper System (SYS) files describe DNA strand displacement systems which can be designed using the Pepper behavioral designer.",
}, {
	"type" : "comp",
	"trigger" : "pepper",
	"iconCls" : "comp",
	"name" : "Pepper Component",
	"description": "Pepper Component (COMP) files contain reusable DNA components which can be incorporated into systems designed using the Pepper behavioral designer.",
}, {
	"type" : "crn",
	"trigger" : "crn",
	"iconCls" : "crn",
	"name" : "Chemical Reaction Network",
	"description": "Chemical Reaction Network (CRN) files contain text-based descriptions of networks of chemical reactions.",
},
// Sequences
 {
	"type" : "seq",
	"trigger" : "sequence",
	"iconCls" : "seq",
	"name" : "Sequence",
	"description": "Sequence (SEQ) files contain DNA sequences, optionally organized by strand name, and may contain comments and other data.",
}, {
	"type" : "dd",
	"trigger" : "dd",
	"iconCls" : "dd",
	"name" : "Domain Design",
	"description": "Domain Design (DD) files contain sequences which can be modified by the stochastic, domain-based sequence designer DD.",
}, {
	"type" : "ddjs",
	"trigger" : "dd",
	"iconCls" : "dd",
	"name" : "Advanced Domain Design",
	"description": "Advanced Domain Design (DDJS) files contain sequences which can be modified by the stochastic, domain-based sequence designer DD, as well settings preferences for DD.",
}, {
	"type" : "nupack-results",
	"trigger" : "nupackresults",
	"iconCls" : "nupack-results",
	"name" : "NUPACK Results Package",
	"description": "",
}, 
// Domains/sequence design
{
	"type" : "domains",
	"trigger" : "dd",
	"iconCls" : "dd",
	"name" : "Domain Design",
	"description": "Domain Design (DD) files contain input for the stochastic, domain-based sequence designer DD.",
}, 
// {
// 	"type" : ["nupack", "np"],
// 	"trigger" : "nupackedit",
// 	"iconCls" : "nupack",
// 	"name" : "NUPACK Multi-objective Script",
// 	"description": "NUPACK Multi-objective design scripts (NP) contain input files for the online NUPACK sequence designer.",
// }, 
{
	"type" : ["ms","np"],
	"trigger" : "msedit",
	"iconCls" : "ms",
	"name" : "Multisubjective Design Script",
	"description": "Multisubjective design scripts (MS) contain input files for the Multisubjective sequence designer",
}, {
	"type" : "mso",
	"trigger" : "msview",
	"iconCls" : "ms",
	"name" : "Multisubjective Output",
	"description": "Multisubjective output (MSO) files contain the results of running the Multisubjective sequence designer.",
}, {
	"type" : "primary",
	"trigger" : "primary",
	"iconCls" : "primary",
	"name" : "Primary Structure",
	"description": "",
}, {
	"type" : "secondary",
	"trigger" : "secondary",
	"iconCls" : "secondary",
	"name" : "Secondary Structure",
	"description": "",
},
// Enumeration
{
	"type" : "enum",
	"trigger" : "enumedit",
	"iconCls" : "enum-icon",
	"name" : "Domain-level Enumerator Script",
	"description": "Domain-level enumerator scripts are domain-level representations of DNA systems, which can be used to enumerate all possible reactions between these species with domain-level precision.",
}, {
	"type" : "enjs",
	"trigger" : "enumview",
	"iconCls" : "enum-icon",
	"name" : "Domain-level Enumerator Results",
	"description": "Domain-level enumerator result (ENJS) files describe a network of chemical reactions between domain-level representations of an ensemble of DNA species.",
}, {
	"type" : "sbml",
	"trigger" : "sbml",
	"iconCls" : "document-sbml",
	"name" : "Systems Biology Markup Language (SBML) File",
	"description": "Systems Biology Markup Language (SBML) files contain biological or chemical models ",
},
// Image
 {
	"type" : "svg",
	"trigger" : "viewer",
	"iconCls" : "svg",
	"name" : "SVG",
	"mime" : "image/svg+xml",
	"description": "Scalable Vector Graphics (SVG) files contain images which can be resized without losing detail.",
}, {
	"type" : "pdf",
	"trigger" : "viewer",
	"iconCls" : "pdf",
	"name" : "PDF",
	"mime" : "application/pdf",
	"description": "Portable Document Format (PDF) files contain documents and images",
}, {
	"type" : ["jpg","jpeg","gif","png","tiff"],
	"trigger" : "viewer",
	"iconCls" : "image",
	"name" : "Image",
	"description": "Image file",
}, 
// Meta
 {
	"type" : "package",
	"iconCls" : "package",
	"trigger" : "package",
	"name" : "Package",
	"description": "",
}, {
	"type" : "app",
	"iconCls" : "app",
	"trigger" : "app",
	"name" : "Application",
	"description": "",
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

// var mimetypes = {
	// 'svg' : 'image/svg+xml',
	// 'pdf' : 'application/pdf',
// };

var triggers = {}, icons = {}, mimetypes = {}, descriptions = {}, actions = {}, fileTypes = {};

function processBlock(key,block) {
	triggers[key] = block.trigger;
	icons[key] = block.iconCls;	
	descriptions[key] = block.description || block.desc || '';
	fileTypes[key] = block;
	if(block.actions) {
		actions[key] = block.actions;
	}
	if(block.mime) {
		mimetypes[key] = block.mime
	}
}

_.each(types, function(block) {
	if (_.isArray(block.type)) {
		_.each(block.type, function(ext) {
			processBlock(ext,block);
		});
	} else {
		processBlock(block.type,block);
	}
});


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
		if (value) {
			if (_.isFunction(trans)) {
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
			if (err) {
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
			if (err) {
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
			if (err) {
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
			if (contents.data) {
				callback(null, contents.data);
			} else if (contents.redirect) {
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

var macros = {
	'nodal-package' : function(node) {

	}
}

exports.contentTransforms = contentTransforms;
exports.transforms = transforms;
exports.types = types;
exports.fileTypes = fileTypes;
exports.icons = icons;
exports.triggers = triggers;
exports.mimetypes = mimetypes;
exports.actions = actions;
exports.descriptions = descriptions;
