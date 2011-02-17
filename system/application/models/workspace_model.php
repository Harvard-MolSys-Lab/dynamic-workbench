<?
class Workspace_model extends Model {
	function __constructor()
	{
		parent::Model();
	}
	function getIdField() {
		return 'id';	
	}
	function getTableName() {
		return 'workspaces';	
	}
	function getFields() {
		return array('id','user_id','data');
	}
	function read($user_id = FALSE) 
	{
		$this->load->database();
		$this->load->library('core');
		$this->load->library('zend','Zend/Json');
		$this->db->where('user_id',$user_id);	
		
		$query = $this->db->get($this->getTableName());
		$result = $query->result_array();
		return $result;
	}
	function save($user_id,$data) {
	  $this->load->database();
    $this->load->library('core');
    $this->load->library('zend','Zend/Json');
    
    $json = json_encode($data);
    $tableData = array(
      'data' => $json
    );
    
    $this->db->from($this->getTableName());
    $this->db->where('user_id',$user_id);
    
    if($this->db->count_all_results() > 0) {
      // update
      $this->db->where('user_id',$user_id);
      $this->db->update($this->getTableName(),$tableData);
    } else {
      // insert
      $tableData['user_id'] = $user_id;
      $this->db->flush_cache();
      $this->db->insert($this->getTableName(),$tableData);
    }
	}
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
