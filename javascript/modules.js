YAHOO.namespace("cc.modules");

YAHOO.cc.modules.add_definitions = function(loader, basePath) {
    // add module definitions to the loader, using basePath as the root

    loader.addModule({name: "cc.ld",
		type: "js",
		fullpath: "http://mirrors.creativecommons.org/software/ld/ld.js" 
		});

} // add_definitions

