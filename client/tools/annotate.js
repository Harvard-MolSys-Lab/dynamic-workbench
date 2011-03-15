/***********************************************************************************************
 * InfoMachine
 * 
 * 
 * Copyright (c) 2010-2011 Casey Grun
 * 
 ***********************************************************************************************
 * ~/client/tools/annotate.js
 * 
 * Defines subclasses of {Workspace.tool.BaseTool} which allow the user to insert and edit text-
 * based objects (e.g. rich text boxes, mathematical equations)
 ***********************************************************************************************/


////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.TextTool
 * Builds {@link Workspace.RichTextObject}s
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.TextTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {
        parameters: {}
    });
    Workspace.tool.TextTool.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.parameters, {
        fill: '#fff',
        stroke: '#000'
    });

    this.dragging = false;
    this.proto = false;
    this.x1 = 0;
    this.y1 = 0;
};

Ext.extend(Workspace.tool.TextTool, Workspace.tool.BaseTool, {
    minWidth: 75,
    maxWidth: false,
    minHeight: 20,
    maxHeight: false,
    click: function(e, item){
        if (item && item.wtype == 'Workspace.RichTextObject'){
            if (this._item){
                this.workspace.deleteObjects(this._item);
                delete this._item;
            }
            this.workspace.edit(item);
            return false;
        }
        e.stopEvent();
    },
    dblclick: function(e, item){

        e.stopEvent();
    },
    mousedown: function(e, item){
        this.dragging = true;
        if (this.proto){
            this.proto.remove();
            this.proto = false;
        }

        e.stopEvent();
    },
    mouseup: function(e, item){
        this.dragging = false;

        if (this.proto){

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x;
            this.y2 = pos.y;
            var attr = Workspace.tool.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

            this._item = this.workspace.createObject(Workspace.RichTextObject, {
                x: attr.x,
                y: attr.y,
                width: Workspace.Utils.bounds(attr.width, this.minWidth, this.maxWidth),
                height: Workspace.Utils.bounds(attr.height, this.minHeight, this.maxHeight)
            });
            this.proto.remove();
            this.workspace.edit(this._item);
        }
        e.stopEvent();
    },
    mousemove: function(e, item){
        if (this.dragging){
            if (!this.proto){
                this.createProto(e);
            }

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x;
            this.y2 = pos.y;
            var attr = Workspace.tool.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

            this.x = attr.x;
            this.y = attr.y;
            this.width = attr.width;
            this.height = attr.height;
            this.anchor = attr.anchor;
            delete attr.anchor;

            this.proto.attr(attr);
            e.stopEvent();
        }
    },
    createProto: function(e){
        var pos = this.getAdjustedXY(e);
        this.x1 = pos.x;
        this.y1 = pos.y;

        this.proto = this.workspace.paper.rect(this.x1, this.y1, 0, 0);
        this.proto.attr(this.parameters);
    },
    deactivate: function(){
        if (this.proto){
            this.proto.remove();
            this.proto = false;
        }
        this._item = false;
    }
});

Workspace.Tools.register('textbox', Workspace.tool.TextTool);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.MathTool
 * Builds {@link MathEquationObject}s
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.MathTool = function(workspace, config){
    this.workspace = workspace;
    Ext.apply(this, config, {
        parameters: {}
    });
    Workspace.tool.MathTool.superclass.constructor.call(this, workspace, config);

    Ext.apply(this.parameters, {
        fill: '#fff',
        stroke: '#000'
    });

    this.dragging = false;
    this.proto = false;
    this.x1 = 0;
    this.y1 = 0;
};

Ext.extend(Workspace.tool.MathTool, Workspace.tool.BaseTool, {
    minWidth: 75,
    maxWidth: false,
    minHeight: 30,
    maxHeight: false,
    click: function(e, item){
        if (item && item.wtype == 'MathEquationObject'){
            this.workspace.edit(item);
        }
        e.stopEvent();
    },
    dblclick: function(e, item){

        e.stopEvent();
    },
    mousedown: function(e, item){
        this.dragging = true;
        if (this.proto){
            this.proto.remove();
            this.proto = false;
        }

        e.stopEvent();
    },
    mouseup: function(e, item){
        this.dragging = false;

        if (this.proto){

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x;
            this.y2 = pos.y;
            var attr = Workspace.tool.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

            var obj = this.workspace.createObject(Workspace.MathEquationObject, {
                x: attr.x,
                y: attr.y,
                width: Workspace.Utils.bounds(attr.width, this.minWidth, this.maxWidth),
                height: Workspace.Utils.bounds(attr.height, this.minHeight, this.maxHeight)
            })

            this.proto.remove();
            this.workspace.edit(obj);
        }
        e.stopEvent();
    },
    mousemove: function(e, item){
        if (this.dragging){
            if (!this.proto){
                this.createProto(e);
            }

            var pos = this.getAdjustedXY(e);
            this.x2 = pos.x;
            this.y2 = pos.y;
            var attr = Workspace.tool.SelectorBand.calculateBandBox(this.x1, this.y1, this.x2, this.y2);

            this.x = attr.x;
            this.y = attr.y;
            this.width = attr.width;
            this.height = attr.height;
            this.anchor = attr.anchor;
            delete attr.anchor;

            this.proto.attr(attr);
            e.stopEvent();
        }
    },
    createProto: function(e){
        var pos = this.getAdjustedXY(e);
        this.x1 = pos.x;
        this.y1 = pos.y;

        this.proto = this.workspace.paper.rect(this.x1, this.y1, 0, 0);
        this.proto.attr(this.parameters);
    },
    deactivate: function(){
        if (this.proto){
            this.proto.remove();
            this.proto = false;
        }
    }
});

Workspace.Tools.register('math', Workspace.tool.MathTool);


////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.AlohaTool
 * Allows {@link Workspace.RichTextObject}s to be edited using the Aloha HTML5 editor.
 * Node: Workspace.tool.AlohaTool and Workspace.tool.MathQuillTool are a special subset of tools called 'editor tools'. A separate
 * subclass is forthcoming, but essentially they have two extra methods, attach and detach, which are
 * used to link and delink them to single, specific objects (ie: rich text boxes, math equations).
 * @extends Workspace.tool.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.AlohaTool = function(workspace, config){
    Workspace.tool.AlohaTool.superclass.constructor.call(this, workspace, config);
};

Ext.extend(Workspace.tool.AlohaTool, Workspace.tool.BaseTool, {
    click: function(e, item){

        },
    dblclick: function(e, item){

        },
    mousedown: function(e, item){

        },
    mouseup: function(e, item){

        },
    mousemove: function(e, item){

        },
    /**
   * attach
   * Assosciates the editor with the passed object
   * @param {Workspace.Object} item
   */
    attach: function(item){
        if (item.element){
            // save reference to the attached item and the Aloha.Editable object
            this.item = item;
            this.editable = new GENTICS.Aloha.Editable($(Ext.fly(item.element).dom).attr('contentEditable', false));
            //this.editable = new GENTICS.Aloha.Editable($(Ext.fly(item.element).dom));
            // watch for the user to click outside the aloha element
            var tool = this;
            // because fucking aloha doesn't have a real event binding system
            this.endEditFunction = function(){
                tool.workspace.endEdit();
            };
            $(this.editable).bind('editableDeactivated', this.endEditFunction);

            // activate this editable
            this.editable.enable();
            this.editable.activate();
            // this.editable.focus();
        }
    },
    /**
   * detach
   * called before the editor is dissociated from the passed object
   */
    detach: function(){
        if (this.item){
            $(Ext.fly(this.item.element).dom).attr('contentEditable', false);
            if (this.endEditFunction){
                // unbind the function watching for blur
                $(this.editable).unbind('editableDeactivated', this.endEditFunction);
                this.endEditFunction = false;
            }
            if (this.editable){
                this.editable.disable();
                this.editable.destroy();
                this.editable = false;
            }

            // rebuild events because somehow between aloha and contentEditable they usually get clobbered
            if (this.item.buildEvents){
                this.item.buildEvents();
            }

            this.item.set('text', this.item.getEl().dom.innerHTML);
            this.item = false;
        }
    },
    activate: function(){
        Workspace.tool.AlohaTool.superclass.activate.call(this);
    },
    deactivate: function(){
        Workspace.tool.AlohaTool.superclass.deactivate.call(this);
        this.detach();
    }
});

Workspace.Tools.register('aloha', Workspace.tool.AlohaTool);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tool.MathQuillTool
 * Allows LaTeX equations to be edited inline with MathQuill
 * @extends WorkspceTool
 * @param {Object} workspace
 * @param {Object} config
 */
Workspace.tool.MathQuillTool = function(workspace, config){
    Workspace.tool.MathQuillTool.superclass.constructor.call(this, workspace, config);
};

Ext.extend(Workspace.tool.MathQuillTool, Workspace.tool.BaseTool, {
    click: function(e, item){

        },
    dblclick: function(e, item){
        if (!item || (item && item.getId && item.getId() != this.item.getId())){
            this.workspace.endEdit();
        }
    },
    mousedown: function(e, item){

        },
    mouseup: function(e, item){

        },
    mousemove: function(e, item){

        },
    attach: function(item){
        if (item.element){
            // save reference to the attached item and the Aloha.Editable object
            this.item = item;
            this.item.activate();
        }
    },
    detach: function(){
        if (this.item){
            this.item.deactivate();

            // rebuild events because somehow between aloha and contentEditable they usually get clobbered
            if (this.item.buildEvents){
                this.item.buildEvents();
            }
            this.item = false;
        }
    },
    activate: function(){
        Workspace.tool.MathQuillTool.superclass.activate.call(this);
    },
    deactivate: function(){
        Workspace.tool.MathQuillTool.superclass.deactivate.call(this);
        this.detach();
    }
});

Workspace.Tools.register('mathquill', Workspace.tool.MathQuillTool);