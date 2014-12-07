DyNAMiC Workbench Server
========================

Overview
--------

Workbench server is the part of the Workbench suite which is responsible for managing computationally intensive tasks, and storing files for Workbench users. There are two ways you might access a Workbench server:

-	Hosted installation - Workbench server is intended to be installed on a cluster computing platform and made available via the web. In this case, you need only interact with the web-based Workbench client interface. You'll just need an invitation code from whoever runs the server, and you'll be able to create an 
	account and begin using Workbench. The only hosted installation currently available is at provided by the [Molecular Systems lab at Harvard](http://www.molecular-systems.net/workbench).

-	Local installation (hosting your own server) - For testing purposes, you may wish to host your own Workbench server. This requires a bit more effort, but you have full control over the entire system. See below for details about how to set up your own server.

**Note:** You only need to read this chapter if you're interested in setting up your own local installation. If you're accessing Workbench from a hosted installation (such as from [http://www.molecular-systems.net/workbench]), you can skip this section.

Server Tools
------------

Workbench ships with several server tools installed. For details, see [Server tools](server-tools).

Hosting your own server
-----------------------

If you are reading this documentation, you've likely already obtained a copy of Workbench from the [Molecular Systems Lab](http://www.molecular-systems.net). Because of the number of external dependencies that the Workbench server has, and the relative difficulty in setting them up, Workbench server is deployed as a [VirtualBox](http://www.virtualbox.org/) appliance, managed with [Vagrant](https://www.vagrantup.com/). VirtualBox is a free virtualization platform provided by Oracle, and Vagrant is a tool for easily configuring virtual machines. This means Workbench will run as a Virtual Machine, with its own isolated operating system, file system, process management, etc. You just need to install the virtual machine, and you'll have access to all of the relevant [server tools](server-tools) (such as NUPACK, SpuriousDesign, the Nodal and Pepper compilers, etc.) without needing to configure them individually. This setup has the added benefit that if Workbench or one of its server tools crashes, it won't affect your host machine. 

It's important to understand how this setup works: The Workbench server virtual machine will run (using VirtualBox) on your computer (which is called the "host" in this circumstance); it contains a separate operating system (the "guest" operating system, which in this case is a version of Ubuntu linux), and a lot of software, including a web server and the server tools. All of this software which will run within the virtual machine, sharing your processor and memory, but essentially isolated from your computer. There are two special communication channels between the virtual machine and the host:

-	Shared folders: this VirtualBox feature allows folders on the host to be mirrored in the guest, and vice-versa. This lets you to access your files stored on Workbench from within your normal operating system file manager (e.g. Finder, Nautilus, Windows Explorer). 
-	Host-to-guest network: this creates a special network only between the host and guest. This means that the virtual machine will not be visible to the internet at large, but it will be able to connect only to the host (for instance to expose the Workbench web server).

### Running the server

As part of the [installation](install) process, you'll install a copy of the pre-packaged Workbench Server virtual machine on your computer. You'll be able to launch the virtual machine (VM) directly from the command line; simply change to the directory where Workbench is installed, then run

	vagrant up

This will install and setup the server (if not done already), then boot the server. If you've previously halted the server, you can also restart it with `vagrant up`.

The actual server component is configured to launch automatically when the appliance starts. That means if you just use the Workbench interface, all you need to do is launch the appliance and point your browser 

However, if you want to tweak the server beyond what's described in the [customization](customization) page, or to use any of the installed server tools directly (from the command line), you'll need to log in. 

### Logging in to the server

To log in to the server, you use a serparate set of user credentials (different from the username and password that you use to log into your host machine, or that you use to log in to the Workbench client interface on the web). These credentials are preset when you download Workbench, although you're encouraged to change them.

There are two pre-defined user accounts:

- `vagrant` (password: '`vagrant`') -- this is a privileged account which can execute commands with `sudo`
- `webserver-user` (password: '` `'; a single space) -- this is an unprivileged account which is used to run the server process.

(single quotes are not part of the username or password; the password is a singe space: `' '`). 

The recommended method for logging in to the virtual machine is via [SSH](http://en.wikipedia.org/Secure_Shell). This will allow you command-line access to the server.

To connect to the server via SSH:

- On Mac OS X or Linux, open a Terminal, and enter the following command:
	- For `webserver-user`: `ssh webserver-user@192.168.56.10`. You will be prompted to enter `webserver-user@192.168.56.10's password:`; enter the password. 
	- For `vagrant`: change to the directory where Workbench is installed, and enter `vagrant ssh`. You won't need to enter a password

- On Windows: you'll need to download an SSH client called `ssh.exe`, which must be in your `%PATH`; [`git`](http://git-scm.com/download/) comes with one, which you just need to add it to the `%PATH%` environment variable. You can also use a graphical SSH client such as [PuTTY](http://www.chiark.greenend.org.uk/~sgtatham/putty/download.html), but you'll need to [configure it for use with Vagrant](http://stackoverflow.com/questions/9885108/ssh-to-vagrant-box-in-windows). Open your SSH client, and login using credentials like this:
	
	- For `webserver-user`: 

		host: 192.168.56.10
		port: 22
		user: (see above)
		password: (see above)

	- For `vagrant`: use `vagrant ssh`.


### Using the web interface

The server will start automatically after the VM has finished booting (your server should be running by the time you see a login prompt). To view the web interface, point your web browser to: [http://192.168.56.10:3000/].

See [documentation](index) for the web interface.

### Interacting with the server via SSH

Once you've logged in to the server with SSH, if you're comfortable, you can play around with shell accesss to the server.

The actual server process is described in a shell script: `/home/webserver-user/startup`, which you can look at if you curious. This script starts the [Node JS web server](http://www.nodejs.org/) process, which does the heavy lifting of running the server. 

`startup` is in turn controlled by an [Upstart](http://upstart.ubuntu.com/) script, located in `/etc/init/workbench.conf`. The upstart script makes sure that the server gets launched on startup, killed on shutdown, and restarted if it crashes. You can control the server using Upstart commands:

*	`sudo start workbench` – starts the server
*	`sudo stop workbench` - stops the server
*	`sudo status workbench` - tells you if the server is running or not

One other shell script is provided for your convenientce: `~/repair`: Occasionally, the database server doesn't shut down properly (this happens when the virtual machine is powered off without killing the server process). If when you launch the server normally and attempt to log in via the web interface, the login progress bar just keeps resetting, your database needs to be repaired; in that case, run:
	
	sudo stop workbench
	sh ~/repair
	sudo start workbench 

Note: `sudo` is required because administering Upstart processes requires administrator privileges. However, `startup` is run as `webserver-user` when launched via Upstart. `webserver-user` is _not_ on the `sudoers` list. 

### Shutting down the server

To shut down the server and avoid damaging the database, simply shut down the virtual machine by:

*	Entering `vagrant suspend` from the command line in your host machine (in the same directory as Workbench is installed); rather than shutting down the virtual machine, this will simply pause its execution. 
*	Entering `vagrant halt` from the command line in your host machine (in the same directory as Workbench is installed)

### Managing users

You can manage users by visiting the [/admin](/admin) page from within Workbench; if your current account is an administrator, you will see a list of all users in the database. You can edit users' names, affiliations, and email addresses, you can activate or deactivate accounts, and you can make users administrators.

When you first install the Workbench server, however, the first account you make will not have administrator privileges and so you will have no other way of activating/managing user accounts. To remedy this, Workbench includes a simple command-line tool that you can use to manage user accounts. To access it:

*	Sign into the server via `ssh` (e.g. using `vagrant ssh`)
*	Navigate to `/home/webserver-user/app` (you must be in this folder)
*	Run `meta/utils/users --help` to see a list of options and usage information.

For example, if you've made a user with the email address `example@example.com` and you'd like to make that user an administrator, you can run:

	meta/utils/users edit example@example.com --admin

You can also do things like list all registered users, export users to a JSON file, import user data from a JSON file, and edit other properties of user (including resetting their passwords). Run `meta/utils/users --help` for a full list.

### Troubleshooting
