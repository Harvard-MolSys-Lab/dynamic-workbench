DyNAMiC Workbench Server
========================

Overview
--------

Workbench server is the part of the Workbench suite which is responsible for managing computationally intensive tasks, and storing files for Workbench users. There are two ways you might access a Workbench server:

-	Hosted installation - Workbench server is intended to be installed on a cluster computing platform and made available via the web. In this case, you need only 		interact with the web-based Workbench client interface. You'll just need an invitation code from whoever runs the server, and you'll be able to create an 
	account and begin using Workbench. Currently there are no hosted installations available. 
-	Local installation (hosting your own server) - For testing purposes, you may wish to host your own Workbench server. This requires a bit more effort, but you have 	full control over the entire system. See below for details about how to set up your own server.

Server Tools
------------

Workbench ships with several server tools installed. For details, see [Server tools](server-tools)

Hosting your own server
-----------------------

If you are reading this documentation, you've likely already obtained a copy of Workbench from the [Molecular Systems Lab](http://www.molecular-systems.net). Because of the number of external dependencies that the Workbench server has, and the relative difficulty in setting them up, Workbench server is deployed as a [VirtualBox](http://www.virtualbox.org/) appliance. VirtualBox is a free virtualization platform provided by Oracle. This means Workbench will run as a Virtual Machine, with its own isolated operating system, file system, process management, etc.; this means that you only need to install the virtual machine, and you have access to all of the relevant [server tools](server-tools) (such as NUPACK, SpuriousDesign, the Nodal and Pepper compilers, etc.) without needing to configure them individually. This setup has the added benefit that if Workbench or one of its server tools crashes, it won't affect your host machine. 

It's important to understand how this setup works: The Workbench server virtual machine will run (using VirtualBox) on your computer (which is called the "host" in this circumstance); it contains a separate operating system (the "guest" operating system, which in this case is a version of Ubuntu linux), and a lot of software, including a web server and the server tools. All of this software which will run within the virtual machine, sharing your processor and memory, but essentially isolated from your computer. There are two special communication channels between the virtual machine and the host:

-	Shared folders: this VirtualBox feature allows folders on the host to be mirrored in the guest, and vice-versa. This lets you to access your files stored on
	Workbench from within your normal operating system file manager (e.g. Finder, Nautilus, Windows Explorer). 
-	Host-to-guest network: this creates a special network only between the host and guest. This means that the virtual machine will not be visible to the internet at 	large, but it will be able to connect only to the host (for instance to expose the Workbench web server).

### Running the server

As part of the [installation](install) process, you'll install a copy of the pre-packaged Workbench Server virtual machine on your computer. You'll be able to launch the virtual machine (VM) directly from the VirtualBox desktop application, or using the Workbench Server manager on Mac OS X. 

Since the Workbench Server has its own operating system and file system, you'll need to log in to the server in order to make it do anything. To log in to the server, you use a serparate set of user credentials (different from the username and password that you use to log into your host machine, or that you use to log in to the Workbench client interface on the web). These credentials are preset when you download Workbench, although you're encouraged to change them.

The predefined credentials are:
	
	Username: 'webserver-user'
	Password: ' '

(single quotes are not part of the username or password; the password is a singe space: `' '`). 

The recommended method for logging in to the virtual machine is via [SSH](http://en.wikipedia.org/Secure_Shell). This will allow you command-line access to the server. If you've never really used a command line, worry not, since the server will mostly take care of itself once you log in.

To connect to the server via SSH:

-	On Mac OS X or Linux, open a Terminal, and enter the following command:

		ssh webserver-user@192.168.56.10
		
	You will be prompted to enter `webserver-user@192.168.56.10's password:`; enter the password. 

-	On Windows: you'll need to download an SSH client, such as [PuTTY](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html). Open your SSH client, and 
	login using credentials like this:
	
		host: 192.168.56.10
		port: 22
		user: (see above)
		password: (see above)

You should now see a bunch of output, eventually including `### DyNAMiC Workbench ###`; once you see `Server running from /media/sf_vmshare/infomachine2 at http://192.168.56.10:3000`, your server is running, and you can access it by pointing a web browser at that URL.

### Interacting with the server via SSH

Once you've logged in to the server with SSH, if you're comfortable, you can play around with shell accesss to the server. You'll need to kill (ctrl+C) or suspend (ctrl+Z) the server after you've logged in and before doing anything else. To put the server in the background and do other things, press ctrl+Z, then type `bg` and press enter.

Two shell scripts are provided for your convenience; both are stored in your home folder (`~`):

-	`startup`: This is the script run automatically upon login which starts the database and web server. 
-	`repair`: Occasionally, the database server doesn't shut down properly (this happens when the virtual machine is powered off without killing the server process).
	If when you launch the server normally and attempt to log in via the web interface, the login progress bar just keeps resetting, your database needs to be 
	repaired; run this script, then run the startup script.

To run these scripts, type `sh ~/startup` or `sh ~/repair` and press enter 

### Shutting down the server

To shut down the server and avoid damaging the database, simply kill the `startup` shell script (press ctrl-C), log off the server (type `exit`) then power off the virtual machine by closing its application window (titled "VirtualBox VM" or some such thing) or entering: `VBoxManage controlvm 'DyNAMiC Workbench Server (0.3.0)' poweroff` on the command line.

### Server Manager Application

On Mac OS X, a more intuitive application has been provided to automate some of these tasks; you can launch it by opening the 'Workbench Server' application in your Applications folder. You'll still need to use SSH to fix something if it breaks (to repair the database, for instance). However, you can start and stop the virtual machine safely by using the "Start" and "Stop" buttons, and you can do other convenient things like open the client interface in a web browser.

To start the server from the Server Manager application:

-	Click 'Start' from the server control window. You will see a Terminal window open with lots of output. You'll also see a VirtualBox window open, displaying the 
	screen for  your Virtual Machine. Wait until you see `webserver-user@192.168.56.10's password: ` in the Terminal window, then enter the password for your server
	(the default is `" "`,  a single space).
-	Wait until you see `Server running from /media/sf_vmshare/infomachine2 at http://192.168.56.10:3000`. Congratulations, your server is running!
