

// ************************************************************************
// ************************************************************************
// ** 
// **  Parsing/Scraping/Dispatch
// **

YAHOO.cc.success = function (response) {

    if (response.status != 200) return;

    var referer = response.argument;
    var license_url = YAHOO.cc.license_uri(document.URL);
    var metadata = YAHOO.lang.JSON.parse(response.responseText);
    var subject = null;

    // see if the referrer has metadata and is licensed under this license
    if ( (metadata.subjects.indexOf(referer) > -1) &&
         (YAHOO.cc.get_license(metadata.triples, referer) == license_url) ) {

	subject = referer;

    } else {
	
	// no metadata about the referrer; see if we only have one
	// subject with a license pointing at this page
	var license_subjects = [];

	for (var i = 0; i < metadata.subjects.length; i++) {
	    if (YAHOO.cc.get_license(metadata.triples, metadata.subjects[i]) == 
		license_url) {
		license_subjects.push(metadata.subjects[i]);
	    } // if (subject, license, document.URL) is asserted

	} // for each subject

	// see if more than one matches
	if (license_subjects.length == 1) {

	    // only one, we can make an assertion
	    subject = license_subjects[0];

	} // if only one subject with this license

    } // if the referrer is not licensed under this license

    YAHOO.cc.network.process_metadata(metadata.triples, subject);

    YAHOO.cc.plus.insert(metadata.triples, subject);

    YAHOO.cc.attribution.add_details(metadata.triples, subject);
    YAHOO.cc.attribution.add_copy_paste(metadata.triples, subject);

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

	var url = '/apps/triples?url=' + encodeURIComponent(document.referrer);
	YAHOO.util.Connect.asyncRequest('GET', url, callback, null);

    } // if refered from http:// request

} // load

YAHOO.util.Event.onDOMReady(YAHOO.cc.load);
