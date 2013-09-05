import itertools
import sys
import classes
import string
import csv
import exceptions

class Strand:
	def __init__ (self, material, name, sequence):
		"""
		specifies whether DNA or RNA, gives name, and gives sequence
		and checks self.correct_type(sequence)
		"""
		self.material = material
		self.name = name
		self.sequence = sequence
		
	def update_seq (self, new_seq):
		self.sequence = new_seq
		return self

class Permutations:
	""" Creates a permutations object """
	def __init__(self, lis):
		self.permutation_list = itertools.permutations(lis)
		self.actual_permutation_list = []
		for element in self.permutation_list:
			self.actual_permutation_list.append(classes.Permutation(list(element)))
	
	def permutations (self):
		"""
		Return all permutations
		"""
		return self.actual_permutation_list

class ScoreMatrix:
	"""2D triangular matrix containing scores of optimal substructures"""
	
	def __init__(self, i, j):
		"""
		Initializes triangular matrix with height i and width j, with zeroes 
		across the main diagonal
		"""
		self.matrix = [[None for n in range(i)] for m in range(j)]
		self.width = i
		self.height = j
	
	def get(self, i, j):
		"""Gets the element at i,j"""
		return self.matrix[i][j]
	
	def set(self, i, j, value):
		"""Updates the element at i,j with value"""
		self.matrix[i][j] = value
	
	def has(self, i, j):
		"""True if there is a value in the matrix at i,j; false otherwise"""
		return self.matrix[i][j] != None
	
	def get_width(self):
		"""Returns the j-dimension (width) of the matrix"""
		return self.width
		
	def get_height(self):
		"""Returns the i-dimension (height) of the matrix"""
		return self.height
		
	def insert(self, k):
		"""Inserts both a row and a column at k"""
		pass
	
	def remove(self, k):
		"""Removes both a row and a column at k"""
		pass

	def print_matrix(self, format="csv"):
		matrix = self.matrix
		
		if(format=="csv"):
			writer = csv.writer(sys.stdout, delimiter="\t")
			writer.writerows(map(lambda row: map(lambda x: None if x==None else round(x,3), row), matrix) )
		else:
			print "Rows: "+str(len(matrix))
			#print nussinov.to_score_matrix().matrix
			i = 0
			for row in matrix:
				i = i+1
				print str(i)+"("+str(len(row))+") : "+ str(row)

	def __str__(self):
		return str(self.matrix)

class Permutation:
	"""Represents a single circular permutation of named strands"""
	
	def __init__(self, strands):
		"""Accepts an ordered list of Strands"""
		if(isinstance(strands, list)):
			self.strands = strands
			self.namelist = []
			self.nameconcatenation = ""
			self.seqconcatenation = ""
		else:
			raise Exception
		
	def get_names(self):
		"""Returns a list of names of the strands, in order"""
		for element in self.strands:
			self.namelist.append(element.name)
		return self.namelist
		
	def get_strands(self):
		"""Returns a list of Strands, in order"""
		return self.strands
		
	def get_concatamer(self, separator=""):
		"""
		Returns a string containing the sequences concatenated together,
		separated by an optional separator
		"""
		return separator.join(map(lambda strand: strand.sequence, self.strands))
		
	def get_name(self, separator=""):
		"""
		Returns the names of the strands, concatenated together; can be used 
		as a unique identifier for this Permutation within the ensemble.
		"""
		return separator.join(map(lambda strand: strand.name, self.strands))
		
	
	def substitution(self, strand_name, index, new_base):
		"""
		Updates the instance of the strand that is being updated by a substitution
		"""		
		# tries to find strand in question to be updated
		try:
			strands_index = (self.get_names()).index(string.upper(strand_name))
		except ValueError:
			raise classes.StrandNameError

		# checks to make sure base substitution is valid
		sub = string.upper(new_base)
		if (self.strands[strands_index]).material == "DNA":
			if (sub != 'A') & (sub != 'T') & (sub != 'C') & (sub != 'G'):
				raise classes.DNABaseError
		elif (self.strands[strands_index]).material == "RNA":
			if (sub != 'A') & (sub != 'U') & (sub != 'C') & (sub != 'G'):
				raise classes.RNABaseError

		# performs update to strand
		strand_as_list = list((self.strands[strands_index]).sequence)
		try:
			strand_as_list[index] = sub		
		except IndexError:
			raise classes.BaseIndexError
			
		strand_as_string = "".join(strand_as_list)
		self.strands[strands_index] = (self.strands[strands_index]).update_seq(strand_as_string)

		# calculates overall index of change
		overall_index = 0
		for i in range(0, strands_index):
			overall_index += len((self.strands[i]).sequence)
		overall_index += index

		# returns new permutation object with modifications
		return (self, overall_index)
		
class Structure:
	"""Represents the secondary structure of a given strand"""
	
	def __init__(self, pairs, permutation):
		"""Builds an initial structure from a list of (int,int) tuples"""
		self.pairs = pairs
		self.permutation = permutation
		
	def __str__(self):
		"""Prints an informal string-based representation of the structure"""
		return str(self.pairs)
	
	def get_permutation(self):
		"""Returns permutation object"""
		return self.permutation
		
	def get_sequence(self):
		"""Returns concatenated sequence of Permutation"""
		return (self.permutation).get_concatamer()
	
	def get_pairs(self):
		"""Returns the structure as a list of (int,int) tuples"""
		return self.pairs	


class StrandNameError(exceptions.Exception):
	def __init__(self):
		return

class BaseIndexError(exceptions.Exception):
	def __init__(self):
		return

class DNABaseError(exceptions.Exception):
	def __init__(self):
		return
		
class RNABaseError(exceptions.Exception):
	def __init__(self):
		return