## Copyright (c) 2010 John E. Doig III, Creative Commons

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

import re

# RDF predicate shortcut functions 
CC = lambda part: "http://creativecommons.org/ns#%s" % part
SIOC = lambda part: "http://rdfs.org/sioc/ns#%s" % part
SIOC_SERVICE = lambda part: "http://rdfs.org/sioc/services#%s" % part
POWDER = lambda part: "http://www.w3.org/2007/05/powder#%s" % part
DC = lambda part: "http://purl.org/dc/elements/1.1/%s" % part
DCT = lambda part: "http://purl.org/dc/terms/%s" % part
XHTML = lambda part: "http://www.w3.org/1999/xhtml/vocab#%s" % part


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

def get_title(subject, metadata):
    """ Returns the dc:title for the subject """
    if subject not in metadata['subjects']:
        return None
    title = metadata['triples'][subject].get( DC('title') ) or None
    if title:
        return title[0]
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

            return service + "?uri=" + work_uri

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
    if owner_url not in metadata['subjects']:
        return False

    if not triples[owner_url].has_key(SIOC('owner_of')):
        # check if the owner_url was redirected in the scraping
        if metadata['redirects'].has_key(owner_url) and \
           triples[metadata['redirects'][owner_url]].has_key(SIOC('owner_of')):
            # the owner url was redirected to, use that url to find assertions
            owner_url = metadata['redirects'][owner_url]
        else:
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

def attribution(subject, metadata):
    """ Queries a dictionary of triples for cc:attributionName and
    cc:attributionURL.  The result is returned as a tuple where the first
    element is the attributionName, followed by the attributionURL.  """

    attrib = {
        'attributionName': '',
        'attributionURL': '',
        }

    if subject not in metadata['subjects']:
        return attrib

    attribName= metadata['triples'][subject].get( CC('attributionName'), '')
    attribURL = metadata['triples'][subject].get( CC('attributionURL'), '')

    if isinstance(attribName, list): attribName = attribName[0]
    if isinstance(attribURL, list): attribURL = attribURL[0]
    
    attrib['attributionName'] = attribName
    attrib['attributionURL'] = attribURL
    
    return attrib

def registration(subject, metadata, license_uri):

    regis = {
        'owner_url': '',
        'owner_name': '',
        'network_url': '',
        'network_name': '',
        'lookup_uri': '',
        }

    if not is_registered(subject, license_uri, metadata):
        # try to extract another licensed subject and try again
        subject = extract_licensed_subject(subject, license_uri, metadata)
        if not is_registered(subject, license_uri, metadata):
            return regis
    
    try:
        # retrieve the relevant information
        owner = metadata['triples'][subject][SIOC('has_owner')][0]
        owner_name = metadata['triples'][owner][SIOC('name')][0]
        network_url = metadata['triples'][owner][SIOC('member_of')][0]
        network_name = metadata['triples'][network_url][DCT('title')][0]

        lookup_uri = get_lookup_uri(network_url, metadata, subject)

        if lookup_uri is None:
            return regis
        
        return {
            'owner_url': owner,
            'owner_name': owner_name,
            'network_url': network_url,
            'network_name': network_name,
            'lookup_uri': lookup_uri,
            }
    
    except KeyError: # if any of the attributes aren't included, then return an empty dict
        return regis

def more_permissions(subject, metadata):

    if subject not in metadata['subjects']:
        return {}

    morePermURLs = metadata['triples'][subject].get(CC('morePermissions'), '')
    commLicense = metadata['triples'][subject].get(CC('commercialLicense'), '')

    if isinstance(commLicense, list):
        commLicense = commLicense[0]
    
    morePermAgent = ''
    if commLicense and commLicense in metadata['subjects'] and \
       metadata['triples'][commLicense].has_key( DCT('publisher') ):
        
        publisher = metadata['triples'][commLicense][ DCT('publisher') ][0]
        if metadata['triples'][publisher].has_key( DCT('title') ):
            # if there is an available title for the agent,
            # then it'll included in the extra deed permission popup
            morePermAgent = metadata['triples'][publisher][DCT('title')][0]
    
    # returns a tuple of with ('' or 1list, string, string) sig
    return {
        'morePermissionsURLs' : morePermURLs,
        'commercialLicense' : commLicense,
        'morePermAgent': morePermAgent,
        }
