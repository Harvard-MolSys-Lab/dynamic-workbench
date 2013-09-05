/* ****************************************************
 * Structure Prediction with Domain Resolution (SPDR)
 * Casey Grun (c) 2012
 * ****************************************************/

#include "spdr.hpp"
#include <iostream>
#include <fstream>

#define BOOST_TEST_MODULE SPDR
#include <boost/test/included/unit_test.hpp>



/* -------------------------------------------------------------------------
 * Meta classes (Utils, load, etc)
 * ------------------------------------------------------------------------- */

BOOST_AUTO_TEST_SUITE (meta_tests)

BOOST_AUTO_TEST_CASE(TriangularMatrix_test)
{
	TriangularMatrix<SCORE_T> m1(10,SCOREMATRIX_NONE);
	BOOST_CHECK(m1.get(4,6) == SCOREMATRIX_NONE);
	BOOST_CHECK(m1.get(7,3) == SCOREMATRIX_NONE);

	m1.set(4,6,9);
	BOOST_CHECK(m1.get(4,6) == 9);
	for(int i=0; i<10; i++) {
		for(int j=0; j<10; j++) {
			if( i!=4 && j!=6 )
				BOOST_CHECK(m1.get(i,j) == SCOREMATRIX_NONE);
		}
	}
	BOOST_CHECK(m1.get(7,3) == SCOREMATRIX_NONE);

	m1.set(7,3,2);
	BOOST_CHECK(m1.get(4,6) == 9);
	BOOST_CHECK(m1.get(7,3) == 2);

}

BOOST_AUTO_TEST_CASE(loadPredictor_test)
{
	std::ifstream infile("tests/trivial.pil", std::ifstream::in);
	StrandSwallower predictor = loadPredictor<StrandSwallower>(infile);
	
	Domain d1(0,1,7);
	Domain d2(1,1,6);
	Domain d3(2,1,5);
	Domain d4(3,1,4);

	Domain d1_(0,-1,7);
	Domain d2_(1,-1,6);
	Domain d3_(2,-1,5);
	Domain d4_(3,-1,4);

	int s1_domain_count = 4;
	Domain s1_array[] = {d1, d2, d3, d4};

	int s2_domain_count = 4;
	Domain s2_array[] = {d4_, d3_, d2_, d1_};

	Strand s1(std::string("s1"),std::vector<Domain>(s1_array, s1_array+s1_domain_count));
	Strand s2(std::string("s2"),std::vector<Domain>(s2_array, s2_array+s2_domain_count));

	BOOST_REQUIRE(predictor.strands.size() == 2);
	BOOST_CHECK(predictor.strands[0].getDomainCount() == s1_domain_count);
	BOOST_CHECK(predictor.strands[1].getDomainCount() == s2_domain_count);

	for(int i=0;i<s1_domain_count;i++) {
		BOOST_CHECK_EQUAL(predictor.strands[0].getDomain(i), s1_array[i]);
	}

	for(int i=0;i<s2_domain_count;i++) {
		BOOST_CHECK_EQUAL(predictor.strands[1].getDomain(i), s2_array[i]);
	}

}

BOOST_AUTO_TEST_CASE(readDomain_test)
{
	char d1_str[] = "a = NNNNNNNN"; // 8
	char* d1_name;
	char d2_str[] = "5 = NNNN"; // 4
	char* d2_name;
	char d3_str[] = "b : NNNNN"; // 5
	char* d3_name;
	char d4_str[] = "6 : NNNNNN"; // 6
	char* d4_name;
	char d5_str[] = "a* = NNNNNNNN"; // 8
	char* d5_name;
	char d6_str[] = "5* = NNNN"; // 4
	char* d6_name;
	char d7_str[] = "b* : NNNNN"; // 5
	char* d7_name;
	char d8_str[] = "6* : NNNNNN"; // 6
	char* d8_name;

	Domain d1 = readDomain(d1_str,0);
	Domain d1_ex(0,1,8);
	BOOST_CHECK_EQUAL(d1,d1_ex);

	Domain d2 = readDomain(d2_str,1);
	Domain d2_ex(1,1,4);
	BOOST_CHECK_EQUAL(d2,d2_ex);

	Domain d3 = readDomain(d3_str,2);
	Domain d3_ex(2,1,5);
	BOOST_CHECK_EQUAL(d3,d3_ex);

	Domain d4 = readDomain(d4_str,3);
	Domain d4_ex(3,1,6);
	BOOST_CHECK_EQUAL(d4,d4_ex);

	Domain d5 = readDomain(d5_str,0);
	Domain d5_ex(0,-1,8);
	BOOST_CHECK_EQUAL(d5,d5_ex);

	Domain d6 = readDomain(d6_str,1);
	Domain d6_ex(1,-1,4);
	BOOST_CHECK_EQUAL(d6,d6_ex);

	Domain d7 = readDomain(d7_str,2);
	Domain d7_ex(2,-1,5);
	BOOST_CHECK_EQUAL(d7,d7_ex);

	Domain d8 = readDomain(d8_str,3);
	Domain d8_ex(3,-1,6);
	BOOST_CHECK_EQUAL(d8,d8_ex);

}

BOOST_AUTO_TEST_SUITE_END( )

/* -------------------------------------------------------------------------
 * Basic classes (Domain, Strand, Complex, Structure)
 * ------------------------------------------------------------------------- */

BOOST_AUTO_TEST_SUITE (Domain_tests)

BOOST_AUTO_TEST_CASE (domain_equal)
{
	const Domain d1(5,1,10);
	const Domain d2(5,1,10);
	const Domain d3(5,-1,10);
	const Domain d4(4,1,10);

	// Symmetry
	BOOST_CHECK(d1 == d2);
	BOOST_CHECK(d2 == d1);

	
	// Complement
	BOOST_CHECK(d1 != d3);
	
	// Different identity
	BOOST_CHECK(d1 != d4);
}

BOOST_AUTO_TEST_CASE (domain_comparison)
{
	const Domain d1(5,1,10);
	const Domain d2(5,1,10);
	const Domain d3(5,-1,10);
	const Domain d4(4,1,10);

	BOOST_CHECK(!(d1 > d2));
	BOOST_CHECK(!(d1 < d2));

	BOOST_CHECK(d1 > d3);
	BOOST_CHECK(d3 < d1);

	BOOST_CHECK(d1 > d4);
	BOOST_CHECK(d4 < d1);
}

BOOST_AUTO_TEST_CASE (domain_delta)
{
	Domain d1(5,1,10);
	Domain d2(5,1,10);
	Domain d3(5,-1,10);
	Domain d4(4,1,10);

	// Symmetry
	BOOST_CHECK_EQUAL(d1.delta(&d2),d2.delta(&d1));
	
	// Same identity, same polarity
	BOOST_CHECK_EQUAL(d1.delta(&d2),0);
	
	// Complement
	BOOST_CHECK_EQUAL(d1.delta(&d3),-1);
	
	// Different identity
	BOOST_CHECK_EQUAL(d1.delta(&d4),0);
}

BOOST_AUTO_TEST_SUITE_END( )


BOOST_AUTO_TEST_SUITE (Strand_tests)

BOOST_AUTO_TEST_CASE (strand_comparisons) {
	Domain d1(0,1,7);
	Domain d2(1,1,6);
	Domain d3(2,1,5);
	Domain d4(3,1,4);

	Domain d1_(0,-1,7);
	Domain d2_(1,-1,6);
	Domain d3_(2,-1,5);
	Domain d4_(3,-1,4);

	int s1_domain_count = 4;
	Domain s1_array[] = {d1, d2, d3, d4};

	int s2_domain_count = 4;
	Domain s2_array[] = {d4_, d3_, d2_, d1_};

	int s3_domain_count = 5;
	Domain s3_array[] = {d1, d4_, d3_, d2_, d1_};


	Strand s1(std::string("s1"),std::vector<Domain>(s1_array, s1_array+s1_domain_count));
	Strand s1a(std::string("s1"),std::vector<Domain>(s1_array, s1_array+s1_domain_count));
	Strand s1b(std::string("s1b"),std::vector<Domain>(s1_array, s1_array+s1_domain_count));
	Strand s1c(std::string("s1"),std::vector<Domain>(s2_array, s2_array+s2_domain_count));
	
	Strand s2(std::string("s2"),std::vector<Domain>(s2_array, s2_array+s2_domain_count));
	Strand s3(std::string("s3"),std::vector<Domain>(s3_array, s3_array+s3_domain_count));


	BOOST_CHECK(s1 == s1a);
	BOOST_CHECK(!(s1 == s1b));
	BOOST_CHECK(!(s1 == s2));

	BOOST_CHECK(s1 < s2);
	BOOST_CHECK(s1c > s1);

	BOOST_CHECK(s2 > s1);
	BOOST_CHECK(s1 < s1c);
}

BOOST_AUTO_TEST_SUITE_END( )


BOOST_AUTO_TEST_SUITE (Structure_tests)

BOOST_AUTO_TEST_CASE (struct_pair_toDotParen) 
{
	// ..........
	Structure s1(10);
	BOOST_CHECK_EQUAL(s1.toDotParen(), std::string(".........."));

	// ..+...+.+....
	int lengths_2[] = {2, 3, 1, 4};
	Structure s2(10,std::vector<int>(lengths_2,lengths_2+4));
	BOOST_CHECK_EQUAL(s2.toDotParen(), std::string("..+...+.+...."));

	// 01 234 5 6789
	// .(+)..+.+....
	int lengths_3[] = {2, 3, 1, 4};
	Structure s3(10,std::vector<int>(lengths_3,lengths_3+4));
	s3.pair(1,2);
	BOOST_CHECK_EQUAL(s3.toDotParen(), std::string(".(+)..+.+...."));

	// 01 234 5 6789
	// .(+..)+(+)...
	int lengths_4[] = {2, 3, 1, 4};
	Structure s4(10,std::vector<int>(lengths_3,lengths_3+4));
	s4.pair(1,4);
	s4.pair(5,6);
	BOOST_CHECK_EQUAL(s4.toDotParen(), std::string(".(+..)+(+)..."));

}

BOOST_AUTO_TEST_SUITE_END( )
