import unittest
import base
try:
    import json
except ImportError:
    import simplejson as json

from cc.deedscraper import metadata, deed

# hmm ideally these should be defined here in the test
CC = metadata.CC
SIOC = metadata.SIOC
SIOC_SERVICE = metadata.SIOC_SERVICE
DCT = metadata.DCT
POWDER = metadata.POWDER

class DeedCallTests(unittest.TestCase):

    deed_url = "/deed?license_uri=http://creativecommons.org/licenses/by/3.0/&url=%s"

    def setUp(self):
        self.app = base.test_app()

    def test_no_metadata(self):
        """ ensure that a url without any relevant metadata does not
        produce any messages for a deed to include """

        response = self.app.get(self.deed_url % "http://code.creativecommons.org")
        data = json.loads(response.body)
        self.assert_( data['registration'] == None )
        self.assert_( data['attribution'] == None )
        self.assert_( data['more_permissions'] == None )

    def test_license_referer(self):

        h = {'Referer': 'http://creativecommons.org/licenses/by/3.0/us/'}
        response = self.app.get('/deed?url=http://creativecommons.org', headers=h)
        self.assertEqual(response.status, "200 OK")

    def test_license_uri_required(self):
        """ a license uri to be provided either by the referer or as a qs param. """

        response = self.app.get("/deed?url=http://example.com")
        data = json.loads(response.body)
        self.assertTrue('_exception' in data)

    def test_url_required(self):
        """ the url of the deed referer must be provided as a qs param. """

        response = self.app.get("/deed?")
        data = json.loads(response.body)
        self.assertTrue('_exception' in  data)                                
        

class AttributionMetadataTests (unittest.TestCase):

    def test_attribution_name_only(self):
        """ Verify that when cc:attributionName is present, attribution language
        is returned to the deed for displaying. """

        triples = {'subjects': [
                        'http://example.com',],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionName'): [
                               'Testing']
                           }
                       }
                   }

        attribName, attribURL = metadata.extract_attribution('http://example.com',
                                    'http://creativecommons.org/license/by/3.0/',
                                    triples)

        self.assertEqual(attribName, 'Testing')
        self.assertEqual(attribURL, '')


    def test_attribution_url_only(self):
        """ Verify that cc:attributionURL is extracted from a set of triples """

        triples = {'subjects': [
                       'http://example.com',],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionURL'): [
                               'http://example.com/attribURL']
                           }
                       }
                   }

        attribName, attribURL = metadata.extract_attribution('http://example.com',
                                    'http://creativecommons.org/license/by/3.0/',
                                    triples)

        self.assertEqual(attribName, '')
        self.assertEqual(attribURL, 'http://example.com/attribURL')

        notices = deed.DeedReferer('http://example.com',
                                   'http://creativecommons.org/licenses/by/3.0/',
                                   triples).notices()
        
        self.assertNotEqual(notices['attribution']['marking'], None)
        self.assertEqual(notices['attribution']['details'], None)

    def test_attribution_details (self):
        """ Attribution details provided when attribURL and attribName are
        scraped. """

        triples = {'subjects': [
                       'http://example.com',],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionURL'): [
                               'http://example.com/attribURL'],
                           CC('attributionName'): ['Test'],
                           }
                       }
                   }

        notices = deed.DeedReferer('http://example.com',
                                   'http://creativecommons.org/licenses/by/3.0/',
                                   triples).notices()
        self.assertEqual(notices['attribution']['marking'],
                         '<div xmlns:cc="http://creativecommons.org/ns#" about="http://example.com"><a rel="cc:attributionURL" property="cc:attributionName" href="http://example.com/attribURL">Test</a> / <a rel="license" href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a></div>')
        self.assertEqual(notices['attribution']['details'],
                         'You must attribute this work to ' + \
                         '<a href="http://example.com/attribURL">Test</a> ' + \
                         '(with link).')

    def test_attribution_marking_attribURL_attribName (self):
        """ Test the output of the attribution marking html """

        triples = {'subjects': [
                       'http://example.com',],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionURL'): [
                               'http://example.com/attribURL'],
                           CC('attributionName'): ['Test'],
                           }
                       }
                   }

        notices = deed.DeedReferer('http://example.com',
                                   'http://creativecommons.org/licenses/by/3.0/',
                                   triples).notices()
        self.assertEqual(notices['attribution']['marking'],
                         '<div xmlns:cc="http://creativecommons.org/ns#" about="http://example.com"><a rel="cc:attributionURL" property="cc:attributionName" href="http://example.com/attribURL">Test</a> / <a rel="license" href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a></div>')
        
    def test_attribution_marking_attribURL (self):
        """ Test the output of the attribution marking html for
        cc:attributionURL only """

        triples = {'subjects': [
                       'http://example.com',],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionURL'): [
                               'http://example.com/attribURL'],
                           }
                       }
                   }

        notices = deed.DeedReferer('http://example.com',
                                   'http://creativecommons.org/licenses/by/3.0/',
                                   triples).notices()
        self.assertEqual(notices['attribution']['marking'],
                         '<div xmlns:cc="http://creativecommons.org/ns#" about="http://example.com"><a rel="cc:attributionURL" href="http://example.com/attribURL">http://example.com/attribURL</a> / <a rel="license" href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a></div>')

    
    def test_attribution_marking_attribName (self):
        """ Test the output of the attribution marking html for
        cc:attributionName only  """

        triples = {'subjects': [
                       'http://example.com',],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionName'): ['Testing'],
                           }
                       }
                   }

        notices = deed.DeedReferer('http://example.com',
                                   'http://creativecommons.org/licenses/by/3.0/',
                                   triples).notices()
        self.assertEqual(notices['attribution']['marking'],
                         '<div xmlns:cc="http://creativecommons.org/ns#" about="http://example.com"><span property="cc:attributionName">Testing</span> / <a rel="license" href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a></div>')

    def test_extract_licensed_subject (self):
        """ Extracting attributionURL and attributionName for a subject that is
        not the referer to the deed. """

        triples = {'subjects': [
                       'http://example.com',],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : ['http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionName'): ['Testing'],
                           CC('attributionURL'):['http://example.com'],
                           }
                       }
                   }

        attribName, attribURL = metadata.extract_attribution('http://example.com',
                                    'http://creativecommons.org/license/by/3.0/',
                                    triples)

        self.assertEqual(attribName, 'Testing')
        self.assertEqual(attribURL, 'http://example.com')
        
        notices = deed.DeedReferer('http://example.com/blog/',
                                   'http://creativecommons.org/licenses/by/3.0/',
                                   triples).notices()
        self.assertEqual(notices['attribution']['marking'],
                         '<div xmlns:cc="http://creativecommons.org/ns#" about="http://example.com"><a rel="cc:attributionURL" property="cc:attributionName" href="http://example.com">Testing</a> / <a rel="license" href="http://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a></div>')
        

    
    def test_attribution(self):
        """ Verify that all attribution is extracted """

        triples = {'subjects': [
                       'http://example.com', ],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionURL'): [
                               'http://example.com/copyright'],
                           CC('attributionName'): [
                               'Testing']
                           }
                       }
                   }

        attribName, attribURL = metadata.extract_attribution('http://example.com',
                                    'http://creativecommons.org/license/by/3.0/',
                                    triples)

        self.assertEqual(attribName, 'Testing')
        self.assertEqual(attribURL, 'http://example.com/copyright')

    def test_multiple_attributions(self):
        """ If multiple attribution assertions exists, do not return anything """

        triples = {'subjects': [
                       'http://example.com',],
                   'triples': {
                       'http://example.com': {
                           CC('license'): [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionName'): [
                               'Testing', 'Example', ],
                           CC('attributionURL'): [
                               'http://testing.com', 'http://example.com']
                           }
                       }
                   }

        referer = deed.DeedReferer('http://example.com',
                                   'http://creativecommons.org/licenses/by/3.0/',
                                   triples)

        self.assertEqual(referer.notices()['attribution'], None)

    def test_attribution_for_nonreferring_subject(self):

        triples = {'subjects': [
                       'http://example.com',],
                   'triples': {
                       'http://example.com': {
                           CC('license'): [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           CC('attributionName'): [
                               'Example', ],
                           CC('attributionURL'): [
                               'http://example.com', ],
                           }
                       },                       
                   }

        referer = deed.DeedReferer('http://testing.com',
                                   'http://creativecommons.org/licenses/by/3.0/',
                                   triples)

        self.assertTrue(referer.notices()['attribution'] != None)
        
                           
class RegistrationTests (unittest.TestCase):

    def test_no_registration(self):
        """ No registration metadata returns an empty dict """
        triples = {'subjects': [
                        'http://example.com',],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           }
                       }
                   }
                   

        reg = metadata.extract_registration("http://example.com",
                                            "http://creativecommons.org/licenses/by/3.0/",
                                            triples)

        self.assertEqual( reg, {} )

    def test_no_reciprocal_registration(self):
        """ has_owner exists, but has no owner_of triple to compelte the
        assertion """

        triples = {'subjects': [
                        'http://example.com',
                        'http://testing.com'],
                   'triples': {
                       'http://example.com' : {
                           SIOC('has_owner') : [
                               'http://testing.com'],
                           },
                       'http://testing.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           }
                       }
                   }

        reg = metadata.extract_registration("http://example.com",
                                            "http://creativecommons.org/licenses/by/3.0/",
                                            triples)

        self.assertEqual(reg, {})

    def test_incomplete_metadata_registration(self):
        """ ownership assertion exists, but owner name & network info are req. """

        triples = {'subjects': [
                        'http://example.com',
                        'http://testing.com'],
                   'triples': {
                       'http://example.com' : {
                           SIOC('has_owner') : ['http://testing.com'],
                           },
                       'http://testing.com' : {
                           SIOC('owner_of'): ['http://example.com'],
                           }
                       }
                   }

        reg = metadata.extract_registration("http://example.com",
                                            "http://creativecommons.org/licenses/by/3.0/",
                                            triples)

        self.assertEqual(reg, {})

    def test_valid_registration(self):
        """ ownership assertion exists, but owner name & network info are req. """

        triples = {'subjects': [
                        'http://example.com',
                        'http://testing.com',
                        'https://creativecommons.net',
                        'https://creativecommons.net/r/lookup/',],
                   'triples': {
                       'http://example.com' : {
                           SIOC('has_owner') : ['http://testing.com'],
                           },
                       'http://testing.com' : {
                           SIOC('owner_of'): ['http://example.com'],
                           SIOC('name'): ['Testing'],
                           SIOC('member_of'): ['https://creativecommons.net'],
                           },
                       'https://creativecommons.net': {
                           DCT('title'):['CC Network'],
                           SIOC_SERVICE('has_service'): [
                               'https://creativecommons.net/r/lookup/'],
                           },
                       'https://creativecommons.net/r/lookup/': {
                           SIOC_SERVICE('service_protocol'):[
                               'http://wiki.creativecommons.org/work-lookup'],
                           }
                       }
                   }

        reg = metadata.extract_registration("http://example.com",
                                            "http://creativecommons.org/licenses/by/3.0/",
                                            triples)

        test_registration = {
            'owner_url' : 'http://testing.com',
            'owner_name' : 'Testing',
            'network_url' : 'https://creativecommons.net',
            'network_name' : 'CC Network',
            'lookup_uri' : 'https://creativecommons.net/r/lookup/?uri=http://example.com'
            }

        self.assertEqual(reg, test_registration)

    def test_match_with_include_iriset(self):
        """ A succesfull assertion using an iriset """

        triples = {'subjects': ['http://example.com',
                                'http://example.com/foo/1',
                                'http://example.com/1',
                                'http://testing.com',
                                'http://testing.com/work/',
                                'foo_iriset'],
                   'triples': {
                       'http://example.com/foo/1': {
                           SIOC('has_owner'):['http://testing.com'],
                           CC('license'):[
                               'http://creativecommons.org/licenses/by/3.0/'],
                           },
                       'http://example.com/1': { # not included in the iriset, will fail
                           SIOC('has_owner'):['http://testing.com'],
                           CC('license'):[
                               'http://creativecommons.org/licenses/by/3.0/'],
                           },
                       'http://testing.com': {
                           SIOC('owner_of'): ['http://testing.com/work/'],
                           },
                       'http://testing.com/work/': {
                           SIOC('has_parent'): ['http://example.com'],
                           CC('license'):[
                               'http://creativecommons.org/licenses/by/3.0/'],
                           },                      
                       'http://example.com': {
                           POWDER('iriset'): ['foo_iriset'],
                           },
                       "foo_iriset": {
                           POWDER('includeregex'): [
                               "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]*)(\\:([0-9]+))?(\\/)",
                               "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]+\\.)?(example\\.com)(\\:([0-9]+))?\\/foo\\/",
                               "^(http)\\:\\/\\/"]
                           },
                       }
                   }

        self.assertTrue(metadata.is_registered('http://example.com/foo/1',
                                               'http://creativecommons.org/licenses/by/3.0/',
                                               triples))
        self.assertFalse(metadata.is_registered('http://example.com/1',
                                                'http://creativecommons.org/licenses/by/3.0/',
                                                triples))
        
    def test_valid_registration_with_exclude_iriset(self):
        """ A succesfull assertion using an iriset """

        # iri set claims that http://example.com/foo/* is registered except for
        # the document hosted at http://example.com/foo/bar/
        
        triples = {'subjects': ['http://example.com',
                                'http://example.com/foo/blog/',
                                'http://example.com/foo/bar/',
                                'http://testing.com',
                                'http://testing.com/work/',
                                'foo_iriset'],
                   'triples': {
                       'http://example.com/foo/blog/': {
                           SIOC('has_owner'):['http://testing.com'],
                           CC('license'):[
                               'http://creativecommons.org/licenses/by/3.0/'],
                           },
                       'http://example.com/foo/bar/': {
                           SIOC('has_owner'):['http://testing.com'],
                           CC('license'):[
                               'http://creativecommons.org/licenses/by/3.0/'],
                           },
                       'http://testing.com': {
                           SIOC('owner_of'): ['http://testing.com/work/'],
                           },
                       'http://testing.com/work/': {
                           SIOC('has_parent'): ['http://example.com'],
                           CC('license'):[
                               'http://creativecommons.org/licenses/by/3.0/'],
                           },                      
                       'http://example.com': {
                           POWDER('iriset'): ['foo_iriset'],
                           },
                       "foo_iriset": {
                           POWDER('includeregex'): [
                               "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]*)(\\:([0-9]+))?(\\/)",
                               "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]+\\.)?(example\\.com)(\\:([0-9]+))?\\/",
                               "^(http)\\:\\/\\/"],
                           POWDER('excluderegex'): [
                               "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]+\\.)?(example\\.com)(\\:([0-9]+))?\\/foo\\/bar\\/",],
                           },
                       }
                   }

        self.assertTrue(metadata.is_registered('http://example.com/foo/blog/',
                                               'http://creativecommons.org/licenses/by/3.0/',
                                               triples))
        
        self.assertFalse(metadata.is_registered('http://example.com/foo/bar/',
                                                'http://creativecommons.org/licenses/by/3.0/',
                                                triples))
    
    def test_cc_network_registration_example (self):
        """ Ensure that a CC Network registration scenario passes """

        triples = {
            "subjects": [
                "MnRxHtQa824",
                "http://staging.creativecommons.net/example",
                "http://staging.creativecommons.net/r/lookup/",
                "http://staging.creativecommons.org/~john/metadata/?test=register",
                "http://staging.creativecommons.net/",
                "http://staging.creativecommons.net/r/1/",
                "http://staging.creativecommons.org/~john/metadata/",],
            "triples": {
                "http://staging.creativecommons.net/example": {
                    "http://xmlns.com/foaf/0.1/nick": ["example"],
                    "http://rdfs.org/sioc/ns#member_of": ["http://staging.creativecommons.net/"],
                    "http://rdfs.org/sioc/ns#owner_of": [
                        "http://staging.creativecommons.org/~john/metadata/",
                        "http://staging.creativecommons.net/r/1/"],
                    "http://www.w3.org/1999/xhtml/vocab#license": [
                        "http://creativecommons.org/licenses/by/3.0/"],
                    },
                "MnRxHtQa824": {
                    "http://www.w3.org/2007/05/powder#includeregex": [
                        "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]*)(\\:([0-9]+))?(\\/\\~john\\/metadata\\/)",
                        "^(http)\\:\\/\\/", "\\:\\/\\/(([^\\/\\?\\#]*)\\@)?([^\\:\\/\\?\\#\\@]+\\.)?(staging\\.creativecommons\\.org)(\\:([0-9]+))?\\/"]
                    },
                "http://staging.creativecommons.net/r/lookup/": {
                    "http://rdfs.org/sioc/services#service_protocol": [
                        "http://wiki.creativecommons.org/work-lookup"]
                    },
                "http://staging.creativecommons.org/~john/metadata/?test=register": {
                    "http://rdfs.org/sioc/ns#has_owner": [
                        "http://staging.creativecommons.net/example"]
                    },
                "http://staging.creativecommons.net/": {
                    "http://purl.org/dc/terms/title": ["CC Network"],
                    "http://rdfs.org/sioc/services#has_service": ["http://staging.creativecommons.net/r/lookup/"]
                    },
                "http://staging.creativecommons.net/r/1/": {
                    "http://purl.org/dc/terms/creator": [
                        "http://staging.creativecommons.net/example"],
                    "http://purl.org/dc/terms/created": ["01/22/2010"],
                    "http://rdfs.org/sioc/ns#has_owner": ["http://staging.creativecommons.net/example"],
                    "http://rdfs.org/sioc/ns#parent_of": ["http://staging.creativecommons.org/~john/metadata/"],
                    "http://www.w3.org/2007/05/powder#iriset": ["MnRxHtQa824"]
                    },
                "http://staging.creativecommons.org/~john/metadata/": {
                    "http://purl.org/dc/terms/title": ["Testing Metadata"],
                    "http://rdfs.org/sioc/ns#has_parent": ["http://staging.creativecommons.net/r/1/"],
                    "http://www.w3.org/1999/xhtml/vocab#license": ["http://creativecommons.org/licenses/by/3.0/"]
                    }
                }
            }

        self.assertTrue(metadata.is_registered('http://staging.creativecommons.org/~john/metadata/?test=register',
                                               'http://creativecommons.org/licenses/by/3.0/',
                                               triples))


class MorePermissionsTest (unittest.TestCase):

    def setUp(self):
        self.app = base.test_app()

    def test_no_more_permissions(self):

        triples = {'subjects': [
                        'http://example.com',],
                   'triples': {
                       'http://example.com' : {
                           CC('license') : [
                               'http://creativecommons.org/licenses/by/3.0/'],
                           }
                       }
                   }

        self.assertEqual(metadata.extract_more_permissions('http://example.com',
                                                           triples),
                         ('', '', '') )

    def test_single_more_permissions_url(self):
        
        triples = {'subjects': [
                        'http://example.com'],
                   'triples': {
                       'http://example.com': {
                           CC('morePermissions'):[
                               'http://testing.com']
                           }
                       }
                   }

        urls, commercial_license, agents = \
              metadata.extract_more_permissions('http://example.com', triples)

        self.assertEqual(urls, ['http://testing.com'])
        self.assertEqual(commercial_license, '')
        self.assertEqual(agents, '')

    def test_multiple_more_permissions_url(self):
        
        triples = {'subjects': [
                        'http://example.com'],
                   'triples': {
                       'http://example.com': {
                           CC('morePermissions'):[
                               'http://testing.com',
                               'http://testing.org']
                           }
                       }
                   }

        urls, commercial_license, agents = \
              metadata.extract_more_permissions('http://example.com', triples)

        self.assertEqual(urls, ['http://testing.com', 'http://testing.org'])
        self.assertEqual(commercial_license, '')
        self.assertEqual(agents, '')

    def test_commercial_license_url(self):
        
        triples = {'subjects': [
                        'http://example.com'],
                   'triples': {
                       'http://example.com': {
                           CC('morePermissions'):[
                               'http://testing.com',],
                           CC('commercialLicense'):[
                               'http://testing.org',]
                           }
                       }
                   }

        urls, commercial_license, agents = \
              metadata.extract_more_permissions('http://example.com', triples)

        self.assertEqual(urls, ['http://testing.com'])
        self.assertEqual(commercial_license, 'http://testing.org')
        self.assertEqual(agents, '')

    def test_permission_agents(self):
        
        triples = {'subjects': [
                        'http://example.com',
                        'http://testing.org',
                        'http://testing.net',],
                   'triples': {
                       'http://example.com': {
                           CC('morePermissions'):[
                               'http://testing.com',],
                           CC('commercialLicense'):[
                               'http://testing.org',],
                           },
                       'http://testing.org': {
                           DCT('publisher'):['http://testing.net'],
                           },
                       'http://testing.net': {
                           DCT('title'): ['Testing']
                          }                           
                       }
                   }

        urls, commercial_license, agents = \
              metadata.extract_more_permissions('http://example.com', triples)

        self.assertEqual(urls, ['http://testing.com'])
        self.assertEqual(commercial_license, 'http://testing.org')
        self.assertEqual(agents, 'Testing')



        
