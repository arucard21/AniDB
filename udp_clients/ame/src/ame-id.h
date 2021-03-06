// Copyright (C) 2006 epoximator
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

#ifndef __AME_ID_H
#define __AME_ID_H

#define A wxGetApp()

#define FILE_SEPARATOR '\\' //TODO platform independent

#define POP(x) MessageBox(NULL, x, wxT("Message"), MB_OK)
#define POPT(x) POP(wxT(x))
#define POPI(x) POP(wxString::Format(wxT("int: %d"),x))

#define SP1(x,y) wxString::Format(wxT(x), y)
#define SP2(x,y,z) wxString::Format(wxT(x), y, z)
#define SP3(x,y,z,k) wxString::Format(wxT(x), y, z, k)
#define SP4(x,y,z,k,l) wxString::Format(wxT(x), y, z, k, l)
#define SPS(x) SP1("%s",x)
#define SPD(x) SP1("%d",x)

#define MSG_POP 1
#define MSG_LOG 2
#define MSG_DEB 4
#define MSG_HSH 8
#define MSG_STA 16

#define POSTM(x,y){\
	wxCommandEvent evt( wxEVT_COMMAND_MENU_SELECTED, EVT_MESSAGE );\
	evt.SetInt(x);\
	evt.SetString(y);\
	wxPostEvent((wxFrame*)A.m_frame, evt);}
#define POSTI(x,y){\
	wxCommandEvent evt( wxEVT_COMMAND_MENU_SELECTED, x );\
	evt.SetInt(y);\
	wxPostEvent((wxFrame*)A.m_frame, evt);}
#define POSTG(x) POSTI(EVT_GAUGE, x)
#define POSTR(x) POSTI(EVT_JOB_LIST_REFRESH, x)
#define POSTE(x) {wxPostEvent( (wxFrame*)A.m_frame, wxCommandEvent(wxEVT_COMMAND_MENU_SELECTED, x) );}

#define BCMP(x,y) (x&y)==y

enum{
    ID_Quit = 1000,
	ID_Save,
	ID_File,
	ID_Folder,
	ID_Disk,
	ID_Net,
	ID_Database,
	ID_Export,
	ID_Import,
	ID_WIKI,
    ID_About,
	LIST_JOBS,//                  = 1000,
	LIST_REPLACE,
	EVT_DEL_EXT,
	EVT_PAUSE,
	EVT_SHOW_INFO,
	EVT_WATCH_NOW,
	EVT_EXPLORE_FOLDER,
	EVT_REHASH,
	EVT_REID,
	EVT_READD,
	EVT_REMOVE,
	EVT_APPLY_RULES,
	EVT_SET_FINISHED,
	EVT_RESTORE_NAME,
	EVT_SET_FOLDER,
	EVT_SET_PARENT_FOLDER,
	EVT_EDIT_FOLDER_PATH,
	EVT_EDIT_FILE_NAME,
	EVT_PARSE_WITH_AVINFO,
	EVT_SET_FID,
	EVT_REMOVE_FROM_DB,
	EVT_SORT_JOBS,
	EVT_MESSAGE,
	EVT_GAUGE,
	EVT_DISK_STAT,
	EVT_DISK_BYE,
	EVT_NET_STAT,
	EVT_NET_BYE,
	EVT_NET_LOGIN,
	EVT_JOB_LIST_LEN,
	EVT_JOB_LIST_REFRESH,
	EVT_JOB_LIST_KEY,
	EVT_DB_BYE,
	EVT_RADIO_NAME,
	EVT_RADIO_PATH,
	EVT_BUTTON_APPLY_RULES,
	EVT_BUTTON_ADD_REPLACE,
	EVT_ADD_EXT
};
class AmeJobList;
class AmeFrame;
class AmeRules;
class AmeOptions;
class AdbUserPass;
class MyHtmlFrame;
class AmeDB;

class AmeApp: public wxApp
{
    virtual bool OnInit();
	virtual int OnExit();
public:
	//~AmeApp(void);
	//DIV
	wxThread* m_disk_thread;
	wxThread* m_net_thread;
	wxThread* m_db_thread;
	
	AmeFrame* m_frame;

	AmeJobList* m_jl;
	AmeRules* m_rules;
	AmeDB* m_db;
	AmeOptions *m_opt;
	AdbUserPass *m_up;
};
DECLARE_APP(AmeApp)

#endif //__AME_ID_H