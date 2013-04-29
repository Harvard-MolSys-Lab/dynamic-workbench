define \n
endef

SOURCES=index overview quickstart server files applications behavioral nodal dynaml dil pepper sequence sequence-edit web-dd simulation-analysis nupack customization scripting application-development
SOURCES_MD=$(addsuffix .md,$(SOURES))
HTML_OUTS=$(addprefix html/,$(SOURCES))

.PHONY: html

html: $(SOURCES_MD)
	mkdir -p ./html
	$(foreach filename,$(SOURCES),pandoc --from=markdown --to=html -o html/$(filename).html $(filename).md;) 

manual.pdf: $(SOURCES_MD)
	pandoc --latex-engine=xelatex --number-sections --chapters -o manual.pdf $(SOURCES)

manual.tex: $(SOURCES_MD)
	pandoc --latex-engine=xelatex --number-sections --chapters --from=markdown --to=latex -o manual.tex $(SOURCES)