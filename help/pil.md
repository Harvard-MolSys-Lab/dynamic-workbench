Pepper Intermediate Language (PIL)
==================================

The Pepper Intermediate Language (PIL) follows the basic constructions of the [Pepper](pepper) language, but disallows some features (sequence constraints, components, etc.)

Each PIL line should consist of a directive of one of the following forms:

-	`sequence <name> = <sequence>` -- declare a new domain
-	`strand <name> = <list of sequences and explicit constraints>` -- declare a strand comprised of domains
-	`structure <name> = <list of strands> : <secondary structure>` -- declare a complex comprised of several strands
-	`kinetic <input structures> -> <output structures>` -- declare a reaction between several structures
