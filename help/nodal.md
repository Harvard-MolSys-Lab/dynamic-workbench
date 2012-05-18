Designing Nodal Systems
=======================

Overview
--------

The nodal formalism allows you to express complicated computational or assembly processes in terms of simple behavioral units, called nodes. Many types of nodes exist--these types are called "motifs"; motifs are defined by mapping a structural unit of DNA or RNA (such as a hairpin) to a simple behavioral function. Nodes generally have several "ports" which correspond to domains of the underlying nucleic acid species. Nodal programs are written by adding instances of motifs (nodes) to a workspace, then connecting the ports together to indicate behavioral relationships, and in turn sequence complementarities. The nodal compiler, called DyNAMiC (the Dynamic Nucleic Acid Mechanism Compiler) propagates those sequence complementarity requirements to generate a list of distinct sequences which must be designed by a sequence designer (such as [DD](web-dd) or [NUPACK](nupack) ).

The basic workflow is like this:

-	Nodal systems are assembled using the nodal designer
-	The nodal compiler runs in real-time, verifying the system as you design it.
-	Once your system has been designed, input to sequence designers can be generated with the "Build" command (see "Compiling", below)
-	Sequences can be designed using sequence designers

Note: The nodal compiler generates a bunch of files, so it's recommended that you place each nodal system in a folder by itself.


Adding Nodes
-------------

You can add motifs by draging and droping existing motifs from the "Standard" panel in the lower-left, onto the workspace.

Defining Motifs
---------------

You can create new motifs in two ways, each using the "Create Motif" tool in the ribbon. First, click the "Create Motif" button, then either:

-	Click on the workspace to generate an empty motif. Then select this motif and enter a custon DyNAML description using the inspector on the right, or:
-	Click and drag on the workspace to select and existing system of nodes, and wrap that system in a new motif. 
	-	This will effectively remove those nodes from the system, and transform them into part of the motif. 
	-	All outgoing connections will be removed. 
	-	To "expose" ports within the motif to external complementarities, use the "Add Port" or "Expose" tool:
		-	"Add Port" : Select the "Add Port" tool, then click on the motif to add  a port (hold 'alt' for an input, or 'shift' for a bridge). Then use
			the "Expose" tool to drag from the internal port to the external (motif-level) port
		-	"Expose": Select the "Expose" tool; drag from the internal port to the motif itself; a new port will be created and exposed
	-	You'll need to instantiate the new motif by dragging and dropping it from the "Custom" panel in the lower-left.

If you decide you want to restore the nodes inside a motif to the workspace as normal nodes, select a motif and click the "Unwrap motif" button.

Complementarities
-----------------

To declare complementarities between ports:

-	Select the "Complementarity" tool
-	Drag from one port to another to declare complementarity. You may drag from Input to output, or	Bridge to bridge; other connections will be disallowed. You may also add connections between ports within a motif, but not between ports inside and outside the motif.

Compiling
---------

Once your system is assembled, you can generate a picture of the underlying species, and generate input to sequence designers, using the "Build" tool. Select the "Build" tab in the ribbon, then click "Compile". This will generate several files, which will appear as siblings to your system in the files tree:

-	(system)`.dynaml` - A formal, textual representation of your system (in the Dynamic Nucleic Acid Markup Language--DyNAML)
-	(system)`.svg` - A graphical representation of the underlying species in your system
-	(system)`.nupack` - A textual input file for the NUPACK multi-objective thermodynamic sequence designer
-	(system)`.domains` - A textual input file for [WebDD](web-dd)
-	(system)`.pil` - A version of the compiled system in the Pepper Intermediate Language (PIL)

You can select several other options from the drop-down next to the "Compile" button:

-	Clean – Deletes any of the above files in the same directory as your system.
-	Compile with Compiler v2b – Compile with an old version of the compiler
-	Compile locally – Compile in your browser (not on the server); this will not generate any output, but can be used for debugging.
