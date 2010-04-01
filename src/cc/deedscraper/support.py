## Copyright (c) 2008 Nathan R. Yergler, Creative Commons

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

"""Logging support for Metadata Scraper."""

import os
import logging
import logging.config
import urllib2
from urllib import urlencode
from urlparse import urlparse, urlunparse
try:
    from urllib import parse_qs
except:
    from cgi import parse_qs


__all__ = ['LOG', 'get_document_locale']

# configure logging
CONF_DIR = os.path.dirname(__file__)

while not os.path.exists(os.path.join(CONF_DIR, 'log.ini')):
    CONF_DIR = os.path.join(CONF_DIR, '..')

logging.config.fileConfig(os.path.join(CONF_DIR, 'log.ini'))
LOG = logging.getLogger('cc.deedscraper')

def get_document_locale(url):
    """ Parses the document residing at the provided url and returns the HTML
    lang attribute value if it exists. """
    try:
        doc = urllib2.urlopen(url)
        data = StringIO(doc.read())
        tree = etree.parse(data, etree.HTMLParser())
        return tree.getroot().get('lang', None)
    except: # catch shit from StringIO, urllib, or lxml 
        return None

def add_qs_parameter(url, key, value):

    url = urlparse(url)
    query = parse_qs(url.query)
    query[key] = [value]
    query_string = urlencode( dict([ (k,v[0]) for k,v in query.items()]) )

    return urlunparse((url.scheme,
                       url.netloc,
                       url.path,
                       url.params,
                       query_string,
                       url.fragment))

def get_hostname(url):
    return urlparse(url).netloc
