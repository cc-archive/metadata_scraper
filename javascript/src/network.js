/**
 *
 * CC Network/sioc:has_owner Support
 * 
 */

YAHOO.cc.network.process_metadata = function (metadata, subject) {

    // see if this metadata contains an owner assertion
    if (metadata[subject]['http://rdfs.org/sioc/ns#has_owner']) {
	// it does, see if there's a reciprocal ownership assertion
	owner_url = metadata[subject]['http://rdfs.org/sioc/ns#has_owner'];
	if (metadata[owner_url] && 
	    metadata[owner_url]['http://rdfs.org/sioc/ns#owner_of'] &&
	    metadata[owner_url]['http://rdfs.org/sioc/ns#owner_of'] == subject) {
	    // woot! get the network name
	    alert('powned!')
		}

    }

} // add_details
