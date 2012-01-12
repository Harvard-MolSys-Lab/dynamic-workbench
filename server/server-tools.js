/**
 * DyNAMiC Workbench
 * Copyright (c) 2011 Casey Grun, Molecular Systems Lab, Harvard University
 * 
 * PRE-RELEASE CODE. DISTRIBUTION IS PROHIBITED.
 */

var utils = require('./utils'), auth = require('./auth'), proc = require('child_process'), fs = require('fs'), _ = require('underscore'), async = require('async'), path = require('path'), DNA = require('../static/common/dna-utils').DNA, validate = require('validator'), winston = require('winston');
var check = validate.check, sanitize = validate.sanitize;

var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath, getCommand = utils.getCommand;

/*
 * @class {Server.Tool}
 * Encapsulates a functions necessary to perform a task on one of various targets.
 */
var toolsList = require('./tools-list').list, tools = _.reduce(toolsList, function(memo, name) {
	memo[name] = require('./' + path.join('server', name));
	_.defaults(memo[name], {
		/**
		 * @cfg {String} route
		 * The path relative to {@link Server#baseRoute} at which this tool will be exposed as an HTTP resource
		 */
		route : name,
		/**
		 * @cfg {String[]} params
		 * Array of parameters to be read and sanitized from req.params
		 */
		params : [],
		/**
		 * @cfg {Function} start
		 * Function to be called to start the tool
		 * @param {Function} callback
		 */
		start : function(cb) {
		},
		/**
		 * @cfg {Function} interrupt
		 * Function to be called to interrupt and terminate execution of the tool. Must kill any running processes locally or
		 * on LSF. May clean up unused files.
		 */
		interrupt : function(err, cb) {
		},
		/**
		 * @cfg {Function} after
		 * Function to be called after the task completes
		 */
		after : function(err) {
		},
		command : '',
		arguments : [],

		/**
		 * @cfg {String} name
		 * Name of the tool
		 * @client
		 */

		/**
		 * @cfg {String} iconCls
		 * CSS class of an icon to be used to represent to tool
		 * @client
		 */
	});
	return memo;
}, {});

/**
 * Exposes various route handlers to provide the client-side API to server tools
 */
exports.configure = function(app, express) {
	var baseRoute = app.set('baseRoute');

	// Expose a handler for each tool
	_.each(tools, function(spec, name) {
		app.post(path.join(baseRoute, spec.route), auth.restrict('json'), function(spec, name) {
			return function(req, res) {
				// parse parameters
				var params = _.reduce(spec.params, function(memo, param) {
					memo[param] = sanitize(req.param(param) || '').xss();
					return memo;
				}, {});

				spec.start(req, res, params, function() {
				});
			}
		}(spec, name));
	});
	// Expose a list of tools to be automatically defined as {@link App.TaskRunner.Tool} subclasses
	app.get(path.join(baseRoute, '/toolslist'), auth.restrict('json'), function(req, res) {
		var clientParams = ['name', 'iconCls', 'route'], clientTools = _.map(tools, function(block, name) {
			var out = {};
			_.each(clientParams, function(param) {
				if(block[param])
					out[param] = sanitize(block[param]).xss();
			});
			out['endpoint'] = path.join(baseRoute, block.route);
			return out;
		});
		res.send('App.TaskRunner.loadTools(' + JSON.stringify(clientTools) + ')')
	});
}