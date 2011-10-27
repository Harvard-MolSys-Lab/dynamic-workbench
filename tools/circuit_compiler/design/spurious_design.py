#!/usr/bin/env python
"""
Designs sequences using Winfree's SpuriousDesign/spuriousC.c algorithm.
Uses PIL input and Zadeh's .mfe output formats for compatibility with compiler.
"""

import os
import string
import subprocess
import sys

from constraint_load import Convert

# Extend path to see compiler library
here = sys.path[0] # System path to this module.
sys.path.append(here+"/..")

from utils import error

DEBUG = False


def print_list(xs, filename, format):
  """Prints a list 'xs' to a file using space separation format."""
  f = open(filename, "w")
  for x in xs:
    f.write(format % x)
  f.close()

def design(basename, infilename, outfilename, cleanup, verbose=False, reuse=False, struct_orient=False, extra_pars=""):
  stname = basename + ".st"
  wcname = basename + ".wc"
  eqname = basename + ".eq"
  sp_outname = basename + ".sp"
  
  #if reuse:
  #  for name in stname, wcname, eqname:
  #    assert os.path.isfile(name), "Error: requested --reuse, but file '%s' doesn't exist" % name
  
  # Prepare the constraints
  print "Reading design from  file '%s'" % infilename
  print "Preparing constraints files for spuriousC."
  convert = Convert(infilename, struct_orient)
  eq, wc, st = convert.get_constraints()
  
  # Convert specifications
  def eq_map(x):
    return x + 1  if x != None  else 0
  eq = map(eq_map, eq)
  
  def wc_map(x):
    return x + 1  if x != None  else -1
  wc = map(wc_map, wc)
  
  def st_map(x):
    return x  if x != None  else " "
  st = map(st_map, st)
  
  # Print them to files
  print_list(eq, eqname, "%d ")
  print_list(wc, wcname, "%d ")
  print_list(st, stname, "%c")
  
  if "_" in st:
    print "System over-constrained."
    sys.exit(1)
  
  # Run SpuriousC
  # TODO: take care of prevents.
  if verbose:
    quiet = "quiet=ALL"
  else:
    quiet = "quiet=TRUE"
  
  spo = open(sp_outname,'w') 
  
  command = "spuriousC score=automatic template=%s wc=%s eq=%s %s %s" % (stname, wcname, eqname, extra_pars, quiet)
  print command
  spurious_proc = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)

  data = spurious_proc.stdout.readline()
  while data:
    if verbose:
      sys.stdout.write(data)
    spo.write(data)
    data = spurious_proc.stdout.readline()

  spo.close()
  
  # Load results
  nts = open(sp_outname, "r").read()
  # File has all sorts of runtime info.
  # The final sequences are stored on the last full line.
  nts = nts.split("\n")[-2]
  print "Processing results of spuriousC."
  convert.process_results(nts)
  convert.output(outfilename)
  print "Done, results saved to '%s'" % outfilename
  
  if cleanup:
    print "Deleting temporary files"
    os.remove(stname)
    os.remove(wcname)
    os.remove(eqname)
    os.remove(sp_outname)

if __name__ == "__main__":
  import re
  from optparse import OptionParser
  
  from find_file import find_file, BadFilename
  
  if sys.version_info < (2, 5):
    error("Must use python 2.5 or greater.")
    
  # Parse command line options.
  usage = "usage: %prog [options] infilename [spuriousC_parameters ...]"
  parser = OptionParser(usage=usage)
  parser.set_defaults(verbose=False, struct_orient=False, cleanup=True)
  parser.add_option("-v", "--verbose", action="store_true", dest="verbose", help="Verbose output from spuriousC")
  parser.add_option("-q", "--quiet", action="store_false", dest="verbose", help="No output from spuriousC [Default]")
  parser.add_option("-o", "--output", help="Output file [defaults to BASENAME.mfe]", metavar="FILE")
  
  parser.add_option("--strand", action="store_false", dest="struct_orient", help="List constraints in strand-oriented manner [Default]")
  parser.add_option("--struct", action="store_true", dest="struct_orient", help="List constraints in structure-oriented manner")
  
  parser.add_option("--keep-temp", action="store_false", dest="cleanup", help="Keep temporary files (.st, .wc, .eq, .sp)")
  parser.add_option("--cleanup", action="store_true", dest="cleanup", help="Remove temporary files after use [Default]")
  # TODO: parser.add_option("--reuse", action="store_true", help="Reuse the .st, .wc and .eq files if they already exist (Saves time if a session was terminated, or if you want to rerun a design).")
  (options, args) = parser.parse_args()
  options.reuse = False # TODO
  
  if len(args) < 1:
    parser.error("missing required argument infilename")
  try:
    infilename = find_file(args[0], ".pil")
  except BadFilename:
    parser.error("File not found: neither %s nor %s.pil exist. Please supply correct infilename." % (args[0], args[0]))
  
  # Infer the basename if a full filename is given
  basename = infilename
  p = re.match(r"(.*)\.pil\Z", basename)
  if p:
    basename = p.group(1)
  
  # Set filename defaults
  if not options.output:
    options.output = basename + ".mfe"
  
  # Collect extra arguments for spuriousC
  spurious_pars = string.join(args[1:], " ")
  
  design(basename, infilename, options.output, options.cleanup, options.verbose, options.reuse, options.struct_orient, spurious_pars)
