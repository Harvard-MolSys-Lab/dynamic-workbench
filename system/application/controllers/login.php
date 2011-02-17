<?
class Login extends Controller {
	function index()
	{
		$this->load->library('zend','Zend/Json');
		if(!$this->quickauth->logged_in()) {
			$email = $this->input->post('email');
			$password = $this->input->post('password');
			if($this->quickauth->login($email, $password)) {
				$json = json_encode(array(
					'success' => TRUE,
					'error' => FALSE
				));
				$this->output->set_output($json);
			} else {
				$json = json_encode(array(
					'success' => FALSE,
					'error' => TRUE
				));
				$this->output->set_output($json);
			}
		}
	}
	function register() 
	{
		if($this->input->post('invite')=='infomachine') {
			$this->load->library('zend','Zend/Json');
			$userdata = array(
			    'username' => $this->input->post('email'),
			    'password' => $this->input->post('password'),
			    'firstname' => $this->input->post('firstname'),
			    'lastname' => $this->input->post('lastname'),
			    'type' => array()
			);
	
			$this->quickauth->register($userdata);	
			
			if($this->quickauth->login($userdata['username'], $userdata['password'])) {
				$json = json_encode(array(
					'success' => TRUE,
					'error' => FALSE
				));
				$this->output->set_output($json);
			} else {
				$json = json_encode(array(
					'success' => FALSE,
					'error' => TRUE
				));
				$this->output->set_output($json);
			}		
		} else {
			$json = json_encode(array(
				'success' => FALSE,
				'error' => TRUE
			));
			$this->output->set_output($json);
		}
	}
	function logout() {
		$this->quickauth->logout();
		$this->load->helper('url');
		redirect('');
	}
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
