# This Makefile is part of the NUPACK software suite
# Copyright (c) 2007 Caltech. All rights reserved.

# Makefile for utility functions used in calculations
# based off of partition functions for use in NUPACK

NUPACKHOME = ../../..
LIB_DIR = $(NUPACKHOME)/lib
UTILS_LIB = libutils.a
SHARED_DIR = ../../shared
CONSTANTS_DIR = $(SHARED_DIR)/constants
INCLUDES= -I$(SHARED_DIR) -I$(CONSTANTS_DIR)

CFLAGS = $(NUPACK_CFLAGS) ${NUPACK_SELECTION_FLAGS} $(INCLUDES)

LIBRARY_OBJECT = backtrack.o CalculateEnergy.o ene.o GetEnergy.o \
 init.o mfeUtils.o min.o nsStar.o pairsPr.o pf.o pfuncUtils.o \
 pknots.o sumexp.o sumexp_pk.o ReadCommandLineNPK.o DNAGlobals.o \
 $(SHARED_DIR)/utils.o


LIB = pfunc
LIBS=$(NUPACK_LIBS)

all: (LIB_DIR)/lib$(LIB).a

(LIB_DIR)/lib$(LIB).a: $(LIBRARY_OBJECT) pfuncUtilsHeader.h \
         $(CONSTANTS_DIR)/runtime_constants.h \
         $(CONSTANTS_DIR)/runtime_constants.h DNAExternals.h \
         $(LIB_DIR)/$(UTILS_LIB)
	-mkdir -p $(LIB_DIR)
	$(AR) rcs $(LIB_DIR)/lib$(LIB).a $(LIBRARY_OBJECT)

clean:
	rm -f *o
	rm -f $(LIB_DIR)/lib$(LIB).a
	rm -f *~ 

