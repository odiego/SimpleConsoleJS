/**
 * Copyright (C) 2006 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * See (https://github.com/marciosalinodias/SimpleConsoleJS)
 * 
 * @author - Marcio Salino Dias
 * @email - marciosalinodias@gmail.com
 * 
 * See the Github SimpleConsoleJS project (https://github.com/marciosalinodias/SimpleConsoleJS) for full details.
 * This plugin is just a simple javascript console to incorporate into your web page.
 * @memberOf jQuery.fn
 */ 
if(!SIMPLE_CONSOLE_JS)
	var SIMPLE_CONSOLE_JS={};
	
SIMPLE_CONSOLE_JS.consoleObj = $('#console');

var SIMPLE_CONSOLE_PATH = (function thisFilePath() {
		var scripts = document.getElementsByTagName("script");
		var lastPath = scripts[scripts.length - 1].src;
		var splitPath = lastPath.split("/");
		return lastPath.replace(splitPath[splitPath.length - 1], "");
	})();

SIMPLE_CONSOLE_JS.DEACTIVATE = function(){
	SIMPLE_CONSOLE_JS.consoleObj.html("");
};
	
SIMPLE_CONSOLE_JS.ACTIVATE = function(){

	var body = $('body');

	if(!SIMPLE_CONSOLE_JS.consoleObj || SIMPLE_CONSOLE_JS.consoleObj.length <= 0){
		var consoleHtml = "<div id='console'></div>";
		body.append(consoleHtml);
		SIMPLE_CONSOLE_JS.consoleObj = $('#console');
	}
	
	SIMPLE_CONSOLE_JS.consoleObj.html("");
	
	// Stylesheet necessary for simpleConsole
	var scCss = document.createElement("link");
	scCss.rel = "stylesheet";
	scCss.href = SIMPLE_CONSOLE_PATH + "../css/simpleConsole.css"; 
	$(document.head).append(scCss);
		
	// Dependency of prettify plugin (stylesheet)
	var prettifyCss = document.createElement("link");
	prettifyCss.rel = "stylesheet";
	prettifyCss.href = SIMPLE_CONSOLE_PATH + "../css/prettify.css";
	$(document.head).append(prettifyCss);
		
	// Dependency of prettify plugin (javascript)
	var prettifyScript = document.createElement("script");
	prettifyScript.setAttribute("type", "text/javascript");
	prettifyScript.setAttribute("src", SIMPLE_CONSOLE_PATH + "../js/prettify.js");
	document.head.appendChild(prettifyScript);
	
	var scInElement = document.createElement("input");
	scInElement.id = "sc-cmdIn";
		
	var scOutElement = document.createElement("pre");
	scOutElement.id = "sc-cmdOut";
	scOutElement.className = "prettyprint lang-js";
	
	var arrCommands = [];
	var arrActual;
		
	SIMPLE_CONSOLE_JS.consoleObj.append(scInElement);
	SIMPLE_CONSOLE_JS.consoleObj.append("<br />");
	SIMPLE_CONSOLE_JS.consoleObj.append(scOutElement);
		
	scInElement = $(scInElement);
	scOutElement = $(scOutElement);
	
	// Needed because IE dont have an Object.constructor.name property
		function getClassName(element){
		   var nameReplaceRegex = /function (.{1,})\(/;
		   var className = (nameReplaceRegex).exec(element.constructor.toString());
		   return (className && className.length > 1) ? className[1] : "";
		};		
		
		function randomizeIdentifier(){
			return Date.now().toString() + parseInt(Math.random() * 1000000).toString();
		};
		
		function moveToNewElement(){
			arrActual = arrCommands.length;
			scInElement.val("");
		};
		
		function insertActualElement(){
			arrCommands.push(scInElement.val());
			arrActual = arrCommands.length;
		};
		
		function passOneElement(){
			if(typeof arrCommands[arrActual+1] != 'undefined'){
				arrActual += 1;
				scInElement.val(arrCommands[arrActual]);
			} else {
				arrActual = arrCommands.length;
				scInElement.val("");
			};
		};
		
		function backOneElement(){
			if(typeof arrCommands[arrActual-1] != 'undefined'){
				arrActual -= 1;
				scInElement.val(arrCommands[arrActual]);
			};
		};
		
        function executeCode(command){
			var result;
			
			if(scOutElement.text() != ""){
				scOutElement.append("<br /><hr />");
			};
			scOutElement.append("&gt;&gt; " + command + "<br />");
			prettyPrint();
			
			try{
				result = window.eval( command );
				if (typeof result !== 'undefined') {
					result = generateObject(result);
				};
				scOutElement.append("&lt;&lt; " + result);
			}
			catch(e){
				scOutElement.append("&lt;&lt; " + e);
			};
			
			prettyPrint();
		};
		
		function generateObject(dataTree){
			if (dataTree != null) {
				var returnTree = "";
				
				if (getClassName(dataTree) === "Array") {
					var identifier = randomizeIdentifier();
					returnTree += "<span class=\"sc-propertyTree sc-expandTree\" rel=\"" + identifier + "\" >" + getClassName(dataTree) + " [" + dataTree.length + "]</span><ul class=\"detailTree\" id=\"" + identifier + "\">";
					for (var count = 0; count < dataTree.length; count++) {
						returnTree += "<li>[" + count + "] : " + generateObject(dataTree[count]) + "</li>";
					};
					returnTree += "</ul>";
				} else if (typeof dataTree == "object") {
					var identifier = randomizeIdentifier();
					returnTree += "<span class=\"sc-propertyTree sc-expandTree\" rel=\"" + identifier + "\" >" + getClassName(dataTree) + "</span><ul class=\"detailTree\" id=\"" + identifier + "\">";
					for (var key in dataTree) {
						returnTree += "<li>" + key + " : ";
						if ( typeof dataTree[key] == "object" || typeof dataTree[key] == "function") {
							returnTree += generateObject(dataTree[key]);
						} else {
							returnTree += typeof dataTree[key] == "string" ? "&quot;" + dataTree[key] + "&quot;" : dataTree[key];
						};
						returnTree += "</li>";
					};
					returnTree += "</ul>";
				} else if (typeof dataTree == "function"){
					var identifier = randomizeIdentifier();
					returnTree += "<span class=\"sc-propertyTree sc-expandTree\" rel=\"" + identifier + "\" >" + getClassName(dataTree) + "() {...</span>";
					returnTree += "<ul class=\"detailTree\" id=\"" + identifier + "\"><li>" + dataTree + "</li></ul>";
				} else {
					returnTree = typeof dataTree == "string" ? "&quot;" + dataTree + "&quot;" : dataTree;
				};
				return returnTree;
			};
			return 'undefined';
		};
		
		$(document).delegate('.sc-expandTree', 'click', function() {
			$("#" + $(this).attr("rel")).toggle();
			if( $(this).hasClass("sc-expandTree") ){
				$(this).removeClass("sc-expandTree");
				$(this).addClass("sc-retractTree");
			};
		}).delegate('.sc-retractTree', 'click', function() {
			$("#" + $(this).attr("rel")).toggle();
			if( $(this).hasClass("sc-retractTree") ){
				$(this).removeClass("sc-retractTree");
				$(this).addClass("sc-expandTree");
			};
		});
		
		scInElement.keydown(function(event) {
			if (event.keyCode == '13') {
				executeCode(scInElement.val());
				insertActualElement();
				moveToNewElement();
			} else if (event.keyCode == '38') { // up arrow
				if(typeof arrActual != 'undefined' ){
					backOneElement();
				}else if(scInElement.val() != ""){
					insertActualElement();
					backOneElement();
				};
			} else if (event.keyCode == '40') { // down arrow
				if(typeof arrActual != 'undefined' ){
					passOneElement();
				}else if(scInElement.val() != ""){
					insertActualElement();
					passOneElement();
				};
			};
		});

};