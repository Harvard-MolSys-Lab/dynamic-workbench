DyNAMiC Nucleic Acid Markup Language (DyNAML)
=============================================

The DyNAMiC Nucleic Acid Markup Language (DyNAML) is the natural input langauge to DyNAMiC---the primary behavioral compiler associated with Workbench. DyNAML allows you to specify high-level behavioral functions using a simple text-based markup language. DyNAML is a subset of [JSON](http://json.org/)---the Javascript Object Notation. DyNAML documents are called libraries; each library contains: 

-	A collection of motifs --- templates for nodal species
-	A collection of nodes --- individual behavioral units that will be translated to real DNA strands
-	A set of parameters which guide formation of the final design. 

The full DyNAML language is described in [this whitepaper](/etc/papers/nodal.pdf). This document describes only the "Short notation" used several places within Workbench. 

Short notation {#short-notation}
--------------

*Short notation* allows you to abbreviate longer blocks of DyNAML code using single strings. Most commonly this is used to describe the domain- and segment-makeup of a strand. The following example illustrates the features of DyNAML short notation.

This string in DyNAML short notation... 

	A[a:t b c(4)]i+ B[d c* b*:t]o-

...is equivalent to the following string of full DyNAML:

	[
		{
			"name": "A",
			"segments": [
				{
					"name": "a",
					"role": "toehold"
				},
				{
					"name": "b"
				},
				{
					"name": "c",
					"length": 4
				}
			],
			"role": "input",
			"polarity": "+"
		},
		{
			"name": "B",
			"segments": [
				{
					"name": "d"
				},
				{
					"name": "c*"
				},
				{
					"name": "b*",
					"role": "toehold"
				}
			],
			"role": "output",
			"polarity": "-"
		}
	]

Specifically:

	A[a:t b c(4)]i+ B[d c* b*:t]o-
	^  ^      ^  ^               ^
	1  2      3  4               5

1. Brackets are used to group segments into domains. A name for the domain should appear immediately before the brackets. Names need not be a single-letter.
2. Within the brackets should be a space-separated list of segments. Segment names need not be letters. Complements of a particular segment identity can be indicated with a * or a '.  The _role_ of a segment can be indicated by adding colon and a role specifier after the segment name. The valid role specifiers are:
	-	`t` or `toehold` - Represents a toehold segment
	-	`c` or `clamp` - Represents a short "clamp" segment, designed to prevent leakage by exposure of sequestered toeholds during transient breathing.
3. The length of segments will be automatically inferred from their role. The length can also be specified explicitly using parenthesis. If a role specifier is needed, this should be added after the length.
4. The _role_ of domains follow the bracketed list. The following role specifiers are allowed for domains:
	-	`i` or `input` for input domains – domains which contain exposed toeholds, such that binding causes branch migration which exposes some number of sequestered toeholds in other domains.
	-	`o` or `output` for output domains - domains whose toeholds, when exposed, bind to input domains and participate in branch migration reactions
	-	`b` or `bridge` for bridge domains - domains which bind to other exposed bridge domains, but do not participate in branch migration
	-	`x` or `structural` for structural domains - domains which do not bind to other exposed domains and only serve to allow the meta-stable form of a node to adopt a particular configuration
5. A `+` or `-` sign can be used to indicate the "relative polarity" of a domain. This is used to indicate whether domains on downstream nodes need to be flipped to connect to this port. By convention, domains with 5' toeholds are labeled `+` and domains with 3' toeholds are labeled `-`. 
	-	For example: if a node with an input domain has a 5' toehold and another node with an ouput domain has a 3' output toehold, the two can be connected together properly and the strands will be antiparallel. However, if the output node had a 5' toehold, the node containing the output port would need to be "flipped" in order to be connected with the input port. In the first case, the input domain would be `+` and the output domain `-`. In the second case, both domains would be `+`. The polarity of _nodes_ (e.g. whether they must be flipped) is determined by DyNAMiC, but relative polarities of ports must be specified by the motif designer.
	-	For domains without polarities, the `+` or `-` can be omitted, or can be replaced with a `0`. 




