Domain Design (Web DD)
======================

Overview
--------

Web DD (Web Domain Designer) is a domain-based stochastic sequence designer. This means that DD works by designing sequences for a set of domains, then performing random mutations on those domains. Random mutations are evaluated for fitness by examining whether they improve an objective function (you can read more about this under "Scoring Function" below).

Web DD can be used to rapidly design a set of non-interacting sequences which also satisfy several important criteria, such as minimizing base repeats.

Web DD is based on Domain Designer (DD), written by Dave Zhang. Reading his [original whitepaper](/etc/papers/dd_lncs.pdf) on DD is highly recommended.


Adding, Deleting, and Editing Domains
-------------------------------------

Domains can be added to DD using the "Add" button. By default, added domains will be of length 8. You can click the drop-down arrow to the right of the "Add" button to specify a different length. Once a value is entered for "New domain length:", that will become the new default (i.e. entering 9, then clicking the "Add" button 3 times will insert 3 new domains of length 9).

A list of specific domains can be added by selecting "Add specific domains..." from the "Add" button dropdown.

Domains can be deleted using the "Delete" button. Select a domain in the domain list, then click "Delete"

The current sequence of a domain can be edited by:

*	double-clicking their sequence, composition, importance, or targeting, entering a new value, and pressing enter/return, or:
*	selecting the domain and clicking "Edit"

Individual bases of a domain can be locked by typing capitalizing them; this will prevent DD from mutating them.

Composition, Importance, and Targeting
--------------------------------------

There are three parameters which can be modified for each domain within the domain list:

*	Importance is a multiplicative factor which tells DD how heavily to weight a particular domain when scoring. A higher importance will mean that defects in that domain will be more heavily penalized.
*	Composition determines which bases should be allowed in a given domain
*	Target – if any domains are marked to be "targeted", then mutations will only occur within those domains. If no domains are targeted, then the domain with the lowest score in the ensemble will be targeted for a mutation.
	*	Targeting several domains can also be thought of as locking all other domains in the ensemble.

Mutating
--------

Mutations may be started and stopped by clicking the "Mutate" button. In the lower right hand corner of the domains list, you can view the current (lowest) score, as well as the number of mutation attempts and the number of successful mutations.

Design options (rules)
----------------------

There are lots of options which you can change to affect how DD chooses domains; you may wish to change these depending on the specific needs of your project, but usually the defaults are sufficient.

Threading structures
--------------------

DD can also assemble your domains into a larger structure, using an input format similar to the NUPACK multiobjective design script. 

To thread sequences from an existing DD session onto strands:

*	Open the "Structure" pane on the right hand side of the designer
*	Describe a series of strands in NUPACK domain composition syntax:
*	Click the "Update" button
*	Begin mutations; your strands will appear in the "Strands" pane on the bottom of the designer.

To generate sequences for a NUPACK-style design specification:

*	Open the "Structure" pane on the right hand side of the designer
*	Save your design as a `.domains` file, and open it in Web DD, OR copy and paste your design into the "Structure" panel
*	Click the "Update" button within the "Structure" window.
	*	Note: If you have domains within your design with the same names as domains in your structure, the domains in your design will not be overwritten. If you select "Reseed existing domains" under the "Update" button drop-down, domains in your design will be resized and reseeded according to your structure specification 

You can separately save your structure, strands, and domains using the "Save" buttons in each of the panels.

### Naming domains

Domains can be named in your structure specification. If you add additional domains using the "Add" button, they will be named auomatically with numbers. 

Score parameters
----------------

Score parameters affect the weighting of specific factors in the domain scoring function (described below and in [Dave's whitepaper](/etc/papers/dd_lncs.pdf)). You should very rarely need to change these based on specific needs of your project; however, our choices for these parameter values were mostly arbitrary, so feel free to change as you wish.

Scoring function
----------------

Details forthcoming; for now see [Dave's whitepaper](/etc/papers/dd_lncs.pdf).
