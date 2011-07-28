Getting Started
===============

This document will get you started with Workbench as quickly as possible. For a more detailed introduction, see the [Overview](overview).


Setup
-----

In order to get up and running, you need to do three quick bits of setup:

1.	Start the Workbench Server: **Note:** if you're using a hosted server, you can skip this step.
	-	On Mac OS X:
		1.	Launch the 'Workbench Server' application from your Applications folder 
		2.	Click 'Start' from the server control window. You will see a Terminal window open with lots of output. You'll also see a VirtualBox window open.
			Wait until you see `webserver-user@192.168.56.10's password: `; then enter the password for your server (the default is `" "`, 
			a single space).
		3.	Wait until you see `Server running from /media/sf_vmshare/infomachine2 at http://192.168.56.10:3000`. Congratulations, your server is running!
	-	On Linux:
		1.	Open the "VirtualBox" application. Launch the 'DyNAMiC Workbench Server (0.3.0)' Virtual Machine from the VirtualBox manager. Alternatively, enter: 
			`VBoxManage startvm 'DyNAMiC Workbench Server (0.3.0)` on the command line.
		2.	Open a [secure shell](http://en.wikipedia.org/Secure_Shell) (SSH) session with the virual machine. Enter the following on the command line:
			`ssh webserver-user@192.168.56.10` Then wait until you are prompted for `webserver-user@192.168.56.10's password: `. Enter the password for your server 			(the default is `" "`, a single space).
		3.	Wait until you see `Server running from /media/sf_vmshare/infomachine2 at http://192.168.56.10:3000`. Congratulations, your server is running!
2.	Open the Workbench Client in a web browser; either:
	-	Click "Launch in Browser" from the 'Workbench Server' Application (Mac OS X only), or
	-	Launch the 'DyNAMiC Workbench' application from your Applications folder (Mac OS X only), or
	-	Open a web browser and navigate to [http://192.168.56.10:3000](http://192.168.56.10:3000).
3.	Create a user account; from the login screen:
	1.	Click the link titled "Don't have an account?"
	2.	Enter your name, email, and password, as well as the invite code provided with this distribution.
	3.	Click "Sign Up"
	
		**Note:** If you're hosting your own Workbench server, your account is only created on your local machine, and your name/email/password/files will not be
	 	shared with anyone.

Congratulations! You're all set up; now let's do some fun stuff with DNA.

Designing a Nodal System
------------------------

To design a system using the Nodal Abstraction described in [Yin et al., 2008](http://yin.hms.harvard.edu/people/yin.peng/paper/pathway/index.html):

1.	Create a new file
	-	Select "New" from the main menu bar
	-	Enter a filename, like "system.nodal" (you can omit the file extension)
	-	From the menu under "Create," select "Nodal System." Your new file should appear in the tree on the left (labeled "Files")
	-	Open the file by double-clicking on its name in the Files tres
2.	Add some nodes to the workspace
	-	Drag and drop motifs from the palatte labelled "Motifs" onto the main white area (the "Workspace"). Nodes can be renamed by clicking on the gray label
	 above.
	-	For a full reference of the different motifs, see [nodal systems](nodal).
3.	Connect nodes together
	-	To indicate complementarities, select the Complementarity tool (labeled "Connect"). Click and drag from output ports (circular) to input ports (triangular).
	-	You can delete complementarities by switching back to the pointer tool (arrow), and pressing the large red "X" 
4.	Build your project and send output to a sequence designer
	-	Select the "Build" tab, then click "Compile". You should see a bunch of output files appear in the files tree to the left:
		-	(nodal system name).txt: this is a serialized (textual) representation of the reaction graph you've just drawn
		-	(nodal system name).svg: a graphical representation of the strands necessary to implement your system
		-	(nodal system name).nupack: a script for the [NUPACK Multiobjective designer](http://nupack.org/design/new) to design sequences using 
		  [thermodynamic ensemble defect minimization](http://www.nupack.org/downloads/serve_public_file/jcc11b.pdf?type=pdf). 
		-	(nodal system name).domains: a file which will allow you to quickly and easily generate and optimize sequences stochastically in your browser, 
		  using the Molecular Systems lab's Web Domain Designer (Web DD).

[Read more](nodal) about the nodal designer.

Sequence design with Web DD
---------------------------

To design some sequences for the structure you've just described:

1.	Open the .domains file by double-clicking its name in the Files tree
2.	Click "Mutate" to begin optimizting the design. You'll see the individual domains being designed in the center pane, a schematic of the various construct strands in the "Structure" pane to the right, and a real-time visualization of the candidate sequences in the "Strands" pane below. You can pause the mutation and save any part of this view by clicking the "Save" button and selecting a file name.
	-	Mutate the design for a while
	-	Once you're satisfied with the score (lower is better), pause mutations by clicking the "Mutate" button again.
	-	Save your final strands by clicking "Save" in the "Strands" pane, and selecting a file (how about "system.seq").

[Read more](web-dd) about Web DD, or [Sequence design](sequence).

Thermodynamic analysis and simulation with NUPACK
-------------------------------------------------

To perform full physical model calculations using NUPACK on the sequences we've just designed:

1.	In the "Strands" pane within Web DD, select "Compute"
2.	Hover over "Pairwise MFE Complexes," then enter a file name and click "Run." You don't need to provide and extension, just a prefix, since NUPACK will generate lots of files, and Workbench will wrap them up in a "package" file for you.
3.	The Console should pop up, and a message should be displayed indicating that the NUPACK task is being run. Wait until you see a bunch more output (starting with "Permutation generation complete."). This will indicate that the task has completed. Your Files tree will also refresh.
4.	You should see a new file called (file name you entered earlier).package; double-click it to view the results, which may take a moment to load. You should see a list of the distinct strands analyzed, a graph of the minimum free energy (∆G) for the various possible complexes, and a list of complexes ordered by concentration. Click one of these complexes in order to view the minimum free energy structure as a 2D visualization, an arc diagram, or a matrix visualization.

[Read more](nupack) about using NUPACK in Workbench, or check out the [NUPACK Website at Caltech](http://www.nupack.org)

Next steps
----------

-	Read more about the [Applications](applications) available in Workbench
-	Learn more about the [File system](files)
-	Discover how to [customize Workbench](customization) by scripting and developing applications. 




