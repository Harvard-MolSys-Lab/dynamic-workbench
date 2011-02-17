<?
class Setup extends Controller {
	function index()
	{
	  
    /**
     * Bootstrap type setup
     */
    
    // Objects and primitives
    // Object
    $t = new Object();
    $t->name = 'Object';
    $t->extends = '';
    $t->type = 'Type';
    $t->proxyType = '';
    $t->editorType = '';
    $t->templateType = '';
    $t->save();
    
    // Type
    $t = new Object();
    $t->name = 'Type';
    $t->extends = 'Object';
    $t->type = 'Type';
    $t->proxyType = '';
    $t->editorType = '';
    $t->templateType = '';
    $t->save();
    
    /**
     * Workspace Objects
     */
    
    // WorkspaceObject2D
    $t = new Object();
    $t->name = 'WorkspaceObject2D';
    $t->extends = '';
    $t->type = 'Type';
    $t->proxyType = '';
    $t->editorType = '';
    $t->templateType = '';
    $fields = array();
    
      $f = new Field();
      $f->name = 'x';
      $f->type = 'Number';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'y';
      $f->type = 'Number';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'width';
      $f->type = 'Number';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'height';
      $f->type = 'Number';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
    
    $t->save($fields);
    
    
    
    // ElementObject
    $t = new Object();
    $t->name = 'ElementObject';
    $t->extends = 'WorkspaceObject2D';
    $t->type = 'Type';
    $t->proxyType = '';
    $t->editorType = '';
    $t->templateType = '';
    $fields = array();
    
      $f = new Field();
      $f->name = 'border-color';
      $f->type = 'Color';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'border-width';
      $f->type = 'Number';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'border-type';
      $f->type = 'Text';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'fill-color';
      $f->type = 'Color';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'text';
      $f->type = 'Text';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
    
    $t->save($fields);
    
    
    
    // VectorObject
    $t = new Object();
    $t->name = 'VectorObject';
    $t->extends = 'WorkspaceObject2D';
    $t->type = 'Type';
    $t->proxyType = 'VectorObject';
    $t->editorType = '';
    $t->templateType = '';
    $fields = array();

      $f = new Field();
      $f->name = 'fill';
      $f->type = 'Text';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
  
      $f = new Field();
      $f->name = 'fillOpacity';
      $f->type = 'Color';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'strokeColor';
      $f->type = 'Color';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'strokeWidth';
      $f->type = 'Number';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'strokeDasharray';
      $f->type = 'Text';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'strokeLinecap';
      $f->type = 'Text';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'strokeLinejoin';
      $f->type = 'Text';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'strokeOpacity';
      $f->type = 'Number';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'shape';
      $f->type = 'Text';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
      $f = new Field();
      $f->name = 'path';
      $f->type = 'Text';
      $f->isPrimitive = TRUE;
      $f->save();
      $fields[] = $f;
      
    $t->save($fields);
    
    // VectorRectObject
    $t = new Object();
    $t->name = 'VectorRectObject';
    $t->extends = 'VectorObject';
    $t->type = 'Type';
    $t->proxyType = 'VectorRectObject';
    $t->editorType = '';
    $t->templateType = '';
    $t->save();
    
    
    // VectorEllipseObject
    $t = new Object();
    $t->name = 'VectorEllipseObject';
    $t->extends = 'VectorObject';
    $t->type = 'Type';
    $t->proxyType = 'VectorEllipseObject';
    $t->editorType = '';
    $t->templateType = '';
    $t->save();
    
    // VectorPathObject
    $t = new Object();
    $t->name = 'VectorPathObject';
    $t->extends = 'VectorObject';
    $t->type = 'Type';
    $t->proxyType = 'VectorPathObject';
    $t->editorType = '';
    $t->templateType = '';
    $t->save();
    
    // $meta = array('id','name','type','isPrimitive');
    // $meta = array('id','name','extends','type','proxyType','editorType','templateType');
    
	}
}	
/*
// Start the session for this page
session_start();
header("Cache-control: private");
*/


?>
