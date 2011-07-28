/*
Copyright(c) 2011 Company Name
*/
var express=require("express"),app=express.createServer(),fm=require("./file-manager"),tools=require("./server-tools");app.configure(function(){app.set("views",__dirname+"/views");app.set("baseRoute","/");app.use(express.bodyParser());app.use(express["static"](__dirname+"/static"));fm.configure(app,express);tools.configure(app,express)});app.listen(3000);console.log("Server running from "+__dirname+" at http://192.168.56.10:3000");
