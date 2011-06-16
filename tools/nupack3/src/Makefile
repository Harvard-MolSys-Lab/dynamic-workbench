# This Makefile is part of the NUPACK software suite
# Copyright (c) 2007 Caltech. All rights reserved.

# Makefile for making all of NUPACK
#
# Set up some default

ifndef CC
  CC=gcc
endif

ifndef CXX
  CXX=gcc
endif

ifndef NUPACK_LIBS
  NUPACK_LIBS=-lptmalloc3 -lpthread
  export NUPACK_LIBS
endif

ifdef NUPACK_SAMPLE
  SAMPLE_FLAGS=-DNUPACK_SAMPLE
  export NUPACK_SAMPLE
endif

NUPACK_SELECTION_FLAGS=${SAMPLE_FLAGS} 

export CC
export CXX
export NUPACK_SELECTION_FLAGS
export NUPACK_FLAGS
export NUPACK_LIBS

MALLOC_LIB=../lib/libptmalloc3.a

# Targets
.PHONY: all
all: $(MALLOC_LIB) subdirs

# Subdirectories
SUBDIRS = shared/rng shared thermo/utils  thermo/complexes \
	  thermo/distributions thermo/concentrations  \
	  thermo/basics \
	  design/design_pfunc_utils  \
	  design/single-complex 

$(MALLOC_LIB):
	$(MAKE) -C ptmalloc3
	cp -f ptmalloc3/libptmalloc3.a ../lib

.PHONY: subdirs $(SUBDIRS)

subdirs: $(SUBDIRS)

$(SUBDIRS):
	$(MAKE) -C $@

clean:
	$(MAKE) -C ../lib clean
	$(MAKE) -C ptmalloc3 clean
	$(MAKE) -C shared clean
	$(MAKE) -C shared/rng clean
	$(MAKE) -C thermo/utils clean
	$(MAKE) -C thermo/basics clean
	$(MAKE) -C thermo/complexes clean
	$(MAKE) -C thermo/distributions clean
	$(MAKE) -C thermo/concentrations clean
	$(MAKE) -C design/design_pfunc_utils clean
	$(MAKE) -C design/single-complex clean
