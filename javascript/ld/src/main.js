/* Define linked data support */

YAHOO.namespace("cc.ld");

YAHOO.cc.ld.define_modules = function (loader) {
    // define additional modules on an instance of YUI Loader 

    var UBIQUITY_RDFA_BASE = "http://ubiquity-rdfa.googlecode.com/svn/tags/0.7.2/lib/";

    loader.addModule({ name: "ubiquity-backplane",      
		type: "js",  
		fullpath: "http://ubiquity-backplane.googlecode.com/svn/tags/0.4.5/backplane-loader.js" });
    loader.addModule({ name: "ubiquity-threads",        
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "_backplane/threads.js" });
    loader.addModule({ name: "ubiquity-notify",         
		type: "js",  
		fullpath: "http://ubiquity-message.googlecode.com/svn/tags/0.5/lib/message-loader.js" });

    loader.addModule({ name: "ubiquity-rdfparser",      
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "RDFParser.js",
		requires: [ "ubiquity-backplane" ] });
                
    loader.addModule({ name: "ubiquity-rdfgraph",       
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "RDFGraph.js" });
                
    loader.addModule({ name: "ubiquity-rdfstore",       
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "RDFStore.js",
		requires: [ "ubiquity-rdfgraph" ] });
                
    loader.addModule({ name: "ubiquity-rdfquery",       
		type: "js",  
		fullpath: UBIQUITY_RDFA_BASE + "RDFQuery.js",
		requires: [ "dom", "container", "ubiquity-rdfstore" ] });
                
} // load_modules

    YAHOO.cc.ld.request_success = function (response) {


	if (response.status != 200) return;

	var metadata = YAHOO.lang.JSON.parse(response.responseText);

	// create the store and add the RDF assertions
	store = new RDFStore();


	for (var s_idx in metadata.subjects) {
	    s = metadata.subjects[s_idx];
	    for (var p in metadata.triples[s]) {
		for (var o_idx in metadata.triples[s][p]) {
		    o = metadata.triples[s][p][o_idx];
		    store.add(null, s, p, o, false, null);
		}
	    }
	}

	response.argument.success(store);

    } // cc.ld.request_success

YAHOO.cc.ld.request_failure = function (o) {

    o.argument.failure(o.status);

} // failure


    YAHOO.cc.ld.load = function (url, proxy_path, parse_callback) {
	// pass the URL to the linked_data proxy and return 
	// an RDF Store with the triples we find loaded in it

	// construct the request callback
	var callback = {
	    success: YAHOO.cc.ld.request_success,
	    failure: YAHOO.cc.ld.request_failure,
	    argument: parse_callback
	};

	// initialize the header to include the Referer
	YAHOO.util.Connect.initHeader('Referer', document.URL, true);

	var url = proxy_path + '?url=' + encodeURIComponent(url);
	YAHOO.util.Connect.asyncRequest('GET', url, callback, null);

    } // load

	YAHOO.cc.ld.finish_init = function() {

	    // we've loaded our dependencies, register the module
	    YAHOO.register("cc.ld", YAHOO.cc.ld, {version:'0.1', build:'001'});
	}

(
 function() {

     // load dependencies and initialize MTA handling
     loader = new YAHOO.util.YUILoader({onSuccess:YAHOO.cc.ld.finish_init});
     basePath = pathToModule("ld");
     YAHOO.cc.ld.define_modules(loader);

     loader.require("json");
     loader.require("connection");
     loader.require("ubiquity-rdfquery");
     loader.require("ubiquity-rdfstore");
     loader.require("ubiquity-rdfparser");
     
     loader.insert();

 }()
); // init


