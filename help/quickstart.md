Getting Started
===============

This document will get you started with Workbench as quickly as possible. For a more detailed introduction to what Workbench is and what it can do, see the [Overview](overview).

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
	-	You can delete complementarities by switching back to the pointer tool (arrow), selecting a link, and pressing the large red "X" 
4.	Build your project and send output to a sequence designer
	-	Select the "Build" tab, then click "Compile". A new tab should open showing a secondary structure representation of the compiled system

[Read more](nodal) about the nodal designer.

Secondary structure design with DIL
-----------------------------------

You should see a window with several panes, showing a secondary structure representation of your system. This is the DyNAMiC Intermediate Language (DIL) editor. In the middle, there is a grid showing the secondary structures of each complex in the system. Double-click a complex to edit its composition or structure. On the right, there is a list of each unique *segment* in the system; you can use this pane to impose sequence constraints on the system to be designed (these will be passed to the sequence designer). On the bottom, there is a list of each *strand* in the system; you can edit the composition of strands or view their sequences. 

From the toolbar atop this window, you can export the system to one of several sequence designers (DD, NUPACK, Multisubjective), perform a reaction enumeration, or analyze system thermodynamics.

[Read more](dil) about the DIL editor 

Reaction enumeration
--------------------

To enumerate possible reactions and get an idea about the possible reactions your system may undergo:

1.	Click the "Enumerate" button inside the toolbar atop this pane
2.	A new window should open showing a text-based representation of your system; within this new window, click "Run Enumerator"
3.	One more window should open, showing the enumerated reactions between your initial complexes. Boxes represent intermediate complexes, connected by grey links to reactions (which are shown as circles). Drag the white background to pan, and use the mouse wheel to zoom. Click complex boxes to view their secondary structures.

[Read more](enumerator) about the reaction enumerator

Sequence design with Web DD
---------------------------

To design some sequences for the system you described earlier:

1.	Return to the secondary structure (DIL) tab
2.	Click the "DD" button in the toolbar at the top of this window
3.	Click "Mutate" to begin optimizting the design. You'll see the individual domains being designed in the center pane, a schematic of the various construct strands in the "Structure" pane to the right, and a real-time visualization of the candidate sequences in the "Strands" pane below. You can pause the mutation and save any part of this view by clicking the "Save" button and selecting a file name.
	-	Mutate the design for a while
	-	Once you're satisfied with the score (lower is better), pause mutations by clicking the "Mutate" button again.
	-	Save your final strands by clicking "Save" in the "Strands" pane, and selecting a file (how about "system.seq").

[Read more](web-dd) about Web DD, or [Sequence design](sequence).

Thermodynamic analysis and simulation with NUPACK
-------------------------------------------------

To perform full physical model calculations using NUPACK on the sequences we've just designed:

1.	In the "Strands" pane within Web DD, click "Compute"
2.	Choose "Calculate Partition Function" to open a new window which will allow you to perform a thermodynamic analysis on the strands in the system
3.	Click "Analyze" to begin a new analysis on the [NUPACK web server](http://www.nupack.org).

[Read more](nupack) about using NUPACK in Workbench, or check out the [NUPACK Website at Caltech](http://www.nupack.org)

Next steps
----------

-	Read more about the [Applications](applications) available in Workbench
-	Learn more about the [File system](files)
-	Discover how to [customize Workbench](customization) by scripting and developing applications. 




