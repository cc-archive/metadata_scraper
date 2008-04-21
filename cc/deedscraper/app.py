## Copyright (c) 2006 Nathan R. Yergler, Creative Commons

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

import os
import sys
import gc
import cherrypy
import simplejson
import rdfadict
import urlparse

if sys.version < (2,5):
    # import set support
    from sets import Set as set

def jsondefault(func):
    """Decorator which catches any exceptions thrown by [func] and returns
    an empty JSON mapping ('{}') if [func] does not complete successfully.
    """
    
    def catch_wrapper(*args, **kwargs):

        try:
            return func(*args, **kwargs)
        except:
            return simplejson.dumps({})

    return catch_wrapper

class DeedScraper(object):

    @cherrypy.expose
    @jsondefault
    def scrape(self, url):

        cherrypy.response.headers['Content-Type'] = 'text/plain'

        # parse the RDFa from the document
        parser = rdfadict.RdfaParser() 
        triples = parser.parseurl(url)

        ns_cc = 'http://creativecommons.org/ns#'
        ns_wr = 'http://web.resource.org/cc/'
        ns_xh = 'http://www.w3.org/1999/xhtml#'
        ns_dc = 'http://purl.org/dc/elements/1.1/'

        # extract the bits we care about
        license_url = triples.setdefault(url, {}).get(
            ns_xh+'license', triples[url].get(
            ns_cc+'license', ['']))[0]
        #attr_name = triples[url].get(
        #   ns_cc+'attributionName', [''])[0]
        attr_name = triples.setdefault(url, {}).get(
            ns_cc+'attributionName', triples[url].get(
            ns_wr+'attributionName', ['']))[0]
        #attr_url =  triples[url].get(
        #    ns_cc+'attributionURL', [''])[0]
        attr_url = triples.setdefault(url, {}).get(
            ns_cc+'attributionURL', triples[url].get(
            ns_wr+'attributionURL', ['']))[0]
        #more_perms = triples[url].get(
        #    ns_cc+'morePermissions', [''])[0]
        more_perms = triples.setdefault(url, {}).get(
            ns_cc+'morePermissions', triples[url].get(
            ns_wr+'morePermissions', ['']))[0]
        more_perms_domain = urlparse.urlparse(more_perms)[1]

        # allow ads with non-commercial use?
        if ("http://creativecommons.org/ns#Advertising" in 
            triples.setdefault(url, {}).get(ns_cc + 'permission', [])):
           allow_ads = "Using this work on ad-supported sites is allowed."
        elif ("http://creativecommons.org/ns#Advertising" in 
            triples.setdefault(url, {}).get(ns_cc + 'prohibition', [])):
           allow_ads = "Using this work on ad-supported sites is prohibited."
        else:
           allow_ads = False

        # commerical rights / agent support
        commercial_license = triples.setdefault(url, {}).get(
            ns_cc+'commercialLicense', triples[url].get(
            ns_wr+'commercialLicense', ['']))[0]
        more_perms_agent = ''

        if commercial_license:
            # check for agent information
            dc_publisher = triples.setdefault(commercial_license, {}).get(
                ns_dc + 'publisher', [None])[0]

            if dc_publisher:
                more_perms_agent = triples.setdefault(dc_publisher, {}).get(
                    ns_dc + 'title', [''])[0]

        # assemble a dictionary to serialize
        attribution_info = {'licenseUrl':license_url,
                            'attributionName':attr_name,
                            'attributionUrl':attr_url,
                            'morePermissions':more_perms,
                            'morePermissionsDomain':more_perms_domain,
                            'morePermissionsAgent':more_perms_agent,
                            'allowAdvertising':allow_ads,
                            'commercialLicense':commercial_license,
                            }

        # return the data encoded as JSON
        result = "(%s)" % simplejson.dumps(attribution_info)
        gc.collect()

        return result

    @cherrypy.expose
    @jsondefault
    def triples(self, url):

        cherrypy.response.headers['Content-Type'] = 'text/plain'

        # parse the RDFa from the document
        parser = rdfadict.RdfaParser() 
        triples = parser.parseurl(url)

        ns_cc = 'http://creativecommons.org/ns#'
        ns_wr = 'http://web.resource.org/cc/'

        # mash web.resource assertions to cc.org/ns
        for s in triples.keys():

            # walk each predicate, checking if it's in the web.resource ns
            for p in triples[s].keys():

                if p.find(ns_wr) == 0:
                    # map this back to cc.org/ns#
                    triples[s][ns_cc + p[len(ns_wr):]] = triples[s][p]
                    del triples[s][p]
        
        # get a list of the keys and include it for convenience 
        subjects = triples.keys()[:]
        triples['_subjects'] = subjects

        # return the data encoded as JSON
        result = simplejson.dumps(triples)
        gc.collect()

        return result

if __name__ == '__main__':

    import server
    server.serve()
