## Copyright (c) 2007 Nathan R. Yergler, Creative Commons

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

"""Unit tests for the cc.deedscraper application."""

import os
import doctest
import unittest

import cherrypy
from cherrypy.test import helper

import cc.deedscraper.app

class DefaultValuesTest(helper.CPWebCase):

    def testNoRootMethod(self):
        """cc.deedscraper does not define an index method."""

        self.getPage('/')
        self.assertStatus(404)


    def testNoUrlProvided(self):
        """Calling /scrape with no parameters should return an empty result."""

        self.getPage('/scrape')
        self.assertBody('{}')

class ScrapingTests(helper.CPWebCase):
    """Tests scraping our sample static pages."""

    def testNoMetadata(self):
        """Many pages will contain no metadata, but will not throw an error."""

        self.getPage('/scrape?url=http://localhost:8080/static/no_metadata.html')
        self.assertStatus(200)
        self.assertBody('({"morePermissionsDomain": "", '
                        '"morePermissions": "", "attributionUrl": "", '
                        '"attributionName": "", "licenseUrl": ""})')

    def testLicenseMetadata(self):
        """Scrape an xhtml:license assertion."""

        self.getPage('/scrape?url=http://localhost:8080/static/license.html')
        self.assertStatus(200)
        self.assertBody('({"morePermissionsDomain": "", '
                        '"morePermissions": "", "attributionUrl": "", '
                        '"attributionName": "", '
                        '"licenseUrl": "http:\/\/creativecommons.org\/licenses\/by\/3.0\/"})')

    def testCcLicenseMetadata(self):
        """Scrape a cc:license assertion (with or without namespace declaration)."""

        # with namespace declaration
        self.getPage('/scrape?url=http://localhost:8080/static/license_only1.html')
        self.assertStatus(200)
        self.assertBody('({"morePermissionsDomain": "", '
                        '"morePermissions": "", "attributionUrl": "", '
                        '"attributionName": "", '
                        '"licenseUrl": "http:\/\/creativecommons.org\/licenses\/by\/3.0\/"})')

        # without namespace declaration
        self.getPage('/scrape?url=http://localhost:8080/static/license_only2.html')
        self.assertStatus(200)
        self.assertBody('({"morePermissionsDomain": "", '
                        '"morePermissions": "", "attributionUrl": "", '
                        '"attributionName": "", '
                        '"licenseUrl": "http:\/\/creativecommons.org\/licenses\/by\/3.0\/"})')

    def testDefaultccNamespace(self):
        """The cc: namesapce defaults to http://web.resource.org/cc#"""

        self.getPage('/scrape?url=http://localhost:8080/static/cc_license.html')
        self.assertStatus(200)
        self.assertBody('({"morePermissionsDomain": "magnatune.com", '
                        '"morePermissions": "https:\/\/magnatune.com\/artists\/Solace", '
                        '"attributionUrl": "http:\/\/localhost:8080\/artists\/solace", '
                        '"attributionName": "Solace", '
                        '"licenseUrl": "http:\/\/creativecommons.org\/licenses\/by\/3.0\/"})')

    def testAttributionMetadata(self):
        """Test full metdata extraction."""

        self.getPage('/scrape?url=http://localhost:8080/static/attrib.html')
        self.assertStatus(200)
        self.assertBody('({"morePermissionsDomain": "magnatune.com", '
                        '"morePermissions": "https:\/\/magnatune.com\/artists\/Solace", '
                        '"attributionUrl": "http:\/\/localhost:8080\/artists\/solace", '
                        '"attributionName": "Solace", '
                        '"licenseUrl": "http:\/\/creativecommons.org\/licenses\/by\/3.0\/"})')

    def test404(self):
        """Errors resulting from page requests should result in am empty set."""

        self.getPage('/scrape?url=http://localhost:8080/static/a404.html')
        self.assertStatus(200)
        self.assertBody('({"morePermissionsDomain": "", '
                        '"morePermissions": "", "attributionUrl": "", '
                        '"attributionName": "", '
                        '"licenseUrl": ""})')

class AttributionTest(helper.CPWebCase):
    """Some pages will only contain attribution metadata."""

    def testFoo(self):

        self.getPage('/static/index.html')
        self.assertStatus(200)

def bootstrap_app():
    """Bootstrap the application and configuration for testing."""

    cherrypy.config.update({
            'environment' : 'test_suite'
            })

    # set up static files used for testing
    conf = {
        '/' : {'tools.staticdir.root' : 
               os.path.dirname(cc.deedscraper.__file__)},
        '/static' : {'tools.staticdir.on' : True,
                     'tools.staticdir.dir' : 'static'
                     },
        }
    
    cherrypy.tree.mount(cc.deedscraper.app.DeedScraper(), config=conf)

def runtests():
    """Start the application and run the tests."""

    bootstrap_app()
    helper.testmain()

if __name__ == '__main__':

    runtests()
