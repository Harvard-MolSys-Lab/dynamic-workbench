Ext.data.JsonP.Workspace_objects_Connection({"mixins":[],"subclasses":[],"component":false,"html_meta":{},"requires":[],"tagname":"class","meta":{},"mixedInto":[],"aliases":{},"inheritdoc":null,"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Workspace.VectorObject<div class='subclass '><strong>Workspace.objects.Connection</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/Connection.html#Workspace-objects-Connection' target='_blank'>Connection.js</a></div></pre><div class='doc-contents'><p>Represents a workspace object connecting two other <a href=\"#!/api/Workspace.objects.Object\" rel=\"Workspace.objects.Object\" class=\"docClass\">Workspace.objects.Object</a>s together</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-leftObject' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.objects.Connection'>Workspace.objects.Connection</span><br/><a href='source/Connection.html#Workspace-objects-Connection-cfg-leftObject' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.objects.Connection-cfg-leftObject' class='name not-expandable'>leftObject</a><span> : Workspace.Object</span></div><div class='description'><div class='short'><p>The first object to connect</p>\n</div><div class='long'><p>The first object to connect</p>\n</div></div></div><div id='cfg-property' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.objects.Connection'>Workspace.objects.Connection</span><br/><a href='source/Connection.html#Workspace-objects-Connection-cfg-property' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.objects.Connection-cfg-property' class='name not-expandable'>property</a><span> : String</span></div><div class='description'><div class='short'><p>The property of leftObject to monitor</p>\n</div><div class='long'><p>The property of leftObject to monitor</p>\n</div></div></div><div id='cfg-rightObject' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.objects.Connection'>Workspace.objects.Connection</span><br/><a href='source/Connection.html#Workspace-objects-Connection-cfg-rightObject' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.objects.Connection-cfg-rightObject' class='name not-expandable'>rightObject</a><span> : Workspace.Object</span></div><div class='description'><div class='short'><p>The second object to connect</p>\n</div><div class='long'><p>The second object to connect</p>\n</div></div></div></div></div><div class='members-section'><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Instance Methods</h3><div id='method-buildPath' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.objects.Connection'>Workspace.objects.Connection</span><br/><a href='source/Connection.html#Workspace-objects-Connection-method-buildPath' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.objects.Connection-method-buildPath' class='name expandable'>buildPath</a>( <span class='pre'>Object obj1, Object obj2</span> )</div><div class='description'><div class='short'>buildPath\nCalculates a path betwen two objects\nAdapted from http://raphaeljs.com/graffle.html ...</div><div class='long'><p>buildPath\nCalculates a path betwen two objects\nAdapted from http://raphaeljs.com/graffle.html</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>obj1</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>obj2</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-rebuildPath' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.objects.Connection'>Workspace.objects.Connection</span><br/><a href='source/Connection.html#Workspace-objects-Connection-method-rebuildPath' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.objects.Connection-method-rebuildPath' class='name expandable'>rebuildPath</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>rebuildPath\nCalculates the path between the two configured objects and recalculates this object's layout ...</div><div class='long'><p>rebuildPath\nCalculates the path between the two configured objects and recalculates this object's layout</p>\n</div></div></div></div><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Static Methods</h3><div id='static-method-getPoint' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Workspace.objects.Connection'>Workspace.objects.Connection</span><br/><a href='source/Connection.html#Workspace-objects-Connection-static-method-getPoint' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Workspace.objects.Connection-static-method-getPoint' class='name expandable'>getPoint</a>( <span class='pre'>Object x, Object y</span> )<strong class='static signature'>static</strong></div><div class='description'><div class='short'>getPoint\nGets an imitation Workspace.object.Object suitable only to be passed to a\nWorkspace.objects.Connection as on...</div><div class='long'><p>getPoint\nGets an imitation Workspace.object.Object suitable <em>only</em> to be passed to a\n<a href=\"#!/api/Workspace.objects.Connection\" rel=\"Workspace.objects.Connection\" class=\"docClass\">Workspace.objects.Connection</a> as one of its anchors.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>x</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>y</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","allMixins":[],"uses":[],"members":{"event":[],"property":[],"method":[{"meta":{},"owner":"Workspace.objects.Connection","tagname":"method","name":"buildPath","id":"method-buildPath"},{"meta":{},"owner":"Workspace.objects.Connection","tagname":"method","name":"rebuildPath","id":"method-rebuildPath"}],"css_var":[],"cfg":[{"meta":{},"owner":"Workspace.objects.Connection","tagname":"cfg","name":"leftObject","id":"cfg-leftObject"},{"meta":{},"owner":"Workspace.objects.Connection","tagname":"cfg","name":"property","id":"cfg-property"},{"meta":{},"owner":"Workspace.objects.Connection","tagname":"cfg","name":"rightObject","id":"cfg-rightObject"}],"css_mixin":[]},"extends":"Workspace.VectorObject","inheritable":false,"private":false,"statics":{"event":[],"property":[],"method":[{"meta":{"static":true},"owner":"Workspace.objects.Connection","tagname":"method","name":"getPoint","id":"static-method-getPoint"}],"css_var":[],"cfg":[],"css_mixin":[]},"files":[{"href":"Connection.html#Workspace-objects-Connection","filename":"Connection.js"}],"name":"Workspace.objects.Connection","alternateClassNames":[],"singleton":false,"code_type":"ext_define","id":"class-Workspace.objects.Connection","superclasses":[]});