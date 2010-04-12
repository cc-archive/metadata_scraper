
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
    if ( attrib.details != '' ) {
         document.getElementById('attribution-container').innerHTML = attrib.details;
     }
     return;
 }
