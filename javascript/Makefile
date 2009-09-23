YUI_COMPRESS_JAR = ./lib/yuicompressor-2.4.2.jar

JS_FILES = src/LICENSE src/namespaces.js src/header.js \
	src/network.js src/plus.js src/attribution.js \
	src/core.js
#	src/campaign.js \

LD_FILES = ld/src/ubiquity-rdfa/lib/RDFGraph.js \
	ld/src/blank_line.js \
	ld/src/ubiquity-rdfa/lib/RDFStore.js \
	ld/src/blank_line.js \
	ld/src/ubiquity-rdfa/lib/RDFQuery.js \
	ld/src/blank_line.js \
	ld/src/main.js

all: deed-dbg.js deed.js ld-min.js

ld-min.js: ld.js
	java -jar $(YUI_COMPRESS_JAR) ld.js > ld-min.js

ld.js: $(LD_FILES)
	cat $(LD_FILES) > ld.js
	cat ld.js | grep -v debugger > ld.js

deed-dbg.js: $(JS_FILES)
	cat $(JS_FILES) > deed-dbg.js

deed.js: deed-dbg.js
	java -jar $(YUI_COMPRESS_JAR) deed-dbg.js > deed.js

verbose: deed-dbg.js
	java -jar $(YUI_COMPRESS_JAR) -v deed-dbg.js > deed.js

clean:
	rm deed.js deed-dbg.js ld/ld.js ld/ld-bootstrap.js mta/mta.js mta/mta-bootstrap.js
	touch modules.js