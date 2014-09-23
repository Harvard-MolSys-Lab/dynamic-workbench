Segment-level/Domain-level Systems
==================================

*Segments*, known elsewhere in the literature as *domains*, are contiguous regions of basewise complementarity. For instance, the following strand: 

	AAAAA GGGG TTTT

Might be considered to consist of three segments. Segment-level designs are often more convenient than behavioral or sequence-level designs. 

Workbench has several facilities for handling systems at a segment level: 

- The [DyNAMiC Intermediate Language](dil) is the result of compiling [Nodal](nodal) systems using [DyNAMiC](dynamic). DIL features a sophisticated graphical editor, and can be exported to various sequence designers, as well as the [reaction enumerator](enumerator). 
- [Pepper Intermediate Language](pil) is the result of compiling a [Pepper](pepper) system with the Pepper compiler. 

