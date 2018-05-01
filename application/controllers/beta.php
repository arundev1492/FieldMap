<?php
	if ( ! defined('BASEPATH')) exit('No direct script access allowed');
	class Beta extends My_Controller {
		function index(){
			header("Cache-Control: no-store, no-cache, must-revalidate");
			header("Cache-Control: post-check=0, pre-check=0", false);
			header("Pragma: no-cache");
			$this->load->helper('single_page_vendor_helper');
			$Data=array('CompanyPreferences'=>$this->CompanyPreferences);
			$this->load->view('../../vendorbeta/index.php',$Data);
		}
		/*
|--------------------------------------------------------------------------
| 	Function for dynamic rountion
|--------------------------------------------------------------------------
*/
		function _remap($method) {
		    // if(method_exists($this, $method))
		    // {
		    // 	$params = array_slice($this->uri->segments,2);
		    //     return call_user_func_array(array($this, $method), $params);
		    // } else
		    // 	show_404();
		    $this->index();
		}
	}
?>