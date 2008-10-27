
JS_FILES = src/LICENSE src/namespaces.js src/header.js \
	src/network.js src/plus.js src/attribution.js \
	src/campaign.js \
	src/core.js

all: deed-dbg.js deed.js

deed-dbg.js: $(JS_FILES)
	cat $(JS_FILES) > deed-dbg.js

deed.js: deed-dbg.js
	java -jar ./lib/yuicompressor-2.3.6.jar deed-dbg.js > deed.js

verbose: deed-dbg.js
	java -jar ./lib/yuicompressor-2.3.6.jar -v deed-dbg.js > deed.js
