<?
class Database extends Controller {
	function index()
	{
		$this->load->dbforge();
		
		// Clean-up
		$this->dbforge->drop_table('objects');
		$this->dbforge->drop_table('fields');
		$this->dbforge->drop_table('fields_objects');
    $this->dbforge->drop_table('objects_types');
    $this->dbforge->drop_table('fields_types');
    $this->dbforge->drop_table('objects_users');
    $this->dbforge->drop_table('fields_users');
    
    // Workspaces
    $this->dbforge->drop_table('workspaces');
    $this->dbforge->add_field(array(
      'id' => array(
        'type' => 'INT',
        'constraint' => 9, 
        'auto_increment' => TRUE
      ),
      'user_id' => array(
        'type' => 'INT',
        'constraint' => 9
      ),
      'data' => array(
        'type' => 'text'
      )
    ));
    $this->dbforge->add_key('id', TRUE);
    $this->dbforge->create_table('workspaces', TRUE);
    
    
		// User Auth
		// $this->dbforge->drop_table('users');
		$this->dbforge->add_field(array(
			'id' => array(
				'type' => 'INT',
        'constraint' => 9, 
        'auto_increment' => TRUE
			),
			'username' => array(
				'type' => 'text'
			),
			'password' => array(
				'type' => 'text'
			),
			'firstname' => array(
				'type' => 'text'
			),
			'lastname' => array(
				'type' => 'text'
			)
		));
		$this->dbforge->add_key('id', TRUE);
		$this->dbforge->create_table('users', TRUE);

		// Groups
		// $this->dbforge->drop_table('groups');
		$this->dbforge->add_field(array(
			'id' => array(
				'type' => 'INT',
                'constraint' => 9, 
                'auto_increment' => TRUE
			),
			'title' => array(
				'type' => 'text'
			)
		));
		$this->dbforge->add_key('id', TRUE);
		$this->dbforge->create_table('groups', TRUE);
		
		// Group Memberships
		// $this->dbforge->drop_table('group_memberships');
		$this->dbforge->add_field(array(
			'id' => array(
				'type' => 'INT',
                'constraint' => 9, 
                'auto_increment' => TRUE
			),
			'userid' => array(
				'type' => 'INT',
				'constraint' => 9
			),
			'groupid' => array(
				'type' => 'INT',
				'constraint' => 9
			)
		));
		$this->dbforge->add_key('id', TRUE);
		$this->dbforge->create_table('group_memberships', TRUE);
		
		echo('Database created successfully! Remove ~/system/application/controllers/database.php.');
	}
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
