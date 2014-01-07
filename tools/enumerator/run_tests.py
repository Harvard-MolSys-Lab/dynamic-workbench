import unittest
from test_condense import CondenseTests
unittest.main()


#from input import input_standard
#from utils import *
#from reactions import *
#
#polymer_enum = input_standard('test_files/test_input_standard_polymer.in')
#polymer_enum.MAX_COMPLEX_COUNT = 10
#polymer_enum.enumerate()
#print "%d Complexes" % len(polymer_enum.complexes)
#print "%d Reactions" % len(polymer_enum.reactions)
## We're not examining len(polymer_enum.complexes) because that doesn't include ._S, which *is* 
## tested for in the failure mode.
#assert((len(polymer_enum.complexes) + len(polymer_enum._S)) >= polymer_enum.MAX_COMPLEX_COUNT)
#
#complexes = polymer_enum._E + polymer_enum._T + polymer_enum._S
#assert max([len(c.strands) for c in complexes]) <= polymer_enum.MAX_COMPLEX_SIZE
#
## Now we want to make sure that no reactions in the enumerator point to complexes that weren't in the list
#undefined_complexes = []
#
#print '--------------------------------------------'
#
#for reaction in polymer_enum.reactions:
#    for product in reaction.products:
#        if not (product in polymer_enum.complexes):
#            undefined_complexes.append(product)
#            print reaction
#            print product
#print undefined_complexes
#
##
##three_arm_nodal_enum = input_standard('test_files/examples/3-arm-junction.enum')
##three_arm_nodal_enum.MAX_REACTION_COUNT = 5000
##try:
##    three_arm_nodal_enum.enumerate()
##except:
###    print "E:"
###    print three_arm_nodal_enum._E
###    print "T:"
###    print three_arm_nodal_enum._T
###    print "S:"
###    print three_arm_nodal_enum._S
##    
##    
###    list_a = three_arm_nodal_enum._T
###    
###    dups = [x for x in list_a if list_a.count(x) > 1]
###    print dups
###    print len(three_arm_nodal_enum._E) + len(three_arm_nodal_enum._T) + len(three_arm_nodal_enum._S)
##
##
##    print "\n".join([str(x) for x in three_arm_nodal_enum.reactions])
#
#
##    assert sorted(list(set(three_arm_nodal_enum._T))) == sorted(three_arm_nodal_enum._T) 
#    
##    same = []
##    for (i,c1) in enumerate(three_arm_nodal_enum._T):
##        for c2 in three_arm_nodal_enum._T[:i] + three_arm_nodal_enum._T[i+1:]:
##            same.append((c1,c2))
##    print same
#    
#
#
##import nose
##nose.main()
#
##import unittest
##from utils import *
##from input import input_standard
##from enumerator import *
##from nose.tools import *
##
##seesaw_enumerator = input_standard('test_files/examples/seesaw/seesaw.enum')
###seesaw_enumerator = input_standard('test_files/examples/seesaw/seesaw2.enum')
##enum = seesaw_enumerator
##
##domains = {}
##strands = {}
##complexes = {}
##
##for domain in enum.domains:
##    domains[domain.name] = domain
##        
##for strand in enum.strands:
##    strands[strand.name] = strand
##
##for complex in enum.initial_complexes:
##    complexes[complex.name] = complex
##
###combine_complexes_21(complexes['C2'], (0,1), complexes['C1'], (0,3))
##enum.enumerate()
#
#
##enum = input_standard('test_files/combine_complexes_test.in')
##domains = {}
##strands = {}
##complexes = {}
##
##for domain in enum.domains:
##    domains[domain.name] = domain
##        
##for strand in enum.strands:
##    strands[strand.name] = strand
##
##for complex in enum.initial_complexes:
##    complexes[complex.name] = complex
##    
##
##print find_external_strand_break(complexes["C1"],(1,4))
##print find_external_strand_break(complexes["C2"],(1,2))
##
##C3 = reactions.combine_complexes_21(complexes["C1"], (1,4), complexes["C2"], (1,2))
##
##print C3
