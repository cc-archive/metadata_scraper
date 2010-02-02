""" bootstrap the ccorg translations """
from cc.i18npkg import ccorg_i18n_setup
from zope import component
from zope.i18n.interfaces import ITranslationDomain

""" translation mechanisms """ 
from zope.i18nmessageid import MessageFactory
from zope.i18n import translate

gettext = MessageFactory('cc_org')

""" i18n language negotiation and discovery support """
from lxml import etree
from StringIO import StringIO
import urllib2

LOCALE_ALIASES = {
    'ar': 'ar_SY', 'bg': 'bg_BG', 'bs': 'bs_BA', 'ca': 'ca_ES', 'cs': 'cs_CZ', 
    'da': 'da_DK', 'de': 'de_DE', 'el': 'el_GR', 'en': 'en_US', 'es': 'es_ES', 
    'et': 'et_EE', 'fa': 'fa_IR', 'fi': 'fi_FI', 'fr': 'fr_FR', 'gl': 'gl_ES', 
    'he': 'he_IL', 'hu': 'hu_HU', 'id': 'id_ID', 'is': 'is_IS', 'it': 'it_IT', 
    'ja': 'ja_JP', 'km': 'km_KH', 'ko': 'ko_KR', 'lt': 'lt_LT', 'lv': 'lv_LV', 
    'mk': 'mk_MK', 'nl': 'nl_NL', 'nn': 'nn_NO', 'no': 'nb_NO', 'pl': 'pl_PL', 
    'pt': 'pt_PT', 'ro': 'ro_RO', 'ru': 'ru_RU', 'sk': 'sk_SK', 'sl': 'sl_SI', 
    'sv': 'sv_SE', 'th': 'th_TH', 'tr': 'tr_TR', 'uk': 'uk_UA'
}

def ccorg_catalog():
    return component.queryUtility(ITranslationDomain, 'cc_org')

def lang_codes(catalog):
    """ returns the list of lang codes available in a catalog """
    return catalog.getCatalogsInfo().keys()

def negotiate_locale(locale, available, sep='_', aliases=LOCALE_ALIASES):
    """ Taken from Babel's core.py """
    available = [a.lower() for a in available if a]
    ll = locale.lower()
    if ll in available:
        return locale
    if aliases:
        alias = aliases.get(ll)
        if alias:
            alias = alias.replace('_', sep)
            if alias.lower() in available:
                return alias
    parts = locale.split(sep)
    if len(parts) > 1 and parts[0].lower() in available:
        return parts[0]
    return None

def get_document_locale(data):
    """ Parses the document residing at the provided url and returns the HTML
    lang attribute value if it exists. """
    try:
        data = StringIO(data)
        tree = etree.parse(data, etree.HTMLParser())
        return tree.getroot().get('lang', None)
    except:
        return None

    
