<?
class Type extends DataMapper {
	  
  var $table = 'objects';
  var $auto_populate_has_many = TRUE;
  var $has_many = array('field');
//var $has_one = array('type');

    
	function Type()
	{
		parent::DataMapper();
	}
	
  /**
   * _prepare_for_query
   *
   * Set where() clause to pull only types
   *
   * @access  public
   * @return  void
   */
  function _prepare_for_query() {
    //$type = empty($this->type) ? 'type' : $this->type;
    //$this->where('type', $type);
  }
  
  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   *                                                                   *
   * Overload methods                                                  *
   *                                                                   *
   * The following are methods that overload the default               *
   * functionality of DataMapper.                                      *
   *                                                                   *
   * It is necessary for self referencing relationships.               *
   *                                                                   *
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


  // --------------------------------------------------------------------

  /**
   * Get (overload)
   *
   * Get type objects.
   *
   * @access  public
   * @param int or array
   * @return  bool
   */
  function get($limit = NULL, $offset = NULL)
  {
    $this->_prepare_for_query();
    
    return parent::get($limit, $offset);
  }

  // --------------------------------------------------------------------

  /**
   * Count (overload)
   *
   * Returns the total count of the objects records.
   * If on a related object, returns the total count of related objects records.
   *
   * @access  public
   * @param int or array
   * @return  bool
   */
  function count()
  {
    if (empty($this->parent))
    {
      $this->_prepare_for_query();
    }

    return parent::count();
  }
  
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
