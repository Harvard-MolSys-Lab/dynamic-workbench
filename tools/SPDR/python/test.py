from classes import *
from prediction import *
from visualization import Visualize
import sys, csv
import master
import timeit


# Tests of Nussinov Algorithm:

# tests that in the case of a strand of all one nucleotide, no base pairs are formed
perm = Permutations([Strand("DNA","Strand 1","AAAAAAAAAA")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
assert(sstr == [])
perm = Permutations([Strand("RNA","Strand 1","AAAAAAAAAA")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
assert(sstr == [])

# tests that in the case of a strand of only one nucleotide, no base pairs are formed
perm = Permutations([Strand("DNA","Strand 1","A")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
assert(sstr == [])
perm = Permutations([Strand("RNA","Strand 1","A")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
assert(sstr == [])
perm = Permutations([Strand("DNA","Strand 1","T")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
assert(sstr == [])
perm = Permutations([Strand("RNA","Strand 1","U")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
assert(sstr == [])

# tests that in the case of two complementary bases, only one pair is formed
perm = Permutations([Strand("DNA","Strand 1","AT")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
length_test = len( sstr )
assert(length_test == 1)
perm = Permutations([Strand("DNA","Strand 1","CG")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
length_test = len( sstr )
assert(length_test == 1)
perm = Permutations([Strand("RNA","Strand 1","AU")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
length_test = len( sstr )
assert(length_test == 1)
perm = Permutations([Strand("RNA","Strand 1","CG")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
length_test = len( sstr )
assert(length_test == 1)

# tests that in the case of three possible base pair interactions, only one pair is formed 
perm = Permutations([Strand("DNA","Strand 1","AAAT")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
length_test = len( sstr )
assert(length_test == 1)
perm = Permutations([Strand("RNA","Strand 1","AAAU")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
length_test = len( sstr )
assert(length_test == 1)

# tests the case where two base pairs are expected and formed 
perm = Permutations([Strand("DNA","Strand 1","AATT")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
length_test = len( sstr )
assert(length_test == 2)

# tests the case where two strands that have direct complementary bind at all instances 
perm = Permutations([Strand("DNA","Strand 1","AAAA"),Strand("DNA","Strand 2","TTTT")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "nussinov")
length_test = len( sstr )
assert(length_test == 4)


# Tests of Real-time Recalculation:

# tests changing one base to see if generates the same score matrix as the case without using
# real-time recalculation
original_perm = Permutations([Strand("DNA","STRAND1","AAAAAA")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(original_perm, "nussinov")
(sstr, seq, matrix_with_recal) = master.nussinov_realtime_execution(list_of_matrices, original_perm, "STRAND1", 0, 'T')

secondary_perm = Permutations([Strand("DNA","Strand1","TAAAAA")])
(sstr, seq, list_of_matrices_2) = master.algorithm_operator(secondary_perm, "nussinov")
matrix_without_recal = list_of_matrices_2[0]

assert (matrix_with_recal.matrix == matrix_without_recal.matrix)

# and a more complex example of this..
original_perm = Permutations([Strand("DNA","STRAND1","CATACTAGCA")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(original_perm, "nussinov")
(sstr, seq, matrix_with_recal) = master.nussinov_realtime_execution(list_of_matrices, original_perm, "STRAND1", 2, 'A')

secondary_perm = Permutations([Strand("DNA","Strand1","CAAACTAGCA")])
(sstr, seq, list_of_matrices_2) = master.algorithm_operator(secondary_perm, "nussinov")
matrix_without_recal = list_of_matrices_2[0]

assert (matrix_with_recal.matrix == matrix_without_recal.matrix)


# Tests of Zuker Algorithm:

# tests that in the case of strand of one nucleotide, no base pairs are formed
perm = Permutations([Strand("DNA","Strand 1","A")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "zuker")
assert(sstr == [])
perm = Permutations([Strand("RNA","Strand 1","A")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "zuker")
assert(sstr == [])

# tests the case that for small sequences the zuker algorithm yields no base pair interactions
perm = Permutations([Strand("DNA","Strand 1","AATT")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "zuker")
length_test = len( sstr )
assert(length_test == 0)

# tests the case where minimum size of loop is achieved with three bases and one pair is formed
perm = Permutations([Strand("DNA","Strand 1","AAAAT")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "zuker")
length_test = len( sstr )
assert(length_test == 1)
assert(sstr == [(0,4)])

perm = Permutations([Strand("DNA","Strand 1","CAAAG")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "zuker")
length_test = len( sstr )
assert(length_test == 1)
assert(sstr == [(0,4)])

perm = Permutations([Strand("DNA","Strand 1","GAAAT")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "zuker")
length_test = len( sstr )
assert(length_test == 1)
assert(sstr == [(0,4)])

# tests that G/C base pairs are stronger than A/T base pairs
perm = Permutations([Strand("DNA","Strand 1","AAAGGGTTTCCC")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "zuker")
length_test = len( sstr )
assert(length_test == 3)
assert(sstr == [(3, 11), (4, 10), (5, 9)])

# tests that for larger systems, Zuker gives expected results from calculations
perm = Permutations([Strand("DNA","Strand 1","AAATCCCGTCCCAGGTT")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(perm, "zuker")
inf = float("inf")
assert(list_of_matrices[0].matrix == [[inf, inf, inf, inf, 4.9, 4.4, 0, 0, 0, 0, 0, 0, 0, 0, -2.9, -2.9, -3.6], [inf, inf, inf, inf, inf, 4.9, 4.4, 0, 0, 0, 0, 0, 0, 0, -2.9, -2.9, -3.6], [inf, inf, inf, inf, inf, inf, 4.9, 4.4, 0, 0, 0, 0, 0, 0, -2.9, -2.9, -2.9], [inf, inf, inf, inf, inf, inf, inf, 4.9, 4.4, 0, 0, 0, 0, 0, -2.9, -2.9, -2.9], [None, inf, inf, inf, inf, inf, inf, inf, 4.9, 4.4, 0, 0, 0, 0, -2.9, -2.9, -2.9], [None, None, inf, inf, inf, inf, inf, inf, inf, 4.9, 4.4, 0, 0, 0, -2.9, -2.9, -2.9], [None, None, None, inf, inf, inf, inf, inf, inf, inf, 4.9, 4.4, 0, 0, 0, -0.2, -0.2], [None, None, None, None, inf, inf, inf, inf, inf, inf, inf, 4.9, 4.4, 0, 0, -0.2, -0.2], [None, None, None, None, None, inf, inf, inf, inf, inf, inf, inf, 4.9, 4.4, 0, 0, 0], [None, None, None, None, None, None, inf, inf, inf, inf, inf, inf, inf, 4.9, 4.4, 0, 0], [None, None, None, None, None, None, None, inf, inf, inf, inf, inf, inf, inf, 4.9, 4.4, 0], [None, None, None, None, None, None, None, None, inf, inf, inf, inf, inf, inf, inf, 4.9, 4.4], [None, None, None, None, None, None, None, None, None, inf, inf, inf, inf, inf, inf, inf, 4.9], [None, None, None, None, None, None, None, None, None, None, inf, inf, inf, inf, inf, inf, inf], [None, None, None, None, None, None, None, None, None, None, None, inf, inf, inf, inf, inf, inf], [None, None, None, None, None, None, None, None, None, None, None, None, inf, inf, inf, inf, inf], [None, None, None, None, None, None, None, None, None, None, None, None, None, inf, inf, inf, inf]])
assert(sstr == [(1, 16), (5, 14), (7, 13), (8, 12)])




# Testing speed of realtime recalculation of Nussinov

# with recalc at 4th base of 40 base structure...
original_perm = Permutations([Strand("DNA","STRAND1","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(original_perm, "nussinov")

def with_recal_1():
	(sstr, seq, matrix_with_recal) = master.nussinov_realtime_execution(list_of_matrices, original_perm, "STRAND1", 3, 'T')

def without_recal_1():
	secondary_perm = Permutations([Strand("DNA","Strand1","AAATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")])
	(sstr, seq, list_of_matrices_2) = master.algorithm_operator(secondary_perm, "nussinov")
	matrix_without_recal = list_of_matrices_2[0]


time_with_recalc_1 = timeit.Timer(setup='from __main__ import with_recal_1', stmt='with_recal_1()').timeit(300)
time_without_recalc_1 = timeit.Timer(setup='from __main__ import without_recal_1', stmt='without_recal_1()').timeit(300)


# with recalc at 21st base of 40 base structure...
original_perm = Permutations([Strand("DNA","STRAND1","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(original_perm, "nussinov")

def with_recal_2():
	(sstr, seq, matrix_with_recal) = master.nussinov_realtime_execution(list_of_matrices, original_perm, "STRAND1", 20, 'T')

def without_recal_2():
	secondary_perm = Permutations([Strand("DNA","Strand1","AAAAAAAAAAAAAAAAAAAATAAAAAAAAAAAAAAAAAAA")])
	(sstr, seq, list_of_matrices_2) = master.algorithm_operator(secondary_perm, "nussinov")
	matrix_without_recal = list_of_matrices_2[0]


time_with_recalc_2 = timeit.Timer(setup='from __main__ import with_recal_2', stmt='with_recal_2()').timeit(300)
time_without_recalc_2 = timeit.Timer(setup='from __main__ import without_recal_2', stmt='without_recal_2()').timeit(300)


# with recalc at 38th base of 40 base structure...
original_perm = Permutations([Strand("DNA","STRAND1","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")])
(sstr, seq, list_of_matrices) = master.algorithm_operator(original_perm, "nussinov")

def with_recal_3():
	(sstr, seq, matrix_with_recal) = master.nussinov_realtime_execution(list_of_matrices, original_perm, "STRAND1", 37, 'T')

def without_recal_3():
	secondary_perm = Permutations([Strand("DNA","Strand1","AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATAA")])
	(sstr, seq, list_of_matrices_2) = master.algorithm_operator(secondary_perm, "nussinov")
	matrix_without_recal = list_of_matrices_2[0]


time_with_recalc_3 = timeit.Timer(setup='from __main__ import with_recal_3', stmt='with_recal_3()').timeit(300)
time_without_recalc_3 = timeit.Timer(setup='from __main__ import without_recal_3', stmt='without_recal_3()').timeit(300)


print "\nwith recalc at 4th base of 40 base structure..."
print time_with_recalc_1
print "without recalc..."
print time_without_recalc_1

if time_with_recalc_1 <= time_without_recalc_2:
	print "Yay... Recalculation was faster!"
else:
	print "It seems recalculation was not faster in this instance ... :/ "

print "\nwith recalc at 21st base of 40 base structure..."
print time_with_recalc_2
print "without recalc..."
print time_without_recalc_2

if time_with_recalc_2 <= time_without_recalc_2:
	print "Yay... Recalculation was faster!"
else:
	print "It seems recalculation was not faster in this instance ... :/ "

print "\nwith recalc at 38th base of 40 base structure..."
print time_with_recalc_3
print "without recalc..."
print time_without_recalc_3

if time_with_recalc_3 <= time_without_recalc_3:
	print "Yay... Recalculation was faster!"
else:
	print "It seems recalculation was not faster in this instance ... :/ "

#print perm.get_concatamer()

#def print_matrix(matrix):
#    print "\nCSV:\n"
#    writer = csv.writer(sys.stdout, delimiter="\t")
#    writer.writerows(map(lambda row: map(lambda x: None if x==None else round(x,3), row), matrix) )
#    print "\nMatrix:\n"
#    print "Length: "+str(len(matrix))
    #print nussinov.to_score_matrix().matrix
#    for row in matrix:
 #       print str(len(row))+": "+ str(row)


#print "\nNussinov:\n"
#nussinov = NussinovPredictor(perm,None)
#
#nussinov.generate_score_matrix()
#print "\nCSV:\n"
#writer = csv.writer(sys.stdout, delimiter="\t")
#writer.writerows(nussinov.to_score_matrix().matrix)
#print "\nMatrix:\n"
#print "Length: "+str(len(nussinov.to_score_matrix().matrix))
##print nussinov.to_score_matrix().matrix
#for row in nussinov.to_score_matrix().matrix:
#    print str(len(row))+": "+ str(row)
#
#print nussinov.traceback()


#sstr = nussinov.to_structure()
#(seq,length) = nussinov.get_sequence()


#print "\nZuker:\n"
#zuker = ZukerPredictor(perm,None)

#zuker.generate_score_matrix()
#print_matrix(zuker.to_score_matrix().matrix)
#print_matrix(zuker.score_matrix_v.matrix)

#print zuker.traceback()

#sstr = zuker.to_structure()
#(seq,l) = zuker.get_sequence()
#vis = Visualize()
#vis.viz_circle(sstr, seq)