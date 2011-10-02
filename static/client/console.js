/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.oldLog = Ext.log;
Ext.apply(Ext, {
	/**
	 * @member Ext
	 * See {@link Ext.debug.LogPanel#log}.
	 */
	log : function(args,options) {
		options || (options = {});
		Ext.applyIf(options, {
			iconCls: '',
			silent: false
		});
		if(cp && cp.rendered) {
			cp.log.call(cp,args,options);
			if(!options.silent && cp.ownerCt.collapsed) {
				cp.ownerCt.expand();
			}
		} else if(Ext.oldLog) {
			Ext.oldLog.apply(Ext,arguments);
		}
	},
	logf : function(format, arg1, arg2, etc) {
		Ext.log(String.format.apply(String, arguments));
	},
	dump : function(o) {
		if(typeof o == 'string' || typeof o == 'number' || typeof o == 'undefined' || Ext.isDate(o)) {
			Ext.log(o);
		} else if(!o) {
			Ext.log("null");
		} else if(typeof o != "object") {
			Ext.log('Unknown return type');
		} else if(Ext.isArray(o)) {
			Ext.log('['+o.join(',')+']');
		} else {
			var b = ["{\n"];
			for(var key in o) {
				var to = typeof o[key];
				if(to != "function" && to != "object") {
					b.push(String.format("  {0}: {1},\n", key, o[key]));
				}
			}
			var s = b.join("");
			if(s.length > 3) {
				s = s.substr(0, s.length-2);
			}
			Ext.log(s + "\n}");
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
		var v = String.format("{0} ms", t-Ext._timers[name]);
		Ext._timers[name] = new Date().getTime();
		if(printResults !== false) {
			Ext.log('Timer ' + (name == "def" ? v : name + ": " + v));
		}
		return v;
	}
});

Ext.apply(Ext,(function() {
	var msgCt;

    function createBox(t, s){
       // return ['<div class="msg">',
       //         '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
       //         '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
       //         '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
       //         '</div>'].join('');
       return '<div class="msg"><h3>' + t + '</h3><p>' + s + '</p></div>';
    }
    return {
        msg : function(title, format){
            if(!msgCt){
                msgCt = Ext.core.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
            }
            var s;
            if(arguments.length>2){
            	s = Ext.String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            } else {
            	s = format;
            }
            var m = Ext.core.DomHelper.append(msgCt, createBox(title, s), true);
            m.hide();
            m.slideIn('t').ghost("t", { delay: 1000, remove: true});
        },
    };
})());

Ext.debug = {};

