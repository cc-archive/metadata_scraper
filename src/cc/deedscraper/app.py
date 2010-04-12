## Copyright (c) 2010 John E. Doig III Creative Commons

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

import gc
import cc.license

import web
import support
import metadata
import renderer

from scraper import ScrapeRequestHandler

web.config.debug = False

urls = (
    '/triples', 'Triples',
    '/deed',    'Referer',
     )

class Triples(ScrapeRequestHandler):

    def GET(self):
        triples = self._triples(web.input().get('url',''))
        return renderer.response(triples)

class Referer(ScrapeRequestHandler):

    def GET(self):

        # this is required argument
        url = web.input().get('url')
        license_uri = web.input().get('license_uri') or \
                      web.ctx.env.get('HTTP_REFERER')

        # fail on missing arguments - TODO -- FAIL, REALLY?
        if license_uri is None or url is None or \
           not license_uri.startswith('http://creativecommons.org/'):
            return renderer.response(dict(
                _exception='A license URI and a subject URI must be provided.'))

        # get a cc license object
        # cclicense = metadata.LicenseFactory.from_uri(license_uri)
        try:
            if 'deed' in license_uri:
                stripped_uri = license_uri[:(license_uri.rindex('/')+1)]
                cclicense = cc.license.by_uri(str(stripped_uri))
            else:
                cclicense = cc.license.by_uri(str(license_uri))
        except cc.license.CCLicenseError, e:
            return renderer.response(dict(_exception=unicode(e)))

        triples = self._triples(url, 'deed')
        if '_exception' in triples['subjects']:
            # should probably report the error but for now...
            return renderer.response(dict(
                _exception=triples['triples']['_exception']))

        # deeds include a lang attribute in <html>
        lang = support.get_document_locale( license_uri )
        if lang is None:
            # didn't find a lang attribute in the html
            lang = web.input().get('lang', 'en')
        # prepare to render messages for this lang
        renderer.set_locale(lang)
        
        subject = metadata.extract_licensed_subject(url, license_uri, triples)

        # returns dictionaries with values to cc-relevant triples
        attrib = metadata.attribution(subject, triples)
        regist = metadata.registration(url, triples, license_uri) 
        mPerms = metadata.more_permissions(subject, triples)
        
        results = {
            'attribution': {
                'details': renderer.render(
                    'attribution_details.html', {
                        'subject': subject,
                        'license': cclicense,
                        'attributionName': attrib['attributionName'],
                        'attributionURL': attrib['attributionURL'],
                        }),
                'marking': renderer.render(
                    'attribution_marking.html', {
                        'subject': subject,
                        'license': cclicense,
                        'attributionName': attrib['attributionName'],
                        'attributionURL': attrib['attributionURL'],
                        }),
                },
            'registration':     renderer.render('registration.html', regist),
            'more_permissions': renderer.render('more_permissions.html',
                                                dict(subject=subject, **mPerms)),
            
            }
        
        return renderer.response(results)


application = web.application(urls, globals(),)

if __name__ == "__main__": application.run()
