Ext.data.JsonP.App_TaskRunner({"mixins":[],"subclasses":[],"component":false,"html_meta":{},"requires":[],"tagname":"class","meta":{},"mixedInto":[],"aliases":{},"inheritdoc":null,"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.Base<div class='subclass '><strong>App.TaskRunner</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/app.html#App-TaskRunner' target='_blank'>app.js</a></div></pre><div class='doc-contents'><p>Runs tasks on the server</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-loadTools' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.TaskRunner'>App.TaskRunner</span><br/><a href='source/app.html#App-TaskRunner-method-loadTools' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.TaskRunner-method-loadTools' class='name expandable'>loadTools</a>( <span class='pre'>Object tasks</span> )</div><div class='description'><div class='short'>Defines subclasses of App.TaskRunner.Task as members of App.TaskRunner. ...</div><div class='long'><p>Defines subclasses of <a href=\"#!/api/App.TaskRunner.Task\" rel=\"App.TaskRunner.Task\" class=\"docClass\">App.TaskRunner.Task</a> as members of <a href=\"#!/api/App.TaskRunner\" rel=\"App.TaskRunner\" class=\"docClass\">App.TaskRunner</a>. Called by server code\nin order to make configured server tools available on the client.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>tasks</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-run' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.TaskRunner'>App.TaskRunner</span><br/><a href='source/app.html#App-TaskRunner-method-run' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.TaskRunner-method-run' class='name expandable'>run</a>( <span class='pre'>String serverTool, Array args, Function callback</span> )</div><div class='description'><div class='short'>Runs a task using the given serverTool ...</div><div class='long'><p>Runs a task using the given serverTool</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>serverTool</span> : String<div class='sub-desc'><p>Name of a member of <a href=\"#!/api/App.TaskRunner\" rel=\"App.TaskRunner\" class=\"docClass\">App.TaskRunner</a>; must be configred by server code calling <a href=\"#!/api/App.TaskRunner-method-loadTools\" rel=\"App.TaskRunner-method-loadTools\" class=\"docClass\">loadTools</a></p>\n</div></li><li><span class='pre'>args</span> : Array<div class='sub-desc'><p>Arguments to pass to the tool</p>\n</div></li><li><span class='pre'>callback</span> : Function<div class='sub-desc'><p>Function to call upon completion</p>\n</div></li></ul></div></div></div></div></div></div></div>","allMixins":[],"uses":[],"members":{"event":[],"property":[],"method":[{"meta":{},"owner":"App.TaskRunner","tagname":"method","name":"loadTools","id":"method-loadTools"},{"meta":{},"owner":"App.TaskRunner","tagname":"method","name":"run","id":"method-run"}],"css_var":[],"cfg":[],"css_mixin":[]},"extends":"Ext.Base","inheritable":false,"private":false,"statics":{"event":[],"property":[],"method":[],"css_var":[],"cfg":[],"css_mixin":[]},"files":[{"href":"app.html#App-TaskRunner","filename":"app.js"}],"name":"App.TaskRunner","alternateClassNames":[],"singleton":false,"code_type":"ext_define","id":"class-App.TaskRunner","superclasses":[]});