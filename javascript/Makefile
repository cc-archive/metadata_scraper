
JS_FILES = src/LICENSE src/namespaces.js src/header.js \
	src/network.js src/plus.js src/attribution.js \
	src/core.js
#	src/campaign.js \

LD_FILES = modules.js ld/src/main.js

all: deed-dbg.js deed.js ld.js

ld.js: $(LD_FILES)
	cat $(LD_FILES) > ld.js
	cat src/bootstrap.js ld/src/bootstrap.js > ld-bootstrap.js

deed-dbg.js: $(JS_FILES)
	cat $(JS_FILES) > deed-dbg.js

deed.js: deed-dbg.js
	java -jar ./lib/yuicompressor-2.4.1.jar deed-dbg.js > deed.js

verbose: deed-dbg.js
	java -jar ./lib/yuicompressor-2.4.1.jar -v deed-dbg.js > deed.js

clean:
	rm deed.js deed-dbg.js ld/ld.js ld/ld-bootstrap.js mta/mta.js mta/mta-bootstrap.js
	touch modules.js