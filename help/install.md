Installation
============

These instructions assume you're hosting your own server. If you're using a hosted installation, you don't need to do anything to install! If you're confused, see the [server](server) page.

Mac OS X
--------
You should have recieved a Disk image (`.dmg` file) containing a few different items. If you follow the graphical instructions in the disk image, you'll be good. Here are the steps explicitly:

*	Mount the disk image by double-clicking it in Finder
*	[Download](http://www.virtualbox.org/wiki/Downloads) and install VirtualBox
*	Install the DyNAMiC Workbench Server Virtual Machine:
	*	Launch VirtualBox
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

Windows
-------

You should have recieved a `.zip` file containing a few items. Follow these steps 

-   Unzip the downloaded file.
-	[Download](http://www.virtualbox.org/wiki/Downloads) and install VirtualBox
-	Launch Virtual Box
-   Select "File" \> "Import Appliance...", click "Choose", and navigate
    to the folder where you extracted the `.zip` file.
    Select "workbench.ova."
-   Accept the license terms.
-   Configure the shared folders
    -   From VirtualBox, select the newly imported VM, and click
        "Settings."
    -   From the window which opens, select "Shared Folders."
    -   In the list, you should see one shared folder labeled
        "fileshare".
        -   If you do not see this file, click the plus button to the
            right of the list. From the "Folder Path dropdown, navigate
            to or create a folder on your machine where you would like
            the Workbench IDE to store your files. **Regardless of the
            file you choose, enter "fileshare" under Folder Name, and
            make sure to check "Auto-mount".**'
        -   If you do see this file, click the middle button (yellow
            circle: edit). From the "Folder Path dropdown, navigate to
            or create a folder on your machine where you would like the
            Workbench IDE to store your files. Do not change the Folder
            Name. Make sure "Auto-mount" is checked.
        -   Once you've created/setup this folder, but before you launch
            the virtual machine, create another directory within this
            folder called "files" (lowercase, no quotes); you can do
            this using Windows Explorer. You will not be able to create
            or upload files otherwise. *Do this before you create an
            account, as described below*.


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


Troubleshooting
---------------

### Mac OS X

#### Cannot create files in Workbench

Make sure you followed the last part of the installation instructions
and created a folder called "files" within your shared folder. You can
do this in Mac OS X using Finder. If you already created you account,
but did not follow this step, you should also create a directory within
"files" corresponding to the email address you used to sign up (e.g. if
you signed up with "demo.user@wyss.harvard", you should create a file
with that name). This must be done while the Workbench virtual machine
is not running.

#### Nonexistent host networking interface, name 'vboxnet0' (VERR\_INTERNAL\_ERROR)

A "host-only adaptor" is a utility which VirtualBox uses to create a
network that exists only between your "host" operating system and the
DyNAMiC Workbench Server virtual machine. This is necessary to do things
like connect to the Workbench interface via the web. To fix:

1.  Shut down the Workbench virtual machine
2.  Launch VirtualBox from Applications \> VirtualBox
3.  Select "Preferences..." from the "VirtualBox" menu
4.  Select the "Network" tab
5.  In the box under "Host-only Networks," look for "vboxnet0". If it's
    there already, proceed to the next step. If it doesn't appear, click
    the plus icon next to that box; "vboxnet0"
    should appear.
6.  Click OK
7.  From the main VirtualBox window, select the DyNAMiC Workbench Server
    virtual machine, then click "Settings" from the toolbar.
8.  Click "Network"
9.  Select "Adapter 2". Make sure "Enable Network Adapter" is checked.
    Under the drop-down labeled "Attached to", select "Host-only
    Adapter." In the "Name" field, enter or select "vboxnet0" (no
    quotes).
10. Click OK
11. Restart the VM

#### Failed to load VMMR0.r0 (VERR\_SUPLIB\_OWNER\_NOT\_ROOT)

This message usually means that `/Applications` directory is not owned
by the superuser `root` but, rather, by a user account (<i>e.g.</i>,
your own). To resolve this problem:

1.  Launch **Applications \> Utilities \> Terminal**, which will provide
    a command line.
2.  Type
        sudo chown root /Applications

    followed by Enter, inputting your password if prompted.

3.  Quit Terminal.
4.  Restart the server using the green Workbench Server application.

Source: [1](http://forums.virtualbox.org/viewtopic.php?f=7&t=38825)

#### Failed to load VMMR0.r0 (VERR\_SUPLIB\_WORLD\_WRITABLE)

This message usually means that that `/Applications` directory is
world-writable for some reason. This is a security risk. To resolve this
problem:

1.  Launch **Applications \> Utilities \> Terminal**, which will provide
    a command-line.
2.  Type
        sudo chmod o-w /Applications

    followed by Enter, inputting your password if prompted.

3.  Quit Terminal.
4.  Restart the server using the green Workbench Server application.

Source: [2](http://forums.virtualbox.org/viewtopic.php?f=7&t=39179)

### Windows

#### Cannot create files in Workbench

Make sure you followed the last part of the installation instructions
and created a folder called "files" within your shared folder. You can
do this in Windows using Windows Explorer. If you already created you
account, but did not follow this step, you should also create a
directory within "files" corresponding to the email address you used to
sign up (e.g. if you signed up with "demo.user@wyss.harvard", you should
create a file with that name). This must be done while the Workbench
virtual machine is not running.

#### Nonexistent host networking interface, name '' (VERR\_INTERNAL\_ERROR)

For some reason, VirtualBox doesn't always come with a "host-only
adapter" configured. A "host-only adaptor" is a utility which VirtualBox
uses to create a network that exists only between your "host" operating
system and the DyNAMiC Workbench Server virtual machine. This is
necessary to do things like connect to the Workbench interface via the
web. To fix:

1.  Launch VirtualBox. (If VirtualBox is already running, shut down any
    virtual machines that are running, as by clicking the red circle in
    the top-left corner of each's window.)
2.  Select **Preferences...** under VirtualBox's **File** menu.
3.  Click **Network**.
4.  If **VirtualBox Host-Only Ethernet Adapter** does not already appear
    in the white box under **Host-only Networks**, click the
    plus icon to the right of that box, and
    **VirtualBox Host-Only Ethernet Adapter** should then appear in the
    box.
5.  Click **OK**.
6.  Single-click whichever virtual machine originally triggered the
    error (<i>e.g.</i>, the DyNAMiC Workbench Server), then click
    **Settings**.
7.  Click **Network**.
8.  Click each of **Adapter 1**, **Adapter 2**, **Adapter 3**, and
    **Adapter 4**. If any of them has both **Enable Network Adapter**
    checked and a value of **Host-only Adapter** for **Attached to** (as
    should the DyNAMiC Workbench Server for **Adapter 2**), ensure that
    the adapter also has a value of **VirtualBox Host-Only Ethernet
    Adapter** now for **Name**, selecting it yourself from the drop-down
    menu next to **Name** yourself if necessary.
9.  Click **OK**.
10. Start whichever virtual machine originally triggered the problem
    (<i>e.g.</i>, the DyNAMiC Workbench Server); it should now be gone.

Source: [5](https://manual.cs50.net/VirtualBox)

#### The installer has encountered an unexpected error installing this package.  This may indicate a problem with this package.  The error code is 2869.

This problem generally indicates that VirtualBox's installer wasn't run
as an "administrator." To resolve this problem:

1.  Hit Windows-**R** on your keyboard (<i>i.e.</i>, hold the Windows
    key, then hit **R**) to open a **Run** prompt.
2.  Input **ncpa.cpl** to the right of **Open**, then hit Enter.
3.  A window entitled **Network Connections** should then appear,
    containing an icon called **Wireless Network Connection** and/or
    **Local Area Connection** (or similar).
    -   If using <u>wireless</u> Internet, right-click **Wireless
        Network Connection** (or similar), then choose **Properties**
        from the menu that appears. A window entitled **Wireless Network
        Connection Properties** (or similar) should then appear.
    -   If using <u>wired</u> Internet, right-click **Local Area
        Connection** (or similar), then choose **Properties** from the
        menu that appears. A window entitled **Local Area Connection
        Properties** (or similar) should then appear.

4.  Inside of that window should be a list of items, some (or all) of
    which are checked. If **VirtualBox Bridged Networking Driver**
    appears in the list, single-click it to highlight it, then click
    **Uninstall**.
5.  If prompted if you are **sure you want to uninstall**, click
    **Yes**.
6.  Click **Close**.
7.  Proceed to reinstall VirtualBox per [the directions
    above](#Windows "wikilink"). **Be sure to run the installer as an
    administrator.**

Source: [6](https://manual.cs50.net/VirtualBox)

#### VT-x/AMD-V hardware acceleration has been enabled, but is not operational.

"Your 64-bit guest will fail to detect a 64-bit CPU and will not be able
to boot. Please ensure that you have enabled VT-x/AMD-V properly in the
BIOS of your host computer."

Hardware virtualization is a feature on most modern processors which
allows guest operating systems to directly utilize the processor on the
host machine in a secure fashion. Additional information for the curious
is [here](https://www.virtualbox.org/manual/ch10.html#hwvirt) To enable
hardware virtualization on your system, you need to configure it through
the BIOS. The exact method of doing this depends on the manufacturer of
your computer, but sample instructions are below:

-   Dell systems
    -   Depress the F12 key when boot menu text appears at startup
    -   Select BIOS setup and depress the Enter key
    -   Using the mouse, expand the Virtualization Support menu item by
        clicking on the plus to the left of Virtualization Support and
        select Virtualization
    -   Check the Enable Intel Virtualization Technology checkbox
    -   Click Apply
    -   Click Exit
    -   Fully shut down (power off), wait a few seconds, and restart
        your computer

-   HP systems
    -   Depress Esc key when prompted at startup
    -   Depress the F10 key to Configure BIOS
    -   Scroll to System Configuration using the arrow keys
    -   Select Virtualization Technology and depress the Enter key
    -   Select Enabled and depress the Enter key
    -   Depress the F10 key to save and exit
    -   Select Yes and depress the Enter key
    -   Fully shut down (power off), wait a few seconds, and restart
        your computer

-   Lenovo ThinkPad systems
    -   Depress the blue ThinkVantage key when prompted at startup
    -   Depress the F1 key to enter the BIOS setup utility
    -   Using the arrow keys, scroll to Config and depress the Enter key
    -   Scroll to CPU and depress the Enter key
    -   Scroll to Intel® Virtualization Technology and depress the Enter
        key
    -   Select Enabled and depress the Enter key
    -   Depress Enter key to continue
    -   Depress F10 key to save and exit
    -   Select Yes and depress the Enter key
    -   Fully shut down (power off), wait a few seconds, and restart
        your computer

-   Acer, Asus, and Samsung machine should already be configured
    properly
-   Panasonic
    -   Depress the F2 key when boot menu text appears at startup
    -   Select "Advanced" menu in Setup Utility
    -   Change "Intel® Virtualization Technology" setting from "Disable"
        to "Enable"
    -   Depress F10 to exit Setup Utility
    -   Select "Yes" in confirmation menu
    -   Depress Enter to exit confirmation menu.


