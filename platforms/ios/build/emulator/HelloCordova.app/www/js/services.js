angular.module('app.services', [])


// Temporary using get for login
.factory('UsersFactory', ['$http', function($http){
	var result = [];
	return {
		login: function(email, password){
			return $http.get("https://savor365.com/api/userLogin?email=" + email + "&password=" + password); // password will be added later on
		},
		// this is for to use after login
		getUserInfo: function(email){
			return $http.get("https://savor365.com/api/user?email="+ email);
		},
		getAddresses: function(cusId){
			return $http.get("https://savor365.com/api/userAddresses?cusId=" + cusId);
		},
		addressSave: function(id, address){
			return $http.get("https://savor365.com/api/saveAddress?cusId="+id+"&address="+address.line1+" "+address.line2+"&city="+address.city+"&state="+address.state+"&zipcode="+address.zipcode);
		},
		saveAddressForNextState: function(addrs){
			result = addrs;
		},
		getAddress: function(){
			return result;
		},
		makeThisAddressDefault: function(id){
			return $http.get("https://savor365.com/api/makeAddressDefault?id="+id);
		},
		paymentInfoSave: function(payment, id){
			return $http.get("https://savor365.com/api/savePaymentInfo?cusId="+id+"&holderName="+payment.name+"&cardNumber="+payment.cardNumber+"&expDate="+payment.expDate+"&cvv="+payment.cvv+"&zip="+payment.zip);
		},
		getPaymentInfo: function(id){
		 	return $http.get("https://savor365.com/api/findPaymentInfo?cusId="+id);
		}
		
	}
}])


.factory('SearchFactory', ['$http', function($http){
	var result = [];
	return {
		searchByZipCode: function(zip){
			return $http.get("https://savor365.com/api/searchByZipCode?zipcode="+zip);
		},
		saveSearchResult: function(rst){
			result =  rst;
		},
		getSearchResult: function(){
			return result;
		}
		
	}
}])


.factory('FoodFactory', ['$http', function($http){

	return {
		getFoods: function(email, password){
			return $http.get("https://savor365.com/api/foods");
		},
		getCuisines: function(){
			return $http.get("https://savor365.com/api/cuisines");
		},
		getFoodSize: function(id){
			return $http.get("https://savor365.com/api/foodSizeById?id="+ id);
		},
		getExtrasById: function(id){
			return $http.get("https://savor365.com/api/extraFoodsById?id="+ id);
		},
		getExtraFoodPrice: function(id){
			return $http.get("https://savor365.com/api/extraFoodPrice?foodId="+ id);
		},
		getFoodsByRestaurantId: function(restaurantId){
			return $http.get("https://savor365.com/api/foodsByRestaurantId?restaurantId="+ restaurantId);
		},
		getRestaurantsById: function(restaurantId){
			return $http.get("https://savor365.com/api/findRestaurantsById?restaurantId="+ restaurantId);
		}
		
	}
}])


.factory('CartFactory',['$http', function($http) {

	

	return {
		saveIntoCart: function(cartData){

			if(window.localStorage['cartInfo'] != ""){
				var storage = [];
				storage = JSON.parse(window.localStorage['cartInfo']);
				storage.push(cartData);
				window.localStorage['cartInfo'] = JSON.stringify(storage);
			}
			else{
				var storage = [];
				storage.push(cartData);
				window.localStorage['cartInfo'] = JSON.stringify(storage);
			}
			
			
		},
		getCartInfo: function(){
			return JSON.parse(window.localStorage['cartInfo'] || false);
		},
		makePayment: function(amnt, cardNum, cvv, expDate){
			var invNum = 10001;
			return $http.get("https://savor365.com/api/makePayment?amount="+amnt+"&cardNumber="+cardNum+"&cvv="+cvv+"&expDate="+expDate+"&invNumber="+invNum);
		}
	}
}])




.factory('LocationFactory',['$http', function($http) {
  return {
    getZipCode: function(lat, lng) {
      return $http.get("http://ws.geonames.org/findNearbyPostalCodesJSON?formatted=true&lat="+lat+"&lng="+lng+"&username=ahayder");
    }
  }
}])



.factory('SignUpFactory',['$http', function($http) {
  return {
    signup: function(data){
    	return $http.get("https://savor365.com/api/cusInfoStore?name="+data.name+"&email="+data.email+"&password="+data.password+"&mobile="+data.mobile);
    }
  }
}]);

