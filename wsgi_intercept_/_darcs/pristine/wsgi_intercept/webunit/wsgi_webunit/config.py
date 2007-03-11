'''
This file allows you to set up configuration variables to identify the
machine and port to test.

It needs some work, but in a nutshell, put a config.cfg in your "test"
directory with the following contents:

---- snip

[DEFAULT]
machine = www.dev.ekorp.com
port = 80

[dev-ekit]
# uses DEFAULT

[dev-lp]
machine = www.lonelyplanet.dev.ekorp.com
port = 80

---- snip

Then set the environment var "TEST_CONFIG" to the config to use.

'''
import ConfigParser, os

cfg = ConfigParser.ConfigParser()
cfg.read('test/config.cfg')

# figure the active config
active = os.environ.get('TEST_CONFIG', 'DEFAULT')

# fetch the actual config info
machine = cfg.get(active, 'machine')
port = cfg.getint(active, 'port')
