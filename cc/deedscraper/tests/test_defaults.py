from cc.deedscraper.tests.base import TestBase

class DefaultValuesTest(TestBase):

    def testNoRootMethod(self):
        """cc.deedscraper does not define an index method."""

        response = self.app.get('/')
        assert response.status.find('404') == 0

    def testNoUrlProvided(self):
        """Calling /scrape with no parameters should return an empty result."""

        response = self.app.get('/scrape')
        assert response.body == '{}'
