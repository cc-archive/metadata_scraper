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
		metadata[services[i]]["http://rdfs.org/sioc/services#service_protocol"] &&
		metadata[services[i]]["http://rdfs.org/sioc/services#service_protocol"] == "http://wiki.creativecommons.org/work-lookup")

		return services[i];

	} // for each service

    } // if services were defined
	
    // no services, return null
    return null;

} // lookup_uri

YAHOO.cc.network.process_metadata = function (metadata, subject) {

    // see if this metadata contains an owner assertion
    if (metadata[subject]['http://rdfs.org/sioc/ns#has_owner']) {
        // it does, see if there's a reciprocal ownership assertion
        owner_url = metadata[subject]['http://rdfs.org/sioc/ns#has_owner'][0];

        if (metadata[owner_url] &&
            metadata[owner_url]['http://rdfs.org/sioc/ns#owner_of']) { 

            // they own *something* - check if it's the referer
            for (var o=0; o< metadata[owner_url]['http://rdfs.org/sioc/ns#owner_of'].length;o++){
		if (metadata[owner_url]['http://rdfs.org/sioc/ns#owner_of'][o] == subject) {
		    // construct the text to insert
		    owner_name = metadata[owner_url]['http://rdfs.org/sioc/ns#name'][0];
		    network_url = metadata[owner_url]['http://rdfs.org/sioc/ns#member_of'][0];
		    network_name = metadata[network_url]['http://purl.org/dc/terms/title'][0];

		    lookup_uri = YAHOO.cc.network.lookup_uri(metadata, network_url, subject) || subject;

		    var network_text = 	    
			'<a href="' + owner_url + '">' + owner_name + 
			'</a> has registered ' +
			'<a href="' + lookup_uri + '">this work</a> ' + 
			'at the <nobr><a ref="' + network_url + '">' + 
			network_name + '</a></nobr>.';

		    // create the new module to display the alert
		    var module = new YAHOO.widget.Module("network", 
							 {visible:true});
		    module.setBody(network_text);
		    module.render(
				  YAHOO.util.Dom.getAncestorBy(
							       YAHOO.util.Dom.get("work-attribution-container"),
							       function(e) {return true;}));
		    YAHOO.util.Dom.addClass(module.body, "network");
		    module.show();
			break;
			} // if ownership claims match
	    } // for each ownership claim
	} // if ownership claims exist

    } // if a has_owner claim exists


} // add_details
