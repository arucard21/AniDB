"""
To use the ftp feature you got to create a ftp.txt file above the level of
the cvs folder (1 level above the adm, cgi-bin, etc. folder) with the
following lines:
www.anidb.net
account
password
Furthermore you have to run the script with the option "upload"
"""

import os, sys, ftplib, amara, copy

__out = "../../flat/"
__ftp = {}
__ftppath = '/css/'
__extensions = ('.jpg', '.jpeg', '.gif', '.png','.css')

def cssmerge(fullpath, outfile):
	path, filename = os.path.split(os.path.normpath(fullpath))
	infile = file(os.path.join(path,filename), 'rU')
	skip = 0
	incurly = 0
	nr = 0
	for line in infile:
		nr += 1
		line = line.strip()
		
		if line.count("{")>0:
			if incurly :
				print "ERROR: double curly @ "+fullpath+":"+`incurly`+"-"+`nr`
				sys.exit()
			else : incurly = nr

		if line.count("}")>0:
			if incurly : incurly = 0
			else:
				print "ERROR: negative curly @ "+fullpath+":"+`nr`
				sys.exit()
	
		if line.startswith("@import"):
			monkey = line[line.find('"')+1:line.rfind('"')]
			outfile.write("/*"+monkey+"*/\n")
			cssmerge(os.path.join(path,monkey), outfile)
		elif line.endswith("}"):
			outfile.write(line+"\n\n")
		elif line != "":
			outfile.write(line+"\n")
	infile.close()

def cssm():
	if os.path.exists(__out) is False:
		os.mkdir(__out)
	for line in file('stylelist').readlines():
		if not line.startswith('#'):
			path,name = line.rstrip('\n').rsplit('/',1)
			if path.startswith('./sub/'):
				oname = path.replace('./sub/','') + '.css'
				xml(unicode('sub-'+oname.rstrip('.css')),path)
				if os.path.exists(__out+'sub/') is False:
					os.mkdir(__out+'sub/')
				cssmerge(line.rstrip('\n'),file(__out+'sub/'+oname, 'w'))
			else:
				oname = path.lstrip('./').replace('/','-') + '.css'
				xml(unicode(oname.rstrip('.css')),path)
				if os.path.exists(__out+path.lstrip('./')) is False:
					os.mkdir(__out+path.lstrip('./'))
				cssmerge(line.rstrip('\n'),file(__out+path.lstrip('./')+'/'+oname, 'w'))
			__ftp[path] = oname

def xml(newstyle,path):
	stylelist = []
	new = {'status': u'', 'description': u'', 'creator': u'', 'update': u'', 'title': u''}
	descpath = path + '/' + 'description'
	xmldoc = amara.parse('./stylelist.xml')

	if os.path.exists(descpath):
		stuff = file(descpath, 'r').readlines()
		for line in stuff:
			line = line.rstrip('\n')
			if line.find(':') >0:
				key, val = line.split(':')
				new[key] = unicode(val.strip())
			else:
				if new[key] == '':
					new[key] = new[key] + line
				else:
					new[key] = new[key] + '\n' + line

	xmlstyles = xmldoc.css_styles.xml_xpath("style/@name")
	for i in range(len(xmlstyles)):
		stylelist += [xmlstyles[i].value]

	if newstyle in stylelist:
		styleelem = xmldoc.css_styles.style
		for i in range(len(styleelem)):
			if styleelem[i].name == newstyle:
				styleelem[i].title = new['title']
				styleelem[i].creator = new['creator']
				styleelem[i].update = new['update']
				styleelem[i].status = new['status']
				styleelem[i].description = new['description']
	else:
		temp = copy.deepcopy(xmldoc.css_styles.style)
		temp.name = newstyle
		temp.title = new['title']
		temp.creator = new['creator']
		temp.update = new['update']
		temp.status = new['status']
		temp.description = new['description']
		xmldoc.css_styles.xml_append(temp)

	output = file('./stylelist.xml', 'w')
	output.write(xmldoc.xml())

def doftp():
	ftp_update = []
	for css in __ftp:
		if css.startswith('./sub/'): #more evil special fixing for sub styles
			ftp_update += [(__ftppath + 'sub/' + __ftp[css],__out+ 'sub/' +__ftp[css])]
		else:
			ftp_update += [(__ftppath + css.lstrip('./') + '/' + __ftp[css],__out+ css.lstrip('./')+'/'+__ftp[css])]
		if os.path.exists(css+'/images'): #do we have an /image path for the css?
			for root,path,filename in os.walk(css+'/images'):
				root = root.replace('\\','/') #evil mixed \ and /
				for elem in filename:
					if filter(elem.endswith, __extensions):
						if root.startswith('./sub/'): #more evil special fixing for sub styles
							ftp_update += [(__ftppath + 'sub/images/' + elem,root + '/' + elem)]
						else:
							ftp_update += [(__ftppath + root.lstrip('./') + '/' + elem,root + '/' + elem)]

	ftp_update += [(__ftppath + 'stylelist.xml','./stylelist.xml')]
	anidbftp = ftplib.FTP(*file("../../ftp.txt").read().split("\n"))

	for ftp_path, local_file in ftp_update:
		try:
			anidbftp.storbinary("STOR "+ftp_path, file(local_file,'rb'))
			print "Uploading", ftp_path
		except ftplib.error_perm, error:
			ftpfolder(ftp_path,anidbftp)
			try:
				anidbftp.storbinary("STOR "+ftp_path, file(local_file,'rb'))
				print "Uploading", ftp_path
			except ftplib.error_perm, error:
				print error
	anidbftp.quit()

def ftpfolder(ftp_path,anidbftp,position='/'):
	if ftp_path.find('/') >=0:
		root,path = ftp_path.lstrip('/').split('/',1)
		anidbftp.cwd('/')
		try:
			anidbftp.cwd(position)
			anidbftp.cwd(root)
		except:
			try:
				anidbftp.mkd(root)
			except ftplib.error_perm, error:
				print error
		ftpfolder(path,anidbftp,position+'/'+root)

if __name__ == "__main__":
	cssm()
	
	if sys.argv.pop() == "upload":
		doftp()

	print "done"
