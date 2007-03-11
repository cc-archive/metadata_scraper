#! /usr/bin/env python2.4
from wsgi_testbrowser import WSGI_Browser
import wsgi_intercept
import test_wsgi_app

_saved_debuglevel = None

def setup():
    _saved_debuglevel, wsgi_intercept.debuglevel = wsgi_intercept.debuglevel, 1
    wsgi_intercept.add_wsgi_intercept('localhost', 80, test_wsgi_app.create_fn)

def test():
    b = WSGI_Browser()
    b.open('http://localhost:80/')
    assert test_wsgi_app.success()

def teardown():
    wsgi_intercept.debuglevel = _saved_debuglevel

if __name__ == '__main__':
    try:
        setup()
        test()
    finally:
        teardown()
