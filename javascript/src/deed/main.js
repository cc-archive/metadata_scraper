YAHOO.namespace("cc.deed");

YAHOO.cc.deed.parse_success = function(store) {

    // make sure the referrer has metadata about this document
    var query = new RDFQuery(store);
    var results = query.query2(YAHOO.cc.deed.DEED_INFO);

    // XXX we need to check and prefer the referrer in the result set.
    query.walk2(results, {
	    action : function (obj) {

		// attribution
		YAHOO.cc.attribution.add_details(obj);
		YAHOO.cc.attribution.add_copy_paste(obj);

		// CC+

		// Registration (CC Network)

		console.log(obj);
	    }
    });

} // parse_success

YAHOO.cc.deed.parse_failure = function(error_code) {
    // see http://developer.yahoo.com/yui/connection/#failure 
} // parse_failure

YAHOO.cc.deed.check_referrer = function() {

    // look for the referrer
    if (document.referrer.match('^http://')) {

	// construct the request callback
	var callback = {
	    success: YAHOO.cc.deed.parse_success,
	    failure: YAHOO.cc.deed.parse_failure
	};

	YAHOO.cc.ld.load(document.referrer, 
			 '/apps/triples',
			 callback);
	
    } // if refered from http:// request

} // check_referrer

YAHOO.register("cc.deed", YAHOO.cc.deed, {version:"0.0.1", build:"1"});
YAHOO.util.Event.onDOMReady(YAHOO.cc.deed.check_referrer);
