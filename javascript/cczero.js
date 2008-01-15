/*
 * cczero.js
 * Support for dynamic CC0 deeds.
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

} // makeRequest

function processResponse(http_request) {
    if (http_request.readyState == 4) {
        if (http_request.status == 200) {
            injectReferrerMetadata(http_request.responseText);
        } else {
	    // we didn't get HTTP 200 back; abort

        } // if status == 200
    } // if complete

} // processResponse

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

function add_dedication(metadata, subject) {

   // get the actor name
   actor_url = metadata[subject]['http://creativecommons.org/ns#waivedBy'][0];
   if (metadata[actor_url] &&
       metadata[actor_url]['http://purl.org/dc/elements/1.1/title'])
      actor = metadata[actor_url]['http://purl.org/dc/elements/1.1/title'][0];
   else
      actor = actor_url;

   // get the work information
   work_url = subject;
   if (metadata[work_url]['http://purl.org/dc/elements/1.1/title'])
      work = metadata[work_url]['http://purl.org/dc/elements/1.1/title'][0];
   else
      work = work_url;

   // assemble the text
   dedication  = "<a href='" + actor_url + "'>" + actor + "</a> ";
   dedication += "has dedicated ";
   dedication += "<a href='" + work_url + "'>" + work + "</a> ";
   dedication += "to be free of any legal obligations whatsoever. ";
   dedication += "To the extent possible under the law, ";
   dedication += actor + " waives all copyright, moral right, ";
   dedication += "database rights, and any other rights that might be ";
   dedication += "asserted over " + work;

   document.getElementById('nolaw-text').innerHTML = dedication;

} // add_dedication

function add_certification(metadata, subject) {

   // get the actor name
   actor_url = metadata[subject]['http://creativecommons.org/ns#assertedBy'][0];
   if (metadata[actor_url] &&
       metadata[actor_url]['http://purl.org/dc/elements/1.1/title'])
      actor = metadata[actor_url]['http://purl.org/dc/elements/1.1/title'][0];
   else
      actor = actor_url;

   // get the work information
   work_url = subject;
   if (metadata[work_url]['http://purl.org/dc/elements/1.1/title'])
      work = metadata[work_url]['http://purl.org/dc/elements/1.1/title'][0];
   else
      work = work_url;

   // assemble the text
   certification = "<a href='" + actor_url + "'>" + actor + "</a> ";
   certification += "has certified that ";
   certification += "<a href='" + work_url + "'>" + work + "</a> ";
   certification += "is free of any copyrights.";

   document.getElementById('nolaw-text').innerHTML = certification;

} // add_certification

function add_norms(metadata, subject) {

   norms_url = metadata[subject]['http://creativecommons.org/ns#scienceNorms'][0];

   statement = "<br/>Additional details are available at ";
   statement += "<a href='" + norms_url + "'>" + norms_url + "</a>.";

   document.getElementById('norms-container').innerHTML += statement
   document.getElementById('deed-conditions').style.display = 'block';

} // add_norms

function injectReferrerMetadata(response) {

    metadata = eval(response);

    // look for certifications and dedications
    for (s in metadata) {
    	for (p in metadata[s]) {
	   if (p == 'http://creativecommons.org/ns#waivedBy') {
	      // this contains a dedication
	      add_dedication(metadata, s);
	      }

	   if (p == 'http://creativecommons.org/ns#assertedBy') {
	      // this contains a certification
	      add_certification(metadata, s);
	      }

	   if (p == 'http://creativecommons.org/ns#scienceNorms') {
	      // this contains a science norms link
	      add_norms(metadata, s);
	      }
	}
    }

} // injectReferrerMetadata

function referrerMetadata() {
    r = document.referrer;
    if (r.match('^http://')) {
	makeRequest('/apps/triples?url='+encodeURIComponent(r));
    }

} // referrerMetadata

