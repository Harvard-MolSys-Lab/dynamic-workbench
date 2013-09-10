var utils = require('utils'), //
	auth = require('auth'), //
	fs = require('fs'), //
	path = require('path'), //
	_ = require('underscore'), //
	async = require('async'), //
	winston = require('winston'),
	sio = require('socket.io'),
	connect = require('connect'),
	parseCookie = connect.utils.parseCookie,
	MemoryStore = connect.middleware.session.MemoryStore;

/**
 * @class Realtime
 * Manages the Realtime services associated with a particular `app`. Serves
 * as a bridge between the standard HTTP-based Express application and the
 * Socket.IO-based Realtime services.
 *
 * Various Realtime services will {@link #service register} with this class
 * in order to send data to, and recieve data from clients via Socket.IO.
 */
/**
 * @constructor
 * Instantiates a Socket.IO object to handle incoming data, fetches and matches
 * Express session data 
 * 
 * @param {Express} app Express application
 * @param {Express.SessionStore} sessionStore Express SessionStore
 */
function Realtime(app, sessionStore) {
	this.app = app;
	

	this.io = sio.listen(app).set('authorization', function(data, accept) {
		if (!data.headers.cookie) return accept('No cookie transmitted.', false);

		data.cookie = parseCookie(data.headers.cookie);
		data.sessionID = data.cookie['express.sid'] || data.cookie['connect.sid'];

		sessionStore.load(data.sessionID, function(err, session) {
			if (err || !session) return accept('Error', false);

			data.session = session;
			return accept(null, true);
		});
	})

	/**
	 * @private
	 * Array of currently operating services
	 * @type {Array}
	 */
	this.services = [];
};

/**
 * Registers a new Realtime service
 * 
 * @param  {Function} configure Class to be instantiated to construct the service. The class will recieve two arguments:
 * @param {Realtime} configure.rt Reference to the application Realtime object (this)
 * @param {Object} configure.options The `options` object passed to this function
 * 
 * @param  {Object} options Options to be passed to the service class
 */
Realtime.prototype.service = function(configure, options) {
	this.services.push(new configure(this, options))
};

/**
 * Accepts a ReadableStream and "pipes" its contents to the passed socket.io room
 * @param  {ReadableStream} stream A Stream from which to read incoming `data` events
 * @param  {String} namespace Name of the Socket.io namespace to which the data should be sent
 * @param  {String} room Name of the Socket.io room to which data should be sent
 * @param  {String} [event='stream'] Name of the event emit via Socket.io. This 
 * is the event that will eventually be emitted on the _client_
 */
Realtime.prototype.iopipe = function iopipe (stream,namespace,room,event) {
	var me = this;
	event || (event = 'stream');

	stream.on('data',function(data) {
		me.io.of(namespace).in(room).emit(event,{'room':room,'data':data});
		//me.io.of(namespace).emit(event,data);
		//io.sockets.emit(event,data);
	});
};

/**
 * Pushes a blob of `data` to the passed socket.io room 
 * @param  {Object} data Data to be pushed
 * @param  {String} namespace Name of the Socket.io namespace to which the data should be sent
 * @param  {String} room Name of the Socket.io room to which data should be sent
 * @param  {String} [event='stream'] Name of the event emit via Socket.io. This 
 * is the event that will eventually be emitted on the _client_
 */
Realtime.prototype.iopush = function(data,namespace,room,event) {
	var me = this;
	event || (event = 'stream');

	me.io.of(namespace).in(room).emit(event,{'room':room,'data':data});
};

module.exports = Realtime;