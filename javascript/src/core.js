

// ************************************************************************
// ************************************************************************
// ** 
// **  Parsing/Scraping/Dispatch
// **

YAHOO.cc.success = function (response) {

    if (response.status != 200) return;

    var popups = YAHOO.lang.JSON.parse(response.responseText);
    
    // Check for attribution results
    if ( popups.attribution != null ) 
        YAHOO.cc.attribution.show_info(popups.attribution);
    
    // Check for registration results
    if ( popups.registration != null ) 
        YAHOO.cc.network.show_info(popups.registration);

    // Check for more permissions
    if ( popups.more_permissions != null ) 
        YAHOO.cc.plus.show_info(popups.more_permissions);
    
    return;

} // success

YAHOO.cc.failure = function () {

} // failure

YAHOO.cc.load = function () {

    if (document.referrer.match('^http://')) {

	// construct the request callback
	var callback = {
	    success: YAHOO.cc.success,
	    failure: YAHOO.cc.failure,
	    argument: document.referrer
	};

	// initialize the header to include the Referer
	YAHOO.util.Connect.initHeader('Referer', document.URL, true);

	var url = '/apps/deed?url=' + encodeURIComponent(document.referrer);
	YAHOO.util.Connect.asyncRequest('GET', url, callback, null);

    } // if refered from http:// request

} // load

YAHOO.util.Event.onDOMReady(YAHOO.cc.load);