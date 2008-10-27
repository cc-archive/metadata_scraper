/**
 * Campaign Header
 **/

YAHOO.cc.campaign.show = function() {

    // construct the text to insert
    var network_text = 'Help Build the Commons &mdash; <a href="http://support.creativecommons.org/">Join Today!</a>';

    // create the new module to display the alert
    var module = new YAHOO.widget.Module("campaign", {visible:true});
    module.setBody(network_text);
    module.render(YAHOO.util.Dom.get("header"));
    module.show();

} // YAHOO.cc.campaign.show

YAHOO.util.Event.onDOMReady(YAHOO.cc.campaign.show);
