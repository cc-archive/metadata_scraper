YAHOO.cc.test.campaign = new YAHOO.tool.TestCase({
	
	name: "Campaign Header Test Case",
        
        //---------------------------------------------
        // Setup and tear down
        //---------------------------------------------
        
        setUp : function () {
	    this.header = YAHOO.util.Dom.get("header");
	    
        },
    
        tearDown : function () {

	    // reset the dummy "header"
	    this.header.innerHTML = "";

        },

        //---------------------------------------------
        // Tests
        //---------------------------------------------

	testAddBanner: function () {

	    // Make sure the banner is added properly
	    YAHOO.cc.campaign.show();

	    YAHOO.util.Assert.isTrue(this.header.innerHTML.indexOf("http://support.creativecommons.org/join") > -1)

	},

    });

// add the test case to the test suite
YAHOO.cc.test.suite.add(YAHOO.cc.test.campaign);
