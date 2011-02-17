<?
class User extends Controller {
	function index()
	{
		$this->load->library('zend','Zend/Json');
		if($this->quickauth->logged_in()) {
			$user = $this->quickauth->user();
			$json = json_encode(array(
				'name' => $user->name,
				'id' => $user->id,
				'email' => $user->username
			));
			$this->output->set_header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
			$this->output->set_header("Cache-Control: no-store, no-cache, must-revalidate");
			$this->output->set_header("Cache-Control: post-check=0, pre-check=0", false);
			$this->output->set_header("Pragma: no-cache"); 
			$this->output->set_header("Content-type: application/javascript");
			$this->output->set_output('App.User.setUser('.$json.');');
			
		}
	}
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
