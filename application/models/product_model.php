<?php 
class Product_model extends CI_Model {

        public function saveUserData($input_data)
        {
                $this->db->insert(PRODUCTS, $input_data);
                $input_data['MapData']['ProductID'] = $this->db->insert_id();
                return $input_data;
        }

        public function getProductData($SKU){
                $this->db->where("SKU",$SKU);
                $query = $this->db->get(PRODUCTS);
                return $query->row_array();       
        }

        public function handle_upload($input_data)
        {       
                // print_r($input_data);die;
                $input_data['CreatedDate'] = date('Y-m-d H:i:s');
                $this->db->insert(IMPORTED_DATA, $input_data);
                $input_data['MediaID'] = $this->db->insert_id();
                return json_decode($input_data['CSVData']);
        }
        public function get_product_list($input_data)
        {       
                $query = $this->db->get(PRODUCTS);
                if ($query->num_rows()>0) {
                       return $query->result_array();
                }
        }
        
}       
?>