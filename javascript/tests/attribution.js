YAHOO.cc.test.attribution = new YAHOO.tool.TestCase({
    
        name: "Attribution Tests",
        
        //---------------------------------------------
        // Setup and tear down
        //---------------------------------------------
        
        setUp : function () {

	    YAHOO.util.Dom.get("attribution-container").innerHTML = "";
	    YAHOO.util.Dom.get("work-attribution").value = "";
        },
    
        tearDown : function () {

        },

        //---------------------------------------------
        // Tests
        //---------------------------------------------

	testNoMetadata: function () {

	    // if no metadata is specified for the referrer we
	    // expect the insertion function to complete with no
	    // action or errors
	    YAHOO.cc.attribution.add_copy_paste({
		    "http://example.org/test.html":[]
		}, 
		"http://example.org/test.html");

	    YAHOO.util.Assert.areEqual(YAHOO.util.Dom.get("work-attribution").value, 
				       "",
				       "work-attribution should do nothing.");


	    // store the initial value of attribution-container
	    YAHOO.cc.attribution.add_details({
		    "http://example.org/test.html":[]
		}, 
		"http://example.org/test.html");
	    YAHOO.util.Assert.areEqual(YAHOO.util.Dom.get("attribution-container").innerHTML,
				       "",
				       "attribution-containershould be empty.");
	},

	testAttribNameOnly : function () {

	    // if only a URL is provided, no details are added
	    var initial = YAHOO.util.Dom.get("attribution-container").innerHTML;
	    var metadata = {
		"http://example.org/test.html":{
		    "http://creativecommons.org/ns#attributionName":
		    ["Dr. Frank N. Furter"],
		},
	    };
	    YAHOO.cc.attribution.add_details(metadata, 
					     "http://example.org/test.html");
	    YAHOO.util.Assert.areEqual(YAHOO.util.Dom.get("attribution-container").innerHTML,
				       initial,
				       "attribution-container should be unchanged when only the name is provided.");

	    // ...but copy and paste metadata *is* created
	    YAHOO.cc.attribution.add_copy_paste(metadata, 
						"http://example.org/test.html");
	    YAHOO.util.Assert.isTrue(YAHOO.util.Dom.get("work-attribution").value.indexOf("Dr. Frank N. Furter") > -1);
	    
	},

	testAttribURLOnly : function() {

	    // if only a name is provided, no details are added
	    var initial = YAHOO.util.Dom.get("attribution-container").innerHTML;
	    var metadata = {
		"http://example.org/test.html":{
		    "http://creativecommons.org/ns#attributionURL":
		    ["http://example.org/~furter"],
		},
	    };
	    YAHOO.cc.attribution.add_details(metadata, 
					     "http://example.org/test.html");
	    YAHOO.util.Assert.areEqual(YAHOO.util.Dom.get("attribution-container").innerHTML,
				       initial,
				       "attribution-container should be unchanged when only the name is provided.");

	    // ...but copy and paste metadata *is* created
	    YAHOO.cc.attribution.add_copy_paste(metadata, 
						"http://example.org/test.html");
	    YAHOO.util.Assert.isTrue(YAHOO.util.Dom.get("work-attribution").value.indexOf("http://example.org/~furter") > -1);

	},

	testAttribution : function() {

	    // if only a name and URL are provided, 
	    // attribution details are displayed
	    var initial = YAHOO.util.Dom.get("attribution-container").innerHTML;
	    var metadata = {
		"http://example.org/test.html":{
		    "http://creativecommons.org/ns#attributionURL":
		    ["http://example.org/furter"],
		    "http://creativecommons.org/ns#attributionName":
		    ["Dr Frank N. Furter"],
		},
	    };
	    YAHOO.cc.attribution.add_details(metadata, 
					     "http://example.org/test.html");
	    var attrib_html = YAHOO.util.Dom.get("attribution-container").innerHTML;

	    YAHOO.util.Assert.areNotEqual(attrib_html, initial);
	    YAHOO.util.Assert.isTrue(attrib_html.indexOf("http://example.org/furter") > -1,
				     "Attribution URL is not present.");
	    YAHOO.util.Assert.isTrue(attrib_html.indexOf("Dr Frank N. Furter") > -1,
				     "Attribution name is not present.");


	    // ...but copy and paste metadata *is* created
	    YAHOO.cc.attribution.add_copy_paste(metadata, 
						"http://example.org/test.html");
	    YAHOO.util.Assert.isTrue(YAHOO.util.Dom.get("work-attribution").value.indexOf("http://example.org/furter") > -1);

	},

	testMultipleAttribution : function() {

	    // if multiple attribution assertions are provided, do nothing

	    // if only a name and URL are provided, 
	    // attribution details are displayed
	    var metadata = {
		"http://example.org/test.html":{
		    "http://creativecommons.org/ns#attributionURL":
		    ["http://example.org/furter",
		     "http://example.com/furter"],
		    "http://creativecommons.org/ns#attributionName":
		    ["Dr Frank N. Furter",
		     "Frankie"],
		},
	    };
	    YAHOO.cc.attribution.add_details(metadata, 
					     "http://example.org/test.html");
	    var attrib_html = YAHOO.util.Dom.get("attribution-container").innerHTML;

	    YAHOO.util.Assert.areEqual("", attrib_html);


	    // ...but copy and paste metadata *is* created
	    YAHOO.cc.attribution.add_copy_paste(metadata, 
						"http://example.org/test.html");
	    YAHOO.util.Assert.areEqual("", 
				       YAHOO.util.Dom.get("work-attribution").value,
				       "work-attribution should be empty.");

	},
    });

// add the test case to the test suite
YAHOO.cc.test.suite.add(YAHOO.cc.test.attribution);
