*********************
Deed Metadata Scraper
*********************

:Date: $LastChangedDate$
:Version: $LastChangedRevision$
:Author: Nathan R. Yergler <nathan@creativecommons.org>
:Organization: `Creative Commons <http://creativecommons.org>`_
:Copyright: 
   2006-2007, Nathan R. Yergler, Creative Commons; 
   licensed to the public under the `MIT license 
   <http://opensource.org/licenses/mit-license.php>`_.

Overview
########

The deed metadata scraper provides a simple web interface for extracting
RDFa metadata from a given URL.  The metadata is returned in `JSON 
<http://json.org>`_ format, which is used by the referrer-metadata.js script
to update a Creative Commons deed with attribution links.

Installation
############

The server and dependencies may be deployed using a combination of
Subversion and `zc.buildout <http://cheeseshop.python.org/pypi/zc.buildout/>`_.
For example::

  $ svn co https://svn.sourceforge.net/svnroot/cctools/metadata_scraper
  $ cd metadata_scraper
  $ python bootstrap/bootstrap.py
  $ ./bin/buildout

Running the ``buildout`` command will download any uninstalled dependencies
as Python Eggs and place them in an ``./eggs`` sub-directory.  It will also
create a script in ``./bin``, ``paster``, which can be used to run the 
metadata scaper as an independent server process.  

> note:: zc.buildout is intended for use as an installation
> construction tool, and as such "bakes in" explicit paths to eggs it
> downloads.  If it is necessary to move an installation of the
> software, you *must* run ``buildout`` again.

Testing
#######

``cc.deedscraper`` ships with a test runner::

  $ ./bin/python cc/deedscraper/tests.py

Note that ``./bin/python`` is a script created by zc.buildout which starts a
Python interpreter with the application dependency eggs on the PYTHONPATH.

Running the Server
##################

cc.deedscraper is a `WSGI <http://wsgi.org/wsgi>`_ application, and can be 
run in a variety of containers.  The buildout will install and create a 
script for running the application using CherryPy's built-in web server, 
with the process managed by `zdaemon <http://python.org/pypi/zdaemon>`_.

Before running the server a configuration file must be created.  A sample file,
``local.conf.sample``, is provided in the ``cc.deedscraper`` package.  Simply
copy this file to ``local.conf`` for the default settings.

To start the application run::

  $ ./bin/zdaemon -C scraper_zd.conf start

Stopping the application is predictably done with::

  $ ./bin/zdaemon -C scraper_zd.conf stop

An interactive console can be access by running::

  $ ./bin/zdaemon -C scraper_zd.conf

Type ``help`` within the console to see a full list of available commands.

Support
#######

Problems? Write to us at hackers@creativecommons.org or send us a pull request...

Updated: April 2014.
