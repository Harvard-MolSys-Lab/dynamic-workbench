<?
class Field extends DataMapper {
	
  public static $meta = array('id','name','type','isPrimitive');
    
  public $table = 'fields';
  public $auto_populate_has_many = TRUE;
  public $has_one = array('type','object');

    
	function Field()
	{
		parent::DataMapper();
	}
  
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
