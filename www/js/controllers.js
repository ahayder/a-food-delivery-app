angular.module('app.controllers', [])
  
.controller('searchCtrl', function($scope) {

})
   
.controller('cartCtrl', function($scope) {

})
   
.controller('orderCtrl', function($scope) {

})
      
.controller('loginCtrl', ['$scope', 'UsersFactory', '$ionicPopup', '$state', function($scope, UsersFactory, $ionicPopup, $state) {

	// Login
	$scope.login = function(user){
		UsersFactory.getUser(user.email, user.password).then(function(response){
			var userInfo = response.data;
			console.log(userInfo);
			
			if(userInfo.length != 1){
				$ionicPopup.alert({
			     title: 'Error',
			     template: 'Oooops! Username or password missmatched.'
			   });
			}
			else{
				$state.go("tabsController.search");
				window.localStorage['loggedIn'] = true;
			}

		});
	}

}])
   
.controller('signupCtrl', function($scope) {

});
    