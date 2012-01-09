
/**
 * Displays console output. Can also show "sub-console" windows for things like {@link App.TaskRunner.Task}s 
 * which display several related outputs. 
 */
Ext.define('App.ui.console.LogPanel', {
	extend: 'Ext.panel.Panel',
	autoScroll: true,
	region: 'center',
	border: '0 1 0 0',
	bodyBorder: false,
	padding: '0 0 5 0',
	cls: 'noborder-top',
	bodyCls: 'noborder-top',
	html: '<div class="logBody"></div>',
	getLogBody: function() {
		return this.body.down('.logBody');
	},
	initComponent: function() {
		this.groups = {};
		this.logLevels = {
			info: 'console-info',
			warn: 'console-warn',
			error: 'console-error',
		};
		this.callParent(arguments);
	},
	dump : function(o) {
		if( typeof o == 'string' || typeof o == 'number' || typeof o == 'undefined' || Ext.isDate(o)) {
			return o;
		} else if(!o) {
			return "null";
		} else if( typeof o != "object") {
			return 'Unknown return type';
		} else if(Ext.isArray(o)) {
			return '[' + o.join(',') + ']';
		} else {
			var b = ["{\n"];
			for(var key in o) {
				var to = typeof o[key];
				if(to != "function" && to != "object") {
					b.push(Ext.String.format("  {0}: {1},\n", key, o[key]));
				}
			}
			var s = b.join("");
			if(s.length > 3) {
				s = s.substr(0, s.length - 2);
			}
			return s + "\n}";
		}
	},
	/**
	 * Logs args to the console
	 * @param {Mixed} args
	 * @param {Object} options Hash containing the following parameters:
	 * @param {Object} [options.silent=false] {Boolean} True to prevent the console from automatically showing if closed, false to automatically
	 *    show the console after this message (defaults to false)
	 * @param {Object} [options.iconCls=''] {String} CSS class for an icon to display next to this message
	 * @param {Object} [options.group=null] {Mixed} String title or panel config object for a "sub-console" to be created to display this message.
	 *    If the <var>group</var> name exists, this message is directed to that sub-console; else it is created. The 
	 *    resulting {@link Ext.panel.Panel} can be accessed by {@link #getGroupPanel}. 
	 * @param {Object} [options.level=info] {String} One of `info`, `warn`, or `error`. Styles the message to reflect the level of severity.
	 */
	log : function(args,options) {
		var markup = '',
		target,
		bd = this.body.dom;
		
		_.defaults(options,{
			silent: false,
			iconCls: '',
			level: 'info'
		})
		if(args && args!='') {
			if(!_.isString(args)) {
				args = this.dump(args);
			}
			
			markup = [  '<div class="console-message ', options.iconCls, ' ', this.logLevels[options.level], '">',
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


