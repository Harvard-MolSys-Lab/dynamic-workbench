/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

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
		if(cp) {
			cp.log.call(cp,args,options);
			if(!options.silent && cp.ownerCt.collapsed) {
				cp.ownerCt.expand();
			}
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

Ext.debug = {};

/**
 * Console code entry window. Allows execution of arbitrary javascript within the context of the currently active
 * {@link App.ui.Application}. That is, <code>this</code> will refer to the active app. 
 */
Ext.define('Ext.debug.ScriptsPanel', {
	extend: 'Ext.panel.Panel',
	id:'x-debug-scripts',
	region: 'east',
	minWidth: 200,
	split: true,
	width: 350,
	border: false,
	layout:'fit',
	bodyBorder: false,
	padding: '5 0 5 0',
	//	style:'border-width:0 0 0 1px;',

	initComponent : function() {
		
		/**
		 * @property {App.ui.CodeMirror} scriptField
		 * Field into which code is entered
		 */
		this.scriptField = Ext.create('App.ui.CodeMirror',{
			style:'border-width:0;',
			mode: 'javascript',
			tbar: false,
			onKeyEvent: Ext.bind(function(editor, e) {
				if(e.keyCode==13 && e.shiftKey && e.type=='keydown') {
					e.stop();
					this.evalScript();
					return false;
				}
			},this)
		});
		
		/**
		 * @property {Ext.form.Checkbox} trapBox
		 * Checked to trap errors, unchecked to allow them to bubble to the browser console
		 */
		this.trapBox = Ext.create('Ext.form.Checkbox',{
			id: 'console-trap',
			boxLabel: 'Trap Errors',
			checked: true
		});

		this.toolbar = Ext.create('Ext.Toolbar',{
			dock: 'top',
			items:[{
				text: 'Run',
				scope: this,
				handler: this.evalScript
			},{
				text: 'Clear',
				scope: this,
				handler: this.clear
			},
			'->',
			this.trapBox,
			' ', ' '
			]
		});

		this.items = [this.scriptField];
		this.dockedItems = [this.toolbar];

		this.callParent(arguments);
	},
	/**
	 * Evaluates the script in {@link #scriptField}
	 */
	evalScript : function() {
		var s = this.scriptField.getValue();
		if(this.trapBox.getValue()) {
			try {
				var rt = new Function(s);
				rt = rt.apply(App.ui.active()); //eval(s);
				Ext.dump(rt === undefined? '(no return)' : rt);
			} catch(e) {
				Ext.log(e.message || e.descript,{iconCls: 'error'});
			}
		} else {
			var rt = new Function(s);
				rt = rt.apply(App.ui.active());
			Ext.dump(rt === undefined? '(no return)' : rt);
		}
	},
	/**
	 * Clears the script entry field
	 */
	clear : function() {
		this.scriptField.setValue('');
		this.scriptField.focus();
	}
});

/**
 * Displays console output. Can also show "sub-console" windows for things like {@link App.TaskRunner.Task}s 
 * which display several related outputs. 
 */
Ext.define('Ext.debug.LogPanel', {
	extend: 'Ext.panel.Panel',
	autoScroll: true,
	region: 'center',
	border: '0 1 0 0',
	bodyBorder: false,
	padding: '5 0 5 0',
	html: '<div class="logBody"></div>',
	getLogBody: function() {
		return this.body.down('.logBody');
	},
	initComponent: function() {
		this.groups = {};
		this.callParent(arguments);
	},
	/**
	 * Logs args to the console
	 * @param {Mixed} args
	 * @param {Object} options Hash containing the following parameters:
	 * 	- silent {Boolean} True to prevent the console from automatically showing if closed, false to automatically
	 *    show the console after this message (defaults to false)
	 *  - iconCls {String} CSS class for an icon to display next to this message
	 *  - group {Mixed} String title or panel config object for a "sub-console" to be created to display this message.
	 *    If the <var>group</var> name exists, this message is directed to that sub-console; else it is created. The 
	 *    resulting {@link Ext.panel.Panel} can be accessed by {@link #getGroupPanel}. 
	 */
	log : function(args,options) {
		var markup = '',
		target,
		bd = this.body.dom;
		if(args && args!='') {
			markup = [  '<div class="console-message '+options.iconCls+'">',
			Ext.util.Format.htmlEncode(args).replace(/\n/g, '<br/>').replace(/\s/g, '&#160;'),
			'</div>'].join('');
		}
		if(options.group) {
			var groupName = Ext.isObject(options.group) ? options.group.name : options.group;
			if(!this.groups[groupName]) {
				var cfg = Ext.isObject(options.group) ? options.group : {
					title: options.group
				};
				Ext.apply(cfg, {
					renderTo: this.getLogBody(),
					margin: '5 5 5 20',
					collapsible: true,
					layout: 'auto',
					minHeight: 100,
					height: 100,
					resizable: {handles: 's'},
					autoScroll: true,
					// bodyStyle: {
						// height: 'auto',
						// display: 'block',
					// },
					// style: {
						// 'height': 'auto',
						// display: 'block',
					// }
				});
				this.groups[groupName] = Ext.create('Ext.panel.Panel',cfg);
			}
			target = this.groups[groupName].body;
		} else {
			target = this.getLogBody();
		}

		target.insertHtml('beforeend', markup);
		//target.setHeight('auto');
		bd.scrollTop = bd.scrollHeight;
	},
	/**
	 * Gets the "sub-console" (group panel) for the given name. Panels are created by passing a <var>group</var>
	 * option to {@link #log}.
	 */
	getGroupPanel: function(groupName) {
		return this.groups[groupName];
	},
	/**
	 * Clears the console
	 */
	clear : function() {
		_.each(this.groups,function(group,name) {
			group.destroy();
		});
		this.groups = {};
		this.body.update('');
		this.body.dom.scrollTop = 0;
	}
});