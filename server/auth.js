var config = require('config');
var crypto = require('crypto'), //
mongoose = require('mongoose'), // @1.7.3

fs = require('fs'), path = require('path'), _ = require('underscore'), validate = require('validator'), winston = require('winston');
var check = validate.check, sanitize = validate.sanitize;
var filesPath = config.files.path;
// path.resolve(__dirname,'../../sf_fileshare/files');// '/mount/sf_fileshare/files'; //'~/file-share/files';//

//////////////////////////////////////////////////////////////////////////////////////////////////
// Database setup

mongoose.connect(config.mongo.host);
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
var UserSchema = new Schema({
	userId : ObjectId,
	name : String,
	email : {
		type : String,
		unique : true,
		dropDups : true
	},
	password : String,
	salt : String,
	institution: {
		type: String,
		'default': 'none',
	},
	active : {
		type: Boolean,
		'default': false,
	},
	admin : {
		type : Boolean,
		'default' : false
	},
	indexes : ['email'],
});

var User = exports.User = mongoose.model('User', UserSchema);

/**
 * Used to generate a hash of the plain-text password + salt
 * @author TJ Holowaychuk
 */
function hash(msg, key) {
	return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

// very bad
function createSalt() {
	var t = String(new Date().getTime()).substr(4);
	var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for(var i = 0; i < 4; i++) {
		t += s.charAt(Math.floor(Math.random() * 26));
	}
	return t;
}

/**
 * @author TJ Holowaychuk
 */
function authenticate(email, pass, fn) {
	var user = User.findOne({
		email : email
	}, function(err, user) {
		if(err) {
			return fn(err);
		}

		// query the db for the given username
		if(!user)
			return fn(new Error('Could not find user'));
		// apply the same algorithm to the POSTed password, applying
		// the hash against the pass / salt, if there is a match we
		// found the user
		
		if(user.active) {
			if(user.password == hash(pass, user.salt))
				return fn(null, user);
		} else {
			return fn({userMessage: "Your account is not yet active. If you signed up to be an alpha tester, "+
			"you'll need to wait for an administrator to approve your account before you can login. "+
			"This could take a while depending on how many people sign up; email us if you think it's "+
			"taking too long."},null);
		}
		// Otherwise password is invalid
		fn(new Error('invalid password'));
	});
}

function restrictHtml(req, res, next) {
	if(req.session.user) {
		next();
	} else {
		//req.session.error = 'Access denied!';
		req.flash('info', 'You must log in to view this page.');
		res.redirect('/login');
	}
}

function restrictJson(req, res, next) {
	if(req.session.user) {
		next();
	} else {
		return res.send({
			success : false,
			message : 'You must log in to view this page.'
		});
	}
}

function restrictJsonAdmin(req,res,next) {
	if(req.session.user && req.session.user.admin) {
		next();
	} else {
		res.send({
			success : false,
			message : 'You must log in to view this page.'
		});
	}
}
function restrictHtmlAdmin(req,res,next) {
	if(req.session.user && req.session.user.admin) {
		next();
	} else {
		req.flash('info', 'You must log in to view this page.');
		res.redirect('/login');
	}
}

restrictors = {
	html : restrictHtml,
	json : restrictJson,
	admin: restrictHtmlAdmin,
	htmlAdmin: restrictHtmlAdmin,
	jsonAdmin: restrictJsonAdmin,
}

function restrict(type) {
	return type ? restrictors[type] : restrictors[html];
}
exports.restrict = restrict;

function userData(req, proto) {
	proto = proto || {};
	var u = req.session.user;
	proto.name = u.name;
	proto.email = u.email;
	proto.home = u.email;
	proto.id = u.userId;
	return proto;
}
exports.userData = exports.getUserData = userData;


function login(req, user, cb) {
	// Regenerate session when signing in
	// to prevent fixation
	req.session.regenerate(function() {
		// Store the user's primary key
		// in the session store to be retrieved,
		// or in this case the entire user object
		req.session.user = user;
		cb();
		//res.redirect('back');
	});
}

exports.changePassword = function changePassword(password) {
	var salt = createSalt(), 
		hashedPassword = hash(password, salt);
	return { salt: salt, password: hashedPassword };
}

exports.filesPath = filesPath;
exports.configure = function(app, express) {
	app.get('/restricted.html', restrict('html'), function(req, res) {
		res.send('Wahoo! restricted area' + req.session.user);
	});
	app.get('/restricted.json', restrict('json'), function(req, res) {
		res.send({
			success : true,
			message : 'Wahoo! restricted area'
		});
	});
	app.get('/logout', function(req, res) {
		// destroy the user's session to log them out
		// will be re-created next request
		req.session.destroy(function() {
			res.redirect('/login?logout=true');
		});
	});
	
	function doAuthenticate(req,res,doRedirect) {
		authenticate(req.param('email'), req.param('password'), function(err, user) {
			if(user) {
				login(req, user, function(err) {
					if(doRedirect) { 
						if(err) {
							req.flash('info','Incorrect login credentials; please try again.')
							res.redirect('/login')							
						} else {
							res.redirect('/')
						}
					} else {
						if(err) {
							res.send({
								success : false,
							});
						} else {
							res.send({
								success : true,
							});
						}
					}
				})
			} else {
				res.send({
					success : false,
					message: err.userMessage ? err.userMessage : 'Authentication failed, please check your username and password.'
				});
				// req.session.error = 'Authentication failed, please check your ' + ' username and password.' + ' (use "tj" and "foobar")';
				// res.redirect('back');
			}
		});
	}
	
	app.get('/login', function(req, res) {
		if(req.session.user && !req.param('action')) {
			res.redirect('/')
			//res.send('Authenticated as ' + req.session.user.name + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.');
		} else if(req.param('email') && req.param('password')) {
			doAuthenticate(req,res,true);
		} else {
			var msg = req.flash('info') || " ";
			if(req.param('logout')) {
				msg += "You have been logged out successfully.";
			}
			res.render('login.jade', {
				layout : false,
				message : msg
			});
			
		}
	});
	app.post('/login', function(req, res) {
		doAuthenticate(req,res)
	});
	app.get('/user', restrict('json'), function(req, res) {
		res.render('user.ejs', userData(req, {
			layout : false,
		}));
	});
	app.get('/admin',restrict('htmlAdmin'),function(req,res) {
		res.render('admin.jade', {
			layout : false,
			message: '',
		});
	})
	app.get('/users/read',restrict('jsonAdmin'),function(req,res) {
		User.find({},['active', 'admin','name','email','institution'],function(err,docs) {
			if(err) {
				res.send({});
				return;
			}
			res.send(JSON.stringify(docs));
		})
	});
	app.post('/users/update',restrict('jsonAdmin'),function(req,res) {
		var user = {
			name : sanitize(req.param('name')).xss(),
			email : sanitize(req.param('email')).xss(),
			institution: sanitize(req.param('institution')).xss(),
			active : !!req.param('active'),
			admin: !!req.param('admin'),		
		};
		
		var id = req.param('_id');
		User.update({'_id': id},user,function() {
			res.send(_.extend(user,{'_id': id}));
		});
		
	})
	
	app.post('/register', function(req, res) {
		var salt = createSalt(), 
		invite = req.param('invite'),          // invitation code
		invite_codes = app.set('invite'),
		user;

		if(_.isString(invite_codes)) {
			invite_codes = [invite_codes];
		} 

		user = {
			name : sanitize(req.param('name')).xss(),
			email : sanitize(req.param('email')).xss(),
			institution: sanitize(req.param('institution')).xss(),
			salt : salt,
			password : sanitize(req.param('password')).xss(),
			active : (invite_codes.indexOf(invite) != -1)
		};

		// validate for various parameters
		try {
			check(user.name,"Name must contain only alphabetical characters.").notNull().is(/[\w\s]/);
			check(user.email,"Email must be a valid email address").notNull().isEmail;
			check(user.password,"Must enter a password").notNull();
		} catch(e) {
			res.send({
				success : false,
				message : e.message
			});
		}

		// hash the password with generated salt
		user.password = hash(user.password, salt);
		user = new User(user);

		// check invitation code
		if(true) {
			user.save(function(err) {
				if(err) {
					winston.log("error", "Account creation error: couldn't save user to database.", {
						err : err
					});
					res.send({
						success : false,
						message : 'Account creation failed.'
					});
				} else {
					// make home directory
					fs.mkdir(path.join(filesPath, user.email), 0770, function(err) {
						if(err) {
							winston.log("error", "Account creation error: couldn't make home directory.", {
								err : err
							});
							res.send({
								success : false,
								message : 'Email already in use'
							});
							return;
						}
						if(user.active) {
							
							authenticate(req.param('email'), req.param('password'), function(err, user) {
								if(user) {
									login(req, user, function(err) {
										if(err) {
											res.send({
												success : false,
												message : 'Account created, but authentication failed.'
											});
											winston.log("error", "Account created, but authentication failed.", {
												err : err
											});
										} else {
											res.send({
												success : true,
												message : 'Account created.'
											});
										}
									})
								} else {
									res.send({
										success : false,
										message : 'Account created, but authentication failed.'
									});
									winston.log("error", "Account created, but authentication failed.", {
										err : err
									});
									// req.session.error = 'Authentication failed, please check your ' + ' username and password.' + ' (use "tj" and "foobar")';
									// res.redirect('back');
								}
							});
						} else {
							res.send({
								success: true,
								message: "Thanks for signing up to be an alpha tester! We'll contact you shortly when Workbench is ready!",
							})
						}
					})
				}
			});
		} else {
			res.send({
				success : false,
				message : 'Unrecognized invite code.'
			});
		}
	});
};
