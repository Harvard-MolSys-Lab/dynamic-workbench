Overview
========

DyNAMiC Workbench is an *Integrated Development Environment* for dynamic DNA systems. This document aims to survey the goals and architecture of Workbench and to acquaint you with important features. For a more rapid introduction, see the [Getting Started guide](quickstart).

Design Goals
------------

Workbench has been designed with several goals in mind:

- **Integration** - Workbench allows access to the full set of tools necessary for designing assembly and computation systems based on DNA strand displacement, and it streamlines the workflow between these tools.
- **Usability** - Workbench presents an intuitive, cross-browser/cross-platform, web-based interface
- **Scalability** - Workbench has built-in task deployment system (see *Architecture* below) which can execute computationally-intensive tasks on a variety of targets, including the local web server, a cluster such as Orchestra, or a number of remote web services, such as the NUPACK or Mfold web servers. 
- **Extensibility** - Workbench includes powerful, but simple tools for automating various tasks. The client-side interface is entirely scriptable, and tools are included for developing entirely new client-side applications. New server tools can be easily added to Workbench as well. Since the client and server are written in the same language (Javascript), code can be easily re-used between the client and server.

Architecture
------------

Workbench includes two main components: 

- **Workbench Server** – The server is responsible for storing and managing files, as well as deploying and execting computationally intensive tasks. If you're accessing a hosted version of Workbench, you likely won't interact directly with the Workbench server at all. If you're hosting Workbench yourself, it's helpful to understand a bit about the server. [Read more](server).
	- **Server tools** - The server can run several types of computational tasks, each of which is encapsulated by a *server tool*. Server tools require a wrapper  written in Javascript, but they can easily access and call tools written in any language. Most tools included with Workbench are written in C, while others are written in Python. [Read more](server-tools)
	- **File management** - The server maintains a "home directory" for each user. Many types of files can be opened and edited within Workbench, including DNA-related files (.seq, .nupack, .nodal), and other relevant files not strictly related to DNA (.txt, .xml, .html, .tex), while other file types (.svg, .pdf) can be previewed from within Workbench. [Read More](files)
	- **Users** - To access the server, you need a user account. This is true even if you're hosting your own server instance. Workbench will redirect you to a login page from which you can make an account. [Read More](users)
- **Workbench Client** - The client is the main interface to Workbench. It can be run as a standalone application on Mac OS X, accessed within any modern web browser.
	- **Applications** - Workbench does lots of different things; *Workbench Applications* implement all of these different tasks on the client. Workbench includes applications for everything from [behavioral design with the nodal abstraction](nodal) to [stochastic sequence design with Web DD](web-dd). You can even write your own Workbench applications [Read More](applications)
	- **Tasks** - Workbench allows you to launch and manage server tools from the client using the Task Manger. [Read More](task-manager)
	
Contents of your Installation
-----------------------------

If you downloaded Workbench as a disk image (.dmg) file for Mac OS X, several utilities have been provided to make your life a bit easier. These applications will be copied to your Applications directory as part of the [installation](install) process

-	DyNAMiC Workbench.app - This contains a "site-specific broweser" -- a mini web browser, automatically configured to connect to a locally hosted Workbench server. 	This is just for conveinience; you can just as easily navigate to the specified URL in a web browser.
-	Workbench Server.app - This is a helper to allow you to launch and log in to the server. To start the server:
	
	1.	Launch the 'Workbench Server' application from your Applications folder 
	2.	Click 'Start' from the server control window. You will see a Terminal window open with lots of output. You'll also see a VirtualBox window open.
		Wait until you see `webserver-user@192.168.56.10's password: `; then enter the password for your server (the default is `" "`, 
		a single space).
	3.	Wait until you see `Server running from /media/sf_vmshare/infomachine2 at http://192.168.56.10:3000`. Congratulations, your server is running!
	
See the [Getting Started guide](quickstart) for details on how to start on another operating system.

Installing Workbench
--------------------

See [Installation](install) for details on how to install Workbench server.

Getting started
---------------

See the [Getting Started guide](quickstart) for a quick introduction to the various things you can do with Workbench.

Further Reading
---------------

* [Getting Started](quickstart)
* [Applications](applications)
 