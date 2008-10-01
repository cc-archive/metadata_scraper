
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

