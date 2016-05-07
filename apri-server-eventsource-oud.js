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
};
eventSources.esSchedule	= [
	{id:'S001', beginDT: '', endDT:'', hours:{'8':true,'10':true,'11':true,'12':true,'13':true,'14':true,'16':true,'18':true,'20':true,'9':true}, minutes:{'0':true,'10':true,'20':true,'30':true,'40':true,'50':true}, esProcessId:'P001'}
];
eventSources.esProcess	= {
	'P001': {
		action: { 
		  	  'begin': {type:'humansensordata', text:'A001: Testbericht', onEnd:'A002', duration:60000, pulse:2000}
			, 'A002': {type:'humansensordata', text:'A002: Testbericht', onEnd:'A003', duration:60000, pulse:2000}
			, 'A003': {type:'humansensordata', text:'A003: Testbericht'}
		}
	}
};

eventSources.esCaseAction		= {};

/* 
case action:
	caseActionKey	composed of esProcessId_actionId_caseStartTime
	type			event type
	startTime		time window start time
	endTime			time window end time
	text			text for message to send
	onEnd			next action
	duration		total duration action time window 
	pulse			timeout time for dispatch event repeat
	active			true: action is active
	sleep			false: ready for dispatch;	true: already dispatched, waiting for next pulse 
*/	 


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
		//writeEventStr	= 'event: humansensordata\n';
		//writeStr		= 'data: {"id": "' + i + '", "action": ' + actionString + '}\n\n';
		if (++i < c) {
			//res.write(writeEventStr);
			//res.write(writeStr);
			dispatchCaseActionEvents(res);
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

var dispatchCaseActionEvents	= function(res) {
	var _action, _event;
	var _nowTime	= new Date().getTime();
	for (var actionKey in eventSources.esCaseAction) {
		_action	= eventSources.esCaseAction[actionKey]
		if (_action.active == false || _action.sleep == true) continue;
		if (_nowTime >= _action.startTime && _nowTime <= _action.endTime) {
			if (_action.processAction.type) {
				_event	= 'event: ' + _action.processAction.type + '\n';
				//res.contentLength(_event.length);
				res.write(_event);
				}
			_event	= 'data: {"id": "id"';
			if (_action.processAction.text) _event	+= ',"text": "' + _action.processAction.text + '"';
			_event	+= '}\n\n';
			_event	= 'event: ' + _action.processAction.type + '\n';
			//res.contentLength(_event.length);
			res.write(_event);
			console.log('EventSource event: '+ _action.startTime + ' ' + _action.endTime + ' ' + _action.processAction.type + ' ' + _event);
			//eventSources.esCaseAction.sleep	= true; 
			_action.sleep	= true;
		}
	};
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

};  // end of exports



// EventSource case actions manager
var createESCaseActions	= function() {
	var dt		= {};
	dt.now		= new Date();
	dt.nowTime 	= dt.now.getTime();
	dt.nowHour	= dt.now.getHours();
	dt.nowMinute= dt.now.getMinutes();
	
	console.log(dt.nowHour+' '+dt.nowMinute);
	
	// remove old case actions
	var toRemove	= {};
	for (var action in eventSources.esCaseAction) {
		if (eventSources.esCaseAction[action].endTime < dt.nowTime) {
			//console.log('EventSource case action prepare to remove: ' + eventSources.esCaseAction[action].caseActionKey);
			//console.log(eventSources.esCaseAction[action].endTime);
			//console.log(dt.nowTime);
			eventSources.esCaseAction[action].active= false;
			toRemove[eventSources.esCaseAction[action].caseActionKey]={};
		}
	}
	for (var action in toRemove) {
		console.log('EventSource case action removed: ' + action ); //eventSources.esCaseAction[action].caseActionKey);
		delete eventSources.esCaseAction[action];
	}
	
	for (var sI=0;sI<eventSources.esSchedule.length;sI++) {
		var _esSchedule	= eventSources.esSchedule[sI];
		dt.nowHourStr	= ''+dt.nowHour;
		if (_esSchedule.hours) {
			if (_esSchedule.hours[dt.nowHourStr]!=true) {
				continue;
			}
		}		
		if (_esSchedule.minutes) {
			dt.nowMinuteStr	= ''+dt.nowMinute;
			if (_esSchedule.minutes[dt.nowMinuteStr]!=true) {
				continue;
			}
		}		
		if (eventSources.esProcess[_esSchedule.esProcessId]) {
			var _process		= eventSources.esProcess[_esSchedule.esProcessId];
			var actionTime		= dt.nowTime;
			_process.action.esProcessId	= _esSchedule.esProcessId;
			var _actionId		= 'begin';
			_process.action[_actionId].actionId	= _actionId;
			_process.action[_actionId].esProcessId	= _esSchedule.esProcessId;
			var caseActionKeyTime	= new Date(dt.now.getFullYear(),dt.now.getMonth(),dt.now.getDate(),dt.nowHour,dt.nowMinute).getTime();
			_process.action[_actionId].caseActionKeyTime	= caseActionKeyTime;
			console.log('Start creating case actions: ' + _esSchedule.esProcessId + ' / ' + _actionId + ' / ' + dt.nowHour + ' / ' + dt.nowMinute  );
			if (_process.action && _process.action.begin) createCaseActions(_process, _process.action[_actionId], actionTime);
		}
		
	}
}

// create case actions from scheduled process
var createCaseActions	= function(process, processAction, actionTime) {
	var _action				= {};
	var caseActionKey		= processAction.esProcessId + '_' + processAction.actionId + '_' + processAction.caseActionKeyTime;
	if (eventSources.esCaseAction[caseActionKey]) return; // caseAction already created
	
	_action.process			= process;
	_action.processAction	= processAction;
	_action.startTime		= actionTime; 
	var duration 			= processAction.duration?processAction.duration:60000;
	_action.endTime			= actionTime + duration  // default duration 1 minute
	_action.caseActionKey	= caseActionKey;
	_action.active			= true;
	eventSources.esCaseAction[caseActionKey] = _action;
	console.log('EventSource case action created: ' + caseActionKey);
	if (processAction.onEnd) {
		var _actionId		= processAction.onEnd;
		process.action[processAction.onEnd].actionId			= _actionId;
		process.action[processAction.onEnd].esProcessId			= processAction.esProcessId;
		process.action[processAction.onEnd].caseActionKeyTime	= processAction.caseActionKeyTime;
		createCaseActions(process, process.action[processAction.onEnd], _action.endTime); 
	} 
}

var intervalId	= setInterval(createESCaseActions, 10000);



    
