
JS_FILES = src/LICENSE src/header.js \
	src/network.js src/plus.js src/attribution.js \
	src/core.js
#	src/campaign.js \


all: deed-dbg.js deed.js

deed-dbg.js: $(JS_FILES)
	cat $(JS_FILES) > deed-dbg.js

deed.js: deed-dbg.js
	java -jar ./lib/yuicompressor-2.4.1.jar deed-dbg.js > deed.js

verbose: deed-dbg.js
	java -jar ./lib/yuicompressor-2.4.1.jar -v deed-dbg.js > deed.js

clean:
	rm deed.js deed-dbg.js