<?php
/*
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

class JHDataTablesAdmin
{
	public static function init()
	{
		/* check if recently activated, and finish the activation process */
		if ( get_option( 'Activated_Plugin' ) == 'jh-data-tables' ) 
		{
			delete_option( 'Activated_Plugin' );

			// eg. flush the perma-link structure
			global $wp_rewrite;
	  		$wp_rewrite->flush_rules( true );
		}
		
		wp_register_style( 'jh-data-tables-admin-css', plugins_url('admin.css', __FILE__) );
		wp_register_script( 'jh-data-tables-admin-js', plugins_url('admin.js', __FILE__) );
		add_action( 'admin_enqueue_scripts', array('JHDataTablesAdmin', 'admin_scripts') );
	
		add_action( 'add_meta_boxes', array('JHDataTablesAdmin', 'add_table_editor') );
		add_action( 'save_post', array('JHDataTablesAdmin', 'save_table') );
		//add_action('admin_menu', array('JHDataTablesAdmin', 'add_admin_menus'));
	}
	
	
	public static function admin_scripts()
	{
		wp_enqueue_script( 'jh-data-tables-admin-js' );
		wp_enqueue_style( 'jh-data-tables-admin-css' );
	}
	
	
	
	public static function add_table_editor()
	{
		 add_meta_box(
			'jh-data-table-editor',      // Unique ID
			esc_html__( 'Table Editor', 'example' ),    // Title
			array('JHDataTablesAdmin', 'render_table_editor'),   // Callback function
			'jh-data-table',         // Admin page (or post type)
			'normal',         // Context
			'default'         // Priority
		  );
		add_action( 'admin_print_styles-' . $page, 'my_plugin_admin_styles' );
		
	}
	
	
	
	// needs sanitisation, etc.  ******
	public static function save_table($in_post_id) // also, this gets called on new
	{
		$content = stripslashes($_POST['post_content']);
		/*
		if ($content == '') return;
		
		$table_data = json_decode(stripslashes($_POST['post_content']), true);
		if ($table_data === null) wp_die('Failed to get table data from client.');
		
		$html = '<table class="JHChartTable"><tbody>';
		foreach ($table_data as $table_row)
		{
			$html .= '<tr>';
			foreach ($table_row as $table_column)
			{
				$html .= '<td>'.$table_column['value'].'</td>';
			}
			$html .= '</tr>';
		}
		$html .= '</tbody></table>';*/
		
		remove_action( 'save_post', array('JHDataTablesAdmin', 'save_table') );
		wp_update_post( array( 'ID' => $in_post_id, 'post_content' => $content ) );
		add_action( 'save_post', array('JHDataTablesAdmin', 'save_table') );
	}
	
	
	public static function render_table_editor($in_post)
	{
		
	?>
	
<div id="table-editor-toolbar">
	<input type="text" value="1" id="add-column-count" style="width: 40px;"> <input type="button" class="button" value="Add Columns" onclick="JHTableEditor.insert_columns(document.getElementById('add-column-count').value);">
	<input type="button" class="button" value="Add Rows" onclick="JHTableEditor.insert_rows(document.getElementById('add-column-count').value);">
	<input type="button" class="button" value="Delete Rows" onclick="JHTableEditor.delete_selected_rows()">
	<input type="button" class="button" value="Delete Columns" onclick="JHTableEditor.delete_selected_columns()">
</div>

<div class="error notice" id="table-editor-error" style="display: none;">
    <p></p>
</div>
	
<div id="table-editor"></div>

<textarea name="post_content" id="post-content" style="display: none; width: 400px; height: 200px"><?php 

$content = get_post_field('post_content', $in_post->ID, 'raw');
if ($content == '')
	$content = '<table><tbody><tr><td><br></td></tr></tbody></table>';
print $content; 

?></textarea>


<script type="text/javascript">
JHTableEditor.init();
/*
$(document).ready(function() {
    $('#publish').one('click', function( event ) {
        event.preventDefault();
        var postID=$('#post_ID').attr('value');
        alert(postID);
        $.ajax({
                url:"/wp-admin/spracovanie.php",
                method: "GET",
                data: {clanok: <?php echo $post_id;?>},
                success: function(data) {
                    alert(data);
                    // Now trigger click on button again
                    $('#publish').trigger( "click" );
                }
        });
    });
});*/
</script>
	
<?php
	}
	
	
	
	public static function add_admin_menus()
	{
	/*
		add_menu_page( 'JH Data Tables', 'JH Data Tables', 'edit_pages', 'jh-data-tables', array('JHDataTablesAdmin', 'render_manage'), 'dashicons-analytics', '25.19830919' );
		
		add_submenu_page( 'jh-data-tables', 'Manage Tables', 'Manage Tables', 'edit_pages', 'jh-data-tables', array('JHDataTablesAdmin', 'render_manage') );
		add_submenu_page( 'jh-data-tables', 'Add New', 'Add New Table', 'edit_pages', 'jh-data-tables-add', array('JHDataTablesAdmin', 'render_add_new') );
		*/
	}
	
	
	public static function render_manage()
	{
	// abstract the creation of the admin page with my own wrapper around the stupid WordPress API **
	// eventually - get it basically looking right first
	
		if (!current_user_can('edit_pages'))
			wp_die( __('You do not have sufficient permissions to access this page.') );
			
		//$list = new JHDataTablesList();
		//$list->prepare_items();
		
		?><div class="wrap">
		
<h2><?php print __( 'Manage Tables', 'jh-resource-collection' ); ?></h2>

<form name="JHResourceCollectionAdmin" method="post" action="">
<input type="hidden" name="<?php echo $hidden_field_name; ?>" value="Y">
<input type="hidden" name="page" value="<?php echo $_REQUEST['page'] ?>">

<?php //$list->display() ?>

<!--<p class="submit">
<input type="submit" name="Submit" class="button-primary" value="<?php esc_attr_e('Save Changes') ?>" />
</p>-->

</form>
</div><?php
	}
	
	
	public static function render_add_new()
	{
	
	}
	
	
	
};


