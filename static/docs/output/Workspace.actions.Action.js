Ext.data.JsonP.Workspace_actions_Action({"mixins":[],"subclasses":["Workspace.actions.AdoptObjectAction","Workspace.actions.ChangePropertyAction","Workspace.actions.CreateObjectAction","Workspace.actions.DeleteObjectAction","Workspace.actions.DuplicateObjectAction","Workspace.actions.ExpandAction","Workspace.actions.FormIdeaAction","Workspace.actions.OrphanObjectAction","Workspace.actions.UnwrapObjectsAction"],"component":false,"html_meta":{"abstract":null},"requires":[],"tagname":"class","meta":{"abstract":true},"mixedInto":[],"aliases":{},"inheritdoc":null,"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.Action<div class='subclass '><strong>Workspace.actions.Action</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/Action.html#Workspace-actions-Action' target='_blank'>Action.js</a></div></pre><div class='doc-contents'><p>Encapsulates a single, un-doable change to the workspace.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-handler' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.actions.Action'>Workspace.actions.Action</span><br/><a href='source/Action.html#Workspace-actions-Action-cfg-handler' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.actions.Action-cfg-handler' class='name not-expandable'>handler</a><span> : Function</span></div><div class='description'><div class='short'><p>The function to invoke on execution</p>\n</div><div class='long'><p>The function to invoke on execution</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-attachTo' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.actions.Action'>Workspace.actions.Action</span><br/><a href='source/Action.html#Workspace-actions-Action-method-attachTo' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.actions.Action-method-attachTo' class='name expandable'>attachTo</a>( <span class='pre'><a href=\"#!/api/Workspace\" rel=\"Workspace\" class=\"docClass\">Workspace</a> workspace</span> )</div><div class='description'><div class='short'>attachTo\nAttaches this action to the given workspace ...</div><div class='long'><p>attachTo\nAttaches this action to the given workspace</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>workspace</span> : <a href=\"#!/api/Workspace\" rel=\"Workspace\" class=\"docClass\">Workspace</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-execute' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.actions.Action'>Workspace.actions.Action</span><br/><a href='source/Action.html#Workspace-actions-Action-method-execute' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.actions.Action-method-execute' class='name expandable'>execute</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>execute\nPerforms the action on the attached workspace. ...</div><div class='long'><p>execute\nPerforms the action on the attached workspace.</p>\n</div></div></div><div id='method-getUndo' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.actions.Action'>Workspace.actions.Action</span><br/><a href='source/Action.html#Workspace-actions-Action-method-getUndo' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.actions.Action-method-getUndo' class='name expandable'>getUndo</a>( <span class='pre'></span> ) : <a href=\"#!/api/Workspace.actions.Action\" rel=\"Workspace.actions.Action\" class=\"docClass\">Workspace.actions.Action</a></div><div class='description'><div class='short'>getUndo\nGets the action which can be invoked to undo this action. ...</div><div class='long'><p>getUndo\nGets the action which can be invoked to undo this action. This method must be called before (preferrably immediately before)\nthe action is invoked</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Workspace.actions.Action\" rel=\"Workspace.actions.Action\" class=\"docClass\">Workspace.actions.Action</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-serialize' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.actions.Action'>Workspace.actions.Action</span><br/><a href='source/Action.html#Workspace-actions-Action-method-serialize' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.actions.Action-method-serialize' class='name expandable'>serialize</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Serialized\nReturns a serialized version of this action ...</div><div class='long'><p>Serialized\nReturns a serialized version of this action</p>\n</div></div></div></div></div></div></div>","allMixins":[],"uses":[],"members":{"event":[],"property":[],"method":[{"meta":{},"owner":"Workspace.actions.Action","tagname":"method","name":"attachTo","id":"method-attachTo"},{"meta":{},"owner":"Workspace.actions.Action","tagname":"method","name":"execute","id":"method-execute"},{"meta":{},"owner":"Workspace.actions.Action","tagname":"method","name":"getUndo","id":"method-getUndo"},{"meta":{},"owner":"Workspace.actions.Action","tagname":"method","name":"serialize","id":"method-serialize"}],"css_var":[],"cfg":[{"meta":{},"owner":"Workspace.actions.Action","tagname":"cfg","name":"handler","id":"cfg-handler"}],"css_mixin":[]},"extends":"Ext.Action","inheritable":false,"private":false,"statics":{"event":[],"property":[],"method":[],"css_var":[],"cfg":[],"css_mixin":[]},"files":[{"href":"Action.html#Workspace-actions-Action","filename":"Action.js"}],"name":"Workspace.actions.Action","alternateClassNames":[],"singleton":false,"code_type":"ext_define","id":"class-Workspace.actions.Action","superclasses":[]});