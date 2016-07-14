angular.module('advertioApp.services', [])
.factory('authService', function(config, $rootScope, $cookies, $http) {
	var authService = {};

	authService.login = function(usr){
		return $http.post(config.apiUrl + "/api/login", usr);
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
.factory('latllngService', function(config, $rootScope, $cookies, $http) {
	var latllngService = {};
	var lat = 0;
	var lng = 0;

	latllngService.setLat = function(buffer){
		lat = buffer;
		return "OK";
	};

	latllngService.setLng = function(buffer){
		lng = buffer;
		return "OK";
	};

	latllngService.getLat = function(){
		return lat;
	};

	latllngService.getLng = function(){
		return lng;
	};

	return latllngService;
})
.factory('queryService', function(config, $http) {
	
	// factory function body 
	return {
		getBoards: function()
		{
			return $http.get(config.apiUrl  + '/api/Board');
		},
		createBoard: function(board)
		{
			return $http.post(config.apiUrl  + '/api/board', board);
		},
		getBoard: function(id)
		{
			return $http.get(config.apiUrl + '/api/board/'+id);
		},
		setBoard: function(board)
		{
			return $http.put(config.apiUrl  + '/api/board/1', board);
		},
		deleteBoard: function(board)
		{
			return $http.delete(config.apiUrl  + '/api/board/'+board.werbetafelId);
		},
		getVideos: function()
		{
			return $http.get(config.apiUrl  + '/api/stream');
		}
	}
});