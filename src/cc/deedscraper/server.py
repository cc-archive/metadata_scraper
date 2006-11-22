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

import cherrypy

def serve(host='localhost', port=8082):
    """Run the application using CherryPy's built-in server."""

    from app import DeedScraper
    
    cherrypy.tree.mount(DeedScraper())

    cherrypy.server.socket_host = host
    cherrypy.server.socket_port = port
    cherrypy.server.quickstart()
    cherrypy.engine.start()

def app_factory(*args):
    """Application factory for use with Python Paste deployments."""

    from app import DeedScraper
    
    wsgi_app = cherrypy.Application(DeedScraper(), '/')

    cherrypy.engine.autoreload_match = None
    cherrypy.engine.start(blocking=False)
    
    return wsgi_app
