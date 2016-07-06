angular.module('advertioApp.services', [])
.factory('authService', function(config, $rootScope, $cookies, $http) {
	var authService = {};

	authService.login = function(usr){
		var usrString = "\"" +  usr.user + " " + usr.pwd + "\""  ;
		return $http.post(config.apiUrl + "/api/login", usrString);
	};

	authService.setBoard = function(board){
		var boardString = "\"" +  board+ "\"" ;
		console.log(boardString);
		return $http.post(config.apiUrl  + "/api/board", boardString);
	}

	authService.setSettings = function(name, token){
		//$http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
		$cookies.put('user', name);
		//$cookies.put('token', token);
		$rootScope.globals = {
			user: name,
			token: token
		};
	};
	return authService;
})
.factory('queryService', function(config, $http) {
	
	// factory function body 
	return {
		getBoards: function()
		{
			return $http.get(config.apiUrl  + '/api/Board');
		},
		getBoard: function(id)
		{
			return $http.get(config.apiUrl + '/api/board/'+id);
		},
		setBoard: function(board)
		{
			var boardString = board;
			console.log(boardString);
			return $http.post(config.apiUrl  + '/api/board', boardString);
		}
	}
});