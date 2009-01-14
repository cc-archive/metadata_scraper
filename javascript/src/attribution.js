
// ************************************************************************
// ************************************************************************
// ** 
// **  Attribution
// **

YAHOO.cc.attribution.add_details = function (metadata, subject) {

    var attributionName = metadata[subject]['http://creativecommons.org/ns#attributionName'] || false;
    var attributionUrl = metadata[subject]['http://creativecommons.org/ns#attributionURL'] || false;

    if (attributionName.length > 1 || attributionUrl.length > 1) return;

    // Attribution metadata
    if (attributionName && attributionUrl) {
	document.getElementById('attribution-container').innerHTML = "You must attribute this work to <strong><a href='" + attributionUrl + "'>" + attributionName + "</a></strong> (with link)."; 
    }
    
} // add_details

YAHOO.cc.attribution.add_copy_paste = function (metadata, subject) {

    var attributionName = metadata[subject]['http://creativecommons.org/ns#attributionName'] || false;
    var attributionUrl = metadata[subject]['http://creativecommons.org/ns#attributionURL'] || false;

    if (attributionName.length > 1 || attributionUrl.length > 1) return;


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

