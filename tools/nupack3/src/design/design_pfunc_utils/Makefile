# This Makefile is part of the NUPACK software suite
# Copyright (c) 2007 Caltech. All rights reserved.

NUPACKHOME = ../../..
SHARED_DIR = ../../shared
CONSTANTS_DIR = $(SHARED_DIR)/constants
PFUNCUTILS_DIR = ../../thermo/utils
LIB_DIR = $(NUPACKHOME)/lib
UTILS_LIB = libutils.a
PFUNC_LIB = libpfunc.a
BIN_DIR = $(NUPACKHOME)/bin
INCLUDES=-I$(PFUNCUTILS_DIR) -I$(CONSTANTS_DIR)

CFLAGS = $(NUPACK_CFLAGS) $(INCLUDES)

DESIGN_PFUNC_UTILS_DEPEND =  $(SHARED_DIR)/utils.o \
 $(SHARED_DIR)/utilsHeader.h \
 $(PFUNCUTILS_DIR)/pfuncUtilsHeader.h \
 $(PFUNCUTILS_DIR)/backtrack.o \
 $(PFUNCUTILS_DIR)/CalculateEnergy.o \
 $(PFUNCUTILS_DIR)/ene.o \
 $(PFUNCUTILS_DIR)/GetEnergy.o \
 $(PFUNCUTILS_DIR)/init.o \
 $(PFUNCUTILS_DIR)/mfeUtils.o \
 $(PFUNCUTILS_DIR)/min.o \
 $(PFUNCUTILS_DIR)/pairsPr.o \
 $(PFUNCUTILS_DIR)/pf.o \
 $(PFUNCUTILS_DIR)/pfuncUtils.o \
 $(PFUNCUTILS_DIR)/pknots.o \
 $(PFUNCUTILS_DIR)/ReadCommandLineNPK.o \
 $(PFUNCUTILS_DIR)/sumexp.o \
 $(PFUNCUTILS_DIR)/sumexp_pk.o \
 $(PFUNCUTILS_DIR)/pfuncUtilsConstants.h \
 $(PFUNCUTILS_DIR)/DNAExternals.h \
 $(PFUNCUTILS_DIR)/DNAGlobals.o \
 $(CONSTANTS_DIR)/runtime_constants.h \
 $(CONSTANTS_DIR)/physical_constants.h
 

LIBRARY_OBJECT = nsStar_psStar.o pairPrStruct.o

LIB = design_pfunc_utils

all: $(LIB_DIR)/lib$(LIB).a

$(LIB_DIR)/lib$(LIB).a: $(LIBRARY_OBJECT) design_pfunc_utils_header.h \
                  $(DESIGN_PFUNC_UTILS_DEPEND) $(LIB_DIR)/$(UTILS_LIB) \
                  $(LIB_DIR)/$(PFUNC_LIB)
	-mkdir -p $(LIB_DIR)
	$(AR) rcs $(LIB_DIR)/lib$(LIB).a $(LIBRARY_OBJECT)

clean: 
	rm -f *.o
	rm -f $(LIB_DIR)/lib$(LIB).a
	rm -f *~
