Ext.define('App.ui.CitationBar',{
	alias: 'widget.cite',
	extend: 'Ext.panel.Panel',
	requires: ['App.ui.Attribution'],
	cls: 'simple-header citation-bar',
	dock:'bottom',
	// closeable: true,
	// iconCls: 'cite',
	// headerPosition: 'right',
	// closable: true,
	// closeAction: 'collapse',
	frame: true,
	padding: '5 5 5 5',
	tpl: '<b>{[values.authors.join(", ")]}</b>. "{title}". <i>{publication}</i> {volume}:{pages} ({year}). <a href="{url}">URL</a>',
//	padding: '5 0 0 0',
	minHeight: 36,
	initComponent: function() {
		this.tpl = new Ext.XTemplate(this.tpl);
		if(Ext.isString(this.cite)) {
			this.cite = App.ui.Attribution.getCite(this.cite);
		}
		
		if (!this.cite) this.cite = {};
		Ext.applyIf(this.cite,{
			authors: [],
			title: '',
			publication: '',
			volume: '',
			pages: '',
			year: '',
			url: '',
		})
		
		Ext.applyIf(this,{
			html: this.tpl.apply(this.cite)
		});
		this.callParent(arguments);
	},
})
