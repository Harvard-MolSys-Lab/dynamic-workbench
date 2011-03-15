/***********************************************************************************************
 * InfoMachine
 *
 *
 * Copyright (c) 2010 Casey Grun
 *
 ***********************************************************************************************
 * ~/client/objects/vector.js
 *
 * Defines {Workspace.Object} subclasses intended to provide semantic meaning (e.g. Ideas,
 * connections, etc.)
 ***********************************************************************************************/

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.IdeaObject
 * Represents an idea which groups various child objects together
 * @extends Workspace.VectorRectObject
 */
Workspace.IdeaObject = function(workspace, config) {
    Workspace.IdeaObject.superclass.constructor.apply(this, arguments);

    // automatically set the fill to a nice random pastel color
	if(this.autoFill) {
    	this.set('fill', Workspace.Utils.ideaColor());
	}
	
	this.shimConfig = this.shimConfig || {};
	Ext.applyIf(this.shimConfig,{
        property: 'name'
	});
	
    // set up the label editor
    this.addShim(new Workspace.Label(this.shimConfig));

    this._children = this.children;
    this.children = new Ext.util.MixedCollection();
    this.initLayout(this.layout); //new Workspace.idea.FreeLayout({idea: this});

    this.expose('children', true, false, true, false);
    this.expose('layout', function() {
        return this.layout.ltype
    }, function(ltype) {
        this.initLayout(ltype)
    }, true, false);
};
Ext.extend(Workspace.IdeaObject, Workspace.VectorRectObject, {
    wtype: 'Workspace.IdeaObject',
    layout: 'Workspace.idea.FreeLayout',
    name: 'New Idea',
    iconCls: 'idea',
    r: 5,
    stroke: '#CCC',
    padding: 50,
    autoFill: true,
    destroyChildren: false,
    
    render: function() {
        Workspace.IdeaObject.superclass.render.apply(this, arguments);
        //this.updateSize(false, false);
        this.layout.doFirstLayout();
        this.toBack();
    },
    initialize: function() {
        Workspace.IdeaObject.superclass.initialize.apply(this, arguments);
        this.buildChildren();
    },
    initLayout: function(ltype) {
        this.layout = Workspace.Layouts.create(ltype,{idea: this});
        if(this.is('rendered')) {
            this.layout.doFirstLayout();
        }
    },
    /**
     * buildChildren
     * Realizes child objects passed to constructor. Automatically invoked by initialize
     * @private
     */
    buildChildren: function() {
        var children = this._children;
        if (Ext.isArray(children)) {
            Ext.each(children, function(child) {
                this.addChild(Workspace.Components.realize(child));
            },
            this)
        } else if (Ext.isObject(children)) {
            var child;
            for (var id in children) {
                child = children[id];
                this.addChild(Workspace.Components.realize(child))
            }
        }
    },
    /**
     * addChild
     * Adds a child to this idea
     * @param {Workspace.Object} child
     */
    addChild: function(child) {
        this.children.add(child);
        child.setParent(this);
        child.on('move', this.adjustSize, this);
        child.on('resize', this.adjustSize, this);
        if(child.is('rendered')) { this.adjustSize(); }
    },
    /**
     * adopt
     * Alias for {@link #addChild}
     */
    adopt: function() {
        this.addChild.apply(this, arguments);
    },
    /**
     * removeChild
     * Removes a child from this idea
     * @param {Workspace.Object} child
     */
    removeChild: function(child) {
        this.children.remove(child);//.getId());
        child.un('move', this.adjustSize, this);
        child.un('resize', this.adjustSize, this);
        this.adjustSize();
    },
    /**
     * adjustSize
     * invoked automatically when children are moved or resized
     * @private
     */
    adjustSize: function() {
    	if(this.is('rendered')) {
	        if (!this.ignoreTranslateChildren) {
	            this.updateSize(true, false);
	        }
        }
    },
    /**
     * updateSize
     * Recalculates this object's position and dimensions so that it is sized to contain all child objects
     * @param {Boolean} union (Optional) true to apply Workspace.Components.boxUnion to this idea's current box (only allowing the box to be expanded) (Defaults to true)
     * @param {Boolean} applyToChildren (Optional) true to apply changes in position to child objects (Defaults to true)
     */
    updateSize: function(union, applyToChildren) {
    	this.ignoreTranslateChildren = true;
        this.layout.doLayout(applyToChildren);
        this.ignoreTranslateChildren = false;
        // union = (union !== false);
        // applyToChildren = (applyToChildren !== false);
        // var attr = this.attributes(),
        // box = Workspace.Utils.getBox(this.children.getRange());
        // box = Workspace.Utils.padBox(box, this.padding);
        // if (union)
        // box = Workspace.Utils.boxUnion(box, this.getBox())
        // this.setBox(box, applyToChildren);
        // //!union);
    },
    childCanMove: function(child) {
        return this.layout.childrenMovable;
    },
    destroy: function() {
    	if(this.destroyChildren) {
    		this.workspace.deleteObjects(this.children.getRange());
    	}
    	this.layout.destroy();
    	Workspace.IdeaObject.superclass.destroy.apply(this,arguments);
    }
});

Workspace.reg('Workspace.IdeaObject', Workspace.IdeaObject);

Ext.ns('Workspace.idea');

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.idea.BaseLayout
 * Calculates position of the children of a {@link Workspace.IdeaObject}
 * @abstract
 * @extends Ext.util.Observable
 */
Workspace.idea.BaseLayout = function(config) {
    Workspace.idea.BaseLayout.superclass.constructor.apply(this,arguments);
    Ext.apply(this,config);
    this.defaultChildConfig = {
        wtype: this.defaultChildType,
        width: 100, height: 100
    };
}
Ext.extend(Workspace.idea.BaseLayout,Ext.util.Observable,{
    resizable: true,
    childrenResizable: true,
    childrenMovable: true,
    defaultChildType: 'Workspace.RichTextObject',
    doLayout: function() {

    },
    doFirstLayout: function() {

    },
    addNextChild: function() {
        this.idea.addChild(this.idea.workspace.createChild(this.defaultChildConfig))
    },
    destroy: function() {
    	this.fireEvent('destroy',this);
    	delete this.idea;
    },
});

/**
 * @class Workspace.idea.FreeLayout
 * Allows arbitrary arrangement of children within
 * @abstract
 * @extends Workspace.idea.BaseLayout
 */
Workspace.idea.FreeLayout = function(config) {
    Workspace.idea.FreeLayout.superclass.constructor.apply(this,arguments);
}
Ext.extend(Workspace.idea.FreeLayout,Workspace.idea.BaseLayout,{
    doLayout: function(applyToChildren) {
        var union = false; //(union !== false);
        applyToChildren = (applyToChildren !== false);
        box = Workspace.Utils.getBox(this.idea.children.getRange());
        box = Workspace.Utils.padBox(box, this.idea.padding);
        if (union)
            box = Workspace.Utils.boxUnion(box, this.idea.getBox())
        this.idea.setBox(box, applyToChildren);
    },
    doFirstLayout: function() {
        var union = false, applyToChildren = false;
        box = Workspace.Utils.getBox(this.idea.children.getRange());
        box = Workspace.Utils.padBox(box, this.idea.padding);
        if (union)
            box = Workspace.Utils.boxUnion(box, this.idea.getBox())
        this.idea.setBox(box, applyToChildren);
    },
    /*
     addNextChild: function() {

     }*/
});

Workspace.Layouts.register('Workspace.idea.FreeLayout',Workspace.idea.FreeLayout);

/**
 * @class Workspace.idea.VListLayout
 * Orders items in a vertical list
 * @abstract
 * @extends Workspace.idea.FreeLayout
 */
Workspace.idea.VListLayout = function(config) {
    Workspace.idea.VListLayout.superclass.constructor.apply(this,arguments);
}
Ext.extend(Workspace.idea.VListLayout,Workspace.idea.FreeLayout,{
    doLayout: function(applyToChildren) {
        Workspace.idea.VListLayout.superclass.doLayout.apply(this,arguments);
    },
    doFirstLayout: function() {
        var width, w, h, f;
        this.idea.children.sort('ASC', function(a,b) {
            w = a.get('width');
            width = (w > width ? w : width);
            return a.get('y') - b.get('y');
        });
        f = this.idea.children.first();
        if(f) {
            h = f.get('y');
        }
        this.idea.children.each( function(a) {
            a.set('width',width);
            a.set('y',h);
            h+=a.get('height');
        });
        Workspace.idea.VListLayout.superclass.doFirstLayout.apply(this,arguments);
    },
    /*
     addNextChild: function() {

     }*/
});

Workspace.Layouts.register('Workspace.idea.VListLayout',Workspace.idea.VListLayout);

////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.ConnectionObject
 * Represents a workspace object connecting two other {@link Workspace.Object}s together
 * @extends Workspace.VectorObject
 */
Workspace.ConnectionObject = function() {
    Workspace.ConnectionObject.superclass.constructor.apply(this, arguments);
    /**
     * @cfg {Workspace.Object} leftObject
     * The first object to connect
     */
    this.expose('leftObject', true, true, true, false);
    /**
     * @cfg {Workspace.Object} rightObject
     * The second object to connect
     */
    this.expose('rightObject', true, true, true, false);
    
    /**
     * @cfg {String} property
     * The property of leftObject to monitor
     */
    this.expose('property',true,true,true,false);
    
    if(this.showLabel) {
	    // set up the label editor
	    this.addShim(new Workspace.ConnectionLabel({
	        property: 'name'
	    }));
    }
}
Ext.extend(Workspace.ConnectionObject, Workspace.VectorObject, {
    shape: 'path',
    isMovable: false,
    name: 'New Connection',
    iconCls: 'connector',
    wtype: 'Workspace.ConnectionObject',
    fillOpacity: 0.1,
    showLabel: true,
    property: false,
    initialize: function() {
        if (this.leftObject.id) {
            this.set('leftObject', Workspace.Components.realize(this.leftObject));
        } else {
            this.leftObject = Workspace.ConnectionObject.getPoint(this.leftObject.x,this.leftObject.y);
        }
        if (this.rightObject.id) {
            this.set('rightObject', Workspace.Components.realize(this.rightObject));
        } else {
            this.rightObject = Workspace.ConnectionObject.getPoint(this.rightObject.x,this.rightObject.y);
        }
        if(this.property) {
        	this.updateProperty();
        }
    },
    unBindObject: function(old) {
    	old.un('move',this.onObjectMove,this);
		old.un('hide', this.hide, this);
        old.un('show', this.show, this);
        old.un('destroy', this.destruct, this);    	
    },
    reBindObject: function(o,old) {
    	this.unBindObject(old);
    	this.bindObject(o);
    	this.updateProperty();
   	},
   	bindObject: function(o) { 	
        o.on('move',this.onObjectMove,this);
		o.on('hide', this.hide, this);
        o.on('show', this.show, this);
        o.on('destroy', this.destruct, this);
    },
    updateProperty: function() {
    	var left = this.get('leftObject');
    	if(left && left.set) {
    		left.set(this.property,this.rightObject);
    	}
    },
    canConnect: function(left,right) {
    	return true;
    },
    acceptLeft: function(left) {
    	return true;
    },
    acceptRight: function(right) {
    	return true;
    },
    render: function() {
        var o1 = this.get('leftObject');
        var o2 = this.get('rightObject');
        
        // watch for object movement, showing/hiding, and destroying
    	this.bindObject(o1);
    	this.bindObject(o2);
    	
    	// watch for left and right object to be changed so we can re-attach those events
        this.on('change_leftObject',this.reBindObject,this);
    	this.on('change_rightObject',this.reBindObject,this);
    	
        this.arguments = [this.buildPath(o1, o2)];
        Workspace.ConnectionObject.superclass.render.apply(this, arguments);
    },
    getHighlightProxy: function() {
        return new Workspace.Proxy(Ext.applyIf({
            path: this.path,
            shape: this.shape,
            strokeWidth: this.strokeWidth + App.Stylesheet.Highlight.strokeWidth,
            workspace: this.workspace,
        },App.Stylesheet.Highlight));
    },
    updateHighlightProxy: function() {
        if(this.highlightProxy)
            this.highlightProxy.path = this.path;
    },
    /**
     * onObjectMove
     * Rebuilds the path
     * @private
     */
    onObjectMove: function() {
        this.rebuildPath();
    },
    applyPath: function(path) {
    	this.path = path;
    	this.vectorElement.attr({
            path: path
        });
        this.updateHighlightProxy();
    },
    /**
     * rebuildPath
     * Calculates the path between the two configured objects and recalculates this object's layout
     */
    rebuildPath: function() {
        this.applyPath(this.buildPath(this.get('leftObject'), this.get('rightObject')));
        var box = this.vectorElement.getBBox();
        this.set('x', box.x);
        this.set('y', box.y);
        this.set('height', box.height);
        this.set('width', box.width);
    },
    /**
     * buildPath
     * Calculates a path betwen two objects
     * Adapted from http://raphaeljs.com/graffle.html
     * @param {Object} obj1
     * @param {Object} obj2
     */
    buildPath: function(obj1, obj2) {
        var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{
            x: bb1.x + bb1.width / 2,
            y: bb1.y - 1
        },
        {
            x: bb1.x + bb1.width / 2,
            y: bb1.y + bb1.height + 1
        },
        {
            x: bb1.x - 1,
            y: bb1.y + bb1.height / 2
        },
        {
            x: bb1.x + bb1.width + 1,
            y: bb1.y + bb1.height / 2
        },
        {
            x: bb2.x + bb2.width / 2,
            y: bb2.y - 1
        },
        {
            x: bb2.x + bb2.width / 2,
            y: bb2.y + bb2.height + 1
        },
        {
            x: bb2.x - 1,
            y: bb2.y + bb2.height / 2
        },
        {
            x: bb2.x + bb2.width + 1,
            y: bb2.y + bb2.height / 2
        }],
        d = {},
        dis = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 4; j < 8; j++) {
                var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
                if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                    dis.push(dx + dy);
                    d[dis[dis.length - 1]] = [i, j];
                }
            }
        }
        if (dis.length == 0) {
            var res = [0, 4];
        } else {
            res = d[Math.min.apply(Math, dis)];
        }
        var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
        dx = Math.max(Math.abs(x1 - x4) / 2, 10);
        dy = Math.max(Math.abs(y1 - y4) / 2, 10);
        var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
        var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)];
        //.join(",");
        return path;
    },
    getLeftPoint: function() {
    	var path = this.path,
    		point = [parseInt(path[1]),parseInt(path[2])];
    	return point;
    },
    getRightPoint: function() {
    	var path = this.path,
    		point = [parseInt(path[path.length-2]),parseInt(path[path.length-1])];
    	return point;
    },
    destruct: function() {
    	this.workspace.deleteObjects([this]);
    },
    destroy: function() {
    	this.unBindObject(this.get('leftObject'));
    	this.unBindObject(this.get('rightObject'));
    	Workspace.ConnectionObject.superclass.destroy.apply(this,arguments);
    }
});

Ext.apply(Workspace.ConnectionObject, {
    /**
     * getPoint
     * Gets an imitation Workspace.Object suitable *only* to be passed to a Workspace.ConnectionObject as one of its anchors.
     * @static
     * @param {Object} x
     * @param {Object} y
     */
    getPoint: function(x, y) {
        return{
            x: x,
            y: y,
            width: 0,
            height: 0,
            getBBox: function() {
                return this;
            },
            on: function() {
            },
            un: function() {
            },
            get: function() {},
            set: function() {},
        }
    },
});

Workspace.reg('Workspace.ConnectionObject', Workspace.ConnectionObject);
