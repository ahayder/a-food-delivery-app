<?php
require(APPPATH . '/libraries/REST_Controller.php');

class Api extends REST_Controller
{

    function setPayload_post () {
        $input_data = json_decode(trim(file_get_contents('php://input')), true);


        $apiKey = "XVWiuGOeMcvTrRtBYlEsbmDdGa71q9Mi";
        $apiSecret = "20e87a13ab3ab908657a024351c47fed9b6ced7bbfad96dd5fb78e819f7dcec1";
        $token = "fdoa-25347a54f4bf6e6eb67ad598ce136b0425347a54f4bf6e6e";

        $nonce = strval(hexdec(bin2hex(openssl_random_pseudo_bytes(4, $cstrong))));
        $timestamp = strval(time()*1000); //time stamp in milli seconds




        $merchant_ref = "SAVOR365";
        $transaction_type = "authorize";
        $method = "credit_card";
        //$amount = $this->session->userdata('grandTotal')*100;
        $amount = $input_data['amount']*100;
        $currency_code = "USD";
        $type = $input_data['cardType'];
        $cardholder_name = $input_data['cardInfo']['holder_name'];
        $card_number = $input_data['cardInfo']['card_number'];
        $exp_date =  $input_data['cardInfo']['expiration_date'];
        $cvv =  $input_data['cardInfo']['cvv'];

        $split_tender_id  = $this->session->userdata('LastOrderNo');
        $city =  "Alexandria";
        //$country =  $this->input->post('x_card_code');
        $email =  $input_data['userinfo']['cus_email'];
        $phone =  $input_data['userinfo']['cus_phone'];
        $street =  $input_data['userinfo']['cus_addrs'];
        $zip_postal_code =  $input_data['cardInfo']['billing_zip'];

        $data = array(
            'merchant_ref' => $merchant_ref,
            'transaction_type' => $transaction_type,
            'method' => $method,
            'amount' => intval($amount),
            'currency_code' => $currency_code,
            'type' => $type,
            'cardholder_name' => $cardholder_name,
            'card_number' => $card_number,
            'exp_date' => $exp_date,
            'cvv' => $cvv,
            'split_tender_id' => $split_tender_id,
            'city' => $city,
            //'country' => $cvv,
            'email' => $email,
            'phone' => $phone,
            'street' => $street,
            'zip_postal_code' => $zip_postal_code
        );

        $payload = $this->getPayload($data);
        $data = $apiKey . $nonce . $timestamp . $token . $payload;

        $hashAlgorithm = "sha256";



        ### Make sure the HMAC hash is in hex -->

        $hmac = hash_hmac ( $hashAlgorithm , $data , $apiSecret, false );



        ### Authorization : base64 of hmac hash -->

        $hmac_enc = base64_encode($hmac);

        $curl = curl_init('https://api.payeezy.com/v1/transactions');

        $headers = array(

              'Content-Type: application/json',

              'apikey:'.strval($apiKey),

              'token:'.strval($token),

              'Authorization:'.$hmac_enc,

              'nonce:'.$nonce,

              'timestamp:'.$timestamp,

            );

        curl_setopt($curl, CURLOPT_HEADER, false);

        curl_setopt($curl, CURLOPT_POST, true);

        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        curl_setopt($curl, CURLOPT_POSTFIELDS, $payload);


        curl_setopt($curl, CURLOPT_VERBOSE, true);

        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);


        $json_response = curl_exec($curl);
        $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        $response = json_decode($json_response, true);

        if ( $status != 201 ) {
            //die("$json_response, curl_error " . curl_error($curl) . ", curl_errno " . curl_errno($curl));
            $this->response($json_response, 400);
            die();

        }

        curl_close($curl);
        //echo $json_response;

        $this->response($json_response, 200);

    }

    function getPayload($data)
    {

        $data = array(
              'merchant_ref'=>$data['merchant_ref'],
              'transaction_type'=> $data['transaction_type'],
              'method'=> $data['method'],
              'amount'=> $data['amount'],
              'currency_code'=> $data['currency_code'],

              'credit_card'=> array(
                      'type'=> $data['type'],
                      'cardholder_name'=> $data['cardholder_name'],
                      'card_number'=> $data['card_number'],
                      'exp_date'=> $data['exp_date'],
                      'cvv'=> $data['cvv'],
                    )
            );
            return json_encode($data, JSON_FORCE_OBJECT);
    }

    // Payment ends here




    /// Order Info save & fax send

    function orderInfo_post()
    {

        $input_data = json_decode(trim(file_get_contents('php://input')), true);

        // Restaurant Infos
        $info['res_id']               = $input_data['resInfo']['res_id'];
        $info['cus_id']               = $input_data['shippingAddress']['cus_id'];
        $info['order_no']             = $input_data['orderNo'];
        $info['delivery_type']        = $input_data['deliveryType'];
        $info['delivery_charged']     = $input_data['deliveryCharge'];
        $info['date_time']            = date('Y-m-d H:i:s');
        $info['order_status']         = "Pending";
        $info['sub_total']            = "";
        $info['total']                = $input_data['subTotal'];
        $info['tips_charge']          = $input_data['tips'];
        $info['tax']                  = $input_data['tax'];;
        $info['res_earning']          = "";
        $info['grandTotal']           = $input_data['grandTotal'];
        $info['dorder_status']        = "Pending";
        $info['admin_payment_status'] = "Pending";
        $info['confrimation_code']    = $input_data['confirmationCode'];
        $info['date']                 = date('Y-m-d');
        $info['x_card_num']           = "";

        $this->db->insert('order_info', $info);

        //$this->response($info, 200);


        // Order Details

        foreach ($input_data['cartItem'] as $value) {

            if (sizeof($value['foodExtra']) > 0) {

                foreach ($value['foodExtra'] as $extraValue) {

                    $details['res_id']          = $value['mainFood']['res_id'];
                    $details['cus_id']          = $input_data['shippingAddress']['cus_id'];
                    $details['order_no']        = $input_data['orderNo'];
                    $details['food_id']         = $value['mainFood']['food_id'];
                    $details['food_price']      = $value['totalPrice'];
                    $details['menu_id']         = $value['mainFood']['menu_id'];
                    $details['food_qty']        = $value['qty'];
                    $details['food_type']       = $extraValue['type'];
                    $details['order_date_time'] = date('Y-m-d H:i:s');
                    $details['sub_total']       = "";
                    $details['food_name']       = $value['mainFood']['food_name'];
                    $details['size_name']       = $value['sizeInfo']['sizeName'];

                    $this->db->insert('order_detailes', $details);
                    //$this->response($details, 200);
                }

            }

            $details['res_id']          = $value['mainFood']['res_id'];
            $details['cus_id']          = $input_data['shippingAddress']['cus_id'];
            $details['order_no']        = $input_data['orderNo'];
            $details['food_id']         = $value['mainFood']['food_id'];
            $details['food_price']      = $value['totalPrice'];
            $details['menu_id']         = $value['mainFood']['menu_id'];
            $details['food_qty']        = $value['qty'];
            $details['food_type']       = $value['mainFood']['food_type'];
            $details['order_date_time'] = date('Y-m-d H:i:s');
            $details['sub_total']       = "";
            $details['food_name']       = $value['mainFood']['food_name'];
            $details['size_name']       = $value['sizeInfo']['sizeName'];

            $this->db->insert('order_detailes', $details);
            //$this->response($details, 200);


        }


        // Shipping Address


        $data['order_no']           = $input_data['orderNo'];
        $data['cus_id']             = $input_data['shippingAddress']['cus_id'];
        $data['name']               = "Not yet coded";
        $data['adrs']               = $input_data['shippingAddress']['addrs'];
        $data['zip_code']           = $input_data['shippingAddress']['zip_code'];
        $data['phone_no']           = $input_data['shippingAddress']['phone'];
        $data['cus_email_shipping'] = $input_data['shippingAddress']['cus_id'];

        $this->db->insert('order_shipping_adrs', $data);




        // Fax Starts from here

        // Building fax content
        $texttofax = '<table width="600" border="0" align="center" cellpadding="2" cellspacing="2">
  <tr>
    <td width="1" >&nbsp;</td>
    <td width="255" align="left" valign="top" style="border-bottom:2px solid #666666; border-bottom-style:dotted"><img src="'.base_url('resource/basicFile/innerLogo.png').'"  height="61"></td>
    <td width="11"  style="border-bottom:2px solid #666666; border-bottom-style:dotted">&nbsp;</td>
    <td colspan="3" align="right" valign="top"  style="border-bottom:2px solid #666666; border-bottom-style:dotted">
            <span style="font-size:25px">'.$input_data['resInfo']['res_name'].'</span><br>
            <span>ORDER NO : '.$input_data['orderNo'].'</span> <br>
    <span>Placed on : '.$info['date_time'].'</span>  </td>
    <td width="1" >&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td colspan="5" align="center" valign="top"><h4>To Confirm and adjust orders, get the owner app at savor365.com or call '.$input_data['resInfo']['phone'].' </h4></td>
    <td>&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td colspan="5" align="left" valign="top">';
        $texttofax  .='<table width="100%"  cellspacing="0" cellpadding="0" style="border:1px solid #999999; padding:5px">
      <tr>
        <td align="left" valign="middle"><span style="font-size:26px; font-weight:bold">ASAP</span></td>';

    if($input_data['deliveryType'] == 'delivery') {
        $texttofax .='<td align="right" valign="middle"><span style="font-size:35px; font-weight:bold">Delivery</span></td>';
    } else {
        $texttofax .='<td  align="right" valign="middle"><span style="font-size:35px; font-weight:bold">Pickup</span></td>';
    }

    $texttofax .='</tr>
    </table>';
    $texttofax  .='</td>
    <td>&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td width="255" align="left" valign="top"><strong>Customer Info :</strong><br />
    '.$input_data['userinfo'][0]['cus_name'].'<br />
    '.$input_data['userinfo'][0]['cus_phone'].'<br />
    '.$input_data['userinfo'][0]['cus_email'].'</td>
    <td width="11" align="left" valign="top">&nbsp;</td>
    <td width="269" align="center" valign="top">';

    if($input_data['deliveryType'] == 'Delivery') {
    $texttofax .='<span>
    <strong>Shipping Info :</strong><br />
    <strong>'.$input_data['shippingAddress']['adrs_type'].'</strong><br />
    '.$input_data['shippingAddress']['addrs'].','.$input_data['shippingAddress']['apt_no'].'<br />
    '.$input_data['shippingAddress']['town'].','.$input_data['shippingAddress']['state'].'  '.$input_data['shippingAddress']['aip_code'].'
    </span>';
    }
    $texttofax .='</td>
    <td width="18" align="left" valign="top">&nbsp;</td>
    <td width="295" align="right" valign="top"><strong>Restaurant Info :</strong><br />
        '.$input_data['resInfo']['phone'].'<br />
        '.$input_data['resInfo']['res_state'].'<br />
        '.$input_data['resInfo']['res_town'].'<br />
        '.$input_data['resInfo']['res_zipcode'].'</td>
    <td>&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td colspan="5" align="center" valign="top">&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td colspan="5" align="center" valign="top">';
    $texttofax  .='<table width="100%"  cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" valign="top" style="border-bottom:2px solid #000000; font-weight:bold">Qty</td>
        <td align="left" valign="top" style="border-bottom:2px solid #000000; font-weight:bold">Item</td>
        <td align="center" valign="top" style="border-bottom:2px solid #000000; font-weight:bold">Price</td>
        <td align="right" valign="top" style="border-bottom:2px solid #000000; font-weight:bold">Total</td>
      </tr>';
       $subtotalMainFood        = 0;
       $totalMainFoodAmnt       = 0;
       foreach($input_data['cartItem'] as $food){

            $subtotalMainFood = $input_data['subTotal'];

            $texttofax  .='<tr>
            <td align="center" valign="top"  >'.$food['qty'].'</td>
            <td align="left" valign="top"  >
                '.$food['mainFood']['food_name'].'('.$food['sizeInfo']['sizeName'].')<br>

            <div style="color: #666666; font-size: 11px; text-align:left">';

            foreach($food['foodExtra'] as $itemsExtraFood) {

                //$subtotalMainFood = $subtotalMainFood + $itemsExtraFood['subtotal'];

                $texttofax  .='<span>'.$itemsExtraFood['item_name'].'(';

                if($itemsExtraFood['price1']=='0') {
                    $texttofax .='Free';
                } else {
                    $texttofax .='$'.$itemsExtraFood['price1'].'';
                }
                $texttofax .=')</span><br />';
            }

                $texttofax  .='</div>       </td>
            <td align="center" valign="top" >$'.number_format($food['sizeInfo']['sizePrice'],2).'</td>
            <td align="right" valign="top" >$'.number_format($subtotalMainFood,2).'</td>
            </tr>';

        }

   $texttofax .='</table>';
    $texttofax  .='</td>
    <td>&nbsp;</td>
  </tr>
  <tr>
    <td>&nbsp;</td>
    <td colspan="5" align="center" valign="top">&nbsp;</td>
    <td>&nbsp;</td>
  </tr>
  ';

 $texttofax .= '<tr>
    <td>&nbsp;</td>
    <td colspan="3" align="left" valign="top"><span style="font-size:24px">Confirmation Code : <span style="font-weight:bold">'.$input_data['confirmationCode'].'</span></span></td>
    <td>&nbsp;</td>
    <td align="right" valign="top" style="border-top:2px solid #333333">
    <span style="color:#000000; font-weight:bold">
        Sub-Total : $'.$input_data['subTotal'].' </span><br />';
    if($input_data['deliveryType'] == 'Delivery') {
    $texttofax  .='Delivery Charge  : $'.$input_data['deliveryCharge'].' <br />';
    }
    $texttofax  .='Tax  : $'.number_format($input_data['tax']).' <br />
        Tips : $'.number_format($input_data['tips'],2).'  </td>
    <td>&nbsp;</td>
  </tr>';
 $texttofax .= '<tr>
    <td>&nbsp;</td>
    <td colspan="3" rowspan="2" align="left" valign="top">';
        if($input_data['specialInstruction'] != "") {
            $texttofax .='<span style="font-size:18px; font-weight:bold">Special Instruction  : <br />
            <span style="">'.$input_data['specialInstruction'].'</span></span>';
        }
    $texttofax .='</td>








    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->
    <!-- Promo Code codes goes here find it in a file called promocode.fuck in my mac-->















    <td>&nbsp;</td>
  </tr>

  <tr>
    <td>&nbsp;</td>
    <td>&nbsp;</td>
    <td align="right" valign="top"><span style="color:#000000; font-weight:bold; border-top:2px solid #333333">Total : $'.number_format($input_data['grandTotal'],2).' </span></td>
    <td>&nbsp;</td>
  </tr>';
$texttofax  .='</table>'; // Enter your fax contents here



        $curl = curl_init();

        curl_setopt_array($curl, array(
          CURLOPT_URL => "https://rest.interfax.net/outbound/faxes?faxNumber=001".$input_data['resInfo']['fax_no'],
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => "",
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 30,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_CUSTOMREQUEST => "POST",
          CURLOPT_POSTFIELDS => $texttofax,
          CURLOPT_HTTPHEADER => array(
            "authorization: Basic Zm9vb2QzNjU6Zm9vb2QzNiQ=",
            "cache-control: no-cache",
            "content-type: text/html",
            "postman-token: c1930f2c-bde8-1ced-dfb7-09bc94cb7729"
          ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
          echo "cURL Error #:" . $err;
        } else {
          $this->response($response, 200);
        }



        //$this->response($result, 200);


    }




    // Menu

    function menu_get(){

            $this->db->select('*');
            $this->db->from('menu_manage');
            $this->db->where('res_id', $this->get('resId'));
            $query = $this->db->get();

            $this->response($query->result(), 200);
        }



    //Favs

    function favs_get(){

            $this->db->select('*');
            $this->db->from('favourite');
            $this->db->where('cus_id', $this->get('cusId'));
            $query = $this->db->get();

            $this->response($query->result(), 200);
        }


    function makeFav_get(){

            $info['res_id']                = $this->get('resId');
            $info['cus_id']                = $this->get('cusId');

            $this->db->insert('favourite', $info);

            $this->response($this->db->affected_rows(), 200);
        }


        function deleteFav_get(){

                $this->db->where(array(
                    'res_id' => $this->get('resId'),
                    'cus_id' => $this->get('cusId')
                ));
                $this->db->delete('favourite');

                $this->response($this->db->affected_rows(), 200);
            }


    // Restaruant open hours

     function resOpenHours_get(){

            $this->db->select('*');
            $this->db->from('open_hours');
            $this->db->where('res_id', $this->get('resId'));
            $query = $this->db->get();

            $this->response($query->result(), 200);
    }

    // Sorting neccessary

    function cuisins_get(){
        $this->db->select('*');
            $this->db->from('cuisine_manage');
            $query = $this->db->get();

            $this->response($query->result(), 200);
    }

    function searchByCuisine_get()
    {
        $this->db->select('*');
        $this->db->from('view_restaurent_food_info');
        $this->db->where('cuisine_id', $this->get('cuiId'));
        $query = $this->db->get();

        foreach ($query->result() as $row)
    {
        $this->response($row->res_id);
    }


    }

    function searchByFreeDelivery_get()
    {
        $this->db->select('*');
        $this->db->from('view_restaurent_food_info');
        $this->db->where('min_delivery_charge', "0.00");
        $query = $this->db->get();

        foreach ($query->result() as $row)
    {
        $this->response($row->res_id);
    }


    }

    // Restaurant counter user

    function loginCounterUser_get(){

        $this->db->select('*');
        $this->db->from('res_counter_user');
        $this->db->where(array(
            'username' => $this->get('username'),
            'password' => $this->get('password')
        ));
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }


    // Merchant app api
    function saveCounterUser_get(){
        $info['res_id']                 = $this->get('resId');
        $info['username']               = $this->get('username');
        $info['password']               = $this->get('password');

        $this->db->insert('res_counter_user', $info);

        $this->response($this->db->affected_rows(), 200);
    }

    function getCounterUsers_get(){
        $this->db->select('*');
        $this->db->from('res_counter_user');
        $this->db->where('res_id', $this->get('resId'));


        $query = $this->db->get();

        $this->response($query->result(), 200);
    }

    function orderConfirmByMerchant_get(){

        $data['order_status'] = "Processing";
        // $this->get('confirmationCode');
        $estTime = intval($this->get('estTime'))+5;

        // updating order status from pending to processing
        $this->db->update('order_info', $data, array(
            'order_no' => $this->get('orderNum')
        ));



        // // Getting customer mobile number for sending sms {NEEED TO TALK WITH SHOIB FOR HOW TO DO MULTIPLE OPERATIONS INTO A SAME FUNCTION}

        // // Getting customer id at first
        // $this->db->select('cus_id');
        // $this->db->where('order_no', $this->get('orderNum'));
        // $query = $this->db-get('order_info');
        // $tempOfId = $query->result_array();
        // $customerId = $tempOfId[0]['cus_id'];


        // // Getting customer phone number
        // $this->db->from('cus_phone');
        // $this->db->where('cus_id', $costomerId);
        // $cusPhoneQuery = $this->db->get('customer_info');
        // $tempPhone = $cusPhoneQuery->result_array();
        // $cusPhone = $tempPhone[0]['cus_phone'];

        // // End of Getting customer mobile number for sending sms


        $this->load->library('twilio');
        $from = '+17865288145'; //Aita Change koiren na.
        $to = '+15714899181'; //
        $message = 'Savor365! Your order no '.$this->get('orderNum').' will be delivered within '.$estTime.'mins (approx). Type Free and get 10% off for your next order';
        $response = $this->twilio->sms($from, $to, $message);
        if($response->IsError) {
            //echo 'Error: ' . $response->ErrorMessage;
            $this->session->set_userdata(array('success' => $response->ErrorMessage. "Order Can Not to be Process."));

         } else {
            //echo 'Sent message to ' . $to;
            $this->session->set_userdata(array('success' => 'Sent message to ' . $to. " & Order Confirm to Processing."));
            //$this->M_order_info->update($data, $order_no);

        }

        $this->response($response, 200);




    }

    function resInfo_get(){
        //$this->db->select('*');
        $this->db->from('res_user_manage');
        $this->db->where('res_user_manage.res_id', $this->get('resId'));
        $this->db->join('delivery_info_manage', 'res_user_manage.res_id = delivery_info_manage.res_id');

        $query = $this->db->get();

        $this->response($query->result(), 200);
    }

    function addNewDriver_post(){

        $input_data = json_decode(trim(file_get_contents('php://input')), true);


        $info['res_id']                     = $input_data['resId'];
        $info['driver_name']                = $input_data['name'];
        $info['driver_phone']               = $input_data['phone'];
        $info['driver_license']             = $input_data['license'];
        $info['driver_position']            = $input_data['position'];
        $info['driver_user_name']               = $input_data['username'];
        $info['driver_password']            = $input_data['password'];
        $info['driver_status']              = $input_data['status'];
        $info['create_date']                    = date('Y-m-d');

        $this->db->insert('driver_manage', $info);

        $this->response($this->db->affected_rows(), 200);
    }

    function driverInfos_get(){
        $this->db->select('*');
        $this->db->from('driver_manage');
        $this->db->where('res_id', $this->get('resId'));
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }

     function bankInfo_get()
    {

        $this->db->select('*');
        $this->db->from('payment_info');
        $this->db->where('res_id', $this->get('resId'));
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }


    function findDeliveryInfo_get()
    {

        $this->db->select('*');
        $this->db->from('delivery_info_manage');
        $this->db->where('res_id', $this->get('resId'));
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }

    // Get orders info
    function findOrders_get()
    {

        $this->db->select('*');
        $this->db->from('order_info');
        $this->db->where('res_id', $this->get('resId'));
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }


    // Get order details
    function findOrderDetails_get()
    {

        $this->db->select('*');
        $this->db->from('order_detailes');
        $this->db->where('order_no', $this->get('orderNum'));
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }

    // Get order shipping address
    function findOrderShippingDetails_get()
    {

        $this->db->select('*');
        $this->db->from('order_shipping_adrs');
        $this->db->where('order_no', $this->get('orderNum'));
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }

    function resLogin_get()
    {
        $pass = md5($this->get('password'));

        $this->db->select('*');
        $this->db->from('res_user_manage');
        $this->db->where(array(
            'res_user_id' => $this->get('resUserId'),
            'res_user_pass' => $pass
        ));
        $query = $this->db->get();

        $this->response($query->result(), 200);

    }

    // END Merchant api










    function orderStatus_get()
    {
        $this->db->select('*');

        $this->db->from('order_info');
        $this->db->where('cus_id', $this->get('cusId'));
        $this->db->group_by("order_no");
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }






    function orderHistory_get()
    {
        $this->db->select('*');

        $this->db->from('order_detailes');
        $this->db->where('cus_id', $this->get('cusId'));
        $this->db->group_by("order_no");
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }



    function cusInfoStore_get()
    {

        $data['cus_name']        = $this->get('name');
        $data['invitation_code'] = time();

        $data['cus_email'] = $this->get('email');
        $data['password']  = md5($this->get('password'));

        $this->db->insert('customer_info', $data);

        $this->response("Signup done!", 200);
    }

    function saveAddress_get()
    {

        $data['cus_id']   = $this->get('cusId');
        $data['addrs']    = $this->get('address');
        $data['town']     = $this->get('city');
        $data['zip_code'] = $this->get('zipcode');
        $data['phone']    = $this->get('phone');
        $data['state']    = $this->get('state');
        $data['country']  = "USA";


        $this->db->insert('customer_address_manage', $data);


        $this->response("Address Saved", 200);
    }


    function savePaymentInfo_get()
    {
        $data['cus_id']          = $this->get('cusId');
        $data['holder_name']     = $this->get('holderName');
        $data['card_number']     = $this->get('cardNumber');
        $data['expiration_date'] = $this->get('expDate');
        $data['cvv']             = $this->get('cvv');
        $data['billing_zip']     = $this->get('zip');

        $this->db->insert('cus_payment_info', $data);

        $this->response("Payment Infos Saved", 200);

    }

    function findPaymentInfo_get()
    {
        $this->db->select('*');
        $this->db->from('cus_payment_info');
        $this->db->where('cus_id', $this->get('cusId'));
        $query = $this->db->get();

        $this->response($query->result(), 200);
    }

    function userAddresses_get()
    {

        $this->db->from('customer_address_manage');
        $this->db->where('customer_address_manage.cus_id', $this->get('cusId'));
        $this->db->join('customer_info', 'customer_address_manage.cus_id = customer_info.cus_id');

        $query = $this->db->get();

        $this->response($query->result(), 200);
    }

    function makeAddressDefault_get()
    {
        $data['adrs_type'] = "1";

        $this->db->update('customer_address_manage', $data, array(
            'id' => $this->get('id')
        ));
        $this->response("Saved Successfully", 200);
    }



    function userLogin_get()
    {
        $pass = md5($this->get('password'));

        $this->db->select('*');
        $this->db->from('customer_info');
        $this->db->where(array(
            'cus_email' => $this->get('email'),
            'password' => $pass
        ));
        $query = $this->db->get();

        $this->response($query->result(), 200);

    }

    function user_get()
    {
        $this->db->select('*');
        $this->db->from('customer_info');
        $this->db->where('cus_email', $this->get('email'));
        $query = $this->db->get();

        $this->response($query->result(), 200);

    }


    // Not working now
    function users_get()
    {
        $this->db->select('*');
        $this->db->from('customer_info');
        //$this->db->where(array('cus_email' => $this->post('Username'), 'password' => $this->post('Password')));
        $query = $this->db->get();

        $this->response($query->result());
        //$this->response($this->post);

    }


    // It's for testing purpose only
    function foods_get()
    {
        $this->db->select('*');
        $this->db->from('food_list_manage');
        $this->db->order_by('food_id', 'asc');
        $query = $this->db->get();

        $this->response($query->result());
    }


    function food_get()
    {
        $this->db->select('*');
        $this->db->from('food_list_manage');
        $this->db->where('food_id', $this->get('foodId'));
        $query = $this->db->get();

        $this->response($query->result());
    }


    function cuisines_get()
    {
        $this->db->select('*');
        $this->db->from('cuisine_manage');
        //$this->db->where('id', $this->get('id'));
        $query = $this->db->get();

        $this->response($query->result());
    }

    function foodPrice_get()
    {
        $this->db->select('*');
        $this->db->from('food_size_manage');
        $query = $this->db->get();
        $this->response($query->result());
    }


    function foodSizeById_get()
    {
        $this->db->select('*');
        $this->db->from('food_size_manage');
        $this->db->where(array(
            'food_id' => $this->get("id")
        ));
        $query = $this->db->get();
        $this->response($query->result());
    }


    /* Find Restaurant Extra Food  Information Using in Add to Cart */
    function extraFoodsById_get()
    {
        $this->db->select('*');
        $this->db->from('extra_food');
        $this->db->where(array(
            'food_id' => $this->get('id')
        ));
        $query = $this->db->get();
        $this->response($query->result());
    }


    /* Find Restaurant Extra Food Size Wise(For Size Wise Price) Information Using in Add to Cart */
    function extraFoodPrice_get()
    {
        $this->db->select('*');
        $this->db->from('extra_food_size_manage');
        $this->db->where(array(
            'food_id' => $this->get('foodId')
        ));
        $query = $this->db->get();

        $this->response($query->result());

    }



    function searchByZipCode_get()
    {
        $this->db->select('*');
        $this->db->from('delivery_zip_code');
        $this->db->where('zip_code', $this->get('zipcode'));
        $query = $this->db->get();
        $this->response($query->result());
    }


    function foodsByRestaurantId_get()
    {
        $this->db->select('*');
        $this->db->from('food_list_manage');
        $this->db->where('res_id', $this->get('restaurantId'));
        //$this->db->order_by('food_id', 'asc');
        $query = $this->db->get();

        $this->response($query->result());
    }


    /* Restaurant Registration Information */
    function findRestaurantsById_get()
    {

        $this->db->from('res_user_manage');
        $this->db->where('res_user_manage.res_id', $this->get('restaurantId'));
        $this->db->join('delivery_info_manage', 'res_user_manage.res_id = delivery_info_manage.res_id');

        $query = $this->db->get();

        $this->response($query->result(), 200);
    }
}

?>
