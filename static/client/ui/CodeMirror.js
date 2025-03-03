/**
 * Displays a CodeMirror widget in an {@link Ext.panel.Panel}
 */
Ext.define('App.ui.CodeMirror', {
	alias : 'widget.codemirror',
	extend : 'Ext.panel.Panel',
	value : '',
	autoScroll : true,
	lineNumbers : true,
	initComponent : function() {
		Ext.applyIf(this, {
			html : '<textarea style="width: 100%;border:none;">' + this.value + '</textarea>',
			lastPos : null,
			lastQuery : null,
			marked : []
		});
		this.callParent(arguments);
		this.on('afterrender', this.afterrender, this, {
			single : true
		});

		this.addEvents(
		/**
		 * @event
		 * Fires when the cursor changes position
		 * @param {App.ui.CodeMirror} panel This class
		 * @param {CodeMirror} editor The codemirror instance
		 */
		'cursorchange',

		/**
		 * @event
		 * Fires when the contents of the editor changes
		 */
		'change'
		);
	},
	/**
    * @cfg {String} mode The default mode to use when the editor is initialized. When not given, this will default to the first mode that was loaded. 
    * It may be a string, which either simply names the mode or is a MIME type associated with the mode. Alternatively, 
    * it may be an object containing configuration options for the mode, with a name property that names the mode 
    * (for example {name: "javascript", json: true}). The demo pages for each mode contain information about what 
    * configuration parameters the mode supports.
    */
    mode:               'text/plain',
	
	/**
    * @cfg {Boolean} showLineNumbers Enable line numbers button in the toolbar.
    */
    showLineNumbers:    true,

    /**
    * @cfg {Boolean} enableMatchBrackets Force matching-bracket-highlighting to happen 
    */
    enableMatchBrackets:    true,

    /**
    * @cfg {Boolean} enableElectricChars Configures whether the editor should re-indent the current line when a character is typed 
    * that might change its proper indentation (only works if the mode supports indentation). 
    */
    enableElectricChars:    false,

    /**
    * @cfg {Boolean} enableIndentWithTabs Whether, when indenting, the first N*tabSize spaces should be replaced by N tabs.
    */
    enableIndentWithTabs:   true,

    /**
    * @cfg {Boolean} enableSmartIndent Whether to use the context-sensitive indentation that the mode provides (or just indent the same as the line before).
    */
    enableSmartIndent:      true,

    /**
    * @cfg {Boolean} enableLineWrapping Whether CodeMirror should scroll or wrap for long lines.
    */
    enableLineWrapping:     false,

    /**
    * @cfg {Boolean} enableLineNumbers Whether to show line numbers to the left of the editor.
    */
    enableLineNumbers:      true,

    /**
    * @cfg {Boolean} enableGutter Can be used to force a 'gutter' (empty space on the left of the editor) to be shown even 
    * when no line numbers are active. This is useful for setting markers.
    */
    enableGutter:           false,

    /**
    * @cfg {Boolean} enableFixedGutter When enabled (off by default), this will make the gutter stay visible when the 
    * document is scrolled horizontally.
    */
    enableFixedGutter:      false,

    /**
    * @cfg {Number} firstLineNumber At which number to start counting lines.
    */
    firstLineNumber:         1,

    /**
     * @cfg {Boolean} readOnly <tt>true</tt> to mark the field as readOnly.
     */
    readOnly : false,
	
	/**
    * @cfg {Number} pollInterval Indicates how quickly (miliseconds) CodeMirror should poll its input textarea for changes. 
    * Most input is captured by events, but some things, like IME input on some browsers, doesn't generate events 
    * that allow CodeMirror to properly detect it. Thus, it polls.
    */
    pollInterval:         100,

    /**
    * @cfg {Number} indentUnit How many spaces a block (whatever that means in the edited language) should be indented.
    */
    indentUnit:         4,

    /**
    * @cfg {Number} tabSize The width of a tab character.
    */
    tabSize:            4,

    /**
    * @cfg {String} theme The theme to style the editor with. You must make sure the CSS file defining the corresponding 
    * .cm-s-[name] styles is loaded (see the theme directory in the distribution). The default is "default", for which 
    * colors are included in codemirror.css. It is possible to use multiple theming classes at once—for example 
    * "foo bar" will assign both the cm-s-foo and the cm-s-bar classes to the editor.
    */
    theme:              'default',
	
	
	/**
	 * @cfg {String} matchHighlight
	 * True or a string to enable selection highlighting (e.g. other instances of the selection in the document)
	 * will be highlighted.
	 */
	matchHighlight : "CodeMirror-matchhighlight",
	
	/**
	 * Builds the CodeMirror instance
	 */
	afterrender : function() {
		var textarea = this.getEl().down('textarea').dom;
		if(textarea) {
			var me = this;
			this.codemirror = CodeMirror.fromTextArea(textarea, _.copyTo({
				matchBrackets:      me.enableMatchBrackets,
	            electricChars:      me.enableElectricChars,
	            indentUnit:         me.indentUnit,
	            smartIndent:        me.enableSmartIndent,
	            indentWithTabs:     me.enableIndentWithTabs,
	            pollInterval:       me.pollInterval,
	            lineNumbers:        me.enableLineNumbers,
	            lineWrapping:       me.enableLineWrapping,
	            firstLineNumber:    me.firstLineNumber,
	            tabSize:            me.tabSize,
	            gutter:             me.enableGutter,
	            fixedGutter:        me.enableFixedGutter,
	            theme:              me.theme,
				onCursorActivity : 	Ext.bind(this.onCursorActivity, this),
				onBlur:				Ext.bind(this.onBlur,this),
				onFocus:			Ext.bind(this.onFocus,this),
				onChange:			Ext.bind(this.onChange,this)
			},this));
			this.codemirror.setValue(this.value || '');
			
			if(me.matchHighlight) {
				if(typeof me.matchHighlight != 'string') {
					me.matchHighlight = 'CodeMirror-matchhighlight';
				}
				me.on('cursorchange',function() {
					me.codemirror.matchHighlight(me.matchHighlight);
				},null,{buffer: 500})
			}
		}
	},
	onBlur: function() {
		this.fireEvent('blur', this, this.codemirror);
	},
	onFocus: function() {
		this.fireEvent('focus', this, this.codemirror);
	},
	onChange: function(cm, changes) {
		this.fireEvent('change', this, changes, this.codemirror);
	},
	/**
	 * Fires the {@link #cursorchange} event
	 */
	onCursorActivity : function() {
		this.fireEvent('cursorchange', this, this.codemirror);
	},
	/**
	 * Returns the value of the CodeMirror instance
	 */
	getValue : function() {
		return this.codemirror.getValue();
	},
	/**
	 * Updates the value of the CodeMirror instance
	 */
	setValue : function(v) {
		if(this.rendered) {
			this.codemirror.setValue(v || '');
		} else {
			this.value = v || '';
		}
	},
	/**
	 * @param {Boolean} start True to get the position of the start of the selection, false to get the position of the end
	 */
	getCursor : function(start) {
		return this.codemirror.getCursor(start);
	},
	/**
	 * Gets the position of the beginning and end of the selection
	 */
	getSelectedRange : function() {
		return {
			from : this.getCursor(true),
			to : this.getCursor(false)
		}
	},
	autoFormatSelection : function() {
		var range = this.getSelectedRange();
		this.codemirror.autoFormatRange(range.from, range.to);
	},
	/**
	 * Unmarks all regions in the editor.
	 */
	unmark : function() {
		for(var i = 0; i < this.marked.length; ++i)this.marked[i]();
		this.marked.length = 0;
	},
	/**
	 * Searches the CodeMirror instance for the given string
	 * @param {String} text Text to search for
	 */
	search : function(text) {
		var editor = this.codemirror;
		this.unmark();
		if(!text)
			return;
		for(var cursor = editor.getSearchCursor(text); cursor.findNext(); )
		this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));

		if(this.lastQuery != text)
			this.lastPos = null;
		var cursor = editor.getSearchCursor(text, this.lastPos || editor.getCursor());
		if(!cursor.findNext()) {
			cursor = editor.getSearchCursor(text);
			if(!cursor.findNext())
				return;
		}
		editor.setSelection(cursor.from(), cursor.to());
		this.lastQuery = text;
		this.lastPos = cursor.to();
	},
	/**
	 * Replaces the given <var>text</var> with the given <var>replace</var> text
	 * @param {String} text
	 * @param {String} replace
	 */
	replace : function(text, replace) {
		var editor = this.codemirror;
		this.unmark();
		if(!text)
			return;
		for(var cursor = editor.getSearchCursor(text); cursor.findNext(); )
		editor.replaceRange(replace, cursor.from(), cursor.to());
	},
}, function() {
});
