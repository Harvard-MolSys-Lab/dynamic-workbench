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

- DyNAMiC Workbench.app
- Workbench Server.app
	
Further Reading
---------------

* [Getting Started](quickstart)
* [Applications](applications)
 