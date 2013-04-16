/**
 * DyNAMiC Workbench
 * Copyright (c) 2011 Casey Grun, Molecular Systems Lab, Harvard University
 * 
 * PRE-RELEASE CODE. DISTRIBUTION IS PROHIBITED.
 */

var utils = require('utils'), //
	Realtime = require('./realtime');

/**
 * Exposes various route handlers to provide the client-side API to server tools
 */
exports.configure = function(app, express, session) {
	var baseRoute = app.set('baseRoute');

	var rt = new Realtime(app,session);
	rt.service(require('./task-service'))
}