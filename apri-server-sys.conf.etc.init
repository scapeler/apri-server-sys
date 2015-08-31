# SCAPE604-apri-server-sys - start or restart apri-server-sys service
#
#

description     "(re)start apri-server-sys service"
start on runlevel [2345]
respawn
task
script
   exec /opt/SCAPE604/apri-server-sys/apri-server-sys.sh /opt/SCAPE604/log/SCAPE604-apri-server-sys.log
end script
