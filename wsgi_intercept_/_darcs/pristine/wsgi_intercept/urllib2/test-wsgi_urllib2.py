#! /usr/bin/env python
import sys, os.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import urllib2

import wsgi_urllib2
import wsgi_intercept
import test_wsgi_app

_saved_debuglevel = None

def setup():
    _saved_debuglevel, wsgi_intercept.debuglevel = wsgi_intercept.debuglevel, 1
    wsgi_intercept.add_wsgi_intercept('localhost', 80, test_wsgi_app.create_fn)

def test():
    wsgi_urllib2.install_opener()
    urllib2.urlopen('http://localhost:80/')
    assert test_wsgi_app.success()

def teardown():
    wsgi_intercept.debuglevel = _saved_debuglevel

if __name__ == '__main__':
    try:
        setup()
        test()
    finally:
        teardown()
