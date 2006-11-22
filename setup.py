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

from setuptools import setup, find_packages

setup(
    name = "cc.deedscraper",
    version = "0.1",
    packages = find_packages('src'),
    package_dir = {'':'src'},

    # scripts and dependencies
    install_requires = ['setuptools',
                        'rdfadict',
                        'simplejson',
                        'CherryPy>=3.0beta2',
                        'PasteScript[WSGIUtils]',
                        ],
    namespace_packages = ['cc'],

    entry_points = { 'console_scripts':
                     ['server = cc.deedscraper.server:serve',
                      'paster = paste.script.command:run',
                      ],
                     'paste.app_factory':
                     ['deedscraper = cc.deedscraper.server:app_factory',
                      ],
                     },

    # author metadata
    author = 'Nathan R. Yergler',
    author_email = 'nathan@creativecommons.org',
    description = 'Scrape .',
    license = 'MIT',
    url = 'http://mta.sciencecommons.org',

    )
