<?
class Stack_model extends Model {
	function __constructor()
	{
		parent::Model();
	}
	function getIdField() {
		return 'stackId';	
	}
	function getTableName() {
		return 'stackss';	
	}
	function getFields() {
		return array('stackName','stackText');
	}
	function read($id = FALSE) 
	{
		$this->load->database();
		$this->load->library('core');
		$this->load->library('zend','Zend/Json');
		$this->load->database();
		if($id) {
			$this->db->where($this->getIdField(),$id);	
		}
		$query = $this->db->get($this->getTableName());
		$result = $query->result_array();
		return $result;
	}
	function readWhere($conditions) 
	{
		$this->load->database();
		$this->load->library('core');
		$this->load->library('zend','Zend/Json');
		$this->load->database();
		foreach($conditions as $key => $value) {
			if(isset($key) && isset($value)) {
				if(is_array($value)) {
					$this->db->where_in($key,$value);	
				} else {
					$this->db->where($key,$value);	
				}
			}
		}
		$this->db->order_by($this->getIdField(),'ASC');
		//$this->db->order_by('number','ASC');
		$query = $this->db->get($this->getTableName());
		$result = $query->result_array();
		return $result;
	}
	function create($data)
	{
		$this->load->database();
		$this->db->insert($this->getTableName(), $data);
	}
	function update($id,$data) 
	{
		$this->load->database();
		$this->db->where($this->getIdField(),$id);
		$this->db->update($this->getTableName(),$data);
	}
	function destroy($id)
	{
		$this->load->database();
		$this->db->where($this->getIdField(),$id);
		$this->db->delete($this->getTableName());
	}
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
