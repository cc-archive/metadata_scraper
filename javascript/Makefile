YUI_COMPRESS_JAR = ./lib/yuicompressor-2.4.2.jar

JS_FILES = src/LICENSE src/namespaces.js src/header.js \
	src/network.js src/plus.js src/attribution.js \
	src/core.js
#	src/campaign.js \

LD_FILES = src/ubiquity-rdfa/lib/RDFGraph.js \
	src/blank_line.js \
	src/ubiquity-rdfa/lib/RDFStore.js \
	src/blank_line.js \
	src/ubiquity-rdfa/lib/RDFQuery.js \
	src/blank_line.js \
	src/ld/main.js

DEED_FILES = src/deed/main.js \
	src/deed/queries.js

all: deed-dbg.js deed.js ld-min.js deed-sparql.js deed-sparql-min.js

ld-min.js: ld.js
	java -jar $(YUI_COMPRESS_JAR) ld.js > ld-min.js

ld.js: $(LD_FILES)
	cat $(LD_FILES) > ld.js.tmp
	cat ld.js.tmp | grep -v debugger > ld.js
	rm ld.js.tmp

deed-sparql-min.js: deed-sparql.js
	java -jar $(YUI_COMPRESS_JAR) deed-sparql.js > deed-sparql-min.js

deed-sparql.js: $(DEED_FILES)
	cat $(DEED_FILES) > deed-sparql.js.tmp
	cat deed-sparql.js.tmp | grep -v debugger > deed-sparql.js
	rm deed-sparql.js.tmp

deed-dbg.js: $(JS_FILES)
	cat $(JS_FILES) > deed-dbg.js

deed.js: deed-dbg.js
	java -jar $(YUI_COMPRESS_JAR) deed-dbg.js > deed.js

verbose: deed-dbg.js
	java -jar $(YUI_COMPRESS_JAR) -v deed-dbg.js > deed.js

clean:
	rm deed.js deed-dbg.js ld.js ld-min.js deed-sparql.js deed-sparql-min.js
