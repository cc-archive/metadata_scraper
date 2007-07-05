function makeRequest(url) {
    var http_request = false;

    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        http_request = new XMLHttpRequest();
        if (http_request.overrideMimeType) {
            http_request.overrideMimeType('text/plain');
            // See note below about this line
        }
    } else if (window.ActiveXObject) { // IE
        try {
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
    }

    if (!http_request) {
        //alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    http_request.onreadystatechange = function() {
        processResponse(http_request);
    };
    http_request.open('GET', url, true);
    http_request.send(null);
}

function processResponse(http_request) {
    if (http_request.readyState == 4) {
        if (http_request.status == 200) {
            injectReferrerMetadata(http_request.responseText);
        } else {
            //alert('There was a problem with the request.');
        }
    }
}

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
}

function injectReferrerMetadata(response) {

    metadata = eval(response);

    var attributionName = metadata.attributionName;
    var attributionUrl = metadata.attributionUrl;

    if (attributionName && attributionUrl) {
	document.getElementById('attribution-container').innerHTML = "You must attribute this work to <strong><a href='" + attributionUrl + "'>" + attributionName + "</a></strong> (with link)."; // <a onclick=\"window.open('/includes/by-popup.html', 'attribution_help', 'width=375,height=300,scrollbars=yes,resizable=yes,toolbar=no,directories=no,location=yes,menubar=no,status=yes');return false;\" href=''>Find out how.</a>";
    }

    var morePermissionsURL = metadata.morePermissions;
    var morePermissionsDomain = metadata.morePermissionsDomain;

    morePermissionsURL = addQSParameter(morePermissionsURL, 'cc-referrer', document.referrer);

    if (morePermissionsURL && morePermissionsDomain) {

	var more_perms = "<strong>Permissions beyond</strong> the scope of this public license are available at <strong><a href='";
	more_perms += morePermissionsURL;
	more_perms += "'>" + morePermissionsDomain + "</a></strong>.</li>";

	document.getElementById('more-container').innerHTML = more_perms;
	document.getElementById('more-container').setAttribute("class", "license more");

    }

    var noncomm_ads = metadata.allowAdvertising;
    if (document.getElementById('nc-more-container') && noncomm_ads) {
	// this is a non-comm license
	document.getElementById('nc-more-container').innerHTML = noncomm_ads;
    }

} // injectReferrerMetadata

function referrerMetadata() {
    r = document.referrer;
    if (r.match('^http://')) makeRequest('/apps/scrape?url='+encodeURIComponent(r));
}

