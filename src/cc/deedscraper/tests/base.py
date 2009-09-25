## Copyright (c) 2007-2009 Nathan R. Yergler, Creative Commons

## Permission is hereby granted, free of charge, to any person obtaining
## a copy of this software and associated documentation files (the "Software"),
## to deal in the Software without restriction, including without limitation
## the rights to use, copy, modify, merge, publish, distribute, sublicense,
## and/or sell copies of the Software, and to permit persons to whom the
## Software is furnished to do so, subject to the following conditions:

## The above copyright notice and this permission notice shall be included in
## all copies or substantial portions of the Software.

## THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
## IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
## FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
## AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
## LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
## FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
## DEALINGS IN THE SOFTWARE.

"""Unit test support for the cc.deedscraper application."""

import os
import doctest
import unittest

try:
    import json
except ImportError:
    import simplejson as json

import webtest

import cc.deedscraper.app

def test_app():
    """Return an instance of the cc.deedscraper WSGI app wrapped as a
    WebTest TestApp."""

    return webtest.TestApp(cc.deedscraper.app.application.wsgifunc())

def formatted_scrape_response(**kwargs):
    """Returns a string which contains *at least* the standard fields returned
    by the metadata scraper application, as well as any option **kwargs
    provided."""

    # construct the default (empty) response
    result = {'licenseUrl':'',
              'attributionName':'',
              'attributionUrl':'',
              'morePermissions':'',
              'morePermissionsDomain':'',
              'morePermissionsAgent':'',
              'allowAdvertising':False,
              'commercialLicense':'',
              '_source':'',
              '_action':'scrape',
            }

    # update the response with any optional values provided
    for k in kwargs:
        result[k] = kwargs[k]
        
    return json.dumps(result)
