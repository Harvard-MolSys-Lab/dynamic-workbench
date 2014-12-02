Installation
============

These instructions assume you're hosting your own server. If you're using a hosted installation, you don't need to do anything to install! If you're confused, see the [server](server) page.

1. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads). VirtualBox is a free "hypervisor"---a program that lets you run virtual machines---from Oracle. 
2. Install [Vagrant](https://www.vagrantup.com/downloads.html). Vagrant is a tool that lets you 
3. Download Workbench to a folder on your computer.
4. Open a terminal (such as Terminal on Mac OS X or `cmd.exe` on Windows), and change to the directory where you've downloaded Workbench
5. Run `vagrant up` to setup Workbench.

Re-building the server
----------------------

If the server gets messed up somehow, you can rebuild it from scratch by running:

    vagrant destroy
    vagrant up

This will preserve all user files, but will *not* preserve any user account information.

