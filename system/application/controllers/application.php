<?
class Application extends Controller {
	function index()
	{
		//echo 'LOADED.';
		
		if($this->quickauth->logged_in()) {
			$this->load->view('application_view');
		} else {
			$this->load->view('login_view');
		}
		
	}
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/
?>