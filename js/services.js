angular.module('advertioApp.services', [])
//Der AuthService, für den Login und kleinere tests
.factory('authService', function(config, $rootScope, $cookies, $http) {
	
	var authService = {};

	//login Daten an das Backend senden
	authService.login = function(usr){
		return $http.post(config.apiUrl + "/api/login", usr);
	};

	//testKlasse zum erstellen eines Boards (im normalen einsatz wird der Service unten verwendet)
	authService.setBoard = function(board){
		var boardString = "\"" +  board+ "\"" ;
		console.log(boardString);
		return $http.post(config.apiUrl  + "/api/board", boardString);
	}

	//Settings Setzen, leider keine Zeit mehr!
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
//in dem Service werden die latlang koordinaten beim anlegen einer Werbetafel gespeichert
.factory('latllngService', function(config, $rootScope, $cookies, $http) {
	var latllngService = {};
	var lat = 0;
	var lng = 0;

	//Getter/Setter
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
//Hier werden die REST BackendAbfragen abgeschickt!
.factory('queryService', function(config, $http) {
	
	// alle REST Anfragen an das Backend
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
		deleteBoard: function(boardID)
		{
			return $http.delete(config.apiUrl  + '/api/board/'+boardID);
		},
		createStream: function(board)
		{
			return $http.post(config.apiUrl  + '/api/stream', board);
		},
		setStream: function(board)
		{
			return $http.put(config.apiUrl  + '/api/stream/1', board);
		},
		deleteStream: function(board)
		{
			return $http.delete(config.apiUrl  + '/api/stream/'+board.werbetafelId);
		},
		getVideos: function()
		{
			return $http.get(config.apiUrl  + '/api/stream');
		}
	}
});