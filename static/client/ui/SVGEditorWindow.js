Ext.define('App.ui.SVGEditorWindow',{
	extend: 'Ext.window.Window',
	layout: 'fit',
	closeAction: 'hide',
	width: 300,
	height:200,
	bodyBorder: false,
	border: false,
	plain: true,
	headerPosition: 'left',
	suggestedFileName: '',
	/**
	 * @cfg {String}
	 * URL of the stylesheet to fetch
	 */
	stylesUrl: '',

	initComponent: function () {
		this.editor = Ext.create('App.usr.text.Editor', { saveOptions: { defaultExtension: 'svg', forceDefaultExtension: true, initialValue: this.suggestedFileName } });
		Ext.apply(this,{
			items: [this.editor]
		});
		this.callParent(arguments);

		if(this.value) { this.setValue(this.value); }
	},
	setValue: function(value) {
		if(!this.svgStyles) {
			Ext.Ajax.request({
			    url: this.stylesUrl,
			    success: function(response){
			        this.svgStyles = response.responseText;
			        this.doSetValue(value)
			    },
			    scope: this,
			});
		} else {
			this.doSetValue(value);
		}
	},
	doSetValue: function (value) {

		// Sorry Cthulhu... http://www.codinghorror.com/blog/2009/11/parsing-html-the-cthulhu-way.html
		value = value.replace(/^<svg(\b[^>]*)>/g,'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" $1><style type="text/css"><![CDATA[' + this.svgStyles + ']]></style>');
		value = '<?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + value;

		return this.editor.setValue(value);
	},
	getValue: function() {
		return this.editor.getValue.apply(this.editor,arguments);
	},
});