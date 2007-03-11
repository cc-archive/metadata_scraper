"""
A zope.testbrowser-style Web browser interface that redirects specified
connections to a WSGI application.
"""

from mechanize import Browser as MechanizeBrowser
from zope.testbrowser.browser import Browser as ZopeTestbrowser
from httplib import HTTP
from ClientCookie import HTTPHandler

import sys, os.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from wsgi_intercept import WSGI_HTTPConnection

class WSGI_HTTPHandler(HTTPHandler):
    """
    Override the default HTTPHandler class with one that uses the
    WSGI_HTTPConnection class to open HTTP URLs.
    """
    
    def http_open(self, req):
        return self.do_open(WSGI_HTTPConnection, req)
    
class PatchedMechanizeBrowser(MechanizeBrowser):
    """
    Patch the mechanize browser so that it uses the WSGI_HTTPHandler
    to open HTTP connections.
    """
    
    def __init__(self, *args, **kwargs):
        # install WSGI intercept handler.
        self.handler_classes['http'] = WSGI_HTTPHandler

        MechanizeBrowser.__init__(self, *args, **kwargs)
        

class WSGI_Browser(ZopeTestbrowser):
    """
    Override the zope.testbrowser.browser.Browser interface so that it
    uses PatchedMechanizeBrowser 
    """
    
    def __init__(self, *args, **kwargs):
        mech_browser = kwargs.get('mech_browser')
        if not (mech_browser is None) or \
               isinstance(mech_browser, PatchedMechanizeBrowser):
            raise Exception("mech_browser must be an instance of PatchedMechanizeBrowser")

        if not mech_browser:
            mech_browser = PatchedMechanizeBrowser()
            kwargs['mech_browser'] = mech_browser
            
        ZopeTestbrowser.__init__(self, *args, **kwargs)
