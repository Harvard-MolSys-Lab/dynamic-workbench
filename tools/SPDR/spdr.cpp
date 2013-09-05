/* ****************************************************
 * Structure Prediction with Domain Resolution (SPDR)
 * Casey Grun (c) 2012
 * ****************************************************/

#include "spdr.hpp"
#include <iostream>
#include <fstream>

// int main(int argc, char* argv[]) {

// 	std::ifstream infile("tests/trivial.pil", std::ifstream::in);
	
// 	StrandSwallower predictor = loadPredictor<StrandSwallower>(std::cin);
// 	return 0;
// }

int main(int argc, char* argv[]) {

	// NussinovMultiStrandPredictor predictor = loadPredictor<NussinovMultiStrandPredictor>(std::cin);
	// predictor.calculate_score_matrix();
	// predictor.traceback();
	// //predictor.getMatrix()->printMatrix(std::cout);
	// //predictor.getStructure().printPairs(std::cout);
	// std::cout << predictor.getStructure().toDotParen() << std::endl;


	MultiStrandPermutingPredictor<NussinovMultiStrandPredictor> predictor = loadPredictor< MultiStrandPermutingPredictor<NussinovMultiStrandPredictor> >(std::cin);
	predictor.predict();
	std::cout << predictor.getOrder() << std::endl;
	std::cout << predictor.getStructure().toDotParen() << std::endl;

	return 0;
}