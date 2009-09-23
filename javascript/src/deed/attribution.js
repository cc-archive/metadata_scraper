YAHOO.namespace("cc.attribution");

// ************************************************************************
// ************************************************************************
// ** 
// **  Attribution
// **

YAHOO.cc.attribution.add_details = function (work_info) {

    if (work_info.attributionName.length > 1 || 
	work_info.attributionURL.length > 1) return;

    // Attribution metadata
    if (work_info.attributionName && work_info.attributionURL) {
	document.getElementById('attribution-container').innerHTML = 
	    "You must attribute this work to <strong><a href='" + work_info.attributionURL + "'>" + work_info.attributionName + "</a></strong> (with link)."; 
    }
    
} // add_details

YAHOO.cc.attribution.add_copy_paste = function (work_info) {

    if (work_info.attributionName.length > 1 || 
	work_info.attributionURL.length > 1) return;


    var licenseCode = document.getElementById('license-code').value;
    var licenseUrl = document.getElementById('license-url').value;
    var copyPasteAttrib = null;

    // Attribution metadata
    if (work_info.attributionName && work_info.attributionURL) {

	copyPasteAttrib = '<div xmlns:cc="http://creativecommons.org/ns#" about="' + subject + '"><a rel="cc:attributionURL" property="cc:work_info.attributionName" href="' + work_info.attributionURL + '">' + work_info.attributionName + '</a> / <a rel="license" href="' + licenseUrl + '">' + licenseCode + '</a></div>';

    } else if (work_info.attributionName) {
	// name only 

	copyPasteAttrib = '<div xmlns:cc="http://creativecommons.org/ns#" about="' + subject + '"><span property="cc:work_info.attributionName">' + work_info.attributionName + '</span> / <a rel="license" href="' + licenseUrl + '">' + licenseCode + '</a></div>';
	
    } else if (work_info.attributionURL) {
	// URL only

	copyPasteAttrib = '<div xmlns:cc="http://creativecommons.org/ns#" about="' + subject + '"><a rel="cc:attributionURL" href="' + work_info.attributionURL + '">' + work_info.attributionURL + '</a> / <a rel="license" href="' + licenseUrl + '">' + licenseCode + '</a></div>';

    }

    // update copy/paste attribution if we can
    if (copyPasteAttrib != null) {
	document.getElementById('work-attribution').value = copyPasteAttrib;
	document.getElementById('work-attribution-container').style.display = 'block';
    } // copy/paste

} // add_copy_paste

