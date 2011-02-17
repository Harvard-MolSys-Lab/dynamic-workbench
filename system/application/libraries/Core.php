<?php

$FP_SCRAPE_SITES = FALSE;

/*
// Allow Zend to find itself
set_include_path(
	'/library' 
    . PATH_SEPARATOR . get_include_path()
);
*/

// require_once '/flowpro/system/application/helpers/simplehtmldom/simple_html_dom.php';
// require_once 'library/Zend/Json.php';
// require_once 'config/config.php';
// require_once 'config/database.php';
// require_once 'config/sites.php';

class CI_Core {
	
	var $CI;
	
	function __construct() {
		$this->CI =& get_instance();
    
	}
	
	/*********************************/
	/* Debugging and Error Reporting */
	/*********************************/
	
	function debug($message,$field="") {
		echo "<div style='border:solid 1px silver;background-color:#efefef;'><strong>$field:</strong>$message</div>";
	}
	
	function debugVar(&$var) {
		echo '<pre>';
		var_dump($var);
		echo '</pre>';
	}
	
	function error($message) {
		global $error;
		$error.=$message."\n";
	}
	
	function reportErrors() {
		global $error;
		echo "<div class='error'>$error</div>";
	}
	
	function reportSuccess($message) {
		echo "<div class='success'>$message</div>";
	}
	
	/*********************************/
	/* Configuration                 */
	/*********************************/
	
	function configureCards() {	
	}
	
	/*********************************/
	/* ORM			                 */
	/*********************************/
	
	function buildUpdateArray($post,$fields) {
		$updateArray = array();
		foreach($fields as $field) {
			if(isset($post->$field)) {
				$updateArray[$field] = $this->CI->input->xss_clean($post->$field);	
			}
		}
		return $updateArray;
	}
	
	/*********************************/
	/* Core Database access          */
	/*********************************/
	
	 function connect() {
		global $connection, $db_server, $db_user, $db_password, $db;
	 	if($connection==FALSE) {
			$connection = mysql_connect( $db_server, $db_user, $db_password );
	  	}
		if(!$connection) {
			error("Couldn't connect to MySQL server.");
		} elseif(isset($connection)) {
			if(!mysql_select_db($db,$connection)) {
				error(mysql_error());
			}
		}
	  	return $connection;
	 }
	 
	 function runDBscript($script,$db=FALSE) {
	 	// Check if the provided script exists. Exit on failure.
		if(file_exists($script)) {
			$file = file_get_contents($script);
			
			// Split the queries into statements
			$queries = explode(';',$file);
			
			// Attempt to connect to the DB;
			$connection = connect();
			
			// If there was a specific database indicated 
			if($db!=FALSE) {
				// Try selecting the database. Exit on failure
				if(!mysql_select_db($db)) {
					error("Couldn't execute SQL script <code>$script</code>: <code>".mysql_error()."</code>");
					return FALSE;
				}
			}
			
			// Iterare through the individual statements, executing each one
			for($i=0,$l=count($queries);$i<$l;$i++) {
				// Pull the statement
				$query = $queries[$i];
				
				// Trim whitespace
				$query = trim($query);
				
				// Ditch an empty string query so MySQL doesn't complain
				if($query == '') {
					unset($query);
				}
				
				// If a query is found, attempt to execute it. Exit on failure.
				if(isset($query)) {
					$result = mysql_query($query,$connection);
					if(!$result) {
						error("Couldn't execute SQL script statement:<pre>$query</pre> in script <code>$script</code>: <code>".mysql_error()."</code>");
						return FALSE;
					}
				}
			}
		} else {
			error("Couldn't execute SQL script: $script couldn't be found.");
			return FALSE;
		}
		return TRUE;
	 }
	
}


function exception_error_handler($errno, $errstr, $errfile, $errline ) {
    debug_print_backtrace();  
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
}
set_error_handler("exception_error_handler");
    
?>