# This Makefile is part of the NUPACK software suite
# Copyright (c) 2007 Caltech. All rights reserved.
# Coded by: Justin Bois 

NUPACKHOME = ../../..
SHARED_DIR = ../../shared
CONSTANTS_DIR = $(SHARED_DIR)/constants
LIB_DIR = $(NUPACKHOME)/lib
UTILSLIB = libutils.a
BIN_DIR = $(NUPACKHOME)/bin
INCLUDES=-I$(CONSTANTS_DIR)

CFLAGS= $(NUPACK_CFLAGS) $(INCLUDES)

all: $(BIN_DIR)/.exist distributions

$(BIN_DIR)/.exist:
	mkdir -p $(BIN_DIR)
	touch $(BIN_DIR)/.exist

distributions: distributions.o ReadCommandLine.o InputFileReader.o \
               OutputWriter.o CalcDist.o DistributionsHeaderFile.h \
               $(CONSTANTS_DIR)/physical_constants.h  \
               $(CONSTANTS_DIR)/runtime_constants.h \
               $(SHARED_DIR)/utils.o $(LIB_DIR)/$(UTILSLIB)
	$(CC) $(CFLAGS) distributions.o ReadCommandLine.o InputFileReader.o \
              OutputWriter.o CalcDist.o -o $(BIN_DIR)/distributions -lm \
              $(LIB_DIR)/$(UTILSLIB)

clean: 
	rm -f *.o
	-rm -f $(BIN_DIR)/distributions
	rm -f *~
