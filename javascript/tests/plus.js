YAHOO.cc.test.plus = new YAHOO.tool.TestCase({
	
	name: "CC+ Test Case",
        
        //---------------------------------------------
        // Setup and tear down
        //---------------------------------------------
        
        setUp : function () {
	    this.more = YAHOO.util.Dom.get("more-container");
	    
        },
    
        tearDown : function () {

	    // reset the dummy "more-container"
	    this.more.innerHTML = "";

        },

        //---------------------------------------------
        // Tests
        //---------------------------------------------

	testNoCcPlus: function () {

	    // if no metadata is specified for the referrer we
	    // expect the insertion function to complete with no
	    // action or errors
	    YAHOO.cc.plus.insert({
		    "http://example.org/test.html":[]
		}, 
		"http://example.org/test.html");

	    YAHOO.util.Assert.areEqual(this.more.innerHTML, "",
				       "No additional HTML should be generated when no CC+ metadata is present.");

	},

	testPlusAssertion: function () {

	    var MORE_PERMS = "http://example.org/buy.html";

	    // if no metadata is specified for the referrer we
	    // expect the insertion function to complete with no
	    // action or errors
	    YAHOO.cc.plus.insert({
		    "http://example.org/test.html":{
			"http://creativecommons.org/ns#morePermissions":
			   [MORE_PERMS],
		    }
		}, 
		"http://example.org/test.html");

	    // make sure the HTML was inserted
	    YAHOO.util.Assert.isTrue(this.more.innerHTML.indexOf(MORE_PERMS) > 0);

	    // make sure the classes were applied
	    YAHOO.util.Assert.isTrue(YAHOO.util.Dom.hasClass(this.more, "license"),
				     ".license should be applied.");
	    YAHOO.util.Assert.isTrue(YAHOO.util.Dom.hasClass(this.more, "more"),
				     ".more should be applied.");


	},

	testMultipleAssertions: function () {

	    var MORE_PERMS = "http://example.org/buy.html";
	    var MORE_PERMS_TOO = "http://example.org/barter.html";

	    // if no metadata is specified for the referrer we
	    // expect the insertion function to complete with no
	    // action or errors
	    YAHOO.cc.plus.insert({
		    "http://example.org/test.html":{
			"http://creativecommons.org/ns#morePermissions":
			    [MORE_PERMS, MORE_PERMS_TOO],
		    }
		}, 
		"http://example.org/test.html");

	    // make sure the HTML was inserted
	    YAHOO.util.Assert.isTrue(this.more.innerHTML.indexOf(MORE_PERMS) > 0);

	    // make sure the classes were applied
	    YAHOO.util.Assert.isTrue(YAHOO.util.Dom.hasClass(this.more, "license"),
				     ".license should be applied.");
	    YAHOO.util.Assert.isTrue(YAHOO.util.Dom.hasClass(this.more, "more"),
				     ".more should be applied.");


	},

    });

// add the test case to the test suite
YAHOO.cc.test.suite.add(YAHOO.cc.test.plus);
