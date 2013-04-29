Pepper Systems
==============

## Overview

*Pepper* is a DNA circuit compiler developed by Shawn Ligocki in Erik Winfree's group at Caltech. It assists DNA programmers in building DNA computers by providing a templating language for specifying generic components and interfacing with state of the art designers and kinetic simulators to create and test sequences. Much like [DyNAMiC](dynamic), it can be used to design generic components and to 

Pepper systems are comprised of _components_ and _systems_. Components are re-usable "building blocks," which can be composed together to form systems. The rest of this documentation was written by Shawn Ligocki, and describes the syntax for Pepper component and system files. 


## Pepper File syntax

### Pepper Components

A component file (name.comp) contains the specification for a single
component in a DNA system (like an AND gate or a threshold, etc.). It
specifies the secondary structure, kinetic and sequence constraints for
that component. System files are used to connect together components.

The component syntax is based on Joe Zadeh's design specification
syntax.

#### Comments

The pound sign (\#) denotes that the rest of the line is a comment
(python/sh style comments):

`   # This is a comment`

Comments may appear on their own lines or after a command, like so:

`   declare component And22: x + y -> s + c  # This is the function declaration`

#### Component Declaration

In the spirit of Matlab's first line declarations, each component needs
to have a declaration statement at the first line of code. Syntax:

`      declare component `<name>`: `<inputs>` -> `<outputs>

For example:

`   declare component And22: x + y  ->  s + c`

The <inputs> and <outputs> are '+' separated lists of sequences that
will be defined and used below in the specification. These sequences
will be constrained on the system level and so usually represent the
recognition regions of the inputs and outputs. Waste byproduct will
generally not be represented here, because it will not be constrained on
the system level.

<name> should be the same as the base name of the component file (i.e.
this file should be HalfAdder.comp).

#### Sequences

In order to constrain some regions/subdomains of some strands to be
complementary to regions on other strands we define sequence regions:

`   sequence `<name>` = `<constraints>` : `<length>

For example:

`   sequence x = "6N S 13N S" : 21`

''The total length constraint is optional; if you don't want it, omit it
and the colon.

We include the (redundant) length input for quick error checking as
complex constraints can be easily misnumbered. In addition one wildcard
(?) may be used instead of a number, to imply (make this as large as
possible to fit the specified total length. For example:

`   sequence dx = "S ?N S" : 15`

is the same as:

`   sequence dx = "S 13N S" : 15`

Sequence region definitions may include previously defined regions, for
example:

`   # The toehold, clamp and data region of the carry-bit output`

`   sequence tc =  "6N" :  6`

`   sequence cc =  "1S" :  1`

`   sequence dc = "29N" : 29`

`   # We combine them into a single label`

`   sequence  c = tc1 cc1 dc1 : 36`

So now, for example:

`   c* = dc* cc* tc*`

We use quotes for nucleotide constraints so that we can distinguish them
from other sequence names and group them (each pair of quotes denotes
one domain).

#### Strands

Strands represent individual strand of DNA in the system. The syntax is:

`   strand `<name>` = `<list of sequences and explicit constraints>` : `<length>

For example:

`   strand C = "?N" c : 44`

The "?N" is an explicit constraint. First of all, it uses the wildcard,
so it fills the remaining space on the left. Furthermore, since it is
never declared as a sequence it will be constrained only by what it is
forced to bind to. The idea is that you have a data region of the strand
and some other regions that you're required to have, but don't want to
name.

#### Structures

Now we glue the strands together to make multi-stranded (or
single-stranded) structures:

`   structure `<name>` = `<list of strands>` : `<secondary structure>

So continuing the above example:

`   structure Gate = X + C + S + Y : U6 H15(+ H15(U29 + U14 H15(+)))`

using [Joe Zadeh's (H)elix (U)npaired
notation](Joe Zadeh's (H)elix (U)npaired notation "wikilink") or, say

`   structure Gate = X + C + S + Y : 6. 15( + 15( 29. + 14. 15( + 45)`

in a sort of shorthand dot-paren notation (where each number is a
multiplier on the symbol following it).

By default it is assumed that you want to optimize the thermodynamics of
the structure to be as close to the specified secondary structure as
possible. If not, you can tell the compiler not to optimize a specific
structure. For example:

`   structure [no-opt] Gate = X + C + S + Y : U6 H15(+ H15(U29 + U14 H15(+)))`

This can be useful for two reasons. First, you may with to impose
base-pairing constraints but don't want thermodynamic optimization, for
example, because you know this structure is not the MFE structure.
Second, you may want the compiler to know that these strands should be
grouped together as a complex, but the intended complex has psuedoknots
that cannot (yet) be properly expressed in Pepper.

Alternatively for limited optimization:

`   structure [10nt] Gate = X + C + S + Y : U6 H15(+ H15(U29 + U14 H15(+)))`

This aims to be within 10 nucleotides of the specified structure, on
average. Note that how these parameters are interpreted is up to the
back-end sequence designer. E.g. Zadeh's designer will try to minimize
the average number of incorrect nucleotides; another designer might want
the MFE structure to be within 10 nucleotides; the SpuriousC designer
could use the parameter for some kind of weighting, but currently
doesn't.

We can also specify the secondary structure on the domain level:

`   structure Gate = X + C + S + Y : domain .(+(.+.(+)))`

assuming, for example, that the strands had been defined as

`   strand X = toe_x data_x`

`   strand C = carry "29N"`

`   strand S = "14N" sum`

`   strand Y = sum* carry* data_x*`

Here each dot-paren represents an entire domain.

#### Kinetics

Now all we have left is to explain the desired kinetics, what structures
will interact and what will they produce:

`   kinetic `<input structures>` -> `

<output structures>
So if we're working with the half adder, we might have:

`   kinetic inX + Gate        ->  waste_X + inter_G`

`   kinetic inY + inter_Gate  ->  waste_Y + outS + outC`

I might allow some optional parameters to fine tune these, maybe
specifying fuzzy states or desired speed of reactions.

#### Examples

-   [DNA compiler/And22.comp](DNA compiler/And22.comp "wikilink")

### Pepper Systems

A system file (name.sys) contains a specification for the connectivity
of [components](DNA compiler/component syntax "wikilink") in a DNA
system. It specifies each component and and ties their signal sequences
together. A system may be used as a component in a larger system.

#### Comments

The pound sign (\#) denotes that the rest of the line is a comment
(python/sh style comments): \# This is a comment Comments may appear on
their own lines or after a command, like so:

`   import And22  # Half adder is used in the first layer only`

#### System Declaration

In the spirit of Matlab's first line declarations, each system needs to
have a declaration statement at the first line of code. Syntax:

`   declare system `<name>`: `<inputs>` -> `<outputs>

For example:

`   declare system HalfAdder: x0 + y0  ->  s0 + c1`

The <inputs> and <outputs> are '+' separated lists of sequences that
will be constrained to components below.

These are used if this is a system being used as a component. However,
for top-level systems, we will not have inputs and outputs and so

<name> should be the same as the base name of the component file (i.e.
this file should be HalfAdder.comp).

#### Imports

In order to use a component file you must import it first
(python-style). Syntax:

`   import `<component name> `For example:`

`   import And22`

You may import from a different directory/name than the name you use in
the file. For example:

`   import Georg0711/Parallel_And22 as And22`

which would import from the component file 'Parallel\_And22.comp' from
the directory 'Georg0711/', but still use the name And22 in the
specification.

#### Components

This is the meat of the circuit file. You must make one statement for
each component in the DNA system specifying the input and output
sequences. The syntax is:

`   component `<name>` = `<component name>`: `<list of input sequences>` -> `<list of output sequences>

for example

`   component G0_01 = And22: nx0 + y0  ->  s0 + nc1`

Note: Components **may** have 0 inputs or 0 outputs (or even both, if
you can find that useful). Example:

`   component DNS0 = Detector: ns0 ->`

Is a 'ns0' detector. It will activate if ns0 is input but doesn't
produce any outputs for downstream gates.

#### Examples

-   [DNA compiler/Half Adder](DNA compiler/Half Adder "wikilink")
-   [DNA compiler/Two-Bit Adder](DNA compiler/Two-Bit Adder "wikilink")


## Pepper Intermediate Language (PIL)


