Ext.data.JsonP.App_ui_ObjectProperties({"mixins":[],"subclasses":[],"component":false,"html_meta":{},"requires":[],"tagname":"class","meta":{},"mixedInto":[],"aliases":{},"inheritdoc":null,"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='docClass'>App.ui.BoundObjectPanel</a><div class='subclass '><strong>App.ui.ObjectProperties</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/ObjectProperties.html#App-ui-ObjectProperties' target='_blank'>ObjectProperties.js</a></div></pre><div class='doc-contents'><p>Allows creation and editing object properties</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-Allows' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-cfg-Allows' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-cfg-Allows' class='name not-expandable'>Allows</a><span> : Boolean</span></div><div class='description'><div class='short'><p>the binding of <a href=\"#!/api/Machine.core.Serializable-method-expose\" rel=\"Machine.core.Serializable-method-expose\" class=\"docClass\">object properties</a> to fields\nwithin this component to be categorically disabled.</p>\n</div><div class='long'><p>the binding of <a href=\"#!/api/Machine.core.Serializable-method-expose\" rel=\"Machine.core.Serializable-method-expose\" class=\"docClass\">object properties</a> to fields\nwithin this component to be categorically disabled.</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-boundObjects' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-property-boundObjects' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-property-boundObjects' class='name not-expandable'>boundObjects</a><span> : <a href=\"#!/api/Workspace.objects.ObjectCollection\" rel=\"Workspace.objects.ObjectCollection\" class=\"docClass\">Workspace.objects.ObjectCollection</a></span></div><div class='description'><div class='short'><p>Objects which have been bound to this panel with <a href=\"#!/api/App.ui.BoundObjectPanel-method-bind\" rel=\"App.ui.BoundObjectPanel-method-bind\" class=\"docClass\">bind</a></p>\n</div><div class='long'><p>Objects which have been bound to this panel with <a href=\"#!/api/App.ui.BoundObjectPanel-method-bind\" rel=\"App.ui.BoundObjectPanel-method-bind\" class=\"docClass\">bind</a></p>\n</div></div></div><div id='property-enableBoundFields' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ObjectProperties'>App.ui.ObjectProperties</span><br/><a href='source/ObjectProperties.html#App-ui-ObjectProperties-property-enableBoundFields' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ObjectProperties-property-enableBoundFields' class='name expandable'>enableBoundFields</a><span> : Boolean</span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>false</code></p></div></div></div><div id='property-items' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ObjectProperties'>App.ui.ObjectProperties</span><br/><a href='source/ObjectProperties.html#App-ui-ObjectProperties-property-items' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ObjectProperties-property-items' class='name not-expandable'>items</a><span> : <a href=\"#!/api/Workspace.objects.Object\" rel=\"Workspace.objects.Object\" class=\"docClass\">Workspace.objects.Object</a>[]</span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div><div id='property-objectBinding' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-property-objectBinding' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-property-objectBinding' class='name expandable'>objectBinding</a><span> : String</span></div><div class='description'><div class='short'>To be applied to child items:\nName of an exposed field in a Machine.core.Serializable object bound to this panel. ...</div><div class='long'><p>To be applied to child items:\nName of an exposed field in a <a href=\"#!/api/Machine.core.Serializable\" rel=\"Machine.core.Serializable\" class=\"docClass\">Machine.core.Serializable</a> object bound to this panel. When the value\nof the Ext.form.field.Field with the <var>objectBinding</var> property set changes, the <a href=\"#!/api/App.ui.BoundObjectPanel-property-boundObjects\" rel=\"App.ui.BoundObjectPanel-property-boundObjects\" class=\"docClass\">boundObjects</a>\nare updated with <a href=\"#!/api/Machine.core.Serializable-method-set\" rel=\"Machine.core.Serializable-method-set\" class=\"docClass\">Machine.core.Serializable.set</a>.</p>\n</div></div></div><div id='property-objectBindingEvent' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-property-objectBindingEvent' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-property-objectBindingEvent' class='name not-expandable'>objectBindingEvent</a><span> : String</span></div><div class='description'><div class='short'><p>Event to watch for changes to the <a href=\"#!/api/App.ui.BoundObjectPanel-property-boundObjects\" rel=\"App.ui.BoundObjectPanel-property-boundObjects\" class=\"docClass\">boundObjects</a></p>\n</div><div class='long'><p>Event to watch for changes to the <a href=\"#!/api/App.ui.BoundObjectPanel-property-boundObjects\" rel=\"App.ui.BoundObjectPanel-property-boundObjects\" class=\"docClass\">boundObjects</a></p>\n</div></div></div><div id='property-workspace' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ObjectProperties'>App.ui.ObjectProperties</span><br/><a href='source/ObjectProperties.html#App-ui-ObjectProperties-property-workspace' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ObjectProperties-property-workspace' class='name not-expandable'>workspace</a><span> : <a href=\"#!/api/Workspace\" rel=\"Workspace\" class=\"docClass\">Workspace</a></span></div><div class='description'><div class='short'><p>The attached <a href=\"#!/api/Workspace\" rel=\"Workspace\" class=\"docClass\">Workspace</a>.</p>\n</div><div class='long'><p>The attached <a href=\"#!/api/Workspace\" rel=\"Workspace\" class=\"docClass\">Workspace</a>.</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-attachTo' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ObjectProperties'>App.ui.ObjectProperties</span><br/><a href='source/ObjectProperties.html#App-ui-ObjectProperties-method-attachTo' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ObjectProperties-method-attachTo' class='name expandable'>attachTo</a>( <span class='pre'><a href=\"#!/api/Workspace\" rel=\"Workspace\" class=\"docClass\">Workspace</a> workspace</span> )</div><div class='description'><div class='short'>Attaches to a particular Workspace. ...</div><div class='long'><p>Attaches to a particular <a href=\"#!/api/Workspace\" rel=\"Workspace\" class=\"docClass\">Workspace</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>workspace</span> : <a href=\"#!/api/Workspace\" rel=\"Workspace\" class=\"docClass\">Workspace</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-bind' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-bind' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-bind' class='name expandable'>bind</a>( <span class='pre'>Workspace.Object item</span> )</div><div class='description'><div class='short'>Attaches the given object to this panel, so that changes in the panel will be reflected in the object ...</div><div class='long'><p>Attaches the given object to this panel, so that changes in the panel will be reflected in the object</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Workspace.Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-destroy' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-destroy' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-destroy' class='name expandable'>destroy</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>destroy ...</div><div class='long'><p>destroy</p>\n</div></div></div><div id='method-doAction' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ObjectProperties'>App.ui.ObjectProperties</span><br/><a href='source/ObjectProperties.html#App-ui-ObjectProperties-method-doAction' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ObjectProperties-method-doAction' class='name expandable'>doAction</a>( <span class='pre'><a href=\"#!/api/Workspace.actions.Action\" rel=\"Workspace.actions.Action\" class=\"docClass\">Workspace.actions.Action</a> action</span> )</div><div class='description'><div class='short'>Invokes the passed Workspace.actions.Action on the workspace ...</div><div class='long'><p>Invokes the passed <a href=\"#!/api/Workspace.actions.Action\" rel=\"Workspace.actions.Action\" class=\"docClass\">Workspace.actions.Action</a> on the <a href=\"#!/api/App.ui.ObjectProperties-property-workspace\" rel=\"App.ui.ObjectProperties-property-workspace\" class=\"docClass\">workspace</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>action</span> : <a href=\"#!/api/Workspace.actions.Action\" rel=\"Workspace.actions.Action\" class=\"docClass\">Workspace.actions.Action</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-enableIf' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-enableIf' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-enableIf' class='name expandable'>enableIf</a>( <span class='pre'>String common, Ext.util.MixedCollection boundObjects, <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a> this</span> ) : Boolean</div><div class='description'><div class='short'>Override on child components to determine whether they should be enabled for a particular selection ...</div><div class='long'><p>Override on child components to determine whether they should be enabled for a particular selection</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>common</span> : String<div class='sub-desc'><p>The most specific common WType among the bound objects</p>\n</div></li><li><span class='pre'>boundObjects</span> : Ext.util.MixedCollection<div class='sub-desc'><p>A list of all bound objects</p>\n</div></li><li><span class='pre'>this</span> : <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Boolean</span><div class='sub-desc'><p>show</p>\n</div></li></ul></div></div></div><div id='method-onSelectionChange' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ObjectProperties'>App.ui.ObjectProperties</span><br/><a href='source/ObjectProperties.html#App-ui-ObjectProperties-method-onSelectionChange' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ObjectProperties-method-onSelectionChange' class='name expandable'>onSelectionChange</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Called when the selection of the attached workspace changes. ...</div><div class='long'><p>Called when the <a href=\"#!/api/Workspace-property-selection\" rel=\"Workspace-property-selection\" class=\"docClass\">selection</a> of the <a href=\"#!/api/App.ui.ObjectProperties-property-workspace\" rel=\"App.ui.ObjectProperties-property-workspace\" class=\"docClass\">attached workspace</a> changes.</p>\n</div></div></div><div id='method-showIf' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-showIf' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-showIf' class='name expandable'>showIf</a>( <span class='pre'>String common, Ext.util.MixedCollection boundObjects, <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a> this</span> ) : Boolean</div><div class='description'><div class='short'>Override on child components to determine whether they should be shown for a particular selection ...</div><div class='long'><p>Override on child components to determine whether they should be shown for a particular selection</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>common</span> : String<div class='sub-desc'><p>The most specific common WType among the bound objects</p>\n</div></li><li><span class='pre'>boundObjects</span> : Ext.util.MixedCollection<div class='sub-desc'><p>A list of all bound objects</p>\n</div></li><li><span class='pre'>this</span> : <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Boolean</span><div class='sub-desc'><p>show</p>\n</div></li></ul></div></div></div><div id='method-unbind' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-unbind' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-unbind' class='name expandable'>unbind</a>( <span class='pre'>Workspace.Object item</span> )</div><div class='description'><div class='short'>Detaches the given object from this panel ...</div><div class='long'><p>Detaches the given object from this panel</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Workspace.Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateDynamicFields' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateDynamicFields' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateDynamicFields' class='name expandable'>updateDynamicFields</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Updates child elements with showIf and/or enableIf methods. ...</div><div class='long'><p>Updates child elements with <a href=\"#!/api/App.ui.BoundObjectPanel-method-showIf\" rel=\"App.ui.BoundObjectPanel-method-showIf\" class=\"docClass\">showIf</a> and/or <a href=\"#!/api/App.ui.BoundObjectPanel-method-enableIf\" rel=\"App.ui.BoundObjectPanel-method-enableIf\" class=\"docClass\">enableIf</a> methods. Called upon item binding/unbinding.</p>\n</div></div></div><div id='method-updateFields' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateFields' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateFields' class='name expandable'>updateFields</a>( <span class='pre'>Workspace.Object item</span> )</div><div class='description'><div class='short'>updateFields\nUpdates the fields in this ribbon to match the values in this object ...</div><div class='long'><p>updateFields\nUpdates the fields in this ribbon to match the values in this object</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Workspace.Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateFieldsHandler' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateFieldsHandler' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateFieldsHandler' class='name expandable'>updateFieldsHandler</a>( <span class='pre'>Object prop, Object val, Object item</span> )</div><div class='description'><div class='short'>Called when bound objects change ...</div><div class='long'><p>Called when bound objects change</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>prop</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>val</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateObjects' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateObjects' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateObjects' class='name expandable'>updateObjects</a>( <span class='pre'>Object field, Object newValue, Object oldValue</span> )</div><div class='description'><div class='short'>listener invoked by bound field on change (or other objectBinding event); generates a Workspace.actions.Action to upd...</div><div class='long'><p>listener invoked by bound field on change (or other <a href=\"#!/api/App.ui.BoundObjectPanel-property-objectBinding\" rel=\"App.ui.BoundObjectPanel-property-objectBinding\" class=\"docClass\">objectBinding</a> event); generates a <a href=\"#!/api/Workspace.actions.Action\" rel=\"Workspace.actions.Action\" class=\"docClass\">Workspace.actions.Action</a> to update\nthe specified propery in all bound objects</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>field</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>newValue</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>oldValue</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","allMixins":[],"uses":[],"members":{"event":[],"property":[{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"property","name":"boundObjects","id":"property-boundObjects"},{"meta":{},"owner":"App.ui.ObjectProperties","tagname":"property","name":"enableBoundFields","id":"property-enableBoundFields"},{"meta":{},"owner":"App.ui.ObjectProperties","tagname":"property","name":"items","id":"property-items"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"property","name":"objectBinding","id":"property-objectBinding"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"property","name":"objectBindingEvent","id":"property-objectBindingEvent"},{"meta":{},"owner":"App.ui.ObjectProperties","tagname":"property","name":"workspace","id":"property-workspace"}],"method":[{"meta":{},"owner":"App.ui.ObjectProperties","tagname":"method","name":"attachTo","id":"method-attachTo"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"bind","id":"method-bind"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"destroy","id":"method-destroy"},{"meta":{},"owner":"App.ui.ObjectProperties","tagname":"method","name":"doAction","id":"method-doAction"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"enableIf","id":"method-enableIf"},{"meta":{},"owner":"App.ui.ObjectProperties","tagname":"method","name":"onSelectionChange","id":"method-onSelectionChange"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"showIf","id":"method-showIf"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"unbind","id":"method-unbind"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"updateDynamicFields","id":"method-updateDynamicFields"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"updateFields","id":"method-updateFields"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"updateFieldsHandler","id":"method-updateFieldsHandler"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"updateObjects","id":"method-updateObjects"}],"css_var":[],"cfg":[{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"cfg","name":"Allows","id":"cfg-Allows"}],"css_mixin":[]},"extends":"App.ui.BoundObjectPanel","inheritable":false,"private":false,"statics":{"event":[],"property":[],"method":[],"css_var":[],"cfg":[],"css_mixin":[]},"files":[{"href":"ObjectProperties.html#App-ui-ObjectProperties","filename":"ObjectProperties.js"}],"name":"App.ui.ObjectProperties","alternateClassNames":[],"singleton":false,"code_type":"ext_define","id":"class-App.ui.ObjectProperties","superclasses":["App.ui.BoundObjectPanel","App.ui.ObjectProperties"]});