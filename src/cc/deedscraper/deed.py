# Minimal Creative Commons license selector module
import re

class License(object):
    """ Encapsulates CC License information into a Python object """ 
    def __init__(self, code, version, jurisdiction=None):
        # requires that a code and version be sepcified
        self._code = code # need to validate these parameters
        self.version = version # use a settr to validate
        self._jurisdiction = jurisdiction # optional, None means 'Unported'
        
    @property
    def jurisdiction(self):
        return self._jurisdiction or 'Unported'

    @property
    def code(self):
        return self._code == 'zero' and 'CC0' or self._code
    
    @property
    def uri(self):
        uri = ['http://creativecommons.org',
               self._code == 'zero' and 'publicdomain' or 'licenses',
               self._code,
               self.version]

        if self._jurisdiction:
            uri.append(self._jurisdiction)

        return '/'.join(uri) + '/'
    
    def __str__(self):
        return self.uri

class LicenseFactory:
    """ Factory for abstracting the selection and validation of CC Licenses """
    
    @staticmethod
    def from_uri(uri):

        std_base = 'http://creativecommons.org/licenses/'
        cc0_base = 'http://creativecommons.org/publicdomain/zero/'

        if 'deed' in uri:
            uri = uri[:uri.rindex('deed')]

        if uri.startswith(std_base) and uri.endswith('/'):
            raw_info = uri[len(std_base):]
            raw_info = raw_info.rstrip('/')
            info_list = raw_info.split('/')

            if len(info_list) not in (2,3):
                raise Exception, "Malformed Creative Commons License URI: <%s>" % uri

            retval = dict( code=info_list[0], version=info_list[1] )
            
            if len(info_list) > 2:
                retval['jurisdiction'] = info_list[2]

            return License(**retval)

        elif uri.startswith(cc0_base) and uri.endswith('/'):

            retval = dict(code='zero')
            retval['version'] = uri[len(cc0_base):].split('/')[0]
            if retval['version'] is '':
                raise Exception, "Malformed Creative Commons License URI: <%s>" % uri

            return License(**retval)

        else:
            raise Exception, "Malformed Creative Commons License URI: <%s>" % uri

CC = lambda part: "http://creativecommons.org/ns#%s" % part
SIOC = lambda part: "http://rdfs.org/sioc/ns#%s" % part
SIOC_SERVICE = lambda part: "http://rdfs.org/sioc/services#%s" % part
POWDER = lambda part: "http://www.w3.org/2007/05/powder#%s" % part
DCT = lambda part: "http://purl.org/dc/terms/%s" % part
XHTML = lambda part: "http://www.w3.org/1999/xhtml/vocab#%s" % part

def get_license_uri(subject, metadata):
    
    if subject not in metadata['subjects']:
        return None

    license = metadata['triples'][subject].get( XHTML('license') ) or \
              metadata['triples'][subject].get( DCT('license') ) or \
              metadata['triples'][subject].get( CC('license') ) or \
              None

    if license:
        return license[0]
    else:
        return None


def attribution_html(subject, license_uri, attribName='', attribURL=''): #triples=None):
    """ Form the copy & paste attribution HTML code for the given subject and
    license. """

    attribHTML = '<div xmlns:cc="http://creativecommons.org/ns#" about="%s">%%s</div>' % subject
    if attribURL:
        marking = '<a rel="cc:attributionURL"%%shref="%s">%%s</a>' % attribURL
        if attribName:
            marking = marking % (' property="cc:attributionName" ', attribName,)
        else:
            marking = marking % (' ', attribURL,)
    elif attribName:
        marking = '<span property="cc:attributionName">%s</span>' % attribName
    else:
        marking = '<span>%s</span>' % subject

    l = LicenseFactory.from_uri(license_uri)
    marking += ' / <a rel="license" href="%s">CC %s %s</a>' % (l,
                                                               l.code.upper(),
                                                               l.version)

    attrib = { 'marking' : attribHTML % marking }

    if attribURL and attribName:
        # this needs i18n'ing
        det = 'You must attribute this work to <a href="%s">%s</a> (with link).' % \
              (attribURL, attribName)
        attrib['details'] = det
        
    return attrib


"""
Deed work registration detection specific functions
"""

def match_iriset(metadata, iriset, subject):

    if iriset.has_key(POWDER('includeregex')):

        for regex in iriset[POWDER('includeregex')]:
            
            if re.compile(regex).search(subject) is None:
                # the subject didn't match one of the includeregex's
                return False

    if iriset.has_key(POWDER('excluderegex')):

        for regex in iriset[POWDER('excluderegex')]:
            
            if re.compile(regex).search(subject) is not None:
                # the subject matched one of the excluderegex's
                return False

    return True

def get_lookup_uri(network, metadata, work_uri=None):

    cc_protocol_uri = "http://wiki.creativecommons.org/work-lookup"

    if network not in metadata['subjects'] or \
       not metadata['triples'][network].has_key(SIOC_SERVICE('has_service')):
        return None

    for service in metadata['triples'][network][SIOC_SERVICE('has_service')]:
        
        if service in metadata['subjects'] and \
           metadata['triples'][service].has_key(SIOC_SERVICE('service_protocol')) and \
           cc_protocol_uri in metadata['triples'][service][SIOC_SERVICE('service_protocol')]:

            if work_uri:
                return service + "?uri=" + work_uri
            else:
                return service

    return None

def registration_html(owner_url, owner_name, network_url, network_name, lookup_uri):

    html = _('<a href="%(owner_url)s">%(owner_name)s</a>has registered <a href="%(lookup_uri)s">this work</a> at the <nobr><a href="%(network_url)s">%(network_name)s</a></nobr>.') % locals()
    return html
        

def is_registered(subject, license_uri, metadata=None):
    """ Checks for work registration assertions """

    # shorthand accessor
    triples = metadata['triples']

    # first check for a has_owner assertion
    if subject not in metadata['subjects'] or \
       not triples[subject].has_key(SIOC('has_owner')):
        return False

    # an assertion exists
    owner_url = triples[subject][SIOC('has_owner')][0]

    if owner_url not in metadata['subjects'] or \
       not triples[owner_url].has_key(SIOC('owner_of')):
        # nothing to see here folks
        return False

    if subject in triples[owner_url][SIOC('owner_of')]:
        # woot, success!
        return True

    # check to see if the subject matches an iriset
    for work in triples[owner_url][SIOC('owner_of')]:
        # filter out subjects that don't share the same license (why?)
        if get_license_uri(work, metadata) == license_uri and \
               triples[work].has_key(SIOC('has_parent')):

            parent = triples[work][SIOC('has_parent')][0]

            if triples[parent].has_key(POWDER('iriset')) and \
                   match_iriset(metadata,
                                triples[parent][POWDER('iriset')],
                                subject):

                return True

    return False






def attribution(lang, subject, license_uri, metadata=None):
    
    if subject not in metadata['subjects']:
        return None

    attribName = metadata['triples'][subject].get( CC('attributionName'), '')
    attribURL = metadata['triples'][subject].get( CC('attributionURL'), '')

    if attribName == '' and attribURL == '':
        return None

    return attribution_html(subject, license_uri, attribName[0], attribURL[0])


def registration(lang, subject, license_uri, metadata=None):

    if not is_registered(subject, license_uri, metadata):
        return None
    
    try:
        # retrieve the relevant information
        owner = metadata['triples'][subject][SIOC('has_owner')][0]
        owner_name = metadata['triples'][owner][SIOC('name')][0]
        network_url = metadata['triples'][owner][SIOC('member_of')][0]
        network_name = metadata['triples'][network_url][DCT('title')][0]

        lookup_uri = get_lookup_uri(network_url, metadata, subject)

        if lookup_uri is None:
            return ''
        
        return registration_html(owner, owner_name, network_url,
                                 network_name, lookup_uri)

    except KeyError:
        # if any of the attributes aren't included, then return nothing
        return None
    

if __name__ == '__main__':

    
    import simplejson as json
    import urllib2
    test_url = 'http://code.creativecommons.org/~john/deed_test.html'
    metadata = json.loads(urllib2.urlopen('http://creativecommons.org/apps/triples?url='+test_url).read())

    cc_by_3 = LicenseFactory.from_uri('http://creativecommons.org/licenses/by/3.0/us/')
    cc_zero = LicenseFactory.from_uri('http://creativecommons.org/publicdomain/zero/1.0/')
    cc_deed = LicenseFactory.from_uri('http://creativecommons.org/licenses/by/2.0/deed.en')

    assert cc_by_3.uri == 'http://creativecommons.org/licenses/by/3.0/us/'
    assert cc_by_3.code == 'by'
    assert cc_by_3.version == '3.0'
    assert cc_by_3.jurisdiction == 'us'
    assert cc_zero.uri == 'http://creativecommons.org/publicdomain/zero/1.0/'
    assert cc_zero.code == 'CC0'
    assert cc_zero.version == '1.0'
    assert cc_zero.jurisdiction == 'Unported'
    assert cc_deed.uri == 'http://creativecommons.org/licenses/by/2.0/'
    assert cc_deed.code == 'by'
    assert cc_deed.version == '2.0'
    assert cc_deed.jurisdiction == 'Unported'
    
    # TODO add rudimentary validation to input so this fails
    cc_by_sa_3 = License('by-sa', '3.0', 'FART')

    attrib1 = attribution_html("http://example.com", cc_by_3.uri, "John Doig")
    attrib2 = attribution_html("http://example.com", cc_by_3.uri, None, "http://example.com")
    attrib3 = attribution_html("http://example.com", cc_by_3.uri, "John Doig", "http://doig.me")
    attrib4 = attribution_html("http://example.com", cc_by_3.uri)

    assert attrib1.has_key('marking') and 'cc:attributionName' in attrib1['marking']
    assert attrib2.has_key('marking') and 'cc:attributionURL' in attrib2['marking']
    assert attrib3.has_key('details')
    assert attrib4.has_key('marking') 

    assert is_registered(test_url, "http://creativecommons.org/licenses/by/3.0/", metadata)
    assert not is_registered("http://code.creativecommons.org/~john/attrib_test.html",
                             "http://creativecommons.org/licenses/by/3.0/",
                             metadata)
    
    reg_html = registration(test_url, "http://creativecommons.org/licenses/by/3.0/", metadata)
    
    
