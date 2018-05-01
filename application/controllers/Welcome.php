<?php
	if ( ! defined('BASEPATH')) exit('No direct script access allowed');
	class Welcome extends CI_Controller {
		function index(){
			header("Cache-Control: no-store, no-cache, must-revalidate");
			header("Cache-Control: post-check=0, pre-check=0", false);
			header("Pragma: no-cache");
			$this->load->helper('single_page_vendor_helper');
			$this->load->view('../../vendorbeta/index.php');
		}
		/*
|--------------------------------------------------------------------------
| 	Function for dynamic rountion
|--------------------------------------------------------------------------
*/
		function _remap($method) {
		    $this->index();
		}
	}
?>