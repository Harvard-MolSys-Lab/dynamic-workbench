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

See [Web DD](web-dd)

Analysis and Simulation
-----------------------

Workbench provides an interface to the powerful nucleic acid computation package [NUPACK](http://www.nupack.org). To perform NUPACK calculations of sequences, from the sequence editor, select a set of strands, then select one of the available calculations from the "Compute" menu:

* MFE Complexes - Computes the structure, free energy, and relative concentrations of the various complexes expected at equilibrium. To speed up computation, you can select a maximum complex size to prevent NUPACK from comparing complexes containing more than the indicated number of species.
* Pairwise MFE Complexes - Same as MFE, except the max complex size defaults to 2.
* Subsets MFE - not implemented
* Brute force - not implemented
