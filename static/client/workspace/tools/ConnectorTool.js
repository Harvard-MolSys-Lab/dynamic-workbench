////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @class Workspace.tools.ConnectorTool
 * Draws curved connectors between objects
 * @extends Workspace.tools.BaseTool
 * @param {Object} workspace
 * @param {Object} config
 */
Ext.define('Workspace.tools.ConnectorTool', {
	
	/**
	 * @constructor
	 * @param {Workspace} workspace
	 * @param {Object} config
	 */
	constructor: function(workspace, config) {
		this.workspace = workspace;
		Ext.applyIf(this, config);
		Workspace.tools.ConnectorTool.superclass.constructor.call(this, workspace, config);

		if(!this.parameters) {
			this.parameters = {};
		}
		Ext.applyIf(this.parameters, App.Stylesheet.Draw);

		this.dragging = false;
		this.proto = false;
		this.x1 = 0;
		this.y1 = 0;
	},
	extend:'Workspace.tools.BaseTool',
	mixins: {
		highlightable: 'Workspace.tools.Highlightable'
	},
	/**
	 * @cfg {String} targetWType the wtype of the {@link Workspace.objects.Object} to create upon mouseup
	 */
	targetWType: 'Workspace.objects.Connection',
	/**
	 * @cfg {Boolean} showLabel true to show an editable label on created connections (defaults to true)
	 */
	showLabel: true,
	/**
	 * accept
	 * Determines whether the given item will be highlighted. This method calls {@link #acceptLeft} and {@link #acceptRight}
	 * to determine whether the proposed connection is valid.
	 * @param {Workspace.objects.Object} item
	 * @return {Boolean} valid
	 */
	accept: function(item) {
    	return (this.dragging) ? this.acceptRight(item) : this.acceptLeft(item);
    },
    
    /**
     * acceptLeft
     * Determines whether the given item is a valid target to begin a connection. Override to provide custom logic.
	 * @param {Workspace.objects.Object} item
	 * @return {Boolean} valid
     */
	acceptLeft: function(left) {
    	return true;
    },
    /**
     * acceptLeft
     * Determines whether the given item is a valid target to end a connection. Override to provide custom logic.
	 * @param {Workspace.objects.Object} item
	 * @return {Boolean} valid
     */
    acceptRight: function(right) {
    	return true;
    },
    /**
     * Called upon mouseup to determine whether the two items given can be connected. Override to provide custom logic.
     * @param {Workspace.objects.Object} left
     * @param {Workspace.objects.Object} right
     */
    canConnect: function(left,right) {
    	return true;
    },
    /**
     * Called upon item creation
     * @param {Workspace.objects.Connection} obj The newly created connection
     * @param {Workspace.objects.Object} left
     * @param {Workspace.objects.Object} right 
     */
    onConnect: function(obj,left,right) {
    	
    },
    click: function(e, item){
        e.stopEvent();
    },
    dblclick: function(e, item){

        e.stopEvent();
    },
    mousedown: function(e, item){
        if(this.acceptLeft(item)) {
	        this.dragging = true;
	        if (this.proto){
	            this.proto.remove();
	            delete this.proto;
	        }
			
	        this.createProto(e, item);
	        e.stopEvent();
        } else {
        	this.fireEvent('reject',item,this);
        	// if (this.proto){
	            // this.proto.remove();
	        // }
        }
    },
    mouseup: function(e, item){
    	if(this.dragging) {
	        this.dragging = false;
	
	        if (this.proto){
	
	            var p = this.getAdjustedXY(e);
	            if (item){
	                this.rightObject = item;
	            } else{
	                this.rightObject = Workspace.objects.Connection.getPoint(p.x, p.y);
	            }
	            
	            if(this.acceptRight(this.rightObject) && this.canConnect(this.leftObject,this.rightObject)) {
		            var o = this.workspace.createObject({
		            	wtype: this.targetWType,
		                leftObject: this.leftObject,
		                rightObject: this.rightObject
		                //path: [['M',this.x1,this.y1],['L',this.x2,this.y2]]
		            });
		            this.onConnect(o,this.leftObject,this.rightObject);
	            } else {
	            	this.fireEvent('reject',item,this);
	            } 
	            
	            delete this.leftObject;
	            delete this.rightObject;
	            
	            this.proto.remove();
	            delete this.proto;
	        }
	        e.stopEvent();
        }
    },
    mousemove: function(e, item){
        if (this.dragging){
            if (!this.proto){
                this.createProto(e);
            }

            var pos = this.getAdjustedXY(e), mouseRadius = 8, theta = Math.atan2(pos.y-this.y1,pos.x-this.x1);
            this.x2 = pos.x - Math.cos(theta)*mouseRadius;
            this.y2 = pos.y - Math.sin(theta)*mouseRadius;

            this.proto.attr({
                path: [['M', this.x1, this.y1], ['L', this.x2, this.y2]]
            });
        }
        e.stopEvent();
    },
    createProto: function(e, item){
        var p = this.getAdjustedXY(e);
        this.x1 = p.x;
        this.y1 = p.y;
        if (item){
            this.leftObject = item;
        } else{
            this.leftObject = Workspace.objects.Connection.getPoint(p.x, p.y);
        }

        this.proto = this.workspace.paper.path([['M', this.x1, this.y1]]);
        this.proto.attr(this.parameters);
    },

	// hack
	mouseover: function(e,item) {
		this.mixins.highlightable.mouseover.apply(this,arguments);
	},
	mouseout: function(e,item) {
		this.mixins.highlightable.mouseout.apply(this,arguments);
	}
}, function() {
	Workspace.Tools.register('connector', Workspace.tools.ConnectorTool);
});