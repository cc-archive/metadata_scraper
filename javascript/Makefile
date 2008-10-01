
JS_FILES = src/LICENSE src/header.js src/plus.js src/attribution.js src/core.js

all: deed-dbg.js deed.js

deed-dbg.js: $(JS_FILES)
	cat $(JS_FILES) > deed-dbg.js

deed.js: deed-dbg.js
	java -jar ./lib/yuicompressor-2.3.6.jar deed-dbg.js > deed.js


