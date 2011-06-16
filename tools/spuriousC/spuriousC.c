/*
  Converted to C from Matlab by hand, EW, 4/00 

  command-line args enhanced, EW, 8/02    

  Merged with spuriousCfold.c, EW, 8/02.  Now *requires* the ViennaRNA package! 

gcc -Wall -O3 spuriousC.c -o spuriousC -I/usr/include/ViennaRNA -lRNA -lm

gcc -Wall -O3 spuriousC.c -o spuriousC -I/research/include/ViennaRNA-1.4 -L/research/lib -lRNA -lm

gcc -Wall -O3 spuriousC.c -o spuriousC -I/home/milo/ViennaPackage/ViennaRNA-1.4/H -L/home/milo/ViennaPackage/ViennaRNA-1.4/lib -lRNA -lm

  NOTE that location of ViennaRNA param files is HARD-CODED!  see VIENNA_DIR

*/

// YOU MUST MODIFY THIS FOR EVERY COMPILE!  MUST HAVE TRAILING "/" !
#define VIENNA_DIR "/usr/local/share/ViennaRNA/"

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>


#include <math.h>
#include <ctype.h>
#include "fold.h"
#include "part_func.h"
#include "fold_vars.h"
#include "PS_dot.h"
#include "utils.h"
extern void  read_parameter_file(const char fname[]);


#define max(a,b) ((a)>(b)?(a):(b))

#define MIN(a,b) ((a)<(b)?(a):(b))
#define MAX(a,b) ((a)>(b)?(a):(b))

// globals:

int debug=0;  int maxN = 10000; 
double W_verboten=0.0, W_spurious=1.0, W_nofold=0.0, W_struct=0.0, W_prob=0.0, W_bonds=0.0; 
double spurious_beta=5.0, spurious_intraS=25.0/3125, spurious_interS=5.0/3125, spurious_interC=1.0/3125, spurious_mm=25.0;
double nofold_mdG=1.0, nofold_mdGG=1.0, nofold_mddG=1.0;
int N=0,NrS=0,NSt=0,Nwc=0,Neq=0; 
int *testwc, *testeq; char *testS, *testSt; 
char *rS_filename=NULL, *St_filename=NULL, *wc_filename=NULL, *eq_filename=NULL, *S_filename=NULL;

/* 
% ENERGIES OF FORMATION
%
% nearest-neighbor parameters from nnHS.m in DNAdesign
%
% numbers & eqns from SantaLucia, PNAS 1998, 95, 1460--1465
% quoting "unified" params of 
%            Allawi & SantaLucia, Biochemistry 1997, 36, 10581--10594
%
% nnDH(i,j) gives enthalpy for nearest-neighbor interaction i,j.
% e.g.    1,2 =>  5' AC 3'  paired with 3' TG 5'.
%
% nnDH = [ AA, AC, AG, AT;
%          CA, CC, CG, CT;
%          GA, GC, GG, GT;
%          TA, TC, TG, TT ]
*/

//   using A=1, C=2, G=3, T=4,    other=0;

// enthalpy in Kcal/mole       
double nnDH[5][5] = { {   0,    0,    0,    0,    0 },
                      {   0, -7.9, -8.4, -7.8, -7.2 },
                      {   0, -8.5, -8.9,-10.6, -7.8 },
                      {   0, -8.2, -9.8, -8.0, -8.4 },
                      {   0, -7.2, -8.2, -8.5, -7.9 } };

// entropy in cal/mole
double nnDS[5][5] = { {   0,     0,     0,     0,     0 },
                      {   0, -22.2, -22.4, -21.0, -20.4 },
                      {   0, -22.7, -19.9, -27.2, -21.0 },
                      {   0, -22.2, -24.4, -19.9, -22.4 },
                      {   0, -21.3, -22.2, -22.7, -22.2 } };

// free energy
#define nnDG(i,j) (nnDH[i][j] - (temperature+273.15)*nnDS[i][j]/1000.0)


// writes Sorig into S, as a sequence of 1,2,3,4 for A,C,G,T, or 0 if none-of-the-above
void S1234(char *S, char *Sorig)
{
  int i;  int N; N = strlen(Sorig);
 //% map A,C,G,T to 1,2,3,4
 for (i=0; i<N; i++) { 
   switch (Sorig[i]) {
    case 'A': case 'a': case 1: S[i]=1; break;
    case 'C': case 'c': case 2: S[i]=2; break;
    case 'G': case 'g': case 3: S[i]=3; break;
    case 'T': case 't': case 4: S[i]=4; break;
    default: S[i]=0; 
   }
 }
}


// --------------------------------------------------------------------------
/*
%function C = spurious(S,kmin,kmax, wc,eq)
% C = spurious(S,kmin,kmax, wc,eq)
%
%   S is a sequence of ACTG or 1234 representing the strands in
%        several DNA complexes to be used in an experiment.
%        Strands are separated by ' ' or 0; the strands in separate
%        complexes are separated by '  ' or 0 0.
%
%   eq(i) gives the index of the least base i must be equal to
%         A 0 indicates that no bases must be equal by design 
%   wc(i) gives the index of the least base i must be complementary to
%         A -1 indicates that no base pairing is designed
% 
%   makes a table Cik where 1 <= i <= 3 (intramolec,intracomplex,intercomplex)
%   and kmin <= k <= kmax.  Cik gives the number of undesired WC subsequences
%   of length k which match another subsequence exactly...
%       i=1  intramolecular              (same strand)
%       i=2  intermolecular intracomplex (different strand, same complex)
%       i=3  intermolecular intercomplex (different strand, different complex)
%   Note: counts palindromes, also self-overlapping matches
%
%   This is meant to be a fast fn when compiled, esp. for large S.
%
%   DNAdesign-0.02          Erik Winfree
*/

/* 
 allocates 3 x (kmax-kmin+1) vector [intram 1..n, intrac 1..n, interc 1..n]

 if wc==NULL or eq==NULL, behaves as spurious0.
*/

int *spurious(int mismatch, char *Sorig, int kmin, int kmax, int *wc, int *eq)
{
 int *C; char *S,*Swc;
 int i, imax = (kmax-kmin+1); 
 int N; int k,j;

 C = calloc(3*imax, sizeof(int)); if (C==NULL) return NULL;
 for (i=0; i<3*imax; i++) C[i] = 0;

 N = strlen(Sorig);  // note: wc & eq must be length N, or ELSE!!! 

 S   = malloc(N); if (S  ==NULL) { free(C); return NULL; }
 Swc = malloc(N); if (Swc==NULL) { free(C); free(S); return NULL; }

 S1234(S,Sorig);

 for (i=0; i<N; i++) {                   //% WC bases, same order
   if (S[i]==0) Swc[i]=0; else Swc[i]=5-S[i]; 
 }

 for (k=kmin; k<=kmax; k++) { 
  int M, *P, *p, Cs, Ss, m, mWC;
  M = 1<<(2*k);  //% 4^k;
  P = calloc(M,sizeof(int));  //% hold index of present subsequences
  p = calloc(N,sizeof(int));  //% holds pointers to more instances of sequence
  Cs = 0;             //% the start of most recent complex
  Ss = 0;             //% the start of most recent strand
  m = 0;              //% the ID of current subsequence
  mWC = 0;            //% the ID for this subsequence's WC complement
  for (i=1; i<=N; i++) {
   if ( S[i -1] == 0 ) {      //% reset strand & complex indicators
    Ss = i; m=0; mWC = 0;
    if ( i>1 && S[i-1 -1] == 0 ) Cs = i; 
   } else {
    //%m   = rem( 4*m + S(i)-1, M );  % doesn't compile
    //%m   = mod( 4*m + S(i)-1, M );  % doesn't compile
    //%m   = 4*m + S(i)-1; m=m-M*floor(m/M);  % compiles
    m   = ( 4*m + S[i -1]-1 ) % M;  
    mWC = (mWC/4) + (Swc[i -1]-1)*M/4; 
    if (i-Ss >= k && mismatch==0) {
       p[i -1]=P[m]; P[m]=i; //% add site to list of subsequences
       j=P[mWC];     //% look for previous occurrences, including self
       while (j != 0) { int msum,jjj;
         if (wc != NULL && eq != NULL) { //% exclude expected match
           //% if sum( wc(i-k+1:i) == eq(j:-1:j-k+1) )~=k  
           for (msum = 0, jjj=0; jjj<k; jjj++)
              if (wc[i-k+1 +jjj-1] == eq[j -jjj-1]) msum++;
         } else msum=0;
         if (msum != k) {                      
           if (j>Ss) C[       k-kmin+1 -1]++;
           if (j>Cs) C[imax  +k-kmin+1 -1]++;
	             C[2*imax+k-kmin+1 -1]++;
         }
         j = p[j -1];
       }
    }
    if (i-Ss >= k && mismatch==1) { int nt, bp, misWC;
     for (nt=2; nt<=k-1; nt++) {  //% where is mismatch
      //% misWC = mWC - 4^(nt-1) * rem(fix(mWC/4^(nt-1)),4);
      misWC = mWC & (-1 - (3<<(2*nt-2)));
      for (bp=0; bp<4; bp++) { //% what is value at mismatch
       misWC += bp<<(2*nt-2);
       j=P[misWC];   //% look for previous occurrences, including self
       while (j != 0 && misWC != mWC) { //% count all mismatches only
         if (j>Ss) C[       k-kmin+1 -1]++;
         if (j>Cs) C[imax  +k-kmin+1 -1]++;
            C[2*imax+k-kmin+1 -1]++;
         j = p[j -1];
       }
       if (m==misWC && m!=mWC) { //% "palindrome-with-mismatch"
          C[       k-kmin+1 -1]++;
          C[imax  +k-kmin+1 -1]++;
          C[2*imax+k-kmin+1 -1]++;
       }
       misWC -= bp<<(2*nt-2);
      }
     }
     p[i -1]=P[m]; P[m]=i; //% add this site to list of subsequences
    }
   }
  }
  C[2*imax+k-kmin+1 -1] = C[2*imax+k-kmin+1 -1] - C[imax+k-kmin+1 -1];
  C[  imax+k-kmin+1 -1] = C[  imax+k-kmin+1 -1] - C[     k-kmin+1 -1];
  free(p); free(P);
 }
 free(S); free(Swc);
 return C;
}

// --------------------------------------------------------------------------

// c MUST BE UPPERCASE ACGT & degenerate bases
char WC(char c)
{
    switch(c) {
    case 'A': return 'T';
    case 'C': return 'G';
    case 'G': return 'C';
    case 'T': return 'A';
    case 'R': return 'Y';
    case 'Y': return 'R';
    case 'W': return 'W';
    case 'S': return 'S';
    case 'K': return 'M';
    case 'M': return 'K';
    case 'B': return 'V';
    case 'V': return 'B';
    case 'D': return 'H';
    case 'H': return 'D';
    case 'N': return 'N';
    default: return ' '; 
    }
}

// modifies S.   S MUST BE UPPERCASE ACGT & degenerate bases
void WCstring(char *S)
{
  int i,n; n=strlen(S);
  for (i=0; i<n; i++) { S[i]=WC(S[i]); }
}

// --------------------------------------------------------------------------

/*
% function S = constrain(rS, wc, eq)
% S = constrain(rS, wc, eq)
%
%   rS is the raw sequence of 'ACGT '; 
%      bases that should be WC or equal might not be. 
%   wc and eq are as built by constraints().
%
%   S is rS, but with each equivalence class's rep's bases used to
%            determine the entire class and its WC class,
%            so now wc and eq are obeyed.
%
%   DNAdesign-0.02          Erik Winfree
*/

/*
   modifies S.  S MUST BE UPPERCASE ACGT & degenerate bases
*/
void constrain(char *S, int *wc, int *eq)
{
  int n,i,j; int *marked;

  n=strlen(S);
  marked = (int *) calloc(n, sizeof(int));

  for (i=0; i<n; i++) {
    if (!marked[i]) {
      // class = find(eq==eq(i));
      // % compiler is BROKEN for length(class) ~= 1 in S(class) = S(i);
      // for j=1:length(class), S(class(j))=S(i); end
      // marked(class)=1;

      for (j=0; j<n; j++) {
        if (eq[j] == eq[i]) { S[j] = S[i]; marked[j]=1; }
      }

      // class = find(eq==wc(i));
      // for j=1:length(class), S(class(j))=WC(S(i)); end
      // marked(class)=1;

      for (j=0; j<n; j++) {
        if (eq[j] == wc[i]) { S[j] = WC(S[i]); marked[j]=1; }
      }
    }
  }
  free(marked);

}
// --------------------------------------------------------------------------

/*
% function bad6mer = make_bad6mer()
% bad6mer = make_bad6mer()
% 
%   Make a table of costs for "verboten" 6-base subsequences.
%   The costs are just made up... vaguely based on rules of thumb
%   such as "don't have 3 Gs in a row"... "avoid many purines in
%   a row; you might get a triple helix"..."don't have long AT runs"...
%   etc...   Some may by myths or mistakes.
%
%   The results are saved in the file Bad6mer.mat,
%   so it only needs to be run once.
%
%   The only reason this is a function is so it can be compiled, e.g.
%      mcc -wirh make_bad6mer
%
%   DNAdesign-0.02          Erik Winfree
*/

double bad6mer[1<<12];

void make_bad6mer()   
{
  char S[7]; char ACGT[5]=" ACGT";
  int i,j, b1,b2,b3,b4,b5,b6;
  int co[5],ce[5],c[5];
  double ATpenalty = 0.1;

  for (i=0; i < (1<<12);  i++) bad6mer[i] = 0.0;

  i=0;
  for (b1=1; b1<=4; b1++)
   for (b2=1; b2<=4; b2++)
    for (b3=1; b3<=4; b3++)
     for (b4=1; b4<=4; b4++)
      for (b5=1; b5<=4; b5++)
       for (b6=1; b6<=4; b6++) {
         S[0]=ACGT[b1]; S[1]=ACGT[b2]; S[2]=ACGT[b3];
         S[3]=ACGT[b4]; S[4]=ACGT[b5]; S[5]=ACGT[b6]; S[6]=0;
         //% c(i) = how many base type i are present.  
         //% count c(i) for even & odd positions
         for (j=1;j<=4;j++) {co[j]=ce[j]=0;}
         co[b1]=co[b1]+1; ce[b2]=ce[b2]+1; co[b3]=co[b3]+1;
         ce[b4]=ce[b4]+1; co[b5]=co[b5]+1; ce[b6]=ce[b6]+1;
         for (j=1;j<=4;j++) {c[j]=co[j]+ce[j];}
         bad6mer[i] = 
	  (c[2]+c[3]==0) +             //% all AT
	  (c[1]+c[4]==0) +             //% all CG
	  (c[1]+c[3]==0) +             //% all AG (Pu)
	  (c[2]+c[4]==0) +             //% all TC (Py)
	  (co[1]+co[3]+ce[2]+ce[4]==0) +  //% alt PuPy
	  (ce[1]+ce[3]+co[2]+co[4]==0) +  //% alt PyPu
          (strstr(S,"GGG")!=NULL) + 
          (strstr(S,"GGGG")!=NULL) + 
          (strstr(S,"CCC")!=NULL) + 
          (strstr(S,"CCCC")!=NULL) + 
          (strstr(S,"TTTT")!=NULL) + 
          (strstr(S,"AAAA")!=NULL) + 
          (strstr(S,"GCGC")!=NULL) + 
          (strstr(S,"GGCC")!=NULL) + 
          (strstr(S,"CCGG")!=NULL) + 
          (strstr(S,"CGCG")!=NULL) + 
	  ((c[1]+c[4])==5 && (b1==2 || b1==3)) +  //% 5 AT is bad
	  ((c[1]+c[4])==5 && (b6==2 || b6==3)) +  //% 5 AT is bad
	  ((c[2]+c[3])==5 && (b1==1 || b1==4)) +  //% 5 CG is bad
	  ((c[2]+c[3])==5 && (b6==1 || b6==4)) +  //% 5 CG is bad
	  ATpenalty*(c[1]+c[4]>3);            //% try to increase %CG
         i=i+1;
       }
}


// --------------------------------------------------------------------------

/*
%function V = verboten(S)
% V = verboten(S)
%   counts number of occurrences of to-be-avoided sequences, e.g.
%      6-mers containing GGG GGGG TTTT AAAA CCCC GCGC GGCC CCGG CGCG 
%      6-mer tracts of all-AT, all-GC, all-Pu, all-Py, and alternating Pu Py
%
%   NOTE: the variable 'bad6mer' must be defined as global to indicate
%   penalties; it should loaded from Bad6mer.mat, in turn created once
%   by make_bad6mer().
%
%   DNAdesign-0.02          Erik Winfree
*/

double score_verboten(char *Sorig, int *wc, int *eq)
{
 int i, K, N, M, m; char *S; double V;

 N = strlen(Sorig);  
 S = malloc(N); if (S==NULL) { return 0.0; }

 //% map A,C,G,T to 1,2,3,4
 for (i=0; i<N; i++) { 
   switch (Sorig[i]) {
    case 'A': case 'a': case 1: S[i]=1; break;
    case 'C': case 'c': case 2: S[i]=2; break;
    case 'G': case 'g': case 3: S[i]=3; break;
    case 'T': case 't': case 4: S[i]=4; break;
    default: S[i]=0; 
   }
 }
 V=0.0; K=5;

 M = 1<<12;
 m = 0;                //% the ID of current subsequence
 for (i=0; i<N; i++) {
  if (S[i] == 0) {     //% reset strand & complex indicators
    m=0; K=5;          //% wait till full 6-mer considered
  } else {
    m = (  (m<<2) + S[i]-1 ) & (M-1);
    if (K) K=K-1; else V=V+bad6mer[m]; 
  }				       
 }


// printf("verboten('%s')=%f\n\n",Sorig,V);

 free(S);
 return V; 
}

// optimizing score_spurious performs so poorly on Milo's test;
// Niles & Robert's positive+negative approach is more successful...
// add some element of positive design...
//    here, we sum the nearest-neighbor Hbond/stacking energy for
//    all desired WC interactions, in Kcal/mole. 
double score_bonds(char *Sorig, int *wc, int *eq)
{
  double score=0; int i,N; char *S;

  //  for (i=0; i<5; i++) 
  //     { for (N=0; N<5; N++) printf("%4.2f ",nnDH[i][N]); printf("\n"); }

  temperature = 37; 

  N=strlen(Sorig); S = malloc(N); S1234(S,Sorig);

  for (i=1; i<N; i++)
    if (wc[i-1]==wc[i]+1) score += nnDG(S[i-1]+0,S[i]+0);

  return score/2;  // every nt involved in WC get counted twice per stack 
}

// --------------------------------------------------------------------------

/*
%                 1 2 3 4 5  6  7  8  9  10 11  12  13  14  15   0=space
%   degenerates:  A C G T R  Y  W  S  M  K  B   D   H   V   N 
%                         AG CT AT CG AC GT CGT AGT ACT ACG ACGT 
*/
char randbasec(char Stc) 
{
  char *choices;
  switch(Stc) { 
  case 'A': choices = "A"; break;
  case 'C': choices = "C"; break;
  case 'G': choices = "G"; break;
  case 'T': choices = "T"; break;
  case 'R': choices = "AG"; break;
  case 'Y': choices = "CT"; break;
  case 'W': choices = "AT"; break;
  case 'S': choices = "CG"; break;
  case 'M': choices = "AC"; break;
  case 'K': choices = "GT"; break;
  case 'B': choices = "CGT"; break;
  case 'D': choices = "AGT"; break;
  case 'H': choices = "ACT"; break;
  case 'V': choices = "ACG"; break;
  case 'N': choices = "ACGT"; break;
  default:  choices = " ";
  }
  return choices[ int_urn(0,strlen(choices)-1) ];
}

void mutate(char *S, char *St, int *wc, int *eq)
{
  int i; char oldc;
  do {
   i = int_urn(0,strlen(St)-1);
   oldc = S[i];
   S[i] = randbasec(St[i]);
   constrain(S,wc,eq);
  } while (oldc == S[i]);
  // if no base change allowed by template can alter constrained S, never halts
}
// --------------------------------------------------------------------------

// scoring function from score_spurious.m in DNAdesign
double score_spurious(char *S, int *wc, int *eq)
{
  // prefactors = [5^(-4) 5^(-5) 5^(-6)];  % most weight to intramolecular
  // S0 = prefactors * (spurious(S, 3,8, wc,eq) * cumprod(5*ones(1,6))')  ;
  // S1 = prefactors * (spurious1(S, 5,10) * cumprod(5*ones(1,6))')  ;
  
  double factors[18];
  int *C; double score=0.0; int i;

  factors[0] =spurious_intraS; for (i=1; i<6; i++) factors[i]   = factors[i-1] *spurious_beta;
  factors[6] =spurious_interS; for (i=1; i<6; i++) factors[i+6] = factors[i+5] *spurious_beta;
  factors[12]=spurious_interC; for (i=1; i<6; i++) factors[i+12]= factors[i+11]*spurious_beta;

  C = spurious(0,S,3,8,wc,eq);
  for (i=0; i<18; i++) score+=factors[i]*C[i];

  C = spurious(1,S,5,10,NULL,NULL);
  for (i=0; i<18; i++) score+=factors[i]*C[i]*spurious_mm/spurious_beta/spurious_beta;

  return score;
}
// --------------------------------------------------------------------------

/*  wrapper to access  Vienna RNA package   c Ivo L Hofacker */

/*--------------------------------------------------------------------------*/

// pf:  0: mfe base pairs only
//      1: compute partition function base pair probabilities

char *fold_structure=NULL;  // keep fold data around until next use
char *fold_string=NULL;
int fold_length=0;

double foldit(char *S, int pf)
{
   int   i, length;  char *string, *structure;
   double energy=0.0, min_en=0.0;
   float kT, sfact=1.07;

   do_backtrack = 1;   // if partition function, get full matrix
                       // not just dG
   dangles=1;          // see man RNAfold... ignore restrictions 
                       // don't use dangles=1 with pf=1
   dangles=(pf?2:1);   // does this fix a bug?
   dangles=2;          // always....

   temperature = 37; 

   length = strlen(S);

   if (length>fold_length) {
     if (fold_length>0) {
       free(fold_structure); free(fold_string);
       free_arrays(); free_pf_arrays();
     }
     // strange: I should be able to declare just 'length' here,
     // but if I do, then score_struct only works if 'quiet=TRUE' is *NOT* set
     // which, it turns out, has to do with executing the seq-NNNNN-seq
     // foldit call in score_nofold.   I don't understand, but using
     // '2*length' here seems to have fixed the problem.
     fold_string    = (char *) space(2*length+1); 
     fold_structure = (char *) space(2*length+1);
     initialize_fold(2*length);
     init_pf_fold(2*length);
     fold_length=2*length;
   }

   // printf("{%s}\n",S);

   string=fold_string; structure=fold_structure;
   strcpy(string,S);
   for (i = 0; i < length; i++) string[i] = toupper(string[i]);
   for (i = 0; i < length; i++) string[i] = (string[i]=='T')?'U':string[i];

   // pf needs min energy fold, for scale.
   min_en = fold(string, structure);  
   // printf("{[%s]}\n([%s]) min_en = %f\n",string,structure,min_en);
   // base_pairs[] now contains mfe structure base pairs
   if (pf) {
     kT = (temperature+273.15)*1.98717/1000.; /* in Kcal */
     pf_scale = exp(-(sfact*min_en)/kT/length);
     update_pf_params(length);
     energy = pf_fold(string, structure);
     if (debug) printf("\n[%s]\n[%s]\n energy = %f, mfe = %f\n",string,structure,energy,min_en); 

     // pr[] now contains base pairing probabilities 
   }

   return (pf?energy:min_en);
}

double score_nofold(char *rS, int *wc, int *eq)
{
 char *S, *s, **si; int n=0; int i,j; char *string;
 double *dG; double mdG=0, mdGG=0, mddG=0; double dg;

 string = (char *) malloc(sizeof(char)*2*strlen(rS)+10);

 S = rS;                                 // count number of strings
 while (*S != 0) {
   if ((s=strchr(S,' ')) != NULL) {
     if (s!=S) n=n+1;
     S = s+1;
   } else {
     n=n+1;
     S=rS+strlen(rS);
   }
 }  
 si = (char **) malloc( sizeof(char *) * n);    // find string start indices
 S = rS; n=0;
 while (*S != 0) {
   if ((s=strchr(S,' ')) != NULL) {
     if (s!=S) { si[n]=S; n=n+1; }
     S = s+1;
   } else {
     si[n]=S; n=n+1;
     S=rS+strlen(rS);
   }
 }  
 for (i=1; i<n; i++) *(si[i]-1)=0;        // terminate strings

// for (i=0; i<n; i++) printf("%s\n",si[i]);


 dG = (double *) malloc( sizeof(double) * n);
 for (i=0; i<n; i++) {
     dG[i] = foldit(si[i],0);      // mfe energy
     mdG = max(mdG, -dG[i]);
 }  

// for (i=0; i<n; i++) printf("%6.4f ",-dG[i]); printf("\n\n");

 for (i=0; i<n; i++) {
   for (j=0; j<n; j++) {
    sprintf(string,"%sNNNNN%s",si[j],si[i]); 
    dg = foldit(string,0);      // mfe energy
    mdGG = max(mdGG, -dg); 
    mddG = max(mddG, -dg+dG[i]+dG[j]); 

//    printf("%6.4f ",-dg);
   }
//   printf("\n");
 }

 for (i=1; i<n; i++) *(si[i]-1)=' ';  // reconvert to single string

 free(si); free(string); free(dG);

// printf("[%f %f %f %f]\n",mdG, mdGf, mddG, V);

 return nofold_mdG*mdG + nofold_mdGG*mdGG + nofold_mddG*mddG;

}

// with respect to intramolecular folds only,
// N - expected number of bases correctly paired  - # spaces in sequence 
//     == 0 if perfect
// no non-intramolecular interactions are considered at all.
double score_struct(char *rS, int *wc, int *eq)
{
 char *S, *s, **si; int n=0, N, Nk; int i,j,k,jjp; char *string;
 double expNbp=0.0, dG, score; 

 N = strlen(rS);

 string = (char *) malloc(sizeof(char)*2*N+10);

 S = rS;                                 // count number of strings
 while (*S != 0) {
   if ((s=strchr(S,' ')) != NULL) {
     if (s!=S) n=n+1;  S = s+1;
   } else {
     n=n+1;  S=rS+strlen(rS);
   }
 }  
 si = (char **) malloc( sizeof(char *) * n);    // find string start indices
 S = rS; n=0;
 while (*S != 0) {
   if ((s=strchr(S,' ')) != NULL) {
     if (s!=S) { si[n]=S; n=n+1; } S = s+1;
   } else {
     si[n]=S; n=n+1; S=rS+strlen(rS);
   }
 }  
 for (k=1; k<n; k++) *(si[k]-1)=0;        // terminate strings

 // k is strand #; i,j are within-strand indices 1..Nk; ii,jj are indices into S, 0..(N-1)
 // ii == (i-1)+(si[k]-rS);   i == (ii+1)-(si[k]-rS);  iip == ii+1;
 for (k=0; k<n; k++) { 
     Nk = strlen(si[k]);
     dG = foldit(si[k],1);      // pf energy; bp probs in pr[iindx[i]-j]]
     // pr is initially upper triangular, other side completely random
     for (i=1; i<=Nk; i++) for (j=1; j<i; j++) pr[iindx[i]-j]=pr[iindx[j]-i];
     for (i=1; i<=Nk; i++) {
       if ( (jjp=wc[(i-1)+(si[k]-rS)])==-1 ) {  // i should pair with nothing
         expNbp+=1.0;                          // counts as correct if it does
         for (j=1; j<=Nk; j++) expNbp-=pr[iindx[i]-j];
       } else {                                // i should pair with (eq class) jj       
         for (j=1; j<=Nk; j++) 
           if (eq[(j-1)+(si[k]-rS)] == jjp)     // j is in eq class jj
             expNbp+=pr[iindx[i]-j];            // counts as correct if paired
       }
       //       printf("%d->%d: %f\n",i,(j==Nk+1)?-1:j,expNbp);
     }
 }  

 for (k=1; k<n; k++) *(si[k]-1)=' ';  // reconvert to single string

 free(si); free(string);

 score = N - (n-1) - expNbp; // expected number of nt that *aren't* paired correctly.

 return score;

}

// with respect to intramolecular folds only,
// prob( struct == target struct ) = exp(-E(struct,seq)/kT)/Z 
//     == 1.0 if perfect
// no non-intramolecular interactions are considered at all.
double score_prob(char *rS, int *wc, int *eq)
{
 char *S, *s, **si; int n=0, N, Nk; int i,j,k,jj,ii; char *string;
 double dG, dGtarget, score=0.0; double kT;

 N = strlen(rS);

 string = (char *) malloc(sizeof(char)*2*N+10);

 S = rS;                                 // count number of strings
 while (*S != 0) {
   if ((s=strchr(S,' ')) != NULL) {
     if (s!=S) n=n+1;  S = s+1;
   } else {
     n=n+1;  S=rS+strlen(rS);
   }
 }  
 si = (char **) malloc( sizeof(char *) * n);    // find string start indices
 S = rS; n=0;
 while (*S != 0) {
   if ((s=strchr(S,' ')) != NULL) {
     if (s!=S) { si[n]=S; n=n+1; } S = s+1;
   } else {
     si[n]=S; n=n+1; S=rS+strlen(rS);
   }
 }  
 for (k=1; k<n; k++) *(si[k]-1)=0;        // terminate strings

 // k is strand #; i,j are within-strand indices 1..Nk; ii,jj are indices into S, 0..(N-1)
 // ii == (i-1)+(si[k]-rS);   i == (ii+1)-(si[k]-rS); 
 for (k=0; k<n; k++) { 
     if (debug) printf("|%s|\n",si[k]);
     Nk = strlen(si[k]);
     dG = foldit(si[k],1);      // pf energy; bp probs in pr[iindx[i]-j]]
     // create *intramolecular* component of target structure
     //     if there are multiple wc partners, choose the lowest-indexed
     //     one within this strand.
     for (i=1; i<=Nk; i++) {
       ii=(i-1)+(si[k]-rS); jj=wc[ii]-1; j=(jj+1)-(si[k]-rS); 
       //       printf("i=%d ii=%d j=%d jj=%d\n",i,ii,j,jj);
       if      (jj!=-2 && 1<=j && j<i)    string[ii]=')';
       else if (jj!=-2 && i<j && j<=Nk)   string[ii]='(';
       else if (jj==-2)                   string[ii]='.';
       else if (j<1) { int j2, jj2;
           // i makes a bp to someone, see if anyone in strand is eq.
           // this can only be problematic for multi-strand designs.
                                          string[ii]='.';
          for (j2=1; j2<=Nk; j2++) {
	    jj2=(j2-1)+(si[k]-rS); 
            if      (eq[jj2]==jj && j2<i) string[ii]=')';
            else if (eq[jj2]==jj && i<j2) string[ii]='(';
	  }
       } else                             string[ii]='.';
     }
     string[Nk+(si[k]-rS)]=0;
     if (0 && debug) printf("|%s|\n",&string[si[k]-rS]);
     // ***** PROBLEM: wc does not always specify the desired secondary structure, 
     //       if eq has non-trivial values, or if pseuodknot is requested, etc.
     //       Thus we may have computed an impossible
     //       "target structure", and Vienna will crash.  EW & JMS 3/19/03
     // so: double check, & trim out bad things
     { int d; 
        for (d=0, i=1; i<=Nk; i++) {
          ii=(i-1)+(si[k]-rS);
          if (string[ii]=='(') d++;
          if (string[ii]==')') d--;
          if (d<0) { string[ii]='.'; d++; printf("#"); }
        }
        for (d=0, i=Nk; i>=1; i--) {
          ii=(i-1)+(si[k]-rS);
          if (string[ii]==')') d++;
          if (string[ii]=='(') d--;
          if (d<0) { string[ii]='.'; d++; printf("@"); }
        }
     }
     if (debug) printf("\n|%s|\n",&string[si[k]-rS]);

     dGtarget = energy_of_struct(si[k],&string[si[k]-rS]);
     kT = (temperature+273.15)*1.98717/1000.; /* in Kcal */
     if (debug) printf("[%s] T=%f, dGtarget=%f, dG=%f, p=%f\n",
            &string[si[k]-rS],temperature,dGtarget,dG,exp(-(dGtarget-dG)/kT));
     score += 1-exp(-(dGtarget-dG)/kT);
 }  

 for (k=1; k<n; k++) *(si[k]-1)=' ';  // reconvert to single string

 free(si); free(string);

 return score;

}

double score_all(char *rS, int *wc, int *eq)
{
  double V=0.0, Spu=0.0, Bnd=0.0, Nof=0.0, Str=0.0, Pro=0.0;

  if (W_verboten>0) V   = score_verboten(rS,wc,eq);
  if (W_spurious>0) Spu = score_spurious(rS,wc,eq);
  if (W_bonds>0)    Bnd = score_bonds(rS,wc,eq);
  if (W_nofold>0)   Nof = score_nofold(rS,wc,eq);
  if (W_struct>0)   Str = score_struct(rS,wc,eq);
  if (W_prob>0)     Pro = score_prob(rS,wc,eq);

  return W_verboten*V + W_spurious*Spu + W_bonds*Bnd +
         W_nofold*Nof + W_struct*Str + W_prob*Pro;
}


// --------------------------------------------------------------------


void test_evals(char *testS, int *testwc, int *testeq)
{
 int *C; int i,k; char *S,*s; double dG, V, Spu, Bnd, Nof, Str, Pro;

 printf("\n");

 C = spurious(0, testS, 3,8, testwc, testeq);
 printf("spurious(testS, 3,8, testwc, testeq)\n");
 printf("C =  \n");
 for (i=0;i<3;i++) {
  for (k=3; k<=8; k++) {
   printf(" %5d", C[i*6 + k-3]);
  }
  printf("\n");
 }
 free(C);

 C = spurious(0, testS, 3,8, NULL, NULL);
 printf("spurious0(testS, 3,8)\n");
 printf("C =  \n");
 for (i=0;i<3;i++) {
  for (k=3; k<=8; k++) {
   printf(" %5d", C[i*6 + k-3]);
  }
  printf("\n");
 }
 free(C);


 C = spurious(1, testS, 5,10, NULL, NULL);
 printf("spurious1(testS, 5,10)\n");
 printf("C =  \n");
 for (i=0;i<3;i++) {
  for (k=5; k<=10; k++) {
   printf(" %5d", C[i*6 + k-5]);
  }
  printf("\n");
 }
 free(C);


 S = testS;
 while (*S != 0) {
   if ((s=strchr(S,' ')) != NULL) {
     if (s!=S) {
      *s = 0;
      dG = foldit(S,0);  printf("%s: mfe = %6.4f; ",S,dG);
      dG = foldit(S,1);  printf("energy  = %6.4f\n",dG);
      *s = ' ';
     }
     S = s+1;
   } else {
     dG = foldit(S,0);   printf("%s: mfe = %6.4f; ",S,dG);
     dG = foldit(S,1);   printf("energy  = %6.4f\n",dG);
     S=testS+strlen(testS);
   }
 }  

 printf("** score_verboten score = %11.5f \n", V=score_verboten(testS,testwc,testeq) );
 printf("** score_spurious score = %11.5f \n", Spu=score_spurious(testS,testwc,testeq) );
 printf("** score_bonds    score = %11.5f \n", Bnd=score_bonds(testS,testwc,testeq) );
 printf("** score_nofold   score = %11.5f \n", Nof=score_nofold(testS,testwc,testeq) );
 printf("** score_struct   score = %11.5f \n", Str=score_struct(testS,testwc,testeq) );
 printf("** score_prob     score = %11.5f \n", Pro=score_prob(testS,testwc,testeq) );
 printf("** [%4.2f %4.2f %4.2f %4.2f, %4.2f, %4.2f]-weighted score = %11.5f \n", 
	W_verboten, W_spurious, W_bonds, W_nofold, W_struct, W_prob,
	W_verboten*V + W_spurious*Spu + W_bonds*Bnd + 
        W_nofold*Nof + W_struct*Str + W_prob*Pro);

 printf("\n\n");

}



// -------------------------------------------------------------------------

void load_input_files()
{ FILE *f; char c; int i; double r; 

//// Note: we strip off trailing ' ' from rS and St,
//// and delete corresponding entries in wc and eq
//// but YELL if any deleted entries are not -1 or 0 respectively.

 testS = malloc(maxN); // big enough?
 if (rS_filename!=NULL) {
  if ( (f = fopen(rS_filename,"r")) == NULL ) {
   fprintf(stderr,"Can't open rS file <%s>\n",rS_filename); exit(-1);
  } else {
   while ((c = fgetc(f)) != EOF) 
      if (index("ATCGatcg ",c)!=NULL) testS[NrS++]=c; 
   testS[NrS]=0;
   if (debug) printf("S = <%s>\n",testS);
   NrS = strlen(testS);
   while (testS[NrS-1]==' ' && NrS>0) { NrS--; testS[NrS]=0; }
   fclose(f);
  }
 }

 testSt = malloc(maxN);
 if (St_filename!=NULL) {
  if ( (f = fopen(St_filename,"r")) == NULL ) {
   fprintf(stderr,"Can't open St file <%s>\n",St_filename); exit(-1);
  } else {
   while ((c = fgetc(f)) != EOF) 
      if (index("ATCGatcgRYWSMKBDHVNrywsmkbdhvn ",c)!=NULL) testSt[NSt++]=c; 
   testSt[NSt]=0;
   if (debug) printf("St = <%s>\n",testSt);
   NSt = strlen(testSt);
   while (testSt[NSt-1]==' ' && NSt>0) { NSt--; testSt[NSt]=0; }
   fclose(f);
  }
 }

 testwc = calloc(maxN, sizeof(int));
 if (wc_filename!=NULL) {
  if ( (f = fopen(wc_filename,"r")) == NULL ) {
   fprintf(stderr,"Can't open wc file <%s>\n",wc_filename); exit(-1);
  } else {
   //   for (i=0; i<N; i++) { fscanf(f," %lf",&r); testwc[i]=r; }
   while (fscanf(f," %lf",&r)>0) testwc[Nwc++]=r; 
   if (debug) {
    printf("wc = <"); 
    for (i=0; i<Nwc; i++) { printf("%d ", testwc[i]); }
    printf("> \n"); 
   }
   fclose(f);
  }
 }

 testeq = calloc(maxN, sizeof(int));
 if (eq_filename!=NULL) {
  if ( (f = fopen(eq_filename,"r")) == NULL ) {
   fprintf(stderr,"Can't open eq file <%s>\n",eq_filename); exit(-1);
  } else {
   //   for (i=0; i<N; i++) { fscanf(f,"%lf",&r); testeq[i]=r; }
   while (fscanf(f," %lf",&r)>0) testeq[Neq++]=r; 
   if (debug) {
    printf("eq = <"); 
    for (i=0; i<Neq; i++) { printf("%d ", testeq[i]); }
    printf("> \n"); 
   }
   while (testeq[Neq-1]==0 && Neq>0) Neq--;
   fclose(f);
  }
 }

 while (Nwc > MAX(Neq,MAX(NrS,NSt)) && MAX(Neq,MAX(NrS,NSt))>0) {
   if (testwc[Nwc-1]==-1) Nwc--;
   else {
     fprintf(stderr,"wc is longer than sequence/template/eq, with non-empty entries!!\n");
     exit(-1);
   }
 }

 N=MAX(N,MAX(MAX(NrS,NSt),MAX(Neq,Nwc)));
 if (N==0) {
   fprintf(stderr,"Zero-length sequence.  Aborting.  Try --help.  \n");
   exit(-1);
 }

 // set default array values for rS, St, wc, eq
 if (St_filename==NULL) {
   NSt=N; for (i=0; i<N; i++) testSt[i]='N'; testSt[N]=0;
 }
 if (rS_filename==NULL) {
   NrS=NSt; for (i=0; i<NrS; i++) testS[i]=randbasec(testSt[i]); testS[NrS]=0;
 }
 if (wc_filename==NULL) {
   Nwc=N; for (i=0; i<N; i++) testwc[i]=-1;
 }
 if (eq_filename==NULL) {
   Neq=N; for (i=0; i<N; i++) testeq[i]=(testS[i]==' ')?0:(i+1); 
 }

 if (N != NrS) 
   { fprintf(stderr,"rS is not max length, %d!!!\n",N); exit(-1); }
 if (N != NSt) 
   { fprintf(stderr,"St is not max length, %d!!!\n",N); exit(-1); }
 if (N != Nwc) 
   { fprintf(stderr,"wc is not max length, %d!!!\n",N); exit(-1); }
 if (N != Neq) 
   { fprintf(stderr,"eq is not max length, %d!!!\n",N); exit(-1); }

 // make corrections to defaults for ' ' separators
 for (i=0; i<N; i++) 
    if (testSt[i]==' ' || testS[i]==' ' || testeq[i]==0) 
      { testSt[i]=' '; testS[i]=' '; testeq[i]=0; testwc[i]=-1; }

}

// -------------------------------------------------------------------------
int main(int argc, char *argv[])
{
  int i; FILE *f;
 time_t t_start,t_now,tmax=0;  int imax=0; int bored, bmax=0;
 int fancy_args=1, quiet=0, watch=1, trace=0; int DNAfold=1, RNAfold=0;

 // do we have fancy args or simple args?
 for (i=1;i<argc;i++) {
   if (index(argv[i],'=')==NULL) fancy_args=0;
 }

 if (!fancy_args && argc != 5) {
    fprintf(stderr,"Two command line formats are accepted for %s:\n",argv[0]);
    fprintf(stderr,"  %s rS_file St_file wc_file eq_file\n",argv[0]);
    fprintf(stderr,"or\n");
    fprintf(stderr,"  %s [option]*\n",argv[0]);
    fprintf(stderr,"where the options are:\n"
    " INPUT/OUTPUT\n"
    "  sequence=[file]      for initial nucleotide sequence (rS_file) [default: random]\n"
    "  template=[file]      for allowed nucleotides at each position (St_file) [default: all N]\n"
    "  wc=[file]            for Watson-Crick pairing constraints (wc_file) [default: all -1]\n"
    "  eq=[file]            for equality constraints (eq_file) [default: identity]\n"
    "  output=[filename]    for final output sequence upon completion [default: stdout]\n"
    "  N=[value]            length of sequence, if no files are specified\n"
    "  quiet=TRUE           don't print anything, except errors & output\n"
    "  quiet=SCORES         output intial & final test scores, for all score methods\n"
    "  quiet=WATCH          output running tally of best test scores, for chosen method\n"
    "  quiet=ALL            output all the above\n"
    "  trace=ON             output the current sequence, at every improvement\n"
    " STOPPING CRITERIA\n"
    "  tmax=[value]         stop after specified time (in seconds) has elapsed\n"
    "  imax=[value]         stop after specified number of mutation iterations have been completed\n"
    "  bored=[value]        stop after specified number of mutation iterations yield no change\n"
    " SCORING FUNCTION\n"
    "  score=[verboten|spurious|bonds|nofold|struct|prob] what scoring function to use [default: spurious]\n"
    "  param=[DNA|RNA]                  what Vienna RNAfold parameter set to use [default: DNA]\n"
    "  W_verboten=[value]               weight for verboten score [default: 0.0]\n"
    "  W_spurious=[value]               weight for spurious score [default: 1.0]\n"
    "  W_bonds=[value]                  weight for bonds score [default: 0.0]\n"
    "  W_nofold=[value]                 weight for nofold score [default: 0.0]\n"
    "  W_struct=[value]                 weight for struct score [default: 0.0]\n"
    "  W_prob=[value]                   weight for prob score [default: 0.0]\n"
    "  spurious_beta=[value]            multiplicative penalty, per match base pair [default: 5.0]\n"
    "  spurious_intraS=[value]          initial penalty, intra-strand matches [default: 1/125]\n"
    "  spurious_interS=[value]          initial penalty, inter-strand matches [default: 1/625]\n"
    "  spurious_interC=[value]          initial penalty, inter-complex matches [default: 1/3125]\n"
    "  nofold_mdG=[value]               penalty for max single strand mfe [default: 1.0]\n"
    "  nofold_mdGG=[value]              penalty for max strand-pair mfe [default: 1.0]\n"
    "  nofold_mddG=[value]              penalty for max strand-pair relative mfe [default: 1.0]\n"
    "\n"
    "Note:\n\n"
    "sequence is in { A C G T }*\n\n"
    "template is in { A C G T  R  Y  W  S  M  K  B   D   H   V   N   }*\n"
    "        meaning  A C G T AG CT AT CG AC GT CGT AGT ACT ACG ACGT \n\n"
    "        spaces indicate strand (' ') and complex ('  ') boundaries\n\n"
    "eq and wc are lists of integers, indexes into the sequence string, starting at 1\n\n"
    "eq(i) is the min of all bases constrained\n     to have the same value as i (' ' bases have eq(i)==0)\n\n"
    "wc(i) is the min of all bases constrained\n     to be complementary to i    (or -1 if there are none)\n\n"
    "See DNAdesign score_verboten.m, score_spurious.m and score_nofold.m for scoring function definitions\n"
    "    'verboten', 'spurious' and 'nofold'.\n"
    "    'bonds' computes the total energy of base-stacks (nearest-neighbor model)\n"
    "    'struct' computes expected the number of incorrectly-interacting nucleotides\n"
    "    'prob' computes the ensemble probability of the target structure\n"
    "    ('struct' and 'prob' use the RNAfold partition function)\n"
    "Weighted combinations of scoring functions can be specified using the 'W_*' parameters.\n");

    exit(-1);
 }

 init_rand();

 make_bad6mer();

 if (fancy_args) {
   // try to parse fancy args

   for (i=1;i<argc;i++) {
     if      (strncmp(argv[i],"sequence=",9)==0) rS_filename=&argv[i][9]; 
     else if (strncmp(argv[i],"template=",9)==0) St_filename=&argv[i][9]; 
     else if (strncmp(argv[i],"wc=",3)==0) wc_filename=&argv[i][3]; 
     else if (strncmp(argv[i],"eq=",3)==0) eq_filename=&argv[i][3]; 
     else if (strncmp(argv[i],"output=",7)==0) S_filename=&argv[i][7]; 
     else if (strncmp(argv[i],"N=",2)==0) N=atoi(&argv[i][2]);
     else if (strncmp(argv[i],"tmax=",5)==0) tmax=atoi(&argv[i][5]);
     else if (strncmp(argv[i],"imax=",5)==0) imax=atoi(&argv[i][5]);
     else if (strncmp(argv[i],"bored=",6)==0) bmax=atoi(&argv[i][6]);
     else if (strncmp(argv[i],"score=verboten",14)==0) { W_spurious=0.0; W_verboten=1.0; W_nofold=0.0; W_struct=0.0; W_prob=0.0; W_bonds=0.0; }
     else if (strncmp(argv[i],"score=spurious",14)==0) { W_spurious=1.0; W_verboten=0.0; W_nofold=0.0; W_struct=0.0; W_prob=0.0; W_bonds=0.0; }
     else if (strncmp(argv[i],"score=bonds",11)==0) { W_spurious=0.0; W_verboten=0.0; W_nofold=0.0; W_struct=0.0; W_prob=0.0; W_bonds=1.0; }
     else if (strncmp(argv[i],"score=nofold",12)==0) { W_spurious=0.0; W_verboten=0.0; W_nofold=1.0; W_struct=0.0; W_prob=0.0; W_bonds=0.0; }
     else if (strncmp(argv[i],"score=struct",12)==0) { W_spurious=0.0; W_verboten=0.0; W_nofold=0.0; W_struct=1.0; W_prob=0.0; W_bonds=0.0; }
     else if (strncmp(argv[i],"score=prob",10)==0) { W_spurious=0.0; W_verboten=0.0; W_nofold=0.0; W_struct=0.0; W_prob=1.0; W_bonds=0.0; }
     else if (strncmp(argv[i],"param=DNA",9)==0) { DNAfold=1; RNAfold=0; }
     else if (strncmp(argv[i],"param=RNA",9)==0) { RNAfold=1; DNAfold=0; }
     else if (strncmp(argv[i],"quiet=TRUE",10)==0) { quiet=1; watch=0; }
     else if (strncmp(argv[i],"quiet=SCORES",12)==0) { quiet=0; watch=0; }
     else if (strncmp(argv[i],"quiet=WATCH",11)==0) { quiet=1; watch=1; }
     else if (strncmp(argv[i],"quiet=ALL",9)==0) { quiet=0; watch=1; }
     else if (strncmp(argv[i],"trace=ON",8)==0) { trace=1;  }
     else if (strncmp(argv[i],"debug=TRUE",10)==0) debug=1;
     else if (strncmp(argv[i],"W_verboten=",11)==0) W_verboten=atof(&argv[i][11]);
     else if (strncmp(argv[i],"W_spurious=",11)==0) W_spurious=atof(&argv[i][11]);
     else if (strncmp(argv[i],"W_bonds=",8)==0) W_bonds=atof(&argv[i][8]);
     else if (strncmp(argv[i],"W_nofold=",9)==0) W_nofold=atof(&argv[i][9]);
     else if (strncmp(argv[i],"W_struct=",9)==0) W_struct=atof(&argv[i][9]);
     else if (strncmp(argv[i],"W_prob=",7)==0) W_prob=atof(&argv[i][7]);
     else if (strncmp(argv[i],"spurious_beta=",14)==0) spurious_beta=atof(&argv[i][14]);
     else if (strncmp(argv[i],"spurious_intraS=",16)==0) spurious_intraS=atof(&argv[i][16]);
     else if (strncmp(argv[i],"spurious_interS=",16)==0) spurious_interS=atof(&argv[i][16]);
     else if (strncmp(argv[i],"spurious_interC=",16)==0) spurious_interC=atof(&argv[i][16]);
     else if (strncmp(argv[i],"nofold_mdG=",11)==0) nofold_mdG=atof(&argv[i][11]);
     else if (strncmp(argv[i],"nofold_mdGG=",12)==0) nofold_mdGG=atof(&argv[i][12]);
     else if (strncmp(argv[i],"nofold_mddG=",12)==0) nofold_mddG=atof(&argv[i][12]);
     else { 
       fprintf(stderr,"Cannot parse argument <%s>.  Aborting. \n\n",argv[i]); exit(-1); 
     }
   }
 
 } else { 
   // otherwise, try to read all four input files
   rS_filename=argv[1]; St_filename=argv[2]; 
   wc_filename=argv[3]; eq_filename=argv[4];
 }

 // initialize RNAfold
 if ((f=fopen(VIENNA_DIR "default.par","r"))==NULL) { 
   fprintf(stderr, "Cannot open RNA param file at %s.  Recompile?\n", 
           VIENNA_DIR "default.par");
   exit(-1);
 } else { fclose(f); }
 if ((f=fopen(VIENNA_DIR "dna.par","r"))==NULL) { 
   fprintf(stderr, "Cannot open DNA param file at %s.  Recompile?\n", 
           VIENNA_DIR "dna.par");
   exit(-1);
 } else { fclose(f); }
 if (RNAfold) read_parameter_file(VIENNA_DIR "default.par");
 if (DNAfold) read_parameter_file(VIENNA_DIR "dna.par");

 // load in the files!
 load_input_files();

 //////////////////////////////////////////////////////////////
 // information was read in.  now do the designing!

 constrain(testS,testwc,testeq);
 if (!quiet) printf("\nconstrained S = <\n%s\n>  N=%d \n",testS,N);

 if (!quiet) test_evals(testS,testwc,testeq);

 {
  char *oldS; double old_score, new_score; int steps=0; bored=0;
  oldS = malloc(N); 
  old_score = score_all(testS,testwc,testeq); 
  if (watch) printf("%8d steps, %8d seconds : score = %18.10f \n",0,0,old_score);
  time(&t_start);  time(&t_now);
  while ( (tmax==0 || t_start+tmax>=t_now) && (imax==0 || steps<imax) && (bmax==0 || bored<bmax) ) { 
   steps++; 
   if (!(quiet && !watch) && !trace && steps%300 == 0 && tmax==0 && imax==0 && bmax==0) 
      printf("\n\n%s\n\n",testS);
   for (i=0; i<N; i++) oldS[i]=testS[i];
   mutate(testS,testSt,testwc,testeq);
   new_score = score_all(testS,testwc,testeq); 
   if (new_score <= old_score) {
     if (new_score < old_score) bored=0;
     old_score = new_score; 
     if (watch) printf("%8d steps, %8d seconds : score = %18.10f \n", 
               steps, (int)(t_now-t_start), new_score);
     if (trace) printf("%s\n",testS);
   } else {
     for (i=0; i<N; i++) testS[i]=oldS[i]; bored++;
   }
   time(&t_now);
  }  
  if (watch) printf("%8d steps, %8d seconds : score = %18.10f FINAL\n", 
               steps-1, (int)(t_now-t_start), old_score);
 }

 //// print final sequence to output file *****


 if (!quiet) test_evals(testS,testwc,testeq);


 if (S_filename==NULL)
   printf("%s\n",testS);
 else {
   if ( (f = fopen(S_filename,"w")) == NULL ) {
     fprintf(stderr,"Can't open output file <%s>\n",S_filename); exit(-1);
   } else {
     fprintf(f,"%s\n",testS);
     fclose(f);
   }
 }

 return 1;

}
