Ext.data.JsonP.App_usr_nodal_MotifInspector({"superclasses":["Ext.form.Panel"],"tagname":"class","html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.form.Panel<div class='subclass '><strong>App.usr.nodal.MotifInspector</strong></div></div><h4>Mixins</h4><div class='dependency'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='docClass'>App.ui.BoundObjectPanel</a></div><div class='dependency'><a href='#!/api/App.ui.TipHelper' rel='App.ui.TipHelper' class='docClass'>App.ui.TipHelper</a></div><h4>Requires</h4><div class='dependency'><a href='#!/api/App.ui.CodeMirror' rel='App.ui.CodeMirror' class='docClass'>App.ui.CodeMirror</a></div><div class='dependency'><a href='#!/api/App.usr.nodal.MotifEditor' rel='App.usr.nodal.MotifEditor' class='docClass'>App.usr.nodal.MotifEditor</a></div><h4>Files</h4><div class='dependency'><a href='source/MotifInspector.html#App-usr-nodal-MotifInspector' target='_blank'>MotifInspector.js</a></div></pre><div class='doc-contents'><p>Allows editing DyNAML for a custom motif</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-Allows' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-cfg-Allows' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-cfg-Allows' class='name expandable'>Allows</a> : Boolean<span class=\"signature\"></span></div><div class='description'><div class='short'><p>the binding of <a href=\"#!/api/Machine.core.Serializable-method-expose\" rel=\"Machine.core.Serializable-method-expose\" class=\"docClass\">object properties</a> to fields\nwithin this component to be categorically disabled.</p>\n</div><div class='long'><p>the binding of <a href=\"#!/api/Machine.core.Serializable-method-expose\" rel=\"Machine.core.Serializable-method-expose\" class=\"docClass\">object properties</a> to fields\nwithin this component to be categorically disabled.</p>\n</div></div></div><div id='cfg-tooltip' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.TipHelper' rel='App.ui.TipHelper' class='defined-in docClass'>App.ui.TipHelper</a><br/><a href='source/TipHelper.html#App-ui-TipHelper-cfg-tooltip' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.TipHelper-cfg-tooltip' class='name expandable'>tooltip</a> : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>Configuration object for an Ext.tip.ToolTip. ...</div><div class='long'><p>Configuration object for an Ext.tip.ToolTip. This property should be specified on child components.\nThe tooltip will be automatically created and bound to the element for the child component. Any valid configuration\noptions for Ext.tip.ToolTip are allowed.</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-bodyPadding' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.usr.nodal.MotifInspector'>App.usr.nodal.MotifInspector</span><br/><a href='source/MotifInspector.html#App-usr-nodal-MotifInspector-property-bodyPadding' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.usr.nodal.MotifInspector-property-bodyPadding' class='name expandable'>bodyPadding</a> : Number<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>5</code></p></div></div></div><div id='property-boundObjects' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-property-boundObjects' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-property-boundObjects' class='name expandable'>boundObjects</a> : <a href=\"#!/api/Workspace.objects.ObjectCollection\" rel=\"Workspace.objects.ObjectCollection\" class=\"docClass\">Workspace.objects.ObjectCollection</a><span class=\"signature\"></span></div><div class='description'><div class='short'><p>Objects which have been bound to this panel with <a href=\"#!/api/App.ui.BoundObjectPanel-method-bind\" rel=\"App.ui.BoundObjectPanel-method-bind\" class=\"docClass\">bind</a></p>\n</div><div class='long'><p>Objects which have been bound to this panel with <a href=\"#!/api/App.ui.BoundObjectPanel-method-bind\" rel=\"App.ui.BoundObjectPanel-method-bind\" class=\"docClass\">bind</a></p>\n</div></div></div><div id='property-enableBoundFields' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.usr.nodal.MotifInspector'>App.usr.nodal.MotifInspector</span><br/><a href='source/MotifInspector.html#App-usr-nodal-MotifInspector-property-enableBoundFields' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.usr.nodal.MotifInspector-property-enableBoundFields' class='name expandable'>enableBoundFields</a> : Boolean<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='property-objectBinding' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-property-objectBinding' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-property-objectBinding' class='name expandable'>objectBinding</a> : String<span class=\"signature\"></span></div><div class='description'><div class='short'>To be applied to child items:\nName of an exposed field in a Machine.core.Serializable object bound to this panel. ...</div><div class='long'><p>To be applied to child items:\nName of an exposed field in a <a href=\"#!/api/Machine.core.Serializable\" rel=\"Machine.core.Serializable\" class=\"docClass\">Machine.core.Serializable</a> object bound to this panel. When the value\nof the Ext.form.field.Field with the <var>objectBinding</var> property set changes, the <a href=\"#!/api/App.ui.BoundObjectPanel-property-boundObjects\" rel=\"App.ui.BoundObjectPanel-property-boundObjects\" class=\"docClass\">boundObjects</a>\nare updated with <a href=\"#!/api/Machine.core.Serializable-method-set\" rel=\"Machine.core.Serializable-method-set\" class=\"docClass\">Machine.core.Serializable.set</a>.</p>\n</div></div></div><div id='property-objectBindingEvent' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-property-objectBindingEvent' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-property-objectBindingEvent' class='name expandable'>objectBindingEvent</a> : String<span class=\"signature\"></span></div><div class='description'><div class='short'><p>Event to watch for changes to the <a href=\"#!/api/App.ui.BoundObjectPanel-property-boundObjects\" rel=\"App.ui.BoundObjectPanel-property-boundObjects\" class=\"docClass\">boundObjects</a></p>\n</div><div class='long'><p>Event to watch for changes to the <a href=\"#!/api/App.ui.BoundObjectPanel-property-boundObjects\" rel=\"App.ui.BoundObjectPanel-property-boundObjects\" class=\"docClass\">boundObjects</a></p>\n</div></div></div><div id='property-tip' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.TipHelper' rel='App.ui.TipHelper' class='defined-in docClass'>App.ui.TipHelper</a><br/><a href='source/TipHelper.html#App-ui-TipHelper-property-tip' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.TipHelper-property-tip' class='name expandable'>tip</a> : Ext.tip.ToolTip<span class=\"signature\"></span></div><div class='description'><div class='short'><p>Each child component with a configured <a href=\"#!/api/App.ui.TipHelper-cfg-tooltip\" rel=\"App.ui.TipHelper-cfg-tooltip\" class=\"docClass\">tooltip</a> will have a reference to\nthe generated tooltip attached to this property.</p>\n</div><div class='long'><p>Each child component with a configured <a href=\"#!/api/App.ui.TipHelper-cfg-tooltip\" rel=\"App.ui.TipHelper-cfg-tooltip\" class=\"docClass\">tooltip</a> will have a reference to\nthe generated tooltip attached to this property.</p>\n</div></div></div><div id='property-title' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.usr.nodal.MotifInspector'>App.usr.nodal.MotifInspector</span><br/><a href='source/MotifInspector.html#App-usr-nodal-MotifInspector-property-title' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.usr.nodal.MotifInspector-property-title' class='name expandable'>title</a> : String<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>'Motif'</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-bind' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-bind' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-bind' class='name expandable'>bind</a>( <span class='pre'>item</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Attaches the given object to this panel, so that changes in the panel will be reflected in the object ...</div><div class='long'><p>Attaches the given object to this panel, so that changes in the panel will be reflected in the object</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Workspace.Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-buildTip' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.TipHelper' rel='App.ui.TipHelper' class='defined-in docClass'>App.ui.TipHelper</a><br/><a href='source/TipHelper.html#App-ui-TipHelper-method-buildTip' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.TipHelper-method-buildTip' class='name expandable'>buildTip</a>( <span class='pre'>field</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Constructs a tooltip for the given field using the field's tooltip configuration parameter. ...</div><div class='long'><p>Constructs a tooltip for the given field using the field's tooltip configuration parameter.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>field</span> : Object<div class='sub-desc'></div></li></ul></div></div></div><div id='method-buildTips' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-buildTips' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-buildTips' class='name expandable'>buildTips</a>( <span class='pre'></span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n</div></div></div><div id='method-destroy' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-destroy' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-destroy' class='name expandable'>destroy</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>destroy ...</div><div class='long'><p>destroy</p>\n</div></div></div><div id='method-destroyTips' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.TipHelper' rel='App.ui.TipHelper' class='defined-in docClass'>App.ui.TipHelper</a><br/><a href='source/TipHelper.html#App-ui-TipHelper-method-destroyTips' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.TipHelper-method-destroyTips' class='name expandable'>destroyTips</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Destroys all tooltips for this components' children. ...</div><div class='long'><p>Destroys all tooltips for this components' children.</p>\n</div></div></div><div id='method-enableIf' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-enableIf' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-enableIf' class='name expandable'>enableIf</a>( <span class='pre'>common, boundObjects, this</span> ) : Boolean<span class=\"signature\"></span></div><div class='description'><div class='short'>Override on child components to determine whether they should be enabled for a particular selection ...</div><div class='long'><p>Override on child components to determine whether they should be enabled for a particular selection</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>common</span> : String<div class='sub-desc'><p>The most specific common WType among the bound objects</p>\n</div></li><li><span class='pre'>boundObjects</span> : <a href=\"#!/api/Ext.util.MixedCollection\" rel=\"Ext.util.MixedCollection\" class=\"docClass\">Ext.util.MixedCollection</a><div class='sub-desc'><p>A list of all bound objects</p>\n</div></li><li><span class='pre'>this</span> : <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Boolean</span><div class='sub-desc'><p>show</p>\n</div></li></ul></div></div></div><div id='method-getBoundObject' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.usr.nodal.MotifInspector'>App.usr.nodal.MotifInspector</span><br/><a href='source/MotifInspector.html#App-usr-nodal-MotifInspector-method-getBoundObject' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.usr.nodal.MotifInspector-method-getBoundObject' class='name expandable'>getBoundObject</a>( <span class='pre'></span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n</div></div></div><div id='method-init' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.TipHelper' rel='App.ui.TipHelper' class='defined-in docClass'>App.ui.TipHelper</a><br/><a href='source/TipHelper.html#App-ui-TipHelper-method-init' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.TipHelper-method-init' class='name expandable'>init</a>( <span class='pre'>otherComponents</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Initializer; should be called by the included class: this.mixins.[mixinName].init.apply(this,arguments) ...</div><div class='long'><p>Initializer; should be called by the included class: <code>this.mixins.[mixinName].init.apply(this,arguments)</code></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>otherComponents</span> : Ext.Component<div class='sub-desc'><p>An array of other components on which the <a href=\"#!/api/App.ui.TipHelper-method-buildTip\" rel=\"App.ui.TipHelper-method-buildTip\" class=\"docClass\">buildTip</a> method should be called after said\ncomponents are rendered. Can be used for components which aren't part of\nthe Ext#query component hierarchy but on which you would like to use the <a href=\"#!/api/App.ui.TipHelper-cfg-tooltip\" rel=\"App.ui.TipHelper-cfg-tooltip\" class=\"docClass\">tooltip</a> configuration.</p>\n</div></li></ul></div></div></div><div id='method-initComponent' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.usr.nodal.MotifInspector'>App.usr.nodal.MotifInspector</span><br/><a href='source/MotifInspector.html#App-usr-nodal-MotifInspector-method-initComponent' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.usr.nodal.MotifInspector-method-initComponent' class='name expandable'>initComponent</a>( <span class='pre'></span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Overrides: <a href=\"#!/api/App.ui.BoundObjectPanel-method-initComponent\" rel=\"App.ui.BoundObjectPanel-method-initComponent\" class=\"docClass\">App.ui.BoundObjectPanel.initComponent</a></p></div></div></div><div id='method-initialize' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-initialize' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-initialize' class='name expandable'>initialize</a>( <span class='pre'></span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n</div></div></div><div id='method-showIf' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-showIf' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-showIf' class='name expandable'>showIf</a>( <span class='pre'>common, boundObjects, this</span> ) : Boolean<span class=\"signature\"></span></div><div class='description'><div class='short'>Override on child components to determine whether they should be shown for a particular selection ...</div><div class='long'><p>Override on child components to determine whether they should be shown for a particular selection</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>common</span> : String<div class='sub-desc'><p>The most specific common WType among the bound objects</p>\n</div></li><li><span class='pre'>boundObjects</span> : <a href=\"#!/api/Ext.util.MixedCollection\" rel=\"Ext.util.MixedCollection\" class=\"docClass\">Ext.util.MixedCollection</a><div class='sub-desc'><p>A list of all bound objects</p>\n</div></li><li><span class='pre'>this</span> : <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Boolean</span><div class='sub-desc'><p>show</p>\n</div></li></ul></div></div></div><div id='method-showMotifEditor' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.usr.nodal.MotifInspector'>App.usr.nodal.MotifInspector</span><br/><a href='source/MotifInspector.html#App-usr-nodal-MotifInspector-method-showMotifEditor' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.usr.nodal.MotifInspector-method-showMotifEditor' class='name expandable'>showMotifEditor</a>( <span class='pre'></span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n</div></div></div><div id='method-unbind' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-unbind' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-unbind' class='name expandable'>unbind</a>( <span class='pre'>item</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Detaches the given object from this panel ...</div><div class='long'><p>Detaches the given object from this panel</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Workspace.Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateDynamicFields' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateDynamicFields' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateDynamicFields' class='name expandable'>updateDynamicFields</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Updates child elements with showIf and/or enableIf methods. ...</div><div class='long'><p>Updates child elements with <a href=\"#!/api/App.ui.BoundObjectPanel-method-showIf\" rel=\"App.ui.BoundObjectPanel-method-showIf\" class=\"docClass\">showIf</a> and/or <a href=\"#!/api/App.ui.BoundObjectPanel-method-enableIf\" rel=\"App.ui.BoundObjectPanel-method-enableIf\" class=\"docClass\">enableIf</a> methods. Called upon item binding/unbinding.</p>\n</div></div></div><div id='method-updateFields' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateFields' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateFields' class='name expandable'>updateFields</a>( <span class='pre'>item</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>updateFields\nUpdates the fields in this ribbon to match the values in this object ...</div><div class='long'><p>updateFields\nUpdates the fields in this ribbon to match the values in this object</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Workspace.Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateFieldsHandler' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateFieldsHandler' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateFieldsHandler' class='name expandable'>updateFieldsHandler</a>( <span class='pre'>prop, val, item</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Called when bound objects change ...</div><div class='long'><p>Called when bound objects change</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>prop</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>val</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateObjects' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateObjects' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateObjects' class='name expandable'>updateObjects</a>( <span class='pre'>field, newValue, oldValue</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>listener invoked by bound field on change (or other objectBinding event); generates a Workspace.actions.Action to upd...</div><div class='long'><p>listener invoked by bound field on change (or other <a href=\"#!/api/App.ui.BoundObjectPanel-property-objectBinding\" rel=\"App.ui.BoundObjectPanel-property-objectBinding\" class=\"docClass\">objectBinding</a> event); generates a <a href=\"#!/api/Workspace.actions.Action\" rel=\"Workspace.actions.Action\" class=\"docClass\">Workspace.actions.Action</a> to update\nthe specified propery in all bound objects</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>field</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>newValue</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>oldValue</span> : Object<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Fires</h3><ul><li>action</li></ul></div></div></div></div></div></div></div>","mixins":["App.ui.BoundObjectPanel","App.ui.TipHelper"],"extends":"Ext.form.Panel","subclasses":[],"code_type":"ext_define","requires":["App.ui.CodeMirror","App.usr.nodal.MotifEditor"],"meta":{},"files":[{"href":"MotifInspector.html#App-usr-nodal-MotifInspector","filename":"MotifInspector.js"}],"component":false,"uses":[],"members":[{"tagname":"cfg","owner":"App.ui.BoundObjectPanel","meta":{},"name":"Allows","id":"cfg-Allows"},{"tagname":"cfg","owner":"App.ui.TipHelper","meta":{},"name":"tooltip","id":"cfg-tooltip"},{"tagname":"property","owner":"App.usr.nodal.MotifInspector","meta":{"private":true},"name":"bodyPadding","id":"property-bodyPadding"},{"tagname":"property","owner":"App.ui.BoundObjectPanel","meta":{},"name":"boundObjects","id":"property-boundObjects"},{"tagname":"property","owner":"App.usr.nodal.MotifInspector","meta":{"private":true},"name":"enableBoundFields","id":"property-enableBoundFields"},{"tagname":"property","owner":"App.ui.BoundObjectPanel","meta":{},"name":"objectBinding","id":"property-objectBinding"},{"tagname":"property","owner":"App.ui.BoundObjectPanel","meta":{},"name":"objectBindingEvent","id":"property-objectBindingEvent"},{"tagname":"property","owner":"App.ui.TipHelper","meta":{},"name":"tip","id":"property-tip"},{"tagname":"property","owner":"App.usr.nodal.MotifInspector","meta":{"private":true},"name":"title","id":"property-title"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{},"name":"bind","id":"method-bind"},{"tagname":"method","owner":"App.ui.TipHelper","meta":{},"name":"buildTip","id":"method-buildTip"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{"private":true},"name":"buildTips","id":"method-buildTips"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{},"name":"destroy","id":"method-destroy"},{"tagname":"method","owner":"App.ui.TipHelper","meta":{},"name":"destroyTips","id":"method-destroyTips"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{},"name":"enableIf","id":"method-enableIf"},{"tagname":"method","owner":"App.usr.nodal.MotifInspector","meta":{"private":true},"name":"getBoundObject","id":"method-getBoundObject"},{"tagname":"method","owner":"App.ui.TipHelper","meta":{},"name":"init","id":"method-init"},{"tagname":"method","owner":"App.usr.nodal.MotifInspector","meta":{"private":true},"name":"initComponent","id":"method-initComponent"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{"private":true},"name":"initialize","id":"method-initialize"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{},"name":"showIf","id":"method-showIf"},{"tagname":"method","owner":"App.usr.nodal.MotifInspector","meta":{"private":true},"name":"showMotifEditor","id":"method-showMotifEditor"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{},"name":"unbind","id":"method-unbind"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{},"name":"updateDynamicFields","id":"method-updateDynamicFields"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{},"name":"updateFields","id":"method-updateFields"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{},"name":"updateFieldsHandler","id":"method-updateFieldsHandler"},{"tagname":"method","owner":"App.ui.BoundObjectPanel","meta":{},"name":"updateObjects","id":"method-updateObjects"}],"alternateClassNames":[],"autodetected":{"mixins":true,"extends":true,"code_type":true,"requires":true,"uses":true,"members":true,"alternateClassNames":true,"aliases":true},"mixedInto":[],"aliases":{},"name":"App.usr.nodal.MotifInspector","id":"class-App.usr.nodal.MotifInspector","parentMixins":[]});