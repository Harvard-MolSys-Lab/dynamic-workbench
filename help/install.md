Installation
============

These instructions assume you're hosting your own server. If you're using a hosted installation, you don't need to do anything to install! If you're confused, see the [server](server) page.

Mac OS X
--------
You should have recieved a Disk image (`.dmg` file) containing a few different items. If you follow the graphical instructions in the disk image, you'll be good. Here are the steps explicitly:

*	Mount the disk image by double-clicking it in Finder
*	[Download](http://www.virtualbox.org/wiki/Downloads) and install VirtualBox
*	Install the DyNAMiC Workbench Server Virtual Machine:
	*	From VirtualBox, select "File", "Import Appliance..."
	*	Browse to the mounted disk image
	*	Select the file `DyNAMiC Workbench Server (0.3.0).ova`
	*	Accept the license terms
*	Install the helper Applications
	*	Drag and Drop the applications named "Workbench Server" (green icon) and "DyNAMiC Workbench" (red icon) to your "Applications" folder
		*	"DyNAMiC Workbench" is a browser which you can use specifically for Workbench
		*	"Workbench Server" is an application that helps you start and stop the server
*	Configure the shared folders
	*	Launch the "Workbench Server" application from your Applications folder
	*	In the Workbench Server application, from the "Configure" menu, select "Virtual Machine Shared Folder..."
	*	Navigate to or create a folder on your machine where you would like the Workbench IDE to store your files. 

All set! Head to the [Getting Started guide](quickstart) to see how you can do cool stuff with DNA!

Linux
-----

-	Install VirtualBox
-	Configure shared folders
-	Start the server

