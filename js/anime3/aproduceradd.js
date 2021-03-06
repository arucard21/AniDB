/* file addaproducer page support scripts
 * @author fahrenheit (alka.setzer@gmail.com)
 *         
 * version 1.1 (22.01.2008) - previous release
 * version 1.2 (18.04.2008) - Fixed the page to load without checks
 */
jsVersionArray.push({
	"file":"anime3/aproduceradd.js",
	"version":"1.2",
	"revision":"$Revision$",
	"date":"$Date::                           $",
	"author":"$Author$",
	"changelog":"Fixed the page to load without checks"
});

// GLOBALS
var uriObj = new Array();      // Object that holds the URI
var searchbox = null;
var inputbutton = null;
var searchString = "";
var producerSelect = null;
var newsearchbox = null;

/* Function that fetches data from the server */
function fetchData() {
	var req = xhttpRequest();
	if (''+window.location.hostname == '') xhttpRequestFetch(req, 'xml/producersearch.xml', parseData);
	else xhttpRequestFetch(req, 'animedb.pl?show=xml&t=producersearch&search='+encodeURI(searchString), parseData);
}

/* Producer class
 * @param node Node to parse
 */
function CProducer(node) {
	this.id = Number(node.getAttribute('prid'));
	this.name = node.getAttribute('name');
	this.sname = node.getAttribute('sname');
}

/* Function that creates selectBoxes based on data
 * @param producerEntries Data
 */
function createSelectBoxes(producerEntries) {
	producerSelect = createBasicSelect('addap.prid');
	for (var i = 0; i < producerEntries.length; i++) {
		var producerEntry = new CProducer(producerEntries[i]);
		createSelectOption(producerSelect, producerEntry.name, producerEntry.id, false)
	}
	replaceCell.replaceChild(producerSelect,((newsearchbox) ? newsearchbox : searchbox));
	inputbutton.value = " Search again ";
	inputbutton.onclick = function replaceBox() {	newsearchbox = searchbox.cloneNode(true);
													newsearchbox.value = '';
													replaceCell.replaceChild(newsearchbox,producerSelect); 
													inputbutton.value = " Search ";
													inputbutton.onclick = function updateSearchString() {	searchString = newsearchbox.value; newsearchbox.value = 'please wait while searching...'; fetchData(); }
												}
}

/* Function that parses data
 * @param xmldoc XML data
 */
function parseData(xmldoc) {
	var root = xmldoc.getElementsByTagName('root').item(0);
	var t1 = new Date();
	var producerEntries = root.getElementsByTagName('producer');
	createSelectBoxes(producerEntries);
}

/* Prepares the page */
function prepPage() {
	uriObj = parseURI(); // update the uriObj
	// commented out because of add case
	//if (!uriObj['show'] || uriObj['show'] != 'addaproducer') return; // badPage
	if (!uriObj['apid']) {
		inputbutton = getElementsByName(document.getElementsByTagName('input'),'addap.do.searchaproducer',true)[0];
		searchbox = getElementsByName(document.getElementsByTagName('input'),'addap.aproducersearch',true)[0];
		if (!inputbutton || !searchbox) return;
		replaceCell = searchbox.parentNode;
		inputbutton.type = 'button';
		inputbutton.onclick = function updateSearchString() {	searchString = searchbox.value; searchbox.value = 'please wait while searching...'; fetchData(); }
	}
}

//window.onload = prepPage;
addLoadEvent(prepPage);