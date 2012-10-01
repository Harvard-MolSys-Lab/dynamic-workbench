Working with Sequences
======================

Workbench has many powerful tools for working with sequences of bases.

Sequence Editor
---------------

The sequence editor provides lots of tools for working with sequences as standard text files: The editor color-codes bases in the sequence, allows various metrics to be easily calculated, and exposes functions for formatting, transforming, and manipulating sequences.

Most operations in the sequence editor operate on a set of strands. Each separate line is assumed to be on a separate strand. Most operations will replace the selection with the indicated transformation (e.g. selecting "Transform", then "Reverse" will replace the selected sequence with its bases in reverse order). For operations in the "Transform" menu, this can be disabled by unchecking "Replace Selection"; this will cause the transformation to be inserted below each strand.

To view details about each of the menu items in the sequence editor, just hover your mouse over it; help will appear in a tooltip.

Sequence Designers
------------------

-	[Web DD](web-dd) - A stochastic, domain-based sequence designer; can be used to design sequences for large systems very quickly by designing a set of noninteracting domains and then threading those domains together to form full strands.
-	NUPACK Thermodynamic sequence designer - Uses Caltech's NUPACK web server to perform multi-objective thermodynamic sequence design. NUPACK produces thermodynamically optimized sequences, but can be slow for some systems.
	To use: Enter a design using the NUPACK multi-objective sequence design script, select relevant parameters, and click "Design"; the task will be submitted to the Caltech server, and a popup window will be opened taking you to the results page.
-	Multisubjective sequence designer (coming soon)


Analysis and Simulation
-----------------------

NOTE: The below features are deprecated. Please see [Simulation and Analysis](simulation-analysis) instead.

Workbench provides an interface to the powerful nucleic acid computation package [NUPACK](http://www.nupack.org). To perform NUPACK calculations of sequences, from the sequence editor, select a set of strands, then select one of the available calculations from the "Compute" menu:

* MFE Complexes - Computes the structure, free energy, and relative concentrations of the various complexes expected at equilibrium. To speed up computation, you can select a maximum complex size to prevent NUPACK from comparing complexes containing more than the indicated number of species.
* Pairwise MFE Complexes - Same as MFE, except the max complex size defaults to 2.
* Subsets MFE - not implemented
* Brute force - not implemented
