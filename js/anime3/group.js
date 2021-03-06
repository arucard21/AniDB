/* file group page support scripts
 * @author fahrenheit (alka.setzer@gmail.com)
 * version 1.0 (22.11.2007) - Initial Release
 * version 1.1 (17.04.2008) - Re-added and fixed stuff
 */
jsVersionArray.push({
	"file":"anime3/aproduceradd.js",
	"version":"1.1",
	"revision":"$Revision$",
	"date":"$Date::                           $",
	"author":"$Author$",
	"changelog":"Re-added and fixed stuff"
});

// GLOBALS
var uriObj = new Array();      // Object that holds the URI
var gTable = null;
var released_div = null;
var ep_table = null;
var uid;						// userID
var mod;						// isMod
var aid;						// AnimeID
var gid;						// GroupID
var anime;						// anime Object (used in animePage)
var animes = new Array();		// stored by aid
var animeOrder = new Array();	// animes ordered in db way (link to aid)
//var groupOrder = new Array();	// ordered group list (filtering porpuses)
var groups = new Array();		// stored by gid
var aGroups = new Array();		// stored by agid (gid to link groups)
var mylist = new Array();		// stored by fid
var episodes = new Array();		// stored in eid
var epOrder = new Array();		// episodes ordered in db way (link to eid)
var files = new Array();		// stored by fid
var animeTitleLang = '';
var animeAltTitleLang = 'en';
var episodeTitleLang = '';
var episodeAltTitleLang = 'x-jat';
var episodeTitleDisplay = 2;
var entriesPerPage = 30;
var useLangFilters = true;
var filterAudLang = new Array();
var filterSubLang = new Array();
var epInterval = 250; // This one needs work
var epInt; // Interval ID
var processingEps = false; // are we processing episodes?
var base_url = 'http://static.anidb.net/';
var g_note = null;
var hiddenGroups = 0;
var loadExpand = false;

/* Converts qualitys to a rate system
 * @param qual Quality
 * @return Quality className
 */
function mapQuality(qualClassName) {
  switch (qualClassName) {
		case 'veryhigh': return (8);
		case 'high': return (7);
		case 'med': return (6);
		case 'low': return (5);
		case 'verylow': return (4);
		case 'corrupted': return (3);
		case 'eyecancer': return (2);
		case 'unknown': return (1);
  }
  return (1);
}

/* Updates the release list rows to allow more sorting options */
function updateReleaseListRows() {
	var table = gTable;
	if (!table) {
		var div = released_div;
		if (!div) return;
		var table = div.getElementsByTagName('table')[0];
	}
	if (!table) return;
	var tbody = table.tBodies[0];
	for (var i = 1; i < tbody.rows.length; i++) { // update each row
		var row = tbody.rows[i];
		var test = row.cells[2];		// Title Cell
		if (test) {
			test.className = test.className.replace('name','title');
			var label = test.getElementsByTagName('label')[0];
			if (label && label.childNodes.length) {
				var a = label.getElementsByTagName('a')[0];
				if (a) {
					var title = a.firstChild.nodeValue;
					test.setAttribute('anidb:sort',title.toLowerCase());
				} else test.setAttribute('anidb:sort','-');
			} else test.setAttribute('anidb:sort','-');
		}
		test = row.cells[5];		// Done Cell
		if (test) {
			var cnt = test.firstChild.nodeValue;
			var neps = cnt.split('+')[0];
			var seps = cnt.split('+')[1];
			cnt = neps+seps;
			test.setAttribute('anidb:sort',cnt);
		}
		test = row.cells[7];		// State Cell
		if (test) {
			a = test.getElementsByTagName('a')[0];
			if (a) {
				var state = a.firstChild.nodeValue;
				test.setAttribute('anidb:sort',state);
			}
		}
		test = row.cells[8];	// Rating Cell
		if (test) {
			var rating = test.firstChild.nodeValue;
			test.setAttribute('anidb:sort',((rating == 'N/A ') ? "0" : rating));
		}
	}
}

/* Updates the release list table with sorting */
function updateReleaseList() {
	var div = released_div;
	if (!div) return;
	gTable = div.getElementsByTagName('table')[0];
	if (!gTable) return;
	var headingList = gTable.getElementsByTagName('th');
	// I know the headings i need so..
	headingList[0].className += ' c_set';			// First
	headingList[1].className += ' c_set';			// Last
	headingList[2].className += ' c_setlatin';		// Title
	headingList[3].className += ' c_number';		// EPS
	headingList[4].className += ' c_number';		// Last
	headingList[5].className += ' c_set';			// Done
	headingList[6].className += ' c_number';		// Undumped
	headingList[7].className += ' c_setlatin';		// State
	headingList[8].className += ' c_set';			// Rating
	headingList[9].className += ' c_number';		// C
	init_sorting(gTable.tBodies[0].rows[0],'title','down');
}

/* Updates the episode list rows to allow more sorting options */
function updateEpTableRows(cellClean) {
	var table = ep_table;
	if (!table) return;
	var tbody = table.tBodies[0];
	for (var i = 0; i < tbody.rows.length; i++) { // update each row
		var row = tbody.rows[i];
/*
		if (!cellClean) {
			var test = row.cells[2];	// ID cell
			if (test) {
				var a = test.getElementsByTagName('a')[0];
				if (a) {
					var cnt = a.firstChild.nodeValue;
					test.setAttribute('anidb:sort',cnt);
					row.id = 'fid_'+cnt;
				}
			}
			test = row.cells[3];		// EP cell
			if (test) {
				var a = test.getElementsByTagName('a')[0];
				if (a) {
					var cnt = a.firstChild.nodeValue;
					test.setAttribute('anidb:sort',cnt);
				}
			}
			test = row.cells[5];		// Size cell
			if (test) {
				// convert to bytes without dots
				var fsize = test.firstChild.nodeValue;
				while(fsize.indexOf('.') > -1) fsize = fsize.replace('.','');
				test.setAttribute('anidb:sort',fsize);
			}
			test = row.cells[6];		// CRC Cell
			if (test) {
				if (!test.childNodes.length) test.setAttribute('anidb:sort','-');
				else test.setAttribute('anidb:sort',test.firstChild.nodeValue);
			}
			test = row.cells[7];		// Quality Cell
			if (test) {
				var span = test.getElementsByTagName('span')[0];
				if (span) {
					var className = span.className.substr(span.className.indexOf('i_rate_')+7,span.className.length);
					test.setAttribute('anidb:sort',mapQuality(className));
				}
			}
			test = row.cells[10];	// Users Cell
			if (test) {
				var a = test.getElementsByTagName('a')[0];
				if (a) {
					var cnt = a.firstChild.nodeValue;
					test.setAttribute('anidb:sort',cnt);
				}
			}
			test = row.cells[11];	// icons Cell
			if (test) test.className = test.className = 'added_by '+ test.className +' ed2k'
			test = row.cells[12];	// Username
			if (test) {
				var a =  getElementsByClassName(test.getElementsByTagName('a'), 'name', false)[0];
				if (a) {
					var username = a.firstChild.nodeValue;
					test.setAttribute('anidb:sort',username);
				}
			}
		} else {
*/
			test = row.cells[6];		// CRC Cell
			if (test) {
				if (!test.childNodes.length) test.setAttribute('anidb:sort','-');
				else test.setAttribute('anidb:sort',test.firstChild.nodeValue);
			}
			test = row.cells[11];	// icons Cell
			if (test) {
				test.onmouseover = createHashLink;/*
				var a = test.getElementsByTagName('a')[0];
				if (a) a.href = '!fillme!';*/
			}
//		}
	}
}

/* Function that toogles files for a given group */
function toggleFilesFromGroup() {
	var checked = this.checked;
	var filesChecked = 0;
	var totalFiles = 0;
	for (var f in files) {
		var file = files[f];
		if (!file) continue;
		if (file.groupId != gid) continue;
		totalFiles++;
		if (checked) {
			if (Number(group_check_type) != 5 && !file.visible) continue;
			switch(Number(group_check_type)) {
				case 0: break;
				case 1: if (file.fileType != 'mkv' && file.fileType != 'ogm') continue; break;
				case 2: if (file.fileType != 'avi') continue; break;
				case 3: if ((!file.videoTracks.length || file.videoTracks[0].resH < 720)) continue; break;
				case 4: if ((!file.videoTracks.length || file.videoTracks[0].resH >= 720)) continue; break;
				case 5: break;
				default: continue;
			}
		}
		var row = document.getElementById('fid_'+file.id);
		if (!row) continue;
		var ck = row.getElementsByTagName('input')[0];
		if (!ck) continue;
		ck.checked = checked;
		filesChecked++;
	}
}

function toogleCheckBoxes() {
	var table = this.parentNode;
	while (table.nodeName.toLowerCase() != 'table') table = table.parentNode;
	var tbody = table.tBodies[0];
	var cks = tbody.getElementsByTagName('input');
	for (var i = 0; i < cks.length; i++) {
		var ck = cks[i];
		if (ck.type != 'checkbox') continue;
		ck.checked = !ck.checked;
	}
}

/* Updates the filelist table with sorting */
function updateEpTable() {
	var table = ep_table;
	if (!table) return;
	var headingList = table.getElementsByTagName('th');
	var updateRows = false;
	// I know the headings i need so..
	headingList[0].className += ' c_none';			// X
	while(headingList[0].childNodes.length) headingList[0].removeChild(headingList[0].firstChild);
	var ck = createCheckBox(null,'files.all','files.all',toogleCheckBoxes,false);
	ck.title = 'Toggle files';
	headingList[0].appendChild(ck);
	createCheckBox(null,'files.all','files.all',toggleFilesFromGroup,false);
	headingList[1].className += ' c_set';			// Date
	headingList[2].className += ' c_setlatin';		// ID
	headingList[3].className += ' c_setlatin';		// EP
	headingList[4].className += ' c_setlatin';		// Group
	headingList[5].className += ' c_set';			// Size
	headingList[6].className += ' c_setlatin';		// CRC
	headingList[7].className += ' c_set';			// Quality
	headingList[8].className += ' c_latin';			// Source
	headingList[9].className += ' c_set';			// Resolution
	headingList[10].className += ' c_setlatin';		// User count
	headingList[11].className += ' c_setlatin';		// icons
	if (headingList[12] && headingList[12].className.indexOf('') >= 0) {
		headingList[12].className += ' c_set';		// Username
	}
	var tbody = table.tBodies[0];
	var thead = document.createElement('thead');
	var tfoot = document.createElement('tfoot');
	var row = document.createElement('tr');
	var ck = createCheckBox(null,'files.all','files.all',toggleFilesFromGroup,false);
	var cell = createCell(null, null, ck, false, headingList.length)
	cell.appendChild(document.createTextNode(' select files'));
	row.appendChild(cell);
	tfoot.appendChild(row);
	thead.appendChild(tbody.rows[0]);
	table.insertBefore(thead,tbody);
	table.appendChild(tfoot);
	init_sorting(table,'epno','down');

	updateEpTableRows(false);
}

/* This function prepares the mylist page for use with my scripts */
function prepPage() {
	var start = new Date();
	uriObj = parseURI();
	if (uriObj['ajax'] && uriObj['ajax'] == 0) return; // in case i want to quickly change ajax state
	released_div = getElementsByClassName(document.getElementsByTagName('div'), 'group_released', true)[0];
	ep_table = getElementsByClassName(document.getElementsByTagName('table'), 'filelist', true)[0];
	if (released_div) { // releases
		updateReleaseListRows();
		updateReleaseList();
	}
	if (ep_table) updateEpTable();
	if (!uriObj['show'] || uriObj['show'] != 'group') return; // can't work more magic without the rest
	initTooltips();
	aid = Number(uriObj['aid']);
	gid = Number(uriObj['gid']);

	//alert("Timed: "+(new Date() - start));

	if (!isNaN(aid) && !isNaN(gid)) {
		//Group-Anime Page
		fetchData(aid);
	} else if(!isNaN(gid)) {
		//Group Page
		fetchData(null, gid);
	}
}

/* Function that fetches anime data
 * @param aid Anime ID
 * @param gid Group ID
 */
function fetchData(aid,gid) {
	var req = xhttpRequest();
	if (gid == null) {
		//First get for group-anime page
		if (isLocalHost()) xhttpRequestFetch(req, 'xml/aid'+aid+'.xml', parseData);
		else xhttpRequestFetch(req, 'animedb.pl?show=xml&t=anime&aid='+aid, parseData);
	} else if(gid != null && aid != null) {
		//Second get for group-anime page
		if (isLocalHost()) xhttpRequestFetch(req, 'xml/aid'+aid+'_gid'+gid+'.xml', parseEpisodeData);
		else xhttpRequestFetch(req, 'animedb.pl?show=xml&t=ep&aid='+aid+'&eid=all&gid='+gid, parseEpisodeData);
	} else if(gid != null && aid == null) {
		//Get for group page
		if (isLocalHost()) xhttpRequestFetch(req, 'xml/gid'+gid+'_range.xml', parseGroupRangeData);
		else xhttpRequestFetch(req, 'animedb.pl?show=xmln&t=agranges&gid=' + gid, parseGroupRangeData);
	}
}

/* Function that parses xml response
 * @param xmldoc The xml response
 */
function parseData(xmldoc) {
	var root = xmldoc.getElementsByTagName('root').item(0);
	if (!root) { if (seeDebug) alert('Error: Could not get root node'); return; }
	updateStatus('Processing anime data...');
	t1 = new Date();
	parseAnimes(root.getElementsByTagName('animes'));
	var parseAnimeNode = (new Date()) - t1;
	var filedataNodes = root.getElementsByTagName('filedata');
	for (var k = 0; k < filedataNodes.length; k++) parseFiledata(filedataNodes[k], aid);
	updateStatus('Processing user data...');
	var t1 = new Date();
	parseCustom(root.getElementsByTagName('custom').item(0));
	var parseCustomNode = (new Date()) - t1;
	updateStatus('');
	var aid = root.getElementsByTagName('anime')[0];
	if (!aid) { errorAlert('parseData','no anime node'); return; }
	aid = Number(aid.getAttribute('id'));
	t1 = new Date();
	var preparingPage = (new Date() - t1);
	if (seeTimes) alert('Processing...\n'+
						'\n\tanimes: '+parseAnimeNode+'ms'+
						'\n\tcustom: '+parseCustomNode+' ms'+
						'\n\tpreping: '+preparingPage+' ms'+
						'\n\tTotal: '+(parseAnimeNode+parseCustomNode+preparingPage)+' ms');
	// now fetch group data
	fetchData(aid,gid); // now that we have anime data, fetch the rest of the data
}

/* Function that parses Episode data
 * @param xmldoc The xml document to parse
 */
function parseEpisodeData(xmldoc) {
	var root = xmldoc.getElementsByTagName('root').item(0);
	if (!root) return;
	updateStatus('Processing anime episode(s)...');
	var animesNode = root.getElementsByTagName('animes')[0];
	if (!animesNode) return;
	var animeNodes = animesNode.getElementsByTagName('anime');
	for (var i = 0; i < animeNodes.length; i++) {
		if (animeNodes[i].parentNode.nodeName != 'animes') continue; // wrong node
		var aid = Number(animeNodes[i].getAttribute('id'));
		var epNodes = animeNodes[i].getElementsByTagName('ep');
		var filedataNodes = animeNodes[i].getElementsByTagName('filedata');
		var t1 = new Date();
		for (var k = 0; k < filedataNodes.length; k++)
			parseFiledata(filedataNodes[k], aid);
		var epNodestime = (new Date()) - t1;
		t1 = new Date();
		processingEps = true; // make the table creation wait
		for (var k = 0; k < epNodes.length; k++) {
			// if we are handling just one episode do stuff now otherwise defer execution
			var eid = Number(epNodes[k].getAttribute('id'));
			parseEpisode(epNodes[k], aid);
			var episode = episodes[eid];
			if (!episode) continue;
		}
		processingEps = false;
		pseudoFilesCreator(); // create pseudo files
		if (loadExpand) loadExpand = false;
		if (seeTimes) alert('Processing...\n\tepNodes: '+((new Date()) - t1)+' ms\n\tfiledataNodes: '+epNodestime+' ms');
	}
	updateStatus('');
	// now that we have all the data actualy update the hash nodes
	//updateEpTableRows(true); // maybe i can live without this one

	addEpBar();
}

function parseGroupRangeData(xmlDoc){
	var groupReleases = new Object();
	var id;

	var epRange, totalEps;
	var animes = xmlDoc.getElementsByTagName('anime');
	for(var i =0; i < animes.length; i++){
		id = animes[i].getAttribute('id');

		epRange = nodeData(animes[i].getElementsByTagName('eprange')[0])
		groupReleases[id + '_eprange'] = epRange;

		totalEps = nodeData(animes[i].getElementsByTagName('neps')[0])
		groupReleases[id + '_neps'] = totalEps;
	}

	var mlRange;
	var mylist = xmlDoc.getElementsByTagName('mylist');
	var mlGroups = mylist[0].getElementsByTagName('group');
	var mlEntries = mylist[0].getElementsByTagName('inmylist');

	for(var j=0; j<mlEntries.length; j++) {
		id = mlGroups[j].getAttribute('aid');
		mlRange = nodeData(mlEntries[j]);
		groupReleases[id + '_mlrange'] = mlRange;
	}
	addEpBars(groupReleases);
}


 /* Adds epbars below each anime row */
function addEpBars(groupReleases){
	var div = document.getElementById('tab_main_1_pane'); //Need more reliable way?

	var cell;
	var colIndex = 0;
	var thead = div.getElementsByTagName('thead')[0];
	var thChildNodes = thead.firstChild.getElementsByTagName('th');
	for (colIndex = 0; colIndex < thChildNodes.length; colIndex++) {
		if(thChildNodes[colIndex].className && thChildNodes[colIndex].className.indexOf("undumped")>=0){
			cell = document.createElement('th');
			cell.appendChild(document.createTextNode('Progress'));
			thead.firstChild.insertBefore(cell, thChildNodes[colIndex]);
			break;
		}
	}

	var range;
	var aid, link;
	var maps, totalEps;
	var tbody = div.getElementsByTagName('tbody')[0];
	var rows = tbody.getElementsByTagName('tr');
	for(var i=0; i < rows.length; i++){
		link = rows[i].getElementsByTagName('td')[2].getElementsByTagName('a')[0].getAttribute('href');
		aid = link.substr(link.indexOf('aid=')+4);

		maps = {'0' : {'use':true, 'type': 0,'desc':"",'img':"blue",'class':"notdone"},
				'1' : {'use':false,'type': 1,'desc':"Done: "+groupReleases[aid + '_eprange'],'img':"darkblue",'class':"done"},
				'2' : {'use':false,'type': 2,'desc':"in mylist: "+convertRangeToText(groupReleases[aid + '_mlrange']),'img':"lime",'class':"done mylist"}};

		totalEps = parseInt(groupReleases[aid + '_neps']);
		if(isNaN(totalEps)) totalEps = 0;

		range = expandRange(null, totalEps, maps[0], null);

		if(groupReleases[aid + '_eprange'] != '' && groupReleases[aid + '_eprange']) {
			maps[1]['use'] = true;
			range = expandRange(groupReleases[aid + '_eprange'], totalEps, maps[1], range);
		}

		if(groupReleases[aid + '_mlrange'] != '' && groupReleases[aid + '_mlrange']) {
			maps[2]['use'] = true;
			range = expandRange(groupReleases[aid + '_mlrange'], totalEps, maps[2], range);
		}

		cell = rows[i].insertCell(colIndex);
		cell.style.width = 100+"px";
		cell.className = "epbar";
		makeCompletionBar(cell, range, maps, 100);
	}
}

 /* Appends an epbar below the last file */
function addEpBar(){
	var fileList;
	var tables = document.getElementsByTagName('table');
	for(var i=0; i<tables.length;i++) if(tables[i].className == 'filelist') fileList = tables[i];

	var totalEps = (anime.eps ? anime.eps : anime.highestEp);
	var group = groups[gid];

	var maps = {'0' : {'use':true, 'type': 0,'desc':"",'img':"blue",'class':"notdone"},
				'1' : {'use':false,'type': 1,'desc':"Done: "+group.epRange,'img':"darkblue",'class':"done"},
				'2' : {'use':false,'type': 2,'desc':"in mylist: "+convertRangeToText(group.isInMylistRange),'img':"lime",'class':"done mylist"}};

	var range = expandRange(null, totalEps, maps[0], null);
	if (group.epRange != '') { maps[1]['use'] = true; range = expandRange(group.epRange, totalEps, maps[1], range);}
	if (group.isInMylistRange != '') { maps[2]['use'] = true; range = expandRange(group.isInMylistRange, totalEps, maps[2], range);}

	var row = document.createElement('tr');
	var td = document.createElement('td');
	row.appendChild(td);

	td.setAttribute('colspan', fileList.tBodies[0].rows[0].cells.length)
	td.className = "epbar";
	makeCompletionBar(td, range, maps);
	fileList.tBodies[0].appendChild(row);
}

//window.onload = prepPage;
addLoadEvent(prepPage);
