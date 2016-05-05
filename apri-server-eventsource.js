/*jslint devel: true,  undef: true, newcap: true, white: true, maxerr: 50 */
/**
 * The apri-server-eventsource module for push message to client.
 * @module apri-server-eventsource
 */

//var Y = {};

var eventSources= {};

var action	=	{};
action.message	= {
		type: 'message',
		text:'Dit is een testbericht'
	}

eventSources.humansensor	= function(req, res) {
	
//	if (eventsourceName == 'humansensor') humansensorStream (res, req);
	
	res.write(":" + Array(2049).join(" ") + "\n"); // 2kB padding for IE
	res.write("retry: 2000\n");
	
	var lastEventId = Number(req.headers["last-event-id"]) || Number(req.query.lastEventId) || 0;    //parsedURL.query.lastEventId) || 0;
	console.log(lastEventId);
	var timeoutId = 0;
	var i = lastEventId;
	var c = i + 101;
	
	var actionString	= JSON.stringify( action.message);
	var f = function () {	
		writeEventStr	= 'event: humansensordata\n';
		writeStr		= 'data: {"id": "' + i + '", "action": ' + actionString + '}\n\n';
		if (++i < c) {
			res.write(writeEventStr);
			res.write(writeStr);
			timeoutId = setTimeout(f, 10000);
		} else {
			res.end();
		}
	};
	f();

	res.on("close", function () {
		clearTimeout(timeoutId);
	});
}

var writeHeaders	= function(res) {
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		"Access-Control-Allow-Origin": "*"
	});
}

module.exports = {
	
	streamEvents: function(eventsource, req, res) {
		console.log('start streamEvent: '+ eventsource);
		if (eventSources[eventsource]) {
			writeHeaders(res);
			eventSources[eventsource](req, res);
		} else {
			res.send('ERROR: Unknown eventsource: '+ eventsource);
		}
		return;	
	}

 };

    
