Ext.define('App.ui.CodeMirror', {
	alias: 'widget.codemirror',
	extend: 'Ext.panel.Panel',
	value: '',
	autoScroll: true,
	lineNumbers: true,
	initComponent: function() {
		Ext.applyIf(this, {
			html: '<textarea style="width: 100%;border:none;">'+this.value+'</textarea>',
			lastPos: null,
			lastQuery: null,
			marked: []
		});
		this.callParent(arguments);
		this.on('afterrender', this.afterrender, this, {
			single: true
		});
	},
	afterrender: function() {
		var textarea = this.getEl().down('textarea').dom;
		if(textarea) {
			this.codemirror = CodeMirror.fromTextArea(textarea,this);
			this.codemirror.setValue(this.value);
			this.codemirror.onCursorActivity = Ext.bind(this.onCursorActivity,this);
		}
	},
	onCursorActivity: function() {
		this.fireEvent('cursorChange',this);
	},
	getValue: function() {
		return this.codemirror.getValue();
	},
	setValue: function(v) {
		if(this.rendered) {
			this.codemirror.setValue(v);
		} else {
			this.value = v;
		}
	},
	unmark: function() {
		for (var i = 0; i < this.marked.length; ++i)
			this.marked[i]();
		this.marked.length = 0;
	},
	search: function(text) {
		var editor = this.codemirror;
		this.unmark();
		if (!text)
			return;
		for (var cursor = editor.getSearchCursor(text); cursor.findNext();)
			this.marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));

		if (this.lastQuery != text)
			this.lastPos = null;
		var cursor = editor.getSearchCursor(text, this.lastPos || editor.getCursor());
		if (!cursor.findNext()) {
			cursor = editor.getSearchCursor(text);
			if (!cursor.findNext())
				return;
		}
		editor.setSelection(cursor.from(), cursor.to());
		this.lastQuery = text;
		this.lastPos = cursor.to();
	},
	replace: function(text,replace) {
		var editor = this.codemirror;
		this.unmark();
		if (!text)
			return;
		for (var cursor = editor.getSearchCursor(text); cursor.findNext();)
			editor.replaceRange(replace, cursor.from(), cursor.to());
	}
}, function() {
});