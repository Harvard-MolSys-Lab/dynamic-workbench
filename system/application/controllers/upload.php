<?
class Upload extends Controller {
	function __constructor()
	{
		parent::Controller();
    if(!$this->quickauth->logged_in()) {
      // $this->core->kickout();
    }
	}
	function index() 
	{
	  $user = $this->quickauth->user();
	  if($user) {
	    $config = array();
      $config['upload_path'] = './uploads';
      $config['encrypt_name'] = TRUE;
	    $this->load->library('upload',$config);
	    $this->load->library('zend','Zend/Json');
      if($this->upload->do_upload('userfile')) {
          $data = $this->upload->data();
          $json = json_encode(array(
            'success' => TRUE,
            'fileName' => $data['full_path'],
            'fileSize' => $data['file_size']
          ));
      } else {
        $json = json_encode(array(
          'success' => FALSE,
          'error' => $this->upload->display_errors()
        ));  
      }
      $this->output->set_output($json);
		//   		// Load resources
		//   		$this->load->model('Workspace_model');
		//   		$this->load->library('core');
		//   		
		//   		// Read and return results
		//   		$result = $this->Workspace_model->read($user->id);
		//       if(count($result)>0) {
		//         $json = $result[0]['data'];
		//       } else {
		//         $json = json_encode(array(
		//           'wtype'=>'Workspace'
		//         ));
		//       }

    }
  }
}	

?>
