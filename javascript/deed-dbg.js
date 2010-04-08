/*
 * ccdeed.js
 * Core support for license deeds with metadata scraping
 * 
 * copyright 2007-2008, Creative Commons, Nathan R. Yergler, John E Doig III
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
YAHOO.namespace("cc.network");
YAHOO.namespace("cc.attribution");

// ************************************************************************
// ************************************************************************
// ** 
// **  Registration
// **

YAHOO.cc.network.show_info = function(registration) {
     // display the registration information
     var module = new YAHOO.widget.Module("network", {visible:true});
     module.setBody(registration);
     module.render(
		YAHOO.util.Dom.getAncestorBy(
		    YAHOO.util.Dom.get("work-attribution-container"),
			function(e) {return true;}));
     YAHOO.util.Dom.addClass(module.body, "network");
     module.show();
 }


// ************************************************************************
// ************************************************************************
// ** 
// **  CC+
// **

YAHOO.cc.plus.show_info = function (more_permissions) {
    document.getElementById('more-container').innerHTML = more_permissions;
    document.getElementById('more-container').setAttribute("class", "license more");
}
// ************************************************************************
// ************************************************************************
// ** 
// **  Attribution
// **

YAHOO.cc.attribution.show_info = function(attrib) {
     // display the marking
     document.getElementById('work-attribution').value = attrib.marking;
	 document.getElementById('work-attribution-container').style.display = 'block';
     // check if there are attribution details
    if ( attrib.details != null ) {
         document.getElementById('attribution-container').innerHTML = attrib.details;
     }
     return;
 }


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