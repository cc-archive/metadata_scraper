
// ************************************************************************
// ************************************************************************
// ** 
// **  CC+
// **


YAHOO.cc.plus.insert = function(metadata, subject) {

    var morePermissionsURL = metadata[subject]['http://creativecommons.org/ns#morePermissions'];

    var commercialLicense = metadata[subject]['http://creativecommons.org/ns#commercialLicense'] || false;

    var morePermissionsAgent = false;

    if (commercialLicense) {
	morePermissionsAgent = metadata[commercialLicense]['http://purl.org/dc/elements/1.1/publisher'] || false;
	if (morePermissionsAgent) {
	    morePermissionsAgent = metadata[morePermissionsAgent]['http://purl.org/dc/elements/1.1/title'] || false;
	} 
    } // if a commercial license exists...

    var more_perms = '';

    if (morePermissionsURL.length > 0) {

	more_perms = "<strong>Permissions beyond</strong> the scope of this public license are available at ";

    }

    for (var p=0; p < morePermissionsURL.length; p++) {

	more_perms += " <strong><a href='" + addQSParameter(morePermissionsURL[p], 'cc-referrer', document.referrer) + "'>";
	more_perms += parseUri(morePermissionsURL[p])['host'];
	more_perms += "</a></strong>";
	
    } // for each more permissions URL

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

} // insert

