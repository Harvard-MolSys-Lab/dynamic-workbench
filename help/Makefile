# help/Makefile
# TO BE RUN ON GUEST VM
# From host, run:
# 
#    make help

SOURCES=manual quickstart overview files applications behavioral nodal pepper segment dil pil sequence sequence-edit nupack multisubjective simulation-analysis enumerator nupack rnafold mfold utilities customization server scripting application-development
SOURCES_MD=$(addsuffix .md,$(SOURCES))
HTML_OUTS=$(addprefix html/,$(SOURCES))

.PHONY: html
.PHONY: all

all : html manual.pdf
	
html: $(SOURCES_MD)
	mkdir -p ./html
	$(foreach filename,$(SOURCES),pandoc --from=markdown --to=html -o html/$(filename).html $(filename).md;) 

manual.pdf: $(SOURCES_MD) manual.md
	pandoc --latex-engine=xelatex --toc --number-sections --chapters -o manual.pdf $(SOURCES_MD)

manual.tex: $(SOURCES_MD)
	pandoc --latex-engine=xelatex --number-sections --chapters --from=markdown --to=latex -o manual.tex $(SOURCES)