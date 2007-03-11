=======================================================
wsgi_intercept: in-process testing of WSGI applications
=======================================================

Pursuant to Ian Bicking's `"best Web testing framework"`_ post,
I put together an `in-process HTTP-to-WSGI interception mechanism`_ for
my own Web testing system, twill_.  Because the mechanism is pretty
generic -- it works at the httplib level -- I decided to try adding it into
all of the *other* Python Web testing frameworks.

This is the result.

Loosely speaking, this library lets you intercept calls to any specific
host/port combination and redirect them into a `WSGI application`_.  Thus,
you can avoid spawning multiple processes or threads to test your Web app.
The interception works by subclassing httplib.HTTPConnection and installing
it as a handler for 'http' requests; requests that aren't intercepted are
passed on to the standard handler.

Unfortunately each of the Web testing frameworks uses its own specific
mechanism for making HTTP call-outs, so it's impossible to write something
completely generic.  Nonetheless it's not difficult to patch or wrap any of
the existing frameworks to support the interception behavior.

Enjoy!

Titus Brown, *titus@caltech.edu*, Feb 27, 2006.

General Info
============

``wsgi_intercept`` works by replacing ``httplib.HTTPConnection`` with
a subclass, ``wsgi_intercept.WSGI_HTTPConnection``.  This class then
redirects specific server/port combinations into a WSGI application
by emulating a socket.

The functions ``add_wsgi_intercept(host, port, app_create_fn, script_name='')``
and ``remove_wsgi_intercept(host,port)`` specify which URLs should be
redirect into what applications.  Note especially that ``app_create_fn`` is
a *function object* returning a WSGI application; ``script_name`` becomes
``SCRIPT_NAME`` in the WSGI app's environment, if set.

The code in this package should be treated with care & ripped off rather than
imported or re-used! ;).  You can download it at http://darcs.idyll.org/~t/projects/wsgi_intercept-latest.tar.gz, and a darcs repository is available at
http://darcs.idyll.org/~t/projects/wsgi_intercept/.

Mocking your HTTP Server
------------------------

Marc Hedlund has gone one further, and written a full-blown mock HTTP
server for wsgi_intercept.  Combined with wsgi_intercept itself, this
lets you entirely replace client calls to a server with a mock setup
that hits neither the network nor server code.  You can see his work
in the file ``mock_http.py``.  Run ``mock_http.py`` to see a test.

Packages Intercepted
====================

urllib2
-------

urllib2_ is a standard Python module, and ``urllib2.urlopen`` is a pretty
normal way to open URLs.

The following code will install the WSGI intercept stuff as a default
urllib2 handler: ::

   import wsgi_urllib2
   wsgi_urllib2.install_opener()

The only tricky bit in there is that different handler classes need to
be constructed for Python 2.3 and Python 2.4, because the httplib
interface changed between those versions.

webtest
-------

webtest_ is an extension to ``unittest`` that has some nice functions for
testing Web sites.

To install the WSGI intercept handler, do ::

    class WSGI_Test(webtest.WebCase):
        HTTP_CONN = wsgi_intercept.WSGI_HTTPConnection
        HOST='localhost'
        PORT=80

        def setUp(self):
            wsgi_intercept.add_wsgi_intercept(self.HOST, self.PORT, create_fn)

webunit
-------

webunit_ is another unittest-like framework that contains nice functions
for Web testing.  (funkload_ uses webunit, too.)

webunit needed to be patched to support different scheme handlers.
The patched package is in webunit/wsgi_webunit/, and the only
file that was changed was webunittest.py; the original is in
webunittest-orig.py.

To install the WSGI intercept handler, do ::

    from httplib import HTTP

    class WSGI_HTTP(HTTP):
        _connection_class = WSGI_HTTPConnection

    class WSGI_WebTestCase(WebTestCase):
        scheme_handlers = dict(http=WSGI_HTTP)

        def setUp(self):
            wsgi_intercept.add_wsgi_intercept('127.0.0.1', 80, create_fn)

mechanoid
---------

mechanoid_ is a fork of mechanize_.

mechanoid is pretty easy; just use ::

   wsgi_intercept.add_wsgi_intercept('localhost', 80, create_fn)

   from wsgi_browser import Browser
   b = Browser()

mechanize
---------

mechanize_ is John J. Lee's port of Perl's WWW::Mechanize to Python.
It mimics a browser.  (It's also what's behind twill_.)

mechanize is just as easy as mechanoid: ::

   wsgi_intercept.add_wsgi_intercept('localhost', 80, create_fn)

   from wsgi_browser import Browser
   b = Browser()

zope.testbrowser
----------------

zope.testbrowser_ is a prettified interface to mechanize_ that is used
primarily for testing Zope applications.

zope.testbrowser is also pretty easy: ::

   wsgi_intercept.add_wsgi_intercept('localhost', 80, create_fn)

   from wsgi_testbrowser import WSGI_Browser
   b = WSGI_Browser()

.. _urllib2: http://docs.python.org/lib/module-urllib2.html
.. _webtest: http://www.cherrypy.org/file/trunk/cherrypy/test/webtest.py
.. _webunit: http://mechanicalcat.net/tech/webunit/
.. _mechanize: http://wwwsearch.sf.net/
.. _mechanoid: http://www.python.org/pypi/mechanoid/
.. _zope.testbrowser: http://www.python.org/pypi/zope.testbrowser
.. _twill: http://www.idyll.org/~t/www-tools/twill.html
.. _"best Web testing framework": http://blog.ianbicking.org/best-of-the-web-app-test-frameworks.html
.. _in-process HTTP-to-WSGI interception mechanism: http://www.advogato.org/person/titus/diary.html?start=119
.. _WSGI application: http://www.python.org/peps/pep-0333.html
.. _funkload: http://funkload.nuxeo.org/