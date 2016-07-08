angular.module('advertioApp',['ui.bootstrap',
	'ngRoute',
	'ngResource',
	'ngCookies',
	'advertioApp.controllers',
	'advertioApp.directives',
	'advertioApp.services'])
.config(function($routeProvider, $httpProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.html5Mode(true).hashPrefix('!');
	$routeProvider
		.when('/', {templateUrl: 'Partials/login.html'})
		.when('/map', {templateUrl: 'Partials/map.html', controller: 'mapController'})
		.when('/werbEdit/:id', {templateUrl: 'Partials/werbEdit.html', controller: 'werbEditController'});
	$httpProvider.defaults.useXDomain = true; 
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
})
.constant('config', {
    appName: 'advertioFrontend',
    apiUrl: 'http://advertioend.azurewebsites.net'
});
angular.module('advertioApp.controllers', [])
.controller('MasterCtrl', function($scope, $location, $cookies, authService) {
	
	$scope.logedin = false;
	$scope.user = $cookies.get('user');
	 $scope.alerts = [
  	];

	if($scope.user != null)
	{
		var token = $cookies.get('token');
		console.log("loaded cookies for: " + $scope.user + " token: " + token);
		authService.setSettings($scope.user, token);
		$scope.logedin = true;
    	//change path specific on user rights
    	$location.path('/map');
	}

	  
    console.log(window.innerWidth);
    $scope.width = window.innerWidth;

	$scope.submit = function (usr) {
        authService.login(usr)
        	.success(function(data, status, headers, config) {
        		console.log(data);
        		console.log(status);
        		console.log(headers);
        		console.log(config);
    			authService.setSettings(usr.user, token);
				$scope.logedin = true;
    			$scope.user = usr.user;
    			$scope.alerts = [];
    			//change path specific on user rights
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {
  				console.log(data);
        		console.log(status);
        		console.log(headers);
        		console.log(config);
        		if(data== "error")
        			$scope.alerts.push({ type: 'danger', msg: 'User nicht bekannt!'});
        		else if(data == "wrongPW")
        			$scope.alerts.push({ type: 'danger', msg: 'Falsches Passwort!'});
        		else
        			$scope.alerts.push({ type: 'danger', msg: 'Unbekannter Fehler, bitte wenden sie sich an den Support!'});
  			});
    };

    $scope.logout = function() {
        $cookies.remove('user');
        $cookies.remove('token');
		$scope.logedin = false;

		$location.path('/');
    };
})
.controller('mapController', function($scope, queryService) {

	queryService.getBoards().then(function(response){
		$scope.currentQuery = response.data;
		console.log($scope.currentQuery);
		$scope.Buffer = $scope.currentQuery.split("-");


		$scope.boards = new Array($scope.Buffer.length);
		console.log($scope.Buffer);

		for(var i = 0; i<$scope.Buffer.length-1; i++)
		{
			var board = $scope.Buffer[i].split(" ");
			console.log("boardNR" + i);
			console.log(board);
			$scope.boards[i] = new Array (7);
			$scope.boards[i][0] = board[0];		//ID
			$scope.boards[i][1] = board[1];		//Adr
			$scope.boards[i][2] = board[2];		//BildX
			$scope.boards[i][3] = board[3];		//BildY
			$scope.boards[i][4] = board[4];		//P
			$scope.boards[i][5] = board[5];		//XPos
			$scope.boards[i][6] = board[6];		//YPos

		}
		console.log($scope.boards);
		//$scope.boards = $scope.currentQuery.boards;
	});
})
.controller('werbEditController', function($scope, $routeParams, queryService) {
    var currentId = $routeParams.id;
    $scope.id = 0;
		$scope.adr = 0;
		$scope.x = 0;
		$scope.y = 0;
		$scope.p = 0;
		var board = "";

    queryService.getBoards().then(function(response){
		$scope.currentQuery = response.data;
		console.log($scope.currentQuery);
		$scope.Buffer = $scope.currentQuery.split("-");



		$scope.boards = new Array($scope.Buffer.length);
		console.log($scope.Buffer);

		for(var i = 0; i<$scope.Buffer.length-1; i++)
		{
			var bBoard = $scope.Buffer[i].split(" ");
			console.log("boardNR" + i);
			console.log(bBoard);
			if(bBoard[0] == currentId)
			{
				$scope.id 	= bBoard[0];		//ID
				$scope.adr 	= bBoard[1];		//Adr
				$scope.xBild = bBoard[2];		//X
				$scope.yBild = bBoard[3];		//Y
				$scope.p 	= bBoard[4];		//p
				$scope.xPos = board[5];		//XPos
				$scope.yPos = board[6];		//YPos
			}
		}
		console.log($scope.id);
		//$scope.boards = $scope.currentQuery.boards;
	});

	$scope.saveBoard = function () {
		var id = $scope.id.toString();
		var adr = $scope.adr.toString();
		var x = $scope.x.toString();
		var y = $scope.y.toString();
		var p = $scope.p.toString();
		board = id +" " + adr + " " + x + " " + y +" " + p;
		console.log(board);
        queryService.setBoard(board)
        	.success(function(data, status, headers, config) {
        		console.log(data);
        		console.log(status);
        		console.log(headers);
        		console.log(config);
    			
    			//change path specific on user rights
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {
  				console.log(data);
        		console.log(status);
        		console.log(headers);
        		console.log(config);
  			});
    };


});

angular.module('advertioApp.directives', [])
.directive('map', function($http, $interval) {
	return {
		restrict: 'A',
		scope: {
            boards:"="
        },
		link: function(scope) 
		{	
			var greenIcon = L.icon({
			    iconUrl: 'img/Icons/car_green.png',
			    shadowUrl: 'img/Icons/shadow.png',

			    iconSize:     [96, 64], // size of the icon
			    shadowSize:   [64, 64], // size of the shadow
			    iconAnchor:   [31, 63], // point of the icon which will correspond to marker's location
			    shadowAnchor: [32, 40],  // the same for the shadow
			    popupAnchor:  [1, -61] // point from which the popup should open relative to the iconAnchor
			});

			var markers = {};			
			var map = L.map('map').setView([50.935824, 6.951172], 13);

			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);

			if(scope.boards != null)	
			{
			var Boards = scope.boards;
			console.log(Boards);
			for(var i = 0; i<Boards.length-1; i++){
				//console.log("here");
				//var position = Boards[i].position;
				var id = String(Boards[i][0]);
				var adr = String(Boards[i][1]);
				var x = String(Boards[i][5]);
				var y = String(Boards[i][6]);
				var p = String(Boards[i][4]);
				//console.log(x);
				
				//console.log(String(Boards[i][0]));

				//nicht schön aber replace ist mit , und . einfach scheisse
				//var xbuf = x.split(",");
				//var xnew = xbuf[0] + "." + xbuf[1];

				//var ybuf = y.split(",");
				//var ynew = ybuf[0] + "." + ybuf[1];

				//console.log(xnew);
				//console.log(ynew);
				var markerString = 'Werbetafel: <a href="/werbEdit/'+ id + '">' + id + '</a><br>Preis:' + p;
				//console.log(markerString);

				L.marker([x, y],{icon:greenIcon}).addTo(map).bindPopup(markerString);	
				//L.marker([50.9488, 6.924],{icon:greenIcon}).addTo(map).bindPopup(markerString);	
				}
			}

			// DEMO FIX

			function updateMarker(){
				$http.get('https://42-ways.de:8443/vehicle?vehicle_id=1').then(function(response){
				 	var Cars = response.data.vehicles;
					var position = Cars[0].lastposition;
					var x = (position.latitude || 50.9488);
					var y = (position.longitude || 6.924);
					demomarker.setLatLng([x,y],{icon:greenIcon}).update();
				});
			}
			//$interval(updateMarker, 2000);
		}
	};
});
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