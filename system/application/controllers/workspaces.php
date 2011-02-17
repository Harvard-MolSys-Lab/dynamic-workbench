<?
class Workspaces extends Controller {
	function __constructor()
	{
		parent::Controller();
    if(!$this->quickauth->logged_in()) {
      // $this->core->kickout();
    }
	}
	function load() 
	{
	  $user = $this->quickauth->user();
	  if($user) {
  		// Load resources
  		$this->load->model('Workspace_model');
  		$this->load->library('core');
  		$this->load->library('zend','Zend/Json');
  		
  		// Read and return results
  		$result = $this->Workspace_model->read($user->id);
      if(count($result)>0) {
        $json = $result[0]['data'];
      } else {
        $json = json_encode(array(
          'wtype'=>'Workspace'
        ));
      }
        $this->output->set_header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
		$this->output->set_header("Cache-Control: no-store, no-cache, must-revalidate");
		$this->output->set_header("Cache-Control: post-check=0, pre-check=0", false);
		$this->output->set_header("Pragma: no-cache"); 
		$this->output->set_header("Content-type: application/javascript");
  		$this->output->set_output("App.loadData($json);");
    }
  }
	function save()
	{
	  $user = $this->quickauth->user();
	  if($user) {
  		// Load resources
  		$this->load->model('Workspace_model');
  		$this->load->library('core');
  		$this->load->library('zend','Zend/Json');
  		
  		// Decode and sanitize post
  		$data = json_decode($this->input->post('rows'));
  		
  		// Save data
  		$this->Workspace_model->save($user->id,$data);
  		
  		$json = json_encode(array(
  			'success' => TRUE
  		));
  		$this->output->set_output($json);
    }
	}
}	

?>
