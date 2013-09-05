// Multisubjective sequence design program - version 1.0 beta 1, 2011-09-16
// by John P. Sadowski

const int strandsize = 32;	// number of strands
const int tokensize = 32;	// for tokens, bases per block
const int arraysize = 128;	// for arrays of data, bases per strand
const int stringsize = 256;	// for filenames and system commands and buffers
const int desiredsize = 512; // for desiredbases

char workingdir[stringsize] = "/Users/Sadowski/Desktop/ms";
char nupackhome[stringsize] = "/Users/Sadowski/Desktop/New Research/Programming/downloads/nupack3.0";
char email[stringsize] = "\0";

#include <iostream>
#include <fstream>
#include <sys/stat.h>
#include <string.h>

enum base {X=0, A, C, M, G, R, S, V, T, W, Y, H,  K, D,  B, N};

base sequence[strandsize][arraysize];
int numstrands = 9;
int strandlength[strandsize];
int offset[strandsize] = {-53,-53,-53,24,24,24,-30,-30,-30};  // +=delete first N; -=keep first N
int strandblocks[strandsize][arraysize];

base block[3*strandsize][tokensize];
int blocklength[3*strandsize];

int immutablebases[arraysize];
int desiredbases[desiredsize][2];

char strandtoken[strandsize][tokensize];
char blocktoken[3*strandsize][tokensize];
int hairpintemp[strandsize][4];		// {id,       pos1, pos2, size}
int bridgetemp[strandsize][6];		// {id1, id2, pos1, pos2, size, bridgeid}

enum {Manual, MO, DD, Random} designer;
enum {Last_input, Last_output, Download_autofill, Download_specify} inputmode;

void savesettings();
void loadsettings();

//void forkexec(char* cmd);
void initialize();
void outputlog();
void loadMSdata(char filename[]);
void loadMOdata(char filename[]);
int tokenid(char symbol[], bool isbridge = false);
int bltokenid(char symbol[], bool nonew = false);
bool checktoken(char symbol[]);
int parseHU(ifstream &infile, char buffer[], int id = -1);
void storedesired (int id, int pos1, int pos2, int size);
void resolvebases();
int getstartpos(int id);
void getinput(ifstream &infile, char currsymbol[], char &curroperator, char remainder[]);
void parseinput(char buffer[], char &curroperator, char remainder[]);
void parseblocks(ifstream &infile, char buffer[], int id);

void loadsequences_MO(char filename[]);
void loadsequences_DD(char filename[]);
char* fullpath(char filename[]);
void displaysequences();
void outputINfile(int mode);

void loadanalysis();
bool isundesired_c(int first, int second);
bool isundesired_o(int first, int second);
bool isimmutable(int tpos);
void clearpair(int first, int second);
void assigntosequence(int pos, base input);
base getfromsequence(int tpos);
int opostotpos(int opos);

void prevented();

void constructblockid();
void assignseqtoblock();
base basecollide(base first, base second);

void outputblocks(int mode);
char* outputMOpost();
void outputblockspost(ofstream &outfile);

char basetochar(base input);
base chartobase(char input);
base randombase(base mask = N);
base operator ~ (base input);		//BITWISE not
base operator ! (base input);		// COMPLEMENT
void operator ++ (base &input, int);

void displaysplash();
void userinterface();
void displaydesigner();

void handleerror(int errorlevel);

/****************** BEHOLD THE MAIN FUNCTION *********************/

int main()
{
	try
	{
		displaysplash();
		loadsettings();
		//cout << workingdir << endl << nupackhome << endl << email << endl;
		
		char *cmd = (char*)malloc(stringsize);
		struct stat st;
		char job[16], token[16], trial[16];
		
		do
		{
			cout << "\nInput job number (or 'l' for last MO input, or 'a' to autofill from last MO submission, or 'd' to read a DD file, or 's' to set options): ";
			cin >> job;
			
			if (job[0] == 's')
			{
				cin.ignore(stringsize, '\n');
				cout << "Input Multisubjective working directory: ";
				cin.getline(workingdir, stringsize);
				cout << "Input NUPACK home directory: ";
				cin.getline(nupackhome, stringsize);
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
				
				cout << "Saving settings...\n";
				savesettings();
			}
		}
		while (job[0] == 's');
		
		if (job[0] != 'l' && job[0] != 'd')
		{
			if (job[0] == 'a')
			{
				ifstream infile(fullpath("response.ms"));	
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
				strcpy(cmd, fullpath("/mo_output/"));
				strcat(cmd, job);
				
				if (stat(cmd, &st) != 0)	// download only if directory doesn't exist
				{				
					cout << "Input token: ";
					cin >> token;
				}
				else
				{
					cout << "Job is available locally.\n";
					token[0] = '~';		// dummy value to indicate local version
				}
			}
			
			cout << "Input trial id: ";
			cin >> trial;
			
			if (token[0] != '~')
			{
				cout << "\nGetting NUPACK-multiobjective results from webserver...\n";
				strcpy(cmd, "curl -o ");
				strcat(cmd, fullpath("mo_output.zip"));
				strcat(cmd, " http://www.nupack.org/design/download_zip/");
				strcat(cmd, job);
				strcat(cmd, "?token=");
				strcat(cmd, token);
				system(cmd);
				
				cout << "\nUnzipping multiobjective results...\n";
				strcpy(cmd, "unzip -q ");
				strcat(cmd, fullpath("mo_output.zip"));
				strcat(cmd, " -d ");
				strcat(cmd, fullpath("mo_output"));
				system(cmd);
			}
			
			strcpy(cmd, "rm ");
			strcat(cmd, fullpath("sequences.ms"));
			system(cmd);
			
			strcpy(cmd, "cp -i ");
			strcat(cmd, fullpath("mo_output/"));
			strcat(cmd, job);
			strcat(cmd, "/");
			strcat(cmd, job);
			strcat(cmd, "_");
			strcat(cmd, trial);
			strcat(cmd, "_0.seq ");
			strcat(cmd, fullpath("sequences.ms"));
			system(cmd);
		}
				
		cout << "\nLoading structural data from file...\n";
		initialize();
		loadMSdata(fullpath("ms.txt"));
		loadMOdata(fullpath("mo.txt"));
		resolvebases();
		
		//for (int g = 1; g < 409; g++)
		//	cout << g << ' ' << opostotpos(g) << endl;
		
		cout << "\nExtracting sequences...\n";
		if (job[0] == 'd')
			loadsequences_DD(fullpath("sequences-dd.ms"));
		else
			loadsequences_MO(fullpath("sequences.ms"));
		
		displaysequences();
		outputlog();
		
		if (stat(fullpath("/nupack"), &st) != 0)	// create directory only if it doesn't exist
		{
			strcpy(cmd, "mkdir ");
			strcat(cmd, fullpath("nupack"));
			system(cmd);
		}
		
		cout << "\nRunning NUPACK analysis on closed hairpins...\n";
		outputINfile(0);
		strcpy(cmd, "NUPACKHOME=\"");	// set NUPACKHOME environment variable
		strcat(cmd, nupackhome);
		strcat(cmd, "\" \"");
		strcat(cmd, nupackhome);
		strcat(cmd, "/bin/complexes\" -material dna -T 23 -sodium 0.05 -magnesium 0.0125 -dangles all -pairs -ordered -cutoff .67 ");
		strcat(cmd, fullpath("nupack/ms0"));
		system(cmd);
		
		cout << "Running NUPACK analysis on open hairpins...\n";
		outputINfile(2);
		strcpy(cmd, "NUPACKHOME=\"");
		strcat(cmd, nupackhome);
		strcat(cmd, "\" \"");
		strcat(cmd, nupackhome);
		strcat(cmd, "/bin/complexes\" -material dna -T 23 -sodium 0.05 -magnesium 0.0125 -dangles all -pairs -ordered -cutoff .67 ");
		strcat(cmd, fullpath("nupack/ms2"));
		system(cmd);	
		
		cout <<"Tabulating undesired secondary structure...\n";
		loadanalysis();
		
		cout <<"\nChecking for prevented sequences...\n";
		prevented();
		
		cout << endl;
		displaysequences();
		
		cout <<"\nAssigning sequences to blocks...";
		assignseqtoblock();
		
		cout <<"\n\nWriting blocks to file...";
		outputblocks(0);
		outputblocks(1);
		
		cout << "\n\nSubmit job to NUPACK-multiobjective web server [y/n]? ";
		cin >> job;
		
		if (job[0] == 'y')
		{
			outputMOpost();
			strcpy(cmd, "curl -d @");
			strcat(cmd, fullpath("output-post.ms"));
			strcat(cmd, " -o ");
			strcat(cmd, fullpath("response.ms"));
			strcat(cmd, " http://www.nupack.org/design/new");
			//cout << cmd;
			system(cmd);
			
			ifstream infile(fullpath("response.ms"));		// open webpage
			if (infile.fail())
				throw 19;
			char buffer;
			strcpy(cmd, "open ");
			do
				infile >> buffer;
			while (buffer != '=');
			infile >> buffer;
			infile >> buffer;
			do
			{
				strncat(cmd, &buffer, 1);
				infile >> buffer;
			}
			while (buffer != '\"');
			cout << cmd;
			system(cmd);
			
			infile.close();
		}
		
	}
	catch (int errorlevel)
	{
		handleerror(errorlevel);
	}
	
	cout << "\nDone! ";
	//int i;
	//cin >> i;
	return 0;
}

/****************** FILE LOADING FUNCTIONS *********************/

void savesettings()
{
	char filename[stringsize];
	getcwd(filename, stringsize);
	strcat(filename, "/multisubjective-settings.ms");
	
	ofstream outfile;
	outfile.open(filename);
	
	if (outfile.fail())
		throw 15;
	
	outfile << workingdir << endl << nupackhome << endl << email;
	outfile.close();
}

void loadsettings()
{
	char filename[stringsize];
	getcwd(filename, stringsize);
	strcat(filename, "/multisubjective-settings.ms");
	
	ifstream infile;
	infile.open(filename);
	
	if (!infile.fail())
	{
		infile.getline(workingdir, stringsize);
		infile.getline(nupackhome, stringsize);
		infile >> email;
	}
	
	infile.close();
}

/*void forkexec(char* cmd)
 {
 int pid;
 
 pid = fork();
 
 if (pid < 0)
 throw 46;
 else if (pid == 0)
 execl("/", cmd);
 else
 wait(&pid);
 }*/

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
	
	for (i = 0; i < strandsize; i++)
	{
		offset[i] = 0;
		strandlength[i] = 0;
		hairpintemp[i][0] = 0;
		hairpintemp[i][1] = 0;
		hairpintemp[i][2] = 0;
		hairpintemp[i][3] = 0;
		bridgetemp[i][0] = 0;
		bridgetemp[i][1] = 0;
		bridgetemp[i][2] = 0;
		bridgetemp[i][3] = 0;
		bridgetemp[i][4] = 0;
		bridgetemp[i][5] = 0;
	}
	
	for (i = 0; i < arraysize; i++)
		immutablebases[i] = 0;
	
	for (i = 0; i < desiredsize; i++)
	{
		desiredbases[i][0] = 0;
		desiredbases[i][1] = 0;
	}
	
	designer = Manual;
}

void outputlog()
{
	int i, j;
	ofstream outfile;
	outfile.open(fullpath("log.ms"));
	
	outfile << "\n\nnumstrands:\n";	
	outfile << numstrands;
	
	outfile << "\n\nstrandtoken:\n";	
	for (i = 0; i < strandsize; i++)
		outfile << i << ':' << strandtoken[i] << ' ';
	
	outfile << "\n\nstrandlength:\n";	
	for (i = 0; i < strandsize; i++)
		outfile << strandlength[i] << ' ';
	
	outfile << "\n\noffset:\n";	
	for (i = 0; i < strandsize; i++)
		outfile << offset[i] << ' ';
	
	outfile << "\n\nsequence:\n";
	for (i = 0; i < strandsize; i++)
	{
		for (j = 0; j < arraysize; j++)
			outfile << basetochar(sequence[i][j]);
		outfile << endl;
	}
	
	outfile << "\n\nstrandblocks:\n";	
	for (i = 0; i < strandsize; i++)
	{
		for (j = 0; j < arraysize; j++)
			outfile << strandblocks[i][j] << ' ';
		outfile << endl;
	}
	
	outfile << "\n\nblocktoken:\n";	
	for (i = 0; i < 3*strandsize; i++)
		outfile << blocktoken[i] << ' ';
	
	outfile << "\n\nblocklength:\n";
	for (i = 0; i < 3*strandsize; i++)
		outfile << blocklength[i] << ' ';
	
	outfile << "\n\nblock:\n";	
	for (i = 0; i < 3*strandsize; i++)
	{
		for (j = 0; j < tokensize; j++)
			outfile << basetochar(block[i][j]);
		outfile << endl;
	}
	
	outfile << "\n\nimmutablebases:\n";	
	for (i = 0; i < arraysize; i++)
		outfile << immutablebases[i] << ' ';
	
	outfile << "\n\ndesiredbases:\n";	
	for (i = 0; i < desiredsize; i++)
	{
		outfile << desiredbases[i][0] << ',';
		outfile << desiredbases[i][1] << ' ';
	}
	
	outfile << "\n\nhairpintemp:\n";
	for (i = 0; i < strandsize; i++)
	{
		outfile << hairpintemp[i][0] << ' ';
		outfile << hairpintemp[i][1] << ' ';
		outfile << hairpintemp[i][2] << ' ';
		outfile << hairpintemp[i][3] << endl;
	}
	
	outfile << "\n\nbridgetemp:\n";
	for (i = 0; i < strandsize; i++)
	{
		outfile << bridgetemp[i][0] << ' ';
		outfile << bridgetemp[i][1] << ' ';
		outfile << bridgetemp[i][2] << ' ';
		outfile << bridgetemp[i][3] << ' ';
		outfile << bridgetemp[i][4] << ' ';
		outfile << bridgetemp[i][5] << endl;
	}
	
	outfile.close();
}

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
			
			infile >> buffer;
			//cout << buffer << endl;
		}
		else if (!strcmp(buffer, "bridge"))
		{
			infile >> currsymbol;
			//cout << currsymbol << endl;
			bridgetemp[bridgecounter][0] = tokenid(currsymbol);
			getinput(infile, currsymbol, curroperator, buffer);
			bridgetemp[bridgecounter][1] = tokenid(currsymbol);
			
			if (curroperator == ':')
			{
				bridgetemp[bridgecounter][5] = tokenid(buffer, 1);
				//offset[bridgetemp[bridgecounter][5]] = bridgecounter;	// translates strand id to bridgetemp index
				infile >> buffer;
				//cout << buffer << endl;
			}
			else if (curroperator == '=')
				for (int i = 2; i <= 4; i++)
				{
					if (!atoi(buffer))
						throw 28;
					bridgetemp[bridgecounter][i] = atoi(buffer);
					infile >> buffer;
					//cout << buffer << endl;
				}
			else
				throw 29;
			
			bridgecounter++;
		}
		else if (!strcmp(buffer, "length"))  
		{
			int pos1 = 0, pos2 = 0, len = 0, num;		// pos1 for buffer, pos2 for block
			getinput(infile, currsymbol, curroperator, buffer);
			currid = bltokenid(currsymbol);
			
			while (buffer[pos1] != '\0')
			{
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
				
				if (buffer[pos1] == '\0')		// no base after number
					throw 45;
				
				for (int i = 0; i < num; i++)
				{
					block[currid][pos2] = chartobase(buffer[pos1]);
					pos2++;
				}
				
				len += num;
				buffer[pos1] = ' ';
				pos1++;
			}
			
			blocklength[currid] = len;
			infile >> buffer;
			//cout << buffer << endl;
		}
		else
		{
			infile >> buffer;
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
			currid = tokenid(currsymbol);
			
			if (offset[currid] != 0 || currid >= strandsize/2)		// it is a hairpin || it is a bridge
				strandlength[currid] = parseHU(infile, buffer, currid);
			else
			{
				infile.getline(buffer, stringsize);
				infile >> buffer;
				//cout << buffer << endl;
			}
 		}
		else
		{
			parseinput(buffer, curroperator, currsymbol);
			
			if (curroperator == '\0')
				infile >> curroperator;
			//getinput(infile, currsymbol, curroperator, buffer);
			
			if (checktoken(buffer) && curroperator == ':')	// it might be a strand-block assignment
			{
				currid = tokenid(buffer);
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

int tokenid(char symbol[], bool isbridge /*= false*/)
{
	int id = 0;
	
	while (id < strandsize)			// check all records
	{
		if ( !strcmp(symbol, strandtoken[id]) )
			return id;
		id++;
	}
	
 	// if not found, start a new record
	if (isbridge)
		id = strandsize/2;
	else
		id = 0;
	
	while (strandtoken[id][0] != '\0')		
		id++;
	
	strcpy(strandtoken[id], symbol);
	return id;
}

int bltokenid(char symbol[], bool nonew /*= false*/) // make sure [0] not used
{
	int id = 1;
	
	while (id < strandsize)			// check all records
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
		id++;
	
	strcpy(blocktoken[id], symbol);
	return id;
}

bool checktoken(char symbol[])
{
	int id = 0;
	
	while (id < strandsize)			// check all records
	{
		if ( !strcmp(symbol, strandtoken[id]) )
			return true;
		id++;
	}
	
	return false;
}

int parseHU(ifstream &infile, char buffer[], int id /*= -1*/)		// goal: get strand lengths, get desired bases, fill offsets if desired, get open desired bases
{
	int lastH = 0, lastU = 0, begindes = 0, sizedes = 0, len=0;		// lastH and lastU are only needed if autofilling negative polarity
	char curroperator = '\0', remainder[stringsize];
	remainder[0] = '~';			// dummy value
	
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
		else if (buffer[0] == 'H')
		{
			buffer[0] = ' ';
			if (!atoi(buffer))
				throw 26;
			
			if (id != -1 && offset[id] == 1)
				offset[id] = len + atoi(buffer);  // this is first H; set strand offset if pos polarity
			if (id != -1 && offset[id] == -1)
				lastH = atoi(buffer);
			
			begindes = len;
			sizedes = atoi(buffer);
			
			len += atoi(buffer);
			if ( curroperator == '(' )							
				len += parseHU(infile, remainder, -1);		// recurse to get what's in parens
			else
			{
				infile >> remainder;						// if thing following H_ is not in parens, we need to process the U_ token that follows it
				
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
			len += atoi(buffer);
			begindes = 0;
			remainder[0] = '\0'; //because what's in remainder has now already been parsed
		}
		else if (curroperator == '+')
		{}								// discard '+' operators
		else
		{
			if (id != -1 && offset[id] == -1)
				offset[id] = -(len - lastU - lastH);
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
	if (id < strandsize/2)		// hairpin
	{
		hairpintemp[hairpincounter][0] = id;
		hairpintemp[hairpincounter][1] = pos1;
 		hairpintemp[hairpincounter][2] = pos2;
 		hairpintemp[hairpincounter][3] = size;
	}
	else		// bridge, used for autofilling bridge data
	{
		int i;			// i is bridgetemp index
		for (i = 0; i < strandsize; i++)	// find correct record
			if (bridgetemp[i][5] == id)
				break;
		
		if (i == strandsize)
			throw 30;
		
		bridgetemp[i][2] = pos1 + offset[bridgetemp[i][0]];
		bridgetemp[i][3] = pos2 - strandlength[bridgetemp[i][0]] + offset[bridgetemp[i][0]];
		bridgetemp[i][4] = size;
	}	
	
	hairpincounter++;
}

void resolvebases()		// desired and immutable
{
	int i, j, k, startpos1, startpos2, counter = 0;
	
	for (i = 0; hairpintemp[i][3] != 0; i++)
	{
		startpos1 = getstartpos(hairpintemp[i][0]);
		for (j = 0; j < hairpintemp[i][3]; j++)
		{
			desiredbases[counter][0] = startpos1 + hairpintemp[i][1] + j;
			desiredbases[counter][1] = startpos1 + hairpintemp[i][2] + hairpintemp[i][3] - 1 - j;
			
			counter++;
			if (counter == desiredsize)
				throw 32;
		}
	}
	
	for (i = 0; bridgetemp[i][4] != 0; i++)
	{
		startpos1 = getstartpos(bridgetemp[i][0]);
 		startpos2 = getstartpos(bridgetemp[i][1]);
		for (j = 0; j < bridgetemp[i][4]; j++)
		{
			desiredbases[counter][0] = startpos1 + bridgetemp[i][2] + j;
			desiredbases[counter][1] = startpos2 + bridgetemp[i][3] + bridgetemp[i][4] -1 - j;
			
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
				if (counter >= arraysize)
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
		if (remainder[0] == '\0')
			infile >> remainder;
	}
	//cout << "Getinput: " << currsymbol << ' ' << curroperator << ' ' << remainder << endl;
}

void parseinput(char buffer[], char &curroperator, char remainder[])	// buffer gets whatever is before operator, remainder gets what's after, and operator is returned
{
	int i, j;
	for (i = 0; i < stringsize; i++)
		if ( buffer[i] == '=' || buffer[i] == ':' || buffer[i] == '(' || buffer[i] == ')' || buffer[i] == '<' || buffer[i] == '+' || buffer[i] == '\0')
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
		infile >> buffer;
		
		strandblocks[id][num] = 1; //dummy value just to get sign
		for (i = 0; i < stringsize; i++)		// check if complement
			if (buffer[i] == '*')
			{
				strandblocks[id][num] = -1;
				buffer[i] = '\0';
				break;
			}
		
		strandblocks[id][num] *= bltokenid(buffer, 1);		// 1 for nonew
		if (strandblocks[id][num] == 0)
			break;
		
		//cout << strandblocks[id][num] << ' ';
		
		num++;
		if (num >= arraysize-1) throw 14;
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
		throw 2;
	
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
		
		strand = tokenid(token);
		
		currbase = infile.get();  // get rid of space character
		
		if (offset[strand] != 0)		// get sequence only if it is a hairpin (or coop)
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
		cout << blocknum << ' ';
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

void displaysequences()
{
	int strand, pos;
	
	for (strand = 0; strand < numstrands; strand++)							// BEGIN strandwise while-loop
	{
		pos = 0;
		while (sequence[strand][pos] != X)									// BEGIN basewise while-loop
		{			
			cout << basetochar(sequence[strand][pos]);
			pos++;
		}
		cout << '\n';
	}										// END strandwise while-loop
}

char* fullpath(char filename[])
{
	//char result[256];
	char* result=(char *)malloc(stringsize);
	strcpy(result, workingdir);
	strcat(result, "/");
	strcat(result, filename);
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
		throw 5;
	
	outfile << numstrands << '\n';
	
	for (strand = 0; strand < numstrands; strand++)							// BEGIN strandwise while-loop
	{
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
	
	//if (mode == 0 | mode == 1)
	outfile << '1';					// only want complexes of N strands
	//else
	//	outfile << '2';
	
	outfile.close();
		
	if (mode == 2)
	{
		outfile.open(fullpath("nupack/ms2.list"));
		
		for (pos = 0; pos < strandsize; pos++)
			if (bridgetemp[pos][0] != 0)
				outfile << bridgetemp[pos][0] + 1 << ' ' << bridgetemp[pos][1] + 1 << endl;		// +1 because MS is 0-relative while NUPACK is 1-relative
		
		outfile.close();
	}
}

void loadanalysis()
{
	ifstream infile;
	char buffer[stringsize];
	int first, second, lastfirst, lastsecond, counter=0, tposmax=0, oposmax=0;
	
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
	
	while (first != tposmax+1)
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
				cout << first << ' ' << second << endl;
			
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
	
	cout << '-' << endl;
	infile.close();
	infile.open(fullpath("nupack/ms2.ocx-epairs"));
	if (infile.fail())
		throw 12;
	
	lastfirst = tposmax+1;
	lastsecond = tposmax+1;
	counter = 0;
	// Now do second file
	while (first != oposmax+1)
	{
		do
			infile >> buffer;
		while (!infile.eof() && atoi(buffer) != oposmax);
		
		infile >> first;
		infile >> second;
		
		if (infile.eof() || first == oposmax+1)			// end of data
			break;
		
		//the first thing that's not the comment is the line containing oposmax
		while (second != oposmax+1) // end of complex
		{
			if (isundesired_o(first, second))
				cout << opostotpos(first) << ' ' << opostotpos(second) << endl;
			//cout << first << '/' << opostotpos(first) << ' ' << second << '/' << opostotpos(second) << endl;
			
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
	
	infile.close();
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
	
	for (i = 0; i < arraysize; i++)
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
		cout << "Warning: immutable undesired base pair\n";
}

void assigntosequence(int tpos, base input)
{
	if (tpos <= 0 ) throw 34;
	cout << "\tAssigning base " << tpos << " to " << basetochar(input) << endl;
	
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
	const int threshold[15] = {0,4,4,6,4,6,6,100,4,6,6,100,6,100,100};
	//enum base {X,A,C,M,G,R,S,V  ,T,W,Y,H,  K,D,  B,  N};
	
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
				
				if (counter[basetype] >= threshold[basetype] && !isimmutable(tpos))
				{
					cout << tpos << basetochar(~basetype) << ' ';
					newbase = base(newbase & ~basetype);
				}
			}
			
			//cout << endl << tpos << ' ' << pos << ": " << basetochar(sequence[strand][pos]) << ' ';
			//for (basetype = X; basetype < N; basetype = base(basetype + 1))
			//	cout << basetochar(basetype) << counter[basetype] /*<< '-' << basetochar(base(newbase & basetype))*/ << ' ';
			//while (!_getche()) {}
			
			if (newbase == X) cout << "Warning: base extinguished at position " << tpos << endl;
			
			else if (newbase != N)		//assign the base
			{
				for (baseoffset = 0; baseoffset < threshold[~newbase]; baseoffset++)  // calculate baseoffset
					if ( baseoffset >= tpos || getfromsequence(tpos - baseoffset) == N)	// first, look for an N to replace
						break;
				
				if (baseoffset == threshold[~newbase] || baseoffset >= tpos)			// if no N's, find first mutable base
					for (baseoffset = 0; baseoffset < threshold[~newbase]; baseoffset++)
						if ( baseoffset >= tpos || !isimmutable(tpos - baseoffset) )
							break;
				
				if (baseoffset != threshold[~newbase] || baseoffset >= tpos)
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
					cout << "\nWarning: immutable prevented sequence at position " << tpos;
			}
			
			pos++;
			tpos++;
		}
		while (sequence[strand][pos] != X);
	}
}

/****************** BLOCK CONVERSION FUNCTIONS *********************/

void constructblockid()
{}

void assignseqtoblock()
{
	int tpos = 1;
	int strandnum, blocknum, pos, numblocks = 0;
	
	while (blocklength[numblocks+1] != 0)
		numblocks++;
	
	for (blocknum = 0; blocknum <= numblocks; blocknum++)
		for (pos = 0; pos < blocklength[blocknum]; pos++)
			block[blocknum][pos] = X;
	
	for (strandnum = 0; strandnum < numstrands; strandnum++)
		for (blocknum = 0; strandblocks[strandnum][blocknum] != 0; blocknum++)
		{
			cout << "\nBefore: block " << blocktoken[ abs(strandblocks[strandnum][blocknum]) ] << ": ";
			for (pos = 0; pos < blocklength[ abs(strandblocks[strandnum][blocknum]) ]; pos++)
				cout << basetochar(block[ abs(strandblocks[strandnum][blocknum]) ][pos]);
			
			if (strandblocks[strandnum][blocknum] >= 0)						// if positive blockid
				for (pos = 0; pos < blocklength[strandblocks[strandnum][blocknum]]; pos++)
					block[strandblocks[strandnum][blocknum]][pos] = basecollide(block[strandblocks[strandnum][blocknum]][pos], getfromsequence(tpos+pos));
			
			else											// if negative blockid (complement)
				for (pos = 0; pos < blocklength[-strandblocks[strandnum][blocknum]]; pos++)
					block[ -strandblocks[strandnum][blocknum] ][ blocklength[-strandblocks[strandnum][blocknum]]-1-pos ]
					= basecollide(block[ -strandblocks[strandnum][blocknum] ][ blocklength[-strandblocks[strandnum][blocknum]]-1-pos ], !getfromsequence(tpos+pos));
			
			cout << "\nAfter:  block " << blocktoken[ abs(strandblocks[strandnum][blocknum]) ] << ": ";
			for (pos = 0; pos < blocklength[ abs(strandblocks[strandnum][blocknum]) ]; pos++)
				cout << basetochar(block[ abs(strandblocks[strandnum][blocknum]) ][pos]);
			
			tpos += blocklength[ abs(strandblocks[strandnum][blocknum]) ];
		}
}

base basecollide(base first, base second)    //precedence: mixed > N > ACTG
{
	if (first == X && second == X)
		cout << "Warning: empty bases in collision";
	
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
				cout << "\n     Warning: base collision failure, " << basetochar(first) << " and " << basetochar(second);
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
				cout << "\n     Warning: base collision failure, " << basetochar(first) << " and " << basetochar(second);
				return first;
			}
			else
				return base(first & second);
		}
	}
}

void outputblocks(int mode)
{
	int blocknum, pos, counter = 0, numblocks = 0;
	
	while (blocklength[numblocks+1] != 0)
		numblocks++;
	
	ofstream outfile;
	
	if (mode == 0)
		outfile.open(fullpath("output.ms"));
	else
	{
		outfile.open(fullpath("output-dd.ms"));
		outfile << numblocks << endl;
	}
	
	for (blocknum = 1; blocknum <= numblocks; blocknum++)
	{
		if (mode == 0)
		{
			outfile << "sequence " << blocktoken[blocknum] << " = ";
			
			for (pos = 0; block[blocknum][pos] != X; pos++)
			{
				outfile << basetochar(block[blocknum][pos]);
				if (block[blocknum][pos] != A && block[blocknum][pos] != C && block[blocknum][pos] != G && block[blocknum][pos] != T)
					counter++;
			}
		}
		else
		{
			base writebase;
			for (pos = 0; block[blocknum][pos] != X; pos++)
			{
				writebase = block[blocknum][pos];
				if (writebase != A && writebase != C && writebase != G && writebase != T)
					counter = 32;
				else
					counter = 0; // if it is exact, makeit lowercase
				outfile << char(counter + basetochar(randombase(writebase)));
			}
			outfile << " 1 15";
		}
		outfile << '\n';
	}
	
	if (mode == 0)
		cout << '\n' << counter << " bases to design";
	
	outfile.close();
}

/****************** MO SUBMISSION FUNCTIONS *********************/

char* outputMOpost()		// URL encoding
{
	char buffer;
	
	ofstream outfile;
	outfile.open(fullpath("output-post.ms"));
	
	ifstream infile;
	infile.open(fullpath("mo.txt"));
	if (infile.fail())
		throw 17;
	
	infile.unsetf(ios::skipws); // detect whitespace
	
	outfile << "design_job%5Bnucleic_acid_type%5D=DNA";
	outfile << "&design_job%5Btemperature%5D=23.0";
	outfile << "&design_job%5Bnumber_of_trials%5D=10";
	outfile << "&design_job%5Btarget_structure%5D=";
	
	do
	{
		infile >> buffer;
		
		if (buffer == ' ')
			outfile << '+';
		else if (buffer == '+')
			outfile << "%2B";
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
		else if (buffer == '`')
			outputblockspost(outfile);
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
		outfile << "sequence+" << blocktoken[blocknum] << "+%3D+";
		
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
		default: throw 4;
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

//base operator & (base first, base second)
//{
//	return base(first & second);
//}

void operator ++ (base &input, int)
{
	input = base(input + 1);
}


/****************** EYE CANDY *********************/

void displaysplash()	//Xcode/GCC version
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
	cout << endl;
	cout << "/MMMMMMMMMUUUUUULLLLTTTTTTIIIIISSSSSUUUUUUBBBBJJJJJEEEECCCCTTTTTTIIIIIVVVVVEEEEE" << endl;
	cout << "/M▄▄   ▄▄ ▄▄ ▄▄ ▄▄  ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄ ▄▄ ▄▄ ▄▄▄ ▄▄▄▄ ▄▄▄ ▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄ ▄ ▄▄▄ E" << endl;
	cout << "/M▌▐▄▄▄▌▐ ▌▐ ▌▐ ▌▐  █▄ ▄█ █▄ ▄█▐ ▄▄▌▌▐ ▌▐ ▌▄ ▌█▄ ▄▌▌▄▄▌▌▄▄▌█▄ ▄█ █▄ ▄█▐▐ ▌▌▌▄▄▌E" << endl;
	cout << "/M▌  █  ▐ ▌▐ ▌▐ ▌▐   ▐ ▌   ▐ ▌ ▐▄▄ ▌▌▐ ▌▐ ▌ ▐  ▐ ▌ ▌▄▄▌▌▌   ▐ ▌   ▐ ▌  ▌█▐ ▌▄▄▌E" << endl;
	cout <<	"/M▌▐▄ ▄▌▐ ▐ ▀ ▌ ▌ ▀▀▌▐ ▌  █▀ ▀█▐▀▀ ▌▐ ▀ ▌ ▌▀ ▌█▀ ▌ ▌▀▀▌▌▀▀▌ ▐ ▌  █▀ ▀█ ▐ ▌ ▌▀▀▌E" << endl;
	cout <<	"/M▀▀ ▀ ▀▀  ▀▀▀  ▀▀▀▀ ▀▀▀  ▀▀▀▀▀ ▀▀▀  ▀▀▀  ▀▀▀ ▀▀▀  ▀▀▀ ▀▀▀  ▀▀▀  ▀▀▀▀▀  ▀  ▀▀▀ E" << endl;
	cout << "/MMMMMMMMUUUUUULLLLLTTTTTIIIIIISSSSSUUUUUBBBBBJJJJJEEEECCCCTTTTTIIIIIIVVVVVEEEEE" << endl;
	cout << "////////////////////////////////////////////////////////////////////////////////" << endl;
	cout << "Thank you for using Multisubjective Design 1.0 beta 1        by John P. Sadowski" << endl;
	cout << endl;
	cout << endl;
	cout << endl;
	cout << endl;
	cout << endl;
	cout << endl;
	cout << "Multisubjective requires NUPACK 3.0 and cURL 7.21.6" << endl;
}

void userinterface()
{
	int mode = 0, choice;
	
	do
	{
		if (mode == 0)
		{
			cout << "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓" << endl;
			cout << "▓                            ▓" << endl;
			cout << "▓ 1. Filename options        ▓" << endl;
			cout << "▓ 2. NUPACK analysis options ▓" << endl;
			cout << "▓"; displaydesigner();cout<<"▓" << endl;
			cout << "▓ 5. Designer options        ▓" << endl;
			cout << "▓                            ▓" << endl;
			cout << "▓ 6. Run Multisubjective     ▓" << endl;
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
			cout << "▓                            ▓        ▒ Filename options                       ▒" << endl;
			cout << "▓ 1. File options            ▓ =====> ▒                                        ▒" << endl;
			cout << "▓ 2. NUPACK analysis options ▓        ▒ 10. Input mode: Most recent            ▒" << endl;
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
			cout << "▓ 1. File options            ▓        ▒                         ▒" << endl;
			cout << "▓ 2. NUPACK analysis options ▓ =====> ▒ 20. Cutoff: 67%         ▒" << endl;
			cout << "▓ 3. Prevented sequences     ▓        ▒                         ▒" << endl;
			cout << "▓"; displaydesigner();cout<<"▓        ▒ 21. Material: DNA       ▒" << endl;
			cout << "▓ 5. Designer options        ▓        ▒ 22. Temperature: 23°C   ▒" << endl;
			cout << "▓                            ▓        ▒ 23. Sodium: 0.05 M      ▒" << endl;
			cout << "▓ 6. Run Multisubjective     ▓        ▒ 24. Magnesium: 0.0125 M ▒" << endl;
			cout << "▓                            ▓        ▒ 25. Dangles: All        ▒" << endl;
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
			cout << "▓ 1. File options            ▓        ▒                               ▒" << endl;
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
			cout << "                                      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒" << endl;
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

void displaydesigner()
{
	if ( designer == Manual )
		cout << " 4. Choose designer: Manual ";
	else if ( designer == MO )
		cout << " 4. Choose designer: NUPACK ";
	else if ( designer == DD )
		cout << " 4. Choose designer: DD     ";
	else if ( designer == Random )
		cout << " 4. Choose designer: Random ";
}

/****************** EXCEPTION HANDLING FUNCTIONS *********************/

void handleerror(int errorlevel)
{
	cout << "Multisubjective error " << errorlevel << " : ";
	
	switch (errorlevel)
	{
			
		case 2: case 11: case 12: case 13: case 17: case 18: case 19: case 20: case 23: case 40:
			cout << "Error in opening file";
			break;
		case 5: case 15:
			cout << "Error opening file for output"; 
			break;
		case 4:
			cout << "Bad character input";
			break;
		case 10:
			cout << "Bad output mode";
			break;
		case 14:
			cout << "Too many blocks";
			break;
		case 16: case 34: case 35: case 36: case 37: case 38: case 39:
			cout << "Base position out of range";
			break;
		case 21:
			cout << "Missing operator in specification file";
			break;
		case 24: case 29:
			cout << "Incorrect operator in specification file";
			break;
		case 22: case 28:
			cout << "Valid integer value expected in specification file";
			break;
		case 25: case 26: case 27: case 44:
			cout << "Malformed HU notation in specification file";
			break;
		case 45:
			cout << "Malformed length notation in specification file";
			break;
		case 30:
			cout << "Bad identifier in temporary bridge record";
			break;
		case 31:
			cout << "Strand length inconsistency";
			break;
		case 32: case 33:
			cout << "Too many desired bases";
			break;
		case 42:
			cout << "Too many immutable bases";
			break;
		case 41:
			cout << "Input file has incorrect block length";
			break;
		case 43:
			cout << "Unexpected end of file";
			break;
		case 46:
			cout << "Process fork failed";
			break;
		default:
			cout << "General error.  Salute!";
	}
}
