// Multisubjective sequence design program - version 1.0 beta 5d, 2012-05-31
// by John P. Sadowski

// TO DO:
// - multidigit filenames
// - intermolecular complexes
// X sequence constraints in DD output
// - immutable undesired base pairs
// - generate random DD's
// - read .NPO files
// - get temp/conc/etc. from .NP file
// - one input file
// - memory management

const char vers[13] = "1.0 beta 5d ";

#if defined __GNUG__	// G++ formatting
#include <iostream>
#include <fstream>
#include <sys/stat.h>
#include <sys/wait.h>
#include <time.h>
#include <string.h>
//#include <pwd.h>
#include <errno.h>
#include <cstdlib>
using namespace std;

#else					// XCode formatting
#include <iostream.h>
#include <fstream.h>
#include <sys/stat.h>
#include <time.h>
//#include <pwd.h>
#include <errno.h>

#endif

const int strandsize = 32;	// number of strands
const int tokensize = 32;	// for tokens, bases per block
const int arraysize = 128;	// for arrays of data, bases per strand
const int stringsize = 256;	// for filenames and system commands and buffers
const int desiredsize = 512; // for desiredbases

char workingdir[stringsize] = "/d/test";
char nupackhome[stringsize] = "/d/New Research/Programming/downloads/nupack3.0";
char infile_prefix[stringsize] = "specification";
char seqfile_prefix[stringsize] = "sequences";
char seq_infile[stringsize] = "\0";
char outfile_prefix[stringsize] = "output";
char email[stringsize] = "\0";

//enum {dna, rna} material = dna;
char material[stringsize] = "dna";
char temperature[stringsize] = "23";
char sodium[stringsize] = "0.5";
char magnesium[stringsize] = "0.125";
//enum {all, some, none} dangles = all;
char dangles[stringsize] = "all";
char trials[stringsize] = "10";

bool workbench = false;
char threshold[8] = ".67";
int preventlimit[15] = {0,4,4,6,4,6,6,100,4,6,6,100,6,100,100};
		             // X,A,C,M,G,R,S,V  ,T,W,Y,H,  K,D,  B

enum base {X=0, A, C, M, G, R, S, V, T, W, Y, H,  K, D,  B, N};

base sequence[strandsize][arraysize];
int numstrands;
int strandlength[strandsize];
int offset[strandsize];					// +=delete first N; -=keep first N
int strandblocks[strandsize][arraysize];

base block[3*strandsize][tokensize];
int blocklength[3*strandsize];

int immutablebases[desiredsize];
int desiredbases[desiredsize][2];

char strandtoken[strandsize][tokensize];
char blocktoken[3*strandsize][tokensize];

struct ht_type
{
	int id;
	int pos1;
	int pos2;
	int size;
	ht_type() {id=0; pos1=0; pos2=0; size=0;}
} hairpintemp[strandsize];

struct bt_type
{
	int id1;
	int id2;
	int pos1;
	int pos2;
	int size;
	char token[tokensize];
	bt_type() {id1=0; id2=0; pos1=0; pos2=0; size=0; token[0]='\0';}
} bridgetemp[strandsize];

ofstream log;
fstream json;


void savesettings();
void loadsettings(char *filename);
void getsettings();
void commandline(int argc, char **argv, char *job, char &designer, char *trial, char *token);

void forkexec(char *path, char **cmd, int count);
void initialize();
void outputlog();
void outputlog_json();
void loadMSdata(char filename[]);
void loadMOdata(char filename[]);
int tokenid(char symbol[]);
int bltokenid(char symbol[], bool nonew = false);
bool checktoken(char symbol[], bool includebridges = false);
int parseHU(ifstream &infile, char buffer[], int id = -1);
void storedesired (int id, int pos1, int pos2, int size);
void resolvebases();
int getstartpos(int id);
void getinput(ifstream &infile, char currsymbol[], char &curroperator, char remainder[]);
void parseinput(char buffer[], char &curroperator, char remainder[]);
void parseblocks(ifstream &infile, char buffer[], int id);

void loadsequences_MO(char filename[]);
void loadsequences_DD(char filename[]);
void loadsequences_rand(int suffix);
char* fullpath(char filename[], char *extension = NULL, int round = -1, int trial = -1);
void displaysequences();
void outputINfile(int mode);

int meta_analyze();
bool isundesired_c(int first, int second);
bool isundesired_o(int first, int second);
bool isimmutable(int tpos);
void clearpair(int first, int second);
void assigntosequence(int pos, base input);
base getfromsequence(int tpos);
int opostotpos(int opos);

void prevented();

void assignseqtoblock();
base basecollide(base first, base second, int pos1, int pos2);

void outputblocks(int mode, int suffix = -1);
char* outputMOpost();
void outputblockspost(ofstream &outfile);

char basetochar(base input);
base chartobase(char input);
base randombase(base mask = N);
base operator ~ (base input);		// BITWISE not
base operator ! (base input);		// COMPLEMENT
void operator ++ (base &input, int);

void displaysplash();
//void userinterface();
//void displaydesigner();

void handleerror(int errorlevel);
void handlewarning(int errorlevel, int pos1 = 0, int pos2 = 0, int data = 0);

/****************** BEHOLD THE MAIN FUNCTION *********************/

int main(int argc, char **argv)
{
	try
	{		
		char *cmd[20];					// array of pointers
		for (int i = 0; i < 20; i++)
			cmd[i] = (char*) malloc(stringsize * sizeof(char));
		
		char path[stringsize];
		struct stat st;
				
		char job[16], token[16], trial[16], designer;
		int tries = 1, rounds;
		
		//cout << getenv("HOME") << endl;
		if (getenv("HOME") == NULL && getenv("CLDDPATH") == NULL)
			throw 13;
		//	setenv("HOME", getpwuid(getuid())->pw_dir, 0);		

		//setenv("PATH", "/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin", 0);
		
		if (getenv("HOME") != NULL)
		{
			strcpy(cmd[0], getenv("HOME"));
			strcat(cmd[0], "/Documents/Multisubjective/multisubjective.cfg");
			if (stat(cmd[0], &st) == 0)		// only if default config file exists
				loadsettings(cmd[0]);
		}
		
		if (argc > 1)
			cout << "\nThank you for using Multisubjective Design " <<vers<< "     by John P. Sadowski" << endl;
		else
			displaysplash();
		
		if (argc > 1)
			commandline(argc, argv, job, designer, trial, token);
		else
		{
			do
			{
				cout << "d - Load a DD file                      n - Load a NUPACK-MO file               " << endl;
				cout << "m - Load multiple DD files              a - Autofill from last MO web submission" << endl;
				cout << "f - Fill with random bases              s - Set directory and other options     " << endl;
				cout << "Or input a NUPACK job number            " << endl;
				cout << "Choose wisely: ";
				cin >> job;
				
				while (!atoi(job) && job[0] != 'd' && job[0] != 'm' && job[0] != 's' && job[0] != 'n' && job[0] != 'a' && job[0] != 'f')
				{
					cout <<"Really?\nTry again: ";
					cin >> job;
				}
			
				if (job[0] == 's')
					getsettings();
			
			}
			while (job[0] == 's');
		
			cout << endl;
			cout << "o - Run DD once                         w - Submit to NUPACK-MO web server      " << endl;
			cout << "l - Run DD in loop                      r - Use random bases in loop            " << endl;
			cout << "x - No designer                                     " << endl;
			cout << "Choose wisely: ";
			cin >> designer;
		
			while (designer != 'o' && designer != 'l' && designer != 'w' && designer != 'r' && designer != 'x')
			{
				cout <<"Really?\nTry again: ";
				cin >> designer;
			}
		}
		
		if (designer == 'l' || designer == 'r')
		{
			rounds = 10;
			strcat(outfile_prefix, "_r0");
		}
		else
			rounds = 1;
		
		strcpy(seq_infile, seqfile_prefix);
		if (job[0] == 'd')									// set extension for sequence input filename
			strcat(seq_infile,".dd");
		else if (job[0] == 'm' || job[0] == 'f')
		{
			strcat(seq_infile,"-_.dd");
			tries = 10;
		}
		else
			strcat(seq_infile,".ms");
		
		
		if (job[0] != 'n' && job[0] != 'd' && job[0] != 'm' && job[0] != 'f')
		{
			if (job[0] == 'a')
			{
				ifstream infile(fullpath("response.html"));	
				if (infile.fail())
					throw 18;
				char buffer;
				do
					infile >> buffer;
				while (buffer < '0' || buffer > '9');
				
				job[0] = '\0';
				while (buffer >= '0' && buffer <= '9')
				{
					strncat(job, &buffer, 1);
					infile >> buffer;
				}
				
				cout << "Job number is " << job << endl;
				
				do
					infile >> buffer;
				while (buffer != '=');
				infile >> buffer;
				
				token[0] = '\0';
				while (buffer != '&')
				{
					strncat(token, &buffer, 1);
					infile >> buffer;
				}
				
				cout << "Token is " << token << endl;
				
			}
			else
			{
				strcpy(cmd[0], fullpath("/mo_output/"));
				strcat(cmd[0], job);
				
				if (stat(cmd[0], &st) != 0)	// download only if directory doesn't exist
				{		
					if (argc <= 1)
					{
						cout << "Input token: ";
						cin >> token;
					}
					else if (token[0] == '\0')	// token needed but not provided in command line
						throw 57;
				}
				else
				{
					cout << "Job is available locally.\n";
					token[0] = '~';		// dummy value to indicate local version
				}
			}
			
			if (argc <= 1)
			{
				cout << "Input trial id: ";
				cin >> trial;
			}
			
			if (token[0] != '~')
			{
				cout << "\nGetting NUPACK-multiobjective results from webserver...\n";
				strcpy(path, "usr/bin/curl");
				strcpy(cmd[0], "curl");
				strcpy(cmd[1], "-o");
				strcpy(cmd[2], fullpath("mo_output.zip"));
				strcpy(cmd[3], "http://www.nupack.org/design/download_zip/");
				strcat(cmd[3], job);
				strcat(cmd[3], "?token=");
				strcat(cmd[3], token);
				forkexec(path, cmd, 4);
			  
				cout << "\nUnzipping multiobjective results...\n";
				strcpy(path, "usr/bin/unzip");
				strcpy(cmd[0], "unzip");
				strcpy(cmd[1], "-q");
				strcpy(cmd[2], fullpath("mo_output.zip"));
				strcpy(cmd[3], "-d");
				strcpy(cmd[4], fullpath("mo_output"));
				forkexec(path, cmd, 5);
			}
			
			remove(fullpath(seq_infile));
			
			strcpy(path, "/bin/cp");
			strcpy(cmd[0], "cp");
			strcpy(cmd[1], "-i");
			strcpy(cmd[2], fullpath("mo_output/"));
			strcat(cmd[2], job);
			strcat(cmd[2], "/");
			strcat(cmd[2], job);
			strcat(cmd[2], "_");
			strcat(cmd[2], trial);
			strcat(cmd[2], "_0.npo");
			strcpy(cmd[3], fullpath(seq_infile));
			forkexec(path, cmd, 4);
		}
				
		//cout << "\nLoading structural data from file...\n";
		initialize();
		loadMSdata(fullpath(infile_prefix, ".ms"));
		loadMOdata(fullpath(infile_prefix, ".np"));
		resolvebases();
		
		for (int roundnum = 1; roundnum <= rounds; roundnum++)
		{
		
			//cout << "\nExtracting sequences...\n";

			int favoritetrial = -1;
			int favoritescore = 1000000;	// dummy values
			int currscore = 0;
			
			if (designer == 'r' || designer == 'l')
				cout << "\n===================ROUND " << roundnum-1 << "===================\n";
			
			while (tries > 0)
			{
				tries--;
				//cin >> job[3];
					
				if (job[0] == 'f')
				{
					for (int i = 0; i <= 9; i++)
						loadsequences_rand(i);
					job[0] = 'm';
					//strcpy(seq_infile, seqfile_prefix);
					//strcat(seq_infile, "-_.dd");
				}
				
				if (job[0] == 'd')							// get the sequences from the file
				{
					loadsequences_DD(fullpath(seq_infile));
					//outputblocks(3);
				}
				else if (job[0] == 'm')
				{
					seq_infile[strlen(seq_infile)-4] = char((9-tries)+'0');
					//cout << "\n\n\n===================" << seq_infile << "===================" << endl;
					cout << "\n" << seq_infile << ": ";
					loadsequences_DD(fullpath(seq_infile));
					outputblocks(3);
				}
				else
					loadsequences_MO(fullpath(seq_infile));
		
				//displaysequences();
				if ( !(designer == 'l' || designer == 'r') || tries == 9 )
				{
					outputlog();
					if (workbench)
						outputlog_json();
				}
		
				if (stat(fullpath("/nupack"), &st) != 0)	// create directory only if it doesn't exist
					if (mkdir(fullpath("nupack"), 0755) == -1) throw 28;
			
				if (getenv("NUPACKHOME") == NULL)
					setenv("NUPACKHOME", nupackhome, 0);	// set NUPACKHOME environment variable if not already set
				//cout << "\nNUPACKHOME is " << getenv("NUPACKHOME") << endl;
			
				//cout << "\nRunning NUPACK analysis on closed hairpins...\n";
				outputINfile(0);
				strcpy(path, getenv("NUPACKHOME"));
				strcat(path, "/bin/complexes");
				if (stat(path, &st) != 0)				// check to see whether NUPACKHOME is correctly set
					throw 61;
				strcpy(cmd[0], "complexes");
				strcpy(cmd[1], "-material");
				strcpy(cmd[2], material);
				strcpy(cmd[3], "-T");
				strcpy(cmd[4], temperature);
				strcpy(cmd[5], "-sodium");
				strcpy(cmd[6], sodium);
				strcpy(cmd[7], "-magnesium");
				strcpy(cmd[8], magnesium);
				strcpy(cmd[9], "-dangles");
				strcpy(cmd[10], dangles);
				strcpy(cmd[11], "-pairs");
				strcpy(cmd[12], "-ordered");
				strcpy(cmd[13], "-cutoff");
				strcpy(cmd[14], threshold);
				strcpy(cmd[15], "-quiet");
				if (workbench)
				{
					strcpy(cmd[16], "-mfe");
					strcpy(cmd[17], fullpath("nupack/ms0"));
					forkexec(path, cmd, 18);
				}
				else
				{
					strcpy(cmd[16], fullpath("nupack/ms0"));
					forkexec(path, cmd, 17);
				}


				//cout << "Running NUPACK analysis on open hairpins...\n";
				outputINfile(2);
				if (workbench)
				{
					strcpy(cmd[17], fullpath("nupack/ms2"));		// keep other arguments from last call
					forkexec(path, cmd, 18);
				}
				else
				{
					strcpy(cmd[16], fullpath("nupack/ms2"));
					forkexec(path, cmd, 17);
				}
		
				//cout <<"Tabulating undesired secondary structure...\n";
				currscore = meta_analyze();
				
				if (currscore < favoritescore)
				{
					favoritescore = currscore;
					favoritetrial = 9-tries;
				}
		
				//cout <<"\nChecking for prevented sequences...\n";
				prevented();
		
				displaysequences();
			
				//cout <<"\nAssigning sequences to blocks...";
				assignseqtoblock();
		
				//cout <<"\n\nWriting blocks to file...";
				if (job[0] == 'm')
				{
					outputblocks(0, 9-tries);
					outputblocks(1, 9-tries);
				}
				else
				{
					outputblocks(0);
					outputblocks(1);
				}
			}
			
			if (job[0] == 'm')
				cout << "\nFavorite trial was " << favoritetrial << endl;
			
			if (roundnum == rounds && (designer == 'l' || designer == 'r'))
			{
				//cout << "Do more rounds (y/n)? ";
				//cin >> job[1];
				//if (job[1] == 'n')
					break;						// don't do designer on last round if there are multiple rounds
				//else
				//	rounds += 5;
			}
			
			if (designer == 'r')
			{
				//cout << "\n\nRandomizing problem bases...\n";

				if (roundnum == 1)
					strcat(seqfile_prefix, "_r_");
				seqfile_prefix[strlen(seqfile_prefix)-1] = roundnum + '0';
				
				for (int i = 0; i <= 9; i++)
					outputblocks(2, i);
			}
			else if (designer == 'o' || designer == 'l')			// use DD
			{
				cout << "\nRunning DD...\n";
				
				if (roundnum == 1)
					strcat(seqfile_prefix, "_r_");
				seqfile_prefix[strlen(seqfile_prefix)-1] = roundnum + '0';
				
				strcpy(path, "/usr/local/bin/node");				
				strcpy(cmd[0], "node");
				if (getenv("CLDDPATH") == NULL)
				{
					strcpy(cmd[1], getenv("HOME"));
					strcat(cmd[1], "/Documents/Multisubjective/cldd.js");
				}
				else
				{
					strcpy(cmd[1], getenv("CLDDPATH"));
					strcat(cmd[1], "/cldd.js");
				}
				strcpy(cmd[2], "-q");
				strcpy(cmd[3], "--format");
				strcpy(cmd[4], "dd");
				strcpy(cmd[5], "--designs");
				strcpy(cmd[6], "10");
				strcpy(cmd[7], "-b");
				strcpy(cmd[8], "5000");
				strcpy(cmd[9], "-o");
				strcpy(cmd[10], fullpath(seqfile_prefix, ".dd"));	
				strcpy(cmd[11], fullpath(outfile_prefix));
				if (job[0] == 'm')
				{
					cmd[13][0] = '-';
					cmd[13][1] = favoritetrial + '0';
					cmd[13][2] = '\0';
					strcat(cmd[11], cmd[13]);
				}
				strcat(cmd[11], ".dd");
				forkexec(path, cmd, 12);
				
				strcpy(path, "/bin/mv");
				strcpy(cmd[0], "mv");
				strcpy(cmd[1], fullpath(seqfile_prefix));
				strcat(cmd[1], "-10.dd");
				strcpy(cmd[2], fullpath(seqfile_prefix));
				strcat(cmd[2], "-0.dd");
				forkexec(path, cmd, 3);
			}
			else if (designer == 'w')						// submit to NUPACK
			{
				cout << "\n\nReally submit job to NUPACK-multiobjective web server [y/n]? ";
				cin >> job;
		
				if (job[0] == 'y')
				{
					cout << "Input email address for MO submission: ";
					cin >> email;
					for (int i = stringsize-1; i > 0; i--)		// convert '@' to "%40"
					{
						email[i] = email[i-2];
						if (email[i] == '@')
						{
							email[i-2] = '%';
							email[i-1] = '4';
							email[i] = '0';
							break;
						}
					}
			
					outputMOpost();
				
					strcpy(path, "/usr/bin/curl");
					strcpy(cmd[0], "curl");
					strcpy(cmd[1], "-d");
					strcpy(cmd[2], "@");
					strcat(cmd[2], fullpath(outfile_prefix, ".post"));
					strcpy(cmd[3], "-o");
					strcpy(cmd[4], fullpath("response.html"));
					strcpy(cmd[5], "http://www.nupack.org/design/new");
					forkexec(path, cmd, 6);
					
					sleep(1);
			
					ifstream infile(fullpath("response.html"));		// open webpage
					if (infile.fail())
						throw 19;
					char buffer;
					strcpy(path, "/usr/bin/open");
					strcpy(cmd[0], "open");
					cmd[1][0] = '\0';
					do
						infile >> buffer;
					while (buffer != '=');
					infile >> buffer;
					infile >> buffer;
					do
					{
						strncat(cmd[1], &buffer, 1);
						infile >> buffer;
					}
					while (buffer != '\"');
					cout << cmd[1];
					forkexec(path, cmd, 2);
			
					infile.close();
				}
			}
			
			if (designer == 'l' || designer == 'r')			// run in loop
			{
				job[0] = 'm';
				tries = 10;
				
				strcpy(seq_infile, seqfile_prefix);
				strcat(seq_infile, "-_");
				strcat(seq_infile, ".dd");
				
				outfile_prefix[strlen(outfile_prefix)-1] = roundnum + '0';
			}
		}
		 
	}
	catch (int errorlevel)
	{
		//outputlog();
		handleerror(errorlevel);
		return errorlevel;
	}
	
	cout << "\nDone!\n\n";
	return 0;
}

void forkexec(char *path, char **cmd, int count)
{
	pid_t pid; 
	int cstatus = 0, wstatus = 0;
	
	/*cout << "> ";
	for (int i = 0; i < count; i++) 
		cout << cmd[i] << ' ';
	cout << endl;*/
	
	pid = fork();
	
	if (pid < 0) 
		throw 46;
	else if (pid == 0)
	{
		cmd[count] = NULL;		// set null pointer to signal end of arguments
		execv(path, cmd);
		throw 58;
	}
	else
		do
			wstatus = waitpid(pid, &cstatus, 0);
		while (wstatus == -1 && errno == EINTR);

	if (errno == ECHILD || errno == EINVAL)
		throw 65;
	
	if (!WIFEXITED(cstatus))
		throw 66;
	
	//cout << "\nChild process exited with status " << WEXITSTATUS(cstatus) << endl;
	
	if (WEXITSTATUS(cstatus) != 0)
		throw 67;
	
	//cout << "\nTHAT WAS PID" << pid << endl;
}

/****************** PROGRAM SETTINGS FUNCTIONS *********************/

void savesettings()
{
	ofstream outfile;
	
	char filename[stringsize];
	
	if (getenv("HOME") == NULL) throw 76;
	strcpy(filename, getenv("HOME"));
	strcat(filename, "/Documents/Multisubjective/multisubjective.cfg");
	outfile.open(filename);
	
	if (outfile.fail())
		throw 15;
	
	outfile << workingdir << endl << infile_prefix << endl << seqfile_prefix << endl << outfile_prefix << endl << nupackhome << endl;
	outfile.close();
}

void loadsettings(char *filename)
{	
	ifstream infile;
	infile.open(filename);
	
	if (!infile.fail())
	{
		infile.getline(workingdir, stringsize);
		infile >> infile_prefix;
		infile >> seqfile_prefix;
		infile >> outfile_prefix;
		if (!infile.eof())
		{
			infile.ignore(stringsize, '\n');
			infile.getline(nupackhome, stringsize);
		}
	}
	else
		throw 70;
	
	infile.close();
}

void getsettings()
{
	char choice;
	char filename[stringsize];
	cout << "Get settings from file (f), input manually (m), or restore defaults (d)? ";
	do
		cin >> choice;
	while (choice != 'f' && choice != 'm' && choice != 'd');
	
	if (choice == 'f')
	{
		cout << "Enter settings filename: ";
		cin >> filename;
		loadsettings(filename);
	}
	else if (choice == 'm')
	{
		cin.ignore(stringsize, '\n');
		cout << workingdir << endl;
		cout << "Input new Multisubjective working directory: ";
		cin.getline(workingdir, stringsize);
		
		cout << nupackhome << endl;
		cout << "Input new NUPACK home directory: ";
		cin.getline(nupackhome, stringsize);
		
		cout << infile_prefix << endl;
		cout << "Input new specification filename prefix: ";
		cin >> infile_prefix;
		
		cout << seqfile_prefix << endl;
		cout << "Input new sequence filename prefix: ";
		cin >> seqfile_prefix;
		
		cout << outfile_prefix << endl;
		cout << "Input new output filename prefix: ";
		cin >> outfile_prefix;
		
		//cout << "Saving settings...\n";
		savesettings();
	}
	else
	{
		strcpy(workingdir, "/d/test");
		strcpy(nupackhome, "/d/New Research/Programming/downloads/nupack3.0");
		strcpy(infile_prefix, "specification");
		strcpy(seqfile_prefix, "sequences");
		strcpy(outfile_prefix, "output");
		savesettings();

	}
}

void commandline(int argc, char **argv, char *job, char &designer, char *trial, char *token)
{
	char jobnumber[stringsize] = "\0";
	job[0] = '\0';
	trial[0] = '\0';
	token[0] = '\0';
	designer = '\0';
	
	int pos = 0, num;
	
	for (int i = 1; i < argc; i += 2)
	{
		if (argv[i][0] != '-')
			throw 53;
		
		switch (argv[i][1])
		{
			case 'm':
				job[0] = argv[i+1][0];
				designer = argv[i+1][1];
				break;
				
			case 'j':
				strcpy(jobnumber, argv[i+1]);
				break;
			case 'r':
				strcpy(trial, argv[i+1]);
				break;
			case 'k':
				strcpy(token, argv[i+1]);
				break;
				
			case 'c':
				loadsettings(argv[i+1]);
				break;
				
			case 'd':
				strcpy(workingdir, argv[i+1]);
				break;
			case 'i':
				strcpy(infile_prefix, argv[i+1]);
				break;				
			case 's':
				strcpy(seqfile_prefix, argv[i+1]);
				break;				
			case 'o':
				strcpy(outfile_prefix, argv[i+1]);
				break;				
			case 'h':
				strcpy(nupackhome, argv[i+1]);
				break;
				
			case 't':
				strcpy(threshold, argv[i+1]);
				break;
			case 'p':
				do
				{
					num = atoi(argv[i+1]);
					if (num == 0)
					   throw 71;
					   
					do
					{
						argv[i+1][pos] = ' ';		// clear the number
						pos++;
					}
					while ( atoi(argv[i+1]) );
					   
					do
					{
						preventlimit[ chartobase(argv[i+1][pos]) ] = num;
						argv[i+1][pos] = ' ';
						pos++;
					}
					while ( !atoi(argv[i+1]) && argv[i+1][pos] != '\0');
				}
				while ( argv[i+1][pos] != '\0');
			break;
				
			case 'w':
				workbench = true;
				i--;		// no argument
				break;
			
			default:
				throw 54;
		}
	}
	
	if (job[0] != 'j' && job[0] != 'd' && job[0] != 'm' && job[0] != 's' && job[0] != 'n' && job[0] != 'a' && job[0] != 'f')	// invalid mode
		throw 55;
	if (designer != 'o' && designer != 'l' && designer != 'w' && designer != 'r' && designer != 'x')		// invalid designer
		throw 69;
	if (job[0] == 'j' && (!atoi(jobnumber) || jobnumber[0] == '\0' || trial[0] == '\0'))	// no job number or trial provided
		throw 56;
	
	if (job[0] == 'j')
		strcpy(job, jobnumber);

}

void initialize()
{
	int i, j;
 
	for (i = 0; i < strandsize; i++)
		for (j = 0; j < arraysize; j++)
			sequence[i][j] = X;
 
	for (i = 0; i < 3*strandsize; i++)
		for (j = 0; j < tokensize; j++)
			block[i][j] = X;

	for (i = 0; i < tokensize; i++)
		for (j = 0; j < strandsize; j++)
			strandtoken[i][j] = '\0';
 
	for (i = 0; i < tokensize; i++)
		for (j = 0; j < 3*strandsize; j++)
			blocktoken[i][j] = '\0';
 
	for (i = 0; i < 3*strandsize; i++)
		blocklength[i] = 0;
 
	for (i = 0; i < strandsize; i++)
		for (j = 0; j < arraysize; j++)
			strandblocks[i][j] = 0;
 
	numstrands = 0;
 
	for (i = 0; i < desiredsize; i++)
		immutablebases[i] = 0;
	
	for (i = 0; i < desiredsize; i++)
	{
		desiredbases[i][0] = 0;
		desiredbases[i][1] = 0;
	}
	
	srand(time(NULL));
	
}

void outputlog()
{
	int i, j;
	
	//cout << fullpath(outfile_prefix, ".log") << endl;
	log.open(fullpath(outfile_prefix, ".log"));
	if (log.fail())
		throw 4;
	
	log << "This is Multisubjective v" << vers;
	time_t rawtime = time(NULL);
	log << "\nHerein lies the processed input data and analysis results of the job run at " << ctime(&rawtime);
	
	log << "\nMultisubjective working directory: ";
	log << workingdir;
	log << "\nSpecification filename prefix: ";
	log << infile_prefix;
	log << "\nSequence input filename: ";
	log << seq_infile;
	log << "\nOutput filename prefix: ";
	log << outfile_prefix;
	log << "\nNUPACK home directory preset: ";
	log << nupackhome;
	log << "\nEmail address: ";
	log << email;	
	
	log << "\n\nnumstrands:\n";	
	log << numstrands;
	
	log << "\n\nstrandtoken:\n";	
	for (i = 0; i < strandsize; i++)
		log << i << ':' << strandtoken[i] << ' ';
	
	log << "\n\nstrandlength:\n";	
	for (i = 0; i < strandsize; i++)
		log << strandlength[i] << ' ';
	
	log << "\n\noffset:\n";	
	for (i = 0; i < strandsize; i++)
		log << offset[i] << ' ';
	
	log << "\n\nsequence:\n";
	for (i = 0; i < strandsize; i++)
	{
		for (j = 0; j < arraysize; j++)
			log << basetochar(sequence[i][j]);
		log << endl;
	}
	
	log << "\n\nstrandblocks:\n";	
	for (i = 0; i < strandsize; i++)
	{
		for (j = 0; j < arraysize; j++)
			log << strandblocks[i][j] << ' ';
		log << endl;
	}
	
	log << "\n\nblocktoken:\n";	
	for (i = 0; i < 3*strandsize; i++)
		log << blocktoken[i] << ' ';
	
	log << "\n\nblocklength:\n";
	for (i = 0; i < 3*strandsize; i++)
		log << blocklength[i] << ' ';
	
	log << "\n\nblock:\n";	
	for (i = 0; i < 3*strandsize; i++)
	{
		for (j = 0; j < tokensize; j++)
			log << basetochar(block[i][j]);
		log << endl;
	}
	
	log << "\n\nimmutablebases:\n";	
	for (i = 0; i < desiredsize; i++)
		log << immutablebases[i] << ' ';
	
	log << "\n\ndesiredbases:\n";	
	for (i = 0; i < desiredsize; i++)
	{
		log << desiredbases[i][0] << ',';
		log << desiredbases[i][1] << ' ';
	}

	log << "\n\nhairpintemp:\n";
	for (i = 0; i < strandsize; i++)
	{
		log << hairpintemp[i].id << ' ';
		log << hairpintemp[i].pos1 << ' ';
		log << hairpintemp[i].pos2 << ' ';
		log << hairpintemp[i].size << endl;
	}
	
	log << "\n\nbridgetemp:\n";
	for (i = 0; i < strandsize; i++)
	{
		log << bridgetemp[i].id1 << ' ';
		log << bridgetemp[i].id1 << ' ';
		log << bridgetemp[i].pos1 << ' ';
		log << bridgetemp[i].pos2 << ' ';
		log << bridgetemp[i].size << ' ';
		log << bridgetemp[i].token << endl;
	}
	
	log.close();
}

void outputlog_json()
{
	int i, cumpos;
	
	//cout << fullpath(outfile_prefix, ".log") << endl;
	json.open(fullpath(outfile_prefix, ".mso"), fstream::out);
	if (json.fail())
		throw 72;
	
	json << "{\n";
	json << "\t\"Multisubjective_vers\":\"" << vers << "\",\n";
	time_t rawtime = time(NULL);
	json << "\t\"time\":\"" << ctime(&rawtime);
	long fpos = json.tellp();		// get rid of newline
	json.seekp(fpos-1);
	json << "\",\n";
	
	json << "\n";
	json << "\t\"strands\":[\n";
	
	cumpos = 0;		// cumulative position
	for (i = 0; i < strandsize; i++)
		if (strandtoken[i][0] != '\0')
		{
			cumpos += strandlength[i];
			json << "\t\t{ \"name\":\"" << strandtoken[i] << "\", \"length\":" << strandlength[i] << ", \"range\":[" << cumpos-strandlength[i]+1 << "," << cumpos << "] },\n";
		}
	
	json << "\t],\n";
	json << "\t\"immutable\":[";
	
	if (immutablebases[0] != 0)
		json << immutablebases[0];
	for (i = i; i < desiredsize; i++)
		if (immutablebases[i] != 0)
			json << "," << immutablebases[i];
	
	json << "],\n";
	
	json << "\t\"desired\":[\n";
	if (desiredbases[0][0] != 0)
		json << "\t\t{\"pair\":[" << desiredbases[0][0] << "," << desiredbases[0][1] << "]}";
	for (i = 1; i < desiredsize; i++)
		if (desiredbases[i][0] != 0)
			json << ",\n\t\t{\"pair\":[" << desiredbases[i][0] << "," << desiredbases[i][1] << "]}";

	json << "\n\t],\n";
	json.close();
}

/****************** FILE LOADING FUNCTIONS *********************/

void loadMSdata(char filename[])
{
	char currsymbol[stringsize], buffer[stringsize];
	int currid, bridgecounter = 0;
	char curroperator;
	ifstream infile;
	
	infile.open(filename);
	if (infile.fail())
		throw 20;
	
	infile >> buffer;
	//cout << buffer << endl;
	
	while(!infile.eof())
	{	
		if (buffer[0] == '#')				// comment
		{
			infile.getline(buffer, stringsize, '\n');
			infile >> buffer;
			//cout << buffer << endl;
		}
		else if (!strcmp(buffer, "hairpin") || !strcmp(buffer, "coop"))
		{
			getinput(infile, currsymbol, curroperator, buffer);
			currid = tokenid(currsymbol);
			
			if (curroperator == '=')
			{
				offset[currid] = atoi(buffer);
				if (offset[currid] == 0 || offset[currid] == 1 || offset[currid] == -1)	//error
					throw 22;
			}
			else if (curroperator == ':')
			{
				if (buffer[0] == '+')
					offset[currid] = 1;
				else if (buffer[0] == '-')
					offset[currid] = -1;
			}
			else
				throw 24;
			
			numstrands++;
			if (numstrands >= strandsize)
				throw 49;

			infile >> buffer;
			//cout << buffer << endl;
		}
		else if (!strcmp(buffer, "bridge"))
		{
			infile >> currsymbol;
			//cout << currsymbol << endl;
			bridgetemp[bridgecounter].id1 = tokenid(currsymbol);
			getinput(infile, currsymbol, curroperator, buffer);
			bridgetemp[bridgecounter].id2 = tokenid(currsymbol);
			
			if (curroperator == ':')
			{
				strcpy(bridgetemp[bridgecounter].token, buffer);
				infile >> buffer;
				//cout << buffer << endl;
			}
			else if (curroperator == '=')
			{
				if (!atoi(buffer))
					throw 50;
				bridgetemp[bridgecounter].pos1 = atoi(buffer);
				
				infile >> buffer;
				if (!atoi(buffer))
					throw 51;
				bridgetemp[bridgecounter].pos2 = atoi(buffer);
				
				infile >> buffer;
				if (!atoi(buffer))
					throw 52;
				bridgetemp[bridgecounter].size = atoi(buffer);
				
				infile >> buffer;
				//cout << buffer << endl;
			}
			else
				throw 29;
 
			bridgecounter++;
		}
		else if (!strcmp(buffer, "static"))
		{
			infile >> currsymbol;
			currid = tokenid(currsymbol);
			
			offset[currid] = atoi(buffer);
			numstrands++;
			if (numstrands >= strandsize)
				throw 59;
			
			infile >> buffer;
		}
		else if (!strcmp(buffer, "length"))  
		{
			int pos1 = 0, pos2 = 0, len = 0, num;		// pos1 for buffer, pos2 for block
			base currbase;
			getinput(infile, currsymbol, curroperator, buffer);
			currid = bltokenid(currsymbol);
			
			while (buffer[pos1] != '\0')
			{
				currbase = chartobase(buffer[pos1]);
				buffer[pos1] = ' ';
				pos1++;
				
				if (atoi(buffer))			// atoi(...) ignores initial whitespace and anything after the initial integer, returns 0 if no integer
				{
					num = atoi(buffer);
					while (buffer[pos1] >= '0' && buffer[pos1] <= '9')
					{
						buffer[pos1] = ' ';
						pos1++;
					}
				}
				else
					num = 1;

				for (int i = 0; i < num; i++)
				{
					block[currid][pos2] = currbase;
					pos2++;
				}
				
				len += num;
				if (pos1 >= stringsize)
					throw 45;
			}
			
			blocklength[currid] = len;
			infile >> buffer;
			//cout << buffer << endl;
		}
		else
		{
			throw 60;
			//infile >> buffer;
			//cout << buffer << endl;
		}
	}
	infile.close();
}

void loadMOdata(char filename[])
{
	char currsymbol[stringsize], buffer[stringsize];
	int currid;
	char curroperator;
	ifstream infile;
	
	infile.open(filename);
	if (infile.fail())
		throw 23;
	
	infile >> buffer;
	//cout << buffer << endl;
	
	while(!infile.eof())
	{	
		if (buffer[0] == '#')				// comment
		{
			infile.getline(buffer, stringsize);
			infile >> buffer;
			//cout << buffer << endl;
		}
		else if (!strcmp(buffer, "`"))		// grave character
		{
			infile >> buffer;
			//cout << buffer << endl;
		}
		else if (!strcmp(buffer, "structure"))
		{
			getinput(infile, currsymbol, curroperator, buffer);
			
			if (checktoken(currsymbol, true))
			{
				currid = tokenid(currsymbol);
				if (currid < strandsize)	//hairpin
					strandlength[currid] = parseHU(infile, buffer, currid);
				else
					parseHU(infile, buffer, currid);	// don't try to set standlength for bridges, it will cause an overflow!
			}
			else
			{
				infile.getline(buffer, stringsize);		// ignore structures not defined in ms.txt
				infile >> buffer;
				//cout << buffer << endl;
			}
 		}
		else
		{
			parseinput(buffer, curroperator, currsymbol);
			
			if (curroperator == '\0')
				infile >> curroperator;
			
			if (checktoken(buffer) && (curroperator == ':' || curroperator == '.'))	// it might be a strand-block assignment
			{
				currid = tokenid(buffer);
				
				if (curroperator == '.')
				{
					if (currsymbol[0] == 's' && currsymbol[1] == 'e' && currsymbol[2] == 'q')
					{
						strcpy(buffer, currsymbol);							// need to get past the ".seq =" 
						parseinput(buffer, curroperator, currsymbol);		// check if first token's already in remainder
						if (curroperator == '\0' || currsymbol[0] == '\0')	// if not, get it from file
							getinput(infile, buffer, curroperator, currsymbol);
						if (currsymbol[0] == '\0')							// if '=' was part of original remainder, the desired token will now been in buffer
							strcpy(currsymbol, buffer);
					}
					else
					{
						infile.getline(buffer, stringsize);		// ignore statments that are not .seq
						infile >> buffer;
						//cout << buffer << endl;
					}
				}
				
				parseblocks(infile, currsymbol, currid);
				strcpy(buffer, currsymbol);
			}
			else							// ignore everything else
			{
				infile.getline(buffer, stringsize);
				infile >> buffer;
				//cout << buffer << endl;
			}
		}
	}
	
	infile.close();
}

int tokenid(char symbol[])
{
	int id = 0;
	while (id < strandsize)			// check all records
	{
		if ( !strcmp(symbol, strandtoken[id]) )
			return id;
		id++;
	}
	
	id = 0;
	while (id < strandsize)			// check bridgetemp records
	{
		if ( !strcmp(symbol, bridgetemp[id].token) )
			return strandsize+id;	// virtual id
		id++;
	}
 
 	// if not found, start a new record
	id = 0;
	while (strandtoken[id][0] != '\0')
	{
		id++;
		if (id >= arraysize)
			throw 47;
	}
 
	strcpy(strandtoken[id], symbol);
	return id;
}
 
bool checktoken(char symbol[], bool includebridges /*= false*/)
{
	int id = 0;
	while (id < strandsize)			// check all records
	{
		if ( !strcmp(symbol, strandtoken[id]) )
			return true;
		id++;
	}
	
	if (includebridges)
	{
		id = 0;
		while (id < strandsize)			// check bridgetemp records
		{
			if ( !strcmp(symbol, bridgetemp[id].token) )
				return true;
			id++;
		}
	}
 
	return false;
}
						

int bltokenid(char symbol[], bool nonew /*= false*/) // make sure [0] not used
{
	int id = 1;
	while (id < 3*strandsize)			// check all records
	{
		if ( !strcmp(symbol, blocktoken[id]) )
			return id;
		id++;
	}
					
	if (nonew)
		return 0;
					
	// if not found, start a new record
	id = 1;					
	while (blocktoken[id][0] != '\0')
	{
		id++;
		if (id >= 3*strandsize)
			throw 48;
	}
					
	strcpy(blocktoken[id], symbol);
	return id;
}
						
int parseHU(ifstream &infile, char buffer[], int id /*= -1*/)		// goal: get strand lengths, get desired bases, fill offsets if desired, get open desired bases
{
	int lastH = 0, lastU = 0, begindes = 0, sizedes = 0, len=0;		// lastH and lastU are only needed if autofilling negative polarity
	char curroperator = '\0', remainder[stringsize];
	remainder[0] = '~';			// dummy value
 
	if (id < -1 || id >= 2*strandsize)
		throw 30;
	
	while(1)
	{
		if (remainder[0] != '~')	// not first time
		{
			if (remainder[0] != '\0')
				strcpy(buffer, remainder);
			else
				infile >> buffer;
		}
		else
			remainder[0] = '\0';
		
		parseinput(buffer, curroperator, remainder);
 
		if (buffer[0] == 'U')
		{
			buffer[0] = ' ';
			if (!atoi(buffer))
 				throw 25;
			
			if (id != -1 && offset[id] == -1)
				lastU = atoi(buffer);
 
			len += atoi(buffer);
 
		}
		else if (buffer[0] == 'H' || buffer[0] == 'D')
		{
			buffer[0] = ' ';
			if (!atoi(buffer))
				throw 26;
			
			int currlen = atoi(buffer);;

			if (id != -1 && offset[id] == 1)
				offset[id] = len + currlen;  // this is first H; set strand offset if pos polarity
			if (id != -1 && offset[id] == -1)
				lastH = currlen;
   
			begindes = len;
			sizedes = currlen;
			len += currlen;
			
			if (curroperator == '\0')		// need to know what's after D_
			{
				getinput(infile, buffer, curroperator, remainder);
				if (buffer[0] != '\0')		// if no parenthesis, the next U_ is in buffer, not remainder
					strcpy(remainder, buffer);
			}
			
			if ( curroperator == '(' )							
				len += parseHU(infile, remainder, -1);		// recurse to get what's in parens
			else
			{
				infile >> remainder;						// if thing following D_ is not in parens, we need to process the U_ token that follows it
				
				if (remainder[0] != 'U')
					throw 44;
				
				remainder[0] = ' ';
				if (!atoi(remainder))
					throw 27;
				
				if (id != -1 && offset[id] == -1)
					lastU = atoi(remainder);
				
				len += atoi(remainder);
			}
			storedesired(id, begindes+1, len+1, sizedes);
			len += currlen;
			begindes = 0;
			remainder[0] = '\0'; //because what's in remainder has now already been parsed
		}
		else if (curroperator == '+')
		{}								// discard '+' operators
		else
		{
			if (id != -1 && offset[id] == -1)
				offset[id] = -(len - lastU - lastH);
			
			buffer[strlen(buffer)+1] = '\0';
			buffer[strlen(buffer)] = curroperator;	// put unused tokens back
			strcat(buffer, remainder);
			
			break;	// end of HU structure
		}
		
		if ( curroperator == ')' )		// end recursion
			break;
	}
	
	return len;
}
 
void storedesired (int id, int pos1, int pos2, int size)
{
	static int hairpincounter = 0;
	
	if (id < strandsize)		// hairpin
	{
		hairpintemp[hairpincounter].id = id;
		hairpintemp[hairpincounter].pos1 = pos1;
 		hairpintemp[hairpincounter].pos2 = pos2;
 		hairpintemp[hairpincounter].size = size;
		
		hairpincounter++;
	}
	else		// bridge, used for autofilling bridge data
	{
		id -= strandsize;
		bridgetemp[id].pos1 = pos1 + offset[bridgetemp[id].id1];
		bridgetemp[id].pos2 = pos2 - strandlength[bridgetemp[id].id1] + offset[bridgetemp[id].id1];
		bridgetemp[id].size = size;
	}	
}

void resolvebases()		// desired and immutable
{
	int i, j, k, startpos1, startpos2, counter = 0;
 
	for (i = 0; hairpintemp[i].size != 0; i++)
	{
		startpos1 = getstartpos(hairpintemp[i].id);
		for (j = 0; j < hairpintemp[i].size; j++)
		{
			desiredbases[counter][0] = startpos1 + hairpintemp[i].pos1 + j;
			desiredbases[counter][1] = startpos1 + hairpintemp[i].pos2 + hairpintemp[i].size - 1 - j;
		
			counter++;
			if (counter == desiredsize)
				throw 32;
		}
	}
 
	for (i = 0; bridgetemp[i].size != 0; i++)
	{
		startpos1 = getstartpos(bridgetemp[i].id1);
 		startpos2 = getstartpos(bridgetemp[i].id2);
		for (j = 0; j < bridgetemp[i].size; j++)
		{
			desiredbases[counter][0] = startpos1 + bridgetemp[i].pos1 + j;
			desiredbases[counter][1] = startpos2 + bridgetemp[i].pos2 + bridgetemp[i].size -1 - j;
			
			if (desiredbases[counter][0] > desiredbases[counter][1])	// they need to be in the right order
			{
				desiredbases[counter][0] += desiredbases[counter][1];  // switch them
				desiredbases[counter][1] = desiredbases[counter][0] - desiredbases[counter][1];
				desiredbases[counter][0] += desiredbases[counter][1];
			}
		
			counter++;
			if (counter == desiredsize)
				throw 33;
		}
	}
 
	counter = 0;
	startpos2 = 1;   // = tpos
	for (i = 0; i < numstrands; i++)    // for each strand
	{
		if (startpos2 != getstartpos(i) + 1)
			throw 31;
		
		for (j = 0; strandblocks[i][j] != 0; j++)  // for each block
		{
			for (k = 0; k < blocklength[ abs(strandblocks[i][j]) ]; k++)	// for each base
			{
				//cout << i << ' ' << j << ' ' << k << "  " << startpos2 << endl;
				if ( strandblocks[i][j] > 0)
				{
					if (block[ strandblocks[i][j] ][k] == Y)
					{
						//cout << "   " << counter << ' ' << startpos2 << endl;
						immutablebases[counter] = startpos2;
						counter++;
					}
				}
				else if ( strandblocks[i][j] < 0)  
				{
					if (block[ -strandblocks[i][j] ][ blocklength[-strandblocks[i][j]] - 1 - k ] == Y) // if complement, walk block in reverse
					{
						//cout << "   " << counter << ' ' << startpos2 << endl;
						immutablebases[counter] = startpos2;
						counter++;
					}
				}
				startpos2++;
				if (counter >= desiredsize)
					throw 42;
			}
		}
	}
}

int getstartpos(int id)		// start = putative 0 position
{
	int startpos = 0;
	int i;
	for (i = 0; i < id; i++)
		startpos += strandlength[i];
 
	return startpos;
}
 
void getinput(ifstream &infile, char currsymbol[], char &curroperator, char remainder[])
{	
	char buffer[stringsize];
	
	infile >> currsymbol;
	parseinput(currsymbol, curroperator, remainder);
	
	if (curroperator == '\0')
	{
		infile >> buffer;
		parseinput(buffer, curroperator, remainder);
		if (curroperator == '\0')
			throw 21;
	}

	if (remainder[0] == '\0')
		infile >> remainder;
	//cout << "Getinput: " << currsymbol << ' ' << curroperator << ' ' << remainder << endl;
}

void parseinput(char buffer[], char &curroperator, char remainder[])	// buffer gets whatever is before operator, remainder gets what's after, and operator is returned
{
	int i, j;
	for (i = 0; i < stringsize; i++)
		if ( buffer[i] == '=' || buffer[i] == ':' || buffer[i] == '(' || buffer[i] == ')' || buffer[i] == '<' || buffer[i] == '+' || buffer[i] == '.' || buffer[i] == '\0')
			break;
	
	if (buffer[i] == '\0' || i == stringsize)	// if no operator
	{
		remainder[0] = '\0';
		curroperator = '\0';
		return;
	}
	
	curroperator = buffer[i];
	
	for (j = 0; buffer[i+j+1] != '\0'; j++)		// copy rest of buffer to remainder
		remainder[j] = buffer[i+j+1];
	
	buffer[i] = '\0';
	remainder[j] = '\0';
}

void parseblocks(ifstream &infile, char buffer[], int id)
{	
	int i, num = 0;
	
	while (1)
	{
		strandblocks[id][num] = 1; //dummy value just to get sign
		for (i = 0; i < stringsize; i++)		// check if complement
			if (buffer[i] == '*')
			{
				strandblocks[id][num] = -1;
				buffer[i] = '\0';
				break;
			}
			else if (buffer[i] == '\0')
				break;
		
		strandblocks[id][num] *= bltokenid(buffer, 1);		// 1 for nonew
		if (strandblocks[id][num] == 0)
			break;
 
		//cout << strandblocks[id][num] << ' ';
		
		num++;
		if (num >= arraysize-1)
			throw 14;
		
		infile >> buffer;
		if (infile.eof())
			break;
	}
	
	strandblocks[id][num] = 0; //end of list
}

void loadsequences_MO(char filename[])
{
	int strand, pos;
	char currbase, token[tokensize];
	ifstream infile;
	
	infile.open(filename);
	if (infile.fail())
		throw 1;
	
	while (1)							// BEGIN strandwise while-loop
	{
		//get to token
		currbase = '\0';
		
		while (currbase != '%')
		{
			currbase = infile.get();
			if (infile.eof()) break;
		}
		if (infile.eof()) break;
		
		infile >> token;
		
		// get rid of colon character
		for (pos = 0; pos < tokensize; pos++)
			 if (token[pos] == ':')
			 {
				 token[pos] = '\0';
				 break;
			 }
		
		if (checktoken(token))
			strand = tokenid(token);
		else
			strand = strandsize;	// dummy value to avoid getting sequence
		
		currbase = infile.get();  // get rid of space character
		
		if (strand != strandsize && offset[strand] != 0)		// get sequence only if it is a hairpin (or coop)
		{
			pos = 0;
			while (1)									// BEGIN basewise while-loop
			{			
				currbase = infile.get();
				//cout << currbase;
				
				if (currbase == '\n')
					break;
				
				if (currbase != '+')
				{
					sequence[strand][pos] = chartobase(currbase);
					pos++;
					
					if (pos >= arraysize)
						throw 9;
				}
			}
			sequence[strand][pos] = X;
		}
		else							// if not a hairpin, discard sequence
			while (currbase != '\n')
				currbase = infile.get();
	}										// END strandwise while-loop
	
	infile.close();
}

void loadsequences_DD(char filename[])
{
	int blocknum, pos, numblocks;
	char buffer[stringsize];
	ifstream infile;
	
	infile.open(filename);
	if (infile.fail())
		throw 40;
	
	// get block sequences from file
	infile >> numblocks;

	for (blocknum = 1; blocknum <= numblocks; blocknum++)
	{
		//cout << blocknum << ' ';
		infile >> buffer;
		
		if ( infile.eof() )
			throw 43;
		
		for (pos = 0; buffer[pos] != '\0'; pos++)
			block[blocknum][pos] = chartobase(buffer[pos]);

		if (pos != blocklength[blocknum])
			throw 41;
		
		infile >> buffer >> buffer;		// get rid of last two columns
	}
	
	infile.close();
	
	// transfer block sequences to strand sequences
	
	int i, j, k;
	for (i = 0; i < numstrands; i++)    // for each strand
	{
		pos = 0;   // = position within strand
		for (j = 0; strandblocks[i][j] != 0; j++)  // for each block
		{
			for (k = 0; k < blocklength[ abs(strandblocks[i][j]) ]; k++)	// for each base
			{
				//cout << i << ' ' << j << ' ' << k << "  " << startpos2 << endl;
				if ( strandblocks[i][j] > 0)
				{
					sequence[i][pos] = block[ strandblocks[i][j] ][k];
				}
				else if ( strandblocks[i][j] < 0)  
				{
					sequence[i][pos] = !block[ -strandblocks[i][j] ][ blocklength[-strandblocks[i][j]] - 1 - k ]; // if complement, walk block in reverse
				}
				pos++;
				
				if (pos >= arraysize)
					throw 8;
			}
		}
	}
		
	/*cout << "\n\nblock:\n";	
	for (i = 0; i < 3*strandsize; i++)
	{
		for (j = 0; j < tokensize; j++)
			cout << basetochar(block[i][j]);
		cout << endl;
	}*/
}

void loadsequences_rand(int suffix)
{
	int blocknum, pos;
	
	// generate random block sequences
	
	for (blocknum = 1; blocklength[blocknum] != 0; blocknum++)		
		for (pos = 0; pos < blocklength[blocknum]; pos++)
			block[blocknum][pos] = randombase();

	// transfer block sequences to strand sequences
	
	int i, j, k;
	for (i = 0; i < numstrands; i++)    // for each strand
	{
		pos = 0;   // = position within strand
		for (j = 0; strandblocks[i][j] != 0; j++)  // for each block
		{
			for (k = 0; k < blocklength[ abs(strandblocks[i][j]) ]; k++)	// for each base
			{
				//cout << i << ' ' << j << ' ' << k << "  " << startpos2 << endl;
				if ( strandblocks[i][j] > 0)
				{
					sequence[i][pos] = block[ strandblocks[i][j] ][k];
				}
				else if ( strandblocks[i][j] < 0)  
				{
					sequence[i][pos] = !block[ -strandblocks[i][j] ][ blocklength[-strandblocks[i][j]] - 1 - k ]; // if complement, walk block in reverse
				}
				pos++;
				
				if (pos >= arraysize)
					throw 68;
			}
		}
	}
	
	/*cout << "\n\nblock:\n";	
	for (i = 1; i < 3*strandsize && block[i][0] != X; i++)
	{
		for (j = 0; j < tokensize; j++)
			cout << basetochar(block[i][j]);
		cout << endl;
	}
	cout << endl;*/
	
	outputblocks(2, suffix);
}

void displaysequences()
{
	int strand, pos;
	
	log.open(fullpath(outfile_prefix, ".log"), fstream::app);
	if (log.fail())
		throw 77;
	log << "\n\nProcessed strand sequences:\n";
	
	for (strand = 0; strand < numstrands; strand++)							// BEGIN strandwise while-loop
	{
		pos = 0;
		log << strandtoken[strand] << ": \t";
		while (sequence[strand][pos] != X)									// BEGIN basewise while-loop
		{			
			log << basetochar(sequence[strand][pos]);
			pos++;
		}
		log << '\n';
	}										// END strandwise while-loop
	
	log << '\n';
	log.close();
}

char* fullpath(char filename[], char *extension /*= NULL*/, int round /*= -1*/, int trial /*= -1*/)
{
	//char result[256];
	char* result=(char *)malloc(stringsize * sizeof(char));
	
	strcpy(result, workingdir);
	strcat(result, "/");
	strcat(result, filename);
	
	if (round != -1 && trial != -1)
	{
		strcat(result, "_rX");
		result[strlen(result)-1] = round + '0';
		strcat(result, "-X");
		result[strlen(result)-1] = trial + '0';
	}
	
	if (extension != NULL)
		strcat(result, extension);
		
	return result;
}

/****************** UNDESIRED SECONDARY STRUCTURE CHECK *********************/

void outputINfile(int mode)
{
	int strand, pos;
	
	if (mode != 0 && mode != 2) throw 10;
	
	char *filename;
	if (mode == 0)
		filename = fullpath("nupack/ms0.in");
	else if (mode == 2)
		filename = fullpath("nupack/ms2.in");
	
	ofstream outfile;
	outfile.open(filename);
	if (outfile.fail())
		throw 3;
	
	if (mode == 0)
		outfile << numstrands << '\n';
	else
	{
		pos = numstrands;
		for (strand = 0; strand < numstrands; strand++)							// skip static strands
			if (offset[strand] == 0)
				pos--;
		outfile << pos << '\n';
	}
	
	for (strand = 0; strand < numstrands; strand++)							// BEGIN strandwise while-loop
	{
		if (mode == 2 && offset[strand] == 0)		// skip static strands
			continue;
		
		if (mode == 0 || offset[strand] < 0)
			pos = 0;
		else
			pos = offset[strand];
		
		while (sequence[strand][pos] != X && (mode == 0 || offset[strand] > 0 || pos < -offset[strand]))	// BEGIN basewise while-loop
		{			
			outfile << basetochar(sequence[strand][pos]);
			pos++;
		}
		outfile << '\n';
	}										// END strandwise while-loop
	
	//if (mode == 0 || mode == 1)
		outfile << '1';					// only want complexes of N strands
	//else
	//	outfile << '2';
	
	outfile.close();
		
	if (mode == 2)
	{
		outfile.open(fullpath("nupack/ms2.list"));
		if (outfile.fail())
			throw 5;
		
		for (pos = 0; pos < strandsize; pos++)
			if (bridgetemp[pos].id1 != 0)
				outfile << bridgetemp[pos].id1 + 1 << ' ' << bridgetemp[pos].id2 + 1 << endl;		// +1 because MS is 0-relative while NUPACK is 1-relative
			
		outfile.close();
	}
		
}

int meta_analyze()
{
	ifstream infile;
	char buffer[stringsize];
	int first, second, lastfirst, lastsecond, counter=0, tposmax=0, oposmax=0, totalpairs=0;
	
	log.open(fullpath(outfile_prefix, ".log"), fstream::app);
	if (log.fail())
		throw 63;
	log << "\n\nUndesired base pair meta-analysis:\n";
	
	if (workbench)
	{
		json.open(fullpath(outfile_prefix, ".mso"), fstream::ate|fstream::out|fstream::in);		//to enable random access
		if (json.fail())
			throw 73;
		json << "\t\"undesired\":[ \n";
	}
	
	// count tposmax and oposmax
	for (first = 0; first < numstrands; first++)
	{
		tposmax += strandlength[first];
		if (offset[first] > 0)
			oposmax += strandlength[first] - offset[first];
		else
			oposmax += - offset[first];
	}
	//cout << "max: " << tposmax << ',' << oposmax << endl;
	
	lastfirst = tposmax+1;
	lastsecond = tposmax+1;
	
	infile.open(fullpath("nupack/ms0.ocx-epairs"));
	if (infile.fail())
		throw 11;
	
	while (1)
	{
		do
			infile >> buffer;
		while (!infile.eof() && atoi(buffer) != tposmax);
		
		infile >> first;
		infile >> second;
		
		if (infile.eof() || first == tposmax+1)			// end of data
			break;
		
		//the first thing that's not the comment is the line containing tposmax
		while (second != tposmax+1)
		{
			if(isundesired_c(first, second))
			{
				log << first << ' ' << second << endl;
				if (workbench)
					json << "\t\t{\"pair\":[" << first << "," << second << "]},\n";
				totalpairs++;
			}
			
			if (isundesired_c(first, second) && first == lastfirst+1 && second == lastsecond-1)
				counter++;			
			else
			{
				if (counter == 1) // isolated base pair
					clearpair(lastfirst, lastsecond);
				
				if (isundesired_c(first, second))
					counter = 1;
				else
					counter = 0;
			}
						
			if (counter == 2)
				clearpair(first, second);
			else if (counter > 3)
				clearpair(lastfirst, lastsecond);
			
			lastfirst = first;
			lastsecond = second;
			
			infile.get(buffer, 512, '\n');  // get rid of third column
			
			infile >> first;				// get new values
			infile >> second;
		}		
	}
	
	if (counter == 1) // in case the final undesired base pair was isolated
		clearpair(lastfirst, lastsecond);
	
	log << '-' << endl;
	infile.close();
	infile.open(fullpath("nupack/ms2.ocx-epairs"));
	if (infile.fail())
		throw 12;
	
	lastfirst = tposmax+1;
	lastsecond = tposmax+1;
	counter = 0;
	// Now do second file
	while (1)
	{
		do
			infile >> buffer;
		while (!infile.eof() && atoi(buffer) != oposmax);
		
		infile >> first;
		infile >> second;
		
		if (infile.eof())				// end of data
			break;
		if (first == oposmax+1)			// end of one-strand complexes; bridge complexes will appear after this point
			continue;
		
		//the first thing that's not the comment is the line containing oposmax
		while (second != oposmax+1) // end of complex
		{
			if (isundesired_o(first, second))
			{
				log << opostotpos(first) << ' ' << opostotpos(second) << endl;
				if (workbench)
					json << "\t\t{\"pair\":[" << opostotpos(first) << "," << opostotpos(second) << "]},\n";

				//cout << first << '/' << opostotpos(first) << ' ' << second << '/' << opostotpos(second) << endl;
				totalpairs++;
			}
			
			if (isundesired_o(first, second) && first == lastfirst+1 && second == lastsecond-1)
				counter++;			
			else
			{
				if (counter == 1) // isolated base pair
					clearpair(opostotpos(lastfirst), opostotpos(lastsecond));
				
				if (isundesired_o(first, second))
					counter = 1;
				else
					counter = 0;
			}
			
			if (counter == 2)
				clearpair(opostotpos(first), opostotpos(second));
			else if (counter > 3)
				clearpair(opostotpos(lastfirst), opostotpos(lastsecond));
			
			lastfirst = first;
			lastsecond = second;
			
			infile.get(buffer, 512, '\n');  // get rid of third column
			
			infile >> first >> second;
			//cout << first << ' ' << second << ' ' << isundesired_o(first, second) << endl;
		}
	}
	
	if (counter == 1) // in case the last undesired base pair was isolated
		clearpair(opostotpos(lastfirst), opostotpos(lastsecond));
	
	cout << totalpairs << " undesired base pairs detected.  ";
	infile.close();
	log.close();
	
	if (workbench)
	{
		long fpos = json.tellp();		// get rid of last comma
		json.seekp(fpos-2);
		json << "\n\t],\n";
		json.close();
	}
	
	return totalpairs;
}

bool isundesired_c(int first, int second)
{
	int i, totalbases = 0;
	for (i = 0; i < numstrands; i++)
		totalbases += strandlength[i];
	
	if (second == totalbases+1) return false;
	
	for (i = 0; i < desiredsize; i++)
		if (first == desiredbases[i][0] && second == desiredbases[i][1])
			return false;
	
	return true;
}

bool isundesired_o(int first, int second)
{
	return isundesired_c(opostotpos(first), opostotpos(second));
}

bool isimmutable(int tpos)
{
	int i;
	
	for (i = 0; i < desiredsize; i++)
		if (tpos == immutablebases[i])
			return true;
	
	return false;
}

void clearpair(int first, int second)
{
	if (!isimmutable(first))
		assigntosequence(first, N);
	else if (!isimmutable(second))
		assigntosequence(second, N);
	else
		handlewarning(-1, first, second);
}

void assigntosequence(int tpos, base input)
{
	if (tpos <= 0 )
		throw 34;
	
	log << "\tAssigning base " << tpos << " to " << basetochar(input) << endl;
	if (workbench)
	{
		long fpos = json.tellp();		// back up
		json.seekp(fpos-3);
		json << ", \"changed\":{\"" << tpos << "\":\"" << basetochar(input) << "\"}},\n";
	}

	int strand = 0;
	while (tpos > strandlength[strand] && strand < numstrands)
	{
		tpos -= strandlength[strand];
		strand++;
	}
	
	if (strand == numstrands)
		throw 35;
		
	sequence[strand][tpos-1] = input; // 'cause tpos is 1-relative while the array indexes are 0-relative
}

base getfromsequence(int tpos)
{
	if (tpos <= 0 ) throw 36;
	
	int strand = 0;
	while (tpos > strandlength[strand] && strand < numstrands)
	{
		tpos -= strandlength[strand];
		strand++;
	}
	
	if (strand == numstrands)
		throw 37;
	
	return sequence[strand][tpos-1];
}

int opostotpos(int opos)
{
	if (opos <= 0 ) throw 38;
	
	int strand = 0, totaloffset = 0, counter = opos;
	while (counter > (offset[strand] > 0 ? strandlength[strand] - offset[strand] : -offset[strand]) && strand < numstrands)
	{
		if (offset[strand] > 0)
		{
			counter -= strandlength[strand] - offset[strand];
			totaloffset += offset[strand];
		}
		else
		{
			counter -= -offset[strand];
			totaloffset += strandlength[strand] + offset[strand];
		}
		strand++;															
	}
	
	if (strand == numstrands)
		throw 39;
	
	if (offset[strand] > 0)
		totaloffset += offset[strand]; // for strand that base is in; offset only counts if it's positive (i.e. at beginning of strand)
	
	//cout << strand << ' ' << totaloffset << ' ';
	return (opos + totaloffset);
}

/****************** PREVENTED SEQUENCES CHECK *********************/

void prevented()
{
	int pos, tpos = 1, baseoffset;
	base basetype, newbase;
	int counter[15];
	
	log.open(fullpath(outfile_prefix, ".log"), fstream::app);
	if (log.fail())
		throw 64;
	log << "\n\nPrevented sequences analysis:\n";

	if (workbench)
	{
		json.open(fullpath(outfile_prefix, ".mso"), fstream::ate|fstream::out|fstream::in);
		if (json.fail())
			throw 74;
		json << "\t\"prevented\":[ \n";
	}
	
	for (int strand = 0; strand < numstrands; strand++)
	{
		for (basetype = X; basetype < N; basetype++)
			counter[basetype] = 0;
		pos = 0;
		
		do			// for each base (tpos)
		{
			newbase = N;
			for (basetype = A; basetype < N; basetype++)
			{
				if (sequence[strand][pos] & basetype)
					counter[basetype]++;
				else
					counter[basetype] = 0;
				
				if (counter[basetype] >= preventlimit[basetype] && !isimmutable(tpos))
				{
					log << tpos << basetochar(basetype) << ' ';
					if (workbench)
						json << "\t\t{\"range\":[" << tpos-preventlimit[basetype]+1 << "," << tpos << "], \"identity\":\"" << basetochar(basetype) << "\"},\n";
					
					newbase = base(newbase & ~basetype);
				}
			}
			
			//cout << endl << tpos << ' ' << pos << ": " << basetochar(sequence[strand][pos]) << ' ';
			//for (basetype = X; basetype < N; basetype = base(basetype + 1))
			//	cout << basetochar(basetype) << counter[basetype] /*<< '-' << basetochar(base(newbase & basetype))*/ << ' ';
			//while (!_getche()) {}
			
			if (newbase == X)
				handlewarning(-2, tpos);
			else if (newbase != N)		//assign the base
			{
				for (baseoffset = 0; baseoffset < preventlimit[~newbase]; baseoffset++)  // calculate baseoffset
					if ( baseoffset >= tpos || getfromsequence(tpos - baseoffset) == N)	// first, look for an N to replace
						break;
				
				if (baseoffset == preventlimit[~newbase] || baseoffset >= tpos)			// if no N's, find first mutable base
					for (baseoffset = 0; baseoffset < preventlimit[~newbase]; baseoffset++)
						if ( baseoffset >= tpos || !isimmutable(tpos - baseoffset) )
							break;
				
				if (baseoffset != preventlimit[~newbase] || baseoffset >= tpos)
				{
					for (basetype = A; basetype < N; basetype++)
						if (newbase & basetype)
						{
							if (baseoffset == 0 && counter[basetype] == 0)
								counter[basetype] = 1;					// recaulculate counters
						}
						else
							if (counter[basetype] > baseoffset)
									counter[basetype] = baseoffset;
				
					assigntosequence(tpos-baseoffset, newbase);
				}
				else
					handlewarning(-3, tpos);
			}
						
			pos++;
			tpos++;
		}
		while (sequence[strand][pos] != X);
	}
	
	log.close();
	
	if (workbench)
	{
		long fpos = json.tellp();		// get rid of last comma
		//cout << "fpos = " << fpos << " \n";
		json.seekp(fpos-2);
		json << "\n\t],\n";
		json.close();
	}
}

/****************** BLOCK CONVERSION FUNCTIONS *********************/

void assignseqtoblock()
{
	int tpos = 1;
	int strandnum, blocknum, pos, numblocks = 0;
	
	log.open(fullpath(outfile_prefix, ".log"), fstream::app);
	if (log.fail())
		throw 62;
	log << "\nStrand-to-block sequence assignments:";
	
	if (workbench)
	{
		json.open(fullpath(outfile_prefix, ".mso"), fstream::ate|fstream::out|fstream::in);
		if (json.fail())
			throw 75;
		json << "\t\"basecollide\":[ \n";
	}
	
	while (blocklength[numblocks+1] != 0)
		numblocks++;
	
	for (blocknum = 0; blocknum <= numblocks; blocknum++)
		for (pos = 0; pos < blocklength[blocknum]; pos++)
			block[blocknum][pos] = X;
	
	for (strandnum = 0; strandnum < numstrands; strandnum++)
		for (blocknum = 0; strandblocks[strandnum][blocknum] != 0; blocknum++)
		{
			log << "\nBefore: block " << blocktoken[ abs(strandblocks[strandnum][blocknum]) ] << ": ";
			for (pos = 0; pos < blocklength[ abs(strandblocks[strandnum][blocknum]) ]; pos++)
				log << basetochar(block[ abs(strandblocks[strandnum][blocknum]) ][pos]);
		
			if (strandblocks[strandnum][blocknum] >= 0)						// if positive blockid
				for (pos = 0; pos < blocklength[strandblocks[strandnum][blocknum]]; pos++)
					block[strandblocks[strandnum][blocknum]][pos] = basecollide(block[strandblocks[strandnum][blocknum]][pos], getfromsequence(tpos+pos), strandblocks[strandnum][blocknum], pos);
		
			else											// if negative blockid (complement)
				for (pos = 0; pos < blocklength[-strandblocks[strandnum][blocknum]]; pos++)
					block[ -strandblocks[strandnum][blocknum] ][ blocklength[-strandblocks[strandnum][blocknum]]-1-pos ]
					= basecollide(block[ -strandblocks[strandnum][blocknum] ][ blocklength[-strandblocks[strandnum][blocknum]]-1-pos ], !getfromsequence(tpos+pos), -strandblocks[strandnum][blocknum], blocklength[-strandblocks[strandnum][blocknum]]-1-pos);
		
			log << "\nAfter:  block " << blocktoken[ abs(strandblocks[strandnum][blocknum]) ] << ": ";
			for (pos = 0; pos < blocklength[ abs(strandblocks[strandnum][blocknum]) ]; pos++)
				log << basetochar(block[ abs(strandblocks[strandnum][blocknum]) ][pos]);
		
			tpos += blocklength[ abs(strandblocks[strandnum][blocknum]) ];
		}
	
	log.close();
	
	if (workbench)
	{
		long fpos = json.tellp();		// get rid of last comma
		//cout << "fpos = " << fpos << " \n";
		json.seekp(fpos-2);
		json << "\n\t]\n}\n";
		json.close();
	}
}

base basecollide(base first, base second, int pos1, int pos2)    //precedence: mixed > N > ACTG
{
	if (first == X && second == X)
		handlewarning(-4);
	
	if (first == X)
		return second;
	if (second == X)
		return first;
	
	if (first == A || first == C || first == G || first == T)
	{
		if (second == A || second == C || second == G || second == T)
		{
			if (first == second)
				return first;
			else
			{
				handlewarning(-5, pos1, pos2, first + 16*second);
				return first;
			}
		}
		else
			return second;
	}
	else  // N or mixed base
	{
		if (second == A || second == C || second == G || second == T)
			return first;
		else
		{
			if (first & second == X)
			{
				handlewarning(-6, pos1, pos2, first + 16*second);
				return first;
			}
			else
				return base(first & second);
		}
	}
}

void outputblocks(int mode, int suffix /*= -1*/)				// 0=.msq, 1=.dd, 2=.dd/rand, 3=.msq/copy
{
	int blocknum, pos, counter = 0, numblocks = 0;
	
	while (blocklength[numblocks+1] != 0)
		numblocks++;
		
	ofstream outfile;
	
	char filename[stringsize];
	
	if (mode == 3)
	{
		strcpy(filename, seq_infile);
		filename[strlen(filename) - 3] = '\0';
	}
	else if (mode == 2)
		strcpy(filename, seqfile_prefix);
	else
		strcpy(filename, outfile_prefix);
	
	if (suffix != -1)
	{
		char csuffix[3] = {'-', suffix + '0', '\0'};
		strcat(filename, csuffix);
	}
	
	if (mode == 0 || mode == 3)
		outfile.open(fullpath(filename, ".msq"));
	else
	{
		outfile.open(fullpath(filename, ".dd"));
		outfile << numblocks << endl;
	}
	
	if (outfile.fail())
		throw 6;
	
	for (blocknum = 1; blocknum <= numblocks; blocknum++)
	{
		if (mode == 0 || mode == 3)
		{
			outfile << "domain " << blocktoken[blocknum] << " = ";
			
			for (pos = 0; block[blocknum][pos] != X; pos++)
			{
				outfile << basetochar(block[blocknum][pos]);
				if (block[blocknum][pos] != A && block[blocknum][pos] != C && block[blocknum][pos] != G && block[blocknum][pos] != T)
					counter++;
			}
		}
		else
		{
			base writebase, basemask = X;
			for (pos = 0; block[blocknum][pos] != X; pos++)
			{
				writebase = block[blocknum][pos];
				if (writebase != A && writebase != C && writebase != G && writebase != T)
				{
					counter = 32;							// if mixed base, make it upper case
					basemask = base(basemask|writebase);	// take union of all maxed bases in domain
				}
				else
					counter = 0;
				outfile << char(counter + basetochar(randombase(writebase)));
			}
			outfile << " 1 ";
			
			if (basemask == X)
				outfile << 15;
			else
			{
				counter = 0;						// convert Multisubjective base enum to DD code
				if (basemask & C) counter += 1;
				if (basemask & T) counter += 2;
				if (basemask & A) counter += 4;
				if (basemask & G) counter += 8;
				outfile << counter;
			}
		}
		outfile << '\n';
	}
	
	if (mode == 0)
		cout << counter << " bases to design.";
	
	outfile.close();
	}

/****************** MO SUBMISSION FUNCTIONS *********************/

char* outputMOpost()		// URL encoding
{
	char buffer;
	
	ofstream outfile;
	outfile.open(fullpath(outfile_prefix, ".post"));
	if (outfile.fail())
		throw 7;
	
	ifstream infile;
	infile.open(fullpath(infile_prefix, ".np"));
	if (infile.fail())
		throw 17;
	
	infile.unsetf(ios::skipws); // detect whitespace
	
	outfile << "design_job%5Bnucleic_acid_type%5D=DNA";
	outfile << "&design_job%5Btemperature%5D=23.0";
	outfile << "&design_job%5Bnumber_of_trials%5D=1";
	outfile << "&design_job%5Btarget_structure%5D=";
	
	do
	{
		infile >> buffer;
		
		if (buffer == ' ')
			outfile << '+';
		else if (buffer == '+')
			outfile << "%2B";
		else if (buffer == ',')
			outfile << "%2C";
		else if (buffer == '#')
			outfile << "%23";
		else if (buffer == '\n')
			outfile << "%0D%0A";
		else if (buffer == '=')
			outfile << "%3D";
		else if (buffer == '(')
			outfile << "%28";
		else if (buffer == ')')
			outfile << "%29";
		else if (buffer == ':')
			outfile << "%3A";
		else if (buffer == '<')
			outfile << "%3C";
		else if (buffer == '[')
			outfile << "%5B";
		else if (buffer == ']')
			outfile << "%5D";
		else if (buffer == '`')
		{
			outfile << "%0D%0A";
			outputblockspost(outfile);
			do								// get rid of everything until the next grave character
				infile >> buffer;
			while (buffer != '`');
		}
		else
			outfile << buffer;
	}
	while (!infile.eof());
	
	outfile << "&design_job%5Brna_parameter_file%5D=rna1995";
	outfile << "&design_job%5Bdna_parameter_file%5D=dna1998";
	outfile << "&design_job%5Bdangle_level%5D=2";
	outfile << "&design_job%5Bna_salt%5D=0.05";
	outfile << "&design_job%5Bmg_salt%5D=0.0125";
	outfile << "&design_job%5Bprevented_strings%5D=";
	outfile << "&design_job%5Bsequence_constraints%5D=";
	outfile << "&design_job%5Bdotplot_target%5D=0";
	outfile << "&design_job%5Bemail_address%5D=" << email;
	outfile << "&commit=Design";
	
	outfile.close();
	infile.close();
}

void outputblockspost(ofstream &outfile)
{
	int blocknum, pos;

	for (blocknum = 1; blocklength[blocknum] != 0; blocknum++)
	{
		outfile << "domain+" << blocktoken[blocknum] << "+%3D+";
		
		for (pos = 0; block[blocknum][pos] != X; pos++)
			outfile << basetochar(block[blocknum][pos]);
		
		outfile << "%0D%0A";
	}
}

/****************** BASE HANDLING FUNCTIONS *********************/

char basetochar(base input)
{
	switch (input)
	{
		case X: return 'X';
		case A: return 'A';
		case C: return 'C';
		case M: return 'M';
		case G: return 'G';
		case R: return 'R';
		case S: return 'S';
		case V: return 'V';
		case T: return 'T';
		case W: return 'W';
		case Y: return 'Y';
		case H: return 'H';
		case K: return 'K';
		case D: return 'D';
		case B: return 'B';
		case N: return 'N';
		default: return 'O';
	}
}

base chartobase(char input)
{	
	switch (input)
	{
		case 'X': case 'x': return X;
		case 'A': case 'a': return A;
		case 'C': case 'c': return C;
		case 'M': case 'm': return M;
		case 'G': case 'g': return G;
		case 'R': case 'r': return R;
		case 'S': case 's': return S;
		case 'V': case 'v': return V;
		case 'U': case 'u': 
		case 'T': case 't': return T;
		case 'W': case 'w': return W;
		case 'Y': case 'y': return Y;
		case 'H': case 'h': return H;
		case 'K': case 'k': return K;
		case 'D': case 'd': return D;
		case 'B': case 'b': return B;
		case 'N': case 'n': return N;
		default: throw 2;
	}
}

base randombase(base mask /*= N*/)
{
	int randomnumber;
	
	if (mask == X) return X;
	
	while (1)								// keep trying until you get an allowed base 
	{
		randomnumber = rand() % 4;
		
		switch (randomnumber)
		{
			case 0: if (mask & A) return A; break;
			case 1: if (mask & C) return C; break;
			case 2: if (mask & G) return G; break;
			case 3: if (mask & T) return T; break;
		}
	}
}

base operator ~ (base input)		//BITWISE not
{
	base output = X;
	if (!(input & A)) output = base(output | A);
	if (!(input & C)) output = base(output | C);
	if (!(input & G)) output = base(output | G);
	if (!(input & T)) output = base(output | T);
	return output;
}

base operator ! (base input)		// COMPLEMENT
{
	base output = X;
	if (input & A) output = base(output | T);
	if (input & C) output = base(output | G);
	if (input & G) output = base(output | C);
	if (input & T) output = base(output | A);
	return output;
}

void operator ++ (base &input, int)
{
	input = base(input + 1);
}


/****************** EYE CANDY *********************/

void displaysplash()
{

	/*const unsigned char T = "▀"; //Top
	const unsigned char R = "▐"; //Right
	const unsigned char L = "▌"; //Left
	const unsigned char B = "▄"; //Bottom
	const unsigned char A = "█"; //All
	 
	const unsigned char I = "░"; //lIght
	const unsigned char M = "▒"; //Medium
	const unsigned char D = "▓"; //Dark*/
		
	cout << endl;
	cout << endl;
	cout << endl;
	cout << endl;
	cout << "/MMMMMMMMMUUUUUULLLLTTTTTTIIIIISSSSSUUUUUUBBBBJJJJJEEEECCCCTTTTTTIIIIIVVVVVEEEEE" << endl;
	cout << "/M▄▄   ▄▄ ▄▄ ▄▄ ▄▄  ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄ ▄▄ ▄▄ ▄▄▄ ▄▄▄▄ ▄▄▄ ▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄ ▄ ▄▄▄ E" << endl;
	cout << "/M▌▐▄▄▄▌▐ ▌▐ ▌▐ ▌▐  █▄ ▄█ █▄ ▄█▐ ▄▄▌▌▐ ▌▐ ▌▄ ▌█▄ ▄▌▌▄▄▌▌▄▄▌█▄ ▄█ █▄ ▄█▐▐ ▌▌▌▄▄▌E" << endl;
	cout << "/M▌  █  ▐ ▌▐ ▌▐ ▌▐   ▐ ▌   ▐ ▌ ▐▄▄ ▌▌▐ ▌▐ ▌ ▐  ▐ ▌ ▌▄▄▌▌▌   ▐ ▌   ▐ ▌  ▌█▐ ▌▄▄▌E" << endl;
	cout <<	"/M▌▐▄ ▄▌▐ ▐ ▀ ▌ ▌ ▀▀▌▐ ▌  █▀ ▀█▐▀▀ ▌▐ ▀ ▌ ▌▀ ▌█▀ ▌ ▌▀▀▌▌▀▀▌ ▐ ▌  █▀ ▀█ ▐ ▌ ▌▀▀▌E" << endl;
	cout <<	"/M▀▀ ▀ ▀▀  ▀▀▀  ▀▀▀▀ ▀▀▀  ▀▀▀▀▀ ▀▀▀  ▀▀▀  ▀▀▀ ▀▀▀  ▀▀▀ ▀▀▀  ▀▀▀  ▀▀▀▀▀  ▀  ▀▀▀ E" << endl;
	cout << "/MMMMMMMMUUUUUULLLLLTTTTTIIIIIISSSSSUUUUUBBBBBJJJJJEEEECCCCTTTTTIIIIIIVVVVVEEEEE" << endl;
	cout << "////////////////////////////////////////////////////////////////////////////////" << endl;
	cout << "Thank you for using Multisubjective Design " <<vers<< "      by John P. Sadowski" << endl;
	cout << endl;
	cout << endl;
	cout << endl;
	cout << endl;
	cout << "Multisubjective requires NUPACK 3.0 and either cURL 7.21.6 or Node.js 0.6.12" << endl;
	cout << endl;
	// 5 lines left
}

/*
void userinterface()
{
	int mode = 0, choice;
	
	do
	{
		if (mode == 0)
		{
			displaymainbox(0);
			cout << "▓                            ▓" << endl;
			cout << "▓ 1. Input mode              ▓" << endl;
			cout << "▓ 2. File/directory options  ▓" << endl;
 			cout << "▓ 3. Multisubjective options ▓" << endl;
			cout << "▓"; displaydesigner();cout<<"▓" << endl;
			cout << "▓                            ▓" << endl;
			cout << "▓ 5. Run Multisubjective     ▓" << endl;
			cout << "▓                            ▓" << endl;
			cout << "▓ 7. About                   ▓" << endl;
			cout << "▓ 0. Exit                    ▓" << endl;
			cout << "▓                            ▓" << endl;
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓" << endl;
			cout << endl;
		}
		else if (mode == 1)
		{
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓                            ▓        ▒ Input mode                             ▒" << endl;
			cout << "▓ 1. Input mode              ▓ =====> ▒                                        ▒" << endl;
			cout << "▓ 2. File/directory options  ▓        ▒ 11(d). Load a DD file                  ▒" << endl;
			cout << "▓"; displaydesigner();cout<<"▓        ▒ 12(m). Load multiple DD files          ▒" << endl;
			cout << "▓ 5. Designer options        ▓        ▒ 13(l). Load a NUPACK-MO file           ▒" << endl;
			cout << "▓                            ▓        ▒ 14(a). Autofill from last MO submission▒" << endl;
			cout << "▓ 6. Run Multisubjective     ▓        ▒ 15(j). Or input a NUPACK job number    ▒" << endl;
			cout << "▓                            ▓        ▒                                        ▒" << endl;
			cout << "▓ 7. About                   ▓        ▒                                        ▒" << endl;
			cout << "▓ 0. Exit                    ▓        ▒                                        ▒" << endl;
			cout << "▓                            ▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓" << endl;
			cout << endl;
		}
 
		else if (mode == 1)
		{
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓                            ▓        ▒ Filename options                       ▒" << endl;
			cout << "▓ 1. Input mode              ▓        ▒                                        ▒" << endl;
			cout << "▓ 2. NUPACK analysis options ▓ =====> ▒ 10. Input mode: Most recent            ▒" << endl;
			cout << "▓"; displaydesigner();cout<<"▓        ▒ 11. Filename prefix: \"output\"          ▒" << endl;
			cout << "▓ 5. Designer options        ▓        ▒                                        ▒" << endl;
			cout << "▓                            ▓        ▒ 12. Multisubjective working directory: ▒" << endl;
			cout << "▓ 6. Run Multisubjective     ▓        ▒      /Users/Sadowski/Desktop/ms        ▒" << endl;
			cout << "▓                            ▓        ▒ 13. NUPACK home directory:             ▒" << endl;
			cout << "▓ 7. About                   ▓        ▒      /Users/Sadowski/Desktop/New Research/Programming/downloads/nupack3.0 ▒" << endl;
			cout << "▓ 0. Exit                    ▓        ▒                                        ▒" << endl;
			cout << "▓                            ▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓" << endl;
			cout << endl;
		}
		else if (mode == 2)
		{
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓                            ▓        ▒ NUPACK analysis options ▒" << endl;
			cout << "▓ 1. Input mode              ▓        ▒                         ▒" << endl;
			cout << "▓ 2. NUPACK analysis options ▓ =====> ▒ 20. Cutoff: 67%         ▒" << endl;
			cout << "▓ 3. Prevented sequences     ▓        ▒                         ▒" << endl;
			cout << "▓"; displaydesigner();cout<<"▓        ▒ 21. Material: DNA       ▒" << endl;
			cout << "▓ 5. Designer options        ▓        ▒ 22. Temperature: 23°C   ▒" << endl;
			cout << "▓                            ▓        ▒ 23. Sodium: 0.05 M      ▒" << endl;
			cout << "▓ 6. Run Multisubjective     ▓        ▒ 24. Magnesium: 0.0125 M ▒" << endl;
			cout << "▓                            ▓        ▒ 25. Dangles: Full       ▒" << endl;
			cout << "▓ 7. About                   ▓        ▒                         ▒" << endl;
			cout << "▓ 0. Exit                    ▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓                            ▓" << endl;
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓" << endl;
			cout << endl;
		}
		else if (mode == 5 && designer == MO)
		{
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓                            ▓        ▒ NUPACK multiobjective options ▒" << endl;
			cout << "▓ 1. Input mode              ▓        ▒                               ▒" << endl;
			cout << "▓ 2. NUPACK analysis options ▓        ▒ 50. Number of trials: 10      ▒" << endl;
			cout << "▓ 3. Prevented sequences     ▓        ▒ 51. Email address:            ▒" << endl;
			cout << "▓"; displaydesigner();cout<<"▓ =====> ▒      sadowski@fas.harvard.edu ▒" << endl;
			cout << "▓ 5. Designer options        ▓        ▒                               ▒" << endl;
			cout << "▓                            ▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓ 6. Run Multisubjective     ▓" << endl;
			cout << "▓                            ▓" << endl;
			cout << "▓ 7. About                   ▓" << endl;
			cout << "▓ 0. Exit                    ▓" << endl;
			cout << "▓                            ▓" << endl;
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓" << endl;
			cout << endl;
		}
		else if (mode == 5 && designer == DD)
		{
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓                            ▓        ▒ DD options                            ▒" << endl;
			cout << "▓ 1. File options            ▓        ▒                                       ▒" << endl;
			cout << "▓ 2. NUPACK analysis options ▓        ▒ 52. Prevent 4 consecutive G or C's: Y ▒" << endl;
			cout << "▓ 3. Prevented sequences     ▓        ▒ 53. Prevent 6 consecutive W or S's: Y ▒" << endl;
			cout << "▓"; displaydesigner();cout<<"▓ =====> ▒ 54. Minimize G's: Y                   ▒" << endl;
			cout << "▓ 5. Designer options        ▓        ▒ 55. Target worst domain: Y            ▒" << endl;
			cout << "▓                            ▓        ▒ 56. Constrain bases: N                ▒" << endl;
			cout << "▓ 6. Run Multisubjective     ▓        ▒ 57. Tweak score parameters            ▒" << endl;
			cout << "▓                            ▓        ▒                                       ▒" << endl;
			cout << "▓ 7. About                   ▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓ 0. Exit                    ▓" << endl;
			cout << "▓                            ▓" << endl;
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓" << endl;
			cout << endl;
		}
		else if (mode == 57)
		{
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓                            ▓        ▒ DD score parameters                    ▒" << endl;
			cout << "▓ 1. File options            ▓        ▒                                        ▒" << endl;
			cout << "▓ 2. NUPACK analysis options ▓        ▒ 570. GC: 2                             ▒" << endl;
			cout << "▓ 3. Prevented sequences     ▓        ▒ 571. AT: 1                             ▒" << endl;
			cout << "▓"; displaydesigner();cout<<"▓ =====> ▒ 572. GT: 0                             ▒" << endl;
			cout << "▓ 5. Designer options        ▓        ▒ 573. Mismatch/bulge: -3                ▒" << endl;
			cout << "▓                            ▓        ▒ 574. Larger loop (per base): -0.5      ▒" << endl;
			cout << "▓ 6. Run Multisubjective     ▓        ▒ 575. Domain end pairing penalty: 3     ▒" << endl;
			cout << "▓                            ▓        ▒ 576. Max importance: 100               ▒" << endl;
			cout << "▓ 7. About                   ▓        ▒ 577. Expon. score base threshold: 4    ▒" << endl;
			cout << "▓ 0. Exit                    ▓        ▒ 578. Exponential score initial: 2      ▒" << endl;
			cout << "▓                            ▓        ▒ 579. Exponential score power: 2        ▒" << endl;
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒ 580. Intra-domain bonus: 5             ▒" << endl;
			cout << "                                      ▒ 581. Crosstalk bonus: -5               ▒" << endl;
			cout << "                                      ▒ 582. Crosstalk divide factor: 2        ▒" << endl;
			cout << "                                      ▒ 583. GGGG: 50                          ▒" << endl;
			cout << "                                      ▒ 584. 6W/6S: 20                         ▒" << endl;
			cout << "                                      ▒                                        ▒" << endl;
			cout << "                                      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
		}
		else if (mode == 4)
		{
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
			cout << "▓                            ▓        ▒ Prevented sequence options ▒" << endl;
			cout << "▓ 1. File options            ▓        ▒                            ▒" << endl;
			cout << "▓ 2. NUPACK analysis options ▓        ▒ 30. A: 4                   ▒" << endl;
			cout << "▓ 3. Prevented sequences     ▓ =====> ▒ 31  C: 4                   ▒" << endl;
			cout << "▓"; displaydesigner();cout<<"▓        ▒ 32. G: 4                   ▒" << endl;
			cout << "▓ 5. Designer options        ▓        ▒ 33. T: 4                   ▒" << endl;
			cout << "▓                            ▓        ▒ 34. S: 6                   ▒" << endl;
			cout << "▓ 6. Run Multisubjective     ▓        ▒ 35. W: 6                   ▒" << endl;
			cout << "▓                            ▓        ▒ 36. R: 6                   ▒" << endl;
			cout << "▓ 7. About                   ▓        ▒ 37. Y: 6                   ▒" << endl;
			cout << "▓ 0. Exit                    ▓        ▒ 38. K: 6                   ▒" << endl;
			cout << "▓                            ▓        ▒ 39. M: 6                   ▒" << endl;
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓        ▒ 310. B: 100                ▒" << endl;
			cout << "                                      ▒ 311. D: 100                ▒" << endl;
			cout << "                                      ▒ 312. H: 100                ▒" << endl;
			cout << "                                      ▒ 313. V: 100                ▒" << endl;
			cout << "                                      ▒                            ▒" << endl;
			cout << "                                      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
		}
		
		cout << "Choose wisely: ";
		cin >> choice;
		
		// change of mode options
		if (choice == 1 || choice == 2 || choice == 4 || choice == 5 || choice == 57)
			mode = choice;
		
		// float values
		else if ( choice == 20 || (choice >= 22 && choice <= 24) || (choice >= 570 && choice <= 584) )
		{
			cout << "Input new value: ";
			//cin >> fvalue;
		}
		else if (choice == 4)
		{
			cout << "Enter 0 for Manual, 1 for NUPACK multiobjective, 2 for DD, or 3 for Random: ";
			//cin >> designer;
		}
		
		else
			cout << "Really?";
	}
	while (choice != 0 && choice != 6);

}
 
void displaymainbox(int line, char choice = ' ')
{
	if      (line == 0)  cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓";
	else if (line == 1)  cout << "▓                            ▓";
	else if (line == 2){ cout << "▓ 1. Input mode:";
		if      (choice == 'd') cout <<          " single DD   ▓";
		else if (choice == 'm') cout <<          " multiple DD ▓";
		else if (choice == 'n') cout <<          " NUPACK file ▓";
		else if (choice == 'a') cout <<          " autofill    ▓";
		else if (choice == 'j') cout <<          " NUPACK job  ▓";
		else					cout <<			 " ???         ▓";
		}
	else if (line == 3)  cout << "▓ 2. File/directory options  ▓";
	else if (line == 4)  cout << "▓ 3. Multisubjective options ▓";
	else if (line == 5){ cout << "▓ 4. Design mode:";
		if      (choice == 'o') cout <<           " DD once    ▓";
		else if (choice == 'l') cout <<           " DD in loop ▓";
		else if (choice == 'w') cout <<           " NUPACK web ▓";
		else if (choice == 'r') cout <<           " rnd in loop▓";
		else if (choice == 'x') cout <<           " none       ▓";
		else					cout <<			  " ???        ▓";
		}
	else if (line == 6)  cout << "▓                            ▓";
	else if (line == 7)  cout << "▓ 5. Run Multisubjective     ▓";
	else if (line == 8)  cout << "▓                            ▓";
	else if (line == 9)  cout << "▓ 6. About                   ▓";
	else if (line == 10) cout << "▓ 0. Exit                    ▓";
	else if (line == 11) cout << "▓                            ▓";
	else if (line == 12) cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓";
	else				 cout << "                              ";
}
  
void displaysubbox (int line, int type)
{
	if (type == 0) cout << endl;
  
	else if (type == 1)
	{
		if (line == 0)      cout << "        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
  		else if (line == 1) cout << "        ▒ Input mode                             ▒" << endl;
  		else if (line == 2) cout << " =====> ▒                                        ▒" << endl;
		else if (line == 3) cout << "        ▒ 10(d). Load a DD file                  ▒" << endl;
		else if (line == 4) cout << "        ▒ 11(m). Load multiple DD files          ▒" << endl;
		else if (line == 5) cout << "        ▒ 12(n). Load a NUPACK-MO file           ▒" << endl;
  		else if (line == 6) cout << "        ▒ 13(a). Autofill from last MO submission▒" << endl;
  		else if (line == 7) cout << "        ▒ 14(j). Or input a NUPACK job number    ▒" << endl;
  		else if (line == 8) cout << "        ▒                                        ▒" << endl;
  		else if (line == 9) cout << "        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
  		else			    cout << endl;
	}
  
	else if (type == 2)
	{
		if (line == 0)      cout << "        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
  		else if (line == 1) cout << "        ▒ Filename and directory options         ▒" << endl;
  		else if (line == 2) cout << "        ▒                                        ▒" << endl;
		else if (line == 3) cout << " =====> ▒ 20. Multisubjective working directory: ▒" << endl;
		else if (line == 4) cout << "        ▒ 21. NUPACK home directory:             ▒" << endl;
		else if (line == 5) cout << "        ▒ 22. specification filename prefix:     ▒" << endl;
  		else if (line == 6) cout << "        ▒ 23. sequence filename prefix:          ▒" << endl;
  		else if (line == 7) cout << "        ▒ 24. output filename prefix:            ▒" << endl;
  		else if (line == 8) cout << "        ▒                                        ▒" << endl;
  		else if (line == 9) cout << "        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
  		else			    cout << endl;
	}  
 
	else if (type == 3)
	{
		if (line == 0)       cout << "        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
  		else if (line == 1)  cout << "        ▒ Multisubjective options                ▒" << endl;
  		else if (line == 2)  cout << "        ▒                                        ▒" << endl;
		else if (line == 3)  cout << "        ▒ 30. Threshold: .67                     ▒" << endl;
		else if (line == 4)  cout << " =====> ▒                                        ▒" << endl;
		else if (line == 5)  cout << "        ▒ Prevented sequences:                   ▒" << endl;
  		else if (line == 6)  cout << "        ▒ 31. A: 4           38.  B: 100         ▒" << endl;
  		else if (line == 7)  cout << "        ▒ 32. C: 4           39.  D: 100         ▒" << endl;
		else if (line == 8)  cout << "        ▒ 33. G: 4           310. H: 100         ▒" << endl;
		else if (line == 9)  cout << "        ▒ 34. T: 4           311. V: 100         ▒" << endl;
  		else if (line == 10) cout << "        ▒ 35. S: 4           312. W: 100         ▒" << endl;
  		else if (line == 11) cout << "        ▒ 36. R: 4           313. Y: 100         ▒" << endl;
		else if (line == 12) cout << "        ▒ 37. K: 4           314. M: 100         ▒" << endl;
  		else if (line == 13) cout << "        ▒                                        ▒" << endl;
  		else if (line == 14) cout << "        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
  		else			     cout << endl;
	}  
}

*/
/****************** EXCEPTION HANDLING FUNCTIONS *********************/

void handleerror(int errorlevel)
{
	cerr << "\a\n\nMultisubjective error " << errorlevel << " : ";

	switch (errorlevel)
	{
		case 1: case 40: 	
			cerr << "Error opening sequence input file";
			break;
		case 17: case 20: case 23: 	
			cerr << "Error opening specification input file";
			break;
		case 11: case 12: 
			cerr << "Error opening NUPACK file";
			break;
		case 18: case 19:
			cerr << "Error opening web response file";
			break;
		case 70:
			cerr << "Error opening configuration file";
			break;
		case 28:
			cerr << "Error creating directory";
			break;
		case 3: case 5:
			cerr << "Error opening NUPACK file for output"; 
			break;
		case 4: case 62: case 63: case 64: case 72: case 73: case 74: case 77:	
			cerr << "Error opening log file for output"; 
			break;
		case 6: case 7: 	
			cerr << "Error opening sequence file for output"; 
			break;
		case 15: 	
			cerr << "Error opening configuration file for output"; 
			break;
		case 2:
			cerr << "Bad character input";
			break;
		case 10:
			cerr << "Bad output mode";
			break;
		case 16: case 34: case 35: case 36: case 37: case 38: case 39:
			cerr << "Base position out of range";
			break;
		case 21:
			cerr << "Missing operator in specification file";
			break;
		case 24: case 29:
			cerr << "Incorrect operator in specification file";
			break;
		case 60:
			cerr << "Bad keyword in specification file";
			break;
		case 22: case 50: case 51: case 52:
			cerr << "Valid integer value expected in specification file";
			break;
		case 25: case 26: case 27: case 44:
			cerr << "Malformed DU notation in specification file";
			break;
		case 45:
			cerr << "Buffer overflow parsing length string";
			break;
		case 30:
			cerr << "Bad strand identifier";
			break;
		case 31:
			cerr << "Strand length inconsistency";
			break;
		case 8: case 9: case 68:
			cerr << "Too many bases in strand";
			break;
		case 14:
			cerr << "Too many blocks in strand";
			break;
		case 32: case 33:
			cerr << "Too many desired bases";
			break;
		case 42:
			cerr << "Too many immutable bases";
			break;
		case 47:
			cerr << "Too many strand tokens";
			break;
		case 48:
			cerr << "Too many block tokens";
			break;
		case 49: case 59:
			cerr << "Too many strands";
			break;
		case 41:
			cerr << "Specification file has incorrect block length";
			break;
		case 43:
			cerr << "Unexpected end of file";
			break;
		case 46:
			cerr << "Process fork failed";
			break;
		case 58: case 65:
			cerr << "Process call failed";
			break;
		case 66: case 67:
			cerr << "Child process failed";
			break;
		case 53: case 54:
			cerr << "Bad syntax in command line option";
			break;
		case 55: case 69:
			cerr << "Mode missing or invalid in command line option";
			break;
		case 56:
			cerr << "Job number or trial ID missing or invalid in command line option";
			break;
		case 57:
			cerr << "Job not available locally; token missing in command line option";
			break;
		case 61:
			cerr << "NUPACK home directory incorrectly set";
			break;
		case 71:
			cerr << "Invalid prevented sequence code in command line";
			break;
		case 13: case 76:
			cerr << "Home path not set";
			break;
		default:
			cerr << "General error.  Salute!";
	}
	
	cout << endl << endl;
	
}

void handlewarning(int errorlevel, int pos1 /*=0*/, int pos2 /*=0*/, int data /*=0*/)
{
	if (workbench) cerr << "\nMultisubjective warning " << errorlevel << " : ";
	
	switch (errorlevel)
	{
		case -1:
			if (workbench) cerr << "Immutable undesired base pair at positions " << pos1 << " and " << pos2;
			log  << "Warning: immutable undesired base pair at positions " << pos1 << " and " << pos2 << "\n";
			break;
		case -2:
			if (workbench) cerr << "Base extinguished at position " << pos1;				
			log  << "Warning: base extinguished at position " << pos1 << endl;
			break;
		case -3:
			if (workbench) cerr << "Immutable prevented sequence at position " << pos1;
			log  << "\nWarning: immutable prevented sequence at position " << pos1;
			break;
		case -4:
			if (workbench) cerr << "Empty bases in collision";
			log  << "\nWarning: empty bases in collision";
			break;
		case -5: case -6:
			if (workbench) cerr << "Base collision failure at domain " << pos1 << " position " << pos2 << " (" << basetochar(base(data&15)) << " and " << basetochar(base(data/16)) << ")";		
			log  << "\n     Warning: base collision failure at domain " << pos1 << " position " << pos2 << " (" << basetochar(base(data&15)) << " and " << basetochar(base(data/16)) << ")";
			break;
		default:
			if (workbench) cerr << "Unrecognized warning of type " << errorlevel;
			log << "\nUnrecognized warning of type " << errorlevel << endl;
	}
	
	if (workbench)
	{
		long fpos;
		switch (errorlevel)
		{
			case -1: case -2: case -3:
				fpos = json.tellp();		// back up
				json.seekp(fpos-3);
				json << ", ";
			break;
			case -4: case -5: case -6:
				json << "\t\t{";
			break;
		}
		json << "\"warning\":{\"type\":" << errorlevel << ", \"pos\":[" << pos1 << "," << pos2 << "]},\n";
	}
}
