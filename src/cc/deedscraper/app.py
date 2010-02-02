## Copyright (c) 2006-2009 Nathan R. Yergler, Creative Commons

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
import rdfadict
import urlparse
import logging
import urllib2

import web
web.config.debug = True

from deed import DeedReferer

try:
    import json
except ImportError:
    import simplejson as json

from decorator import decorator
from support import LOG
from i18n_support import *

from rdfadict.sink import DictSetTripleSink

FOLLOW_PREDICATES = (
     'http://www.w3.org/1999/02/22-rdf-syntax-ns#seeAlso',
     'http://rdfs.org/sioc/ns#has_owner',
     )

urls = (
    '/deed', 'Extras',
    '/triples', 'Triples',
    '/scrape',  'Scrape',
    )

def LogResult(log, level=logging.INFO):
    def _logging(f, *args, **kw):
        result = f(*args, **kw)
        log.log(level, result)
        return result
    return decorator(_logging)

class TripleRedirectHandler(urllib2.HTTPRedirectHandler):
    def __init__(self, redirects, *args, **kwargs):
        self.redirects = redirects
        urllib2.HTTPRedirectHandler(*args, **kwargs)
    def http_error_301 (self, req, fp, code, msg, headers):
        self.redirects[headers['Location']] = req.get_full_url()
        return urllib2.HTTPRedirectHandler.http_error_301(
            self, req, fp, code, msg, headers)
    def http_error_302 (self, req, fp, code, msg, headers):
        self.redirects[headers['Location']] = req.get_full_url()
        return urllib2.HTTPRedirectHandler.http_error_302(
            self, req, fp, code, msg, headers)

class TripleDictSink(DictSetTripleSink):
    def __init__(self, redirects, *args, **kwargs):
        self.redirects = redirects
        super(TripleDictSink, self).__init__(*args, **kwargs)
    def triple(self, s, p, o):
        super(TripleDictSink, self).triple(s,p,o)
        # DictSetTripleSink enforces unicode
        if str(s) in self.redirects.keys():
            super(TripleDictSink, self).triple(self.redirects[str(s)],p,o)
    
class ScrapeRequestHandler(object):

    def _load_source(self, url, subjects=None, sink=None, depth=2, redirects=None):
        
        # bail out if we've hit the parsing limit
        if depth < 0:
            return sink
        
        if redirects is None:
            redirects = {}
            
        parser = rdfadict.RdfaParser() 
        if subjects is None: subjects = []

        try:
            
            # load the specified URL and parse the RDFa
            opener = urllib2.build_opener( TripleRedirectHandler(redirects) )
            request = urllib2.Request(url)
            request.add_header('User-Agent',
                     'CC Metadata Scaper http://wiki.creativecommons.org/Metadata_Scraper')
            contents= opener.open(request).read()
            subjects.append(url)

            # default to a set-based triple sink
            if sink is None:
                sink = TripleDictSink(redirects)

            triples = parser.parse_string(contents, url, sink)

            # look for possible predicates to follow
            for s in triples.keys():
                for p in triples[s].keys():
                    if p in FOLLOW_PREDICATES:

                        # for each value of the predicate to follow
                        for o in triples[s][p]:

                            # follow if we haven't already looked here
                            if o not in subjects:
                                self._load_source(o, subjects, triples,
                                                  depth - 1, redirects)

        except Exception, e:
            triples = {'_exception': str(e)}

        return triples

        
    @LogResult(LOG)
    def _triples(self, url, action='triples'):

        # initialize the result
        result = dict(
            source = url,
            action = action,
            referer = web.ctx.environ.get('HTTP_REFERER', '-')
            )

        # track redirects
        self.r={}
        
        # parse the RDFa from the document
        triples = self._load_source(url)

        # post-process the Object sets into lists
        for s in triples.keys():
            if s[:1] == '_': continue

            for p in triples[s].keys():
                triples[s][p] = list(triples[s][p])
        
        ns_cc = 'http://creativecommons.org/ns#'
        ns_wr = 'http://web.resource.org/cc/'

        # mash web.resource assertions to cc.org/ns
        for s in triples.keys():

            if s[:1] == '_': continue

            # walk each predicate, checking if it's in the web.resource ns
            for p in triples[s].keys():

                if p.find(ns_wr) == 0:
                    # map this back to cc.org/ns#
                    triples[s][ns_cc + p[len(ns_wr):]] = triples[s][p]
                    del triples[s][p]
                    
        # add the triples to the result
        result['triples'] = triples
        result['subjects'] = triples.keys()
        gc.collect()

        return result

class Triples(ScrapeRequestHandler):

    def GET(self):

        web.header("Content-Type","text/plain")
        return json.dumps(self._triples(web.input().get('url','')))

class Scrape(ScrapeRequestHandler):
    
    def GET(self):

        url = web.input().get('url', '')

        # parse the RDFa from the document
        triples = self._triples(url, 'scrape')['triples']

        ns_cc = 'http://creativecommons.org/ns#'
        ns_xh = 'http://www.w3.org/1999/xhtml/vocab#'
        ns_dc = 'http://purl.org/dc/elements/1.1/'

        # extract the bits we care about
        license_url = triples.setdefault(url, {}).get(
            ns_xh+'license', triples[url].get(
            ns_cc+'license', ['']))[0]

        attr_name = triples.setdefault(url, {}).get(
            ns_cc+'attributionName', [''])[0]

        attr_url = triples.setdefault(url, {}).get(
            ns_cc+'attributionURL', [''])[0]

        more_perms = triples.setdefault(url, {}).get(
            ns_cc+'morePermissions', [''])[0]
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
            ns_cc+'commercialLicense', [''])[0]
        more_perms_agent = ''

        if commercial_license:
            # check for agent information
            dc_publisher = triples.setdefault(commercial_license, {}).get(
                ns_dc + 'publisher', [None])[0]

            if dc_publisher:
                more_perms_agent = triples.setdefault(dc_publisher, {}).get(
                    ns_dc + 'title', [''])[0]

        # assemble a dictionary to serialize
        attribution_info = {'_action':'scrape',
                            '_source':url,
                            'licenseUrl':license_url,
                            'attributionName':attr_name,
                            'attributionUrl':attr_url,
                            'morePermissions':more_perms,
                            'morePermissionsDomain':more_perms_domain,
                            'morePermissionsAgent':more_perms_agent,
                            'allowAdvertising':allow_ads,
                            'commercialLicense':commercial_license,
                            }

        # return the data encoded as JSON
        gc.collect()

        web.header("Content-Type","text/plain")
        return json.dumps(attribution_info)

class Extras(ScrapeRequestHandler):

    def GET(self):
        url = web.input().get('url','')
        license_uri = web.input().get('license_uri',
                                      web.ctx.env.get('HTTP_REFERER', ''))

        web.header("Content-Type","text/plain")
        
        if license_uri == '' or url == '':
            return json.dumps({'_exception':'A license URI and a subject URI must be provided.'})

        triples = self._triples(url)
        if '_exception' in triples['subjects']:
            # should probably report the error but for now...
            return json.dumps(triples)

        license_deed_html = urllib2.urlopen(license_uri).read()
        lang = get_document_locale( license_deed_html )
        if lang is None:
            # didn't find a lang attribute in the root html element
            lang = web.input().get('lang', 'en')

        # grab the cc_org catalog to get the available languages
        lang_code = negotiate_locale(lang, lang_codes(ccorg_catalog()))
       
        referer = DeedReferer(subject=url,
                              license_uri=license_uri,
                              metadata=triples)
        
        return json.dumps( referer.notices(lang_code) )
    
application = web.application(urls,
            dict(Triples = Triples,
                 Scrape = Scrape,
                 Extras = Extras,))
                              
if __name__ == "__main__": 
    application.run()
    
