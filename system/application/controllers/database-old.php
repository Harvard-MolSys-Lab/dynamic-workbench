<?
class Database extends Controller {
	function index()
	{
		$this->load->dbforge();
		
		// Objects
		$this->dbforge->drop_table('objects');
		$this->dbforge->add_field(array(
			'id' => array(
				'type' => 'INT',
        'constraint' => 9, 
        'auto_increment' => TRUE
			),
			'name' => array(
				'type' => 'VARCHAR',
        'constraint' => 255
			),
			'extends' => array(
				'type' => 'VARCHAR',
        'constraint' => 255
			),
			'type' => array(
				'type' => 'VARCHAR',
				'constraint' => 255
			),
			'proxyType' => array(
				'type' => 'VARCHAR',
        'constraint' => 255
			),
			'editorType' => array(
        'type' => 'VARCHAR',
        'constraint' => 255
      ),
      'templateType' => array(
        'type' => 'VARCHAR',
        'constraint' => 255
      )
		));
		$this->dbforge->add_key('id', TRUE);
		$this->dbforge->create_table('objects', TRUE);
		
		// Fields
		$this->dbforge->drop_table('fields');
		$this->dbforge->add_field(array(
			'id' => array(
				'type' => 'INT',
        'constraint' => 9, 
        'auto_increment' => TRUE
			),
			'name' => array(
				'type' => 'VARCHAR',
				'constraint' => 255
			),
			'type' => array(
        'type' => 'VARCHAR',
        'constraint' => 255
      ),
			'isPrimitive' => array(
        'type' => 'bool'
      ),
      'value' => array(
        'type' => 'text'
      ),
		));
		$this->dbforge->add_key('id', TRUE);
		$this->dbforge->create_table('fields', TRUE);

    // Join: Objects <-> Fields
    $this->dbforge->drop_table('fields_objects');
    $this->dbforge->add_field(array(
      'id' => array(
        'type' => 'INT',
        'constraint' => 9, 
        'auto_increment' => TRUE
      ),
      'object_id' => array(
        'type' => 'INT',
        'constraint' => 9
      ),
      'field_id' => array(
        'type' => 'INT',
        'constraint' => 9
      ),
      'type_id' => array(
        'type' => 'INT',
        'constraint' => 9
      )
    ));
    $this->dbforge->add_key('id', TRUE);
    $this->dbforge->create_table('fields_objects', TRUE);

    // Join: Objects <-> Types
    // $this->dbforge->drop_table('objects_types');
    $this->dbforge->add_field(array(
      'id' => array(
        'type' => 'INT',
        'constraint' => 9, 
        'auto_increment' => TRUE
      ),
      'object_id' => array(
        'type' => 'INT',
        'constraint' => 9
      ),
      'type_id' => array(
        'type' => 'INT',
        'constraint' => 9
      )
    ));
    $this->dbforge->add_key('id', TRUE);
    $this->dbforge->create_table('objects_types', TRUE);

    // Join: Fields <-> Types
    $this->dbforge->drop_table('fields_types');
    $this->dbforge->add_field(array(
      'id' => array(
        'type' => 'INT',
        'constraint' => 9, 
        'auto_increment' => TRUE
      ),
      'field_id' => array(
        'type' => 'INT',
        'constraint' => 9
      ),
      'type_id' => array(
        'type' => 'INT',
        'constraint' => 9
      )
    ));
    $this->dbforge->add_key('id', TRUE);
    $this->dbforge->create_table('fields_types', TRUE);
    
    // Join: Users <-> Objects
    // $this->dbforge->drop_table('objects_users');
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
      'object_id' => array(
        'type' => 'INT',
        'constraint' => 9
      )
    ));
    $this->dbforge->add_key('id', TRUE);
    $this->dbforge->create_table('objects_users', TRUE);
    
    // Join: Users <-> Fields
    // $this->dbforge->drop_table('fields_users');
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
      'field_id' => array(
        'type' => 'INT',
        'constraint' => 9
      )
    ));
    $this->dbforge->add_key('id', TRUE);
    $this->dbforge->create_table('fields_users', TRUE);
    
    
    
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



	}
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
