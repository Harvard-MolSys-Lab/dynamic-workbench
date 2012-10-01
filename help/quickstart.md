Getting Started
===============

This document will get you started with Workbench as quickly as possible. For a more detailed introduction, see the [Overview](overview).


Setup
-----

**Note:** This part assumes you've already [installed](install) Workbench Server, or that you're using a hosted installation. If you didn't configure this server, you're on a hosted installation; go on to the next section. See the [server](server) page if you're confused.

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




