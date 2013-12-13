/**
 * DyNAMiC Workbench
 * Copyright (c) 2011 Casey Grun, Molecular Systems Lab, Harvard University
 * 
 * PRE-RELEASE CODE. DISTRIBUTION IS PROHIBITED.
 */

var express = require('express'), 
app = express.createServer(), 
winston = require('winston'), 
fm = require('./server/file-manager'), tools = require('./server/server-tools'), auth = require('./server/node_modules/auth');

// var Schema = mongoose.Schema,
// UserSchema = new Schema({});
// UserSchema.plugin(mongooseAuth, {
// facebook: true
// });


app.configure('production',function() {
	app.set('env','production');
});

app.configure('debug',function() {
	app.set('env','debug');
})

app.configure(function() {
	app.set('invite', ['yinlab-workbench','mpp']);
	app.set('views', __dirname + '/views');
	app.set('baseRoute', '/');
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret : 'infomachine2'
	}));
	app.use(express.limit('10mb'));

	// logging
	winston.remove(winston.transports.Console);
	winston.add(winston.transports.Console, {
		colorize : true
	});
	winston.add(winston.transports.File, {
		filename : 'logs/full.log',
		timestamp: true,
		json: true,
		maxsize: 1024 * 1024 * 1024,
	});

	// static file server
	app.use(express['static'](__dirname + '/static'));

	// auth
	auth.configure(app, express);

	// application landing page
	app.get('/',auth.restrict('html'), function(req, res) {
		res.render('index.jade', {
			manifest: require('./server/manifest'),
			env: app.set('env'),
			layout : false
		});
	});
	
	// TODO: Add to local configuration environment
	app.get('/build.html', function(req, res) {
		res.render('build.jade', {
			manifest: require('./server/manifest'),
			env: app.set('env'),
			layout : false
		});
	});


	// TODO: Add to local configuration environment
	app.get('/tests.html', function(req, res) {
		res.render('tests.jade', {
			manifest: require('./server/manifest'),
			env: app.set('env'),
			layout : false
		});
	});
	
	// configure file manager
	fm.configure(app, express);

	// configure server-side tools
	tools.configure(app, express);
});
app.listen(3000);
console.log('Server running from ' + __dirname + ' at http://192.168.56.10:3000');
