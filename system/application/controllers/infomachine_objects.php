<?
class Infomachine_objects extends Controller {
	function __constructor()
	{
		// $this->load->model('Card_model');
		parent::Controller();
	}
	function index() {
	}
  function _copy_object_to_array($obj_src,&$arr_targ,$fields_arr) {
    foreach($fields_arr as $prop) {
      $arr_targ[$prop] = $obj_src->$prop;  
    }
  }
  function _copy_array_to_object($arr_src,&$obj_targ,$fields_arr) {
    foreach($fields_arr as $prop) {
      $obj_targ->$prop = $arr_src[$prop];  
    } 
  }
  function load() 
  {
    // Load resources
    $this->load->library('core');
    $this->load->library('zend','Zend/Json');
    
    
    $object_meta_properties = Object::$meta;
    $field_meta_properties = Field::$meta;
    $types_out = array();
    $message = '';
    $success = TRUE;
    
    /**
     * Fetch types
     */
    $t = new Object();
    //$t->get_where(array('user_id' => $this->quickauth->user()->id));
    $t->get_where("type = 'Type'");
    
    // copy relevant properties of each type
    foreach($t->all as $type_obj) {
      $type_out = array();
      $fields_out = array();
      $data_out = array();
      
      
      // copy metaprops
      $this->_copy_object_to_array($type_obj,&$type_out,$object_meta_properties);
      //$this->core->debugVar($t->field);      
      
      $this->core->debugVar($t->field->all);
      
      // copy field metadata and values
      foreach($type_obj->field->all as $field_obj) {
        
        // copy field metadata to fields metaprop array
        $field_out = array();
        $this->_copy_object_to_array($field_obj,&$field_out,$field_meta_properties);
        if(!$field_out['isPrimitive']) {
          $field_out['infomachine_type'] = $field_out['type'];
          $field_out['type'] = 'infomachine_type';
        }
        $fields_out[] = $field_out;
        
        // copy field value to data metaprop array
        $data_out[$field_obj->name] = $field_obj->value;
      }
      $type_out['fields'] = $fields_out;
      $type_out['data'] = $data_out;
      
      $types_out[] = $type_out;
    }
    

    /**
     * Fetch objects
     */    
    $o = new Object();
    //$o->get_where(array('user_id' => $this->quickauth->user()->id));
    $o->where('type !=','Type');
    $o->get();
    
    $objs_out = array();
    foreach($o->all as $obj) {
      $obj_out = array();
      $fields_out = array();
      $data_out = array();
      
      // copy
      $this->_copy_object_to_array($obj,&$obj_out,$object_meta_properties);
      
      // copy field metadata and values
      foreach($obj->field->all as $field_obj) {
        // copy field metadata to fields metaprop array
        $field_out = array();
        $this->_copy_object_to_array($field_obj,&$field_out,$field_meta_properties);
        $fields_out[] = $field_out;
        
        // copy field value to data metaprop array
        $data_out[$field_obj->name] = $field_obj->value;
      }
      $obj_out['fields'] = $fields_out;
      $obj_out['data'] = $data_out;
      
      $objs_out[] = $type_out;
    }
    
    
    $result = array(
      'types' => $types_out,
      'objects' => $objs_out,
      'message' => $message,
      'success' => $success
    );
    $json =json_encode($result);
    $this->output->set_output($json);
  }
	function create() {
	  
	  // Load resources
    $this->load->library('core');
    $this->load->library('zend','Zend/Json');
    
    // Decode and sanitize post
    $o = new Object();
    $post = json_decode($this->input->post('rows'));
    
    // only copy relevant properties
    $this->_copy_array_to_object($post,$o,Object::$meta);
    $fields = array();
    
    // copy fields
    foreach($post['fields'] as $key => $value) {
      $field = new Field();
      
      // only copy relevant properties from field metadata
      $this->_copy_array_to_object($value,$field,Field::$meta);
      
      // copy object data
      $field['value'] = $post['data'][$key];
      
      // append to array
      $fields[] = $field;
    }
    
    // commit to the DB
    $o->save($fields);
    
    // send ID for un-phantoming
    $post['id'] = $this->db->insert_id();
    $json = json_encode(array(
    
      // TODO: Error handling
      'success' => TRUE,
      'rows' => $post,
      'results' => 1//count($result)
    ));
    $this->output->set_output($json);
	}
  function update() {
        
    // Load resources
    $this->load->library('core');
    $this->load->library('zend','Zend/Json');
    
    // Decode and sanitize post
    $o = new Object();
    $post = json_decode($this->input->post('rows')); // TODO: allow listful updating?
    $o->where('id', $post['id']);
    
    // only copy relevant properties
    $this->_copy_array_to_object($post,$o,Object::$meta);
    $fields = array();
    
    // copy fields
    foreach($post['fields'] as $key => $value) {
      $field = new Field();
      
      // only copy relevant properties from field metadata
      $this->_copy_array_to_object($value,$field,Field::$meta);
      
      // copy object data
      $field['value'] = $post['data'][$key];
      
      // append to array
      $fields[] = $field;
    }
    
    // commit to the DB
    $o->save($fields);
    
    // encode response
    $json = json_encode(array(
      'success' => TRUE,

      // TODO: full record construction necessary?
      'rows' => $post,
      'results' => 1//count($result)
    ));
    $this->output->set_output($json);
    
  }
  function destroy() {
    // Load resources
    $this->load->library('core');
    $this->load->library('zend','Zend/Json');
    
    // Decode and sanitize post
    $o = new Object();
    $post = json_decode($this->input->post('rows')); // TODO: allow listful updating?
    $o->where('id', $post['id'])->get()->delete();
    
    // encode response
    $json = json_encode(array(
      'success' => TRUE,

      // TODO: full record construction necessary?
      'rows' => array(),
      'results' => 0//count($result)
    ));
    $this->output->set_output($json);
  }
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
