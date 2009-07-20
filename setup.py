## Copyright (c) 2007-2008 Nathan R. Yergler, Creative Commons

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

from setuptools import setup, find_packages

setup(
    name = "cc.deedscraper",
    version = "0.3",

    packages = ['cc.deedscraper'],
    namespace_packages = ['cc'],
    package_dir = {'':'src'},

    # scripts and dependencies
    dependency_links = ['http://download.zope.org/distribution/'],
    install_requires = ['setuptools',
                        'rdfadict>=0.7.1',
                        'simplejson',
                        'web.py',
                        'decorator',
                        'WebTest',
                        'nose'
                        ],
    extras_require = {
        'fcgi': ['flup'],
        },

    entry_points = { 'console_scripts':
                         ['server = cc.deedscraper.server:serve',
                          'noop = cc.deedscraper.server:noop',
                          'scraper.fcgi = cc.deedscraper.server:fcgi',
                          ],
                     'paste.app_factory':
                         ['deedscraper=cc.deedscraper.server:app_factory',
                          ],
                     },

    test_suite = 'nose.collector',

    # author metadata
    author = 'Nathan R. Yergler',
    author_email = 'nathan@creativecommons.org',
    description = 'Attribution metadata extractor.',
    license = 'MIT',
    url = 'http://creativecommons.org/license',

    )
