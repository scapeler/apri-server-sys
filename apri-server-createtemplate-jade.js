
/*jslint devel: true,  undef: true, newcap: true, white: true, maxerr: 50 */ 
/**
 * The apri-server-createtemplate-jade module for creating jade templates.
 * @module apri-server-createtemplate-jade
 */
//   "use strict";
//

var Y = {
	  sPrefix: 'apri'
	, sDelimiter: '-'
	, getClassName: function () {
            //var args = Y.Array(arguments);
            var args = Array.apply(null, arguments);//new Array(arguments);

            if (args[args.length-1] !== true) {
                args.unshift(Y.sPrefix);
            } else {
                args.pop();
            }
			return  args.join(Y.sDelimiter);

		}
};
Y.classNames= {
        singleValueInput   			: Y.getClassName('singlevalue-input'),
        singleValueIntern   		: Y.getClassName('singlevalue-intern'),
        singleValueInternName   	: Y.getClassName('singlevalue-intern-name'),
        singleValueInternSysNodeUuid: Y.getClassName('singlevalue-intern-sysnodeuuid'),
        singleValueInternDescription: Y.getClassName('singlevalue-intern-description'),
        multiValueInput   			: Y.getClassName('multivalue-input'),
        multiValueIntern   			: Y.getClassName('multivalue-intern'),
        multiValueInternName   		: Y.getClassName('multivalue-intern-name'),
        multiValueInternSysNodeUuid	: Y.getClassName('multivalue-intern-sysnodeuuid'),
        multiValueInternDescription	: Y.getClassName('multivalue-intern-description'),
        multiValueChangedIntern		: Y.getClassName('multivaluechanged-intern')
	};

var i18n = null;
var apriI18n = function (str) {
		var i18nString = '';
		var _newString = '';
		var _tmpArray = str.split('{{i18n ');
		if (_tmpArray.length>1) {
			_newString = _tmpArray[0];
			for (var i=1;i<_tmpArray.length;i++) {
				var n = _tmpArray[i].indexOf('}}');
				if (n==-1) {
					_newString = _newString.concat(_tmpArray[i]);
				} else {
					_newString = _newString.concat(i18n.t(_tmpArray[i].substr(0,n)), _tmpArray[i].substr(n+2) );
				}
			}
		} else {	
			_newString = str;	
		}
		return _newString;
};


module.exports = {

    templateCache: [],
	
	seti18n: function (global_i18n) {
		i18n = global_i18n;
	},
	
	getTemplateConfig: function(fs, templateFolder, templates) {
		var error, configFile,
			data={"code": 200, "data": ""},
			templateFileName, templateName, templateFullPath;
			
    	templateFileName 	= templates[0].templateFileName;
		templateName 		= templates[0].templateName;
    	templateFullPath 	= templateFolder + '/' + templateFileName;
		
    	try {
        	configFile = fs.readFileSync(templateFullPath);
    	} catch (e) {
        	error=true;
			if (e.code === 'ENOENT') {
  				console.log('File not found!');
			} else {
  				console.log('Error! getTemplateConfig Jade ' + e.code );
  				//throw e;
			}
    	}
    	if (error) {
        	console.log( 'Template generation Jade ERROR: ' + templateFileName + ' ('+error+')' );
        	data.code = 404;
        	data.data = "ERROR , Template not found: " + templateFileName;
    	} else {
        	console.log( 'Template generation Jade: ' + templateFileName + ' INFO' );
        	try {
            	var templateConfig = JSON.parse(configFile);
        	} catch(e2) {
            	error=true;
        	}
        	if (error) {
            	console.log( 'Template generation Jade JSON parse ERROR: ' + templateFileName );
            	data.code = 500;
            	data.data = "ERROR , Template Jade JSON incorrect: " + templateFileName ;
        	} else {
            	data.data = this.createTemplate(templateConfig, templateFileName, templateName, 'jade') ;
        	}
    	}
    	return data ;
	},


    // module = 'jade' else 'portlet'?
    createTemplate: function (templateConfig, templateFileName, templateName, templateType) {
        var newTemplate='';
        var tmpTemplateContent='';
        
//        var urlArray = templateFolder.split('/');
//        var urlNameIndex= urlArray.length-1;
//        var name = urlArray[urlNameIndex].split('.')[0];
		var _templateFileName 	= templateFileName;
		var _templateName 		= templateName;
		var _templateCacheName 	= _templateFileName + ':' + _templateName;
		
        var cacheFound = false;
        var cacheIndex;
        for (var i=0; i<this.templateCache.length;i++) {
            if (this.templateCache[i].templateCacheName == _templateCacheName) {
                cacheFound = true;
                cacheIndex = i;
                break;
            }
        }
        
        if (cacheFound) {
        
            if (templateType == 'jade') {
                return "// Template from cache:\n".concat(this.templateCache[cacheIndex].cachedTemplate);
//                return "// Template from cache:\n".concat(this.templateCache[cacheIndex].cachedTemplate);
            } else {
                return "<!-- Template from cache: -->".concat(this.templateCache[cacheIndex].cachedTemplate);
            }
        
        }


        if (templateType == 'jade' ) {
	        newTemplate = newTemplate.concat("// Generated jade template: ", _templateCacheName, "\n"
				);
//	        newTemplate = newTemplate.concat("// Generated template: ", templateConfig.templateName, "\n"
//				, "YUI.add('", name, "', function (Y) { 'use strict'; "
//			 	, "\nY.initTemplate = function() { "
//				, "if (Y.templateHTML==null) { Y.templateHTML=[]; }");
        }
    
		if (templateConfig.templates) {
        	for (var i=0;i<templateConfig.templates.length;i++) {
            	var _template = templateConfig.templates[i];
            	if (_template.templateName == _templateName) {
					tmpTemplateContent = '';
            
        			if (templateType == 'jade' ) {
						tmpTemplateContent = tmpTemplateContent.concat( "// template name: ", _template.templateName);
					} else {
						tmpTemplateContent = tmpTemplateContent.concat( " <!-- \"template name\": \"", _template.templateName, "-->");
					}
					if (_template.blocks) {
						tmpTemplateContent = tmpTemplateContent.concat( apriBlocks(_template.blocks, 0));
					}
        			if (templateType == 'jade' ) {
						tmpTemplateContent = tmpTemplateContent.concat( "\n// end of template: ", _template.templateName, "\n");
					} else {
						tmpTemplateContent = tmpTemplateContent.concat( "\n <!-- end of template: ", _template.templateName, "-->");
  						var tmpTemplateContent2 = tmpTemplateContent.replace(/\n/g," ' +\n ' ");
					}
					//tmpTemplateContent2.concat("");

			        if (templateType == 'jade' ) {
   		         		newTemplate = newTemplate.concat( tmpTemplateContent );
//      	      		newTemplate = newTemplate.concat( "\n Y.templateHTML[\"", _template.name, "\"]=\'", tmpTemplateContent2, "';");
					} else {
                		newTemplate = newTemplate.concat( tmpTemplateContent2);
                		i=templateConfig.templates.length;  //only one template for portlets
                	}
					break;
				}
        	}
        }
        
        if (templateType == 'jade' ) {
			newTemplate = newTemplate.concat( "" );
//			newTemplate = newTemplate.concat( "};"
//    	   		, "},'0.0.1', {requires:[], skinnable: false });");
		}

        var templateForCache = {};
        templateForCache.templateCacheName 	= _templateCacheName;
        templateForCache.cachedTemplate = newTemplate;
        this.templateCache.push(templateForCache);

        var _t;
		if (templateType == 'jade' ) {
            _t= "\n// Template jade created: \n";
//            _t= "// Template created: \n";
        } else {
            _t= "<!-- Template created: -->";
        }

		return _t.concat(newTemplate);
    }
};

    
    var blockDefaults=[];
    
    blockDefaults.defaults =[ 
        {"block":"fieldset", "options": [
            { "class": "apri"}
            ]
        }
    ];
        
    
    blockDefaults.currency= { "blocks": [
        { "block":"div", "class": "formmgr-row"
          , "blocks": [
            { "block": "label", "class": "label", "labelText": "default"
                , "for": {"separator": "-", "handlebar": "apriFormContainer" , "fieldName": "default"}
            }
            ,{ "block": "p", "class": "formmgr-message-text" }
            ,{ "block": "input", "class": "formmgr-field apriAmount yiv-decimal:[1,10]"
                , "type": "text"
                , "id": {"separator": "-", "handlebar": "apriFormContainer" , "fieldName": "default", "suffix": "input"}
                , "placeholder": "default"
                , "value": {"handlebar": { "text": "data.", "fieldName": "default", "suffix": "Input"} }
                , "name": {"fieldName": "default", "type": "Input"} 
            }
            ,{ "block": "input", "class": "formmgr-field apriAmount yiv-decimal:[1,10]"
                , "type": "hidden"
                , "id": {"separator": "-", "handlebar": "apriFormContainer" , "fieldName": "default", "suffix": "intern"}
                , "name": {"fieldName": "default"} 
                , "value": {"handlebar": { "text": "data.", "fieldName": "default"} }
            }
            ,{ "block": "span", "class": "apriCurrencyPrefixed"
                , "id": {"separator": "-", "handlebar": "apriFormContainer" , "fieldName": "default", "suffix": "currency"}
            }
        ]
        }
    ]};
    


//example template configuration:
    var templateConfigTest = 
    { "templateName":"testtemplate",
        "blocks": [ 
            { "block":"fieldset",
                "blocks": [ 
                    { "block": "legend", "text":"Totalen:"}
                    , {"block": "formComponent"
                        , "type": "currency"
                        , "fieldName": "simpleTotal1", "placeholder": "Totaalbedrag Excl.", "labelText": "Excl.:"  }
                    , {"block": "formComponent"
                        , "type": "currency"
                        , "fieldName": "simpleTotal2", "placeholder": "Totaalbedrag Incl.", "labelText": "Incl.:"  }
                    , {"block": "formComponent"
                        , "type": "currency"
                        , "fieldName": "simpleTotal3", "placeholder": "Totaalbedrag BTW", "labelText": "BTW:"  }
                ]
            }
        ]
    };
	

    apriBlocks = function(blocks, level) {
		var _level = level+1;
		var _levelIndent = '\n' + Array(_level).join("  ");
		console.log('Start apriBlocks');
        var newBlock="";
		
		var _style="";
		
       // Y.each(blocks, function(block) {
        for (var i=0; i<blocks.length;i++) {
            var block = blocks[i]; 
			
			
//=============== init _fields start
			block._levelIndent		= _levelIndent;
			block._style 			= (block.style)?block._levelIndent+'style="'+block.style+'" ':'';
			block._blockClass 		= (block.blockClass)?block._levelIndent+'class="apri-block-'+block.block+' '+block.blockClass+'" ':block._levelIndent+'class="apri-tag-'+block.block+ '" ';
			block._href 			= (block.href)?block._levelIndent+'href="'+block.href+'" ':'';
			block._imgSrc			= (block.imgSrc)?block._levelIndent+'src="'+block.imgSrc+'" ':'';

			block._text				= (block.text)?block.text:'';
			if (block._text!='') {
				block._text = apriI18n(block._text);
			}
//			block._text				= (block.text)?block.text:'';

			block._labelText		= (block.labelText)?block.labelText:'';
			if (block._labelText!='') {
				block._labelText = apriI18n(block._labelText);
			}

			block._functionClass	= (block.functionClass)?block.functionClass:'';
						
			if (block.block == 'a') {
				block._target 		= (block.target)?block._levelIndent+'target="'+block.target+'" ':block._levelIndent+'target="_blank" ';
			} else block._target 	= '';

			block._id='';
			if (block.type) {
				block._id			= (block.idShort)?'id="'+block.fieldName||block.idShort+'-'+block.type+'" ':'';
				block._id			= (block._id==''&&block.id)?'id="{{apriFormContainerId}}-'+block.id+'-'+block.type+'" ':'';
			} else {
				block._id			= (block.idShort)?'id="'+block.idShort||block.fieldName+'" ':'';
				block._id			= (block._id==''&&block.id)?'id="{{apriFormContainerId}}-'+block.id+'" ':'';
			}
			block._attributes	= '';
			for (attr in block.attributes) {
            	if (typeof block.attributes[attr] !== 'function') {
                	block._attributes = block._attributes.concat( block._levelIndent, attr , '="', block.attributes[attr], '"');
				}
            }

			// template internal _field start
			block._type 		= (block.type)?block.type:'';
			block._type 		= (!block.type&&block.block=='formComponent')?'text':'';  // defaults to text for formcomponents
			

			block._fieldName 		= (block.fieldName)?block.fieldName:'';
			block._formClass 		= (block.formClass)?block.formClass:'';
			block._formStyle 		= (block.formStyle)?block.formStyle:'';
			block._formAppend 		= (block.formAppend)?block.formAppend:'';
			block._fieldPrefixText 	= (block.fieldPrefixText)?block.fieldPrefixText:'';
			block._fieldSuffixText 	= (block.fieldSuffixText)?block.fieldSuffixText:'';
			
			// input placeholder
			block._placeholderStr 	= block.placeholder?block.placeholder:'';
			// i18n 
			if (block._placeholderStr !='') block._placeholderStr = apriI18n(block._placeholderStr);
			if (block._placeholderStr !='') {
				block._placeholder			= 'placeholder="' + block._placeholderStr +'" ';
				block._placeholderIndented	= block._levelIndent + block._placeholder;
			} else {
				block._placeholder 			= '';
				block._placeholderIndented 	= '';
			}

			if (block.mode == 'edit') {
				block._editClassStr = block.edit?'apriformfield-edit-true':'apriformfield-edit-false'  
			} else block._editClassStr = '';
			

			// template internal _field end



//		var _formClass 			= (block.formClass)?block.formClass:'';
//		var _formStyle 			= (block.formStyle)?block.formStyle:'';
//		var _formAppend 		= (block.formAppend)?block.formAppend:'';
//		var _fieldPrefixText 	= (block.fieldPrefixText)?block.fieldPrefixText:'';
//		var _fieldSuffixText 	= (block.fieldSuffixText)?block.fieldSuffixText:'';

//=============== init _fields end 


			if (['a', 'div', 'fieldset'
				, 'h1', 'h2', 'h3', 'h4'
				, 'img', 'legend', 'span', 'ul' 
				].indexOf(block.block)>=0) {  // not found returns -1
                newBlock = newBlock.concat(block._levelIndent, block.block, '(', block._id, block._blockClass, block._imgSrc, block._style, block._href, block._target, ') ' );
				newBlock = newBlock.concat(block._text);
                if (block.blocks) newBlock = newBlock.concat(apriBlocks(block.blocks, _level));
			}

			
            switch (block.block) { 
/*            case "grid":
                newBlock = newBlock.concat("<!-- Grid: -->"
                	, '<div class="yui3-g" ' )
                if (block.height) {
                    newBlock = newBlock.concat(' height="', block.height, '"');
                }
                newBlock = newBlock.concat(' >');
                if (block.blocks) {
                    newBlock = newBlock.concat(apriBlocks(block.blocks, _level));
                }
                newBlock = newBlock.concat("</div>"
                	, "<!-- end of grid block  -->");
                break;
            case "gridcolumn":
                newBlock = newBlock.concat("<!-- GridColumn: -->"
					, '<div class="yui3-u-', block.fraction, '">');
                if (block.blocks) {
                    newBlock = newBlock.concat(apriBlocks(block.blocks, _level));
                }
                newBlock = newBlock.concat("</div>"
                	, "<!-- end of gridcolumn block  -->")
                break;
  */
            case "html":
                newBlock = newBlock.concat(block._levelIndent, '|', block.text);
                break;
            case "video":
                var _attributes ='';
                if (block.attributes) {
                    for (attr in block.attributes) {
                        if (typeof block.attributes[attr] !== 'function') {
                            _attributes = _attributes.concat( ' ', block.attributes[attr].key , '="', block.attributes[attr].value, '"');
                        }
                    }
                }
                var _id = "";    
                if (block.id) {
                    _id = _id.concat( ' id="{{apriFormContainer}}-', block.id, '"');
                } else { if (block.idShort) {
                    	_id = _id.concat( ' id="', block.idShort, '"');
                	} 
                }
                newBlock = newBlock.concat("<!-- video: -->\n"
                	, '<video ');
                _style      = (block.style)?block.style:"";
                var _blockClass = (block.blockClass)?block.blockClass:"";
                newBlock = newBlock.concat(' ', _id, ' style=" ', _style, '"',
                    ' class=" ', _blockClass, '" ', _attributes,  '>',
                    '</video>');
                break;
/*
            case "form":
                newBlock = newBlock.concat('form(enctype="application/json" method="post" '
					, ' id="{{apriFormContainer}}-main-form"');  // ! important, id is always == {{apriFormContainerId}}-main-form
//                _style = (block.style)?block.style:"";
                newBlock = newBlock.concat(block._style , block._blockClass,') ');
//                var _blockClass = (block.blockClass)?block.blockClass:"";
//                newBlock = newBlock.concat(' class="yui3-form-content ', _blockClass, '"'
 //               	, '>');
 //               if (block.id) {
 //                   newBlock = newBlock.concat( '<div id="{{apriFormContainer}}-', block.id, '">');
 //               }
                if (block.text) {
                    newBlock = newBlock.concat( '<div>', block.text, '</div>');
                }
                if (block.blocks) {
                    newBlock = newBlock.concat(apriBlocks(block.blocks, _level));
                }
//                if (block.id) {
//                    newBlock = newBlock.concat( '</div>');
//                }
                newBlock = newBlock.concat( '</form>');
                break;
*/
            case "formComponent":
                if (typeof Y._ApriBlockTemplates[block.type] == 'function') {
					newBlock = newBlock.concat(block._levelIndent, '// start of template block: ', block._type);
					newBlock = newBlock.concat( Y._ApriBlockTemplates[block.type](block));
					newBlock = newBlock.concat(block._levelIndent, '// end of template block: ', block._type);
                } else {
                    newBlock = newBlock.concat(block._levelIndent, "// Fieldset template not found: ", block.type, "");
                }
                break;
            default:
            }            
        }; 
        return newBlock;
    };

    Y._ApriBlockTemplates = [];

    Y._ApriBlockTemplates.currency = function(args) {
        var newBlock="";
        newBlock = newBlock.concat('<!-- Fieldset template: ', args.id, ' \n--><div class="formmgr-row">'
        	, '<label class="label" width="4em" for="{{apriFormContainer}}-', args.fieldName, '">', args.labelText, "</label>");
        if (args.fieldName) {
            newBlock = newBlock.concat('<p class="formmgr-message-text"></p>'
            	, '<input');
            if (args.mode=='edit') {
                newBlock = newBlock.concat(' type="text" tabindex="2"');
            } else {
                newBlock = newBlock.concat(' type="hidden"');
            }
            var _functionClass = (args.functionClass)?args.functionClass:"";
            var _formClass = (args.formClass)?args.formClass:"";
            newBlock = newBlock.concat(' class="formmgr-field apriAmount ', _functionClass, ' ', _formClass, '"'
            	, ' name="', args.fieldName, 'Input"'
            	, ' placeholder="', args.placeholder, '"'
            	, ' value="{{data.', args.fieldName, 'Input}}"'
            	, ' id="{{apriFormContainer}}-', args.fieldName, '-input"'
				, '/>'

            	, '<input type="hidden"'
            	, ' class="formmgr-field apriAmount"'
            	, ' name="', args.fieldName, '"'
            	, ' value="{{data.', args.fieldName, '}}"'
            	, ' id="{{apriFormContainer}}-', args.fieldName, '-intern"'
            	, '/>'

            	, '<span'
            	, ' class="apriCurrencyPrefixed"'
            	, ' id="{{apriFormContainer}}-', args.fieldName, '-currency"'
            	, '>'
            	, '</span>'
            
            	, '<BR/>');
        }
        return newBlock.concat("</div><!-- end of template block: ", args.id, " \n-->");
    };

    Y._ApriBlockTemplates.number = function(args) {
        var newBlock="";
        newBlock = newBlock.concat('<!-- Fieldset template: ', args.id, ' \n--><div class="formmgr-row">'
        	, '<label class="label" width="4em" for="{{apriFormContainer}}-', args.fieldName, '">',  args.labelText, "</label>");
        if (args.fieldName) {
            newBlock = newBlock.concat('<p class="formmgr-message-text"></p>'
            	, '<input');
            if (args.mode=='edit') {
                newBlock = newBlock.concat(' type="text" tabindex="2"');
            } else {
                newBlock = newBlock.concat(' type="hidden"');
            }
            var _functionClass = (args.functionClass)?args.functionClass:"";
            var _formClass = (args.formClass)?args.formClass:"";
            var _formStyle = (args.formStyle)?args.formStyle:" width:9em; ";
            newBlock = newBlock.concat(' class="formmgr-field apriNumber ', _functionClass, ' ', _formClass, '"'
            	, ' style=" ', _formStyle, '"'
            	, ' name="', args.fieldName, 'Input"');
            if (args.placeholder) {newBlock = newBlock.concat(' placeholder="', args.placeholder, '"');}
            newBlock = newBlock.concat(' value="{{data.', args.fieldName, 'Input}}"'
            	, ' id="{{apriFormContainer}}{{apriFormContainerId}}-', args.fieldName, '-input"'
            	, '/>'

            	, '<input type="hidden"'
            	, ' class="formmgr-field"'
            	, ' name="', args.fieldName, '"'
            	, ' value="{{data.', args.fieldName, '}}"'
            	, ' id="{{apriFormContainer}}{{apriFormContainerId}}-', args.fieldName, '-intern"'
            	, '/>'
            
            	, '<BR/>');
        }
        return newBlock.concat("</div><!-- end of template block: ", args.id," \n-->");
    };

    Y._ApriBlockTemplates.button = function(block) {
        var newBlock="";
        if (block._fieldName=='') return '';

		if (block._imgSrc!='') {
			newBlock = newBlock.concat('img','(', block._id, block._imgSrc, block._style, 'class="apri-img-button" ) ' );
        } else {
			newBlock = newBlock.concat(block._levelIndent, 'div(', block._id, block._blockClass, block._style, ') ', block._labelText );
        }
        return newBlock;
    };

    Y._ApriBlockTemplates.boolean = function(args) {
        var newBlock="";
        newBlock = newBlock.concat('<!-- Fieldset template: ', args.id, ' -->\n');
        if (!args.fieldName) return;

        var _formClass = (args.formClass)?args.formClass:"";
        var _formStyle = (args.formStyle)?args.formStyle:"";
        var _formLabelStyle = (args.formLabelStyle)?args.formLabelStyle:"";

		if (args.labelText && args.labelText !='') {
			newBlock = newBlock.concat('<span class="aprientry-label" width="4em">', args.labelText, '</span>');
		}
        
        if (args.mode=='edit') {
            var _style = (args.style)?'style="'+args.style+'"':"";
            var _functionClass = (args.functionClass)?args.functionClass:"";
            if (args.text) {newBlock+= args.text;}
            newBlock = newBlock.concat(' <div class="formmgr-row" '
            	, ' ', _style, ' '
            	, '>'
            	, '<p class="formmgr-message-text"></p>'
            	, '<input'
            	, ' type="checkbox" tabindex="2"'
				, ' checked="{{data.', args.fieldName, '}}"'
            	, ' class="formmgr-field apriText ',  _functionClass, ' ', _formClass, '"'
            	, ' style=" ', _formStyle, '"'
            	, ' name="', args.fieldName, '"'
            	, ' value="true"'
            	, ' id="{{apriFormContainer}}{{apriFormContainerId}}-', args.fieldName, '-input"'
            	, '>'
            	, '</input>'
            	, '</div>');
        } else {
            newBlock = newBlock.concat('<!-- boolean template: ', args.id, ' -->\n'
            	, '<span class="yui3-button"'
            	, ' id="{{apriFormContainer}}{{apriFormContainerId}}-', args.fieldName, '-button">'
            	,  args.labelText
            	, '</span>');
        }

        return newBlock.concat("<!-- end of template block: ", args.id, " \n-->");
    };


    Y._ApriBlockTemplates.text = function(block) {
	
        if (block._fieldName == '') return '';
    
		var newBlock="";
		var _levelIndent = block._levelIndent;
		
		// form field block
		newBlock = newBlock.concat(_levelIndent, 'div(id="{{apriFormContainerId}}-', block._fieldName, '" class="apriformfield-block" )' );
		_levelIndentSub		= _levelIndent + '  ';
		_levelIndentSubSub 	= _levelIndentSub + '  ';
		
//		var _formClass 			= (block.formClass)?block.formClass:'';
//		var _formStyle 			= (block.formStyle)?block.formStyle:'';
//		var _formAppend 		= (block.formAppend)?block.formAppend:'';
//		var _fieldPrefixText 	= (block.fieldPrefixText)?block.fieldPrefixText:'';
//		var _fieldSuffixText 	= (block.fieldSuffixText)?block.fieldSuffixText:'';

		if (block._labelText !='') {
			newBlock = newBlock.concat('div(class="apriformfield-block-label" )\n', _levelIndentSub, '|', block._labelText);
		}

		if (block.mode=='edit') {
			//var _functionClass = (block.functionClass)?block.functionClass:"";
			//var _placeholder = (block.placeholder)?', placeholder="'.concat( block.placeholder, '"'):"";
//			var _editClass = block.edit?"apri-template-edit-true":"apri-template-edit-false"
			newBlock = newBlock.concat(
				  _levelIndentSub, 'div(id="{{apriFormContainerId}}-', block._fieldName, '-input-block"' 
				, _levelIndentSub, 'class="apriformfield-input-block ', block._editClassStr, '")'
					, _levelIndentSubSub, 'div', '(id="{{apriFormContainerId}}-', block._fieldName, '-input-message" ','class="apriformfield-input-message")'
					, _levelIndentSubSub, 'input'
						, '(id="{{apriFormContainerId}}-', block._fieldName, '-input"'
						, ', class=" apriformfield-input apriformfield-input-text ', block._functionClass, ' ', block._formClass + '"'
			 			, ', style=" ', block._formStyle, '"'
						, ', name="', block._fieldName, '"'
						, _levelIndentSubSub, 'type="text", tabindex="2"'
						, _levelIndentSubSub, block._placeholder
						, ', value="{{data.', block._fieldName, '}}"'
				, ')');
		}
		

		newBlock = newBlock.concat(_levelIndentSub, 'div(id="{{apriFormContainerId}}-', block._fieldName, '-inquire-block" class="');

		if (block.mode=='edit') {
			newBlock = newBlock.concat('apriformfield-inquire-block apriformfield-inquire-false ');
		}
		
		newBlock = newBlock.concat(block.blockClass, '" '
        	, ' ', block._style, ' '
			, ')'
        	, _levelIndentSubSub, 'div'
			, '(id="{{apriFormContainerId}}-', block._fieldName, '-inquire" class="apriformfield-inquire', ' ', block._formClass, '"'
			, ', style=" ', block._formStyle, '")'
			, _levelIndentSubSub, '|', block._fieldPrefixText
			, '{{data.', block._fieldName+'}}{{', block._fieldName, '}}'
			, block._fieldSuffixText
			, block._formAppend );

        return newBlock;
    };
	
	
    
    Y._ApriBlockTemplates.autocomplete = function(args) {
        var newBlock="";

        if (!args.fieldName) return;

        var _formClass = (args.formClass)?args.formClass:'';
        var _formStyle = (args.formStyle)?args.formStyle:'';
        var _multiValueFormStyle = (args.multiValueFormStyle)?args.multiValueFormStyle:' width:80px; ';
        var _singleValueFormStyle = (args.singleValueFormStyle)?args.singleValueFormStyle:' width:80px; ';

		if (args.labelText && args.labelText !='') {
			newBlock = newBlock.concat('<span class="aprientry-label">', args.labelText, '</span>');
		}
        
        if (args.mode=='edit') {
            var _style = (args.style)?'style="'+args.style+'"':"";
			var _functionClass = (args.functionClass)?args.functionClass:"";
			var _placeholder = (args.placeholder)?' placeholder="'+ args.placeholder +'"':"";

			var _attributes ='';
			if (args.attributes) {
				for (attr in args.attributes) {
					if (typeof args.attributes[attr] !== 'function') {
						_attributes = _attributes.concat( ' ', args.attributes[attr].key , '="', args.attributes[attr].value, '"');
					}
				}
			}
			var _multiValue = '';
			var _ClassNameInput = '';
			var _singleValue = '';
			if (args.multiValue) {
					//Must be the second input in row !! For multivalue fields !!
				_multiValue = _multiValue.concat('<div '
					, ' style=" '
					, _multiValueFormStyle
					, '" '
					, '>'
					, '<div class="formmgr-row '
					, '" '
					, ' id="{{apriFormContainer}}-'
					, args.fieldName
					, '-multivalue" style="display:inline-block; " > '
					, '<input type="hidden"'
					, ' class="formmgr-field '
					, Y.classNames['multiValueChangedIntern']
					, '" '
					, ' name="'
					, args.fieldName
					, 'AssocSysNodeUuids"'
					, ' value=""'
					, ' id="{{apriFormContainer}}-'
					, args.fieldName
					, '-multiValueChanged-intern"'
					, '/>');
				_ClassNameInput = 'multiValueInput';
			} else {
				_singleValue = _singleValue.concat('<div '
					, ' style=" '
					, _singleValueFormStyle
					, '" '
					, '>'
					, '<div class="formmgr-row '
					, '" '
					, ' id="{{apriFormContainer}}-'
					, args.fieldName
					, '-singlevalue" > '
					, '<input type="hidden"'
					, ' class="formmgr-field '
					, Y.classNames['singleValueChangedIntern']
					, '" '
					, ' name="'
					, args.fieldName
					, 'AssocSysNodeUuids"'
					, ' value=""'
					, ' id="{{apriFormContainer}}-'
					, args.fieldName
					, '-singleValueChanged-intern"'
					, '/>');
				_ClassNameInput = 'singleValueInput';
			}
			
			newBlock = newBlock.concat('<!-- Autocomplete template: '
				, args.id
				, ' -->\n<div class="formmgr-row" style="'
				, _style
				, '">'
				, '<p class="formmgr-message-text"></p>'
                , '<input'
                , ' type="text" tabindex="2"'
                , ' class="formmgr-field apriText aprientry-edit-false '
				, Y.classNames[_ClassNameInput]
				, _functionClass
				, ' '
				, _formClass
				, '"'
                , ' style=" '
				, _formStyle
				, '"'
                , ' name="'
				, args.fieldName , 'Input'
				, '"'
				, _placeholder
                , ' value="{{data.'
				, args.fieldName
				, '}}"'
                , ' id="{{apriFormContainer}}-'
				, args.fieldName
				, '-input"'
				, _attributes
                , '/>'
				, _singleValue
				, _multiValue );

                if (args.fieldNames != null ) {
					var _internClass;
                    for (var i=0;i<args.fieldNames.length;i++) {
						_fieldName = args.fieldNames[i].fieldName;
						_fieldNameIntern = args.fieldNames[i].fieldNameIntern;
            			switch (_fieldNameIntern) { 
            				case "name":
								_internClass = Y.classNames[args.multiValue?'multiValueInternName':'singleValueInternName'];
				                break;
            				case "sysnodeuuid":
								_internClass = Y.classNames[args.multiValue?'multiValueInternSysNodeUuid':'singleValueInternSysNodeUuid'];
				                break;
            				case "description":
								_internClass = Y.classNames[args.multiValue?'multiValueInternDescription':'singleValueInternDescription'];
				                break;
				            default:
								_internClass = '';
						}            
                        newBlock = newBlock.concat('<input type="hidden"'
                        	, ' class="formmgr-field '
							, Y.classNames[args.multiValue?'multiValueIntern':'singleValueIntern']
							, " ", _internClass
							, '" '
							, 'name="'
							, _fieldName
							, '"'
                        	, ' value="{{data.'
							, _fieldName
							, '}}"'
                        	, ' id="{{apriFormContainer}}-'
							, _fieldName
							, '-intern"'
                        	, '/>');
                    }
                }
                if (args.multiValue) {
                    newBlock = newBlock.concat('</div></div>');
                }
        	}


			newBlock = newBlock.concat('<!-- text template: '
				, args.id
				, ' -->\n<div class="">'
                , '<span'
                , ' class="apriText apri-template-inq-true'
				, ' '
				, _formClass
				, '"'
                , ' style=" '
				, _formStyle
				, '"'
                , ' id="{{apriFormContainer}}-'
				, args.fieldName
				, '"'
                , '>'
                , '{{'
				, args.fieldName
				, '}}'
                , '</span>'
                , '<input'
                , ' type="hidden"'
                , ' name="'
				, args.fieldName
				, '"'
                , ' value="{{data.'
				, args.fieldName
				, '}}"'
                , ' id="{{apriFormContainer}}-'
				, args.fieldName
				, '-intern"'
                , '/>');


        return newBlock = newBlock.concat('</div><!-- end of template block: '
			, args.id
			,  ' \n-->');
    };

    Y._ApriBlockTemplates.textarea = function(args) {
        var newBlock="";
        if (!args.fieldName) return;

		if (args.labelText && args.labelText !='') {
			newBlock+='<span class="aprientry-label" width="4em">' + args.labelText + '</span>';
		}
		
		if (args.mode=='edit') {
			var _formClass = (args.formClass)?args.formClass:"";
			var _formStyle = (args.formStyle)?args.formStyle:" width:100%; ";
			newBlock+='<!-- textarea template: '+ args.id +' \n--><div class="formmgr-row aprientry-edit-false">';
			// newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
			newBlock+='<p class="formmgr-message-text"></p>';
			newBlock+='<textarea';
			newBlock+=' tabindex="2"';
			var _functionClass = (args.functionClass)?args.functionClass:"";
			newBlock+=' class="formmgr-field apriTextarea ' + _functionClass + ' ' + _formClass + '"';
			newBlock+=' style=" ' + _formStyle + '"';
			newBlock+=' name="'+args.fieldName +'"';
			if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
			//newBlock+=' placeholder="'+args.placeholder +'"';
			newBlock+=' style="height: auto; min-height: 0px; overflow: hidden; " ';
			newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-input"';
			newBlock+='>';
			newBlock+='{{data.'+args.fieldName +'}}';
			newBlock+='</textarea></div>';
		}

/*                newBlock+='<textarea';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'"';
                newBlock+=' style="height: auto; min-height: 0px; overflow: hidden; " ';  
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-intern"';
                newBlock+='>';
                newBlock+='</textarea>';
*/
		if (args.mode=='edit') {
			newBlock+='<!-- textarea template: '+ args.id +' -->\n<div class="apri-template-inq-true ';
		} else {
			newBlock+='<!-- textarea template: '+ args.id +' -->\n<div class=" ';
		}
		
		if (args.blockClass) { newBlock += args.blockClass; };
		
		newBlock+='">';
		var _formClass = (args.formClass)?args.formClass:"";
		var _formStyle = (args.formStyle)?args.formStyle:"";
		//newBlock+='<span class="label" width="4em">' + args.labelText +"</span>";
		newBlock+='<span';
		newBlock+=' class="apriText ' + ' ' + _formClass + '"';
		newBlock+=' style=" ' + _formStyle + '"';
		newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'"';
		newBlock+='>';
		//newBlock+='{{'+args.fieldName+'}}';
		newBlock+='{{data.'+args.fieldName +'}}{{'+args.fieldName +'}}';
		newBlock+='</span>';
		
		//   newBlock+='<input';
		//   newBlock+=' type="hidden"';
		//   newBlock+=' name="'+args.fieldName +'"';
		//   newBlock+=' value="{{data.'+args.fieldName +'}}"';
		//   newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-intern">';
		//   newBlock+='</input></div>';
		newBlock+='</div>';

        return newBlock+="<!-- end of template block: "+ args.id +" \n-->";
    };

/*
    Y._ApriBlockTemplates.date = function(args) {
        var newBlock="";
        newBlock+='<!-- Fieldset template: '+ args.id +' \n--><div class="formmgr-row">';
        if (args.fieldName) {

            if (args.mode=='edit') {
                newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                newBlock+='<p class="formmgr-message-text"></p>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyle)?args.formStyle:" width:6em; ";
                newBlock+=' class="formmgr-field apriDate apriDateCheck' + _functionClass + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'Input"';
                if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                //newBlock+=' placeholder="'+args.placeholder +'"';
                newBlock+=' value="{{data.'+args.fieldName +'Input}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-input"';
                newBlock+='/>';
            } else {
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyle)?args.formStyle:"";
                newBlock+='<span class="label" width="4em">' + args.labelText +"</span>";
                newBlock+='<span';
                newBlock+=' class="apriDate ' + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'Input"';
                newBlock+='>';
                newBlock+='{{data.'+args.fieldName+'Input}}';
                newBlock+='</span>';
            }

            newBlock+='<input type="hidden"';
            newBlock+=' class="formmgr-field"';
            newBlock+=' name="'+args.fieldName +'"';
            newBlock+=' value="{{data.'+args.fieldName +'}}"';
            newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-intern"';
            newBlock+='/>';
            
        }
        return newBlock+="</div><!-- end of template block: "+ args.id +" \n-->";
    };
*/

    Y._ApriBlockTemplates.date = function(args) {
        var _formStyleReadOnly;
        var newBlock="";
        newBlock+='<!-- Fieldset template: '+ args.id +' \n--><div class="formmgr-row" style=" ">';
        if (!args.fieldName) return;

		if (args.labelText && args.labelText !='') {
			newBlock+='<span class="aprientry-label" width="4em">' + args.labelText + '</span>';
		}
        
            if (args.mode=='edit') {
//                newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                newBlock+='<p class="formmgr-message-text  "></p>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyleDate)?args.formStyleDate:" width:60px; ";
                newBlock+=' class="aprientry-edit-false formmgr-field apriDate apriDateCheck ' + _functionClass + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'Input"';
                if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                //newBlock+=' placeholder="'+args.placeholder +'"';
                newBlock+=' value="{{data.'+args.fieldName +'Input}}{{'+args.fieldName +'Input}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-input"';
                newBlock+='/>';
            } else {
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyleDate)?args.formStyleDate:"";
//                newBlock+='<span class="label" width="4em">' + args.labelText +"</span>";
                newBlock+='<span';
                newBlock+=' class="apriDate aprientry-edit-false' + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'Input"';
                newBlock+='>';
                newBlock+='{{data.'+args.fieldName+'Input}}{{'+args.fieldName+'Input}}';
                newBlock+='</span>';
            }

            newBlock+='<input type="hidden"';
            newBlock+=' class="formmgr-field"';
            newBlock+=' name="'+args.fieldName +'"';
            newBlock+=' value="{{data.'+args.fieldName +'}}"';
            newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-intern"';
            newBlock+='/>';


            newBlock+='<div';
            newBlock+=' class="formmgr-field apri-template-inq-true "';
            _formStyleReadOnly = (args.formStyleDateReadOnly)?args.formStyleDateReadOnly:"margin-right:4px;";
            newBlock+=' style=" ' + _formStyleReadOnly + '"';
            newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-readonly"';
            newBlock+='>';
            newBlock+='{{data.'+args.fieldName+'InputReadOnly}}{{'+args.fieldName+'InputReadOnly}}';
            newBlock+='</div>';


        return newBlock+="</div><!-- end of template block: "+ args.id +" \n-->";
    };



    Y._ApriBlockTemplates.datetime = function(args) {
        var _formStyleReadOnly;
        var newBlock="";
        newBlock+='<!-- Fieldset template: '+ args.id +' \n--><div class="formmgr-row" style=" ">';
        if (!args.fieldName) return;

		if (args.labelText && args.labelText !='') {
			newBlock+='<span class="aprientry-label" width="4em">' + args.labelText + '</span>';
		}
        
            if (args.mode=='edit') {
//                newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                newBlock+='<p class="formmgr-message-text  "></p>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyleDate)?args.formStyleDate:" width:60px; ";
                newBlock+=' class="aprientry-edit-false formmgr-field apriDate apriDateCheck ' + _functionClass + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'Input"';
                if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                //newBlock+=' placeholder="'+args.placeholder +'"';
                newBlock+=' value="{{data.'+args.fieldName +'Input}}{{'+args.fieldName +'Input}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-input"';
                newBlock+='/>';
            } else {
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyleDate)?args.formStyleDate:"";
//                newBlock+='<span class="label" width="4em">' + args.labelText +"</span>";
                newBlock+='<span';
                newBlock+=' class="apriDate ' + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'Input"';
                newBlock+='>';
                newBlock+='{{data.'+args.fieldName+'Input}}{{'+args.fieldName+'Input}}';
                newBlock+='</span>';
            }

            newBlock+='<input type="hidden"';
            newBlock+=' class="formmgr-field"';
            newBlock+=' name="'+args.fieldName +'"';
            newBlock+=' value="{{data.'+args.fieldName +'}}"';
            newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-intern"';
            newBlock+='/>';


            newBlock+='<div';
            newBlock+=' class="formmgr-field apri-template-inq-true "';
            _formStyleReadOnly = (args.formStyleDateReadOnly)?args.formStyleDateReadOnly:"margin-right:4px;";
            newBlock+=' style=" ' + _formStyleReadOnly + '"';
            newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-readonly"';
            newBlock+='>';
            newBlock+='{{data.'+args.fieldName+'InputReadOnly}}{{'+args.fieldName+'InputReadOnly}}';
            newBlock+='</div>';


            if (args.mode=='edit') {
     //           newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                newBlock+='<p class="formmgr-message-text "></p>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyleTime)?args.formStyleTime:'';
                newBlock+=' class="aprientry-edit-false formmgr-field apriTime apriTimeCheck ' + _functionClass + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'TimeInput"';
             //   newBlock+=' placeholder="'+args.placeholder +'"';
                newBlock+=' value="{{data.'+args.fieldName +'TimeInput}}{{'+args.fieldName +'TimeInput}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'Time-input"';
                newBlock+='/>';
            } else {
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyleTime)?args.formStyleTime:"";
      //          newBlock+='<span class="label" width="4em">' + args.labelText +"</span>";
                newBlock+='<span';
                newBlock+=' class="apriTime ' + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'TimeInput"';
                newBlock+='>';
                newBlock+='{{data.'+args.fieldName+'TimeInput}}{{'+args.fieldName+'TimeInput}}';
                newBlock+='</span>';
            }

//            newBlock+='<input type="hidden"';
//            newBlock+=' class="formmgr-field"';
//            newBlock+=' name="'+args.fieldName +'Time"';
//            newBlock+=' value="{{data.'+args.fieldName +'Time}}"';
//            newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'Time-intern"';
//            newBlock+='/>';

            newBlock+='<div';
            newBlock+=' class="formmgr-field apri-template-inq-true "';
            _formStyleReadOnly = (args.formStyleDateReadOnly)?args.formStyleDateReadOnly:"margin-right:4px;";
            newBlock+=' style=" ' + _formStyleReadOnly + '"';
            newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'Time-readonly"';
            newBlock+='>';
            newBlock+='{{data.'+args.fieldName+'TimeInputReadOnly}}{{'+args.fieldName+'TimeInputReadOnly}}';
            newBlock+='</div>';

        return newBlock+="</div><!-- end of template block: "+ args.id +" \n-->";
    };

    Y._ApriBlockTemplates.duration = function(args) {
        var newBlock="";
        if (args.fieldName) {
            var _formClass = (args.formClass)?args.formClass:"";
            var _formStyle = (args.formStyle)?args.formStyle:" width:2em; text-align:right; ";
            if (args.mode=='edit') {
                newBlock+='<!-- Fieldset template: '+ args.id +' -->\n<div class="formmgr-row">';
                newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                newBlock+='<p class="formmgr-message-text"></p>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                newBlock+=' class="formmgr-field apriDuration ' + _functionClass + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'-w"';
   //             if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                newBlock+=' value="{{data.'+args.fieldName +'WInput}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-w-input"';
                newBlock+='/>';
                newBlock+='<span>:W </span>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                newBlock+=' class="formmgr-field apriDuration ' + _functionClass + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'-d"';
   //             if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                newBlock+=' value="{{data.'+args.fieldName +'DInput}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-d-input"';
                newBlock+='/>';
                newBlock+='<span>:D </span>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                newBlock+=' class="formmgr-field apriDuration ' + _functionClass + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'-h"';
   //             if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                newBlock+=' value="{{data.'+args.fieldName +'HInput}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-h-input"';
                newBlock+='/>';
                newBlock+='<span>:H </span>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                newBlock+=' class="formmgr-field apriDuration ' + _functionClass + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'-m"';
   //             if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                newBlock+=' value="{{data.'+args.fieldName +'MInput}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-m-input"';
                newBlock+='/>';
                newBlock+='<span>:M </span>';
                newBlock+='<span>(WeekDayHourMinute)</span>';
                newBlock+='<input';
                newBlock+=' type="hidden"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                newBlock+=' class="formmgr-field"';
                newBlock+=' name="'+args.fieldName +'"';
                newBlock+=' value="{{data.'+args.fieldName +'}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-intern"';
                newBlock+='/>';
            } else {
                newBlock+='<!-- text template: '+ args.id +' -->\n<div class="">';
                newBlock+='<span class="label" width="4em">' + args.labelText +"</span>";
                newBlock+='<span';
                newBlock+=' class="apriText ' + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-output"';
                newBlock+='>';
                newBlock+='{{'+args.fieldName+'}}';
                newBlock+='</span>';
                newBlock+='<input';
                newBlock+=' type="hidden"';
                newBlock+=' name="'+args.fieldName +'"';
                newBlock+=' value="{{data.'+args.fieldName +'}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-intern"';
                newBlock+='/>';
            }

            newBlock+='<BR/>';
        }
        return newBlock+="</div><!-- end of template block: "+ args.id +" \n-->";
    };


    Y._ApriBlockTemplates.select = function(args) {
        var newBlock="";
        var _formStyleReadOnly;
        if (args.fieldName) {
            var _formClass = (args.formClass)?args.formClass:"";
            var _formStyle = (args.formStyle)?args.formStyle:" width:9em; ";
            if (args.mode=='edit') {
                newBlock+='<!-- Fieldset template: '+ args.id +' -->\n<div class="formmgr-row">';
                if (args.labelText!=undefined) {
                    newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                }
                newBlock+='<p class="formmgr-message-text"></p>';
                newBlock+='<select';
                newBlock+=' tabindex="2"';
                var _functionClass = (args.functionClass)?args.functionClass:"";
                newBlock+=' class="aprientry-edit-false formmgr-field apriSelect ' + _functionClass + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'"';
//                if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                //newBlock+=' placeholder="'+args.placeholder +'"';
                newBlock+=' value="{{data.'+args.fieldName +'}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-input"';
                newBlock+='>';
                //Y.each(args.options, function(option) {
                for(var option in args.options) {
                    newBlock+='<option ';
                    newBlock+='value="'+ args.options[option].keyValue +'"';
                    newBlock+='>';
                    newBlock+=args.options[option].description;                    
                    newBlock+='</option>';
                };
                newBlock+='</select>';
            } else {
            }

            newBlock+='<div';
            newBlock+=' class="formmgr-field apri-template-inq-true "';
            newBlock+=' style=" ' + _formStyleReadOnly + '"';
            newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-readonly"';
            newBlock+='>';
            newBlock+='{{data.'+args.fieldName+'InputReadOnly}}{{'+args.fieldName+'InputReadOnly}}';
            newBlock+='</div>';


//            newBlock+='<BR/>';
        }
        return newBlock+="</div><!-- end of template block: "+ args.id +" \n-->";
    };


    Y._ApriBlockTemplates.avatar = function(args) {
        var newBlock="";
        if (args.fieldName) {
            var _formClass = (args.formClass)?args.formClass:"";
            var _formStyle = (args.formStyle)?args.formStyle:" width:3em; ";
            
            newBlock+='<!-- avatar template: '+ args.id +' -->\n';
            newBlock+='<span class="apri-avatar-small"';
            newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-avatar">';   //  "{{data.'+args.fieldName +'}}"'
            newBlock+= args.labelText;
            newBlock+= '<img src="{{'+args.fieldName +'AvatarThumbnailNodeUuidPath}}" ></img>';
            newBlock+='</span>';
        }
        return newBlock+="<!-- end of template avatar block: "+ args.id +" \n-->";
    };

/*    
    Y._ApriBlockFieldSet = function(blocks) {
        var newBlock="";
        newBlock+='<fieldset class="apri">';
        //Y.each(blocks, function(block) {
        for (var i=0;i<blocks.length;i++) {
            var block = blocks[i];
            switch (block.block) { 
            case "legend":
                newBlock+="<!-- Fieldset Legend: \n-->";
                if (block.text) {
                    newBlock+="<legend>"+block.text+"</legend>";
                }
                break;
            case "formComponent":
                if (Y.Lang.isFunction(Y._ApriBlockTemplates[block.id])) {
                    var args=block;
                    newBlock += Y._ApriBlockTemplates[block.id](args);
                } else {
                    newBlock+="<!-- Fieldset template not found: "+ block.id +" \n-->";
                }
                break;
            default:
            }            
        }
        newBlock+="</fieldset>";
        newBlock+="<!-- end of fieldset block  -->";
        return newBlock+="<!-- end of fieldset block  -->";
    };

    Y._ApriBlockGrid = function(blocks) {
        var newBlock="";
        newBlock+='<div class="yui3-g">';
        //Y.each(blocks, function(block) {
        for (var i=0;i<blocks.length;i++) {
            var block = blocks[i];        
            switch (block.block) { 
            case "legend":
                newBlock+="<!-- Fieldset Legend: \n-->";
                if (block.text) {
                    newBlock+="<legend>"+block.text+"</legend>";
                }
                break;
            case "formComponent":
                if (Y.Lang.isFunction(Y._ApriBlockTemplates[block.id])) {
                    var args=block;
                    newBlock += Y._ApriBlockTemplates[block.id](args);
                } else {
                    newBlock+="<!-- Fieldset template not found: "+ block.id +" \n-->";
                }
                break;
            default:
            }            
        }
        newBlock+="</div>";
        newBlock+="<!-- end of grid block  -->";
        return newBlock+="<!-- end of grid block  -->";
    };

    Y._ApriBlockGridColumn = function(blocks) {
        var newBlock="";
        newBlock+='<div class="yui3-u-">';
        //Y.each(blocks, function(block) {
        for (var i=0;i<blocks.length;i++) {
            var block = blocks[i];
            switch (block.block) { 
            case "legend":
                newBlock+="<!-- Fieldset Legend: \n-->";
                if (block.text) {
                    newBlock+="<legend>"+block.text+"</legend>";
                }
                break;
            case "formComponent":
                //if (Y.Lang.isFunction(Y._ApriBlockTemplates[block.id])) {
                if (Y.Lang.isFunction(Y._ApriBlockTemplates[block.id])) {
                    var args=block;
                    newBlock += Y._ApriBlockTemplates[block.id](args);
                } else {
                    newBlock+="<!-- Fieldset template not found: "+ block.id +" \n-->";
                }
                break;
            default:
            }            
        }
        newBlock+="</div>";
        newBlock+="<!-- end of gridcolumn block  -->";
        return newBlock+="<!-- end of gridcolumn block  -->";
    };
*/    
