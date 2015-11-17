<?php
/*
Plugin Name: JH Data Tables
Plugin URI: http://joshhawcroft.org/
Description: Create and maintain elegant data tables for presentation of structured information or statistics.
Version: 1.0.0
Author: Josh Hawcroft
Author URI: http://joshhawcroft.org/
License: BSD
License URI: https://opensource.org/licenses/BSD-2-Clause
Text Domain: jh-data-tables
*/

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

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

$base = plugin_dir_path( __FILE__ ) . '/';

require_once( $base . 'data-tables.class.php' );

add_action( 'init', array( 'JHDataTables', 'init' ) );

register_activation_hook( __FILE__, array( 'JHDataTables', 'install' ));

if ( is_admin() ) 
{
	require_once( $base . 'data-tables-admin.class.php' );
	require_once( $base . 'manage-list.class.php' );
	
	add_action( 'init', array( 'JHDataTablesAdmin', 'init' ) );
}


