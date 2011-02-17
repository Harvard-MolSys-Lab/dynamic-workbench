<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>InfoMachine</title>

<!--<link rel="stylesheet" type="text/css" href="/scripts/ext-3.2.1/resources/css/reset-min.css" />-->
<link rel="stylesheet" type="text/css" href="<?= $this->config->item('scripts_path') ?>ext-3.3.0/resources/css/ext-all.css" />
<!--<link rel="stylesheet" type="text/css" href="<?= $this->config->item('scripts_path') ?>ext-3.3.0/resources/css/xtheme-blue.css" />-->
<link rel="stylesheet" type="text/css" href="styles/canvas.css" />
<link rel="stylesheet" type="text/css" href="styles/infomachine.css" />
<link rel="stylesheet" type="text/css" href="<?= $this->config->item('scripts_path') ?>mathquill/mathquill.css" />

<link rel="stylesheet" type="text/css" href="<?= $this->config->item('scripts_path') ?>color-field-1.0.0/color-field.css" />

<!-- jQuery and ExtJs -->
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>jquery-1.4.3.min.js"></script>
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>ext-3.3.0/adapter/jquery/ext-jquery-adapter.js"></script>
<!--<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>ext-3.3.0/adapter/ext/ext-base.js"></script>-->
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>ext-3.3.0/ext-all.js"></script>

<!-- Aloha and dependencies -->
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>aloha-dependencies.js"></script>
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>Aloha-Editor/build/out/aloha-nightly/aloha/aloha-nodeps.js"></script>
<script type="text/javascript" src="<?= $this->config->item('scripts_path') ?>Aloha-Editor/build/out/aloha-nightly/aloha/plugins/com.gentics.aloha.plugins.Format/plugin.js"></script>
<script type="text/javascript" src="<?= $this->config->item('scripts_path') ?>Aloha-Editor/build/out/aloha-nightly/aloha/plugins/com.gentics.aloha.plugins.Table/plugin.js"></script>
<script type="text/javascript" src="<?= $this->config->item('scripts_path') ?>Aloha-Editor/build/out/aloha-nightly/aloha/plugins/com.gentics.aloha.plugins.List/plugin.js"></script>
<script type="text/javascript" src="<?= $this->config->item('scripts_path') ?>Aloha-Editor/build/out/aloha-nightly/aloha/plugins/com.gentics.aloha.plugins.Link/plugin.js"></script>
<script type="text/javascript" src="<?= $this->config->item('scripts_path') ?>Aloha-Editor/build/out/aloha-nightly/aloha/plugins/com.gentics.aloha.plugins.HighlightEditables/plugin.js"></script>
<script type="text/javascript" src="<?= $this->config->item('scripts_path') ?>Aloha-Editor/build/out/aloha-nightly/aloha/plugins/com.gentics.aloha.plugins.TOC/plugin.js"></script>
<!--
<script type="text/javascript" src="<?= $this->config->item('scripts_path') ?>Aloha-Editor/build/out/aloha-nightly/aloha/plugins/com.gentics.aloha.plugins.Link/delicious.js"></script>
<script type="text/javascript" src="<?= $this->config->item('scripts_path') ?>Aloha-Editor/build/out/aloha-nightly/aloha/plugins/com.gentics.aloha.plugins.Link/LinkList.js"></script>
-->
<script language="javascript" type="text/javascript">
  GENTICS.Aloha.Settings = {
    ribbon: false,
    "i18n":{
      "current": "en" 
    },
    plugins: {
      "com.gentics.aloha.plugins.Format": {
        // all elements with no specific configuration get this configuration
        config : [ 'b', 'i', 'p', 'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'removeFormat'],
          editables : {
          
          }
      },
      "com.gentics.aloha.plugins.List": { 
        // all elements with no specific configuration get an UL, just for fun :)
        config : [ 'ul', 'ol' ],
          editables : {

          }
      },
      "com.gentics.aloha.plugins.Link": {
        // all elements with no specific configuration may insert links
        config : [ 'a' ],
          editables : {
          
          },
          // all links that match the targetregex will get set the target
        // e.g. ^(?!.*aloha-editor.com).* matches all href except aloha-editor.com
          targetregex : '*',
          // this target is set when either targetregex matches or not set
          // e.g. _blank opens all links in new window
          target : '_blank',
          // the same for css class as for target
          cssclassregex : '*',
          cssclass : 'aloha',
          // use all resources of type website for autosuggest
          objectTypeFilter: ['website'],
          // handle change of href
          onHrefChange: function( obj, href, item ) {
            if ( item ) {
            jQuery(obj).attr('data-name', item.name);
            } else {
            jQuery(obj).removeAttr('data-name');
            }
          }
      },
      "com.gentics.aloha.plugins.Table": { 
        // all elements with no specific configuration are not allowed to insert tables
        config : [ 'table' ],
          editables : {
          'div' : [ 'table' ] 
          }
      }
    }
  }
</script>

<!-- Raphael -->
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>raphael/raphael.js"></script>
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>g.raphael/g.raphael-min.js"></script>

<!-- Mathquill -->
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>mathquill/build/mathquill.js"></script>


<!-- ExtJS user extensions -->
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>color-field-1.0.0/color-field.js"></script>

<!--
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>joose-2.1/joose.js"></script>
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>joose-ext-bridge.js"></script>
-->

<!-- InfoMachine dependencies -->
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>inflection-js/inflection.js"></script>
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>color.js"></script>
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>date.js"></script>
<script language="javascript" type="text/javascript" src="<?= $this->config->item('scripts_path') ?>string.js"></script>

<!-- App and InfoMachine -->
<script language="javascript" type="text/javascript" src="client/app.js"></script>
<script language="javascript" type="text/javascript">
	App.baseUrl = '<?= $this->config->site_url() ?>';
	App.scriptsUrl = '<?= $this->config->item("scripts_path") ?>';	
</script>
<!-- Canvas workspace -->
<script language="javascript" type="text/javascript" src="client/workspace.js"></script>
<script language="javascript" type="text/javascript" src="client/objects.js"></script>
<script language="javascript" type="text/javascript" src="client/tools.js"></script>
<script language="javascript" type="text/javascript" src="client/canvas.js"></script>

<? // ?_c=<?= time() ?>
<!-- Load workspace data -->
<script language="javascript" type="text/javascript" src="index.php/workspaces/load"></script>
<script language="javascript" type="text/javascript" src="index.php/user"></script>
</head>

<body>
  <div id="loading_mask"></div>
  <div id="loading"> 
    <img src="/canvas/icons/loading.gif" alt="Loading" />Loading...
  </div>
</body>
</html>