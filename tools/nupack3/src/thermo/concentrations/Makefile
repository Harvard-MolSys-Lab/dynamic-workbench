# This Makefile is part of the NUPACK software suite
# Copyright (c) 2007 Caltech. All rights reserved.
# Coded by: Justin Bois 

# Makefile for concentrations for use in NUPACK

NUPACKHOME = ../../..
SHARED_DIR = $(NUPACKHOME)/src/shared
CONSTANTS_DIR = $(SHARED_DIR)/constants
RNG_DIR = $(SHARED_DIR)/rng
RNG_LIB = libmt19937.a
LIB_DIR = $(NUPACKHOME)/lib
UTILS_LIB = libutils.a
BIN_DIR = $(NUPACKHOME)/bin
INCLUDES = -I$(CONSTANTS_DIR) -I$(SHARED_DIR)

CFLAGS = $(NUPACK_CFLAGS) $(INCLUDES)
LIBS=-L../../../lib $(NUPACK_LIBS)

all: concentrations library

concentrations: concentrations.o ReadCommandLine.o InputFileReader.o \
                OutputWriter.o CalcConc.o FracPair.o \
                ConcentrationsHeaderFile.h \
                $(CONSTANTS_DIR)/physical_constants.h \
                $(CONSTANTS_DIR)/runtime_constants.h \
                $(SHARED_DIR)/utils.o $(LIB_DIR)/$(UTILS_LIB)
	-mkdir -p $(BIN_DIR)
	$(CC) $(CFLAGS) concentrations.o ReadCommandLine.o InputFileReader.o \
              OutputWriter.o CalcConc.o FracPair.o \
              -o $(BIN_DIR)/concentrations $(LIBS) -lm $(LIB_DIR)/$(UTILS_LIB) \
              $(LIB_DIR)/$(RNG_LIB)

LIB = pfunc
LIBRARY_OBJECT = CalcConc.o
.PHONY: library
library: CalcConc.o
	-mkdir -p $(LIB_DIR)
	ar rcs $(LIB_DIR)/lib$(LIB).a $(LIBRARY_OBJECT)

clean: 
	rm -f *.o
	-rm -f $(BIN_DIR)/concentrations
	rm -f *~
