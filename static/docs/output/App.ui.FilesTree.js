Ext.data.JsonP.App_ui_FilesTree({"mixins":[],"subclasses":[],"component":false,"html_meta":{},"requires":["App.ui.files.DragDropManager","App.ui.files.FileUploader","App.ui.CreateMenu","App.ui.Launcher"],"tagname":"class","meta":{},"mixedInto":[],"aliases":{},"inheritdoc":null,"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.tree.Panel<div class='subclass '><strong>App.ui.FilesTree</strong></div></div><h4>Requires</h4><div class='dependency'><a href='#!/api/App.ui.files.DragDropManager' rel='App.ui.files.DragDropManager' class='docClass'>App.ui.files.DragDropManager</a></div><div class='dependency'><a href='#!/api/App.ui.files.FileUploader' rel='App.ui.files.FileUploader' class='docClass'>App.ui.files.FileUploader</a></div><div class='dependency'><a href='#!/api/App.ui.CreateMenu' rel='App.ui.CreateMenu' class='docClass'>App.ui.CreateMenu</a></div><div class='dependency'><a href='#!/api/App.ui.Launcher' rel='App.ui.Launcher' class='docClass'>App.ui.Launcher</a></div><h4>Files</h4><div class='dependency'><a href='source/FilesTree.html#App-ui-FilesTree' target='_blank'>FilesTree.js</a></div></pre><div class='doc-contents'><p>Displays a tree of files in the user's home directory</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-createContextMenu' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-cfg-createContextMenu' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-cfg-createContextMenu' class='name expandable'>createContextMenu</a><span> : Boolean</span></div><div class='description'><div class='short'>True to show a context menu on right click to allow the user to open, rename, and create new files;\nset to false to a...</div><div class='long'><p>True to show a context menu on right click to allow the user to open, rename, and create new files;\nset to false to allow custom behavior (e.g. for embedding the <a href=\"#!/api/App.ui.FilesTree\" rel=\"App.ui.FilesTree\" class=\"docClass\">App.ui.FilesTree</a> in a menu)</p>\n<p>Defaults to: <code>true</code></p></div></div></div><div id='cfg-title' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-cfg-title' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-cfg-title' class='name expandable'>title</a><span> : String</span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&quot;Files&quot;</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-contextMenu' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-property-contextMenu' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-property-contextMenu' class='name not-expandable'>contextMenu</a><span> : Ext.menu.Menu</span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div><div id='property-ddManager' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-property-ddManager' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-property-ddManager' class='name not-expandable'>ddManager</a><span> : App.ui.files.DragDropManager</span></div><div class='description'><div class='short'><p>Manages uploading of files dropped into the browser</p>\n</div><div class='long'><p>Manages uploading of files dropped into the browser</p>\n</div></div></div><div id='property-fileNameField' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-property-fileNameField' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-property-fileNameField' class='name not-expandable'>fileNameField</a><span> : Ext.form.field.Text</span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-afterrender' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-afterrender' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-afterrender' class='name expandable'>afterrender</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Initializes the ddManager ...</div><div class='long'><p>Initializes the <a href=\"#!/api/App.ui.FilesTree-property-ddManager\" rel=\"App.ui.FilesTree-property-ddManager\" class=\"docClass\">ddManager</a></p>\n</div></div></div><div id='method-click' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-click' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-click' class='name expandable'>click</a>( <span class='pre'>Ext.tree.Panel tree, <a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a> rec, Mixed item, Number i, Event e</span> )</div><div class='description'><div class='short'>Called when the user clicks on a cell ...</div><div class='long'><p>Called when the user clicks on a cell</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>tree</span> : Ext.tree.Panel<div class='sub-desc'>\n</div></li><li><span class='pre'>rec</span> : <a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a><div class='sub-desc'>\n</div></li><li><span class='pre'>item</span> : Mixed<div class='sub-desc'>\n</div></li><li><span class='pre'>i</span> : Number<div class='sub-desc'><p>Index of the selected record</p>\n</div></li><li><span class='pre'>e</span> : Event<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-deleteDocument' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-deleteDocument' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-deleteDocument' class='name expandable'>deleteDocument</a>( <span class='pre'><a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a> rec</span> )</div><div class='description'><div class='short'>Deletes the provided App.Document ...</div><div class='long'><p>Deletes the provided <a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rec</span> : <a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-deleteSelectedDocument' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-deleteSelectedDocument' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-deleteSelectedDocument' class='name expandable'>deleteSelectedDocument</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Deletes the selected document ...</div><div class='long'><p>Deletes the selected document</p>\n</div></div></div><div id='method-download' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-download' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-download' class='name expandable'>download</a>( <span class='pre'>Object rec</span> )</div><div class='description'><div class='short'>Downloads the requested file ...</div><div class='long'><p>Downloads the requested file</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rec</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-newFile' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-newFile' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-newFile' class='name expandable'>newFile</a>( <span class='pre'><a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a> rec, String name</span> )</div><div class='description'><div class='short'>Create a new document underneath the passed rec, if rec is a folder; else creates a\nsibling to rec. ...</div><div class='long'><p>Create a new document underneath the passed <code>rec</code>, if <code>rec</code> is a folder; else creates a\nsibling to <code>rec</code>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rec</span> : <a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a><div class='sub-desc'>\n</div></li><li><span class='pre'>name</span> : String<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-newFileUnderSelection' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-newFileUnderSelection' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-newFileUnderSelection' class='name expandable'>newFileUnderSelection</a>( <span class='pre'>String name</span> )</div><div class='description'><div class='short'>Creates a new document underneath the last selected record with the passed name ...</div><div class='long'><p>Creates a new document underneath the last selected record with the passed name</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : String<div class='sub-desc'><p>of the new file</p>\n</div></li></ul></div></div></div><div id='method-open' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-open' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-open' class='name expandable'>open</a>( <span class='pre'><a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a> rec</span> )</div><div class='description'><div class='short'>Opens the provided App.Document using App.ui.Launcher.launch ...</div><div class='long'><p>Opens the provided <a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a> using <a href=\"#!/api/App.ui.Launcher-method-launch\" rel=\"App.ui.Launcher-method-launch\" class=\"docClass\">App.ui.Launcher.launch</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rec</span> : <a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a><div class='sub-desc'><p>The document to open</p>\n</div></li></ul></div></div></div><div id='method-openSelection' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-openSelection' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-openSelection' class='name expandable'>openSelection</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Opens the last selected document ...</div><div class='long'><p>Opens the last selected document</p>\n</div></div></div><div id='method-refreshDocument' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-refreshDocument' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-refreshDocument' class='name expandable'>refreshDocument</a>( <span class='pre'><a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a> rec, Function callback</span> )</div><div class='description'><div class='short'>Reloads the file heirarchy underneath the provided App.Document ...</div><div class='long'><p>Reloads the file heirarchy underneath the provided <a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>rec</span> : <a href=\"#!/api/App.Document\" rel=\"App.Document\" class=\"docClass\">App.Document</a><div class='sub-desc'><p>The record under which to refresh</p>\n</div></li><li><span class='pre'>callback</span> : Function<div class='sub-desc'><p>Function to execute when operation completed.  Will be called with the following parameters:\n- records : Array of Ext.data.Model objects.\n- operation : The Ext.data.Operation itself.\n- success : True when operation completed successfully.</p>\n</div></li></ul></div></div></div><div id='method-selectNode' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-selectNode' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-selectNode' class='name expandable'>selectNode</a>( <span class='pre'>Object node</span> )</div><div class='description'><div class='short'>Selects a node based on a file path ...</div><div class='long'><p>Selects a node based on a file path</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>node</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-showContextMenu' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.FilesTree'>App.ui.FilesTree</span><br/><a href='source/FilesTree.html#App-ui-FilesTree-method-showContextMenu' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.FilesTree-method-showContextMenu' class='name expandable'>showContextMenu</a>( <span class='pre'>Object tree, Object rec, Object dom, Object i, Object e</span> )</div><div class='description'><div class='short'>Shows the context menu attached to a particular record. ...</div><div class='long'><p>Shows the context menu attached to a particular record.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>tree</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>rec</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>dom</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>i</span> : Object<div class='sub-desc'>\n</div></li><li><span class='pre'>e</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","allMixins":[],"uses":[],"members":{"event":[],"property":[{"meta":{},"owner":"App.ui.FilesTree","tagname":"property","name":"contextMenu","id":"property-contextMenu"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"property","name":"ddManager","id":"property-ddManager"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"property","name":"fileNameField","id":"property-fileNameField"}],"method":[{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"afterrender","id":"method-afterrender"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"click","id":"method-click"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"deleteDocument","id":"method-deleteDocument"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"deleteSelectedDocument","id":"method-deleteSelectedDocument"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"download","id":"method-download"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"newFile","id":"method-newFile"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"newFileUnderSelection","id":"method-newFileUnderSelection"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"open","id":"method-open"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"openSelection","id":"method-openSelection"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"refreshDocument","id":"method-refreshDocument"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"selectNode","id":"method-selectNode"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"method","name":"showContextMenu","id":"method-showContextMenu"}],"css_var":[],"cfg":[{"meta":{},"owner":"App.ui.FilesTree","tagname":"cfg","name":"createContextMenu","id":"cfg-createContextMenu"},{"meta":{},"owner":"App.ui.FilesTree","tagname":"cfg","name":"title","id":"cfg-title"}],"css_mixin":[]},"extends":"Ext.tree.Panel","inheritable":false,"private":false,"statics":{"event":[],"property":[],"method":[],"css_var":[],"cfg":[],"css_mixin":[]},"files":[{"href":"FilesTree.html#App-ui-FilesTree","filename":"FilesTree.js"}],"name":"App.ui.FilesTree","alternateClassNames":[],"singleton":false,"code_type":"ext_define","id":"class-App.ui.FilesTree","superclasses":[]});