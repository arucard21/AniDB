/* *
 * @file producer page support scripts
 * @author fahrenheit (alka.setzer@gmail.com)
 *         
 * @version 1.0 (08.01.2008)
 */
jsVersionArray.push({
	"file":"anime3/producer.js",
	"version":"1.0",
	"revision":"$Revision: 2923 $",
	"date":"$Date:: 2009-08-04 00:34:35 +0100#$",
	"author":"$Author: fahrenheit $",
	"changelog":"Initial version"
});
 
// GLOBALS
var uriObj = new Array();      // Object that holds the URI

/* *
 * Updates the release list rows to allow more sorting options
 */
function updateReleaseListRows() {
	var div = getElementsByClassName(document.getElementsByTagName('div'), 'producer_related_anime', true)[0];
  if (!div) return;
	var table = div.getElementsByTagName('table')[0];
	if (!table) return;
	var tbody = table.tBodies[0];
	for (var i = 1; i < tbody.rows.length; i++) { // update each row
		var row = tbody.rows[i];
		var test = row.cells[0];		// Title Cell
		if (!test) continue;
		var label = test.getElementsByTagName('label')[0];
		if (label && label.childNodes.length) {
			var a = label.getElementsByTagName('A')[0];
			if (a) {
				var title = a.firstChild.nodeValue;
				test.setAttribute('anidb:sort',title.toLowerCase());
			} else test.setAttribute('anidb:sort','-');
		} else test.setAttribute('anidb:sort','-');
	}
}

/* *
 * Updates the release list table with sorting
 */
function updateReleaseList() {
	var div = getElementsByClassName(document.getElementsByTagName('div'), 'producer_related_anime', true)[0];
  if (!div) return;
	var table = div.getElementsByTagName('table')[0];
	if (!table) return;
	headingList = table.getElementsByTagName('th');
  // I know the headings i need so..
  headingList[0].className += ' c_setlatin';	// Anime
  headingList[1].className += ' c_latin';		// Relation
  headingList[2].className += ' c_date';			// Year
  headingList[3].className += ' c_number';		// EPS
  headingList[4].className += ' c_latin';		// TYPE
	init_sorting(table.tBodies[0].rows[0],'year','down');
}

function prepPage() {
  uriObj = parseURI(); // update the uriObj
  if (!uriObj['show'] || uriObj['show'] != 'producer') return; // badPage
	updateReleaseList();
	updateReleaseListRows();
}

//window.onload = prepPage;
addLoadEvent(prepPage);