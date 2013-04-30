/**
 * Provides a syntax-highlighting DyNAML editor that can be bound to a {@link Workspace.object.Object} using the {@link App.ui.BoundObjectPanel} mixin.
 */
Ext.define('App.usr.dynaml.EditorLite',{
		xtype: 'codemirror',
		objectBinding: 'dynaml',
		objectBindingEvent: 'blur',
		height: 300,
		title: 'DyNAML',
		collapsed: false,
		collapsible: true,
		cls: 'simple-header',
		initComponent: function() {
			Ext.apply(this,{
				mode: {
					name: 'javascript',
					json: true,
				}
			});
		},
});