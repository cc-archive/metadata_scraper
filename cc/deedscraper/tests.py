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
import simplejson

import cherrypy
from cherrypy.test import helper

import cc.deedscraper.app

def formatted_response(**kwargs):
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
            }

    # update the response with any optional values provided
    for k in kwargs:
        result[k] = kwargs[k]
        
    return "(%s)" % simplejson.dumps(result)
    
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
        self.assertBody(formatted_response())
        
    def testLicenseMetadata(self):
        """Scrape an xhtml:license assertion."""

        self.getPage('/scrape?url=http://localhost:8080/static/license.html')
        self.assertStatus(200)
        self.assertBody(formatted_response(
            licenseUrl = r"http://creativecommons.org/licenses/by/3.0/")
                        )

    def testCcLicenseMetadata(self):
        """Scrape a cc:license assertion (with or without namespace declaration)."""

        # with namespace declaration
        self.getPage('/scrape?url=http://localhost:8080/static/license_only1.html')
        self.assertStatus(200)
        self.assertBody(formatted_response(
            licenseUrl = r"http://creativecommons.org/licenses/by/3.0/")
                        )

        # without namespace declaration
        self.getPage('/scrape?url=http://localhost:8080/static/license_only2.html')
        self.assertStatus(200)
        self.assertBody(formatted_response(
            licenseUrl = r"http://creativecommons.org/licenses/by/3.0/")
                        )

    def testDefaultccNamespace(self):
        """The cc: namespace defaults to http://web.resource.org/cc#"""

        self.getPage('/scrape?url=http://localhost:8080/static/cc_license.html')
        self.assertStatus(200)
        self.assertBody(formatted_response(
            morePermissionsDomain = r'magnatune.com',
            morePermissions = r'https://magnatune.com/artists/Solace',
            attributionUrl = r'http://localhost:8080/artists/solace',
            attributionName = r'Solace',
            licenseUrl = r"http://creativecommons.org/licenses/by/3.0/")
                        )

    def testAttributionMetadata(self):
        """Test full metdata extraction."""

        self.getPage('/scrape?url=http://localhost:8080/static/attrib.html')
        self.assertStatus(200)
        self.assertBody(formatted_response(
            morePermissionsDomain = r'magnatune.com',
            morePermissions = r'https://magnatune.com/artists/Solace',
            attributionUrl = r'http://localhost:8080/artists/solace',
            attributionName = r'Solace',
            licenseUrl = r"http://creativecommons.org/licenses/by/3.0/")
                        )

    def test404(self):
        """Errors resulting from page requests should result in am empty set."""

        self.getPage('/scrape?url=http://localhost:8080/static/a404.html')
        self.assertStatus(200)
        self.assertBody(formatted_response())
        
class AttributionTest(helper.CPWebCase):
    """Some pages will only contain attribution metadata."""

    def testFoo(self):

        self.getPage('/static/index.html')
        self.assertStatus(200)

    def testCommercialLicense(self):
        """Test extraction of commercial license URL [implemented for BUMA
        testing]."""

        self.getPage('/scrape?url=http://localhost:8080/static/test_buma.html')
        self.assertStatus(200)
        self.assertBody(formatted_response(
            licenseUrl = r'http://creativecommons.org/licenses/by-nc-sa/2.5/nl/',
            morePermissionsAgent = r'Buma/Stemra',
            commercialLicense = r'http://example.com/more_perms?work=foo')
                        )
        
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
