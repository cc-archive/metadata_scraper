/*
 * attribution.js
 * Support for metadata enhanced CC deeds.
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

YAHOO.namespace("cc");
YAHOO.namespace("cc.plus");
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

    alert('bar');
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
    alert('blarf!');
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
	
    } else if (attributionURL) {
	// URL only

	copyPasteAttrib = '<div xmlns:cc="http://creativecommons.org/ns#" about="' + subject + '"><a rel="cc:attributionURL" href="' + attributionUrl + '">' + attributionUrl + '</a> / <a rel="license" href="' + licenseUrl + '">' + licenseCode + '</a></div>';

    }

    // update copy/paste attribution if we can
    if (copyPasteAttrib != null) {
	document.getElementById('work-attribution').value = copyPasteAttrib;
	document.getElementById('work-attribution-container').style.display = 'block';
    } // copy/paste

} // add_copy_paste


// ************************************************************************
// ************************************************************************
// ** 
// **  Parsing/Scraping/Dispatch
// **

YAHOO.cc.success = function (response) {

    if (response.status != 200) return;

    var referer = response.argument;
    var metadata = YAHOO.lang.JSON.parse(response.responseText);

    // look for the referrer
    if (metadata._subjects.indexOf(referer) > -1) {

	YAHOO.cc.plus.insert(metadata, referer);

	YAHOO.cc.attribution.add_details(metadata, referer);
	YAHOO.cc.attribution.add_copy_paste(metadata, referer);

    } else if (metadata._subjects.length == 1) {

	// only one subject, not the referer
	YAHOO.cc.attribution.add_copy_paste(metadata, metadata._subjects[0]);
    }

} // success

YAHOO.cc.failure = function () {

} // failure

YAHOO.cc.load = function () {

    r = document.referrer;
    if (r.match('^http://')) {

	// construct the request callback
	var callback = {
	    success: YAHOO.cc.success,
	    failure: YAHOO.cc.failure,
	    argument: r,
	};

	var url = '/apps/triples?url=' + encodeURIComponent(r);
	YAHOO.util.Connect.asyncRequest('GET', url, callback, null);

    } // if refered from http:// request

} // load

YAHOO.util.Event.onDOMReady(YAHOO.cc.load);
