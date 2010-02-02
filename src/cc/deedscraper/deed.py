# support functions for metadata extraction
# make this employ __all__
from metadata import extract_licensed_subject
from metadata import extract_attribution
from metadata import extract_registration
from metadata import extract_more_permissions
from metadata import LicenseFactory

from i18n_support import translate, gettext as _

from urllib import urlencode
from urlparse import urlparse, urlunparse
try:
    from urllib import parse_qs
except:
    from cgi import parse_qs

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

class DeedReferer:
    
    def __init__(self, subject, license_uri, metadata):
        
        self.license_uri = license_uri
        self.metadata = metadata
        self.subject = subject

    def notices (self, lang='en'):

        deed_notices = dict( attribution=None,
                             registration=None,
                             more_permissions=None )
        
        self.subject = extract_licensed_subject(self.subject,
                                                self.license_uri,
                                                self.metadata)
        
        if self.subject is None:
            return deed_notices

        deed_notices['attribution'] = self.attribution(lang)
        deed_notices['registration'] = self.registration(lang)
        deed_notices['more_permissions'] = self.more_permissions(lang)

        return deed_notices

    def registration (self, lang='en'):

        reg_info = extract_registration(self.subject,
                                        self.license_uri,
                                        self.metadata)
        if not reg_info:
            return None

        reg_notice = _('deed.popup.registration',
                       default='<a href="${owner_url}">${owner_name}</a> has registered <a href="${lookup_uri}">this work</a> at the <nobr><a href="${network_url}">${network_name}</a></nobr>.',
                       mapping=reg_info)
        
        return translate(reg_notice, target_language=lang)

    def attribution(self, lang='en'):

        attribName, attribURL = extract_attribution(self.subject,
                                                    self.license_uri,
                                                    self.metadata)

        # if neither of the cc attribution predicates were found then there's
        # nothing to do from here on
        if not attribName and not attribURL:
            return None
        
        attribHTML = '<div xmlns:cc="http://creativecommons.org/ns#" about="%s">%%s</div>' % self.subject
        if attribURL:
            # need to include an anchor tag to the author's url
            marking = '<a rel="cc:attributionURL" %%shref="%s">%%s</a>' % attribURL

            # if an attributionName was specified, then that value should be the
            # text of the anchor link and also reference that object using rdfa
            if attribName: 
                marking = marking % ('property="cc:attributionName" ', attribName,)
            else:
                marking = marking % ('', attribURL,)
        elif attribName:
            marking = '<span property="cc:attributionName">%s</span>' % attribName
        else:
            marking = '<span>%s</span>' % self.subject

        # get a license object that'll parse the uri for the code and version
        l = LicenseFactory.from_uri(self.license_uri)
        marking += ' / <a rel="license" href="%s">CC %s %s</a>' % (l,
                                                                   l.code.upper(),
                                                                   l.version)

        attrib = { 'marking' : attribHTML % marking, 'details':None }

        if attribURL and attribName:

            details = _('deep.popup.attribution',
                        default='You must attribute this work to <a href="${attribURL}">${attribName}</a> (with link).',
                        mapping={'attribURL':attribURL,'attribName':attribName})

            attrib['details'] = translate(details, target_language=lang)

        return attrib


    def more_permissions(self, lang='en'):
        
        (morePermURLs, 
         commLicense,
         morePermAgent) = extract_more_permissions(self.subject, self.metadata)

        more_perms = ''
        
        if morePermURLs:

            links = [] # anchor tags to all of the morePermissionURLs
            for url in morePermURLs:
                links.append(
                    '<strong><a href="%(cc-referer)s">%(hostname)s</a></strong>' % {
                    'cc-referer': add_qs_parameter(url, 'cc-referer', self.subject),
                    'hostname': urlparse(url).netloc })
            
            more_perms_text = _('deed.popup.morepermissions',
                                default='<strong>Permissions beyond</strong> the scope of this public license are available at ${morePermissionURLs}.',
                                mapping={'morePermissionURLs':', '.join(links)})

            more_perms = translate(more_perms_text, target_language=lang)

        # part of a pilot project... language is in Dutch and shouldnt be
        # translated for right now
        if commLicense and morePermAgent:
            if more_perms: more_perms += '<br />'
            more_perms += '<strong>Commerciele Rechten</strong>. ' # removed Dutch e char
            more_perms += 'Licenties voor commercieel gebruik zijn via'
            more_perms += ' <strong><a href="%s">' % commLicense
            more_perms += '%s</a></strong> verkrijgbaar.' % morePermAgent

        return more_perms or None
