angular.module('app.services', [])

.factory('UsersFactory', ['$http', function($http){
	var user = [];

	return {
		getUser: function(email, password){
			return $http.get("https://foood365.com/api/user?email=" + email + "&password=" + password);
		}
		
	}
}])

.service('BlankService', [function(){

}]);

