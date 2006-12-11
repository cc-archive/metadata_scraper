#!/bin/bash

PIDFILE=/web/cc3/metadata_scraper/paster.pid
RESTART="/web/cc3/metadata_scraper/bin/paster serve /web/cc3/metadata_scraper/server.cfg --daemon"

export PID=`cat $PIDFILE`
export RUNNING=`ps -p $PID | wc -l`

if [ "$RUNNING" -le 1 ]; then
   # hack to make lxml find the right libxml2 installation
   export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
   $RESTART
fi

