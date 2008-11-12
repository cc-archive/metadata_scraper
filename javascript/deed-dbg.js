/*
 * ccdeed.js
 * Core support for license deeds with metadata scraping
 * 
 * copyright 2007-2008, Creative Commons, Nathan R. Yergler
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 * 
 * 
 */

var SIOC = function(part) {
    return "http://rdfs.org/sioc/ns#" + part;
} // SIOC

var POWDER = function(part) {
    return "http://www.w3.org/2007/05/powder#" + part;
} // POWDER

var DCT = function(part) {
    return 'http://purl.org/dc/terms/' + part;
}

YAHOO.namespace("cc");
YAHOO.namespace("cc.plus");
YAHOO.namespace("cc.network");
YAHOO.namespace("cc.attribution");


// ************************************************************************
// ************************************************************************
// ** 
// **  support functions
// **

/*
	parseUri 1.2.1
	(c) 2007 Steven Levithan <stevenlevithan.com>
	MIT License
*/

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

function addQSParameter(url, key, value) {
    var url_nohash = url;
    var hash = '';
    var hash_index = (url.indexOf('#'));
    if (hash_index != -1) {
        url_nohash = url.substring(0, hash_index);
        hash = url.substring(hash_index);
    }
    url_nohash += (url.indexOf('?') == -1) ? '?' : '&';
    url_nohash += key + '=' + value;
    return url_nohash + hash;
} // addQSParameter

/**
 *
 * CC Network/sioc:has_owner Support
 * 
 */

YAHOO.cc.network.lookup_uri = function (metadata, network, work_uri) {
    // given a network URI, find the service URI that implements
    // the work lookup, if available

    // see if any services are defined
    services = metadata[network]["http://rdfs.org/sioc/services#has_service"];
    if (services) {

	// see if any service implemented work-lookup
	for (var i = 0; i < services.length; i++) {
	    if (metadata[services[i]] &&
		metadata[services[i]]["http://rdfs.org/sioc/services#service_protocol"]) {
		// this service defines protocols, see if any match
		protocols = metadata[services[i]]["http://rdfs.org/sioc/services#service_protocol"];
		for (var j = 0; j < protocols.length; j++) {
		    if (protocols[j] == 
			"http://wiki.creativecommons.org/work-lookup") {

			// we have a match
			if (work_uri)
			    return services[i] + "?uri=" + work_uri;

			return services[i];
		    }
		} // for each protocol
		
	    } // if the service asserts protocols

	} // for each service

    } // if services were defined
	
    // no services, return null
    return null;

} // lookup_uri

YAHOO.cc.network.show_info = function(metadata, subject, owner) {

    // construct the text to insert
    owner_name = metadata[owner][SIOC('name')][0];
    network_url = metadata[owner][SIOC('member_of')][0];
    network_name = metadata[network_url][DCT('title')][0];

    lookup_uri = YAHOO.cc.network.lookup_uri(metadata, network_url, subject) || subject;

    var network_text = 	    
    '<a href="' + owner + '">' + owner_name + 
    '</a> has registered ' +
    '<a href="' + lookup_uri + '">this work</a> ' + 
    'at the <nobr><a href="' + network_url + '">' + 
    network_name + '</a></nobr>.';

    // create the new module to display the alert
    var module = new YAHOO.widget.Module("network", {visible:true});
    module.setBody(network_text);
    module.render(
		  YAHOO.util.Dom.getAncestorBy(
					       YAHOO.util.Dom.get("work-attribution-container"),
					       function(e) {return true;}));
    YAHOO.util.Dom.addClass(module.body, "network");

    module.show();
} // show_info

YAHOO.cc.network.match_iriset = function(metadata, iri_bnode, subject) {

    var r=0;

    // iterate over the inclusion regexes
    if (metadata[iri_bnode][POWDER("includeregex")])
    for (r = 0; 
	 r < metadata[iri_bnode][POWDER("includeregex")].length; 
	 r++){

	if (!(new RegExp(metadata[iri_bnode][POWDER("includeregex")][r])).
	    test(subject)) return false;
									   
    } // for each include regex


    // iterate over the exclusion regexes
    if (metadata[iri_bnode][POWDER("excluderegex")])
    for (r = 0; 
	 r < metadata[iri_bnode][POWDER("excluderegex")].length; 
	 r++){

	if ((new RegExp(metadata[iri_bnode][POWDER("excluderegex")][r])).
	    test(subject)) return false;
									   
    } // for each exclude regex

    return true;

} // match_iriset

YAHOO.cc.network.process_metadata = function (metadata, subject) {

    // see if this metadata contains an owner assertion
    if (metadata[subject][SIOC('has_owner')]) {
        // it does, see if there's a reciprocal ownership assertion
        owner_url = metadata[subject][SIOC('has_owner')][0];

        if (metadata[owner_url] &&
            metadata[owner_url][SIOC('owner_of')]) { 

            // they own *something* - check if it's the referer
            for (var o=0; o< metadata[owner_url][SIOC('owner_of')].length;o++){
		var owned_url = metadata[owner_url][SIOC('owner_of')][o];
		if (owned_url == subject) {

		    // Yay!
		    YAHOO.cc.network.show_info(metadata, owned_url,
					       owner_url);

		} // if ownership claims match
	    } // for each owned URL

	    // console.log(YAHOO.cc.license_uri(null));
            // no match yet; second pass to look for matching regexes
            for (var o=0; o< metadata[owner_url][SIOC('owner_of')].length;o++){
		var owned_url = metadata[owner_url][SIOC('owner_of')][o];

		// console.log('checking if ' + owned_url + ' contains the matching iriset');

		// console.log(YAHOO.cc.get_license(metadata, owned_url));
		// see if the owned URL has a license that matches us
		if (YAHOO.cc.get_license(metadata, owned_url) == YAHOO.cc.license_uri(null)) {
		    // console.log('license matches...');
		    // it has the same license; see if it's 
		    // parent has an iriset
		    if (metadata[owned_url][SIOC('has_parent')] &&
			metadata[metadata[owned_url][SIOC('has_parent')][0]][POWDER('iriset')]) {
			// console.log('it has a parent which has an iriset');
			// it has at least one IRI set, see if match...
			parent_url = metadata[owned_url][SIOC('has_parent')][0];
			for (p=0; p<metadata[parent_url][POWDER('iriset')].length; p++) {
			    var iriset = metadata[parent_url][POWDER('iriset')][p];
			    if (YAHOO.cc.network.match_iriset(metadata,
							      iriset,
							      subject)) {
				YAHOO.cc.network.show_info(metadata, owned_url, owner_url);
			    } // if we match
			    
			} // for each iriset
		    } // if the parent has > 0 irisets
		} // if the work has the same license as we're viewing
	    } // for each owned work

	} // if ownership claims exist

    } // if a has_owner claim exists


} // add_details

// ************************************************************************
// ************************************************************************
// ** 
// **  CC+
// **


YAHOO.cc.plus.insert = function(metadata, subject) {

    var morePermissionsURL = metadata[subject]['http://creativecommons.org/ns#morePermissions'];
    var morePermissionsDomain = parseUri(morePermissionsURL)['host'];

    var commercialLicense = metadata[subject]['http://creativecommons.org/ns#commercialLicense'] || false;

    var morePermissionsAgent = false;

    if (commercialLicense) {
	morePermissionsAgent = metadata[commercialLicense]['http://purl.org/dc/elements/1.1/publisher'] || false;
	if (morePermissionsAgent) {
	    morePermissionsAgent = metadata[morePermissionsAgent]['http://purl.org/dc/elements/1.1/title'] || false;
	} 
    } // if a commercial license exists...

    var noncomm_ads = false; 

    if (morePermissionsURL) 
	morePermissionsURL = addQSParameter(morePermissionsURL, 'cc-referrer', document.referrer);

    var more_perms = '';

    if (morePermissionsURL && morePermissionsDomain) {

	more_perms = "<strong>Permissions beyond</strong> the scope of this public license are available at <strong><a href='";
	more_perms += morePermissionsURL;
	more_perms += "'>" + morePermissionsDomain + "</a></strong>.</li>";
    }

    if (commercialLicense && morePermissionsAgent) {
       if (more_perms) more_perms += '<br/>';

       more_perms += '<strong>Commerciële Rechten</strong>. ';
       more_perms += 'Licenties voor commercieel gebruik zijn via';
       more_perms += ' <strong><a href="' + commercialLicense + '">';
       more_perms += morePermissionsAgent + '</a></strong> verkrijgbaar.';

    } // commercial license

    // set the more perms / commercial usage statement
    if (more_perms) {
        document.getElementById('more-container').innerHTML = more_perms;
        document.getElementById('more-container').setAttribute("class", "license more");
    } 

    if (document.getElementById('nc-more-container') && noncomm_ads) {
	// this is a non-comm license
	document.getElementById('nc-more-container').innerHTML = noncomm_ads;
    }

} // insert


// ************************************************************************
// ************************************************************************
// ** 
// **  Attribution
// **

YAHOO.cc.attribution.add_details = function (metadata, subject) {

    var attributionName = metadata[subject]['http://creativecommons.org/ns#attributionName'] || false;
    var attributionUrl = metadata[subject]['http://creativecommons.org/ns#attributionURL'] || false;

    // Attribution metadata
    if (attributionName && attributionUrl) {
	document.getElementById('attribution-container').innerHTML = "You must attribute this work to <strong><a href='" + attributionUrl + "'>" + attributionName + "</a></strong> (with link)."; 
    }
    
} // add_details

YAHOO.cc.attribution.add_copy_paste = function (metadata, subject) {

    var attributionName = metadata[subject]['http://creativecommons.org/ns#attributionName'] || false;
    var attributionUrl = metadata[subject]['http://creativecommons.org/ns#attributionURL'] || false;

    var licenseCode = document.getElementById('license-code').value;
    var licenseUrl = document.getElementById('license-url').value;
    var copyPasteAttrib = null;

    // Attribution metadata
    if (attributionName && attributionUrl) {

	copyPasteAttrib = '<div xmlns:cc="http://creativecommons.org/ns#" about="' + subject + '"><a rel="cc:attributionURL" property="cc:attributionName" href="' + attributionUrl + '">' + attributionName + '</a> / <a rel="license" href="' + licenseUrl + '">' + licenseCode + '</a></div>';

    } else if (attributionName) {
	// name only 

	copyPasteAttrib = '<div xmlns:cc="http://creativecommons.org/ns#" about="' + subject + '"><span property="cc:attributionName">' + attributionName + '</span> / <a rel="license" href="' + licenseUrl + '">' + licenseCode + '</a></div>';
	
    } else if (attributionUrl) {
	// URL only

	copyPasteAttrib = '<div xmlns:cc="http://creativecommons.org/ns#" about="' + subject + '"><a rel="cc:attributionURL" href="' + attributionUrl + '">' + attributionUrl + '</a> / <a rel="license" href="' + licenseUrl + '">' + licenseCode + '</a></div>';

    }

    // update copy/paste attribution if we can
    if (copyPasteAttrib != null) {
	document.getElementById('work-attribution').value = copyPasteAttrib;
	document.getElementById('work-attribution-container').style.display = 'block';
    } // copy/paste

} // add_copy_paste

/**
 * Campaign Header
 **/

YAHOO.namespace("cc.campaign");

YAHOO.cc.campaign.show = function() {

    var header = YAHOO.util.Dom.get("header");

    // construct the text to insert
    var network_text = '<div class="donate-today">Help Build the Commons &mdash; <a href="http://support.creativecommons.org/?utm_source=deeds&utm_medium=banner&utm_campaign=fall2008">Donate Today!</a></div> <a href="http://support.creativecommons.org/?utm_source=deeds&utm_medium=banner&utm_campaign=fall2008" id="sticker-link">&nbsp;</a> <div class="progress"><div class="progress-text">2008 Campaign</div> <div class="meter" id="meter" onclick="window.location=\'http://support.creativecommons.org?utm_source=deeds&utm_medium=banner&utm_campaign=fall2008\';"><span>&nbsp;</span></div><div class="progress-text progress-goal">$500,000</div></div>';

    // create the new module to display the alert
    var module = new YAHOO.widget.Module("campaign", {visible:false});
    module.setBody(network_text);
    module.render(header);

    // move things around to get the order correct
    YAHOO.util.Dom.insertBefore(module.element, YAHOO.util.Dom.getFirstChild(header));
    module.show();

} // YAHOO.cc.campaign.show

YAHOO.util.Event.onDOMReady(YAHOO.cc.campaign.show);


// ************************************************************************
// ************************************************************************
// ** 
// **  Parsing/Scraping/Dispatch
// **

YAHOO.cc.license_uri = function(license_uri) {

    // ensure that the license_uri is canonical
    // note that this is a CC-ism, although this only runs in deeds @ CC,
    // so we're fine with that

    if (license_uri == null) license_uri = document.URL;
    if (license_uri.charAt(license_uri.length - 1) == '/') return license_uri;

    return license_uri.substring(0, license_uri.lastIndexOf('/') + 1);

} // license_uri

YAHOO.cc.get_license = function (metadata, subject) {

    // Return the license URI for the given subject; if no license is
    // asserted, return null.  This looks for xhtml:license, dc:license,
    // and cc:license in that order.

    if (!metadata[subject]) return null;

    var license = 
        metadata[subject]['http://www.w3.org/1999/xhtml/vocab#license'] ||
        metadata[subject]['http://purl.org/dc/terms/license'] ||
        metadata[subject]['http://creativecommons.org/ns#license'] || 
        null;

    if (license) return license[0];

    return null;

} // get_license

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
