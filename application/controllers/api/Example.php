<?php

defined('BASEPATH') OR exit('No direct script access allowed');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
/** @noinspection PhpIncludeInspection */
require APPPATH . 'libraries/REST_Controller.php';

/**
 * This is an example of a few basic user interaction methods you could use
 * all done with a hardcoded array
 *
 * @package         CodeIgniter
 * @subpackage      Rest Server
 * @category        Controller
 * @author          Phil Sturgeon, Chris Kacerguis
 * @license         MIT
 * @link            https://github.com/chriskacerguis/codeigniter-restserver
 */
class Example extends REST_Controller {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();

        // Configure limits on our controller methods
        // Ensure you have created the 'limits' table and enabled 'limits' within application/config/rest.php
        $this->methods['users_get']['limit'] = 500; // 500 requests per hour per user/key
        $this->methods['users_post']['limit'] = 100; // 100 requests per hour per user/key
        $this->methods['users_delete']['limit'] = 50; // 50 requests per hour per user/key
    }

    /*
      |--------------------------------------------------------------------------
      | Use to Upload Data 
      | @Inputs:  
      |--------------------------------------------------------------------------
     */

    
    function UploadFile_post(){
        try {
            $ApiName = 'UploadFile';
            $UploadData=$this->post($ApiName);
            $UploadData=json_decode($UploadData,true);
            if(!is_dir(TMP_UPLOAD_PATH))
                mkdir(TMP_UPLOAD_PATH,0777,true);
            /* Start - Adjust Data based on upload method used */

            if(isset($_FILES['file']))
            {
                $UploadData['FileName'] = $_FILES['file']['name'];
                $UploadData['TempPath'] = TMP_UPLOAD_PATH . $UploadData['FileName']; /* Set image temp path */
                move_uploaded_file($_FILES['file']['tmp_name'], $UploadData['TempPath']);
                $UploadData['FileSize']=@filesize($UploadData['TempPath']); /* Get the file size */
            }
            $file = fopen($UploadData['TempPath'], 'r');
            $UploadData['CSVData'] = [];
            while (($line = fgetcsv($file)) !== FALSE) {
              //$line is an array of the csv elements
                $UploadData['CSVData'][]=$line;
            }
            fclose($file);
            /* End - Adjust Data based on upload method used */
            $UploadData['CSVData'] = json_encode($UploadData['CSVData']);
            /* Upload processing starts */
            unset($UploadData['TempPath']);
            unset($UploadData['FileSize']);
            $this->load->model('product_model');
            $Response=[
                "ResponseCode" =>   200,
                "Message" =>        "Success",
                "Data" =>           $this->product_model->handle_upload($UploadData)
            ];
        } 
        catch(Exception $e) 
        {
            $Response=[
                "ResponseCode" => $e->getCode(),
                "Message" =>    $e->getMessage()
            ];
        } finally {
            if(is_array($UploadData) && isset($UploadData['TempPath']) && is_file($UploadData['TempPath']) && $uploadModel->removeTempFile){
                unlink(realpath($UploadData['TempPath']));
            }
            $this->response([$ApiName=>$Response]);
        }
    }

    /*
      |--------------------------------------------------------------------------
      | Use to save Data 
      | @ApiName: SaveData
      | @Inputs:  Inputdata
      |--------------------------------------------------------------------------
     */
    function SaveData_post(){
        try {
            $ApiName = 'SaveData';
            $Response = array();
            $InputData=$this->post($ApiName)['MapData'];
            // print_r($InputData);die;
            if($InputData){
                $this->load->model('product_model');
                $ProductData = $this->product_model->getProductData(is_array($InputData['SKU'])?$InputData['SKU'][0]:$InputData['SKU']);
                if (empty($ProductData)) {
                    $Response=[
                        "ResponseCode" =>   200,
                        "Message" =>        "Success",
                        "Data" =>           $this->product_model->saveUserData([
                            'Title'         => is_array($InputData['Title'])?$InputData['Title'][0]:$InputData['Title'],
                            'SKU'           => is_array($InputData['SKU'])?$InputData['SKU'][0]:$InputData['SKU'],
                            'Description'   => is_array($InputData['Description'])?$InputData['Description'][0]:$InputData['Description'],
                            'Prize'         => is_array($InputData['Prize'])?$InputData['Prize'][0]:$InputData['Prize'],
                            'Quantity'      => is_array($InputData['Quantity'])?$InputData['Quantity'][0]:$InputData['Quantity'],
                            
                        ])
                    ];
                }
            } 
            else 
                {
                    throw new CoreException([
                        'data'=>"Missing API data wrapper $ApiName"
                    ],519);
                }
        } 
        catch(Exception $e) 
        {
            $Response=[
                "ResponseCode" => $e->getCode(),
                "Message" =>    $e->getMessage()
            ];
        } finally {
            $this->response([$ApiName=>$Response]);
        }
    }
    /*
      |--------------------------------------------------------------------------
      | Use to get product list
      | @ApiName: GetProductlist
      | @Inputs:  Inputdata
      |--------------------------------------------------------------------------
     */
    function GetProductlist_post(){
        try {
            $ApiName = 'GetProductlist';
            $Response = array();
            $InputData=$this->post($ApiName);
            $this->load->model('product_model');
            $Response=[
                "ResponseCode" =>   200,
                "Message" =>        "Success",
                "Data" =>           $this->product_model->get_product_list($InputData)
            ];
        } 
        catch(Exception $e) 
        {
            $Response=[
                "ResponseCode" => $e->getCode(),
                "Message" =>    $e->getMessage()
            ];
        } finally {
            $this->response([$ApiName=>$Response]);
        }
    }

}
