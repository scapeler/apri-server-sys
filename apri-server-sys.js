/*
** Module: apri-server-sys
**
** Main system module for handling client requests like app-info, portlets, templates and more.
** Also for distribution of data service url info like servername and port number
**
*/
// activate init process config-main
var path = require('path');
var startFolder 			= __dirname;
var startFolderParent		= path.resolve(__dirname,'..');
var configServerModulePath	= startFolderParent + '/apri-server-config/apri-server-config';
console.log("Start of Config Main ", configServerModulePath);
var apriConfig = require(configServerModulePath)

var systemFolder 			= __dirname;
var systemFolderParent		= path.resolve(__dirname,'..');
var systemFolderRoot		= path.resolve(systemFolderParent,'..');
var systemModuleFolderName 	= path.basename(systemFolder);
var systemModuleName 		= path.basename(__filename);
var systemBaseCode 			= path.basename(systemFolderParent);

//console.log('systemFolder', systemFolder);  				// systemFolder /opt/TSCAP-550/node-apri
//console.log('systemFolderParent', systemFolderParent);  	// systemFolderParent /opt/TSCAP-550
//console.log('systemFolderRoot', systemFolderRoot);  	// systemFolderRoot   /opt

var initResult = apriConfig.init(systemModuleFolderName+"/"+systemModuleName);

var apriClientSysName 	= 'apri-client-sys';
var apriClientName 		= '';  // defaults to apriClientSysName

// **********************************************************************************

// add module specific requires
var request 			= require('request');
var express 			= require('express');

var cookieParser 		= require('cookie-parser');
var session 			= require('express-session');
var sessions			= {};
var uid 				= require('uid-safe');
//var bodyParser 		= require('connect-busboy');
var fs 					= require('fs');
//var handlebarsx 		= require('handlebars');
//var xml2js 				= require('xml2js');

//var neo4j 			= require('neo4j');
//var neo4jdb 		= new neo4j.GraphDatabase('http://192.168.0.66:7474');

var apriTemplateTool 	= require('./apri-server-createtemplate');
var apriPortletTool 	= require('./apri-server-createportlet');
//var apriAireasGetPg 	= require('./node-apri-aireas-get-pg');
//var apriNslGetPg 		= require('./node-apri-nsl-get-pg');
//var apriGtfsGetPg 		= require('./node-apri-gtfs-get-pg');

var app = express();


var sess = {
  	  secret: 'keyboscapelard cat'
  	, resave:true
	, saveUninitialized:true
  	, cookie: {
	// maxAge: 60000 
	}
//	, genid: function(req) {
//			var _apriUuid = apriGuid('');
//			console.log("New session: " + _apriUuid);
//			var string = uid.sync(24);
//			console.log("New session: " + string);
//    		return string;  //return genuuid(); // use UUIDs for session IDs
//  		}
}

if (app.get('env') === 'production') {
  	app.set('trust proxy', 1) // trust first proxy (app.enable('trust proxy');)
  	sess.cookie.secure = true // serve secure cookies
}

app.use(cookieParser());
app.use(session(sess));

//var random = utils.uid(24);
//var sessionID = cookie['express.sid'].split('.')[0];

// inside middleware handler
var ipMiddleware = function(req, res, next) {
    var clientIp = requestIp.getClientIp(req); // on localhost > 127.0.0.1
    next();
};

app.use(function(req, res, next) {
//	console.log('Check for session info');
	if (req.session) {
  		var _sessionInfo = req.session;
		console.log('Session info found '+'req.cookies: ' + req.cookies['connect.sid'] + ' session.views ' + _sessionInfo.views);

  		if (_sessionInfo.views) {
			_sessionInfo.views++;
  		} else {
			_sessionInfo.views = 1;
			if(typeof req.cookies['connect.sid'] !== 'undefined'){
        		console.log('req.cookies: ' + req.cookies['connect.sid']);
    		}
			console.log('Session info init '+'req.session: ' + JSON.stringify(req.session) );
			console.log('Session info init '+'req.cookies: ' + JSON.stringify(req.cookies) +' ' + req.cookies['connect.sid'] + ' session.views ' + _sessionInfo.views);
  		}
		res.cookie('reqcount', _sessionInfo.views, { expires: new Date(Date.now() + 900000), httpOnly: true });
  	}

	next();
});

app.use(function(req, res, next) {
    //var ip_info = get_ip(req);
    //console.log('Remote IP-address: %s', ip_info);
    //console.log(ip_info);
	
	var ip_info = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
	console.log('Remote IP-address: %s', ip_info); // change proxy config for forwarding ip? now ip-address of proxy
	//console.log(ip_info);
	 
    next();
});


//app.use(bodyParser);

// **********************************************************************************



var localApps =[];
var apps = Array();
var appObj = {};
var appResult = "";
var appRes={};
var appTypesItemSequence=new Array;
var appTypes=new Array;
var nrTransactions;

var appsLocalPath = systemFolderParent +'/apps/';
console.log (appsLocalPath);

var localAppIndex = -1;
var localApss=[];
fs.readdir(appsLocalPath,function (err, files) {
//  localApps=files;
//  console.log("Local apps: " + localApps.toString());
	if (err) { console.log("Local apps folder not found: " + localApps.toString());
	} else {
		localApps=files;
  		console.log("Local apps: " + localApps.toString());
	}
});


var findLocalApp = function (app) {
  var _localAppIndex = -1;
  var _htmlFile = -1;
  for (var localApp in localApps) {
    //console.log("test "+app+_localAppIndex+localApp+localApps[localApp]);
    if (app == localApps[localApp]) {
      _localAppIndex = localApp;
      break;
    }
  }
  var _htmlFile=fs.readFileSync(appsLocalPath + app + "/" + app + ".html");
  //console.log("File: " + _htmlFile);
  //console.log(app+_localAppIndex+localApps[_localAppIndex]);
  return _htmlFile;
}

var users=[];

var initAppObj = function (app) {
  appTypes=[];
  appTypesItemSequence=[];
  nrTransactions=0;
  appObj = {};
  appObj.name = app;
  appObj.resultPres ="";
  appObj.resultPosts ="";
  appObj.resultApps ="";
  appObj.resultModels ="";
  appObj.resultModellists ="";
  appObj.resultTemplates ="";
  appObj.resultViews ="";
  appObj.resultFunctions ="";
  appObj.resultStyles ="";
  appObj.appName = "";
  
};


function getItems(appName, items) {
  if (items.length==null) {
    if (items.type!=null) {
      if (items.type == "appconfig") {
        console.log("AppName : " + appName);
      } else { 
        if (items.disable == null || !items.disable) {
          getItemContent(appName, items);
        } 
      }  
    } else {
      for (var item in items) {
        if (items.hasOwnProperty(item)) {
          getItems(appName, items[item]);
        }
      }
    }
  } else {
    for (var i=0;i<items.length;i++) {
      getItems(appName, items[i]);
    }
  }
}

function getItem(appName, item) {
  console.log("for item: " + item.type + " " + item.name);
  var _item = item;
  var _type = type;
  var _result = {};
  switch (_type) {
  case "apps": {
    resultApps = getApps(appName, _item, "app");
    break;
  }
  default:  {
    _result += "<BR/><!-- getItem unknown item: " + _item + "  --><BR/>";
  }
  }
  return  _result;
}

function getApps(appName, groupname) {
  var _groupname=groupname;  //.toArray();
  var _i=0;
  var _result="";
  //_result=" getApps bereikt;  " +apps + apps.size() + _apps[0].app + _apps.length + "<br>";
  for (var _i=0; _i<_groupname.length; _i++) {
    _result += getItemContent(appName, groupname[_i].name, groupname[_i].type);
  }
  return _result;
}

function getItemContent(appName, item) {
  var _result="";
  var _itemContent="";

  reqAlfrescoAppItem(appName, item);
  if (_itemContent == null) {
    console.log(" Item not found: " + item.type + " " + item.name + "\n");
    _result += "\n // AppItem " + item.type + " " + item.name + " not found! \n"
  } else {
    _result += _itemContent.content;
  }
  return _result;
}

// todo remove this Alfresco dependency into config subfolder?
/*
var reqAlfrescoAppItem = function (appName, item) {
  var _appName = appName;
  if (appTypes[item.type]==null) {
    appTypes[item.type]=new Array;
    appTypesItemSequence[item.type]=-1;
  }
  console.log("Item: " + item.name + "." + item.type);
  appTypesItemSequence[item.type]++;
  appTypes[item.type][appTypesItemSequence[item.type]]=false;
  nrTransactions++;
  new StreamBuffer(request.get({
    url: systemRepositoryHttpServer + '/alfresco/service/api/abc/ldgr/apptemplate/' + item.name + "." + item.type + '?guest=true',
    headers: { 
      'Content-Type': 'application/json'
    }, 
    body: JSON.stringify({
      name: item.name, 
      type: item.type,
      appName: appName,
      appItemSequence: appTypesItemSequence[item.type]
    })
  }, function(error, response){
    console.log("transactions: " + nrTransactions );
    if (nrTransactions==0) {
      console.log("appName, _appName: " + appName + _appName );
      sendResult(_appName);
    }
  })
  );
  
}

function sendResult (appName) {
      //console.log(appTypes);
      appResult = "";
      appResult += mergeResults(appTypes["pre"]);      
      appResult += mergeResults(appTypes["script"]);
      appResult += mergeResults(appTypes["style"]);
      //appResult += "<script>";
//      appResult += mergeResults(appTypes["scriptstart"]);
//      appResult += mergeResults(appTypes["funct"]);      
//      appResult += mergeResults(appTypes["scriptend"]);
      //appResult += "</script>";

      //classcode:";
      if (appTypes["classstart"]!=null) {
        appResult += mergeResults(appTypes["classstart"]);      
        appResult += mergeResults(appTypes["classcode"]);
        appResult += mergeResults(appTypes["model"]);      
        appResult += mergeResults(appTypes["modellist"]);      
        appResult += mergeResults(appTypes["view"]);      
        appResult += mergeResults(appTypes["app"]);
        appResult += mergeResults(appTypes["classend"]);      
        // prototype section 
        appResult += mergeResults(appTypes["template"]);
        appResult += mergeResults(appTypes["funct"]);      
        // prototype section end 
      } else {
        appResult += mergeResults(appTypes["template"]);
        appResult += mergeResults(appTypes["funct"]);      
        appResult += mergeResults(appTypes["model"]);      
        appResult += mergeResults(appTypes["modellist"]);      
        appResult += mergeResults(appTypes["view"]);      
        appResult += mergeResults(appTypes["app"]);
      }

      appResult += mergeResults(appTypes["post"]);
      appRes.contentType('application/js');
      appRes.send(appResult);
      writeFile(appsLocalPath, appName +".html" , appResult);
}

function writeFile(path, fileName, content) {
  fs.writeFile(path + fileName, content, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("The file was saved! " + fileName);
    }
  }); 
}

function mergeResults(result) {
  tmp="";
  //console.log(result);
  if (result != null) {
    for (var i=0;i<result.length;i++) {
      tmp=tmp+result[i];  
    }
  }
  return tmp;
}    
        

var reqAlfresco = function (appName, extension,res) {
  console.log("\n\nStart build app: " + appName + "." + extension); 
  var _res=res;
  var _appName=appName;
  
  var localAppFound=false;
  for (localApp in localApps) {
    console.log (localApps[localApp] + " vs " + _appName);
    if (localApps[localApp] == _appName) {
      localAppFound=true;
      //break;
    }
  }
  if (localAppFound) {
    console.log("Local appdir found: " + _appName);
  } else {
    console.log("Local appdir NOT found: " + _appName);
  };
  
  request.get({
  url: systemRepositoryHttpServer + '/alfresco/service/api/abc/ldgr/apptemplate/' + appName + '.' + extension + '?guest=true',
    headers: { 
      'Content-Type': 'application/json'
    }, 
    body: JSON.stringify({
      a: 1, 
      b: 2,
      c: 3
    })
  }, function(error, response, body){
    if (error!=null) {   
      console.log("Error - appconfig read error: ");
      console.log(error);
    }  
    try {
      var appItems = JSON.parse(body);
    }
    catch(err) {
      console.log("Error - json parse error: ");
      console.log(body);
      return;
    }
    writeFile(appsLocalPath, appName +".appconfig" , body);
    getItems(_appName, appItems);
  });

}

var actualUser={};



var reqAlfrescoLogin = function (u, p, c, req, res) {
  //console.log("Start login: " + u + "." + p); 
  //console.log("actual user: " + actualUser );  
  //_url = 'http://192.168.0.21:8080/alfresco/service/api/login?format=json&u=' + u + '&pw=' + p + '&callback=' + c;
  var tmpBodyJson;

  _url = systemRepositoryHttpServer + '/alfresco/service/api/login?format=json';
  bodyJson={
    "username" : u,
    "password" : p
  }
    try {
        tmpBodyJson = JSON.stringify(bodyJson);
    }
    catch(err) {
        tmpBodyJson = "{\"error\":\"json error\"}";
    }
  
  //console.log(JSON.stringify(bodyJson));
  console.log("url: " +_url);
  _r=request.post({
    uri: _url
    ,method: "POST"
    ,headers: { 
      'Content-Type': 'application/json'
    }, 
    body: tmpBodyJson 
  }, function(error, response, body, c){
    if (error!=null) {   
      console.log("Error - login error: ");
      console.log(error);
    }  
    try {
      	var alfTicket = JSON.parse(body);
    }
    catch(err) {
      	console.log("Error - json parse error: ");
  //    console.log(body.toString());
  		res.send(body);
      	return;
    }

//    var _args=require('url').parse(_r.req.path, true);  // req.args.callback;
//    _c=_args.query.callback; 
//    res.send( _c + '({"result": [ ' + body + ' ]}) ' );

    //console.log(body.toString());
    
  //  res.send( '{"result": [ ' + body + ' ]} ' );
    //res.headers['Content-Type'] = "application/json";
    console.log('1:' + response.headers); //.headers);
    console.log('2:' + res.headers); //.headers);
    //res.headers=response.headers;
    console.log('3:' + res.headers); //.headers);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send(body);
  });
}

var reqAlfrescoLoginCheck = function (u, p, c, req, res) {
  //console.log("Start login: " + u + "." + p); 
  //console.log("actual user: " + actualUser );  
  //_url = 'http://192.168.0.21:8080/alfresco/service/api/login?format=json&u=' + u + '&pw=' + p + '&callback=' + c;
  _url = systemRepositoryHttpServer + '/alfresco/service/api/login?format=json';
  bodyJson={
    "username" : u,
    "password" : p
  }
  //console.log(JSON.stringify(bodyJson));
  console.log("url: " +_url);
  _r=request.post({
    url: _url,
//    headers: { 
//      'Content-Type': 'application/json'
//    }, 
    body: JSON.stringify(bodyJson)
  }, function(error, response, body, c){
    if (error!=null) {   
      console.log("Error - login error: ");
      console.log(error);
    }  
    try {
      var alfTicket = JSON.parse(body);
    }
    catch(err) {
      console.log("Error - json parse error: ");
  //    console.log(body.toString());
      return;
    }

//    var _args=require('url').parse(_r.req.path, true);  // req.args.callback;
//    _c=_args.query.callback; 
//    res.send( _c + '({"result": [ ' + body + ' ]}) ' );

    //console.log(body.toString());
    
  //  res.send( '{"result": [ ' + body + ' ]} ' );
    res.send(body);
  });
}

*/

/*

function standardStreamBuffer(req) {
  var self = this

  var buffer = []
  var ended  = false
  var ondata = null
  var onend  = null

  self.ondata = function(f) {
    console.log("self.ondata")
    for(var i = 0; i < buffer.length; i++ ) {
      f(buffer[i])
      console.log(i);
    }
    console.log(f);
    ondata = f
  }

  self.onend = function(f) {
    onend = f
    if( ended ) {
      onend()
    }
  }

  req.on('data', function(chunk) {
    var _reqBody=JSON.parse(req.body);
    console.log("req.on data: ");
    if (_wfsResult) {
      _wfsResult += chunk;
    } else {
      _wfsResult = chunk;
    }

    if( ondata ) {
      ondata(chunk)
    }
    else {
      buffer.push(chunk)
    }
  })

  req.on('end', function() {
    //console.log("req.on end")
    ended = true;
//    nrTransactions--;
//    var _reqBody=JSON.parse(req.body);
    console.log("req.on end: "); // + _reqBody.name + "." + _reqBody.type + " " + _reqBody.appItemSequence);
//    writeFile(appsLocalPath, "postcode-1441LV" + "." + "json" , "json");
    
//    if (_reqBody.type == "template" && appTypes[_reqBody.type][_reqBody.appItemSequence]!=null) {      
//        //var _templatesStr = appTypes["template"].toString();
//        var _templates = html2js(appTypes[_reqBody.type][_reqBody.appItemSequence].toString(), _reqBody.name, _reqBody.type);
//        appTypes[_reqBody.type][_reqBody.appItemSequence] = _templates;
//    }

    if( onend ) {
      onend()
    }
  })        
 
  req.streambuffer = self
}


}
*/



var crypto={}; //todo: find a crypto library for nodejs
var _trueRandom = (function () {
    	if (crypto.getRandomValues) {
        	// if we have a crypto library, use it
        	return function () {
            	var array = new Uint32Array(1);
            	crypto.getRandomValues(array);
            	var intVal = array[0];
				//var t1 = (intVal + '').length;
            	return intVal / (Math.pow(10, (intVal + '').length));
        	};
    	} else {
        	// From http://baagoe.com/en/RandomMusings/javascript/
        	// Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
        	var Mash = function() {
        	    var n = 0xefc8249d;

     	       var mash = function (data) {
					data = data.toString();
                	for (var i = 0; i < data.length; i++) {
                    	n += data.charCodeAt(i);
                    	var h = 0.02519603282416938 * n;
                    	n = h >>> 0;
                    	h -= n;
                    	h *= n;
                    	n = h >>> 0;
                    	h -= n;
                    	n += h * 0x100000000; // 2^32
                	}
                	return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
            	};

            	mash.version = 'Mash 0.9';
            	return mash;
        	}

        	// From http://baagoe.com/en/RandomMusings/javascript/
        	var Alea = function() {
            	return (function (args) {
                	// Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
                	var s0 = 0;
                	var s1 = 0;
                	var s2 = 0;
                	var c = 1;

                	if (args.length == 0) {
                    	args = [+new Date()];
                	}
                	var mash = Mash();
                	s0 = mash(' ');
                	s1 = mash(' ');
                	s2 = mash(' ');

                	for (var i = 0; i < args.length; i++) {
                    	s0 -= mash(args[i]);
                    	if (s0 < 0) {
                        	s0 += 1;
                    	}
                    	s1 -= mash(args[i]);
                    	if (s1 < 0) {
                        	s1 += 1;
                    	}
                    	s2 -= mash(args[i]);
                    	if (s2 < 0) {
                        	s2 += 1;
                    	}
                	}
                	mash = null;

                	var random = function () {
                    	var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
                    	s0 = s1;
                    	s1 = s2;
                    	return s2 = t - (c = t | 0);
                	};
                	random.uint32 = function () {
                    	return random() * 0x100000000; // 2^32
                	};
                	random.fract53 = function () {
                    	return random() +
                        	(random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
                	};
                	random.version = 'Alea 0.9';
                	random.args = args;
                	return random;

            	}(Array.prototype.slice.call(arguments)));
        	};
        	return Alea();
    	}
}());

var apriGuid = function (id) {
		if (id!="") return id;
		var _id =  'apri-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        		var r = _trueRandom() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        		return v.toString(16);
    	});
		
    	return _id; 
//			'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//        		var r = _trueRandom() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
//        		return v.toString(16);
//    	});
	};

app.all('/*', function(req, res, next) {
  console.log("app.all/: " + req.url + " ; systemCode: " + apriConfig.systemCode );
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// test url for systemcode
app.get('/'+apriConfig.systemCode+'/', function(req, res) {
  console.log("Reqparam: " + req.url);
  res.send("ok");
});

apriClientName = apriClientSysName;
// Change apriClientName into first parameter when this is a internal app name
app.get('/'+apriConfig.systemCode+'/:internalapp/*', function(req, res, next) {
	console.log('Internal app: ' + req.params.internalapp);
	if (req.params.internalapp == 'apri-client-aireas') {
		apriClientName = req.params.internalapp;
	}
	if (req.params.internalapp == 'apri-client-openiod') {
		apriClientName = req.params.internalapp;
	}
	if (req.params.internalapp == 'apri-client-scapeler') {
		apriClientName = req.params.internalapp;
	}
	console.log(apriClientName);
	next();
});


// process app request with optional skin and theme parameters
app.get('/'+apriConfig.systemCode+'/app/:app/:theme/:skin*', function(req, res) {
	processApp(req, res, req.params.app, req.params.theme, req.params.skin);
});
app.get('/'+apriConfig.systemCode+'/app/:app/:theme*', function(req, res) {
	processApp(req, res, req.params.app, req.params.theme, 'defaulturl');
});
app.get('/'+apriConfig.systemCode+'/app/:app*', function(req, res) {
	processApp(req, res, req.params.app, 'defaulturl', 'defaulturl');
});

function processApp(req, res, app, theme, skin) {
	//  appRes=res;
	var _localAppHtml = findLocalApp(req.params.app);
	if (_localAppHtml != -1) {
		console.log('localAppHtml found: ' + req.params.app);
// when local app found continue
/*
    if (req.params.app!='apri' &&
        req.params.app!='aprimain' &&
        req.params.app!='apri-leaflet' &&
        req.params.app!='apri-leafet' &&  //duplicate because of strange url problem where l disappears
        req.params.app!='apri-landscape' &&
        req.params.app!='apri-air' &&
        req.params.app!='apri-air-ustream' &&
        req.params.app!='aprimainzorg' &&
        req.params.app!='aprimaintopoview' &&
        req.params.app!='apri-babylon' &&
        req.params.app!='apridemo' &&
        req.params.app!='apri-stats' &&
        req.params.app!='apriimpress' &&
        req.params.app!='abcimpress') {
*/
//      res.contentType('application/javascript');
//    }
		res.send(_localAppHtml.toString());
		return;
	}
	
	// todo: already error when trying to read app html file
	console.log( 'Application not found: ' + req.params.app + ' ' );
	data.code = 500;
	data.data = "ERROR , Application not found: " + req.params.app + "  ";
	res.send(data.code, data.data);
	return;
	
	
  // no more Alfresco dependency here
  /*
  initAppObj(req.params.app);
  console.log(req.params.app);
  var source="<p>{{titlex}}</p>";
  var template=handlebarsx.compile(source);
  source=template({titlex:"testtitel"});
  reqAlfresco (req.params.app, 'appconfig');
  */
};

// no more YUI dependency any more
/*
app.get('/'+apriConfig.systemCode+'/js/yui3/yui-gallery/:resturl*.gif', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  res.contentType('image/gif');
  console.log("YUI request mimetype: .gif" );
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/js/yui3/yui-gallery/:resturl*.png', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  res.contentType('image/png');
  console.log("YUI request mimetype: .png" );
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/js/yui3/yui-gallery/:resturl*', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  if (req.url.substring( req.url.length - 4, req.url.length)==".css") {
    res.contentType('text/css');
    console.log("YUI request mimetype: script/css: " +  '/js/yui3/yui-gallery/:resturl*' + ' ' + req.url );
  } else {
    if (req.url.substring( req.url.length - 4, req.url.length)==".png") {
      res.contentType('image/png');
      console.log("YUI request mimetype: script/png: " +  '/js/yui3/yui-gallery/:resturl*' + ' ' + req.url );
    } else {
      res.contentType('application/javascript');
      console.log("YUI request mimetype: script/js: " +  '/js/yui3/yui-gallery/:resturl*' + ' ' + req.url );
    }
  }

  res.send(_jsFile);
});


app.get('/'+apriConfig.systemCode+'/js/yui3/:yuiversion/:resturl*.gif', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  res.contentType('image/gif');
  //console.log("YUI request mimetype: .gif" );
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/js/yui3/:yuiversion/:resturl*.png', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  res.contentType('image/png');
  //console.log("YUI request mimetype: .png" );
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/js/yui3/:yuiversion/:resturl*', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  if (req.url.substring( req.url.length - 4, req.url.length)==".css") {
    res.contentType('text/css');
  } else {
    if (req.url.substring( req.url.length - 4, req.url.length)==".png") {
      res.contentType('image/png');
    } else {
      res.contentType('application/javascript');
    }
  }
  //console.log("YUI request mimetype: script" );
  res.send(_jsFile);
});
*/

// handling of different filetypes in js folder (third party modules
app.get('/'+apriConfig.systemCode+'/js/*.css', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  res.contentType('text/css');
  //console.log("YUI request mimetype: .png" );
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/js/*.woff', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  res.contentType('application/font-woff');
  //console.log("YUI request mimetype: .png" );
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/js/*.gif', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  res.contentType('image/gif');
  //console.log("YUI request mimetype: .png" );
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/js/*.png', function(req, res) {
  //console.log("YUI request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  res.contentType('image/png');
  //console.log("YUI request mimetype: .png" );
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/js/*.html', function(req, res) {
  //console.log("js/html request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url);
  res.contentType('text/html');
  //console.log("YUI request mimetype: .html" );
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/js/*', function(req, res) {
    console.log("js js/* request: " + req.url );

    res.contentType('application/javascript');
    var data;
    try {
        data = fs.readFileSync(systemFolderRoot + req.url );
    } catch (e) {
        //data=getTemplateConfig(req.url);
        data = " \n//\n// apri-server-sys: ERROR , js not found: " + req.url + "  ";
    }
    if (!data.data) {
        res.send(data);
    } else {
        if (data.code && data.code==200) {
            res.send(data.data);
        } else {
            res.send(data.code, data.data);
        }
    }
});

// no more element dependency
/*
app.get('/'+apriConfig.systemCode+'/apri-elements/*.html', function(req, res) {
  console.log("Apri elements/*.html request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('text/html');
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/apri-elements/*.js', function(req, res) {
  console.log("Apri elements/*.js request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('application/javascript');
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/apri-elements/*.js.map', function(req, res) {
  console.log("Apri elements/*.js.map request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('application/json');
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/apri-elements/*.css', function(req, res) {
  console.log("Apri elements/*.css request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('text/css');
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/apri-elements/*', function(req, res) {
  console.log("Apri elements/* request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('text/html');
  res.send(_jsFile);
});
*/

// assets subfolder requests (mainly for images)
app.get('/'+apriConfig.systemCode+'/apri-assets/*.png', function(req, res) {
	getLocalFile(req, res, {contentType:'image/png'});
});

// set contenttype depending on extension
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/*.ppt', function(req, res) {
	getLocalFile(req, res, {contentType:'application/mspowerpoint'});
//  console.log("Apri lib/*ppt request: " + req.url );
//  var _jsFile=fs.readFileSync(systemFolderRoot + req.url );
//  res.contentType('application/mspowerpoint');
//  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/*.pdf', function(req, res) {
	getLocalFile(req, res, {contentType:'application/pdf'});
//  console.log("Apri lib/*pdf request: " + req.url );
//  var _jsFile=fs.readFileSync(systemFolderRoot + req.url );
//  res.contentType('application/pdf');
//  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/*.css', function(req, res) {
	getLocalFile(req, res, {contentType:'text/css'});
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/*.gif', function(req, res) {
	getLocalFile(req, res, {contentType:'image/gif'});
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/*.png', function(req, res) {
	getLocalFile(req, res, {contentType:'image/png'});
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/*.jpg', function(req, res) {
	getLocalFile(req, res, {contentType:'image/jpeg'});
});
////badalloc error for mp4 +- 1GB
//app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/lib/*.mp4', function(req, res) {
//  console.log("Apri lib/*mp4 request: " + req.url );
//  var _jsFile=fs.readFileSync(systemFolderRoot + req.url );
//  res.contentType('video/mp4');
//  res.send(_jsFile);
//});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/lib/apri-open-sans-fontfacekit/*.woff', function(req, res) {
  console.log("Apri lib/apri-open-sans-fontfacekit/*.woff request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url );
  res.contentType('application/font-woff');
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/*.js', function(req, res) {
	getLocalFile(req, res, {contentType:'application/javascript'});
});


app.get('/'+apriConfig.systemCode+'/client/:apriclient/*.js', function(req, res) {
	getLocalFile(req, res, {contentType:'application/javascript'});
});
app.get('/'+apriConfig.systemCode+'/client/:apriclient/*.css', function(req, res) {
	getLocalFile(req, res, {contentType:'text/css'});
});
app.get('/'+apriConfig.systemCode+'/client/:apriclient/*.png', function(req, res) {
	getLocalFile(req, res, {contentType:'image/png'});
});
app.get('/'+apriConfig.systemCode+'/client/:apriclient/*.gif', function(req, res) {
	getLocalFile(req, res, {contentType:'image/gif'});
});
app.get('/'+apriConfig.systemCode+'/client/:apriclient/*.jpg', function(req, res) {
	getLocalFile(req, res, {contentType:'image/jpeg'});
});

// dit vervangen door bovenstaande
var apriClients = ['apri-client-aireas','apri-client-openiod','apri-client-scapeler'];
for (var i=0;i<apriClients.length;i++) {
	var apriClient = apriClients[i];
	app.get('/'+apriConfig.systemCode+'/'+apriClient+'/*.js', function(req, res) {
		getLocalFile(req, res, {contentType:'application/javascript'});
	});
	app.get('/'+apriConfig.systemCode+'/'+apriClient+'/*.css', function(req, res) {
		getLocalFile(req, res, {contentType:'text/css'});
	});
	app.get('/'+apriConfig.systemCode+'/'+apriClient+'/*.png', function(req, res) {
		getLocalFile(req, res, {contentType:'image/png'});
	});
	app.get('/'+apriConfig.systemCode+'/'+apriClient+'/*.gif', function(req, res) {
		getLocalFile(req, res, {contentType:'image/gif'});
	});
	app.get('/'+apriConfig.systemCode+'/'+apriClient+'/*.jpg', function(req, res) {
		getLocalFile(req, res, {contentType:'image/jpeg'});
	});
}

var getLocalFile = function(req, res, options) {
	console.log("Apri /*.extension request: " + req.url );
	fs.readFile(systemFolderRoot + req.url, function(err, data){
		if (err) {
			console.log(err);
		}
		res.contentType(options.contentType);
		res.send(data);
	})
};


// build folder is for minimized javascripts
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/build/*.js', function(req, res) {
  console.log("Apri build/*js request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('application/javascript');
  res.send(_jsFile);
});
// todo: remove YUI dependency
// models in Apri are entity/table handlers
/*
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/models/*.js', function(req, res) {
  console.log("Apri models/*js request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('application/javascript');
  res.send(_jsFile);
});
*/

//for (var appKey in apriConfig.apps) {
	// read json templates, create .js, cache and return result to client
	app.get('/'+apriConfig.systemCode+'/:appKey/template/:template', function(req, res) {
		var appkey = req.params.appKey;
		var appConfig = apriConfig.apps[req.params.appKey];
		var appLocation = appConfig.appLocation;
		console.log("App templates request: " + appkey );
		//console.log("App config for app: " + appKey );
		console.log("Apri templates/*js request: " + req.params.template );

//		res.contentType('application/javascript');
		res.contentType('text/html');
		var data;
		try {
			var fileLocation = systemFolderRoot + '/' + apriConfig.systemCode + '/' + appLocation + '/templates/' + req.params.template;
			var fileLocationJs = fileLocation + '.js';
			var fileLocationJson = fileLocation + '.json';
			console.log(fileLocationJs);
			data = fs.readFileSync(fileLocationJs);
			console.log("INFO , Template found: " + fileLocationJs);
		} catch (e) {
			data=getTemplateConfig(fileLocation);
			//data = " \n//\n// ERROR , Template not found: " + req.url + "  ";
			console.log("ERROR , Template not found: " + fileLocationJson);
		}
		if (!data.data) {
			res.send(data);
		} else {
			if (data.code && data.code==200) {
				res.send(data.data);
			} else {
				res.status(data.code).send(data.data);
			}
		}
	});
//}

function getTemplateConfig(fileLocation) {
    var error=false;
	var fileLocationJson = fileLocation + '.json'
    //var jsonUrl = url.replace('.js','.json');
    var configFile=null;
    var data={"code": 200, "data": ""};
    
    try {
        configFile = fs.readFileSync(fileLocationJson );
    } catch (e) {
        error=true;
    }
    if (error) {
        console.log( 'Template generation ERROR: ' + fileLocationJson + ' ' );
        data.code = 404;
        data.data = "ERROR , Template not found: " + fileLocationJson + "  ";
    } else {
        console.log( 'Template generation: ' + fileLocationJson + ' INFO' );
        try {
            var configData = JSON.parse(configFile);
        } catch(e2) {
            error=true;
        }
        if (error) {
            console.log( 'Template generation JSON parse ERROR: ' + fileLocationJson + ' ' );
            data.code = 500;
            data.data = "ERROR , Template json incorrect: " + fileLocationJson + "  ";
        } else {
            data.data = apriTemplateTool.createTemplate(configData, fileLocationJson, false) ;
        }
    }
    return data ;
}

// read json templates, create .js, cache and return result to client
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/portlets/*.js', function(req, res) {
    console.log("Apri portlets/*js request: " + req.url );

    res.contentType('application/javascript');
    var data;
    try {
        data = fs.readFileSync(systemFolderRoot + req.url );
    } catch (e) {
        data=getPortletConfig(req.url);
        //data = " \n//\n// ERROR , Portlet not found: " + req.url + "  ";
    }
    if (!data.data) {
        res.send(data);
    } else {
        if (data.code && data.code==200) {
            res.send(data.data);
        } else {
            res.send(data.code, data.data);
        }
    }
});

function getPortletConfig(url) {
    var error=false;
    var jsonUrl = url.replace('.js','.json');
    var configFile=null;
    var data={"code": 200, "data": ""};
    
    try {
        configFile = fs.readFileSync(systemFolderRoot + jsonUrl );
    } catch (e) {
        error=true;
    }
    if (error) {
        console.log( 'Portlet generation ERROR: ' + systemFolderRoot + jsonUrl + ' ' );
        data.code = 404;
        data.data = "ERROR , Portlet not found: " + jsonUrl + "  ";
    } else {
        console.log( 'Portlet generation: ' + jsonUrl + ' INFO' );
        try {
            var configData = JSON.parse(configFile);
        } catch(e2) {
            error=true;
        }
        if (error) {
            console.log( 'Portlet generation JSON parse ERROR: ' + jsonUrl + ' ' );
            data.code = 500;
            data.data = "ERROR , Portlet json incorrect: " + jsonUrl + "  ";
        } else {
            data.data = apriPortletTool.createPortlet(configData, url, apriTemplateTool) ;
        }
    }
    return data ;
}

// actions not functional or replaced by portlet function?
/*
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/actions/*.js', function(req, res) {
    console.log("Apri actions/*js request: " + req.url );

    res.contentType('application/javascript');
    var data;
//    try {
//        data = fs.readFileSync(systemFolderRoot + req.url );
//    } catch (e) {
//        data=getPortletConfig(req.url);
//        //data = " \n//\n// ERROR , Portlet not found: " + req.url + "  ";
//    }
	data={"test":"test"};
    if (!data.data) {
        res.send(data);
    } else {
        if (data.code && data.code==200) {
            res.send(data.data);
        } else {
            res.send(data.code, data.data);
        }
    }
});
*/

// plugins and widgets still in YUI
/*
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/plugins/*.js', function(req, res) {
  console.log("Apri plugins/*js request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('application/javascript');
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/plugins/*.css', function(req, res) {
  console.log("Apri plugins/*css request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('text/css');
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/plugins/*.gif', function(req, res) {
  console.log("Apri plugins/*gif request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('image/gif');
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/widgets/*.js', function(req, res) {
  console.log("Apri widgets/*js request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('application/javascript');
  res.send(_jsFile);
});
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/widgets/*.css', function(req, res) {
  console.log("Apri widgets/*css request: " + req.url );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); 
  res.contentType('text/css');
  res.send(_jsFile);
});
*/


//zie boven ?? is deze dubbel ??
app.get('/'+apriConfig.systemCode+'/'+apriClientName+'/lib/:module', function(req, res) {
  console.log("Apri lib request: " + req.url );
  console.log("Apri lib request module: " + req.params.module );
//  console.log("YUI request: " + req.params.resturl );
  var _jsFile=fs.readFileSync(systemFolderRoot + req.url ); //+ req.params.module);
  res.contentType('application/javascript');
  res.send(_jsFile.toString());
});

app.listen(apriConfig.systemListenPort);
console.log('listening to http://proxyintern: ' + apriConfig.systemListenPort);
 

function StreamBuffer(req) {
  var self = this

  var buffer = []
  var ended  = false
  var ondata = null
  var onend  = null

  self.ondata = function(f) {
    console.log("self.ondata")
    for(var i = 0; i < buffer.length; i++ ) {
      f(buffer[i])
      console.log(i);
    }
    console.log(f);
    ondata = f
  }

  self.onend = function(f) {
    onend = f
    if( ended ) {
      onend()
    }
  }

  req.on('data', function(chunk) {
    var _reqBody=JSON.parse(req.body);
    console.log("req.on data: " + _reqBody.name + "." + _reqBody.type);
    if (appTypes[_reqBody.type][_reqBody.appItemSequence]) {
      appTypes[_reqBody.type][_reqBody.appItemSequence] += chunk;
    } else {
      appTypes[_reqBody.type][_reqBody.appItemSequence] = chunk;
    }

    if( ondata ) {
      ondata(chunk)
    }
    else {
      buffer.push(chunk)
    }
  })

  req.on('end', function() {
    //console.log("req.on end")
    ended = true;
    nrTransactions--;
    var _reqBody=JSON.parse(req.body);
    console.log("req.on end: " + _reqBody.name + "." + _reqBody.type + " " + _reqBody.appItemSequence);
    writeFile(appsLocalPath, _reqBody.name + "." + _reqBody.type , appTypes[_reqBody.type][_reqBody.appItemSequence].toString());
    
    if (_reqBody.type == "template" && appTypes[_reqBody.type][_reqBody.appItemSequence]!=null) {      
        //var _templatesStr = appTypes["template"].toString();
        var _templates = html2js(appTypes[_reqBody.type][_reqBody.appItemSequence].toString(), _reqBody.name, _reqBody.type);
        appTypes[_reqBody.type][_reqBody.appItemSequence] = _templates;
    }

    if( onend ) {
      onend()
    }
  })        
 
  req.streambuffer = self
}

function html2js(inp, name, type) {
  var _name = name.replace(/-/g,"_");
  lines=inp.split("\n");
  var out =""; 
  out +="\n  // Generated from template: " + name + "." + type + " (use: template_" + _name + ")";
  out +="\n  var template_" + _name + " = ";
  for(var i=0; i<lines.length; i++) {
    var _str = lines[i].replace(/'/g,"`");  //`'
    if (i!=lines.length-1) {
      out+="\n '" + _str + "' +";
    } else {
      out+="\n '" + _str + "';";
    } 
  }
  return (out);
}

function base64_decode (data) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Thunder.m
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
    // *     returns 1: 'Kevin van Zonneveld'
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['btoa'] == 'function') {
    //    return btoa(data);
    //}
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        dec = "",
        tmp_arr = [];

    if (!data) {
        return data;
    }

    data += '';

    do { // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;

        if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
    } while (i < data.length);

    dec = tmp_arr.join('');

    return dec;
}  // end of decode


