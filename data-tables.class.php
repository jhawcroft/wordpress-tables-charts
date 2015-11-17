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

class JHDataTables
{
	public static function init()
	{
		
		JHDataTables::setup_custom_post_type();
	}
	
	public static function setup_custom_post_type()
	{
		register_post_type( 'jh-data-table',
			array(
			  'labels' => array(
				'name' => __( 'JH Data Tables' ),
				'singular_name' => __( 'JH Data Table' ),
				'all_items' => __( 'Manage Tables' )
			  ),
			  'public' => true,
			  'has_archive' => true,
			  'menu_icon' => 'dashicons-analytics',
			  'rewrite' => array('slug' => 'data-tables'),
			)
		);
	  	remove_post_type_support('jh-data-table', 'editor');
	  	
	  	//global $wp_rewrite;
	  	//$wp_rewrite->flush_rules( true );  ought to be called at plug-in activation, 
	  	// after registration of custom post types, etc. as this is an expensive call
	}
	
	
	public static function install()
	{
	
		
		add_option( 'Activated_Plugin', 'jh-data-tables' );
	}
	
	
	
	
};


