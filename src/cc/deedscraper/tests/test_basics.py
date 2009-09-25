import unittest
import base

class BasicApplicationTests(unittest.TestCase):
    """Basic test cases that indicate the application is assembled
    correctly."""

    def setUp(self):
        self.app = base.test_app()

    def test_no_root(self):
        """The application does not define a root URL."""

        response = self.app.get('/', status=404)
        self.assertEqual(response.status, '404 Not Found')

    def test_triples_method_exists(self):
        """/triples returns 200."""

        response = self.app.get('/triples')
        self.assertEqual(response.status, '200 OK')

    def test_scrape_method_exists(self):
        """/triples returns 200."""

        response = self.app.get('/scrape')
        self.assertEqual(response.status, '200 OK')
