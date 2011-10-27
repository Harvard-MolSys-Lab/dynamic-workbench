# This Makefile is part of the NUPACK software suite
# Copyright (c) 2007 Caltech. All rights reserved.
# Coded by: Justin Bois 1/2007
#
# Makefile for generic utilities for use with NUPACK

NUPACKHOME = ../..
LIB_DIR = $(NUPACKHOME)/lib
CONSTANTS_DIR = constants
INCLUDES=-I$(CONSTANTS_DIR)

CFLAGS = $(NUPACK_CFLAGS) $(INCLUDES)

LIB = utils

all: $(LIB_DIR)/.exist library

$(LIB_DIR)/.exist:
	mkdir -p $(LIB_DIR)
	touch $(LIB_DIR)/.exist	

utils: $(LIB_DIR)/.exist utils.o utilsHeader.h hash.h \
       $(CONSTANTS_DIR)/runtime_constants.h \
       $(CONSTANTS_DIR)/physical_constants.h hash.o
	ar rcs $(LIB_DIR)/lib$(LIB).a utils.o

library: utils.o utilsHeader.h $(CONSTANTS_DIR)/runtime_constants.h \
         $(CONSTANTS_DIR)/physical_constants.h hash.o
	$(AR) rcs $(LIB_DIR)/lib$(LIB).a utils.o hash.o

clean:
	rm -f *o
	rm -f *~
	rm -f $(CONSTANTS_DIR)/*~
	rm -f $(LIB_DIR)/lib$(LIB).a

