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
