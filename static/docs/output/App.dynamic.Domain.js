Ext.data.JsonP.App_dynamic_Domain({"mixins":[],"subclasses":[],"component":false,"html_meta":{},"requires":[],"tagname":"class","meta":{},"mixedInto":[],"aliases":{},"inheritdoc":null,"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/dynamic.html#App-dynamic-Domain' target='_blank'>dynamic.js</a></div></pre><div class='doc-contents'><p>Represents a domain, which is a collection of <a href=\"#!/api/App.dynamic.Segment\" rel=\"App.dynamic.Segment\" class=\"docClass\">App.dynamic.Segment</a>s\nwithin a <a href=\"#!/api/App.dynamic.Node\" rel=\"App.dynamic.Node\" class=\"docClass\">node</a> or {<a href=\"#!/api/App.dynamic.Motif\" rel=\"App.dynamic.Motif\" class=\"docClass\">App.dynamic.Motif</a> motif}.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-polarity' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.dynamic.Domain'>App.dynamic.Domain</span><br/><a href='source/dynamic.html#App-dynamic-Domain-property-polarity' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.dynamic.Domain-property-polarity' class='name not-expandable'>polarity</a><span> : Number</span></div><div class='description'><div class='short'>\n</div><div class='long'>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-getAbsolutePolarity' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.dynamic.Domain'>App.dynamic.Domain</span><br/><a href='source/dynamic.html#App-dynamic-Domain-method-getAbsolutePolarity' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.dynamic.Domain-method-getAbsolutePolarity' class='name expandable'>getAbsolutePolarity</a>( <span class='pre'></span> ) : Number</div><div class='description'><div class='short'>Returns the absolute polarity of this domain\nabsolute polarity = (domain relative polarity) * (strand relative polari...</div><div class='long'><p>Returns the absolute polarity of this domain\nabsolute polarity = (domain relative polarity) * (strand relative polarity) * (node polarity)</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Number</span><div class='sub-desc'><p>Abs. polarity</p>\n</div></li></ul></div></div></div><div id='method-getName' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.dynamic.Domain'>App.dynamic.Domain</span><br/><a href='source/dynamic.html#App-dynamic-Domain-method-getName' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.dynamic.Domain-method-getName' class='name expandable'>getName</a>( <span class='pre'></span> ) : String</div><div class='description'><div class='short'>Gets the name of the domain ...</div><div class='long'><p>Gets the name of the domain</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>String</span><div class='sub-desc'><p>name</p>\n</div></li></ul></div></div></div><div id='method-getNode' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.dynamic.Domain'>App.dynamic.Domain</span><br/><a href='source/dynamic.html#App-dynamic-Domain-method-getNode' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.dynamic.Domain-method-getNode' class='name expandable'>getNode</a>( <span class='pre'></span> ) : Node</div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Node</span><div class='sub-desc'><p>node The node which contains this domain.</p>\n</div></li></ul></div></div></div><div id='method-getPolarity' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.dynamic.Domain'>App.dynamic.Domain</span><br/><a href='source/dynamic.html#App-dynamic-Domain-method-getPolarity' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.dynamic.Domain-method-getPolarity' class='name expandable'>getPolarity</a>( <span class='pre'></span> )</div><div class='description'><div class='short'>Returns the relative polarity of this domain ...</div><div class='long'><p>Returns the relative polarity of this domain</p>\n</div></div></div><div id='method-getSegments' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.dynamic.Domain'>App.dynamic.Domain</span><br/><a href='source/dynamic.html#App-dynamic-Domain-method-getSegments' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.dynamic.Domain-method-getSegments' class='name expandable'>getSegments</a>( <span class='pre'></span> ) : <a href=\"#!/api/App.dynamic.Segment\" rel=\"App.dynamic.Segment\" class=\"docClass\">App.dynamic.Segment</a>[]</div><div class='description'><div class='short'>Retrieves the segments associated with this domain ...</div><div class='long'><p>Retrieves the segments associated with this domain</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/App.dynamic.Segment\" rel=\"App.dynamic.Segment\" class=\"docClass\">App.dynamic.Segment</a>[]</span><div class='sub-desc'><p>segments</p>\n</div></li></ul></div></div></div><div id='method-getStrand' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.dynamic.Domain'>App.dynamic.Domain</span><br/><a href='source/dynamic.html#App-dynamic-Domain-method-getStrand' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.dynamic.Domain-method-getStrand' class='name expandable'>getStrand</a>( <span class='pre'></span> ) : <a href=\"#!/api/App.dynamic.Strand\" rel=\"App.dynamic.Strand\" class=\"docClass\">App.dynamic.Strand</a></div><div class='description'><div class='short'>Retrieves the strand of which this domain is a part ...</div><div class='long'><p>Retrieves the strand of which this domain is a part</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/App.dynamic.Strand\" rel=\"App.dynamic.Strand\" class=\"docClass\">App.dynamic.Strand</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","allMixins":[],"uses":[],"members":{"event":[],"property":[{"meta":{},"owner":"App.dynamic.Domain","tagname":"property","name":"polarity","id":"property-polarity"}],"method":[{"meta":{},"owner":"App.dynamic.Domain","tagname":"method","name":"getAbsolutePolarity","id":"method-getAbsolutePolarity"},{"meta":{},"owner":"App.dynamic.Domain","tagname":"method","name":"getName","id":"method-getName"},{"meta":{},"owner":"App.dynamic.Domain","tagname":"method","name":"getNode","id":"method-getNode"},{"meta":{},"owner":"App.dynamic.Domain","tagname":"method","name":"getPolarity","id":"method-getPolarity"},{"meta":{},"owner":"App.dynamic.Domain","tagname":"method","name":"getSegments","id":"method-getSegments"},{"meta":{},"owner":"App.dynamic.Domain","tagname":"method","name":"getStrand","id":"method-getStrand"}],"css_var":[],"cfg":[],"css_mixin":[]},"extends":null,"inheritable":false,"private":false,"statics":{"event":[],"property":[],"method":[],"css_var":[],"cfg":[],"css_mixin":[]},"files":[{"href":"dynamic.html#App-dynamic-Domain","filename":"dynamic.js"}],"name":"App.dynamic.Domain","alternateClassNames":[],"singleton":false,"code_type":"function","id":"class-App.dynamic.Domain","superclasses":[]});