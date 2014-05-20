/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.oldLog = Ext.log;
Ext.apply(App, {
	/**
	 * @member App
	 * See {@link Ext.debug.LogPanel#log}.
	 */
	log : function(args, options) {
		options || ( options = {});
		Ext.applyIf(options, {
			iconCls : '',
			silent : false
		});
		if(cp && cp.rendered) {
			cp.log.call(cp, args, options);
			if(!options.silent && cp.ownerCt.collapsed) {
				cp.ownerCt.expand();
			}
		} else if(Ext.oldLog) {
			Ext.oldLog.apply(Ext, arguments);
		}
	},
	logf : function(format, arg1, arg2, etc) {
		App.log(String.format.apply(String, arguments));
	},
	dump : function(o) {
		if( typeof o == 'string' || typeof o == 'number' || typeof o == 'undefined' || Ext.isDate(o)) {
			App.log(o);
		} else if(!o) {
			App.log("null");
		} else if( typeof o != "object") {
			App.log('Unknown return type');
		} else if(Ext.isArray(o)) {
			App.log('[' + o.join(',') + ']');
		} else {
			var b = ["{\n"];
			for(var key in o) {
				var to = typeof o[key];
				if(to != "function" && to != "object") {
					b.push(Ext.String.format("  {0}: {1},\n", key, o[key]));
				} else {
					if(_.isArray(o[key])) {to = 'array';}
					b.push(Ext.String.format("  {0}: {1},\n", key, to));
				}
			}
			var s = b.join("");
			if(s.length > 3) {
				s = s.substr(0, s.length - 2);
			}
			App.log(s + "\n}");
		}
	},
	_timers : {},

	time : function(name) {
		name = name || "def";
		Ext._timers[name] = new Date().getTime();
	},
	timeEnd : function(name, printResults) {
		var t = new Date().getTime();
		name = name || "def";
		var v = String.format("{0} ms", t - Ext._timers[name]);
		Ext._timers[name] = new Date().getTime();
		if(printResults !== false) {
			App.log('Timer ' + (name == "def" ? v : name + ": " + v));
		}
		return v;
	}
});

Ext.apply(App, (function() {
	var msgCt;

	function createBox(t, s, c) {
		c || (c = '')
		return '<div class="msg ' + c + '"><h3>' + (t || '') + '</h3><p>' + (s || '') + '</p></div>';
	}

	return {
		/**
		 * Displays pop-up messages on the top of the screen.
		 * @param {String} title Title to display in bold atop the message
		 * @param {String} format/body 
		 * Either format string (containing `{0}`-style numbered placeholders to be passed to Ext.String.format)
		 * or just a regular string. In either case it will be displayed in the message body.
		 * 
		 * @param {Object} [options] 
		 * Hash containing additional options
		 * 
		 * @param {Number} [options.delay=3000] 
		 * Length of time (in ms) that the message should be displayed
		 * 
		 * @param {Function} [options.callback] 
		 * Function to be called upon display of message. Recieves the following arguments:
		 *
		 * @param {Ext.Element} [options.callback.element] The generated message element 
		 * @param {String} [options.callback.message] The formatted message text
		 * 
		 * @param {Mixed} [options.scope] Scope in which to execute the `callback` function
		 * @param {String[]} [options.params] Parameters to fill the numbered placeholders in the message string.
		 * 
		 * @param {String...} [parameters] If options is not specified, the 
		 * remaining arguments will be treated as arguments to the numbered
		 * parameters in the format string.
		 *  
		 * @member App
		 */
		msg : function(title, format) {
			var options, params;
			if(arguments.length == 3 && _.isObject(arguments[2])) {
				options = arguments[2];
			} else {
				options = {};
			}
			_.defaults(options, {
				delay : 3000,
				scope : window,
				cls: ''
			});
			
			// Prepare message container
			if(!msgCt) {
				msgCt = Ext.core.DomHelper.insertFirst(document.body, {
					id : 'msg-div'
				}, true);
			}
			
			// Format message string
			var s;
			if(options.params) {
				params = options.params;
			} else {
				if(arguments.length > 2) {
					params = Array.prototype.slice.call(arguments, 1)
				}
			}
			if(params) {
				s = Ext.String.format.apply(String, params);
			} else {
				s = format;
			}
			
			// Insert message element
			var m = Ext.core.DomHelper.append(msgCt, createBox(title, s, options.cls), true);
			if(options.handler) {
				if(options.handler == 'console') {
					m.on('click',App.ui.Launcher.showConsole,App.ui.Launcher);
				} else {
					m.on('click',options.handler,options.scope);
				}
			}
			m.hide();
			m.slideIn('t').ghost("t", {
				delay : options.delay,
				remove : true
			});

			Ext.callback(options.callback, options.scope, m, s);
		},
	};
})());

/**
 * Alias for App#msg
 * @method msg
 * @member Ext
 */
Ext.msg = App.msg;

Ext.debug = {};
