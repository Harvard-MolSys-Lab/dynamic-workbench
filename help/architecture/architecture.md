% DyNAMiC Workbench Architecture
% Casey Grun

Overview
========

## Introduction

This document describes the application architecture for the DyNAMiC Workbench IDE. The purpose of this document is to provide a high-level overview of the components which comprise the Workbench software client and server---and to explain how those components relate to one another---for a prospective developer/maintainer of the software. This does _not_ attempt to document the application programming interface (API) for components of the software; API documentation is provided separately. Likewise, this is not "Help" documentation for a user; that is also provided elsewhere. Some basic familiarity with DNA nanotechnology and the functions of the Workbench software is presumed, but this document primarily describes components from a software perspective---that is, it explains their function in relation to other software components and to the larger system architecture, rather than their specific utility to a DNA nanotechnologist.

## Relevant technologies

The Workbench application is written primarily in [Javascript](https://developer.mozilla.org/en-US/docs/JavaScript); this includes both the client and the server. Client-side Javascript is executed by a web browser. Server-side Javascript is executed by [Node.js](http://nodejs.org/)---a platform which provides Chrome's V8 Javascript engine with networking and file I/O capabilities. Client-side code uses [HTML5](http://www.w3.org/html/wg/drafts/html/master/), [CSS](http://www.w3.org/Style/CSS/Overview.en.html), and [SVG](http://www.w3.org/Graphics/SVG/) to provide a graphical interface, and Javascript to provide interactivity and networking (e.g. for communication with the server).  [JSON](http://json.org/) is used extensively for communication between the client and the server. Server-side code uses Javascript for networking and file I/O. Computationally-intensive utilities are written in various languages, including Python and C. The server uses a MongoDB non-relational database for storing user login information. A variant of [Markdown](http://daringfireball.net/projects/markdown/) is used for documentation; [Pandoc](http://johnmacfarlane.net/pandoc/) is used to parse and generate this documentation, as well as user-facing Help documents. Documentation within the code is parsed by [JSDuck](https://github.com/senchalabs/jsduck).

## Client-Server architecture

The Workbench server has two main parts:

-	The *server* manages computationally intensive tasks and user files, and serves application code to the client. The server includes:
	-	*Server tools* - set of low-level computational utilities (for instance, sequence designers, behavioral designers, thermodynamic simulators, etc.). These server tools execute *computational tasks*.
	-	*Services* - a set of components which respond to specific user interactions (for instance, requesting creation or modification of files, execution of a computational task, etc.). Each Realtime service may respond to "normal" requests via HTTP, or to events raised via WebSockets. 
		-	*File service* - provides access to user files
		-	*Task service* - initiates and manages computational tasks
	-	*Web server* - the server also serves application code and static resources (such as images and CSS files) to the client. 
-	The *client* provides a rich, graphical interface with which the user can interact through their web browser. The client includes:
	-	*Core services* and *Core components* - a set of shared functionality and interface components for interacting with the server (e.g. for managing files and starting computational tasks)
	-	*Client-side applications* - a number of rich interfaces for interacting with specific types of files and for performing computational tasks. Examples of application include: the Nodal system editor, the Web Domain Designer (DD), and the Sequence editor.

Additionally, there are several libraries which are shared between the client and the server:

-	DNA-utils (`dna-utils.js`) - Provides facilities for working with DNA sequences and systems (e.g. complementation, parsing, etc.)
-	DyNAMiC (`dynamic.js`) - Provides access to the data structures and algorithms of the nodal behavioral compiler
-	DD (`dd.js`) - The Javascript version of Dave Zhang's Domain Design package

## Javascript Basics

A very cursory overview of the Javascript language is provided in this section. The reader completely unfamiliar with Javascript is referred to the Mozilla Developer Network's [Javascript Guide](https://developer.mozilla.org/en-US/docs/JavaScript/Guide), which provides a thorough tutorial for beginners. [Javascript Garden](http://bonsaiden.github.io/JavaScript-Garden/) provides "documentation about the most quirky parts of the JavaScript programming language," including prototypal inheritance, function scope and closures, array iteration, and types/casting.

Javascript is a dynamically-typed, mixed-paradigm language with imperative, object-oriented, and functional aspects. In modern engines, Javascript code is JIT-compiled, rather than interpreted. Memory is automatically garbage-collected. 

### Syntax

Javascript syntax is in many ways similar to C; some key differences:

-	Variables are declared with the `var` keyword instead of a type (e.g. `var foo;` instead of `int foo;`); no keyword is used before function parameters
-	Functions are declared using the `function` keyword, rather than a type; for example: `function foo(bar, baz) { ... }`
-	Anonymous functions may also be declared using the function keywork, for instance `function() { ... }`
-	Arrays can be declared using square brackets, e.g. `var list = [1, 2, 3, ...];`. Array elements can be accessed as in C (`list[0] = 1;`).
-	"Objects," which are really key-value mappings resembling hash tables, can be defined using curly braces, e.g. `var obj = {a: 1, b:2, ...};`. Values of objects can be accessed either using a dot notation like C `struct`s (e.g. `obj.a = 1;`) or using an array-like notation (e.g. `obj['a'] = 1;`---note the quotes enclosing the attribute name).
-	Single and double-quotes can be used interchangeably, but must be paired. 

### Functional programming

-	Functions are first-class objects in Javascript and may be assigned to variables. 
-	When functions are defined, a _closure_ is created which allows variables in the scope enclosing the function definition to be accessed from within the function.
-	Javascript arrays in modern engines contain several functional programming tools, such as `map` and `reduce`, which can be used as follows: `[1, 2, 3].map(function(x) { ... })`, or `[1, 2, 3].reduce(function(total,x) {...},0);`.

### Prototypal inheritance

-	Javascript classes are just `function` which can be called with the `new` operator. For instance, a `Person` class could be defined as follows: `function Person(name) { this.name = name; }`, and a Person object could be instantiated as `var p = new Person("John Smith");`. 
-	Javascript classes each have a `prototype` which includes methods and properties shared among all instances of the class. For instance, to give all instances of the `Person` class a `sayName` method, we could use `Person.prototype.sayName = function() { alert(this.name); }`. 
-	The behavior of the `this` keyword in Javascript is unintuitive to most---`this` is bound to a particular value, for a given function, _at the time the function is called_; this is as opposed to most object-oriented langauges such as C++ where `this` is defined when an object is instantiated. For example, if we were to call `p.sayName()` in a browser after executing the above code, a dialog box would appear containing the text "John Smith". If however we were to execute `var f = p.sayName; f();`, the dialog would instead contain "null". This is because `this` for the invocation `f()` is set to the global object, `window`. See examples on the Javascript Garden for details and further explanation.
-	A traditional, class-based inheritance system can be built on top of Javascript's prototypal inheritance system. The Workbench client takes this approach, using Sencha ExtJS's class system to structure code. 

## Deployment overview

Generally the Workbench code is deployed on a virtual machine running Ubuntu Server. During development, this is a VirtualBox virtual machine running on the developer's local machine. Ubuntu Server does not come with a graphical shell installed, so the server is generally accessed via SSH or HTTP. Workbench application code is generally placed in a VirtualBox "shared folder" that is synchronized with a folder on the host operating system by VirtualBox; that way, the developer can use his choice of editor in his host operating system, rather than having to edit Workbench code via an editor running over SSH. 

The deployment server runs on a virtual machine hosted by Amazon Web Services in the Elastic Compute Cloud ("EC2"). The basic configuration is similar, but there are no shared folders. The EC2 instance uses three Amazon Elastic Block Storage (EBS) volumes for storage: one contains the root file system, one contains user files, and one contains logs. Code is deployed to the server via `git`. 

On either the development or the deployment server, code is contained in a subdirectory of the home folder of a non-superuser called `webserver-user`. Sometimes this code may reside elsewhere on the file system (for instance, in the development server it resides in a subdirectory of the mount point for the VirtualBox shared folder), in which case a symbolic link must be created to the appropriate location in the home directory. Likewise, user files are contained in another subdirectory, etc.

The layout of this home directory is as follows (all paths are relative to `/home/webserver-user/`):

-	`app/` - Contains application code (layout of this folder is described [below](#application-code-file-hierarchy))
-	`file-share/` - Contains user files within the `files` subdirectory
	-	`files/` - Contains subdirectories corresponding to user email addresses. Each of these subdirectories is a Workbench user's "home directory" within the application (e.g. all of that user's files will be stored within this subdirectory; that user will have access only to files within that subdirectory). 
-	`logs/` - Contains several log files:
	-	`startup.log` - Contains the contents of `stdout` from the `startup` shell script (see [below](#bootstrapping-process))
	-	`full.log` - Contains logging information from Workbench application code.
	-	`mongo.log` - Contains logging information from the MongoDB database.
-	`node_modules/` - Contains node modules installed using the [Node Package Manager](https://npmjs.org/), `npm`. 

## Application Code File Hierarchy

This section outlines the file hierarchy for application code (all paths are relative to `/home/webserver-user/app/`):

-	`build/` – Destination for various files generated during the client-side code or development VM build process.
-	`help/` - Contains Markdown source for user-facing help documentation files
	-	`html/` – Contains HTML code for user-facing help documentation, generated by Pandoc.
-	`server/` - Contains server-side application code
	-	`node_modules/` - Contains several pieces of shared code which are commonly included in subsequent scripts. Because of the way [Node.js resolves module identifiers](http://nodejs.org/api/modules.html#modules_loading_from_node_modules_folders) it is more convenient to have these files in this folder; that way, scripts in subdirectories of `server/` don't have to specify the full relative path to these scripts. 
	-	`server-tools/` - Contains code for the server-side computational tools.
-	`static/` - Contains all static resources that are served to the client
	-	`client/` - Contains client-side Javascript code
	-	`common/` - Contains Javascript code that is shared between the client and the server. This code is contained below `static/` so that it can be served to the client, but these files are also loaded separately by the server-side code.	
	-	`docs/` - Contains API documentation generated by [JSDuck](https://github.com/senchalabs/jsduck) from DocComment blocks within the application code.
	-	`html/` - Contains static HTML pages served to the client
	-	`images/` - Contains images and icons
	-	`styles/` - Contains CSS stylesheets
	-	`tests/` - Contains a small number of unit tests for some common libraries
-	`tools/` - Contains executables for the computational tools
-	`views/` - Contains template files used to generate the HTML main application page, along with the 

Server
======

## Relevant toolkits

As discussed, the server code is executed by the Node.js Javascript runtime. Node.js code is organized into [modules](http://nodejs.org/api/modules.html) according to the CommonJS specification. The Node Package Manager, [NPM](https://npmjs.org/), provides a repository of modules for Node.js applications. Workbench depends on several NPM modules:

-	[Connect](http://www.senchalabs.org/connect/) - a middleware library for error handling, static file serving, etc.
-	[Express](http://expressjs.com/) - a web application framework which provides several features: routing HTTP requests to application code based on the request URL; storage of user "session" data; HTTP response handling, etc.
-	[Jade](http://jade-lang.com/) - a templating language
-	[Mongoose](http://mongoosejs.com/) - an Object modeling library for the MongoDB NoSQL database.

### Old dependencies

**Note**: Workbench relies on very old oversions of several of these dependencies; these should be upgraded to the latest available version whenever time allows. This section briefly describes, for each old dependency, why it is still used and possible problems:

-	Node (`v0.6.x`) -- Many breaking changes since this version, including a revamped `Stream` API, some changes to the `path` and `fs` APIs.
-	npm (`v1.x.x`) -- Many breaking changes, but importantly, the old version of `npm` (before `~2.x.x`) doesn't support 
-	Express (`v2.x.x`)
-	Jade (`v0.x.x`)
-	Mongoose (`v1.7.x`)

## Bootstrapping process

This section describes the process by which server code is loaded and executed.

-	`workbench.conf` - A script for the event-based task daemon [Upstart](http://upstart.ubuntu.com/). The Upstart daemon reads this script which directs it to start the `startup` shell script when the machine boots, and to restart the script when it crashes. 
-	`startup` - A shell script which exists largely for convenience. The upstart script requires superuser privileges to edit, but this script can live in the main `webserver-user`'s home directory and therefore be modified without special privileges. This script launches the MongoDB database server which tracks user authentication. 
-	`app.js` - Loads `connect`, `express`, and a number of other modules, and sets up an HTTP server. Serves a few routes, including the main application page. Loads the following files:
	-	`config.js` - Contains configuration variables.
	-	`utils.js` - Contains a number of utility functions.
	-	`file-manager.js` - Contains the service which serves user files in response to HTTP requests. Also responds to HTTP requests instructing creation, renaming/moving, updating, and deletion of files.
	-	`server-tools.js` - Contains the service which starts computational tasks in response to HTTP requests.
	-	`auth.js` - Contains the service which responds to user authentication requests.
	
## Realtime services

### Task service

This section is under construction as this API develops. 

-	Task classes
	-	LocalTask
	-	BashTask
	-	NodeTask
-	Starting tasks
	-	Parsing user input data
	-	Creating Task object
	-	Starting task
	-	Associating task with user
	-	Piping data to user
	-	Watching for task completion
-	Stopping tasks

### File service

This section is under construction. The file service registers handlers for HTTP requests for the following actions:

-	Creating files
-	Listing contents of a directory
-	Reading file contents
-	Renaming and moving files
-	Updating file contents
-	Deleting files

## Server tools

This section is under construction. The following computational tools are included:

-	Nodal compiler
-	Domain-level enumerator
-	Pepper compiler
-	DD
-	Multisubjective
-	NUPACK thermodynamics

Client
======

## Relevant toolkits

Client-side code relies heavily upon the following frameworks:

-	[Sencha ExtJS](http://www.sencha.com/products/extjs) - a user interface library providing many interface widgets (e.g. buttons, toolbars, windows, layouts, etc.), as well as the class system which structures most of the client-side code
-	[jQuery](http://jquery.com/) - provides HTML DOM traversal and manipulation, event handling, and AJAX communication with the server
-	[Underscore.js](http://documentcloud.github.io/underscore/) - a functional "utility belt" providing a host of utility functions, including cross-browser implementations of `map` and `reduce`
-	[CodeMirror](http://codemirror.net/) - a syntax-highlighting, in-browser code editor. 
-	[D3.js](http://d3js.org/) - a library for creating interactive, data-drived visualizations
-	[Raphael](http://raphaeljs.com/) - a library for creating vector graphics in the browser using SVG or VML.

## File hierarchy

Client-side javascript is organized in the following folder hierarchy (all within the `static/` directory):

-	`client/` - Common code, generally under the `App.*` namespace, that is loaded manually and serves to bootstrap the user interface
-	`client/ui` - Classes for shared user interface components used by the main application chrome or shared among several applications, generally under the `App.ui.*` namespace.
-	`client/usr` - Subdirectories contain client-side applications, under the `App.usr.*` namespace. Each application generally has its own namespace (for instance, the nodal interface resides within `App.sr.nodal.*`.)
-	`client/workspace` - Contains code related to the 2D drag-and-drop "workspace" or "canvas" interface presented by applications like the nodal designer. This directory does _not_ contain nodal-specific elements, but rather base classes for creating and manipulating vector graphics, equations, etc. Contains classes within the `Workspace.*` namespace.

## Lifecycle 

This section describes how client-side Javascript code is loaded and executed. The order in which client-side files are loaded is determined by the _server_-side file `server/manifest.js`. `manifest.js` assembles an array of Javascript files, including all dependencies/libraries, which should be loaded initially into the page. The template `views/index.jade` generates the HTML for the main application page. `index.jade` executes `manifest.js`, and generates `<script>` tags to load the scripts onto the page. Some number of scripts are injected into the page in this way---these are known as "statically-loaded" scripts. _Most_ scripts, however, are loaded by [`Ext.Loader`](http://docs.sencha.com/extjs/4.1.3/#!/api/Ext.Loader), the dynamic dependency-loading mechanism built-in to ExtJS; these are known as "dynamically-loaded" scripts. 

During development, this works as follows:

-	`loader.js` enables `Ext.Loader`
-	Statically-loaded scripts injected via `<script>` tags call methods of `Ext.Loader` to `require` dependency classes. Specifically, `App.Launcher` generally `require`s the root classes corresponding to each of the client-side applications (e.g. `App.usr.nodal.Canvas` represents the Nodal editor, `App.usr.text.Editor` corresponds to a plain text editor, etc.).
-	`Ext.Loader` synchonously loads the script files containing these dependencies. The classes described in those scripts may have dependencies, which are resolved by `Ext.Loader` as well.
-	This process continues recursively until `Ext.Loader` has resolved all dependencies.

During deployment, the process is a bit different:

-	`loader.js` is omitted, so `Ext.Loader` is not enabled
-	Prior to deployment, all of the dependency requirements specified within application classes are used to create a graph of dependencies and a proper ordering of all classes contained in dynamically-loaded scripts. This list is combined with the list of statically-loaded scripts in `manifest.js`; all of these files are concatenated to generate one big Javascript file (`static/client/all.js`), which defines all classes needed by the application.
-	`all.js` is loaded and executed by the client.

In either case, the following scripts are loaded in approximately this order:

-	Statically-loaded scripts:
	-	`bootstrap.js` - Loads the ExtJS library
	-	Libraries - All other external libraries are loaded, including jQuery, CodeMirror, Raphael, D3.js, etc.
	-	`loader.js` - Enables `Ext.Loader`.
	-	`app.js` - Contains shared utility functions and code for communicating with the server via Socket.io.
	-	`documents.js` - Contains code for managing interactions with the file system. Defines the data model for the Files tree displayed in the main interface.
	-	`core.js` - Contains code specifying the data model used within the "workspace" interface appearing in applications such as the nodal UI.
	-	`workspace.js` - Contains code initailizing the "workspace" interface 
	-	`canvas.js` - Contains code which builds the main interface chrome---the files tree, the main tab bar, the console, etc.
	-	Common scripts - Scripts from `static/common/` such as `dna-utils.js` and `dynamic.js` are loaded.
-	Dynamically-loaded scripts:
	-	Shared components - Shared data models and interface widgets from the `client/ui` subdirectory are loaded into the `App.ui.*` namespace.
	-	Applications - Client-side application classes are loaded into namespaces underneath `App.usr`. 

## Core components and services

The following important classes are used across the application

-	`App.Application` - Base class mixed in to all client-side applications. Contains common code for loading and saving data from files. Client-side applications override methods defined on `App.Application` to provide custom behavior, e.g. on file loading
-	`App.Document` - The data model which represents an individual file, and communicates changes to that file to the server.
-	`App.TaskRunner` - The class which requests execution of computational tasks on the server and manages task updates via Socket.io.
-	`App.ui.*` - Shared data models and interface widgets:
	-	`App.ui.Launcher` - Manages "launching" of Applications via instantiation of `App.Application` subclasses and association of those instances with `App.Document`s. 
	-	`App.ui.FilesTree` - Provides a user interface for interacting with user files, including creating, editing, renaming, and deleting files and directories.
	-	`App.ui.console.*` - Provides an interactive console to which debug messages are written, and in which arbitrary Javascript code can be executed.

## Client-side applications

This section is under construction. 

