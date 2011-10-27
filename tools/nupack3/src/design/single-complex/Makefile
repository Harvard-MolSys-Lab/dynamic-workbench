# This Makefile is part of the NUPACK software suite
# Copyright (c) 2007 Caltech. All rights reserved.
# Coded by: Joseph Zadeh 

# Makefile for single-stranded design functions


NUPACKHOME = ../../..
SHARED_DIR = $(NUPACKHOME)/src/shared
CONSTANTS_DIR = $(SHARED_DIR)/constants
EXTERNALS_DIR = $(NUPACKHOME)/src/thermo/utils
DESIGN_UTILS_DIR = $(NUPACKHOME)/src/design/design_pfunc_utils
RNG_DIR=$(NUPACKHOME)/src/shared/rng
LIB_DIR = $(NUPACKHOME)/lib
PFUNC_LIB = libdesign_pfunc_utils.a
PFUNC_UTILS_LIB = libpfunc.a
UTILS_LIB = libutils.a
RNG_LIB = libmt19937.a
BIN_DIR = $(NUPACKHOME)/bin
INCLUDES=-I$(CONSTANTS_DIR) -I$(EXTERNALS_DIR) -I$(DESIGN_UTILS_DIR) -I$(RNG_DIR)

CFLAGS = $(NUPACK_SELECTION_FLAGS) $(NUPACK_CFLAGS) -Wall $(INCLUDES)
LIBS=-L../../../lib $(NUPACK_LIBS)
#REMOVE PG BEFORE RUNNING!!!

#-Wmissing-prototypes -Wmissing-declarations

all: 	design

design: design.o design_utils.o design_engine.o design_test.o read_command_line.o\
 $(CONSTANTS_DIR)/physical_constants.h  $(CONSTANTS_DIR)/runtime_constants.h \
 $(EXTERNALS_DIR)/DNAExternals.h $(DESIGN_UTILS_DIR)/design_pfunc_utils_header.h \
 $(SHARED_DIR)/utils.o $(LIB_DIR)/$(PFUNC_LIB) $(LIB_DIR)/$(UTILS_LIB)
	-mkdir -p $(BIN_DIR)
	$(CC) $(CFLAGS) design.o design_utils.o design_engine.o design_test.o read_command_line.o -o $(BIN_DIR)/design -lm \
	$(LIB_DIR)/$(PFUNC_LIB) $(LIB_DIR)/$(PFUNC_UTILS_LIB) $(LIB_DIR)/$(RNG_LIB) $(LIB_DIR)/$(UTILS_LIB) $(NUPACK_LIBS) $(LIBS)

clean: 
	rm -f *.o
	-rm -f $(BIN_DIR)/design
	rm -f *~
