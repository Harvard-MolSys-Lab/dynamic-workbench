# Port of compiler2.m into python.
# Probably extremely inelegant code from a python perspective, because I'm not familiar with writing in python.

# All the things we need to define for a new motif type:
# numsegs is the total number of segments in the motif
# hcomp is a cell array of two-element vectors, each of which identifies the numbers of a pair of complementary segments in the hairpin conformation
# outport is an array of length equal to the number of non-input ports, specifying for each port: 1 if it's a regular output port, 0 if it's a bridge  (such lists always start at the end opposite the input port)
# portseg is a cell array giving, for each non-input port, the numbers of the corresponding segments
# relpol is an array giving, for each non-input port, the relative polarity of the target strand (1 = same 5'-3' direction, -1 = opposite)
# (Later extensions to be added include: clamp segments vs. regular segments (not an issue for the compiler, only for the NUPACK and SVG outputs); support for multiple bridge ports per hairpin)

import string
import argparse

class PolarityError(Exception):
  def __init__(self, value):
    self.value = value
  def __str__(self):
    return repr(self.value)

def find(a, func):
    return [i for (i, val) in enumerate(a) if func(val)]

def signum(int):
 if(int < 0): return -1;
 elif(int > 0): return 1;
 else: return int;

# type table:
mtable = [
# first a null entry to pad the 0 index
    {'numsegs': 0},
# 1 = 2-segment initiator
    {'numsegs': 2, 'hcomp': [], 'outport': [1], 'portseg': [range(1,3)], 'relpol': [-1]},
# 2 = 3-segment initiator
    {'numsegs': 3, 'hcomp': [], 'outport': [1], 'portseg': [range(1,4)], 'relpol': [-1]},
# 3 = one-output circle (4 segments) (blue output)
    {'numsegs': 4, 'hcomp': [[2,4]], 'outport': [1], 'portseg': [[3,4]], 'relpol': [1]},
# 4 = two-output circle (9 segments) (green,blue outputs)
    {'numsegs': 9, 'hcomp': [[2,7],[3,6]], 'outport': [1,1], 'portseg': [[7,8,9],[4,5,6]], 'relpol': [-1,1]},
# 5 = one-output circle (6 segments) (1-pink output)
    {'numsegs': 6, 'hcomp': [[2,6],[3,5]], 'outport': [0], 'portseg': [[4]], 'relpol': [1]},
# 6 = three-output circle (10 segments) (green,blue,1-pink outputs)
    {'numsegs': 10, 'hcomp': [[2,8],[3,7]], 'outport': [1,1,0], 'portseg': [[8,9,10],[5,6,7],[4]], 'relpol': [-1,1,1]},
# 7 = two-output circle (7 segments) (1-purple,blue outputs)
    {'numsegs': 7, 'hcomp': [[2,7],[3,6]], 'outport': [0,1], 'portseg': [[7],[4,5,6]], 'relpol': [1,1]},
# 8 = two-output circle (8 segments) (green,2-purple outputs)
    {'numsegs': 8, 'hcomp': [[2,6],[3,5]], 'outport': [1,0], 'portseg': [[6,7,8],[4,5]], 'relpol': [-1,-1]},
# 9 = one-output circle (6 segments) (2-purple output)
    {'numsegs': 6, 'hcomp': [[2,6],[3,5]], 'outport': [0], 'portseg': [[4,5]], 'relpol': [-1]},
# 10 = 5-segment initiator (3 normal, 2 clamps)
    {'numsegs': 5, 'hcomp': [], 'outport': [1], 'portseg': [[1,2,3,4,5]], 'relpol': [-1]},
# 11 = two-output circle (14 segments, 9&5) (green,blue outputs)
    {'numsegs': 14, 'hcomp': [[2,12],[3,11],[4,10],[5,9]], 'outport': [1,1], 'portseg': [[11,12,13,14],[6,7,8,9,10]], 'relpol': [-1,1]},
# 12 = two-output circle (10 segments, 8&2) (green,2-purple outputs)
    {'numsegs': 10, 'hcomp': [[2,8],[3,7],[4,6]], 'outport': [1,0], 'portseg': [[7,8,9,10],[5,6]], 'relpol': [-1,-1]},
# 13 = one-output circle (8 segments, 6&2) (2-purple output)
    {'numsegs': 8, 'hcomp': [[2,8],[3,7],[4,6]], 'outport': [0], 'portseg': [[5,6]], 'relpol': [-1]},
# 14 = modified 3-output (10 segments) (green,3-purple,1-pink outputs)
    {'numsegs': 10, 'hcomp': [[2,8],[3,7]], 'outport': [1,0,0], 'portseg': [[8,9,10],[5,6,7],[4]], 'relpol': [-1,1,1]},
# 15 = modified 2-output (9 segments) (green,3-purple outputs)
    {'numsegs': 9, 'hcomp': [[2,7],[3,6]], 'outport': [1,0], 'portseg': [[7,8,9],[4,5,6]], 'relpol': [-1,1]},
# 16 = mod 3-output (10 segments) (green,2-purple,2-pink outputs)
    {'numsegs': 10, 'hcomp': [[2,8],[3,7]], 'outport': [1,0,0], 'portseg': [[8,9,10],[6,7],[4,5]], 'relpol': [-1,1,1]},
# 17 = mod one-output (5 segments) (2-input, 2-pink)
    {'numsegs': 5, 'hcomp': [[2,5]], 'outport': [0], 'portseg': [[3,4]], 'relpol': [1]},
# 18 = mod 3-output (10 segments) (green,2-blue,2-pink)
    {'numsegs': 10, 'hcomp': [[2,8],[3,7]], 'outport': [1,1,0], 'portseg': [[8,9,10],[6,7],[4,5]], 'relpol': [-1,1,1]},
# 19 = one-output circle (6 segments) (blue)
    {'numsegs': 6, 'hcomp': [[2,6],[3,5]], 'outport': [1], 'portseg': [[4,5,6]], 'relpol': [1]},
    ]

m = []

parser = argparse.ArgumentParser(description='Takes a nodal abstraction description of a hairpin program and generates labels for all segments.')
parser.add_argument('-i', default='input.txt', dest='infilestr', 
       help='input TerseML file (default: input.txt in this directory)')
parser.add_argument('-n', default='nupack-out.nupack', dest='nufilestr', 
       help='NUPACK output file (default: nupack-out.nupack in this directory)')
parser.add_argument('-d', default='dd-out.domains', dest='domsfilestr', 
       help='Domains output file (default: dd-out.domains in this directory)')
parser.add_argument('-s', default='svg-out.svg', dest='svgfilestr', 
       help='SVG output file (default: svg-out.svg in this directory)')
args = parser.parse_args()

fid = open(args.infilestr,'r')
# Should check to make sure it opened successfully
line = fid.readline()
numm = int(line)
for i in range(numm):
  line = fid.readline()
  linelst = string.split(line)
  m.append({})
  m[i]['type'] = int(linelst[0])
  m[i]['out'] = []
  for j in range(len(mtable[m[i]['type']]['outport'])):
    if int(linelst[1+j]) == 0:
       m[i]['out'].append([])
    else:
       m[i]['out'].append(int(linelst[1+j]))
       # could check to make sure it's within the range 1..numm

fid.close()

# could add type-checking, i.e., when there's an arrow drawn from an output to an input, are they of the same length?

lst = []
for i in range(len(m)):
  m[i]['polarity'] = 0
  lst.append(m[i]['type'])
for i in find(lst,lambda x:x==min(lst)):
  m[i]['polarity'] = -1
# this won't necessarily work for systems with multiple initiators---their polarities can't always be set independently

oldpol=[]
for i in range(len(m)):
  oldpol.append(1)
while oldpol != [m[i]['polarity'] for i in range(len(m))]:  # repeat while still changing
  oldpol = [m[i]['polarity'] for i in range(len(m))]
  # set polarities first:
  for i in range(len(m)):
    for j in range(len(m[i]['out'])):
      targ = m[i]['out'][j]
      # current implementation assumes only one arrow drawn from each output
      if targ != []:  # [] means no arrow for this output port
        dirs = mtable[m[i]['type']]['relpol'][j] * m[i]['polarity'];
        if dirs != 0:  # if m[i] was already assigned a polarity
          if m[targ-1]['polarity'] == -dirs:  # -1 because python is 0-indexed
            raise PolarityError([i,targ])
          m[targ-1]['polarity'] = dirs

# now create constraint matrix
seglst = [mtable[i]['numsegs'] for i in range(len(mtable))]  # number of segments in each motif type
totnsegs = sum([seglst[m[i]['type']] for i in range(len(m))])  # total number of segments to label
cmat = []
for i in range(totnsegs):
  cmat.append([])
  for j in range(totnsegs):
    cmat[i].append(0)
labels = [-(i+1) for i in range(totnsegs)]
# motif positive constraints: each motif type specifies its own internal matches
ofs = 0  # offset for each new motif
for i in range(len(m)):
  m[i]['ofs'] = ofs
  for j in range(len(mtable[m[i]['type']]['hcomp'])):
    lst = mtable[m[i]['type']]['hcomp'][j]
    cmat[ofs+lst[0]-1][ofs+lst[1]-1] = -1  # [...-1] because python is 0-indexed
  ofs += seglst[m[i]['type']]
# arrow positive constraints: anything where an output points to an input involves complementarity for the associated segments
for i in range(len(m)):
  for j in range(len(m[i]['out'])):
    outlst = mtable[m[i]['type']]['portseg'][j]
    outype = mtable[m[i]['type']]['outport'][j]
    k = m[i]['out'][j]  # current implementation assumes only one arrow drawn from each output
    if k==[]:  # allow some ports to be unassigned
      inlst = []
    else:
      k -= 1  # 0-indexed
      if outype:
        inlst = range(len(outlst))
      else:
        ind = find(mtable[m[k]['type']]['outport'],lambda x:x==0)[0]  # currently assumes at most one bridge port per motif
        inlst = list(mtable[m[k]['type']]['portseg'][ind])
        for l in range(len(inlst)): inlst[l] -= 1
      if m[i]['polarity']==m[k]['polarity']:
        inlst.reverse()
    for l in range(len(inlst)):
      cmat[m[i]['ofs']+outlst[l]-1][m[k]['ofs']+inlst[l]] = -1  # at this point outlst is 1-indexed, inlst is 0-indexed

# now keep updating the labels according to the constraint matrix
# negative labels mean complementary
oldlab=[]
for i in range(len(labels)):
  oldlab.append(0)
while oldlab != labels:  # can we characterize when we'll have to do this more than once?
  oldlab = list(labels)
  for i in range(len(cmat)):
    for j in range(len(cmat[i])):
      if cmat[i][j]==1:  # equality constraint
        raise NotImplementedError  # we don't actually have such constraints
        if labels[i] != labels[j]:
          k = min(abs(labels[i]),abs(labels[j]))
          lst = find(labels,lambda x:x==labels[i] or x==labels[j])
          for l in lst:
            labels[l] = k*signum(labels[l])
      if cmat[i][j]==-1:  # complementarity constraint
        if labels[i]==labels[j]:
          print 'Requirement for segments ' + repr(i) + ' (' + repr(labels[i]) + ') and ' + repr(j) + ' (' + repr(labels[j]) + ') to be both identical and complementary.'  # not sure that can happen
        if labels[i] != -labels[j]:
          k = min(abs(labels[i]),abs(labels[j]))
          if k==abs(labels[i]):  # keep i the same, relabel the other list so that j gets the opposite sign from i
            lst = find(labels,lambda x:x==labels[j] or x==-labels[j])
          else:
            lst = find(labels,lambda x:x==labels[i] or x==-labels[i])
          tlab = list(labels)  # want to relabel all relevant segments simultaneously
          for l in lst:
            tlab[l] = -k*signum(labels[i])*signum(labels[l])*signum(labels[j])
          labels = tlab

# motif negative constraints: can't have other matching/complementary sequences elsewhere in the motif (if the cmat entry is 0, it shouldn't match)
for i in range(len(m)):
  for j in range(seglst[m[i]['type']]-1):
    for k in range(j+1,seglst[m[i]['type']]):
      if labels[m[i]['ofs']+j]==-labels[m[i]['ofs']+k] and cmat[m[i]['ofs']+j][m[i]['ofs']+k]==0:
        print 'Complementarity warning: motif ' + repr(i) + ', segments ' + repr(j) + ' and ' + repr(k)

# And now a similarly inelegant port of nupack_out2.m.

# Assumes a single hairpin loop for now.  Doesn't handle clamps yet.

SEGLEN = 7;
# number of base pairs per segment

fnup = open(args.nufilestr,'w')

for i in range(len(m)):
  lst = mtable[m[i]['type']]['hcomp']
  if len(lst)==0:
    fnup.write('structure M' + repr(i+1) + ' = U' + repr(mtable[m[i]['type']]['numsegs']*SEGLEN) + '\n')
  else:
    lst2 = []
    for j in lst:
      if j != []:
        lst2.extend(j)
    lst2.sort()
    strn = 'structure M' + repr(i+1) + ' = '
    len1 = lst2[0]-1  # length of the initial toehold
    len2 = len(mtable[m[i]['type']]['hcomp'])  # length of the duplex region
    lst3 = []
    for j in range(1,len(lst2)):
      lst3.append(lst2[j]-lst2[j-1])
    len3 = max(lst3)-1  # length of the hairpin loop
    len4 = mtable[m[i]['type']]['numsegs'] - max(lst2)  # length of the trailing end
    if m[i]['polarity']==1:
      strn += 'U' + repr(SEGLEN*len1) + ' H' + repr(SEGLEN*len2) + ' U' + repr(SEGLEN*len3)
      if len4>0:
        strn += ' U' + repr(SEGLEN*len4)
    else:
      if len4>0:
        strn += 'U' + repr(SEGLEN*len4) + ' '
      strn += 'H' + repr(SEGLEN*len2) + ' U' + repr(SEGLEN*len3) + ' U' + repr(SEGLEN*len1)
    fnup.write(strn + '\n')

alab = list(labels)
for i in range(len(alab)): alab[i] = abs(alab[i])
alabs = set(alab)
for i in alabs:
  fnup.write('sequence ' + repr(i) + ' = ' + repr(SEGLEN) + 'N' + '\n')

for i in range(len(m)):
  strn = 'M' + repr(i+1) + ' : '
  if m[i]['polarity']==1:
    for j in range(seglst[m[i]['type']]):
      strn += repr(labels[m[i]['ofs']+j]) + ' '
  else:
    for j in range(seglst[m[i]['type']]-1,-1,-1):
      strn += repr(labels[m[i]['ofs']+j]) + ' '
  lst = find(strn,lambda x:x=='-')
  strl = list(strn)
  for j in range(len(lst)):
    k = lst[j]
    while strl[k] != ' ':
      strl[k] = strl[k+1]
      k += 1
    strl[k-1] = '*'
  fnup.write(''.join(strl) + '\n')

for i in range(len(m)):
  fnup.write('M' + repr(i+1) + ' < 1.0\n')

fnup.close()


# domsfilestr
fdom = open(args.domsfilestr,'w')

alab = list(labels)
for i in range(len(alab)): alab[i] = abs(alab[i])
alabs = set(alab)
for i in alabs:
  fdom.write('sequence ' + repr(i) + ' = ' + repr(SEGLEN) + 'N' + '\n')

for i in range(len(m)):
  strn = 'M' + repr(i+1) + ' : '
  if m[i]['polarity']==1:
    for j in range(seglst[m[i]['type']]):
      strn += repr(labels[m[i]['ofs']+j]) + ' '
  else:
    for j in range(seglst[m[i]['type']]-1,-1,-1):
      strn += repr(labels[m[i]['ofs']+j]) + ' '
  lst = find(strn,lambda x:x=='-')
  strl = list(strn)
  for j in range(len(lst)):
    k = lst[j]
    while strl[k] != ' ':
      strl[k] = strl[k+1]
      k += 1
    strl[k-1] = '*'
  fdom.write(''.join(strl) + '\n')

fdom.close()


# And finally a port of svgout.m.

from math import sqrt,ceil,pi,atan2

SEGLEN = 7
# number of base pairs per non-clamp segment
# note that this is redefining the value from above, now that we have all the previously separate programs in the same file
CLAMPLEN = 3
# number of base pairs per clamp segment

H=300
V=160
# space allocated for each motif to be drawn in (one tile)
R = round(sqrt(len(m)))
C = ceil(len(m)/R)
# # of rows and columns of tiles

# colors:
# brown: rgb(139,98,61)
# blue: rgb(69,181,215)
# yellow: rgb(241,139,17)
# green: rgb(0,159,47)
# pink: rgb(224,0,109)
# purple: rgb(74,20,106)

fid = open(args.svgfilestr,'w');
fid.write('<?xml version="1.0" standalone="no"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"\nviewBox = "0 0 ' + repr(H*C) + ' ' + repr(V*R) + '" version = "1.1">\n<defs><path id="arrow" d="M -7 -7 L 0 0 L -7 7"/>\n</defs>\n')
# <path id="arrow" d="M -7 -7 L 0 0 L -7 7 L -7 4 L -3 0 L -7 -4 L -7 -7 L 0 0"/>
# <path id="arrowb" d="M -7 -7 L 0 0 L -7 7 L -7 4 L -3 0 L -7 -4 L -7 -7 L 0 0" stroke="blue" fill="blue"/>

x = 0
y = 0

for svgi in range(len(m)):
  if m[svgi]['type']==1:  # 2-segment initiator
    fid.write('<g stroke = "rgb(139,98,61)" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} L {2} {3}"/>\n'.format(x+H*.3,y+V*.5,x+H*.6,y+V*.5))
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.3,y+V*.5,x+H*.3,y+V*.5))
    else:
      fid.write('<use x="{0}" y="{1}" xlink:href="#arrow"/>\n'.format(x+H*.6,y+V*.5))
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    for svgj in range(2):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+H*.37+H*.15*svgj,y+V*.5-V*.05,s))
    fid.write('</g>\n')

  elif m[svgi]['type']==2:  # 3-segment initiator
    fid.write('<g stroke = "rgb(139,98,61)" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} L {2} {3}"/>\n'.format(x+H*.15,y+V*.5,x+H*.6,y+V*.5))
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.5,x+H*.15,y+V*.5))
    else:
      fid.write('<use x="{0}" y="{1}" xlink:href="#arrow"/>\n'.format(x+H*.6,y+V*.5))
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    for svgj in range(3):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+H*.22+H*.15*svgj,y+V*.45,s))
    fid.write('</g>\n')

  elif m[svgi]['type']== 3:  # one-output circle (4 segments) (blue output)
    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
    for svgj in range(1,SEGLEN+1):  # draw cross-lines for paired bases; 1 matching segment
      fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.45+H*.15*svgj/SEGLEN,y+V*.45,x+H*.45+H*.15*svgj/SEGLEN,y+V*.5))
    fid.write('</g>\n')
    fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} a {2} {3} 0 1 1 {4} {5} L {6} {7}" stroke="rgb(69,181,215)"/>\n'.format(x+H*.6,y+V*.45,H*.07,V*.25,0,V*.05,x+H*.45,y+V*.5))  # blue loop and bottom line
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.3,y+V*.45,x+H*.6,y+V*.45))  # yellow top line
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.3,y+V*.45,x+H*.3,y+V*.45))
    else:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(69,181,215)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.45,y+V*.5,x+H*.45,y+V*.5))
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    labelx = [H*i for i in [.37,.52,.7,.52]]
    labely = [V*i for i in [.4,.4,.8,.6]]
    for svgj in range(4):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+labelx[svgj],y+labely[svgj],s))
    fid.write('</g>\n')
   
  elif m[svgi]['type']== 4:  # two-output circle (9 segments) (green,blue outputs)
    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
    for svgj in range(1,SEGLEN*2+1):  # draw cross-lines for paired bases; 2 matching segments
      fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.3+H*.15*svgj/SEGLEN,y+V*.45,x+H*.3+H*.15*svgj/SEGLEN,y+V*.5))
    fid.write('</g>\n')
    fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} a {2} {3} 0 1 1 {4} {5} L {6} {7}" stroke="rgb(69,181,215)"/>\n'.format(x+H*.6,y+V*.45,H*.085,V*.25,0,V*.05,x+H*.45,y+V*.5))  # blue loop and bottom line
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.15,y+V*.45,x+H*.6,y+V*.45))  # yellow top line
    fid.write('<path d = "M {0} {1} L {2} {3} L {4} {5}" stroke = "rgb(0,159,47)"/>\n'.format(x+H*.45,y+V*.5,x+H*.3,y+V*.5,x+H*.15,y+V*.8))  # green bottom line
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.45,x+H*.15,y+V*.45))  # yellow top arrow
    else:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(0,159,47)" xlink:href="#arrow" transform="rotate({2},{3},{4})"/>\n'.format(x+H*.15,y+V*.8,90+180/pi*atan2(V*.3,H*.15),x+H*.15,y+V*.8))  # green bottom arrow
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    labelx = [H*i for i in [.22,.37,.52,.75,.75,.52,.37,.27,.22]]
    labely = [V*i for i in [.4,.4,.4,.3,.7,.6,.6,.7,.8]]
    for svgj in range(9):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+labelx[svgj],y+labely[svgj],s))
    fid.write('</g>\n')
 
  elif m[svgi]['type']== 5:  # one-output circle (6 segments) (pink output)
    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
    for svgj in range(1,SEGLEN*2+1):  # draw cross-lines for paired bases; 2 matching segments
      fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.3+H*.15*svgj/SEGLEN,y+V*.45,x+H*.3+H*.15*svgj/SEGLEN,y+V*.5))
    fid.write('</g>\n')
    fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} a {2} {3} 0 1 1 {4} {5}" stroke="rgb(224,0,109)"/>\n'.format(x+H*.6,y+V*.45,H*.05,V*.25,0,V*.05))  # pink loop
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.15,y+V*.45,x+H*.6,y+V*.45))  # yellow top line
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "black"/>\n'.format(x+H*.3,y+V*.5,x+H*.6,y+V*.5))  # black bottom line
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.45,x+H*.15,y+V*.45))  # yellow top arrow
    else:
      fid.write('<use x="{0}" y="{1}" stroke="black" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.3,y+V*.5,x+H*.3,y+V*.5))  # black bottom arrow
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    labelx = [H*i for i in [.22,.37,.52,.68,.52,.37]]
    labely = [V*i for i in [.4,.4,.4,.8,.6,.6]]
    for svgj in range(6):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+labelx[svgj],y+labely[svgj],s))
    fid.write('</g>\n')
   
  elif m[svgi]['type']== 6:  # three-output circle (10 segments) (green,blue,pink outputs)
    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
    for svgj in range(1,SEGLEN*2+1):  # draw cross-lines for paired bases; 2 matching segments
      fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.3+H*.15*svgj/SEGLEN,y+V*.45,x+H*.3+H*.15*svgj/SEGLEN,y+V*.5))
    fid.write('</g>\n')
    fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} a {2} {3} 0 0 1 {4} {5}" stroke="rgb(224,0,109)"/>\n'.format(x+H*.6,y+V*.45,H*.1,V*.25,H*.1*sqrt(.99),V*(.05/2-.25)))  # pink loop
    fid.write('<path d = "M {0} {1} a {2} {3} 0 1 1 {4} {5} L {6} {7}" stroke="rgb(69,181,215)"/>\n'.format(x+H*.6+H*.1*sqrt(.99),y+V*(.45+.05/2-.25),H*.1,V*.25,-H*.1*sqrt(.99),V*(.25+.05/2),x+H*.45,y+V*.5))  # blue loop and bottom line
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.15,y+V*.45,x+H*.6,y+V*.45))  # yellow top line
    fid.write('<path d = "M {0} {1} L {2} {3} L {4} {5}" stroke = "rgb(0,159,47)"/>\n'.format(x+H*.45,y+V*.5,x+H*.3,y+V*.5,x+H*.15,y+V*.8))  # green bottom line
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.45,x+H*.15,y+V*.45))  # yellow top arrow
    else:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(0,159,47)" xlink:href="#arrow" transform="rotate({2},{3},{4})"/>\n'.format(x+H*.15,y+V*.8,90+180/pi*atan2(V*.3,H*.15),x+H*.15,y+V*.8))  # green bottom arrow
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    labelx = [H*i for i in [.22,.37,.52,.57,.78,.78,.52,.37,.27,.22]]
    labely = [V*i for i in [.4,.4,.4,.3,.3,.7,.6,.6,.7,.8]]
    for svgj in range(10):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+labelx[svgj],y+labely[svgj],s))
    fid.write('</g>\n')

  elif m[svgi]['type']==7:  # two-output circle (7 segments) (purple,blue outputs)
    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
    for svgj in range(1,SEGLEN*2+1):  # draw cross-lines for paired bases; 2 matching segments
      fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.3+H*.15*svgj/SEGLEN,y+V*.45,x+H*.3+H*.15*svgj/SEGLEN,y+V*.5))
    fid.write('</g>\n')
    fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} a {2} {3} 0 1 1 {4} {5} L {6} {7}" stroke="rgb(69,181,215)"/>\n'.format(x+H*.6,y+V*.45,H*.085,V*.25,0,V*.05,x+H*.45,y+V*.5))  # blue loop and bottom line
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.15,y+V*.45,x+H*.6,y+V*.45))  # yellow top line
    fid.write('<path d = "M {0} {1} L {2} {3}" stroke = "rgb(74,20,106)"/>\n'.format(x+H*.45,y+V*.5,x+H*.3,y+V*.5))  # purple bottom line
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.45,x+H*.15,y+V*.45))  # yellow top arrow
    else:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(74,20,106)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.3,y+V*.5,x+H*.3,y+V*.5))  # purple bottom arrow
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    labelx = [H*i for i in [.22,.37,.52,.75,.75,.52,.37]]
    labely = [V*i for i in [.4,.4,.4,.3,.7,.6,.6]]
    for svgj in range(7):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+labelx[svgj],y+labely[svgj],s))
    fid.write('</g>\n')
  
  elif m[svgi]['type']== 8:  # two-output circle (8 segments) (green,purple outputs)
    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
    for svgj in range(1,SEGLEN*2+1):  # draw cross-lines for paired bases; 2 matching segments
      fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.3+H*.15*svgj/SEGLEN,y+V*.45,x+H*.3+H*.15*svgj/SEGLEN,y+V*.5))
    fid.write('</g>\n')
    fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} a {2} {3} 0 1 1 {4} {5} L {6} {7}" stroke="rgb(74,20,106)"/>\n'.format(x+H*.6,y+V*.45,H*.05,V*.25,0,V*.05,x+H*.45,y+V*.5))  # purple loop and bottom line
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.15,y+V*.45,x+H*.6,y+V*.45))  # yellow top line
    fid.write('<path d = "M {0} {1} L {2} {3} L {4} {5}" stroke = "rgb(0,159,47)"/>\n'.format(x+H*.45,y+V*.5,x+H*.3,y+V*.5,x+H*.15,y+V*.8))  # green bottom line
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.45,x+H*.15,y+V*.45))  # yellow top arrow
    else:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(0,159,47)" xlink:href="#arrow" transform="rotate({2},{3},{4})"/>\n'.format(x+H*.15,y+V*.8,90+180/pi*atan2(V*.3,H*.15),x+H*.15,y+V*.8))  # green bottom arrow
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    labelx = [H*i for i in [.22,.37,.52,.68,.52,.37,.27,.22]]
    labely = [V*i for i in [.4,.4,.4,.8,.6,.6,.7,.8]]
    for svgj in range(8):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+labelx[svgj],y+labely[svgj],s))
    fid.write('</g>\n')

  elif m[svgi]['type']== 9:  # one-output circle (6 segments) (purple output)
    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
    for svgj in range(1,SEGLEN*2+1):  # draw cross-lines for paired bases; 2 matching segments
      fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.3+H*.15*svgj/SEGLEN,y+V*.45,x+H*.3+H*.15*svgj/SEGLEN,y+V*.5))
    fid.write('</g>\n')
    fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} a {2} {3} 0 1 1 {4} {5} L {6} {7}" stroke="rgb(74,20,106)"/>\n'.format(x+H*.6,y+V*.45,H*.05,V*.25,0,V*.05,x+H*.45,y+V*.5))  # pink loop and bottom line
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.15,y+V*.45,x+H*.6,y+V*.45))  # yellow top line
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "black"/>\n'.format(x+H*.3,y+V*.5,x+H*.45,y+V*.5))  # black bottom line
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.45,x+H*.15,y+V*.45))  # yellow top arrow
    else:
      fid.write('<use x="{0}" y="{1}" stroke="black" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.3,y+V*.5,x+H*.3,y+V*.5))  # black bottom arrow
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    labelx = [H*i for i in [.22,.37,.52,.68,.52,.37]]
    labely = [V*i for i in [.4,.4,.4,.8,.6,.6]]
    for svgj in range(6):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+labelx[svgj],y+labely[svgj],s))
    fid.write('</g>\n')
   
  elif m[svgi]['type']== 19:  # one-output circle (6 segments, blue output)
    fid.write('<g stroke = "black" stroke-width = "1" fill = "none">\n')
    for svgj in range(1,SEGLEN*2+1):  # draw cross-lines for paired bases; 2 matching segments
      fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}"/>\n'.format(x+H*.3+H*.15*svgj/SEGLEN,y+V*.45,x+H*.3+H*.15*svgj/SEGLEN,y+V*.5))
    fid.write('</g>\n')
    fid.write('<g stroke = "black" stroke-width = "2" fill = "none">\n<path d = "M {0} {1} a {2} {3} 0 1 1 {4} {5}" stroke="rgb(69,181,215)"/>\n'.format(x+H*.6,y+V*.45,H*.05,V*.25,0,V*.05))  # blue loop
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(241,139,17)"/>\n'.format(x+H*.15,y+V*.45,x+H*.6,y+V*.45))  # yellow top line
    fid.write('<line x1 = "{0}" y1 = "{1}" x2 = "{2}" y2 = "{3}" stroke = "rgb(69,181,215)"/>\n'.format(x+H*.3,y+V*.5,x+H*.6,y+V*.5))  # blue bottom line [not bothering to combine with loop]
    if m[svgi]['polarity']==-1:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(241,139,17)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.15,y+V*.45,x+H*.15,y+V*.45))  # yellow top arrow
    else:
      fid.write('<use x="{0}" y="{1}" stroke="rgb(69,181,215)" xlink:href="#arrow" transform="rotate(180,{2},{3})"/>\n'.format(x+H*.3,y+V*.5,x+H*.3,y+V*.5))  # blue bottom arrow
    fid.write('</g>\n<g stroke="none" fill="black" font-size="16">\n')
    labelx = [H*i for i in [.22,.37,.52,.68,.52,.37]]
    labely = [V*i for i in [.4,.4,.4,.8,.6,.6]]
    for svgj in range(6):
      svgk = labels[m[svgi]['ofs']+svgj]
      if svgk>0:
        s = repr(svgk)
      else:
        s = repr(-svgk) + '*'
      fid.write('<text x="{0}" y="{1}" stroke="none" fill="black">{2}</text>\n'.format(x+labelx[svgj],y+labely[svgj],s))
    fid.write('</g>\n')

  fid.write('<text x="{0}" y="{1}" font-size="20" stroke-width="1" fill="black" stroke="none">M{2}</text>\n'.format(x+H*.8, y+V*.5, svgi+1))
  y += V
  if y>=V*R:
    y=0
    x += H
fid.write('</svg>\n')
fid.close()
