import re
from string import Template

# RDF predicate shortcut functions 
CC = lambda part: "http://creativecommons.org/ns#%s" % part
SIOC = lambda part: "http://rdfs.org/sioc/ns#%s" % part
SIOC_SERVICE = lambda part: "http://rdfs.org/sioc/services#%s" % part
POWDER = lambda part: "http://www.w3.org/2007/05/powder#%s" % part
DCT = lambda part: "http://purl.org/dc/terms/%s" % part
XHTML = lambda part: "http://www.w3.org/1999/xhtml/vocab#%s" % part

class License(object):
    """ Encapsulates CC License information into a Python object """ 
    def __init__(self, code, version=None, jurisdiction=None):
        # requires that a code and version be sepcified
        self._code = code # need to validate these parameters
        self.version = version # publicdomain certificate is unversioned
        self._jurisdiction = jurisdiction # optional, None means 'Unported'
        
    @property
    def jurisdiction(self):
        """ if the jurisdiction is not set, then represent as Unported """
        return self._jurisdiction or 'Unported'

    @property
    def code(self):
        """ the correct repr for cc zero is 'CC0' """
        return self._code == 'zero' and 'CC0' or self._code
    
    @property
    def uri(self):
        """ return the correct uri for the license, cc0 is not located
        at /licenses/ """
        uri = ['http://creativecommons.org',
               self._code == 'zero' and 'publicdomain' or 'licenses',
               self._code]
        if self.version:
            uri.append(self.version)
        # jurisdictions will always fall at the end of the uri
        if self._jurisdiction:
            uri.append(self._jurisdiction)

        # don't forget to append your slashes
        return '/'.join(uri) + '/'
    
    def __str__(self):
        return self.uri

class LicenseFactory:
    """ Factory for abstracting the selection and validation of CC Licenses """
    
    @staticmethod
    def from_uri(uri):
        """ from_uri attempts to build a CC License object from a provided uri.
        There isn't much leniency given to the amount of acceptable input.
        * Deed'ed uri's will raise an Exception.
        * uri's with an omitted trailing slash will raise an Exception
        This function will not check for the validity of any of the fields,
        only that they exist in the uri."""
        
        std_base = 'http://creativecommons.org/licenses/'
        cc0_base = 'http://creativecommons.org/publicdomain/zero/'

        if 'deed' in uri:
            uri = uri[:uri.rindex('deed')]

        if uri.startswith(std_base) and uri.endswith('/'):

            raw_info = uri[len(std_base):]
            raw_info = raw_info.rstrip('/')
            info_list = raw_info.split('/')

            if len(info_list) not in (1,2,3):
                raise Exception, "Malformed Creative Commons License URI: <%s>" % uri

            # check if publicdomain uri 
            if len(info_list) == 1:
                if info_list[0] != 'publicdomain':
                    raise Excpetion, "Malformed Creative Commons License URI: <%s>" % uri
                retval = dict( code=info_list[0] )
            else:
                retval = dict( code=info_list[0], version=info_list[1] )

            # supply the jurisdiction if its provided
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


##############################################################
##
## work registration detection specific functions (mouthful) 
##                                                            
##############################################################

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
    
def match_iriset(metadata, irisets, subject):

    for iriset in [metadata['triples'][i] for i in irisets]:
    
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

def get_lookup_uri(network, metadata, work_uri):

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
    
def is_registered(subject, license_uri, metadata):
    """ Checks for work registration assertions """
    
    # shorthand accessor
    triples = metadata['triples']

    # first check for a has_owner assertion
    if subject not in metadata['subjects'] or \
       not triples[subject].has_key(SIOC('has_owner')):
        return False

    # an assertion exists
    owner_url = triples[subject][SIOC('has_owner')][0]

    # check if registry contains rdfa and if so,
    # are there any SIOC:owner_of triples?
    if owner_url not in metadata['subjects'] or \
       not triples[owner_url].has_key(SIOC('owner_of')):
        # nothing to see here folks
        return False

    # check if the registry completes the assertion
    if subject in triples[owner_url][SIOC('owner_of')]:
        # woot, success!
        return True
    
    # check to see if the subject matches an iriset
    for work in triples[owner_url][SIOC('owner_of')]:
        
        # filter out subjects that don't share the same license 
        if get_license_uri(work, metadata) == license_uri and \
               triples[work].has_key(SIOC('has_parent')):
            
            parent = triples[work][SIOC('has_parent')][0]

            if triples[parent].has_key(POWDER('iriset')) and \
                   match_iriset(metadata,
                                triples[parent][POWDER('iriset')],
                                subject):

                return True
    
    return False


############################################################
##                                                          
##  extract relevant values from an rdfadict DictTripleSink 
##                                                          
############################################################

def extract_licensed_subject(subject, license_uri, metadata):
    
    if get_license_uri(subject, metadata) == license_uri:
        return subject
    
    licensed = filter( lambda s: get_license_uri(s,metadata) == license_uri,
                       metadata['subjects'] )
    
    if len(licensed) == 1:
        return licensed[0]
    else:
        return None

def extract_attribution(subject, license_uri, metadata):
    """ Queries a dictionary of triples for cc:attributionName and
    cc:attributionURL.  The result is returned as a tuple where the first
    element is the attributionName, followed by the attributionURL.  """

    if subject not in metadata['subjects']:
        return ('', '')

    attribName= metadata['triples'][subject].get( CC('attributionName'), '')
    attribURL = metadata['triples'][subject].get( CC('attributionURL'), '')

    if len(attribName) > 1 or len(attribURL) > 1:
        return ('', '',) # return an empty tuple

    if isinstance(attribName, list): attribName = attribName[0]
    if isinstance(attribURL, list): attribURL = attribURL[0]
    
    return (attribName, attribURL,)

def extract_registration(subject, license_uri, metadata):

    if not is_registered(subject, license_uri, metadata):
        return {}
    
    try:
        # retrieve the relevant information
        owner = metadata['triples'][subject][SIOC('has_owner')][0]
        owner_name = metadata['triples'][owner][SIOC('name')][0]
        network_url = metadata['triples'][owner][SIOC('member_of')][0]
        network_name = metadata['triples'][network_url][DCT('title')][0]

        lookup_uri = get_lookup_uri(network_url, metadata, subject)

        if lookup_uri is None:
            return {}
        
        return {
            'owner_url': owner,
            'owner_name': owner_name,
            'network_url': network_url,
            'network_name': network_name,
            'lookup_uri': lookup_uri,
            }
    
    except KeyError:
        # if any of the attributes aren't included, then return an empty dict
        return {}  

def extract_more_permissions(subject, metadata):

    if subject not in metadata['subjects']:
        return ('', '', '')

    morePermURLs = metadata['triples'][subject].get( CC('morePermissions'),
                                                    '')
    commLicense = metadata['triples'][subject].get( CC('commercialLicense'),
                                                    '')
    if isinstance(commLicense, list): commLicense = commLicense[0]
    
    morePermAgent = ''
    if commLicense and commLicense in metadata['subjects'] and \
       metadata['triples'][commLicense].has_key( DCT('publisher') ):
        
        publisher = metadata['triples'][commLicense][ DCT('publisher') ][0]
        if metadata['triples'][publisher].has_key( DCT('title') ):
            # if there is an available title for the agent,
            # then it'll included in the extra deed permission popup
            morePermAgent = metadata['triples'][publisher][DCT('title')][0]

    
    # returns a tuple of with ('' or 1list, string, string) sig
    return (morePermURLs, commLicense, morePermAgent)

