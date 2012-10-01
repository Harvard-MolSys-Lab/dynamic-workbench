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

Great! Now follow the instructions below under "Starting Workbench" to get the Workbench server running. 


Linux
-----

-	Install VirtualBox
-	Configure shared folders
-	Start the server


Starting Workbench and initial configuration
------------------

1.	Start the [Workbench Server](server): **Note:** if you're using a hosted server, you can skip this step.
	-	On Mac OS X:
		1.	Launch the 'Workbench Server' application from your Applications folder 
		2.	Click 'Start' from the server control window. You will see a VirtualBox window open; wait until you are prompted to log in. Once you see the prompt, your server is running! (you don't need to actually log in here)
	-	On Linux:
		1.	Open the "VirtualBox" application. Launch the 'DyNAMiC Workbench Server (0.3.0)' Virtual Machine from the VirtualBox manager. Alternatively, enter: 
			`VBoxManage startvm 'DyNAMiC Workbench Server (0.3.0)` on the command line.
		2.	You will see a VirtualBox window open; wait until you are prompted to log in. Once you see the prompt, your server is running! (you don't need to actually log in)Congratulations, your server is running!
	-	On Windows:
		1.	Open the "VirtualBox" application. Launch the 'DyNAMiC Workbench Server (0.3.0)' Virtual Machine from the VirtualBox manager.
		2.	You will see a VirtualBox window open; wait until you are prompted to log in. Once you see the prompt, your server is running! (you don't need to actually log in here)
	Congratulations, your server is running!
2.	Open the Workbench Client in a web browser; either:
	-	Click "Launch in Browser" from the 'Workbench Server' Application (Mac OS X only), or
	-	Launch the 'DyNAMiC Workbench' application from your Applications folder (Mac OS X only), or
	-	Open a web browser and navigate to [http://192.168.56.10:3000](http://192.168.56.10:3000).
3.	Create a [user account](users); from the login screen:
	1.	Click the link titled "Don't have an account?"
	2.	Enter your name, email, and password, as well as the invite code provided with this distribution.
	3.	Click "Sign Up"
	
		**Note:** If you're hosting your own Workbench server, your account is only created on your local machine, and your name/email/password/files will not be shared with anyone.

Congratulations! You're all set up; now let's do some fun stuff with DNA.
