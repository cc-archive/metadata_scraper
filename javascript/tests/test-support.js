YAHOO.namespace("cc.test");

// define an empty test suite
YAHOO.cc.test.suite = new YAHOO.tool.TestSuite("CC Deed Test Suite"); 

YAHOO.cc.test.handle_failure = function(data){

    YAHOO.util.Dom.replaceClass("status", "passed", "failed");
}

YAHOO.cc.test.run = function(e) {

    YAHOO.util.Event.preventDefault(e);

    // reset the state
    YAHOO.util.Dom.replaceClass("status", "failed", "passed");

    // run the tests
    YAHOO.tool.TestRunner.add(YAHOO.cc.test.suite);
    YAHOO.tool.TestRunner.subscribe(
	YAHOO.tool.TestRunner.TEST_FAIL_EVENT, 
        YAHOO.cc.test.handle_failure);

    YAHOO.tool.TestRunner.run();

}

YAHOO.util.Event.onDOMReady(function (){

    // create the logger
    var logger = new YAHOO.tool.TestLogger("testLogger");
    logger.collapse();

    // configure the Run button
    var runButton = new YAHOO.widget.Button("runTests", {type:"push"});
    //runButton.render();

    runButton.addListener("click", YAHOO.cc.test.run);
});
