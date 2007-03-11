import sys
from wsgi_intercept import WSGI_HTTPConnection

import urllib2
from urllib2 import HTTPHandler
from httplib import HTTP

#
# ugh, version dependence.
#

if sys.version_info[:2] == (2, 4,):
    class WSGI_HTTPHandler(HTTPHandler):
        """
        Override the default HTTPHandler class with one that uses the
        WSGI_HTTPConnection class to open HTTP URLs.
        """
        def http_open(self, req):
            return self.do_open(WSGI_HTTPConnection, req)

else:
    class WSGI_HTTP(HTTP):
        _connection_class = WSGI_HTTPConnection

    class WSGI_HTTPHandler(HTTPHandler):
        """
        Override the default HTTPHandler class with one that uses the
        WSGI_HTTPConnection class to open HTTP URLs.
        """
        def http_open(self, req):
            return self.do_open(WSGI_HTTP, req)
    
def install_opener():
    handler = WSGI_HTTPHandler()
    opener = urllib2.build_opener(handler)
    urllib2.install_opener(opener)

    return opener
