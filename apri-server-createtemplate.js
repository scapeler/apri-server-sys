
/*jslint devel: true,  undef: true, newcap: true, white: true, maxerr: 50 */   
/**
 * The apri-server-createtemplate module for creating templates.
 * @module apri-server-createtemplate
 */

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
        view   						: Y.getClassName('view'),
        formComponent				: Y.getClassName('form-component'),
        viewHeader   				: Y.getClassName('view-header'),
        viewBody   					: Y.getClassName('view-body'),
        viewFooter   				: Y.getClassName('view-footer'),
        viewField	  				: Y.getClassName('view-field'),
        viewFieldLabel	  			: Y.getClassName('view-field-label'),
        viewFieldMessage	  		: Y.getClassName('view-field-message'),
        viewFieldText				: Y.getClassName('view-field-text'),
        viewFieldTextArea			: Y.getClassName('view-field-textarea'),
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

module.exports = {

    templateCache: [],




    
    createTemplate: function (templateConfig, url, module) {
        var newTemplate='';
        var tmpTemplateContent='';
        
        var urlArray = url.split('/');
        var urlNameIndex= urlArray.length-1;
        var name = urlArray[urlNameIndex].split('.')[0];

        var cacheFound = false;
        var cacheIndex;
        for (var i=0; i<this.templateCache.length;i++) {
            if (this.templateCache[i].templateName == name) {
                cacheFound = true;
                cacheIndex = i;
                break;
            }
        }
        
        if (cacheFound) {
        
            if (module) {
                return "// Template from cache:\n".concat(this.templateCache[cacheIndex].cachedTemplate);
            } else {
                return "<!-- Template from cache: -->".concat(this.templateCache[cacheIndex].cachedTemplate);
            }
        }

        if (module) {
	        newTemplate = newTemplate.concat("// Generated template: ", templateConfig.templateName, "\n"
				, "YUI.add('", name, "', function (Y) { 'use strict'; "
			 	, "\nY.initTemplate = function() { "
				, "if (Y.templateHTML==null) { Y.templateHTML=[]; }");
        }
    
		if (templateConfig.templates) {
        	for (var i=0;i<templateConfig.templates.length;i++) {
            	var _template = templateConfig.templates[i];
            
				tmpTemplateContent = '';
            
				tmpTemplateContent = tmpTemplateContent.concat( " <!-- \"template name\": \"", _template.name||_template.templateName, "-->");
				if (_template.blocks) {
					tmpTemplateContent = tmpTemplateContent.concat( Y._ApriBlocks(_template.blocks));
				}
				tmpTemplateContent = tmpTemplateContent.concat( "\n <!-- end of template: ", _template.name||_template.templateName, "-->");
  				var tmpTemplateContent2 = tmpTemplateContent.replace(/\n/g," ' +\n ' ");
				//tmpTemplateContent2.concat("");

		        if (module) {
            		newTemplate = newTemplate.concat( "\n Y.templateHTML[\"", _template.name||_template.templateName, "\"]=\'", tmpTemplateContent2, "';");
				} else {
                	newTemplate = newTemplate.concat( tmpTemplateContent);
                	i=templateConfig.templates.length;  //only one template for portlets
                }
        	}
        }
        
        if (module) {
			newTemplate = newTemplate.concat( "};"
    	   		, "},'0.0.1', {requires:[], skinnable: false });");
		}

        var templateForCache = {};
        templateForCache.templateName = name;
        templateForCache.cachedTemplate =newTemplate;
        this.templateCache.push(templateForCache);

        var _t;
		if (module) {
            _t= "// Template created: \n";
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
        { "block":"div", "class": "apri-form-component formmgr-row"
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

    Y._ApriBlocks = function(blocks) {
        var newBlock="";
		var _style="";
		var _id="";
       // Y.each(blocks, function(block) {
        for (var i=0; i<blocks.length;i++) {
            var block = blocks[i]; 
            switch (block.block) { 
            case "a":
                newBlock = newBlock.concat("<!-- anchor: -->");
				_style      = (block.style)?block.style:"";
				_href      = (block.href)?block.href:"";
                newBlock = newBlock.concat('<a style="', _style, '" href="', _href, '" target="_blank" class="">');
                if (block.text) {
                    newBlock = newBlock.concat(block.text);
                }
                newBlock = newBlock.concat("</a>"
                	, "<!-- end of anchor block  -->");
                break;
            case "fieldset":
                newBlock = newBlock.concat("<!-- Fieldset: -->");
				_style      = (block.style)?block.style:"";
                newBlock = newBlock.concat('<fieldset style="', _style, '" class="apri">');
                if (block.blocks) {
                    newBlock = newBlock.concat(Y._ApriBlocks(block.blocks));
                }
                newBlock = newBlock.concat("</fieldset>"
                	, "<!-- end of fieldset block  -->");
                break;
            case "grid":
                newBlock = newBlock.concat("<!-- Grid: -->"
                	, '<div class="yui3-g" ' )
                if (block.height) {
                    newBlock = newBlock.concat(' height="', block.height, '"');
                }
                newBlock = newBlock.concat(' >');
                if (block.blocks) {
                    newBlock = newBlock.concat(Y._ApriBlocks(block.blocks));
                }
                newBlock = newBlock.concat("</div>"
                	, "<!-- end of grid block  -->");
                break;
            case "gridcolumn":
                newBlock = newBlock.concat("<!-- GridColumn: -->"
					, '<div class="yui3-u-', block.fraction, '">');
                if (block.blocks) {
                    newBlock = newBlock.concat(Y._ApriBlocks(block.blocks));
                }
                newBlock = newBlock.concat("</div>"
                	, "<!-- end of gridcolumn block  -->")
                break;
            case "legend":
                newBlock = newBlock.concat("<!-- Fieldset Legend: -->\n");
                _style      = (block.style)?block.style:"";
                if (block.text) {
                    newBlock = newBlock.concat('<legend style="', _style, '">', block.text, '</legend>');
                }
                break;
            case "h1":
                newBlock = newBlock.concat("<!-- H1: -->\n");
                _style      = (block.style)?block.style:"";
                if (block.text) {
                    newBlock = newBlock.concat('<h1 class="apriEntry" style="', _style, '">', block.text, '</h1>');
                }
                break;
            case "ul":
                newBlock = newBlock.concat("<!-- UL: -->\n");
                _style      = (block.style)?block.style:"";
                if (block.id) {
                    _id = _id.concat( ' id="{{apriFormContainerId}}-', block.id, '"');
                } else { if (block.idShort) {
                    	_id = _id.concat( ' id="', block.idShort, '"');
                	} 
                }
                newBlock = newBlock.concat('<ul '+_id+'style="', _style, '"></ul>');
                break;
            case "html":
                newBlock = newBlock.concat("<!-- HTML: -->\n");
                if (block.text) {
                    newBlock = newBlock.concat( block.text);
                }
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
            case "div":
                newBlock = newBlock.concat("<!-- DIV: -->\n"
                	, '<div ');
                var _id = "";    
                if (block.id) {
                    _id = _id.concat( ' id="{{apriFormContainer}}{{apriFormContainerId}}-', block.id, '"');
                } else { if (block.idShort) {
                    	_id = _id.concat( ' id="', block.idShort, '"');
                	} 
                }
                if (block.attributes) {
                    //for (var i=0;i<block.attributes.lenght;i++){
                    for (attr in block.attributes) {
                        if (typeof block.attributes[attr] !== 'function') {
                            newBlock = newBlock.concat( ' ', attr , '="', block.attributes[attr], '"');
                        }
                    }
                }
                _style = (block.style)?block.style:"";
                newBlock = newBlock.concat(' ', _id, ' style=" ', _style, '"');
                var _blockClass = (block.blockClass)?block.blockClass:"";
                newBlock = newBlock.concat(' class=" ', _blockClass, '"', '>');
                if (block.text) {
                    newBlock = newBlock.concat( block.text);
                }
                if (block.blocks) {
                  	newBlock = newBlock.concat(Y._ApriBlocks(block.blocks));
                }
              	newBlock = newBlock.concat( '</div>');
                break;
            case "form":
                newBlock = newBlock.concat("<!-- FORM: -->\n"
                	, '<form enctype="application/json" method="post" '
					, ' id="{{apriFormContainer}}-main-form"');  // ! important, id is always == {{apriFormContainerId}}-main-form
                _style = (block.style)?block.style:"";
                newBlock = newBlock.concat(' style=" ' , _style , '"');
                var _blockClass = (block.blockClass)?block.blockClass:"";
                newBlock = newBlock.concat(' class="yui3-form-content ', _blockClass, '"'
                	, '>');
 //               if (block.id) {
 //                   newBlock = newBlock.concat( '<div id="{{apriFormContainer}}-', block.id, '">');
 //               }
                if (block.text) {
                    newBlock = newBlock.concat( '<div>', block.text, '</div>');
                }
                if (block.blocks) {
                    newBlock = newBlock.concat(Y._ApriBlocks(block.blocks));
                }
//                if (block.id) {
//                    newBlock = newBlock.concat( '</div>');
//                }
                newBlock = newBlock.concat( '</form>');
                break;
            case "img":

                newBlock = newBlock.concat("<!-- IMG: -->\n"
                	, '<img ');
                if (block.id) {
                    newBlock = newBlock.concat( ' id="{{apriFormContainer}}-', block.id, '"');
                }
               	if (block.imgSrc) {
                    newBlock = newBlock.concat(' src="', block.imgSrc, '" ');
                }
                _style = (block.style)?block.style:"";
                newBlock = newBlock.concat(' style=" ', _style, '"');
                var _blockClass = (block.blockClass)?block.blockClass:"";
                newBlock = newBlock.concat(' class=" ', _blockClass, '"'
                	, '>');
                if (block.text) {
                    newBlock = newBlock.concat( '<span>', block.text, '</span>');
                }
                newBlock = newBlock.concat( '</img>');
                break;
            case "span":
                newBlock = newBlock.concat("<!-- SPAN: -->\n"
                	, '<span ');
                if (block.id) {
                    newBlock = newBlock.concat( ' id="{{apriFormContainer}}-', block.id, '"');
                } else { if (block.idShort) {
                    	newBlock = newBlock.concat( ' id="', block.idShort, '"');
                	} 
                }
                _style = (block.style)?block.style:"";
                newBlock = newBlock.concat(' style=" ', _style, '"'
                	, '>');
                if (block.text) {
                    newBlock = newBlock.concat( '<span>', block.text, '</span>');
                }
                newBlock = newBlock.concat( '</span>');
                break;
            case "formComponent":
                if (typeof Y._ApriBlockTemplates[block.type] == 'function') {
                    var args=block;
                    newBlock = newBlock.concat( Y._ApriBlockTemplates[block.type](args));
                } else {
                    newBlock = newBlock.concat("<!-- Fieldset template not found: ", block.type, " \n-->");
                }
                break;
            default:
            }            
        }; 
        return newBlock.concat("<!-- blocks:  -->");
    };

    Y._ApriBlockTemplates = [];

    Y._ApriBlockTemplates.currency = function(args) {
        var newBlock="";
        newBlock = newBlock.concat('<!-- Fieldset template: ', args.id, ' \n--><div class="',Y.classNames['formComponent'], ' formmgr-row" name="', args.fieldName,'">'
        	, '<label class="label" width="4em" for="{{apriFormContainer}}-', args.fieldName, '">', args.labelText, "</label>");
        if (args.fieldName) {
            newBlock = newBlock.concat('<div class="', Y.classNames['viewFieldMessage'],'"></div>' 
            	, '<input');
            if (args.mode=='edit') {
                newBlock = newBlock.concat(' type="text" tabindex="2"');
            } else {
                newBlock = newBlock.concat(' type="hidden"');
            }
            var _inputFunction = (args.inputFunction)?args.inputFunction:"";
            var _formClass = (args.formClass)?args.formClass:"";
            newBlock = newBlock.concat(' class="formmgr-field apriAmount ', _inputFunction, ' ', _formClass, '"'
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
        newBlock = newBlock.concat('<!-- Fieldset template: ', args.id, ' \n--><div class="',Y.classNames['formComponent'], ' formmgr-row" name="', args.fieldName,'">'
        	, '<label class="label" width="4em" for="{{apriFormContainer}}-', args.fieldName, '">',  args.labelText, "</label>");
        if (args.fieldName) {
            newBlock = newBlock.concat('<div class="', Y.classNames['viewFieldMessage'],'"></div>'
            	, '<input');
            if (args.mode=='edit') {
                newBlock = newBlock.concat(' type="text" tabindex="2"');
            } else {
                newBlock = newBlock.concat(' type="hidden"');
            }
            var _inputFunction = (args.inputFunction)?args.inputFunction:"";
            var _formClass = (args.formClass)?args.formClass:"";
            var _formStyle = (args.formStyle)?args.formStyle:" width:9em; ";
            newBlock = newBlock.concat(' class="formmgr-field apriNumber ', _inputFunction, ' ', _formClass, '"'
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

    Y._ApriBlockTemplates.button = function(args) {
        var newBlock="";
        if (args.fieldName) {
                newBlock = newBlock.concat('<!-- button template: ', args.id, ' -->\n');
				var _style = (args.style)?args.style:"";
                var _blockClass = (args.blockClass)?args.blockClass:"";
                var _labelText = (args.labelText)?args.labelText:"";
                if (args.imgSrc) {
                    newBlock = newBlock.concat('<img src="',  args.imgSrc,  '" '
                    	, ' style=" ',  _style,  '"'
                    	, ' class="apri-img-button"'
                    	, ' id="{{apriFormContainer}}{{apriFormContainerId}}-', args.fieldName, '-button">'
                    	, '</img>');
                } else {
					newBlock = newBlock.concat('<div '
                    	, ' class="' , _blockClass, '"'  //class for css icon
                    	, ' style=" ', _style, '"'
                    	, ' id="{{apriFormContainer}}{{apriFormContainerId}}-', args.fieldName, '-button">'
                    	,  _labelText
                    	, '</div>');
                }
        }
        return newBlock.concat("<!-- end of template button block: ", args.id, " \n-->");
    };

    Y._ApriBlockTemplates.boolean = function(args) {
        var newBlock="";
        newBlock = newBlock.concat('<!-- Fieldset template: ', args.id, ' -->\n');
        if (!args.fieldName) return;

        var _formClass = (args.formClass)?args.formClass:"";
        var _formStyle = (args.formStyle)?args.formStyle:"";
        var _formLabelStyle = (args.formLabelStyle)?args.formLabelStyle:"";

		if (args.labelText && args.labelText !='') {
			newBlock = newBlock.concat('<div class="'+Y.classNames['viewFieldLabel']+ '" width="4em">', args.labelText, '</div>');
		}
        
        if (args.mode=='edit') {
            var _style = (args.style)?'style="'+args.style+'"':"";
            var _inputFunction = (args.inputFunction)?args.inputFunction:"";
            if (args.text) {newBlock+= args.text;}
            newBlock = newBlock.concat(' <div class="',Y.classNames['formComponent'], ' formmgr-row" name="', args.fieldName,'" '
            	, ' ', _style, ' '
            	, '>'
            	, '<div class="', Y.classNames['viewFieldMessage'],'"></div>'
            	, '<input'
            	, ' type="checkbox" tabindex="2"'
				, ' checked="{{data.', args.fieldName, '}}"'
            	, ' class="formmgr-field apriText ',  _inputFunction, ' ', _formClass, '"'
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


    Y._ApriBlockTemplates.text = function(args) {
        var newBlock="";
		newBlock = newBlock.concat('<div class="'+Y.classNames['viewField']+ '" >');
        if (!args.fieldName) return;
		
		var _formClass 			= (args.formClass)?args.formClass:'';
		var _formStyle 			= (args.formStyle)?args.formStyle:'';
		var _formAppend 		= (args.formAppend)?args.formAppend:'';
		var _fieldPrefixText 	= (args.fieldPrefixText)?args.fieldPrefixText:'';
		var _fieldSuffixText 	= (args.fieldSuffixText)?args.fieldSuffixText:'';

		if (args.labelText && args.labelText !='') {
			newBlock = newBlock.concat('<div class="'+Y.classNames['viewFieldLabel']+ '" >', args.labelText, '</div>');
		}

		if (args.mode=='edit') {
			var _inputFunction = (args.inputFunction)?args.inputFunction:"";
			var _placeholder = (args.placeholder)?' placeholder="'.concat( args.placeholder, '"'):"";
			var _editClass = args.edit?"aprientry-edit-true":"aprientry-edit-false"
			newBlock = newBlock.concat('<!-- Fieldset template: ', args.id, ' -->\n<div class="',Y.classNames['formComponent'], ' formmgr-row ', _editClass, '" name="', args.fieldName,'">'
				, '<div class="', Y.classNames['viewFieldMessage'],'"></div>'
				, '<input'
				, ' type="text" tabindex="2"'
				, ' class="', Y.classNames['viewFieldText'], _inputFunction, ' ', _formClass + '"'
				, ' style=" ', _formStyle, '"'
				, ' name="', args.fieldName, '"'
				, _placeholder
				, ' value="{{data.', args.fieldName, '}}"'
				, ' id="{{apriFormContainer}}{{apriFormContainerId}}-', args.fieldName, '-input"'
				, '></input></div>');
		}
		
		if (args.mode=='edit') {
			newBlock = newBlock.concat('<!-- text template: ', args.id, ' -->\n<div class="aprientry-inq-true ');
		} else {
			newBlock = newBlock.concat('<!-- text template: ', args.id, ' -->\n<div class=" ');
		}
		
		if (args.blockClass) { newBlock = newBlock.concat(args.blockClass); };
        var _style = (args.style)?'style="'+args.style+'"':"";
		newBlock = newBlock.concat(
			  '" '
        	, ' ', _style, ' '
			, '>'
        	, '<div'
			, ' class=" ', Y.classNames['viewFieldTextArea'], ' ', _formClass, '"'
			, ' style=" ', _formStyle, '"'
			, ' id="{{apriFormContainer}}{{apriFormContainerId}}-', args.fieldName, '"'
			, '>'
			, _fieldPrefixText
			, '{{data.', args.fieldName+'}}{{', args.fieldName, '}}'
			, _fieldSuffixText
			, _formAppend
			, '</div>'
			, '</div>');

        return newBlock.concat('</div><!-- end of template block: ', args.id, ' \n-->');
    };
    
    Y._ApriBlockTemplates.autocomplete = function(args) {
        var newBlock="";
		newBlock = newBlock.concat('<div class="'+Y.classNames['viewField']+ '" >');

        if (!args.fieldName) return;

        var _formClass = (args.formClass)?args.formClass:'';
        var _formStyle = (args.formStyle)?args.formStyle:'';
        var _multiValueFormStyle = (args.multiValueFormStyle)?args.multiValueFormStyle:' width:80px; ';
        var _singleValueFormStyle = (args.singleValueFormStyle)?args.singleValueFormStyle:' width:80px; ';

		if (args.labelText && args.labelText !='') {
			newBlock = newBlock.concat('<div class="'+Y.classNames['viewFieldLabel']+ '">', args.labelText, '</div>');
		}
        
        if (args.mode=='edit') {
            var _style = (args.style)?'style="'+args.style+'"':"";
			var _inputFunction = (args.inputFunction)?args.inputFunction:"";
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
					, '<div class="',Y.classNames['formComponent'], ' formmgr-row '
					, '" name="', args.fieldName,'" '
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
					, '<div class="',Y.classNames['formComponent'], ' formmgr-row '
					, '" name="', args.fieldName,'" '
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
				, ' -->\n<div class="',Y.classNames['formComponent'], ' formmgr-row" name="', args.fieldName,'" style="'
				, _style
				, '">'
				, '<div class="', Y.classNames['viewFieldMessage'],'"></div>'
                , '<input'
                , ' type="text" tabindex="2"'
                , ' class="formmgr-field apriText aprientry-edit-false '
				, Y.classNames[_ClassNameInput]
				, _inputFunction
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
                , ' class="apriText aprientry-inq-true'
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


        return newBlock = newBlock.concat('</div></div><!-- end of template block: '
			, args.id
			,  ' \n-->');
    };

    Y._ApriBlockTemplates.textarea = function(args) {
        var newBlock="";
		newBlock = newBlock.concat('<div class="'+Y.classNames['viewField']+ '" >');
        if (!args.fieldName) return;

		if (args.labelText && args.labelText !='') {
			newBlock+='<div class="'+Y.classNames['viewFieldLabel']+ '" width="4em">' + args.labelText + '</div>';
		}
		
		if (args.mode=='edit') {
			var _formClass = (args.formClass)?args.formClass:"";
			var _formStyle = (args.formStyle)?args.formStyle:" width:100%; ";
			newBlock+='<!-- textarea template: '+ args.id +' \n--><div class="'+Y.classNames['formComponent']+ ' formmgr-row aprientry-edit-false" name="', args.fieldName,'">';
			// newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
			newBlock=newBlock.concat('<div class="', Y.classNames['viewFieldMessage'],'"></div>');
			newBlock+='<textarea';
			newBlock+=' tabindex="2"';
			var _inputFunction = (args.inputFunction)?args.inputFunction:"";
			newBlock+=' class="formmgr-field '+ Y.classNames['viewFieldTextArea'] + _inputFunction + ' ' + _formClass + '"';
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
			newBlock+='<!-- textarea template: '+ args.id +' -->\n<div class="aprientry-inq-true ';
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

        return newBlock+="</div><!-- end of template block: "+ args.id +" \n-->";
    };

/*
    Y._ApriBlockTemplates.date = function(args) {
        var newBlock="";
        newBlock+='<!-- Fieldset template: '+ args.id +' \n--><div class="'+Y.classNames['formComponent']+ ' formmgr-row" name="', args.fieldName,'">';
        if (args.fieldName) {

            if (args.mode=='edit') {
                newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                newBlock=newBlock.concat('<div class="', Y.classNames['viewFieldMessage'],'"></div>');
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyle)?args.formStyle:" width:6em; ";
                newBlock+=' class="formmgr-field apriDate apriDateCheck' + _inputFunction + ' ' + _formClass + '"';
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
        newBlock+='<!-- Fieldset template: '+ args.id +' \n--><div class="'+Y.classNames['formComponent']+ ' formmgr-row" name="'+ args.fieldName+'" style=" ">';
        if (!args.fieldName) return;

		if (args.labelText && args.labelText !='') {
			newBlock+='<div class="'+Y.classNames['viewFieldLabel']+ '" width="4em">' + args.labelText + '</div>';
		}
        
            if (args.mode=='edit') {
//                newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                newBlock+='<p class="formmgr-message-text  "></p>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyleDate)?args.formStyleDate:" width:60px; ";
                newBlock+=' class="aprientry-edit-false formmgr-field apriDate apriDateCheck ' + _inputFunction + ' ' + _formClass + '"';
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
            newBlock+=' class="formmgr-field aprientry-inq-true "';
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
        newBlock+='<!-- Fieldset template: '+ args.id +' \n--><div class="'+Y.classNames['formComponent']+ ' formmgr-row" name="'+ args.fieldName+'" style=" ">';
        if (!args.fieldName) return;

		if (args.labelText && args.labelText !='') {
			newBlock+='<div class="'+Y.classNames['viewFieldLabel']+ '" width="4em">' + args.labelText + '</div>';
		}
        
            if (args.mode=='edit') {
//                newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                newBlock+='<p class="formmgr-message-text  "></p>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyleDate)?args.formStyleDate:" width:60px; ";
                newBlock+=' class="aprientry-edit-false formmgr-field apriDate apriDateCheck ' + _inputFunction + ' ' + _formClass + '"';
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
            newBlock+=' class="formmgr-field aprientry-inq-true "';
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
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
                var _formClass = (args.formClass)?args.formClass:"";
                var _formStyle = (args.formStyleTime)?args.formStyleTime:'';
                newBlock+=' class="aprientry-edit-false formmgr-field apriTime apriTimeCheck ' + _inputFunction + ' ' + _formClass + '"';
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
            newBlock+=' class="formmgr-field aprientry-inq-true "';
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
                newBlock+='<!-- Fieldset template: '+ args.id +' -->\n<div class="'+Y.classNames['formComponent']+ ' formmgr-row" name="'+ args.fieldName+'">';
                newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                newBlock=newBlock.concat('<div class="', Y.classNames['viewFieldMessage'],'"></div>');
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
                newBlock+=' class="formmgr-field apriDuration ' + _inputFunction + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'-w"';
   //             if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                newBlock+=' value="{{data.'+args.fieldName +'WInput}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-w-input"';
                newBlock+='/>';
                newBlock+='<span>:W </span>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
                newBlock+=' class="formmgr-field apriDuration ' + _inputFunction + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'-d"';
   //             if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                newBlock+=' value="{{data.'+args.fieldName +'DInput}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-d-input"';
                newBlock+='/>';
                newBlock+='<span>:D </span>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
                newBlock+=' class="formmgr-field apriDuration ' + _inputFunction + ' ' + _formClass + '"';
                newBlock+=' style=" ' + _formStyle + '"';
                newBlock+=' name="'+args.fieldName +'-h"';
   //             if (args.placeholder) {newBlock+=' placeholder="'+ args.placeholder +'"';}
                newBlock+=' value="{{data.'+args.fieldName +'HInput}}"';
                newBlock+=' id="{{apriFormContainer}}-'+args.fieldName +'-h-input"';
                newBlock+='/>';
                newBlock+='<span>:H </span>';
                newBlock+='<input';
                newBlock+=' type="text" tabindex="2"';
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
                newBlock+=' class="formmgr-field apriDuration ' + _inputFunction + ' ' + _formClass + '"';
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
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
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
                newBlock+='<!-- Fieldset template: '+ args.id +' -->\n<div class="'+Y.classNames['formComponent']+ ' formmgr-row" name="'+ args.fieldName+'">';
                if (args.labelText!=undefined) {
                    newBlock+='<label class="label" width="4em" for="{{apriFormContainer}}-' + args.fieldName + '">' +  args.labelText +"</label>";
                }
                newBlock=newBlock.concat('<div class="', Y.classNames['viewFieldMessage'],'"></div>');
                newBlock+='<select';
                newBlock+=' tabindex="2"';
                var _inputFunction = (args.inputFunction)?args.inputFunction:"";
                newBlock+=' class="aprientry-edit-false formmgr-field apriSelect ' + _inputFunction + ' ' + _formClass + '"';
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
            newBlock+=' class="formmgr-field aprientry-inq-true "';
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
    
