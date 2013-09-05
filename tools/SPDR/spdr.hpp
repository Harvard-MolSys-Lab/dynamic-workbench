/* ****************************************************
 * Structure Prediction with Domain Resolution (SPDR)
 * Casey Grun (c) 2012
 * ****************************************************/

// C++ standard libraries
#include <iostream>
#include <vector>
#include <map>
#include <algorithm>

// C standard libraries
#include <cstdlib>
#include <cstring>
#include <cassert>
#include <cstdio>

#define _str(x) # x
#define macro_str(x) _str(x)

// Type to use for score calculations
#define SCORE_T float
#define INFTY 1.0/0.0

class Structure {
	std::vector<int> pairs;
	std::vector<int> strand_breaks;
	private:
		static const int STRUCTURE_UNPAIRED = -1;
	public:
		int paired(int i, int j) {
			return pairs[i] == j;
		}
		int paired(int i) {
			return pairs[i];
		}
		void pair(int i, int j) {
			pairs[i] = j;
			pairs[j] = i;
		}
		std::string toDotParen() {
			std::string output(pairs.size() + strand_breaks.size(),'\0');
			
			// Track position in the strand_breaks array
			int strand_position = 0;
			int strand_count = strand_breaks.size();

			// Track position in the output string, which will diverge from
			// position in the list of domains (pairs) if there are strand
			// breaks (+ characters in output)
			int output_position = 0;

			// For each domain
			for(int i = 0, l=pairs.size(); i<l;i++) {

				if(strand_position < strand_count && strand_breaks[strand_position] == i) {
					output[output_position] = '+';
					output_position++;
					strand_position++;
				}

				// If domain is unpaired
				if(pairs[i] == Structure::STRUCTURE_UNPAIRED) {
					output[output_position] = '.';
				} else if(i < pairs[i]) {
					output[output_position] = '(';
				} else if(i > pairs[i]) {
					output[output_position] = ')';
				}
				output_position++;

				
			}
			return output;
		}
		void printPairs(std::ostream& stream) {
			for(int i=0, l=pairs.size();i<l;i++) {
				stream << i << " : " << pairs[i] << std::endl;
			}
		}
		Structure(int size, std::vector<int> strand_lengths) 
		: pairs(size,Structure::STRUCTURE_UNPAIRED), strand_breaks(strand_lengths.size()-1,0) {
			int domain_position = 0;
			for(int i = 0, l = strand_lengths.size()-1; i<l; i++) {
				domain_position += strand_lengths[i];
				strand_breaks[i] = domain_position;
			}
		}
		Structure(int size) : pairs(size,Structure::STRUCTURE_UNPAIRED) {}
		Structure() {}
};

/* ------------------------------------------------------------------------- */

/**
 * Represents a single individsible unit of the polymer Strand. Subclasses of this
 * class may define alternative implementations of the delta comparison function
 */
class Domain {
	int identity;
	int polarity;
	int length;
	public:

		inline bool operator == (const Domain &rhs) const {
			return identity == rhs.identity && polarity == rhs.polarity && length == rhs.length;
		}
		inline bool operator != (const Domain &rhs) const {
			return !(*this == rhs);
		}

		inline bool operator< (const Domain& rhs) const {
			return (identity < rhs.identity) || 
				(identity == rhs.identity && polarity < rhs.polarity) || 
				(identity == rhs.identity && polarity == rhs.polarity && length < rhs.length);
		}
		inline bool operator> (const Domain& rhs) const {return rhs < *this; } 
		inline bool operator<=(const Domain& rhs) const {return !(*this>rhs);} 
		inline bool operator>=(const Domain& rhs) const {return !(*this<rhs);}
		

		SCORE_T delta(Domain* other) {
			if(other->identity == identity && other->polarity == -1*polarity) {
				return -1;
			} else {
				return 0;
				//return 1;
			}
		}
		Domain complement() {
			Domain copy (*this);
			copy.polarity = -polarity;
			return copy;
		}
		bool isComplement(Domain& other) {
			return (other.identity == identity && other.polarity == -polarity);
		}

		friend inline bool operator==(Domain& lhs, Domain& rhs);
		friend std::ostream& operator<<(std::ostream& os, const Domain& dom);

		Domain(int identity=0, int polarity=1, int length=1) 
			: identity(identity), polarity(polarity), length(length) {}
};

std::ostream& operator<<(std::ostream& os, const Domain& dom)
{
    os << dom.identity << (dom.polarity < 0 ? '*' : ' ') << '(' << dom.length << ')';
    return os;
}

/* ------------------------------------------------------------------------- */

class Strand {
	std::string name;
	std::vector<Domain> domains;
	public:
		int getDomainCount() {
			return domains.size();
		}

		Domain getDomain(int i) {
			return domains[i];
		}

		std::string getName() {
			return name;
		}

		friend inline bool operator==(Strand& lhs, Strand& rhs);
		friend inline bool operator< (Strand& lhs, Strand& rhs);
		friend std::ostream& operator<<(std::ostream& os, const Strand& s);

		Strand(std::string name, std::vector<Domain> input_domains) 
		: name(name), domains(input_domains) {}
};

std::ostream& operator<<(std::ostream& os, const Strand& s)
{
    os << s.name;
    return os;
}

inline bool operator==(Strand& lhs, Strand& rhs) { 
	return (lhs.name == rhs.name) && (lhs.domains == rhs.domains); 
} 
inline bool operator!=(Strand& lhs, Strand& rhs){return !operator==(lhs,rhs);} 
inline bool operator< (Strand& lhs, Strand& rhs){ 
	return (lhs.getDomainCount() < rhs.getDomainCount()) || (lhs.domains < rhs.domains);
} 
inline bool operator> (Strand& lhs, Strand& rhs){return  operator< (rhs,lhs);} 
inline bool operator<=(Strand& lhs, Strand& rhs){return !operator> (lhs,rhs);} 
inline bool operator>=(Strand& lhs, Strand& rhs){return !operator< (lhs,rhs);}

/* ------------------------------------------------------------------------- */

class Complex {
	protected:
		int strand_count;
		std::vector<Strand> strands;
	public:
		Complex(std::vector<Strand> input_strands) : strands(input_strands), strand_count(strands.size()) {}
		friend std::ostream& operator<<(std::ostream& os, const Complex& dom);

};

std::ostream& operator<<(std::ostream& os, const Complex& c)
{
	for(int i=0, l=c.strands.size(); i<l; i++) {
		os << c.strands[i] << ' ';
	}
    return os;
}

/* ------------------------------------------------------------------------- */

template <class T>
class TriangularMatrix {
	std::vector<T> values;
	int length;

	public:
		T set(int i, int j, T value) {
			values[i * length + j] = value;
			return value;
		}
		T get(int i, int j) {
			return values[i * length + j];
		}
		TriangularMatrix(int size, T initial_value) : values(size * size, initial_value), length(size) {}
};

/* ------------------------------------------------------------------------- */

// Value to use to represent a location in the score matrix with an uninitialized value
#define SCOREMATRIX_NONE INFTY
class ScoreMatrix {
	//std::vector<SCORE_T> scores;
	TriangularMatrix<SCORE_T> scores;
	int length;

	public:
		void printMatrix(std::ostream& stream) {
			for(int i=0; i<length; i++) {
				for(int j=0; j<i; j++) {
					stream << "  ";
				}
				for(int j=i; j<length;j++) {
					stream << scores.get(i,j) << " ";
				}
				stream << std::endl;
			}
		}
		/**
		 * Updates the score the score at position i,j in the matrix
		 * @param  i 
		 * @param  j 
		 * @param  value New value
		 * @return The updated value
		 */
		SCORE_T set(int i, int j, SCORE_T value) {
			//scores[i * length + j] = value;
			return scores.set(i,j,value);
		}
		/**
		 * Returns the value at position i,j in the matrix
		 * @param  i 
		 * @param  j 
		 * @return The value at i,j
		 */
		SCORE_T get(int i, int j) {
			return scores.get(i,j); // scores[i * length + j];
		}
		/**
		 * Determines whether a value has been defined at position i,j
		 * @param  i 
		 * @param  j 
		 * @return `true` if a value has been defined, else `false` 
		 */
		bool has(int i, int j) {
			return scores.get(i,j) != SCOREMATRIX_NONE; //scores[i * length + j] != SCOREMATRIX_NONE;
		}
		ScoreMatrix(int size) : scores(size, SCOREMATRIX_NONE), length(size) {
		} 
};

/* ------------------------------------------------------------------------- */

class AbstractMultiStrandPredictor {
	protected:
		ScoreMatrix* matrix;
		std::vector<Strand> strands;
		std::vector<Domain> domains;
	public:
		virtual void calculate_score_matrix() = 0;
		virtual void traceback() = 0;
};

/* ------------------------------------------------------------------------- */

class NussinovMultiStrandPredictor : public AbstractMultiStrandPredictor {
	protected:
		Structure structure;
		std::vector<Strand> strands;
		SCORE_T score;

		SCORE_T delta(int i, int j) {
			Domain d_i = domains[i];
			Domain d_j = domains[j];
			return -d_i.delta(&d_j);
		}

		SCORE_T gamma(int i, int j) {

			if(matrix->has(i,j)) {
				// return value of gamma if previously cached in score matrix
				return matrix->get(i,j);
			
			} else {
				// determine highest possible score at position i,j in terms 
				// of adjacent scores

				// four cases:
				// i is unpaired
				// j is unpaired
				SCORE_T g = std::max(gamma(i + 1, j), gamma(i, j - 1));
				
				// i,j are paired
				g = std::max(g,gamma(i + 1, j - 1) + delta(i, j));
				
				// i,j are paired, but not to each other (bifurcation)
				SCORE_T gp = gamma(i, i) + gamma(i + 1, i);
				for (int k = i; k<j; k++) {
					gp = std::max(gp,gamma(i, k) + gamma(k + 1, j));
				}
				g = std::max(g,gp);

				// remember newly calculated value in the matrix
				//matrix->set(i,j,g);
				return g;
			}
		}

		void trace(int i, int j) {
			if(i<j) {
				// i is unpaired
				if(gamma(i,j) == gamma(i+1, j)) {
					trace(i+1, j);

				// j is unpaired
				} else if (gamma(i, j) == gamma(i, j - 1)) {
					trace(i, j - 1);
				
				// i,j are paired
				} else if(gamma(i, j) == gamma(i + 1, j - 1) + delta(i, j)) {
					
					// record pair in structure
					structure.pair(i,j);

					// increment score count
					//score -= delta(i,j);

					trace(i+1,j-1);

				// i,j are paired, but not to each other
				} else {
					for(int k=i+1, l=j-1; k<l; k++) {
						if (gamma(i, j) == gamma(i, k) + gamma(k + 1, j)) {
							trace(i,k);
							trace(k+1,j);
						}
					}
				}
			}
		}

	public:
		Structure getStructure() {
			return structure;
		}
		ScoreMatrix* getMatrix() {
			return matrix;
		}
		void calculate_score_matrix() {

			// populate main diagonal of score matrix with zeroes
			matrix->set(0, 0, 0);
			for(int i = 1, l=domains.size(); i<l; i++) {
				matrix->set(i, i, 0);
				assert(matrix->get(i,i) == 0);
				matrix->set(i, i - 1, 0);
				assert(matrix->get(i,i) == 0);
			}

			// traverse 
			for(int n=1, l=domains.size(); n<l; n++) {
				for(int j=n; j<l; j++) {
					int i = j - n; // i = j - n + 1
					matrix->set(i,j,gamma(i,j));
				}
			}
		}

		SCORE_T getScore() {
			return score;
		}

		void traceback() {
			score = -1*gamma(0,domains.size() - 1);
			trace(0, domains.size() - 1);
		}

		NussinovMultiStrandPredictor(std::vector<Strand> input_strands) 
			: strands(input_strands), structure() {
			
			// Initialize score for final structure
			score = 0;

			// Count total number of domains in ensemble
			int domain_count = 0;
			int strand_count = strands.size();
			std::vector<int> strand_lengths(strand_count,0);
			for(int i=0; i<strand_count; i++) {
				strand_lengths[i] = strands[i].getDomainCount();
				domain_count += strand_lengths[i];
			}

			// Initailize vector to store domains; fill with blank Domains
			domains = std::vector<Domain>(domain_count,Domain());

			// For each strand
			for(int i = 0, d = 0; i < strand_count; i++) {

				// For each domain in strands[i]
				for(int j=0, l=strands[i].getDomainCount(); j<l; j++) {
					domains[d] = strands[i].getDomain(j);
					d++;
				} 
			}

			structure = Structure(domain_count,strand_lengths);

			// Initializes the score matrix dimensions according to the  
			// total number of domains 
			matrix = new ScoreMatrix(domain_count);
		}
};

/* ------------------------------------------------------------------------- */

class StrandSwallower : public AbstractMultiStrandPredictor {
public:
	std::vector<Strand> strands;
		void calculate_score_matrix() { }

		void traceback() { }

	StrandSwallower(std::vector<Strand> input_strands) : strands(input_strands) {}
};

/* ------------------------------------------------------------------------- */
template<class Predictor_T>
class MultiStrandPermutingPredictor {
public:
	std::vector<Strand> strands;
	std::vector<Strand> order;
	Structure structure;
	void predict() {
		SCORE_T score = INFTY;
		do {
			Predictor_T predictor(strands);
			predictor.calculate_score_matrix();
			predictor.traceback();

			if(predictor.getScore() < score) {
				score = predictor.getScore();
				structure = predictor.getStructure();
				order = strands;
			}
		} while(std::next_permutation(strands.begin(),strands.end()));
	}
	Structure getStructure() {
		return structure;
	}
	Complex getOrder() {
		return Complex(order);
	}

	MultiStrandPermutingPredictor(std::vector<Strand> input_strands) : strands(input_strands), order(input_strands), structure() {}
};

/* ------------------------------------------------------------------------- */

//typedef match_results<const char*> cmatch;

class Utils {
private:
	static const int EAT_BUFFER_MAX = 1024;
public:
	static int eat(char*& in, char c) {
		int i = 0;
		while(*in == c) {
			in++; i++;
		}
		return i;
	}
	static char* eatWhileNot(char* &in, char c) {
		int i = 0;
		while((in[i] != c) && (in[i] != '\0') && (i<Utils::EAT_BUFFER_MAX)) {
			i++;
		}
		char* out = (char*) malloc(sizeof(char) * (i+1));
		strncpy(out,in,i);
		in += i;
		return out;
	}
};


// Maximum number of domains allowed per strand
#define MAX_ALLOWED_DOMAINS 1024 
#define MAX_LINE_SIZE 2048
#define MAX_DOMAIN_NAME 1024
#define MAX_STRAND_NAME 1024

#define MAX_DOMAIN_SEQUENCE 4096

Domain readDomain(char* in_ptr, int identity, char* nameBuffer=NULL) {
	char name[MAX_DOMAIN_NAME];
	char seq[MAX_DOMAIN_SEQUENCE];

	// TODO: check for right number of sscanf matches
	int matches = sscanf(in_ptr," %"macro_str(MAX_DOMAIN_NAME)"s %*[:=] %"macro_str(MAX_DOMAIN_SEQUENCE)"s ",name,seq);

	if(nameBuffer != NULL) {
		strncpy(nameBuffer,name,MAX_DOMAIN_NAME);
	}

	int l = strlen(name);
	int polarity = (l > 0 && ((name[l-1] == '*') || (name[l-1] == '\''))) ? -1 : 1;

	Domain dom(identity,polarity,strlen(seq));
	
	//free(name);
	//free(seq);
	return dom;
}

template<class T>
T loadPredictor(std::istream& in) {
	std::vector<Complex> complexes;
	std::vector<Strand> strands;
	std::vector<Domain> domains;
	std::map<std::string,Domain> domain_map;
	int domain_count = 0;

	char in_str[MAX_LINE_SIZE] = {0};
	in.getline(in_str,MAX_LINE_SIZE);
	while(!in.eof()) {
		
		char* in_ptr;

		// Domain statement
		if(strncmp(in_str,"domain",6) == 0) {
			in_ptr = in_str+6;

			char name[MAX_DOMAIN_NAME];			
			Domain dom = readDomain(in_ptr,domain_count,name);
			
			domain_count+=1;
			domains.push_back(dom);
			domain_map[std::string(name)] = dom;

		// Strand statement:
		// strand name = a b c d* e f
		} else if(strncmp(in_str,"strand",6) == 0) {
			in_ptr = in_str+6;

			char name[MAX_STRAND_NAME];
			int l = 0;

			// TODO: check for sscanf matches

			// Parse name
			sscanf(in_ptr," %s %*[:=] %n",name,&l);
			in_ptr += l;

			// Parse domain specifiers
			std::vector<Domain> strand_domains;

			while(*in_ptr != '\0') {

				char domain_name_str[MAX_DOMAIN_NAME];
				sscanf(in_ptr,"%s %n",domain_name_str,&l);
				in_ptr+=l;

				std::string domain_name(domain_name_str);

				int polarity = 0;

				// check if domain name contains polarity specifier
				if(domain_name[domain_name.size()-1] == '*' || domain_name[domain_name.size()-1] == '\'') {
					
					// delete polarity specifier, update polarity
					domain_name.erase(domain_name.size()-1,1);
					polarity = -1;
				} else {
					polarity = 1;
				}
				
				// retrieve domain from map
				Domain dom = domain_map[domain_name];

				// take complement of domain if necessary
				if(polarity < 0) {
					dom = dom.complement();
				}

				// add domain to list
				strand_domains.push_back(dom);

			}
			
			strands.push_back(Strand(name,strand_domains));

		}

		in.getline(in_str,MAX_LINE_SIZE);
	}

	return T(strands);
}