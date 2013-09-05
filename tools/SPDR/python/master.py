#! /usr/bin/env python

# RNAmazing:  CS51 Final Project

# imports necessary python libraries
import sys
import fnmatch
import re
import string

# imports .py files we have created
import classes
import prediction
import visualization
import master


# checks validity of command line arguments
def cmdline_validation():
	if (len(sys.argv) != 5):
		print "Usage: python master.py filename.txt visualization algorithm input"
		sys.exit()
	else:
		file = sys.argv[1]
		third_arg = string.upper(sys.argv[2])
		fourth_arg = string.upper(sys.argv[3])
		fifth_arg = string.upper(sys.argv[4])
		if (third_arg != "CIRCLE") & (third_arg != "DOTPAREN") & (third_arg != "ARC") & (third_arg != "MOUNTAIN"):
			print "Usage: possible visualization types include DOTPAREN CIRCLE ARC MOUNTAIN"
			sys.exit()
		if (fourth_arg != "NUSSINOV") & (fourth_arg != "ZUKER"):
			print "Usage: possible algorithm types include NUSSINOV ZUKER"
			sys.exit()
		if (fifth_arg != "DEFAULT") & (fifth_arg != "FASTA") & (fifth_arg != "NUPACK"):
			print "Usage: possible input types include DEFAULT FASTA NUPACK"
			sys.exit()
		if not(fnmatch.fnmatch(file, '*.txt')):
			print "File should be of type '.txt'"
			sys.exit()

def import_from_file():
	if string.upper(sys.argv[4]) == "DEFAULT":
		return import_default()
	elif string.upper(sys.argv[4]) == "FASTA":
		return import_fasta()
	else:
		return import_nupack()
			
# checks validity of input file format, and returns a Permutations object
def import_default():
	# tries to open file
	try:
		file = open(sys.argv[1])
	except IOError:
		print "This file could not be opened"
		sys.exit()

	# initializes a list for strand objects
	strands_list = []

	# iterates over all strands in file
	# strands are of type {name;material;sequence} separated by new lines
	for line in file:

		# re-formats and checks the input
		strand = string.rstrip(string.upper(line))
		strand_length = len(strand)
		if (strand[0] != '{') | (strand[strand_length-1] != '}'):
			print "ERROR:  Format for strands is {name;material;sequence}"
			sys.exit()
		strand = string.rstrip(string.lstrip(string.rstrip(string.upper(line)),'{'),'}')
	
		# initializes variables to read in the strand
		strand_name = ""
		string_counter = 0
		# accounts for the fact that we just removed two elements from strand
		strand_length = strand_length-2
	
		# isolates strand name
		for i in range(0, strand_length):
			if (strand[i] != ';'):
				strand_name += strand[i]
				string_counter += 1
			else:
				string_counter += 1
				break

		# catches if two strings have the same name
		def name_check(x): return (x.name == strand_name)
		if filter(name_check, strands_list) != []:
			print "ERROR:  No two strands can have the same name"
			sys.exit()
		print "Strand name:  " + strand_name

		# catches if there is an error in formatting
		if string_counter == strand_length:
			print "ERROR:  Format for strands is {name;material;sequence}"
			sys.exit()
	
		# isolates and validates material
		material = ""
		for i in range(string_counter, strand_length):
			if (strand[i] != ';'):
				material += strand[i]
				string_counter += 1
			else:
				string_counter += 1
				break
		material = string.upper(material)
		if (material != "DNA") & (material != "RNA"):
			print "ERROR:  Material must be of type DNA or RNA"
			sys.exit()
		else:
			print "Material:  " + material

		# catches if there is an error in formatting
		if string_counter == strand_length:
			print "ERROR:  Format for strands is {name;material;sequence}"
			sys.exit()

		# isolates and validates sequence
		sequence = ""
		if material == "DNA":
			for i in range(string_counter, strand_length):
				c = strand[i]
				if (c == '}'):
					print "ERROR:  Format for strands is {name;material;sequence}"
					sys.exit()
				if (c != 'A') & (c != 'T') & (c != 'C') & (c != 'G'):
					print "ERROR:  DNA sequences can only consist of A, T, C, & G"
					sys.exit()
				# catches the case when someone didn't put a new line between successive strands
				sequence += c
		if material == "RNA":
			for i in range(string_counter, strand_length):
				c = strand[i]
				if (c != 'A') & (c != 'U') & (c != 'C') & (c != 'G'):
					print "ERROR:  RNA sequences can only consist of A, U, C, & G"
					sys.exit()
				else:
					sequence += c
		sequence = string.upper(sequence)
		print "Sequence:  " + sequence 
	
		# generates a strand object of the input and adds it to strand list, and generates
		# Permutations object
		strand_obj = classes.Strand(material, strand_name, sequence)
		strands_list.append(strand_obj)	
		
	multiple_permutations = classes.Permutations(strands_list)
	file.close()
	return multiple_permutations

# import function for fasta input method, returning a Permutations object
def import_fasta():
	try: 
		file = open(sys.argv[1])
	except IOError:
		print "File cannot be opened."
		sys.exit()
		
	strands_list = []
	strand_index = -1
	material = None
	sequence = ""
	
	for line in file:
		line = line.upper()
		line = line.strip("\n")
		if line[:1] == ">":
			if (strand_index > -1) & (sequence != ""):
				print "Sequence: " + sequence
				strand_obj = classes.Strand(material, title, sequence)
				strands_list.append(strand_obj)	
			strand_index += 1
			sequence = ""
			material = None
			title = line[1:].partition(" ")[0]
			print "\nStrand name: " + title
		else: 
			for c in line:
				if material == None:
					if c == "T":
						material = "DNA"
						print "Material: " + material
					elif c == "U":
						material = "RNA"
						print "Material: " + material
				if (c != 'A') & (c != 'T') & (c != 'U') & (c != 'C') & (c != 'G'):
					print "ERROR: Invalid characters in sequence"
					sys.exit()
				sequence += c
	print "Sequence: " + sequence
	strand_obj = classes.Strand(material, title, sequence)
	strands_list.append(strand_obj)	
	multiple_permutations = classes.Permutations(strands_list)
	file.close()
	return multiple_permutations					

def import_nupack():
	try:
		file = open(sys.argv[1])
	except IOError:
		print "File could not be opened."
		sys.exit()
		
	strands_list = []
	title = ""
	strand = ""
	sequence = ""
	material = None
	
	for line in file:
		line = line.upper()
		line = line.replace(" ", "")
		line = line.strip("\n")
		title, part, strand = line.partition(":")
		if strand == "":
			print "ERROR: Input must be of type NAME:SEQUENCE"
			sys.exit()
		print "\nStrand name: " + title
		for c in strand: 
			if material == None:
				if c == "T":
					material = "DNA"
					print "Material: " + material
				elif c == "U":
					material = "RNA"
					print "Material: " + material
			if (c != 'A') & (c != 'T') & (c != 'U') & (c != 'C') & (c != 'G'):
				print "ERROR: Invalid characters in sequence"
				sys.exit()
			sequence += c
		print "\nSequence: " + sequence
		strand_obj = classes.Strand(material, title, sequence)
		strands_list.append(strand_obj)	
	multiple_permutations = classes.Permutations(strands_list)
	file.close()
	return multiple_permutations

# function to find best structure of a list of structures
def find_best(structures):
	def len_fun(x):
		return len(x.get_pairs())
	scores = map(len_fun, structures)
	index_of_best = scores.index(max(scores))
	best_struct = structures.pop(index_of_best)

	# generates variables to represent the secondary structure and sequence of output
	sstr = best_struct.get_pairs()
	seq = best_struct.get_sequence()

	print "\nThe best result had the following characteristics..."
	print "Pair list: "
	print sstr
	print "Sequence: " + seq
	
	return (sstr, seq, index_of_best)


# function for carrying out algorithm on a Permutations object
def algorithm_operator(multiple_permutations, algorithm):
	# creates a list of all possible structures and score matrices
	list_of_structures = []
	list_of_matrices = []

	print "\nCalculating all possible permutations..."
	# performs algorithms on all possible permutations
	for element in multiple_permutations.permutations():
		print "\nPermutation: "+element.get_name()
		print "Sequence:  "
		print element.get_concatamer("")
		if (algorithm == "nussinov"):
			struct = prediction.NussinovPredictor(element,None)
		elif (algorithm == "zuker"):
			struct = prediction.ZukerPredictor(element,None)
		struct.predict_structure()
		list_of_structures.append(struct.to_structure())
		list_of_matrices.append(struct.to_score_matrix())
		print "Base pair interactions:  "
		print (struct.to_structure()).get_pairs()
	
	(sstr,seq,index) = find_best(list_of_structures)
	return (sstr, seq, list_of_matrices)


# nussinov algorithm with real-time recalculation set-up
def nussinov_algorithm(multiple_permutations):
	# finds result of nussinov algorithm using algorithm operator function
	(sstr, seq, matrices) = algorithm_operator(multiple_permutations, "nussinov")
	
	# pass output to visualization module
	visualization_fun(sstr,seq, string.upper(sys.argv[2]) )	
	
	nussinov_realtime_input(matrices, multiple_permutations)


# gets input for realtime recalculation
def nussinov_realtime_input(matrices, multiple_permutations):
	# real-time recalculation set-up for nussinov
	while True:
		# gets user input for any updates
		option = "q"
		input_valid = False
		while (input_valid == False):
			while (option != "y") & (option != "n"):
				option = raw_input("Would you like to make an update to your structure? [y/n]: ")
			else:
				if option == "y":
					strand_name = raw_input("Which strand would you like to update?  ")
					strand_index = (raw_input("Which zero-indexed base on this strand would you like to modify?  "))
					new_base = raw_input("What base would you like to modify this to?  " )				
				elif option == "n":
					sys.exit()
			
			try:
				strand_index = int(strand_index)
				new_struct = prediction.Recalculation(matrices[0], (multiple_permutations.permutations())[0], strand_name, strand_index, new_base)
				input_valid = True
			except ValueError:
				print "ERROR:  Index must be an integer value"
			except classes.StrandNameError:
				print "ERROR:  There is no strand with this name"
			except classes.BaseIndexError:
				print "ERROR:  Improper Index" 
			except classes.DNABaseError:
				print "ERROR:  DNA sequences can only consist of A, T, C, & G"
			except classes.RNABaseError:
				print "ERROR:  RNA sequences can only consist of A, U, C, & G"

		(sstr,seq,matrix_of_best) = nussinov_realtime_execution(matrices, multiple_permutations, strand_name, strand_index, new_base)
		
		# pass output to visualization module
		visualization_fun(sstr,seq, string.upper(sys.argv[2]) )	

# executes realtime, factored for testing purposes		
def nussinov_realtime_execution(matrices, multiple_permutations, strand_name, strand_index, new_base):
		print "\n\nRecalculating relevant permutations..."

		# re-initializes empty lists
		list_of_nussinov_structures = []
		list_of_nussinov_matrices = []
		
		for i in range (0, len(multiple_permutations.permutations())):
			new_struct = prediction.Recalculation(matrices[i], (multiple_permutations.permutations())[i], strand_name, strand_index, new_base)
			new_struct.predict_structure()
			list_of_nussinov_structures.append(new_struct.to_structure())
			list_of_nussinov_matrices.append(new_struct.to_score_matrix())
			print "Permutation: "+ ((multiple_permutations.permutations())[i]).get_name()
			print "Sequence:  "
			print ((multiple_permutations.permutations())[i]).get_concatamer("")
			print "Base pair interactions: "
			print (new_struct.to_structure()).get_pairs()

		# finds best structure
		(sstr, seq, index) = find_best(list_of_nussinov_structures)

		# reupdates matrices definition
		matrices = list_of_nussinov_matrices

		# returns matrix of best for testing purposes
		matrix_of_best = matrices[index]
		
		return (sstr,seq,matrix_of_best)


def zuker_algorithm(multiple_permutations):
	# performs algorithm operation
	(sstr, seq, matrices) = algorithm_operator(multiple_permutations, "zuker")
	
	# pass output to visualization module
	visualization_fun(sstr,seq, string.upper(sys.argv[2]) )


# visualization integration
def visualization_fun(sstr, seq, visualization_type):
	vis = visualization.Visualize()
	if visualization_type == "DOTPAREN":
		print "In dot-paren notation: " 
		print vis.viz_bracket(sstr, seq)
	elif visualization_type == "CIRCLE":
		vis.viz_circle(sstr, seq)
	elif visualization_type == "ARC":
		vis.viz_arc(sstr, seq)
	elif visualization_type == "MOUNTAIN":
		vis.viz_mountain(sstr, seq)


#./master.py filename.txt visualization algorithm input
def main():
	cmdline_validation()
	print "\n\nLoading strands from file..."
	if (string.upper(sys.argv[3]) == "NUSSINOV"):
		nussinov_algorithm(	import_from_file() )
	elif (string.upper(sys.argv[3]) == "ZUKER"):
		zuker_algorithm( import_from_file() )

	
if __name__ == '__main__':
	main()


