/**
 * @author Casey Grun
 */

var express = require('express'),
app = express.createServer(),
fm = require('./file-manager'),
tools = require('./server-tools');


// var Schema = mongoose.Schema,
// UserSchema = new Schema({});
// UserSchema.plugin(mongooseAuth, {
// facebook: true
// });

app.configure( function() {
	app.set('views', __dirname + '/views');
	app.set('baseRoute','');
	app.use(express.bodyParser());
	app.use(express['static'](__dirname+'/static'));
	
	// configure file manager
	fm.configure(app,express);
	
	// configure server-side tools
	tools.configure(app,express);
});

app.listen(3000);
console.log('Server running from '+__dirname+' at http://192.168.56.10:3000');