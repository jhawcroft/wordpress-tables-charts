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


function JHTableEditor()
{
}

JHTableEditor._editor = null;

JHTableEditor.KEY_TAB = 9;


JHTableEditor._event_coords = function(in_event)
{
	return [in_event.pageX, in_event.pageY];
}


JHTableEditor._drag_begin = function(in_event, in_handler, in_finisher)
{
	this._drag_start = this._event_coords(in_event);
	this._drag_handler = in_handler;
	this._drag_finisher = in_finisher;
	
	this._on_drag_continue = this._drag_continue.bind(this);
	this._on_drag_finish = this._drag_finish.bind(this);
	document.addEventListener('mousemove', this._on_drag_continue);
	document.addEventListener('mouseup', this._on_drag_finish);
}


JHTableEditor._drag_continue = function(in_event)
{
	this._drag_end = this._event_coords(in_event);
	this._drag_handler(this._drag_end[0] - this._drag_start[0], this._drag_end[1] - this._drag_start[1], in_event.target);
}


JHTableEditor._drag_finish = function(in_event)
{
	document.removeEventListener('mousemove', this._on_drag_continue);
	document.removeEventListener('mouseup', this._on_drag_finish);
	
	if (this._drag_finisher) this._drag_finisher(in_event.target);
}



JHTableEditor._column_resize = function(in_event)
{
	var column_header = in_event.target.parentElement;
	var start_width = column_header.clientWidth;
	this._drag_begin(in_event, function(in_dx, in_dy, in_target)
	{
		column_header.style.width = start_width + in_dx + 'px';
	});
}


JHTableEditor._update_multi_edge_select = function(in_type, in_from, in_to)
{
	this.select_none();
	for (var index = in_from; index <= in_to; index++)
	{
		if (in_type == 'col') this._select_column(index);
		else this._select_row(index);
	}
}


JHTableEditor._cell_type_id = function(in_cell)
{
	var ident = this._cell_identity(in_cell);
	return [ident[1] == 0 ? 'col' : 'row', ident[1] == 0 ? ident[0] : ident[1]]; 
}


JHTableEditor._handle_multi_edge_select = function(in_event)
{
	this.select_none();
		
	var target = in_event.target;
	this._selector_begin = this._cell_type_id(target);//.target.id.split(',');
	this._selector_end = ['', this._selector_begin[1]];
	this._update_multi_edge_select(this._selector_begin[0], this._selector_begin[1], this._selector_begin[1]);
	
	this._drag_begin(in_event, function(in_dx, in_dy, in_target)
	{
		if (!in_target.classList.contains('sel')) return;
		var selector_end = this._cell_type_id(in_target);//in_target.id.split(',');
		if (selector_end[0] != this._selector_begin[0]) return;
		if (selector_end[1] == this._selector_end[1]) return;
		this._selector_end = selector_end;
		
		if (this._selector_end[1] >= this._selector_begin[1])
			this._update_multi_edge_select(this._selector_begin[0], this._selector_begin[1], this._selector_end[1]);
		else
			this._update_multi_edge_select(this._selector_begin[0], this._selector_end[1], this._selector_begin[1]);
	});
}


JHTableEditor._cell_identity = function(in_cell)
{
	if (in_cell.nodeName != 'TD')
		throw new Error('Not a table cell');
	
	/* identify the row index */
	var tr = in_cell.parentElement;
	var row_index = -1;
	while (tr != null)
	{
		row_index += (tr.rowspan ? tr.rowspan : 1);
		tr = tr.previousElementSibling;
	}
	
	/* identify the column index */
	var td = in_cell;
	var col_index = -1;
	while (td != null)
	{
		col_index += (td.colspan ? td.colspan : 1);
		td = td.previousElementSibling;
	}
	
	return [col_index, row_index];
}


JHTableEditor._select_cell_range = function(in_from, in_to)
{
	this.select_none();
	
	var left = Math.min(in_from[0], in_to[0]);
	var top = Math.min(in_from[1], in_to[1]);
	var right = Math.max(in_from[0], in_to[0]);
	var bot = Math.max(in_from[1], in_to[1]);
	
	for (var row = top; row <= bot; row++)
	{
		var tr = this._body.children[row];
		for (var col = left; col <= right; col++)
		{
			var td = tr.children[col];
			
			this._selected_cells.push(td);
			td.classList.add('act');
		}
	}
}


JHTableEditor._end_edits = function()
{
	if (!this._editing_cell) return;
	this._editing_cell.contentEditable = false;
	this._editing_cell = null;
	if (document.activeElement) document.activeElement.blur();
	if (window.getSelection && window.getSelection().removeAllRanges) 
		window.getSelection().removeAllRanges();
}


JHTableEditor._edit_cell = function(in_cell)
{
	this._end_edits();
	this._editing_cell = in_cell;
	in_cell.classList.remove('act');
	in_cell.contentEditable = true;
	in_cell.focus();
	document.execCommand('selectAll',false,null);
}


JHTableEditor._handle_multi_cell_select = function(in_event)
{
	this.select_none();

	var target = in_event.target;
	this._cell_begin = this._cell_identity(target);
	this._cell_end = target;
	this._multi_select_occurred = false;
	
	this._selected_cells.push(target);
	this._set_show_selected(this._selected_cells, true);
	
	this._drag_begin(in_event, 
	function(in_dx, in_dy, in_target)
	{
		if (in_target.nodeName != 'TD' || in_target.classList.contains('sel')) return;
		if (in_target === this._cell_end) return;
		this._cell_end = in_target;
		this._multi_select_occurred = true;
		this._select_cell_range(this._cell_begin, this._cell_identity(this._cell_end));
	},
	function(in_target)
	{
		if (in_target.nodeName != 'TD' || in_target.classList.contains('sel')) return;
		if (!JHTableEditor._multi_select_occurred)
			JHTableEditor._edit_cell(in_target);
	});
}


JHTableEditor._mousedown = function(event)
{
	var target = event.target;
	if (target.classList.contains('corner'))
		this.select_none();
	else if (target.classList.contains('rsz'))
		this._column_resize(event);
	else if (target.classList.contains('sel'))
		this._handle_multi_edge_select(event);
	else if (target.nodeName == 'TD')
		this._handle_multi_cell_select(event);
}


JHTableEditor._column_cells = function(in_column_index)
{
	var result = [];
	var rows = this._body.children;
	if (in_column_index < 1 || in_column_index > rows[0].children.length) 
		throw new Error('Invalid column index ' + in_column_index);
	var row_count = rows.length;
	for (var r = 1; r < row_count; r++)
		result.push( rows[r].children[in_column_index] );
	return result;
}


JHTableEditor._row_cells = function(in_row_index)
{
	var result = [];
	var rows = this._body.children;
	if (in_row_index < 1 || in_row_index > rows.length) 
		throw new Error('Invalid row index ' + in_row_index);
	var row = rows[in_row_index].children;
	var col_count = row.length;
	for (var c = 1; c < col_count; c++)
		result.push( row[c] );
	return result;
}


JHTableEditor.select_none = function()
{
	this._set_show_selected(this._selected_cells, false);
	this._selected_cells.length = 0;
	this._selected_edges = false;
	this._end_edits();
}


JHTableEditor._set_show_selected = function(in_cells, in_selected)
{
	for (var c = 0; c < in_cells.length; c++)
		in_cells[c].classList.toggle('act', in_selected);
}


JHTableEditor._select_column = function(in_column_index)
{
	this._selected_cells = this._selected_cells.concat( this._column_cells(in_column_index) );
	this._set_show_selected(this._selected_cells, true);
	this._selected_edges = true;
}


JHTableEditor._select_row = function(in_row_index)
{
	this._selected_cells = this._selected_cells.concat( this._row_cells(in_row_index) );
	this._set_show_selected(this._selected_cells, true);
	this._selected_edges = true;
}


JHTableEditor.get_row_count = function()
{
	return this._body.children.length - 1;
}


JHTableEditor.get_column_count = function()
{
	var row = this._body.children[0].children;
	var v_count = row.length;
	var count = 0;
	for (var c = 1; c < v_count; c++)
		count += (row[c].colspan ? row[c].colspan : 1);
	return count;
}


JHTableEditor._delete_columns = function(in_from, in_to)
{
	if (in_from == 1 && in_to == this.get_column_count())
	{
		this.error("Can't delete the last column of the table.");
		return;
	}
	
	var count = in_to - in_from + 1;
	var rows = this._body.children;
	var row_count = rows.length;
	for (var r = 0; r < row_count; r++)
	{
		var row = rows[r];
		for (var c = 0; c < count; c++)
			row.removeChild(row.children[in_from]);
	}
}


JHTableEditor._delete_rows = function(in_from, in_to)
{
	if (in_from == 1 && in_to == this.get_row_count())
	{
		this.error("Can't delete the last row of the table.");
		return;
	}
	
	var count = in_to - in_from + 1;
	var rows = this._body.children;
	for (var r = 0; r < count; r++)
		this._body.removeChild(rows[in_from]);
}


JHTableEditor.insert_rows = function(in_count, in_after, in_rel_row)
{
	if (in_rel_row === undefined)
	{
		in_rel_row = this.get_row_count();
		in_after = true;
	}
	
	var col_count = this.get_column_count() + 1;
	for (var r = 0; r < in_count; r++)
	{
		var tr = document.createElement('tr');
		for (var c = 0; c < col_count; c++)
		{
			var td = document.createElement('td');
			td.innerHTML = '<br>';
			if (c == 0) td.classList.add('sel');
			tr.appendChild(td);
		}
		this._body.appendChild(tr);
	}
}


JHTableEditor.insert_columns = function(in_count, in_after, in_rel_col)
{
	if (in_rel_col === undefined)
	{
		in_rel_col = this.get_column_count();
		in_after = true;
	}
	
	var row_count = this.get_row_count() + 1;
	for (var r = 0; r < row_count; r++)
	{
		var tr = this._body.children[r];
		for (var c = 0; c < in_count; c++)
		{
			var td = document.createElement('td');
			if (r != 0)
				td.innerHTML = '<br>';
			else
			{
				td.classList.add('sel');
				td.innerHTML = '<div class="rsz"></div>';
			}
			tr.appendChild(td);
		}
	}
}


JHTableEditor.delete_selection = function()
{
	if (!this._selected_edges) return;
	var start = this._selector_begin[1];
	var end = this._selector_end[1];
	var type = this._selector_begin[0];
	if (start > end)
	{
		start = this._selector_end[1];
		end = this._selector_begin[1];
	}
	
	if (type == 'col') this._delete_columns(start * 1, end * 1);
	else this._delete_rows(start * 1, end * 1);
}


JHTableEditor._next_cell = function(in_cell)
{
	var td = in_cell.nextElementSibling;
	if (!td)
	{
		var tr = in_cell.parentElement.nextElementSibling;
		if (!tr) td = null;
		else td = tr.children[1];
	}
	if (!td) return in_cell;
	return td;
}


JHTableEditor._prev_cell = function(in_cell)
{
	var td = in_cell.previousElementSibling;
	if (td.classList.contains('sel'))
	{
		var tr = in_cell.parentElement.previousElementSibling;
		td = tr.children[tr.children.length-1];
	}
	if (td.classList.contains('sel')) td = null;
	if (!td) return in_cell;
	return td;
}


JHTableEditor._keydown = function(in_event)
{
	if (in_event.keyCode == this.KEY_TAB && this._editing_cell)
	{
		var cell = this._editing_cell;
		this._end_edits();
		if (!in_event.shiftKey) cell = this._next_cell(cell);
		else cell = this._prev_cell(cell);
		if (cell) this._edit_cell(cell);
		
		in_event.preventDefault();
		in_event.stopPropagation();
	}
}


JHTableEditor._ready_save = function(in_event)
{
	this._end_edits();
	var content_element = document.getElementById('post_content');
	
	var output = [];
	
	var rows = this._body.children;
	var row_count = rows.length;
	for (var r = 1; r < row_count; r++)
	{
		var row = rows[r].children;
		var col_count = row.length;
		var output_row = [];
		
		for (var c = 1; c < col_count; c++)
		{
			var cell = row[c];
			
			output_row.push( {
				value: cell.innerHTML
			} );
		}
		
		output.push(output_row);
	}
	
	content_element.value = JSON.stringify(output);
}


JHTableEditor._load = function()
{
	//<table id="edited-table"><tbody></tbody></table>
	
	/* zap any previous table */
	this._editor.innerHTML = '';
	
	/* create the basic editor elements; row and column selectors and a blank table */
	var editor_elements = new DocumentFragment();
	
	var selectors_col = document.createElement('table');
	selectors_col.classList.add('table-editor-selectors');
	selectors_col.id = 'table-editor-col-selectors';
	selectors_col.innerHTML = '<tbody><tr><td></td><td>A<div></div></td></tr></tbody>';
	editor_elements.appendChild(selectors_col);
	
	var selectors_row = document.createElement('table');
	selectors_row.classList.add('table-editor-selectors');
	selectors_row.id = 'table-editor-row-selectors';
	selectors_row.innerHTML = '<tbody><tr><td>1</td></tr></tbody>';
	editor_elements.appendChild(selectors_row);
	
	var table = document.createElement('table');
	table.id = 'edited-table';
	table.innerHTML = '<tbody><tr><td><br></td></tr></table>';
	editor_elements.appendChild(table);
	
	this._editor.appendChild(editor_elements);
	
	selectors_row.style.top = selectors_col.clientHeight -1 + 'px';
	table.style.left = selectors_row.clientWidth -1 + 'px';
	table.style.top = selectors_col.clientHeight -1 + 'px';
	
	return; // debugging


/* load the actual table structure */

	var content_element = document.getElementById('post_content');
	var temp = document.createElement('div');
	temp.innerHTML = content_element.value;
	
	var body = temp.children[0].children[0];
	var rows = body.children;
	var row_count = rows.length;
	var col_count = 0;
	for (var r = 0; r < row_count; r++)
	{
		var row = rows[r];
		var row_selector = document.createElement('td');
		row_selector.classList.add('sel');
		//row_selector.id = 'row,'+(r+1);
		row.insertBefore(row_selector, row.children[0]);
		
		col_count = Math.max(col_count, row.children.length);
	}
	
	var column_selectors = document.createElement('tr');
	for (var c = 0; c < col_count; c++)
	{
		var column_selector = document.createElement('td');
		column_selector.classList.add('sel');
		//column_selector.id = 'col,'+c;
		if (c == 0) column_selector.classList.add('corner');
		if (c > 0) 
		{
			var dragger = document.createElement('div');
			dragger.classList.add('rsz');
			column_selector.appendChild(dragger);
		}
		column_selectors.appendChild(column_selector);
	}
	body.insertBefore(column_selectors, rows[0]);
	
	this._table.appendChild(body);
	this._body = body;
}


JHTableEditor.error = function(in_message)
{
	var p = document.createElement('p');
	p.textContent = in_message;
	var alert = document.getElementById('table-editor-error');
	alert.innerHTML = '';
	alert.appendChild(p);
	alert.style.display = 'block';
}


JHTableEditor._add_event_listeners = function()
{
	this._editor.addEventListener('mousedown', this._mousedown.bind(this));
	this._editor.addEventListener('keydown', this._keydown.bind(this));
	
	document.forms['post'].addEventListener('submit', JHTableEditor._ready_save.bind(this));
	document.getElementById('post-preview').addEventListener('click', JHTableEditor._ready_save.bind(this));
	
	var alert = document.getElementById('table-editor-error');
	alert.addEventListener('click', function() { 
		document.getElementById('table-editor-error').style.display = 'none'; });
}


JHTableEditor._screen_resized = function()
{
	this._editor.style.height = window.innerHeight * 0.5 + 'px';
}


JHTableEditor.init = function()
{
	if (this._editor) return;
	
	this._editor = document.getElementById('table-editor');
	//this._table = this._editor.children[0];
	//this._body = this._table.children[0];
	
	this._load();
	
	this._selected_cells = [];
	
	this._editing_cell = null;
	
	this._screen_resized();
	
	JHTableEditor._add_event_listeners();
}




