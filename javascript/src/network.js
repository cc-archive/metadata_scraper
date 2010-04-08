
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

