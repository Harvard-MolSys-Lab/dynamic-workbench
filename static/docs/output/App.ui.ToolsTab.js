Ext.data.JsonP.App_ui_ToolsTab({"mixins":[],"subclasses":["App.ui.canvas.ChemTab","App.ui.InsertTab"],"component":false,"html_meta":{},"requires":["Workspace.tools.PointerTool","Workspace.tools.PencilTool","Workspace.tools.IdeaTool","Workspace.tools.ConnectorTool","Workspace.tools.IdeaAdderTool"],"tagname":"class","meta":{},"mixedInto":[],"aliases":{},"inheritdoc":null,"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='docClass'>App.ui.BoundObjectPanel</a><div class='subclass '><strong>App.ui.ToolsTab</strong></div></div><h4>Requires</h4><div class='dependency'><a href='#!/api/Workspace.tools.PointerTool' rel='Workspace.tools.PointerTool' class='docClass'>Workspace.tools.PointerTool</a></div><div class='dependency'><a href='#!/api/Workspace.tools.PencilTool' rel='Workspace.tools.PencilTool' class='docClass'>Workspace.tools.PencilTool</a></div><div class='dependency'><a href='#!/api/Workspace.tools.IdeaTool' rel='Workspace.tools.IdeaTool' class='docClass'>Workspace.tools.IdeaTool</a></div><div class='dependency'><a href='#!/api/Workspace.tools.ConnectorTool' rel='Workspace.tools.ConnectorTool' class='docClass'>Workspace.tools.ConnectorTool</a></div><div class='dependency'><a href='#!/api/Workspace.tools.IdeaAdderTool' rel='Workspace.tools.IdeaAdderTool' class='docClass'>Workspace.tools.IdeaAdderTool</a></div><h4>Files</h4><div class='dependency'><a href='source/ToolsTab.html#App-ui-ToolsTab' target='_blank'>ToolsTab.js</a></div></pre><div class='doc-contents'><p>Manages the tool palate and provides several object actions</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-Allows' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-cfg-Allows' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-cfg-Allows' class='name not-expandable'>Allows</a><span> : Boolean</span></div><div class='description'><div class='short'><p>the binding of <a href=\"#!/api/Machine.core.Serializable-method-expose\" rel=\"Machine.core.Serializable-method-expose\" class=\"docClass\">object properties</a> to fields\nwithin this component to be categorically disabled.</p>\n</div><div class='long'><p>the binding of <a href=\"#!/api/Machine.core.Serializable-method-expose\" rel=\"Machine.core.Serializable-method-expose\" class=\"docClass\">object properties</a> to fields\nwithin this component to be categorically disabled.</p>\n</div></div></div><div id='cfg-tool' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-cfg-tool' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-cfg-tool' class='name expandable'>tool</a><span> : String</span></div><div class='description'><div class='short'>The default tool ...</div><div class='long'><p>The default tool</p>\n<p>Defaults to: <code>&quot;pointer&quot;</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-boundObjects' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-property-boundObjects' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-property-boundObjects' class='name not-expandable'>boundObjects</a><span> : <a href=\"#!/api/Workspace.objects.ObjectCollection\" rel=\"Workspace.objects.ObjectCollection\" class=\"docClass\">Workspace.objects.ObjectCollection</a></span></div><div class='description'><div class='short'><p>Objects which have been bound to this panel with <a href=\"#!/api/App.ui.BoundObjectPanel-method-bind\" rel=\"App.ui.BoundObjectPanel-method-bind\" class=\"docClass\">bind</a></p>\n</div><div class='long'><p>Objects which have been bound to this panel with <a href=\"#!/api/App.ui.BoundObjectPanel-method-bind\" rel=\"App.ui.BoundObjectPanel-method-bind\" class=\"docClass\">bind</a></p>\n</div></div></div><div id='property-objectBinding' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-property-objectBinding' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-property-objectBinding' class='name expandable'>objectBinding</a><span> : String</span></div><div class='description'><div class='short'>To be applied to child items:\nName of an exposed field in a Machine.core.Serializable object bound to this panel. ...</div><div class='long'><p>To be applied to child items:\nName of an exposed field in a <a href=\"#!/api/Machine.core.Serializable\" rel=\"Machine.core.Serializable\" class=\"docClass\">Machine.core.Serializable</a> object bound to this panel. When the value\nof the Ext.form.field.Field with the <var>objectBinding</var> property set changes, the <a href=\"#!/api/App.ui.BoundObjectPanel-property-boundObjects\" rel=\"App.ui.BoundObjectPanel-property-boundObjects\" class=\"docClass\">boundObjects</a>\nare updated with <a href=\"#!/api/Machine.core.Serializable-method-set\" rel=\"Machine.core.Serializable-method-set\" class=\"docClass\">Machine.core.Serializable.set</a>.</p>\n</div></div></div><div id='property-objectBindingEvent' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-property-objectBindingEvent' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-property-objectBindingEvent' class='name not-expandable'>objectBindingEvent</a><span> : String</span></div><div class='description'><div class='short'><p>Event to watch for changes to the <a href=\"#!/api/App.ui.BoundObjectPanel-property-boundObjects\" rel=\"App.ui.BoundObjectPanel-property-boundObjects\" class=\"docClass\">boundObjects</a></p>\n</div><div class='long'><p>Event to watch for changes to the <a href=\"#!/api/App.ui.BoundObjectPanel-property-boundObjects\" rel=\"App.ui.BoundObjectPanel-property-boundObjects\" class=\"docClass\">boundObjects</a></p>\n</div></div></div><div id='property-toolName' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-property-toolName' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-property-toolName' class='name not-expandable'>toolName</a><span> : String</span></div><div class='description'><div class='short'><p>Child buttons should have this property to specify which <a href=\"#!/api/Workspace.tools.BaseTool\" rel=\"Workspace.tools.BaseTool\" class=\"docClass\">Workspace.tools.BaseTool</a> to activate on toggle.</p>\n</div><div class='long'><p>Child buttons should have this property to specify which <a href=\"#!/api/Workspace.tools.BaseTool\" rel=\"Workspace.tools.BaseTool\" class=\"docClass\">Workspace.tools.BaseTool</a> to activate on toggle.</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-bind' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-bind' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-bind' class='name expandable'>bind</a>( <span class='pre'>Workspace.Object item</span> )</div><div class='description'><div class='short'>Attaches the given object to this panel, so that changes in the panel will be reflected in the object ...</div><div class='long'><p>Attaches the given object to this panel, so that changes in the panel will be reflected in the object</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Workspace.Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-deleteObjects' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-deleteObjects' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-deleteObjects' class='name expandable'>deleteObjects</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>deleteObjects\nGenerates a WorkspaceAction to delete the bound objects ...</div><div class='long'><p>deleteObjects\nGenerates a WorkspaceAction to delete the bound objects</p>\n</div></div></div><div id='method-destroy' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-destroy' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-destroy' class='name expandable'>destroy</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>destroy ...</div><div class='long'><p>destroy</p>\n</div></div></div><div id='method-duplicateObjects' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-duplicateObjects' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-duplicateObjects' class='name expandable'>duplicateObjects</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>duplicateObjects\nGenerates a WorkspaceAction to delete the bound objects ...</div><div class='long'><p>duplicateObjects\nGenerates a WorkspaceAction to delete the bound objects</p>\n</div></div></div><div id='method-enableIf' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-enableIf' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-enableIf' class='name expandable'>enableIf</a>( <span class='pre'>String common, Ext.util.MixedCollection boundObjects, <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a> this</span> ) : Boolean</div><div class='description'><div class='short'>Override on child components to determine whether they should be enabled for a particular selection ...</div><div class='long'><p>Override on child components to determine whether they should be enabled for a particular selection</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>common</span> : String<div class='sub-desc'><p>The most specific common WType among the bound objects</p>\n</div></li><li><span class='pre'>boundObjects</span> : Ext.util.MixedCollection<div class='sub-desc'><p>A list of all bound objects</p>\n</div></li><li><span class='pre'>this</span> : <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Boolean</span><div class='sub-desc'><p>show</p>\n</div></li></ul></div></div></div><div id='method-expandWorkspace' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-expandWorkspace' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-expandWorkspace' class='name expandable'>expandWorkspace</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Generates a WorkspaceAction to expand the size of the workspace ...</div><div class='long'><p>Generates a WorkspaceAction to expand the size of the workspace</p>\n</div></div></div><div id='method-formIdea' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-formIdea' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-formIdea' class='name expandable'>formIdea</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>formIdea\nGenerates a WorkspaceAction to build an idea from the current selection ...</div><div class='long'><p>formIdea\nGenerates a WorkspaceAction to build an idea from the current selection</p>\n</div></div></div><div id='method-getActiveTool' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-getActiveTool' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-getActiveTool' class='name expandable'>getActiveTool</a>( <span class='pre'></span> ) : String</div><div class='description'><div class='short'>Gets the name of the currently active tool ...</div><div class='long'><p>Gets the name of the currently active tool</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'><p>toolName</p>\n</div></li></ul></div></div></div><div id='method-onToggle' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-onToggle' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-onToggle' class='name expandable'>onToggle</a>( <span class='pre'>Ext.Button btn, Boolean pressed</span> )</div><div class='description'><div class='short'>Event handler automatically applied to buttons with configured toolNames ...</div><div class='long'><p>Event handler automatically applied to buttons with configured <a href=\"#!/api/App.ui.ToolsTab-property-toolName\" rel=\"App.ui.ToolsTab-property-toolName\" class=\"docClass\">toolName</a>s</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>btn</span> : Ext.Button<div class='sub-desc'>\n</div></li><li><span class='pre'>pressed</span> : Boolean<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-onToolChange' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-onToolChange' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-onToolChange' class='name expandable'>onToolChange</a>( <span class='pre'>String tool</span> )</div><div class='description'><div class='short'>Responds to workspace toolChange event and updates UI to reflect ...</div><div class='long'><p>Responds to workspace toolChange event and updates UI to reflect</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>tool</span> : String<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-orphanObjects' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-orphanObjects' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-orphanObjects' class='name expandable'>orphanObjects</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Generates a WorkspaceAction to decouple the bound objects from their parent(s) ...</div><div class='long'><p>Generates a WorkspaceAction to decouple the bound objects from their parent(s)</p>\n</div></div></div><div id='method-saveWorkspace' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-saveWorkspace' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-saveWorkspace' class='name expandable'>saveWorkspace</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Generates an event notifying the parent canvas to save the workspace ...</div><div class='long'><p>Generates an event notifying the parent canvas to save the workspace</p>\n</div></div></div><div id='method-setActiveTool' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-method-setActiveTool' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-method-setActiveTool' class='name expandable'>setActiveTool</a>( <span class='pre'>String tool</span> )</div><div class='description'><div class='short'>Allows Tools tab in ribbon to set the active workspace tool ...</div><div class='long'><p>Allows Tools tab in ribbon to set the active workspace tool</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>tool</span> : String<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-showIf' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-showIf' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-showIf' class='name expandable'>showIf</a>( <span class='pre'>String common, Ext.util.MixedCollection boundObjects, <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a> this</span> ) : Boolean</div><div class='description'><div class='short'>Override on child components to determine whether they should be shown for a particular selection ...</div><div class='long'><p>Override on child components to determine whether they should be shown for a particular selection</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>common</span> : String<div class='sub-desc'><p>The most specific common WType among the bound objects</p>\n</div></li><li><span class='pre'>boundObjects</span> : Ext.util.MixedCollection<div class='sub-desc'><p>A list of all bound objects</p>\n</div></li><li><span class='pre'>this</span> : <a href=\"#!/api/App.ui.BoundObjectPanel\" rel=\"App.ui.BoundObjectPanel\" class=\"docClass\">App.ui.BoundObjectPanel</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Boolean</span><div class='sub-desc'><p>show</p>\n</div></li></ul></div></div></div><div id='method-unbind' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-unbind' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-unbind' class='name expandable'>unbind</a>( <span class='pre'>Workspace.Object item</span> )</div><div class='description'><div class='short'>Detaches the given object from this panel ...</div><div class='long'><p>Detaches the given object from this panel</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Workspace.Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateDynamicFields' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateDynamicFields' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateDynamicFields' class='name expandable'>updateDynamicFields</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Updates child elements with showIf and/or enableIf methods. ...</div><div class='long'><p>Updates child elements with <a href=\"#!/api/App.ui.BoundObjectPanel-method-showIf\" rel=\"App.ui.BoundObjectPanel-method-showIf\" class=\"docClass\">showIf</a> and/or <a href=\"#!/api/App.ui.BoundObjectPanel-method-enableIf\" rel=\"App.ui.BoundObjectPanel-method-enableIf\" class=\"docClass\">enableIf</a> methods. Called upon item binding/unbinding.</p>\n</div></div></div><div id='method-updateFields' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateFields' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateFields' class='name expandable'>updateFields</a>( <span class='pre'>Workspace.Object item</span> )</div><div class='description'><div class='short'>updateFields\nUpdates the fields in this ribbon to match the values in this object ...</div><div class='long'><p>updateFields\nUpdates the fields in this ribbon to match the values in this object</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Workspace.Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateFieldsHandler' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateFieldsHandler' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateFieldsHandler' class='name expandable'>updateFieldsHandler</a>( <span class='pre'>Object prop, Object val, Object item</span> )</div><div class='description'><div class='short'>Called when bound objects change ...</div><div class='long'><p>Called when bound objects change</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>prop</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>val</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-updateObjects' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/App.ui.BoundObjectPanel' rel='App.ui.BoundObjectPanel' class='defined-in docClass'>App.ui.BoundObjectPanel</a><br/><a href='source/BoundObjectPanel.html#App-ui-BoundObjectPanel-method-updateObjects' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.BoundObjectPanel-method-updateObjects' class='name expandable'>updateObjects</a>( <span class='pre'>Object field, Object newValue, Object oldValue</span> )</div><div class='description'><div class='short'>listener invoked by bound field on change (or other objectBinding event); generates a Workspace.actions.Action to upd...</div><div class='long'><p>listener invoked by bound field on change (or other <a href=\"#!/api/App.ui.BoundObjectPanel-property-objectBinding\" rel=\"App.ui.BoundObjectPanel-property-objectBinding\" class=\"docClass\">objectBinding</a> event); generates a <a href=\"#!/api/Workspace.actions.Action\" rel=\"Workspace.actions.Action\" class=\"docClass\">Workspace.actions.Action</a> to update\nthe specified propery in all bound objects</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>field</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>newValue</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>oldValue</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-event'>Events</h3><div class='subsection'><div id='event-toolChange' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.ToolsTab'>App.ui.ToolsTab</span><br/><a href='source/ToolsTab.html#App-ui-ToolsTab-event-toolChange' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.ToolsTab-event-toolChange' class='name expandable'>toolChange</a>( <span class='pre'>Object eOpts</span> )</div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>eOpts</span> : Object<div class='sub-desc'><p>The options object passed to Ext.util.Observable.addListener.</p>\n\n\n\n</div></li></ul></div></div></div></div></div></div></div>","allMixins":[],"uses":[],"members":{"event":[{"meta":{},"owner":"App.ui.ToolsTab","tagname":"event","name":"toolChange","id":"event-toolChange"}],"property":[{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"property","name":"boundObjects","id":"property-boundObjects"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"property","name":"objectBinding","id":"property-objectBinding"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"property","name":"objectBindingEvent","id":"property-objectBindingEvent"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"property","name":"toolName","id":"property-toolName"}],"method":[{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"bind","id":"method-bind"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"deleteObjects","id":"method-deleteObjects"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"destroy","id":"method-destroy"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"duplicateObjects","id":"method-duplicateObjects"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"enableIf","id":"method-enableIf"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"expandWorkspace","id":"method-expandWorkspace"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"formIdea","id":"method-formIdea"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"getActiveTool","id":"method-getActiveTool"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"onToggle","id":"method-onToggle"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"onToolChange","id":"method-onToolChange"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"orphanObjects","id":"method-orphanObjects"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"saveWorkspace","id":"method-saveWorkspace"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"method","name":"setActiveTool","id":"method-setActiveTool"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"showIf","id":"method-showIf"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"unbind","id":"method-unbind"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"updateDynamicFields","id":"method-updateDynamicFields"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"updateFields","id":"method-updateFields"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"updateFieldsHandler","id":"method-updateFieldsHandler"},{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"method","name":"updateObjects","id":"method-updateObjects"}],"css_var":[],"cfg":[{"meta":{},"owner":"App.ui.BoundObjectPanel","tagname":"cfg","name":"Allows","id":"cfg-Allows"},{"meta":{},"owner":"App.ui.ToolsTab","tagname":"cfg","name":"tool","id":"cfg-tool"}],"css_mixin":[]},"extends":"App.ui.BoundObjectPanel","inheritable":false,"private":false,"statics":{"event":[],"property":[],"method":[],"css_var":[],"cfg":[],"css_mixin":[]},"files":[{"href":"ToolsTab.html#App-ui-ToolsTab","filename":"ToolsTab.js"}],"name":"App.ui.ToolsTab","alternateClassNames":[],"singleton":false,"code_type":"ext_define","id":"class-App.ui.ToolsTab","superclasses":["App.ui.BoundObjectPanel","App.ui.ToolsTab"]});