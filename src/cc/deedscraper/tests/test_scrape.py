import unittest
try:
    import json
except ImportError:
    import simplejson as json

import base

class ScrapeTests(unittest.TestCase):
    """Test cases for the /scrape method."""

    def setUp(self):
        self.app = base.test_app()

    def test_no_url_specified(self):
        """If no URL is specified to scrape, the response is a dict with
        default values (empty strings)."""

        response = self.app.get('/scrape')
        self.assertEqual(json.loads(response.body),
                         json.loads(base.formatted_scrape_response())
                         )

    def test_scrape_404(self):
        """Attempting to scrape a URL which returns 404 yields a response
        dict with default values (empty strings)."""

        test_url = 'http://labs.creativecommons.org/~nathan/404.html'

        response = self.app.get('/scrape?url=%s' % test_url)
        self.assertEqual(json.loads(response.body),
                         json.loads(base.formatted_scrape_response(
                    _source=test_url))
                         )


    def test_scrape_success(self):
        """Scraping a URL with metadata returns a response dict with
        the license and attriution information filled in."""

        test_url = 'http://creativecommons.org'

        response = self.app.get('/scrape?url=%s' % test_url)
        self.assertEqual(json.loads(response.body),
                         json.loads(
                base.formatted_scrape_response(
                    _source=test_url,
                    licenseUrl='http://creativecommons.org/licenses/by/3.0/',
                    ))
                         )

