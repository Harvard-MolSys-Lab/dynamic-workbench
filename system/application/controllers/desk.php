<?php
	class Desk extends Controller {
		function index() {
			$this->load->library('core');
			$this->load->library('zend','Zend/Json');
			$this->load->model('card_model','cards');
			$this->load->model('stack_model','stacks');

			$path = $this->input->post('node');
			if(!$path) { 
				$path = 'source';
			}
			$tree = $this->_node($path);
			
			echo json_encode($tree);	
		}
		function _node($path,$onlyChildren = FALSE) {
			$pathArray = explode('/',$path);
			$rootTrigger = array_shift($pathArray);
			$trigger = $rootTrigger;
			
			switch($rootTrigger) {
				case 'source':
					if(count($pathArray)>0) {
						return $this->_node(implode($pathArray,'/'));
					} else {
						$tree = array();
					
						// Expandos
						$tree[] = $this->_node('stacks');
						
						return $tree;
		
					}
				case 'stacks':
					if(count($pathArray)>0) {
						$trigger = $this->findId(array_shift($pathArray));
						if(count($pathArray)>0) {
							$trigger = $this->findId(array_shift($pathArray));
							if(count($pathArray)>0) {
								
							// list blocks (by file)
							} else {
								$file = $this->files->read($trigger);
								$file = $file[0];
								$blocks = $this->blocks->readByFile($trigger);
								$children = array();
								foreach($blocks as $block) {
									$children[] = array( 'id' => 'block_'.$block['blockId'], 'text' => $block['blockName'], 
										'trigger' => 'block/'.$block['blockId'], 'iconCls' => 'report', 'type' => 'block',
										'key' => $block['blockId'] );
								} 
								return $children; //array( 'id' => $trigger, 'text' => $file['fileName'], 'trigger' => 'file/'.$trigger, 
									// 'children' => $children, 'iconCls' => 'folder' );

							}
						// list cards (by stack)
						} else {
							$expando = $this->expandos->read($trigger);
							$expando = $expando[0];
							$files = $this->files->readWhere(array($trigger));
							$children = array();
							foreach($files as $file) {
								$children[] = array( 'id' => 'file_'.$file['fileId'], 'text' => $file['fileName'], 
									'trigger' => 'file/'.$file['fileId'], 'iconCls' => 'folder', 'type' => 'file',
									'key' => $file['fileId'] );
							}
							return $children; //array( 'id' => $trigger, 'text' => $expando['expandoName'], 'trigger' => 'expando/'.$trigger, 
								//'children' => $children, 'iconCls' => 'briefcase' );
						}
					// list expandos
					} else {
						$stacks = $this->stacks->read();
						$children = array();
						foreach($stacks as $stack) {
							$children[] = array( 'id' => 'stack_'.$stack['stackId'], 'text' => $stack['stackName'], 
								'trigger' => 'stack/'.$stack['stackId'], 'iconCls' => 'stack', 'type' => 'stack', 
								'key' => $stack['stackId'] );
						}
							
						if($onlyChildren) { 
							return $children;
						}
						return array( 'id' => 'stacks', 'text' => 'Stacks', 'trigger' => 'stacks', 
							'children' => $children, 'iconCls' => 'stacks', 'type' => 'folder' );
					}
					break;
				case '':
					return $this->_node(implode($pathArray,'/'),$onlyChildren);
			}
		}
		function findId($id) {
			$arr = explode('_',$id);
			return array_pop($arr);	
		}	
	}
?>