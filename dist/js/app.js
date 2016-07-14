angular.module('advertioApp',['ui.bootstrap',
	'ngRoute',
	'ngResource',
	'ngCookies',
	'advertioApp.controllers',
	'advertioApp.directives',
	'advertioApp.services'])
.config(function($routeProvider, $httpProvider, $locationProvider, $sceProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.html5Mode(true).hashPrefix('!');
	$routeProvider
		.when('/', {templateUrl: 'Partials/login.html'})
		.when('/map', {templateUrl: 'Partials/map.html', controller: 'mapController'})
		.when('/werbErst', {templateUrl: 'Partials/werbErst.html', controller: 'werbErstController'})
		.when('/werbEdit/:id', {templateUrl: 'Partials/werbEdit.html', controller: 'werbEditController'})
		.when('/stream/:id', {templateUrl: 'Partials/stream.html', controller: 'streamController'});
	$httpProvider.defaults.useXDomain = true; 
	$sceProvider.enabled(false);
	delete $httpProvider.defaults.headers.common['X-Requested-With'];
})
.constant('config', {
    appName: 'advertioFrontend',
    apiUrl: 'http://advertioend.azurewebsites.net'
});
angular.module('advertioApp.controllers', [])
.controller('MasterCtrl', function($scope, $location, $cookies, authService, $rootScope, $uibModal) {
	
	$scope.logedin = false;
	$rootScope.streaming = false;
	$rootScope.aktiv = "map";
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
    			authService.setSettings(usr.user, token);
				$scope.logedin = true;
    			$scope.user = usr.user;
    			$scope.alerts = [];
    			//change path specific on user rights
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {
        		if(data== "error")
        			$scope.alerts.push({ type: 'danger', msg: 'User nicht bekannt!'});
        		else if(data == "wrongPW")
        			$scope.alerts.push({ type: 'danger', msg: 'Falsches Passwort!'});
        		else
        			$scope.alerts.push({ type: 'danger', msg: 'Unbekannter Fehler, bitte wenden sie sich an den Support!'});
  			});
    };

    $scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };

	$scope.werbEdit = function() {

		var modalInstance = $uibModal.open({
		      animation: true,
		      templateUrl: 'editModal.html',
		      controller: 'editModalCtrl',
		      size: '',
		      resolve: {
		        item: function () {
		          return 0;
		        }
		      }
		    });

		    modalInstance.result.then(function (item) {
		    	$location.path('/werbEdit/'+item);
		    }, function () {
		     
		    });
		
    };

    $scope.werbAn = function() {

		var modalInstance = $uibModal.open({
		      animation: true,
		      templateUrl: 'anModal.html',
		      controller: 'anModalCtrl',
		      size: ''
		    });

		    modalInstance.result.then(function () {
		    }, function () {
		     
		    });
		
    };

    $scope.logout = function() {
        $cookies.remove('user');
        $cookies.remove('token');
		$scope.logedin = false;

		$location.path('/');
    };
})
.controller('mapController', function($scope, queryService, $rootScope) {
	$rootScope.aktiv = "map";

	queryService.getBoards().then(function(response){
		$scope.currentQuery = response.data;
		//console.log($scope.currentQuery);
		//$scope.Buffer = $scope.currentQuery.split("-");


		//$scope.boards = new Array($scope.Buffer.length);
		$scope.boards = $scope.currentQuery;
		console.log($scope.boards);
		/*
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
		*/
		//$scope.boards = $scope.currentQuery.boards;
	});
})
.controller('werbErstController', function($scope, $routeParams, queryService, $rootScope, latllngService,$location) {
	$rootScope.aktiv = "werban";
	console.log(latllngService.getLat());
	console.log(latllngService.getLng()); 
	$scope.board = {};
	$scope.board.werbetafelMacAdresse = "00:00:00:00:00";
	$scope.board.adresse = 0;
	$scope.board.dimensionX = 0;
	$scope.board.dimensionY = 0;
	$scope.board.preis = 0;
	$scope.board.stream = "empty";
	$scope.board.streamOld = "empty";
	$scope.board.xPos = latllngService.getLat();
	$scope.board.yPos = latllngService.getLng();

	$scope.saveBoard = function () {
		/* Dank Json support nicht mehr nötig!
		var id = $scope.id.toString();
		var adr = $scope.adr.toString();
		var x = $scope.x.toString();
		var y = $scope.y.toString();
		var p = $scope.p.toString();
		board = id +" " + adr + " " + x + " " + y +" " + p;
		console.log(board);
		*/
        queryService.createBoard($scope.board)
        	.success(function(data, status, headers, config) {
    			
    			//change path specific on user rights
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {

  			});
    };

    $scope.dismiss = function () {
    	$location.path('/map');
    };

})
.controller('werbEditController', function($scope, $routeParams, queryService, $rootScope, $location) {
    var currentId = $routeParams.id;
    $rootScope.aktiv = "werbedit";
    /*
    $scope.id = 0;
		$scope.adr = 0;
		$scope.x = 0;
		$scope.y = 0;
		$scope.p = 0;
		var board = "";
		*/

    queryService.getBoard(currentId)
	    .success(function(data, status, headers, config) {
			$scope.currentQuery = data;
			//console.log($scope.currentQuery);
			//$scope.Buffer = $scope.currentQuery.split("-");

			$scope.board = $scope.currentQuery;
			console.log($scope.board);

			/* Nicht mehr nötig hab es auf JSON gestellt
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
			*/
			//$scope.boards = $scope.currentQuery.boards;
		})
		.error(function(data, status, headers, config) {
			$scope.keinBoard = data;
			console.log($scope.board);
  	});

	$scope.saveBoard = function () {
		/* Dank Json support nicht mehr nötig!
		var id = $scope.id.toString();
		var adr = $scope.adr.toString();
		var x = $scope.x.toString();
		var y = $scope.y.toString();
		var p = $scope.p.toString();
		board = id +" " + adr + " " + x + " " + y +" " + p;
		console.log(board);
		*/
        queryService.setBoard($scope.board)
        	.success(function(data, status, headers, config) {
    			
    			//change path specific on user rights
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {

  			});
    };

    $scope.deleteBoard = function () {

        queryService.deleteBoard($scope.board)
        	.success(function(data, status, headers, config) {
    			
    			//change path specific on user rights
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {

  			});
    };

    $scope.dismiss = function () {
    	$location.path('/map');
    };


})
.controller('anModalCtrl', function($scope, $uibModalInstance) {
	$scope.ok = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

})
.controller('editModalCtrl', function($scope, $uibModalInstance, item) {
	$scope.item = item;

	$scope.ok = function (item) {
    $uibModalInstance.close($scope.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

})
.controller('latModalCtrl', function($scope, $uibModalInstance, item) {
	$scope.item = item;

	$scope.ok = function () {
    $uibModalInstance.close($scope.item.latlng);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

})
.controller('streamController', function(config, $scope, $routeParams, queryService, $interval, $rootScope) {
    $scope.currentId = $routeParams.id;
    $scope.stream = 0;
    $scope.streamURL = "";
    $rootScope.streaming = true;
    $rootScope.timer = 1;
    $rootScope.videoList = [];


	queryService.getVideos().then(function(response){
		$scope.bufferList = response.data;
		$rootScope.videoList = $scope.bufferList;
		console.log($rootScope.videoList);

	});

    var tafel = $interval(function(){

    	$rootScope.timer--;

    	if($rootScope.timer == 0)
    	{
    		console.log($rootScope.videoList.length);
    		queryService.getBoard($routeParams.id).then(function(response){
    		//console.log($routeParams.id);
			$scope.currentQuery = response.data;
			$scope.board = $scope.currentQuery;


			if($scope.board.stream != "empty")
			{
				$scope.streamURL = config.apiUrl  + "/api/stream/" + $scope.board.stream;

				for(var vid = 0; vid<=$rootScope.videoList.length-1; vid++)
				{
					console.log($rootScope.videoList[vid].name);
					if($rootScope.videoList[vid].name == $scope.board.stream)
						$rootScope.timer = $rootScope.videoList[vid].length;
				}

				console.log($rootScope.timer);

				//Double buffering bitch
				if($scope.stream == 1)
					$scope.stream = 2;
				else if($scope.stream == 2 || $scope.stream == 0)
					$scope.stream = 1;

				$scope.board.streamOld = $scope.board.stream;
				$scope.board.stream = "empty";
			}
			else
			{
				$scope.stream = 0;
				$scope.board.streamOld = $scope.board.stream;
				$rootScope.timer = 10;
			}

			queryService.setBoard($scope.board)
	        	.success(function(data, status, headers, config) {
	        		console.log("setBoardSuccess");
	  			})
	  			.error(function(data, status, headers, config) {
	  					console.log("setBoardFAIL");
	  			});
		});
    	}
    	

    	//console.log($rootScope.timer);
    }, 1000);
		
});

angular.module('advertioApp.directives', [])
.directive('map', function($http, $interval, $uibModal, latllngService) {
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

			//Right click on the map activated
			map.on('contextmenu', function(e) {
			    //alert(e.latlng);
			    console.log("BLAH");
			    console.log(e.latlng);
			    var animationsEnabled = true;

			    var modalInstance = $uibModal.open({
			      animation: animationsEnabled,
			      templateUrl: 'createModal.html',
			      controller: 'latModalCtrl',
			      size: '',
			      resolve: {
			        item: function () {
			          return e;
			        }
			      }
			    });

			    modalInstance.result.then(function (latlng) {
			      var setLat = latllngService.setLat(latlng.lat);
			      var setLng = latllngService.setLng(latlng.lng);

			    }, function () {
			     
			    });
			});


			if(scope.boards != null)	
			{
			var Boards = scope.boards;
			console.log(Boards);
			//for(var i = 0; i<Boards.length-1; i++){
			for(var i in Boards){
				console.log(Boards[i]);
				//console.log("here");
				//var position = Boards[i].position;
				/*
				var id = String(Boards[i][0]);
				var adr = String(Boards[i][1]);
				var x = String(Boards[i][5]);
				var y = String(Boards[i][6]);
				var p = String(Boards[i][4]);
				*/
				
				//console.log(String(Boards[i][0]));

				//nicht schön aber replace ist mit , und . einfach scheisse
				//var xbuf = x.split(",");
				//var xnew = xbuf[0] + "." + xbuf[1];

				//var ybuf = y.split(",");
				//var ynew = ybuf[0] + "." + ybuf[1];

				//console.log(xnew);
				//console.log(ynew);
				var markerString = '<h2>Werbetafel:</h2>' + 
									'<br>WerbetafelID: ' + Boards[i].werbetafelId + 
									'<br>werbetafelMacAdresse: ' + Boards[i].werbetafelMacAdresse+
									'<br>AdressID: ' + Boards[i].adresse+
									'<br>GrößeX: ' + Boards[i].dimensionX+
									'<br>GrößeY: ' + Boards[i].dimensionY+
									'<br>Preis: ' + Boards[i].preis+
									'<br>xPos: ' + Boards[i].xPos+
									'<br>yPos: ' + Boards[i].yPos+
									'<br>nächster Stream: ' + Boards[i].stream+
									'<br>letzer Stream: ' + Boards[i].streamOld+
									'<br><br><a href ="/werbEdit/' +Boards[i].werbetafelId + '">editieren</a> ' +
									'<a href ="/stream/' +Boards[i].werbetafelId + '">stream</a>';
				//console.log(markerString);

				L.marker([Boards[i].xPos, Boards[i].yPos],{icon:greenIcon}).addTo(map).bindPopup(markerString);	
				//L.marker([50.9488, 6.924],{icon:greenIcon}).addTo(map).bindPopup(markerString);	
				}
			}
			//$interval(updateMarker, 2000);
		}
	};
});4
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