/**
 * Campaign Header
 **/

YAHOO.namespace("cc.campaign");

YAHOO.cc.campaign.show = function() {

    var header = YAHOO.util.Dom.get("header");

    // construct the text to insert
    var network_text = '<div class="donate-today">Help Build the Commons &mdash; <a href="http://support.creativecommons.org/join?utm_source=deeds&utm_medium=banner&utm_campaign=fall2008">Donate Today!</a></div> <a href="http://support.creativecommons.org/join?utm_source=deeds&utm_medium=banner&utm_campaign=fall2008" id="sticker-link">&nbsp;</a> <div class="progress"><div class="progress-text">2008 Campaign</div> <div class="meter" id="meter" onclick="window.location=\'http://support.creativecommons.org/join?utm_source=deeds&utm_medium=banner&utm_campaign=fall2008\';"><span>&nbsp;</span></div><div class="progress-text progress-goal">$500,000</div></div>';

    // create the new module to display the alert
    var module = new YAHOO.widget.Module("campaign", {visible:false});
    module.setBody(network_text);
    module.render(header);

    // move things around to get the order correct
    YAHOO.util.Dom.insertBefore(module.element, YAHOO.util.Dom.getFirstChild(header));
    module.show();

} // YAHOO.cc.campaign.show

YAHOO.util.Event.onDOMReady(YAHOO.cc.campaign.show);
