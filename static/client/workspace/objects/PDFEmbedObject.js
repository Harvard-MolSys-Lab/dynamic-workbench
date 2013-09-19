
////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.objects.PDFEmbedObject
 * Represents a workspace object containing an iframe
 * @extends Workspace.objects.IFrameObject
 */
// Workspace.objects.PDFEmbedObject = {};
Ext.define('Workspace.objects.PDFEmbedObject', {
	constructor: function(workspace, config) {
		Workspace.objects.PDFEmbedObject.superclass.constructor.call(this, workspace, config);
	},
	extend: 'Workspace.objects.IFrameObject',
	wtype: 'Workspace.objects.PDFEmbedObject',
	name: 'New PDF',
	iconCls: 'pdf',
	url: 'http://labs.google.com/papers/bigtable-osdi06.pdf',
	/**
	 * Returns the URL to the Google Docs PDF embedding suite
	 * @param {Object} value
	 */
	getFullUrl: function(value) {
		value = value || this.get('url');
		if(!Ext.isChrome) {
			return 'http://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(value);
		} else {
			return value;
		}
	},
	setUrl: function(value) {
		this.getIFrameEl().set({
			src: this.getFullUrl(value)
		});
	}
}, function() {
	Workspace.reg('Workspace.objects.PDFEmbedObject', Workspace.objects.PDFEmbedObject);
});