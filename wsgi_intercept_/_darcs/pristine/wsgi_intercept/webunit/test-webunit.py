#! /usr/bin/env python
import sys, os.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import wsgi_intercept
from wsgi_intercept import WSGI_HTTPConnection
import test_wsgi_app

from httplib import HTTP

class WSGI_HTTP(HTTP):
    _connection_class = WSGI_HTTPConnection

###

from wsgi_webunit.webunittest import WebTestCase
import unittest

class WSGI_WebTestCase(WebTestCase):
    scheme_handlers = dict(http=WSGI_HTTP)

    def setUp(self):
        wsgi_intercept.add_wsgi_intercept('127.0.0.1', 80,
                                          test_wsgi_app.create_fn)

    def test_get(self):
        self.page('/')
        assert test_wsgi_app.success()

if __name__ == '__main__':
    unittest.main()
