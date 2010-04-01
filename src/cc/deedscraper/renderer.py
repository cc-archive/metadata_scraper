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

import os
import web

from web.contrib.template import render_jinja
from support import get_hostname, add_qs_parameter
from cc.i18npkg.gettext_i18n import ugettext_for_locale 

try:
    import json
except ImportError:
    import simplejson as json

LOCALE = 'en_US'
TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), 'templates')

__all__ = ['set_locale', 'render', 'response']

def _gettext_for_current_locale(msg):
    return ugettext_for_locale(LOCALE)(msg)

def set_locale(locale):
    LOCALE = locale

TEMPLATE_GLOBALS = {
    'gettext' : _gettext_for_current_locale,
    }

TEMPLATE_FILTERS = {
    'hostname': get_hostname,
    'add_qs_parameter': add_qs_parameter,
    }
    
def render(template, context):
    jinja = render_jinja(
        TEMPLATE_PATH,
        globals=TEMPLATE_GLOBALS,
        extensions=['jinja2.ext.i18n'],
        encoding='utf-8',
        )
    jinja._lookup.filters.update(TEMPLATE_FILTERS)
    template = jinja._lookup.get_template(template)
    return template.render(**context)
    
def response(data):
    web.header("Content-Type", "application/json")
    return json.dumps(data)
