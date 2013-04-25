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

	this.services = [];
};

Realtime.prototype.service = function(configure, options) {
	this.services.push(new configure(this, options))
};

Realtime.prototype.iopipe = function iopipe (stream,namespace,room,event) {
	var me = this;
	event || (event = 'stream');

	stream.on('data',function(data) {
		me.io.of(namespace).in(room).emit(event,{'room':room,'data':data});
		//me.io.of(namespace).emit(event,data);
		//io.sockets.emit(event,data);
	});
};

Realtime.prototype.iopush = function(data,namespace,room,event) {
	var me = this;
	event || (event = 'stream');

	me.io.of(namespace).in(room).emit(event,{'room':room,'data':data});
};

module.exports = Realtime;