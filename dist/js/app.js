angular.module('advertioApp',['ui.bootstrap',
	'ngRoute',
	'ngResource',
	'ngCookies',
	'ngMd5',
	'advertioApp.controllers',
	'advertioApp.directives',
	'advertioApp.services'])
.config(function($routeProvider, $httpProvider, $locationProvider, $sceProvider) {

	//die Routes setzen
    $locationProvider.html5Mode(true);
    $locationProvider.html5Mode(true).hashPrefix('!');
	$routeProvider
		.when('/', {templateUrl: 'Partials/login.html'})
		.when('/map', {templateUrl: 'Partials/map.html', controller: 'mapController'})
		.when('/werbErst', {templateUrl: 'Partials/werbErst.html', controller: 'werbErstController'})
		.when('/kontakt', {templateUrl: 'Partials/kontakt.html', controller: 'kontaktController'})
		.when('/werbEdit/:id', {templateUrl: 'Partials/werbEdit.html', controller: 'werbEditController'})
		.when('/stream/:id', {templateUrl: 'Partials/stream.html', controller: 'streamController'});
	$httpProvider.defaults.useXDomain = true; 								//CORS
	$sceProvider.enabled(false);											//zum streaming der Daten erlauben
	delete $httpProvider.defaults.headers.common['X-Requested-With'];		//CORS
})
//BACKEND URL!!!!
.constant('config', {
    appName: 'advertioFrontend',
    apiUrl: 'http://backendsharpcologne.azurewebsites.net'
});
angular.module('advertioApp.controllers', [])
//Der Hauptcontroller der bei der Index geladen wird!
.controller('MasterCtrl', function($scope, $location, $cookies, authService, $rootScope, $uibModal, md5) {
	
	//globale variablen
	$scope.logedin = false;
	$rootScope.streaming = false;
	$rootScope.aktiv = "map";
	$scope.user = $cookies.get('user');
	 $scope.alerts = [
  	];

  	//gucken ob der user schon angemeldet ist
	if($scope.user != null)
	{
		var token = $cookies.get('token');
		console.log("loaded cookies for: " + $scope.user + " token: " + token);
		authService.setSettings($scope.user, token);
		$scope.logedin = true;
    	//change path specific on user rights
    	$location.path('/map');
	}

    $scope.width = window.innerWidth;

    //User login
	$scope.submit = function (usr) {
		//falls jemand schon wieder das Passwort per hand im klartext abgespeichert hat, nochmal das md5 PW ausgeben!
		console.log(md5.createHash(usr.passwort));

		var user = {};
		user.user = usr.user;
		user.passwort = md5.createHash(usr.passwort);	//passwort verschlüsseln
		//User Daten über den authService(das REST) an das Backend senden
        authService.login(user)
        	.success(function(data, status, headers, config) {
        		console.log(data);
    			authService.setSettings(usr.user, token);
				$scope.logedin = true;
    			$scope.user = usr.user;
    			$scope.alerts = [];
    			//wenn der User erfolgreich eingeloggt ist auf die map wechseln
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {

  				//falls es ein Fehler gibt, diesen ausgeben!
        		if(data== "error")
        			$scope.alerts.push({ type: 'danger', msg: 'User nicht bekannt!'});
        		else if(data == "wrongPW")
        			$scope.alerts.push({ type: 'danger', msg: 'Falsches Passwort!'});
        		else
        			$scope.alerts.push({ type: 'danger', msg: 'Unbekannter Fehler, bitte wenden sie sich an den Support!'});
  			});
    };

    //kleine funktion zum schliessen der Fehler alerts
    $scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };

	 //hiermit wird das WerbeEditieren Modal geöffnet (die ID abgefragt die editiert werden soll)
	$scope.werbEdit = function() {

		//Modal instanz öffnen (html und controller wird übergeben ID standartmässig auf 0, diese wird ja abgefragt)
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

			//hat sich der user entschieden wird genau diese Tafel zum Editieren aufgerufen
		    modalInstance.result.then(function (item) {
		    	//tafel mit besagter ID editieren
		    	$location.path('/werbEdit/'+item);
		    }, function () {
		     
		    });
		
    };

    //Das Modal das aufgerufen wird, wenn der Nutzer über die Navbar eine werbetafel anlegen will!
    $scope.werbAn = function() {

    	//modal öffnen
		var modalInstance = $uibModal.open({
		      animation: true,
		      templateUrl: 'anModal.html',
		      controller: 'anModalCtrl',
		      size: ''
		    });

			//das modal kann nur geschlossen werden, deswegen passiert hier nicht viel!
		    modalInstance.result.then(function () {
		    }, function () {
		     
		    });
		
    };

    //User loggt sich aus!
    $scope.logout = function() {
    	//cookies entfernen und zurück zum login Fenster!
        $cookies.remove('user');
        $cookies.remove('token');
		$scope.logedin = false;

		$location.path('/');
    };
})
//Hier werden die Tafeln auf der Karte angezeigt!
.controller('mapController', function($scope, queryService, $rootScope,  $uibModal) {
	//Oben die navbar auf map setzen
	$rootScope.aktiv = "map";
	$rootScope.streaming = false;

	//alle Boards vom Backend holen
	queryService.getBoards().then(function(response){
		//die boards kommen an
		$scope.currentQuery = response.data;

		$scope.boards = $scope.currentQuery;
		console.log($scope.boards);

	});

	//abfrage ob der Nutzer wirklich besagte tafel streamen will
	$scope.sureStream = function(streamID) {

		//Modal öffnen und die Werbetafel ID übergeben
		var modalInstance = $uibModal.open({
		      animation: true,
		      templateUrl: 'sureStreamModal.html',
		      controller: 'sureStreamModalCtrl',
		      size: '',
		      resolve: {
		        item: function () {
		          return streamID;
		        }
		      }
		    });

			//wenn der Nutzer auf OK drückt, wird genau diese Werbetafel gestreamt
		    modalInstance.result.then(function (item) {
		    	$location.path('/stream/'+item);
		    }, function () {
		     
		    });
    };
})
//Kontakt kontroller für die Partial Kontakt
.controller('kontaktController', function($scope, $routeParams, $rootScope, $location) {
	//setzt nur die Navbar auf kontakt
	$rootScope.aktiv = "kontakt";

})
//Werbetafel erstellen
.controller('werbErstController', function($scope, $routeParams, queryService, $rootScope, latllngService,$location) {
	$rootScope.aktiv = "werban";
	$scope.alerts = [
  	];
	console.log(latllngService.getLat());
	console.log(latllngService.getLng()); 

	//Alle Werte für das Formular initialisieren (wegen der regex kontrolle)
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

	//Funktion zum schliessen der Fehler alerts
	 $scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };

	  //Tafel wird an das Backend gesendet
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
    			
    			//auf die Map setzen, wenn die Tafel angelegt wurde
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {
  				//Fehler kann nur kommen, wenn die Adresse nicht korrket gesetzt wurde, der rest wird im Frontend gecheckt!
  				$scope.alerts.push({ type: 'danger', msg: 'StandortID nicht bekannt!'});

  			});
    };

    //abbruch also auf die Karte setzen
    $scope.dismiss = function () {
    	$location.path('/map');
    };

})
//werbetafel editieren
.controller('werbEditController', function($scope, $routeParams, queryService, $rootScope, $location, $uibModal) {
    //die ID der WErbetafel ist die ID in der Adresszeile
    var currentId = $routeParams.id;
    $rootScope.aktiv = "werbedit";

    //Alert Liste
    $scope.alerts = [
  	];
    /*
    $scope.id = 0;
		$scope.adr = 0;
		$scope.x = 0;
		$scope.y = 0;
		$scope.p = 0;
		var board = "";
		*/

	//das aktuelle Board holen
    queryService.getBoard(currentId)
	    .success(function(data, status, headers, config) {
			$scope.currentQuery = data;
			$scope.currentQuery.werbetafelMacAdresse = $scope.currentQuery.werbetafelMacAdresse.toLowerCase();
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
			//wenn das Board nicht gefunden wurde, dass auch zeigen
			$scope.keinBoard = data;
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
    			
    			//editieren hat geklappt, also auf Map setzen
    			$location.path('/map');
  			})
  			.error(function(data, status, headers, config) {
  				//Fehler kann nur kommen, wenn die Adresse nicht korrket gesetzt wurde, der rest wird im Frontend gecheckt
  				if(data.substring(0,1) == "W")
        			$scope.alerts.push({ type: 'danger', msg: 'StandortID nicht bekannt!'});

  			});
    };

    //Funktion zum schliessen der Alerts
    $scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };

	 //Board Löschen
    $scope.deleteBoard = function (boardID) {

    	//Board Löschen Modal öffnen
    	var modalInstance = $uibModal.open({
		      animation: true,
		      templateUrl: 'sureDeleteModal.html',
		      controller: 'sureDeleteModalCtrl',
		      size: '',
		      resolve: {
		        item: function () {
		          return boardID;
		        }
		      }
		    });

		    modalInstance.result.then(function (item) {
		    	queryService.deleteBoard(item)
		        	.success(function(data, status, headers, config) {
		    			
		    			//der Nutzer wollte die Tafel wirklisch löschen, also wurde das auch gemacht
		    			$location.path('/map');
		  			})
		  			.error(function(data, status, headers, config) {

		  			});
		    }, function () {
		     
		    });
    };

        
    //abbruch also zurück zur map
    $scope.dismiss = function () {
    	$location.path('/map');
    };


})
// ############## MODAL CONTROLLER  übergeben meist nur irgendwelche Werte ###########################
.controller('sureDeleteModalCtrl', function($scope, $uibModalInstance, item) {
	$scope.item = item;

	$scope.ok = function (item) {
    $uibModalInstance.close($scope.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

})
.controller('sureStreamModalCtrl', function($scope, $uibModalInstance, item) {
	$scope.item = item;

	$scope.ok = function (item) {
    $uibModalInstance.close($scope.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
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

	$scope.ok = function (item) {
    $uibModalInstance.close($scope.item.latlng);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

})
//HIER WIRD GESTREAMT!
.controller('streamController', function(config, $scope, $routeParams, queryService, $interval, $rootScope, $location) {
    $scope.currentId = $routeParams.id;
    $scope.stream = 0;
    $scope.streamURL = "";
    $rootScope.streaming = true;
    $rootScope.timer = 1;
    $rootScope.videoList = [];

    $rootScope.streamBoard  ={};

	/*
    //TAFEL HOLEN!
    queryService.getBoard($scope.currentId)
	    .success(function(data, status, headers, config) {
			$scope.currentQuery = data;

			$rootScope.streamBoard   = $scope.currentQuery;
			console.log($rootScope.streamBoard);

			// STREAM - INIT()
			queryService.createStream($rootScope.streamBoard )
			    .success(function(data, status, headers, config) {
					$scope.currentQuery = data;

					console.log($scope.currentQuery);

				})
				.error(function(data, status, headers, config) {
					console.log(data);
		  	});

		})
		.error(function(data, status, headers, config) {
			$scope.keinBoard = data;
			console.log($scope.board);
  	});
		*/

	//VIDEO LISTE HOLEN
	queryService.getVideos().then(function(response){
		$scope.bufferList = response.data;
		$rootScope.videoList = $scope.bufferList;
		console.log($rootScope.videoList);

	});

	//HIER UPDATEN WIR DAS VIDEO und spielen es ab...
    var tafel = $interval(function(){

    	//4 sek vor ende, wird setStream gecalled
    	if($rootScope.timer == 2)
    	{
    		queryService.getBoard($scope.currentId)
			    .success(function(data, status, headers, config) {
					$scope.currentQuery = data;

					$rootScope.streamBoard = $scope.currentQuery;
					console.log($rootScope.streamBoard);
					queryService.setStream($rootScope.streamBoard )
					    .success(function(data, status, headers, config) {
							$scope.currentQuery = data;

							console.log($scope.currentQuery);

						})
						.error(function(data, status, headers, config) {
							console.log(data);
				  	});

				})
				.error(function(data, status, headers, config) {
					$scope.keinBoard = data;
					console.log($scope.board);
		  	});
		}


    	//Abgelaufen- holen "stream" feld aus Werbetafel und setze es dann auf empty
    	if($rootScope.timer <= 0)
    	{
    		console.log($rootScope.videoList.length);
    		queryService.getBoard($routeParams.id).then(function(response){
    		//console.log($routeParams.id);
			$scope.currentQuery = response.data;
			$scope.board = $scope.currentQuery;

				//Wenn ein Video im stream feld steht
				if($scope.board.stream != "empty")
				{
					//stream url setzen
					$scope.streamURL = config.apiUrl  + "/api/stream/" + $scope.board.stream;

					//Video Liste durchlaufen um die Länge heraus zu finden
					for(var vid = 0; vid<=$rootScope.videoList.length-1; vid++)
					{
						console.log($rootScope.videoList[vid].name);
						//Video länge setzen (/2 damit wir nur alle 2 sekunden das intervall durchlaufen für die performance)
						if($rootScope.videoList[vid].name == $scope.board.stream)
							$rootScope.timer = $rootScope.videoList[vid].length/2;
					}

					console.log($rootScope.timer);

					//Double buffering damit die Streams nicht hängen, sollte ein Video noch laden und ein Video tag somit blockieren
					if($scope.stream == 1)
						$scope.stream = 2;
					else if($scope.stream == 2 || $scope.stream == 0)
						$scope.stream = 1;

					//Strema in den StreamOld schreiben und den stream auf empty setzen
					$scope.board.streamOld = $scope.board.stream;
					$scope.board.stream = "empty";
				}
				else
				{	
					//Kein Video also Advertio Logo zeigen! und 10 sekunden warten (timer x2, da wir ein 2 sek intervall haben)
					$scope.stream = 0;
					$scope.board.streamOld = $scope.board.stream;
					$rootScope.timer = 5;
				}

				//änderungen an das Backenschicken (also stream und streamOld)
				queryService.setBoard($scope.board)
		        	.success(function(data, status, headers, config) {
		        		console.log("setBoardSuccess");
		  			})
		  			.error(function(data, status, headers, config) {
		  					console.log("setBoardFAIL");
		  			});
			});
    	}
    	
    	$rootScope.timer--;
    	
    }, 2000);	//wird nur alle 2 sek aufgerufen

    
    //zurück zur map
    $scope.dismiss = function () {
    	//Timer und intervall killen
    	$interval.cancel(tafel);
        tafel = undefined;

        //zurück zur map
    	$location.path('/map');
	    $rootScope.streaming = false;


	    /*
    	queryService.getBoard($scope.currentId)
		    .success(function(data, status, headers, config) {
				$scope.currentQuery = data;

				$rootScope.streamBoard = $scope.currentQuery;
				console.log($rootScope.streamBoard );

				queryService.setStream($rootScope.streamBoard)
				    .success(function(data, status, headers, config) {
						$scope.currentQuery = data;

						console.log($scope.currentQuery);

					})
					.error(function(data, status, headers, config) {
						console.log(data);
			  	});
	    	

			})
			.error(function(data, status, headers, config) {
				$scope.keinBoard = data;
				console.log($scope.board);
	  	});
	  	*/
    	
    };
    
});

angular.module('advertioApp.directives', [])
//Es gibt nur eine directive die MAP!
.directive('map', function($http, $interval, $uibModal, latllngService) {
	
	//es werden die boards der karte übergeben!
	return {
		restrict: 'A',
		scope: {
            boards:"="
        },
		link: function(scope) 
		{	

			//Icon festlegen
			var icon = L.Icon.extend({
		       options: {
			     iconSize:     [50, 50], // size of the icon
			     iconAnchor:   [25, 45], // point of the icon which will correspond to marker's location
			     popupAnchor:  [0, -45] // point from which the popup should open relative to the iconAnchor
			       }
			   });

		   //beiden Icons initialisieren und Bilder laden!
		   var kTafel = new icon({ iconUrl: '/img/Icons/iconG.png'}),
		     gTafel = new icon({iconUrl: '/img/Icons/iconK.png'});

			var markers = {};			
			//Karte erstellen und auf Kölner Koordinaten setzen!
			var map = L.map('map').setView([50.935824, 6.951172], 13);

			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);

			//Bei Rechtsklick das Modal zum erstellen einer Werbetafel öffnen!
			map.on('contextmenu', function(e) {

			    var animationsEnabled = true;

			    //Hier wird das Modal aufgerufen, wenn rechts geklickt wird!
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
			    	//hier werden die LatLang Koordinaten in den Buffer service geladen
			      var setLat = latllngService.setLat(latlng.lat);
			      var setLng = latllngService.setLng(latlng.lng);

			      //ACHTUNG die Werbedit seite wird per href vom Modal geladen!

			    }, function () {
			     
			    });
			});


			//Wenn boards vorhanden sind, diese auf der Karte anzeigen lassen
			if(scope.boards != null)	
			{
			var Boards = scope.boards;

			//Alle Boards durchlaufen und die Marker erstellen mit den PopUps
			for(var i in Boards){

				var markerString = '<h2>Werbetafel:</h2>' + 
									'<table><tr><td>WerbetafelID:</td><td>' + Boards[i].werbetafelId + '</td></tr>' +
									'<tr><td>werbetafelMacAdresse: &nbsp &nbsp  </td><td> ' + Boards[i].werbetafelMacAdresse+'</td></tr>' +
									'<tr><td>AdressID: </td><td>' + Boards[i].adresse+'</td></tr>' +
									'<tr><td>Bildgröße (X-Achse): </td><td>' + Boards[i].dimensionX+'</td></tr>' +
									'<tr><td>Bildgröße (Y-Achse): </td><td>' + Boards[i].dimensionY+'</td></tr>' +
									'<tr><td>Preis: </td><td>' + Boards[i].preis+'</td></tr>' +
									'<tr><td>Längengrad: </td><td>' + Boards[i].xPos+ '</td></tr>' +
									'<tr><td>Breitengrad: </td><td>' + Boards[i].yPos+ '</table>'+
									'<br><br><button type="button" class="btn btn-primary"><a href ="/werbEdit/' +Boards[i].werbetafelId + '"><font color="white">editieren &nbsp<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></font></a> </button>' + '&nbsp' +
									'<button type="button" class="btn btn-primary" ><a href ="/stream/' +Boards[i].werbetafelId + '"><font color="white">stream &nbsp<span class="glyphicon glyphicon-film" aria-hidden="true"></span></font></a> </button>';
				//console.log(markerString);

				if(Boards[i].dimensionX <= 400)
					L.marker([Boards[i].xPos, Boards[i].yPos],{icon:kTafel}).addTo(map).bindPopup(markerString);
				else
					L.marker([Boards[i].xPos, Boards[i].yPos],{icon:gTafel}).addTo(map).bindPopup(markerString);
				//L.marker([50.9488, 6.924],{icon:greenIcon}).addTo(map).bindPopup(markerString);	
				}
			}
			//$interval(updateMarker, 2000);
		}
	};
});4
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