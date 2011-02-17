

////////////////////////////////////////////////////////////////////////////////////////////////

var Workspace = function(element, config) {
	this.superclass.constructor.call(this);

	Ext.apply(this,config,{
		id: App.nextId,
		// selectionManager: new WorkspaceSelectionManager({workspace: this}),
		element: document.body,
		tools: ['pointer']
	});
	
	this.element = element;
	this.paper = Raphael(this.element.id);
	// this.selectionManager.workspace = this;
	this.objects = new Ext.util.MixedCollection();
	this.selection = new Ext.util.MixedCollection();
	
	// Set up tools
	this.activeTool = 'pointer';
	var tools = {}, tool=0;
	for(var i=0,l=this.tools.length; i<l; i++) {
		tool = this.tools[i]
		tools[tool] = App.getNewTool(tool,this);
	} 
	this.tools = tools;
	
	// Set up events to pass to tools
	this.addEvents('click','dblclick','mousedown','mouseup','mousemove','select','unselect');
	this.element.on('click', this.click, this, false);
	this.element.on('dblclick', this.dblclick, this, false);
	this.element.on('mousedown', this.mousedown, this, false);
	this.element.on('mouseup', this.mouseup, this, false);
	this.element.on('mousemove', this.mousemove, this, false);
};

Ext.extend(Workspace, Ext.util.Observable, {
	
	// Object/item management
	register: function(item) {
		if(item.id) {
			this.objects.add(item.id,item);	
		} else {
			var id = App.nextId();
			item.id = id;
			this.objects.add(id,item);
		}
		return item.id;
	},
	unregister: function(id) {
		this.objects.remove(id);
	},
	
	serialize: function() {
		var obj = {};
		var field, val;
		for(field in this.objects) {
			if(Ext.type(this[field]) == 'function') {
				if(Ext.type(field.serialize) == 'function') {
					val = field.serialize();
				}	
			} else {
				val = this[field];
			}
		}	
	},
	
	createObject: function(objectClass,config) {
		if(Ext.type(objectClass)=='function') {
			var obj = new objectClass(this, config);
		}	
	},
	
	deleteObjects: function(objects) {
		if(Ext.isArray(objects)) {
			for(var i=0,l=object.length; i<l; i++) {
				this.unselect(objects[i]);
				objects[i].destroy();
				this.unregister(objects[i].getId());
			}
		} else {
			this.unselect(objects[i]);
			objects.destroy();
			this.unregister(objects.getId());	
		}
	},
	
	// Selection
	'select': function(items) {
		if(Ext.type(items)=='array') {
			var selection = this.selection;
			Ext.each(items,function(item) {
				if(item.isSelectable) {
					selection.add(item.getId(),item);
					item.setState('selected',true);
					item.fireEvent('select',item);
					this.fireEvent('select',item);
				}
			},this);
		} else if(Ext.isFunction(items.getId)) {
			var item = items;
			if(item.isSelectable) {
				this.selection.add(item.getId(), item);
				item.setState('selected',true);
				item.fireEvent('select',item);
				this.fireEvent('select',item);
			}
		}
		
		// this.selectionManager.select(item);
	},
	unselect: function(items) {
		if(items) {
			if(Ext.type(items)=='array') {
				var selection = this.selection;
				Ext.each(items,function(item) {
					selection.remove(item.getId());
					item.setState('selected',false);
					item.fireEvent('unselect',item);
					this.fireEvent('unselect',item);
				},this);
			} else if(Ext.isFunction(items.getId)) {
				var item = items;
				this.selection.remove(item.getId());
				item.setState('selected',false);
				item.fireEvent('unselect',item);
				this.fireEvent('unselect',item);
			}
		} else {
			this.selection.each(function(item) { 
				item.setState('selected',false); 
				item.fireEvent('unselect',item); 
				this.fireEvent('unselect',item); 
			},this);
			this.selection.clear();	
		}
		
		// this.selectionManager.unselect(item);
	},
	deselect: function(item) {
		this.unselect(item);	
	},
	hasSelection: function() {
		var i = this.selection.getCount();
		return (i>0);
	},
	getSelection: function() {
		return this.selection.getRange();
	},
	
	// Tools and events
	getActiveTool: function() {
		return this.tools[this.activeTool];	
	},
	
	setActiveTool: function(tool) {
		this.getActiveTool().deactivate();
		this.activeTool = tool;	
		this.getActiveTool().activate();
	},
	
	click: function(e, item) {
		this.getActiveTool().click(e,(item.getId ? item : false));
	},
	
	dblclick: function(e, item) {
		this.getActiveTool().dblclick(e,(item.getId ? item : false));
	},
	
	mousedown: function(e, item) {
		this.getActiveTool().mousedown(e,(item.getId ? item : false));
	},
	
	mouseup: function(e, item) {
		this.getActiveTool().mouseup(e,(item.getId ? item : false));
	},
	
	mousemove: function(e, item) {
		this.fireEvent('mousemove',e,(item.getId ? item : false));
		this.getActiveTool().mousemove(e,(item.getId ? item : false));
	},
	
	// Elements
	addElement: function(spec) {
		return Ext.DomHelper.append(this.element,spec);	
	}
	
});



