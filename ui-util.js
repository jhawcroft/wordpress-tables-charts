/*
JH Data Tables
Copyright (c) 2015, Joshua Hawcroft
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


function JHUIUtils() {}


JHUIUtils._popup_zindex = function()
{
	return 1000000;
}


JHUIUtils._popoff = function()
{
	if (this._popup_element)
	{
		this._popup_element.visibility = 'hidden';
		if (this._popup_remove) 
			this._popup_element.parentElement.removeChild(this._popup_element);
		this._popup_element = null;
	}
	this._popup_cover.parentElement.removeChild(this._popup_cover);
}


JHUIUtils.popup = function(in_element)
{
	if (!this._popup_cover)
	{
		var cover = this._popup_cover = document.createElement('div');
		cover.style.display = 'block';
		cover.style.position = 'fixed';
		cover.style.zIndex = this._popup_zindex();
		cover.style.width = '100%';
		cover.style.left = 0;
		cover.style.top = 0;
		cover.style.height = window.innerHeight + 'px';
		//cover.style.backgroundColor = 'black';
		//cover.style.opacity = 0.5;
		
		this._popup_cover.addEventListener('mousedown', JHUIUtils._popoff.bind(this), true);
	}
	document.body.appendChild(this._popup_cover);
	
	this._popup_element = in_element;
	if (in_element) 
	{
		in_element.style.zIndex = this._popup_cover.style.zIndex + 1;
		if (!in_element.parentElement)
		{
			this._popup_remove = true;
			document.body.appendChild(in_element);
		}
		else this._popup_remove = false;
		in_element.visibility = 'visible';
	}
	
	return in_element;
}


JHUIUtils.position_down_from = function(in_popup, in_button)
{
	var rect = in_button.getBoundingClientRect();
	
	in_popup.style.left = rect.left + 'px';
	in_popup.style.top = rect.bottom - 1 + 'px';
	
	return in_popup;
}


JHUIUtils.popup_menu = function(in_menu_items, in_near_element)
{
	var menu = document.createElement('ul');
	menu.classList.add('jh-popup-menu');
	menu.style.display = 'block';
	menu.style.position = 'fixed';
	
	menu.addEventListener('click', function(in_event)
	{
		JHUIUtils._popoff();
		
		var target = in_event.target;
		if (target.nodeName == 'LI')
		{
			for (var i = 0; i < in_menu_items.length; i++)
			{
				var item = in_menu_items[i];
				if (item._dom == target)
				{
					if (item.handler) item.handler(item);
					break;
				}
			}
		}
	});
	
	for (var i = 0; i < in_menu_items.length; i++)
	{
		var item = in_menu_items[i];
		var dom_item = document.createElement('li');
		
		if (item.title == '')
			dom_item.classList.add('divider');
		else
			dom_item.textContent = item.title;
			
		item._dom = dom_item;
		
		menu.appendChild(dom_item);
	}
	
	JHUIUtils.position_down_from(menu, in_near_element);
	JHUIUtils.popup(menu);
	
	return menu;
}


