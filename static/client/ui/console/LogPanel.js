
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