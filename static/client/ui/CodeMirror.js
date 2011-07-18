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
		 * @param {App.ui.CodeMirror} panel This class
		 * @param {CodeMirror} editor The codemirror instance
		 */
		 'cursorchange');
	},
	/**
	 * Builds the CodeMirror instance
	 */
	afterrender : function() {
		var textarea = this.getEl().down('textarea').dom;
		if(textarea) {
			this.codemirror = CodeMirror.fromTextArea(textarea, this);
			this.codemirror.setValue(this.value);
			this.codemirror.onCursorActivity = Ext.bind(this.onCursorActivity, this);
		}
	},
	/**
	 * Fires the {@link #cursorChange} event
	 */
	onCursorActivity : function() {
		this.fireEvent('cursorchange', this, this.editor);
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
			this.codemirror.setValue(v);
		} else {
			this.value = v;
		}
	},
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
		for(var cursor = editor.getSearchCursor(text); cursor.findNext(); )this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));

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
		for(var cursor = editor.getSearchCursor(text); cursor.findNext(); )editor.replaceRange(replace, cursor.from(), cursor.to());
	}
}, function() {
});
