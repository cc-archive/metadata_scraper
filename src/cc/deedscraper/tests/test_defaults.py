import unittest
from cc.deedscraper.tests.base import TestBase

class TestNoRoot(TestBase):

    def testNoRootMethod(self):
        """cc.deedscraper does not define an index method."""

        self.app.get('/', status=404)
        # self.assert_(response.status.find('404') == 0)

    def test_NoUrlProvided(self):
        """Calling /scrape with no parameters should return an empty result."""

        response = self.app.get('/scrape')
        self.assert_(response.body == '{}')
