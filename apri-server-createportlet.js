/*jslint devel: true,  undef: true, newcap: true, white: true, maxerr: 50 */
/**
 * The apri-server-createportlet module for creating portlets.
 * @module apri-server-createportlet
 */

var Y = {};

module.exports = {

    portletCache: [],

    createPortlet: function (portletConfig, url, apriTemplateTool) {
        var newPortlet='';
        var tmpPortletContent='';
        
        var urlArray = url.split('/');
        var urlNameIndex= urlArray.length-1;
        var name = urlArray[urlNameIndex].split('.')[0];
        

        var cacheFound = false;
        var cacheIndex;
        for (var i=0; i<this.portletCache.length;i++) {
            if (this.portletCache[i].portletName == name) {
                cacheFound = true;
                cacheIndex = i;
                break;
            }
        }
        
        if (cacheFound) {
        
            return "\n// Portlet from cache: \n".concat( this.portletCache[cacheIndex].cachedPortlet);
        
        }
        
        
        newPortlet = newPortlet.concat("\n// Generated portlet: ", name,  "/" , portletConfig.name, "\n"
        	, "YUI.add('", name, "', function (Y) { 'use strict'; " );
    
        
        if (portletConfig.templates) {
		  	var _tmp = {};
			_tmp.templates = portletConfig.templates;
			tmpPortletContent = apriTemplateTool.createTemplate( _tmp, url, false) ;
        	newPortlet = newPortlet.concat("\nvar _tmpPortletTemplate= '", tmpPortletContent, "';\n"
        	 	, "\nvar _portletNode = Y.one(document.body);"
				, "\n_portletNode.append(_tmpPortletTemplate);" )
        }

        if (portletConfig.actions) {
            for (var i=0;i<portletConfig.actions.length;i++) {
                var _action = portletConfig.actions[i];
            	if (_action.action == 'loadApp') {
        			newPortlet = newPortlet.concat( "Y.ApriEventsModule.loadApp(\"", _action.url, "\", ", JSON.stringify(_action.target), ", ", JSON.stringify(_action.param), ");" );
                }
            }
        }

		newPortlet = newPortlet.concat( "},'0.0.1', {requires:[], skinnable: false });" );
        
        var portletForCache = {};
        portletForCache.portletName= name;
        portletForCache.cachedPortlet=newPortlet;
        this.portletCache.push(portletForCache);

        return "\n// Portlet created: \n".concat(  newPortlet );

    }
};

    
