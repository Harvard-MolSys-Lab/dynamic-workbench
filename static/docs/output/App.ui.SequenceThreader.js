Ext.data.JsonP.App_ui_SequenceThreader({"mixins":[],"subclasses":[],"component":false,"html_meta":{},"requires":[],"tagname":"class","meta":{},"mixedInto":[],"aliases":{},"inheritdoc":null,"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'>Ext.window.Window<div class='subclass '><strong>App.ui.SequenceThreader</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/SequenceThreader.html#App-ui-SequenceThreader' target='_blank'>SequenceThreader.js</a></div></pre><div class='doc-contents'><p>Provides an interface allowing a set of sequences (e.g. domains/segments) to\nbe \"threaded\" (connected in order, respecting complementarities) to a set of\nstrands, based on a specification.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-resultsPane' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.SequenceThreader'>App.ui.SequenceThreader</span><br/><a href='source/SequenceThreader.html#App-ui-SequenceThreader-property-resultsPane' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.SequenceThreader-property-resultsPane' class='name not-expandable'>resultsPane</a><span> : <a href=\"#!/api/App.ui.CodeMirror\" rel=\"App.ui.CodeMirror\" class=\"docClass\">App.ui.CodeMirror</a></span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div><div id='property-sequencesPane' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.SequenceThreader'>App.ui.SequenceThreader</span><br/><a href='source/SequenceThreader.html#App-ui-SequenceThreader-property-sequencesPane' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.SequenceThreader-property-sequencesPane' class='name not-expandable'>sequencesPane</a><span> : <a href=\"#!/api/App.ui.CodeMirror\" rel=\"App.ui.CodeMirror\" class=\"docClass\">App.ui.CodeMirror</a></span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div><div id='property-strandsPane' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.SequenceThreader'>App.ui.SequenceThreader</span><br/><a href='source/SequenceThreader.html#App-ui-SequenceThreader-property-strandsPane' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.SequenceThreader-property-strandsPane' class='name not-expandable'>strandsPane</a><span> : <a href=\"#!/api/App.ui.CodeMirror\" rel=\"App.ui.CodeMirror\" class=\"docClass\">App.ui.CodeMirror</a></span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-normalize' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.SequenceThreader'>App.ui.SequenceThreader</span><br/><a href='source/SequenceThreader.html#App-ui-SequenceThreader-method-normalize' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.SequenceThreader-method-normalize' class='name expandable'>normalize</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Normalizes possibly discontinuous sequence numbers into continuous lists ...</div><div class='long'><p>Normalizes possibly discontinuous sequence numbers into continuous lists</p>\n</div></div></div><div id='method-setSequences' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.SequenceThreader'>App.ui.SequenceThreader</span><br/><a href='source/SequenceThreader.html#App-ui-SequenceThreader-method-setSequences' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.SequenceThreader-method-setSequences' class='name expandable'>setSequences</a>( <span class='pre'>Object data</span> )</div><div class='description'><div class='short'>Sets the value of the sequencesPane ...</div><div class='long'><p>Sets the value of the <a href=\"#!/api/App.ui.SequenceThreader-property-sequencesPane\" rel=\"App.ui.SequenceThreader-property-sequencesPane\" class=\"docClass\">sequencesPane</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>data</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-setStrands' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.SequenceThreader'>App.ui.SequenceThreader</span><br/><a href='source/SequenceThreader.html#App-ui-SequenceThreader-method-setStrands' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.SequenceThreader-method-setStrands' class='name expandable'>setStrands</a>( <span class='pre'>Object data</span> )</div><div class='description'><div class='short'>Sets the value of the strandsPane ...</div><div class='long'><p>Sets the value of the <a href=\"#!/api/App.ui.SequenceThreader-property-strandsPane\" rel=\"App.ui.SequenceThreader-property-strandsPane\" class=\"docClass\">strandsPane</a></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>data</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-smartSelect' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.SequenceThreader'>App.ui.SequenceThreader</span><br/><a href='source/SequenceThreader.html#App-ui-SequenceThreader-method-smartSelect' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.SequenceThreader-method-smartSelect' class='name expandable'>smartSelect</a>( <span class='pre'>Object editor</span> )</div><div class='description'><div class='short'>inheritdocs App.ui.SequenceEditor#smartSplit ...</div><div class='long'><p>inheritdocs App.ui.SequenceEditor#smartSplit</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>editor</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-thread' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.ui.SequenceThreader'>App.ui.SequenceThreader</span><br/><a href='source/SequenceThreader.html#App-ui-SequenceThreader-method-thread' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.ui.SequenceThreader-method-thread' class='name expandable'>thread</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Intelligently selects strands and sequences and threads them to strands\nin the resultsPane ...</div><div class='long'><p>Intelligently selects strands and sequences and threads them to strands\nin the <a href=\"#!/api/App.ui.SequenceThreader-property-resultsPane\" rel=\"App.ui.SequenceThreader-property-resultsPane\" class=\"docClass\">resultsPane</a></p>\n</div></div></div></div></div></div></div>","allMixins":[],"uses":[],"members":{"event":[],"property":[{"meta":{},"owner":"App.ui.SequenceThreader","tagname":"property","name":"resultsPane","id":"property-resultsPane"},{"meta":{},"owner":"App.ui.SequenceThreader","tagname":"property","name":"sequencesPane","id":"property-sequencesPane"},{"meta":{},"owner":"App.ui.SequenceThreader","tagname":"property","name":"strandsPane","id":"property-strandsPane"}],"method":[{"meta":{},"owner":"App.ui.SequenceThreader","tagname":"method","name":"normalize","id":"method-normalize"},{"meta":{},"owner":"App.ui.SequenceThreader","tagname":"method","name":"setSequences","id":"method-setSequences"},{"meta":{},"owner":"App.ui.SequenceThreader","tagname":"method","name":"setStrands","id":"method-setStrands"},{"meta":{},"owner":"App.ui.SequenceThreader","tagname":"method","name":"smartSelect","id":"method-smartSelect"},{"meta":{},"owner":"App.ui.SequenceThreader","tagname":"method","name":"thread","id":"method-thread"}],"css_var":[],"cfg":[],"css_mixin":[]},"extends":"Ext.window.Window","inheritable":false,"private":false,"statics":{"event":[],"property":[],"method":[],"css_var":[],"cfg":[],"css_mixin":[]},"files":[{"href":"SequenceThreader.html#App-ui-SequenceThreader","filename":"SequenceThreader.js"}],"name":"App.ui.SequenceThreader","alternateClassNames":[],"singleton":false,"code_type":"ext_define","id":"class-App.ui.SequenceThreader","superclasses":[]});