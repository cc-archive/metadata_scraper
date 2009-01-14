YAHOO.cc.test.network = new YAHOO.tool.TestCase({
	
	name: "CC Network Test Case",
        
        //---------------------------------------------
        // Setup and tear down
        //---------------------------------------------
        
        setUp : function () {

        },
    
        tearDown : function () {

	    if (YAHOO.util.Dom.get("network")) {
		var n = YAHOO.util.Dom.get("network");
		n.parentNode.removeChild(n);
	    }

        },

        //---------------------------------------------
        // Tests
        //---------------------------------------------

	NETWORK_URI: "http://network.example.org",

	testLookupServiceUri: function() {

	    // Given the network URI, make sure the correct
	    // lookup service is returned

	    var network_uri = "http://network.example.org";
	    var work_uri = "http://example.org/blog.html";

	    var metadata = {
		"http://network.example.org":{
		    "http://rdfs.org/sioc/services#has_service":
		    ["http://network.example.org/lookup"],
		},
		"http://network.example.org/lookup":{
		    "http://rdfs.org/sioc/services#service_protocol":
		    ["http://wiki.creativecommons.org/work-lookup"],
		},
	    };

	    var lookup_target = 
	        YAHOO.cc.network.lookup_uri(metadata, network_uri, work_uri);

	    YAHOO.util.Assert.areEqual(lookup_target, 
				       "http://network.example.org/lookup?uri=" + work_uri);

	},

	testLookupServiceUriWithoutProtocol: function() {

	    // if the protocol is not specified, the lookup should return null

	    var network_uri = "http://network.example.org";
	    var work_uri = "http://example.org/blog.html";

	    var metadata = {
		"http://network.example.org":{
		    "http://rdfs.org/sioc/services#has_service":
		    ["http://network.example.org/lookup"],
		},
	    };

	    var lookup_target = 
	        YAHOO.cc.network.lookup_uri(metadata, network_uri, work_uri);

	    YAHOO.util.Assert.isNull(lookup_target);
	},

	testAbsentLookupServiceUri: function() {
	    
	    // if no service URI is available, make sure
	    // null is returned

	    var network_uri = "http://network2.example.org";
	    var work_uri = "http://example.org/blog.html";

	    var metadata = {
		"http://network.example.org":{
		    "http://rdfs.org/sioc/services#has_service":
		    ["http://network.example.org/lookup"],
		},
		"http://network.example.org/lookup":{
		    "http://rdfs.org/sioc/services#has_service":
		    ["http://wiki.creativecommons.org/work-lookup"],
		},
	    };

	    // metadata provided for network.ex.org; 
	    // we're asking about network2.ex.org
	    var lookup_target = 
	        YAHOO.cc.network.lookup_uri(metadata, network_uri, work_uri);

	    YAHOO.util.Assert.isNull(lookup_target);

	},

	testMatchIriSetSimple: function() {

	    // match_iriset should return true when a match is found

	    var iri_node = "aJlzyVKj551";
	    var test_subject = "http://yergler.net/test.html";

	    var metadata = {"aJlzyVKj551": {
		    "http://www.w3.org/2007/05/powder#includeregex": 
		    ["\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]*)(\\:([0-9]+))?(\\/)", "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]+\\.)?(yergler\\.net)(\\:([0-9]+))?\\/", "^(http)\\:\\/\\/"]
		},
	    };

	    YAHOO.util.Assert.isTrue(
	       YAHOO.cc.network.match_iriset(metadata, iri_node, test_subject)
				     );

	},

	testMatchIriSetFailed: function() {

	    // if no match is found, match_iriset should return false

	    var iri_node = "aJlzyVKj551";
	    var test_subject = "https://yergler.net/test.html";

	    var metadata = {"aJlzyVKj551": {
		    "http://www.w3.org/2007/05/powder#includeregex": 
		    ["\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]*)(\\:([0-9]+))?(\\/)", "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]+\\.)?(yergler\\.net)(\\:([0-9]+))?\\/", "^(http)\\:\\/\\/"]
		},
	    };

	    YAHOO.util.Assert.isFalse(
	       YAHOO.cc.network.match_iriset(metadata, iri_node, test_subject)
				     );

	},

	testMatchIriSetMixed: function() {

	    // make sure an IRI set containing both includes and
	    // excludes is handled correctly

	    var iri_node = "aJlzyVKj551";

	    var metadata = {"aJlzyVKj551": {
		    "http://www.w3.org/2007/05/powder#includeregex": 
		    ["\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]*)(\\:([0-9]+))?(\\/)", "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]+\\.)?(yergler\\.net)(\\:([0-9]+))?\\/", "^(http)\\:\\/\\/"],
		    "http://www.w3.org/2007/05/powder#excluderegex": 
		    ["\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]+\\.)?(yergler\\.net)(\\:([0-9]+))?\\/testing\\/",],
		},
	    };

	    YAHOO.util.Assert.isTrue(
	       YAHOO.cc.network.match_iriset(metadata, iri_node, 
					     "http://yergler.net/test.html")
				      );
	    YAHOO.util.Assert.isFalse(
	       YAHOO.cc.network.match_iriset(metadata, iri_node, 
					     "http://yergler.net/testing/index.html")
				      );

	},


	testProcessMetadata: function() {

	    // make sure the reciprocal relationship is properly detected
	    var work = "http://example.com/work.html";

	    var metadata = {
		"http://example.com/work.html":{
		    "http://rdfs.org/sioc/ns#has_owner":
		    ["http://network.example.com/username/"],
		},
		"http://network.example.com/username/":{
		    "http://rdfs.org/sioc/ns#owner_of":
		    ["http://example.com/work.html"],
		    "http://rdfs.org/sioc/ns#name":["A. User"],
		    "http://rdfs.org/sioc/ns#member_of":
		    ["http://network.example.com"],
		},
		"http://network.example.com":{
		    "http://purl.org/dc/terms/title":["Test Network"],
		},
	    };

	    YAHOO.cc.network.process_metadata(metadata, work);

	    // get a handle to the "network" module that should be created
	    var inserted = YAHOO.util.Dom.get("network");
	    YAHOO.util.Assert.isNotNull(inserted);

	},


	testProcessMetadata_noReciprocal: function() {

	    // make sure the reciprocal relationship is properly detected
	    // if the ownership metadata is not present, not text
	    // should be added

	    var work = "http://example.com/work.html";

	    var metadata = {
		"http://example.com/work.html":{
		    /*		    "http://rdfs.org/sioc/ns#has_owner":
				    ["http://network.example.com/username/"],*/
		},
		"http://network.example.com/username/":{
		    "http://rdfs.org/sioc/ns#owner_of":
		    ["http://example.com/work.html"],
		    "http://rdfs.org/sioc/ns#name":["A. User"],
		    "http://rdfs.org/sioc/ns#member_of":
		    ["http://network.example.com"],
		},
		"http://network.example.com":{
		    "http://purl.org/dc/terms/title":["Test Network"],
		},
	    };

	    YAHOO.cc.network.process_metadata(metadata, work);

	    // get a handle to the "network" module that should be created
	    var inserted = YAHOO.util.Dom.get("network");
	    YAHOO.util.Assert.isNull(inserted);
	},

    });

// add the test case to the test suite
YAHOO.cc.test.suite.add(YAHOO.cc.test.network);
