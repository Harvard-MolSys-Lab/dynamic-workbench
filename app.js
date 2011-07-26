/**
 * @author Casey Grun
 */

var express = require('express'), app = express.createServer(), winston = require('winston'), fm = require('./file-manager'), tools = require('./server-tools'), auth = require('./auth');

// var Schema = mongoose.Schema,
// UserSchema = new Schema({});
// UserSchema.plugin(mongooseAuth, {
// facebook: true
// });

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('baseRoute', '/');
	app.set('invite', 'yinlab-workbench');
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret : 'infomachine2'
	}));

	// logging
	winston.remove(winston.transports.Console);
	winston.add(winston.transports.Console, {
		colorize : true
	});
	winston.add(winston.transports.File, {
		filename : 'logs/full.log'
	});

	// static file server
	app.use(express['static'](__dirname + '/static'));

	// auth
	auth.configure(app, express);

	// application landing page
	app.get('/',auth.restrict('html'), function(req, res) {
		res.render('index.jade', {
			manifest: require('./manifest'),
			layout : false
		});
	});
	app.get('/build', function(req, res) {
		res.render('build.jade', {
			manifest: require('./manifest'),
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
