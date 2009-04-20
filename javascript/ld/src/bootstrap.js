
var baseDefaultPath = pathToModule("ld-bootstrap"),
    loader;

(
 function() {
     addScript("http://yui.yahooapis.com/combo?2.7.0/build/yuiloader-dom-event/yuiloader-dom-event.js");

     function waitForYahoo() {
	 try {
	     loader = new YAHOO.util.YUILoader();

	     loader.addModule({name: "cc.ld",
			 type: "js",
			 fullpath: baseDefaultPath + "ld.js" 
			 });

	     loader.require('cc.ld');
	     loader.insert();
	 } catch(e) {
	     setTimeout(waitForYahoo, 50);
	     return;
	 }
     }
     waitForYahoo();
 }()
 );
