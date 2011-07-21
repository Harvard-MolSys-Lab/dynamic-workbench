var utils = require('./utils'), auth = require('./auth'), proc = require('child_process'), fs = require('fs'), _ = require('underscore'), async = require('async'), path = require('path'), DNA = require('./static/lib/dna-utils').DNA;

var sendError = utils.sendError, forbidden = utils.forbidden, allowedPath = utils.allowedPath, getCommand = utils.getCommand;

var toolsList = require('./tools-list').list, tools = _.reduce(toolsList, function(memo, name) {
	memo[name] = require('./' + path.join('server', name));
	_.defaults(memo[name], {
		route : name,
		params : [],
		start : function(cb) {
		},
		interrupt : function(err, cb) {
		},
		after : function(err) {
		},
		command : '',
		arguments : [],
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
					memo[param] = req.param(param);
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
					out[param] = block[param];
			});
			out['endpoint'] = path.join(baseRoute, block.route);
			return out;
		});
		res.send('App.TaskRunner.loadTools(' + JSON.stringify(clientTools) + ')')
	});
}