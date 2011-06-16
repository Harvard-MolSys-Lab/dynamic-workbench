NUPACKHOME = ../../..
LIB_DIR = $(NUPACKHOME)/lib
CFLAGS = $(NUPACK_CFLAGS)
LIBS=-L. -lmt19937 -lgsl -lgslcblas -lm

LIB = mt19937

LIBRARY_OBJECT=mt19937ar.o

all: $(LIB_DIR)/lib$(LIB).a

$(LIB_DIR)/lib$(LIB).a: $(LIBRARY_OBJECT)
	-mkdir -p $(LIB_DIR)
	$(AR) rcs $(LIB_DIR)/lib$(LIB).a $(LIBRARY_OBJECT)
	
test: 	mtTest.o
	$(CC) $(CFLAGS) mtTest.o -o rng $(LIBS)

clean:
	-rm -f *.o rng *.a *~ $(LIB_DIR)/lib$(LIB).a
