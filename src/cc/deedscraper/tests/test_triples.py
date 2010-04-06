import unittest
try:
    import json
except ImportError:
    import simplejson as json

import base

class TripleTests(unittest.TestCase):
    """Test cases for the /triples method."""

    def setUp(self):
        self.app = base.test_app()

    def test_no_url_specified(self):
        """If no URL is specified to scrape, the response is a dict with
        default values (empty strings)."""

        response = self.app.get('/triples')
        self.assertEqual(json.loads(response.body),
                         dict(action='triples',
                              source='',
                              subjects=['_exception'],
                              referer='-',
                              redirects={},
                              triples={'_exception':'unknown url type: '})
                         )

    def test_scrape_404(self):
        """Attempting to scrape a URL which returns 404 yields a response
        dict with default values (empty strings)."""

        test_url = 'http://labs.creativecommons.org/~nathan/404.html'

        response = self.app.get('/triples?url=%s' % test_url)
        self.assertEqual(json.loads(response.body),
                         dict(action='triples',
                              source=test_url,
                              subjects=['_exception'],
                              referer='-',
                              redirects={},
                              triples={"_exception": 
                                       "HTTP Error 404: Not Found"})
                         )


    def test_scrape_redirect_301(self):
        """Attempting to scrape a URL which returns a 301 yields a response
        dict with values for both subject url's (pre and post redirect) """

        test_url = 'http://code.creativecommons.org/tests/metadata_scraper/'
        
        r301_url = 'http://creativecommons.org'
        
        response = self.app.get('/triples?url=%s' % ( test_url + '301.html' ))

        triples = json.loads(response.body)

        self.assert_(test_url + '301.html' in triples['subjects'])
        self.assert_(r301_url in triples['subjects'])

        for predicate,value in triples['triples'][test_url + '301.html'].items():
            self.assert_( triples['triples'][r301_url][predicate] == value )

    def test_scrape_redirect_302(self):
        """Attempting to scrape a URL which returns a 302 yields a response
        dict with values for both subject url's (pre and post redirect) """

        test_url = 'http://code.creativecommons.org/tests/metadata_scraper/'
        
        r302_url = 'https://creativecommons.net'
        
        response = self.app.get('/triples?url=%s' % ( test_url + '302.html' ))

        triples = json.loads(response.body)

        self.assert_(test_url + '302.html' in triples['subjects'])
        self.assert_(r302_url in triples['subjects'])

        for predicate,value in triples['triples'][test_url + '302.html'].items():
            self.assert_( triples['triples'][r302_url][predicate] == value )
        
    def test_referrer_included(self):
        """If the call has a referrer, it should be included in the 
        response."""
        
        test_url = '/'

        response = self.app.get('/triples?url=%s' % test_url,
                                headers = {'Referer': 'http://example.com/'})
        
        # get the respose body as a dict
        triple_data = json.loads(response.body)

        # assert that it contains the basic structure we expect
        self.assertEqual(triple_data['referer'], 'http://example.com/')

    def test_scrape_success(self):
        """Scraping a URL with metadata returns a response dict with
        the license and attriution information filled in."""

        test_url = 'http://creativecommons.org'

        response = self.app.get('/triples?url=%s' % test_url)
        
        # get the respose body as a dict
        triple_data = json.loads(response.body)

        # assert that it contains the basic structure we expect
        self.assertEqual(triple_data['action'], 'triples')
        self.assertEqual(triple_data['referer'], '-')
        self.assertEqual(triple_data['source'], test_url)
        self.assert_(test_url in triple_data['subjects'])

        # assert that some known triples are included
        self.assert_('http://www.w3.org/1999/xhtml/vocab#license' in
                     triple_data['triples'][test_url])
        self.assertEqual(triple_data['triples'][test_url]
                         ['http://www.w3.org/1999/xhtml/vocab#license'], 
                         ['http://creativecommons.org/licenses/by/3.0/'])
