DyNAMiC Workbench Server
========================

Overview
--------

Workbench server is the part of the Workbench suite which is responsible for managing computationally intensive tasks, and storing files for Workbench users. There are two ways you might access a Workbench server:

-	Hosted installation - Workbench server is intended to be installed on a cluster computing platform and made available via the web. In this case, you need only interact with the web-based Workbench client interface. You'll just need an invitation code from whoever runs the server, and you'll be able to create an 
	account and begin using Workbench. Currently there are no hosted installations available. 
-	Local installation (hosting your own server) - For testing purposes, you may wish to host your own Workbench server. This requires a bit more effort, but you have full control over the entire system. See below for details about how to set up your own server.

Server Tools
------------

Workbench ships with several server tools installed. For details, see [Server tools](server-tools)

Hosting your own server
-----------------------

If you are reading this documentation, you've likely already obtained a copy of Workbench from the [Molecular Systems Lab](http://www.molecular-systems.net). Because of the number of external dependencies that the Workbench server has, and the relative difficulty in setting them up, Workbench server is deployed as a [VirtualBox](http://www.virtualbox.org/) appliance. VirtualBox is a free virtualization platform provided by Oracle. This means Workbench will run as a Virtual Machine, with its own isolated operating system, file system, process management, etc. Therefore, you only need to install the virtual machine, and you have access to all of the relevant [server tools](server-tools) (such as NUPACK, SpuriousDesign, the Nodal and Pepper compilers, etc.) without needing to configure them individually. This setup has the added benefit that if Workbench or one of its server tools crashes, it won't affect your host machine. 

It's important to understand how this setup works: The Workbench server virtual machine will run (using VirtualBox) on your computer (which is called the "host" in this circumstance); it contains a separate operating system (the "guest" operating system, which in this case is a version of Ubuntu linux), and a lot of software, including a web server and the server tools. All of this software which will run within the virtual machine, sharing your processor and memory, but essentially isolated from your computer. There are two special communication channels between the virtual machine and the host:

-	Shared folders: this VirtualBox feature allows folders on the host to be mirrored in the guest, and vice-versa. This lets you to access your files stored on
	Workbench from within your normal operating system file manager (e.g. Finder, Nautilus, Windows Explorer). 
-	Host-to-guest network: this creates a special network only between the host and guest. This means that the virtual machine will not be visible to the internet at 	large, but it will be able to connect only to the host (for instance to expose the Workbench web server).

### Running the server

As part of the [installation](install) process, you'll install a copy of the pre-packaged Workbench Server virtual machine on your computer. You'll be able to launch the virtual machine (VM) directly from the VirtualBox desktop application, or using the Workbench Server manager on Mac OS X. 

The actual server component is configured to launch automatically when the appliance starts. That means if you just use the Workbench interface, all you need to do is launch the appliance and point your browser 

However, if you want to tweak the server beyond what's described in the [customization](customization) page, or to use any of the installed server tools directly (from the command line), you'll need to log in. 

### Logging in to the server

To log in to the server, you use a serparate set of user credentials (different from the username and password that you use to log into your host machine, or that you use to log in to the Workbench client interface on the web). These credentials are preset when you download Workbench, although you're encouraged to change them.

The predefined credentials are:
	
	Username: 'webserver-user'
	Password: ' '

(single quotes are not part of the username or password; the password is a singe space: `' '`). 

The recommended method for logging in to the virtual machine is via [SSH](http://en.wikipedia.org/Secure_Shell). This will allow you command-line access to the server.

To connect to the server via SSH:

-	On Mac OS X or Linux, open a Terminal, and enter the following command: `ssh webserver-user@192.168.56.10`. You will be prompted to enter `webserver-user@192.168.56.10's password:`; enter the password. 

-	On Windows: you'll need to download an SSH client, such as [PuTTY](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html). Open your SSH client, and 
	login using credentials like this:
	
		host: 192.168.56.10
		port: 22
		user: (see above)
		password: (see above)

### Using the web interface

The server will start automatically after the VM has finished booting (your server should be running by the time you see a login prompt). To view the web interface, point your web browser to: [http://192.168.56.10:3000/].

See [documentation](index) for the web interface.

### Interacting with the server via SSH

Once you've logged in to the server with SSH, if you're comfortable, you can play around with shell accesss to the server.

The actual server process is described in a shell script: `~/startup`, which you can look at if you curious. This script starts the [Node JS web server](http://www.nodejs.org/) and the [Mongo database](http://www.mongodb.org/) processes, which do the heavy lifting of running the server. When `startup` is killed, it intelligently kills both processes.

`startup` is in turn controlled by an [Upstart](http://upstart.ubuntu.com/) script, located in `/etc/init/workbench.conf`. The upstart script makes sure that the server gets launched on startup, killed on shutdown, and restarted if it crashes. You can control the server using Upstart commands:

*	`sudo start workbench` – starts the server
*	`sudo stop workbench` - stops the server
*	`sudo status workbench` - tells you if the server is running or not

One other shell script is provided for your convenientce: `~/repair`: Occasionally, the database server doesn't shut down properly (this happens when the virtual machine is powered off without killing the server process). If when you launch the server normally and attempt to log in via the web interface, the login progress bar just keeps resetting, your database needs to be repaired; in that case, run:
	
	sudo stop workbench
	sh ~/repair
	sudo start workbench 

Note: sudo is required because administering Upstart processes requires administrator privileges. However, `~/startup` is actually run as `webserver-user`. `webserver-user` is currently on the sudoers list, but the plan is to eventually create a separate user account for administration and return `webserver-user` to limited privileges again.

### Shutting down the server

To shut down the server and avoid damaging the database, simply shut down the virtual machine by:

*	Closing its application window (titled "VirtualBox VM" or some such thing), and selecting "Send the shutdown signal", or:
*	Entering: `VBoxManage controlvm 'DyNAMiC Workbench Server (0.3.0)' acpipowerbutton` on the command line in your host operating system (not the VM or ssh), or
* 	Entering `sudo shutdown 0` on the command line in the VM

### Server Manager Application

On Mac OS X, a more intuitive application has been provided to automate some of these tasks; you can launch it by opening the 'Workbench Server' application in your Applications folder. You'll still need to use SSH to fix something if it breaks (to repair the database, for instance). However, you can start and stop the virtual machine safely by using the "Start" and "Stop" buttons, and you can do other convenient things like open the client interface in a web browser.

To start the server from the Server Manager application:

-	Click 'Start' from the server control window. You will see a VirtualBox window open, displaying the screen for  your Virtual Machine. Wait until you see a command prompting you to log in. 
-	You can choose to log in and interact with the server (as described above), or you can just go directly to the [web interface](http://192.168.56.10:3000/). 
