
import os
try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

def read(*rnames):
    return open(os.path.join(os.path.dirname(__file__), *rnames)).read()

setup(
    name = "wsgi_intercept",
    version = "0a1",
    packages = ['wsgi_intercept'],

    install_requires = ['setuptools'],

    # depedencies for individual framework support
    extras_require = {'zope_testbrowser':['zope.testbrowser', 'ClientCookie']},
    
    include_package_data = True,
    zip_safe = True,

    author = 'Titus Brown',
    author_email = 'titus@idyll.org',
    description = 'XXX .',
    long_description=(
         read('README.txt')
         + '\n' +
         'Download\n'
         '********\n'
         ),
    license = 'Unknown',
    url = 'http://darcs.idyll.org/~t/projects/wsgi_intercept/',

    )
