angular.module('advertioApp.controllers', [])
.controller('MasterCtrl', function($scope, $location, $cookies, authService, $rootScope, $uibModal, md5) {
	
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
		console.log(usr);
		console.log(md5.createHash(usr.passwort));
		var user = {};
		user.user = usr.user;
		user.passwort = md5.createHash(usr.passwort);
        authService.login(user)
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
.controller('mapController', function($scope, queryService, $rootScope,  $uibModal) {
	$rootScope.aktiv = "map";
	$rootScope.streaming = false;

	queryService.getBoards().then(function(response){
		$scope.currentQuery = response.data;

		$scope.boards = $scope.currentQuery;
		console.log($scope.boards);

	});

	$scope.sureStream = function(streamID) {

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

		    modalInstance.result.then(function (item) {
		    	$location.path('/stream/'+item);
		    }, function () {
		     
		    });
    };
})
.controller('kontaktController', function($scope, $routeParams, $rootScope, $location) {
	$rootScope.aktiv = "kontakt";

})
.controller('werbErstController', function($scope, $routeParams, queryService, $rootScope, latllngService,$location) {
	$rootScope.aktiv = "werban";
	$scope.alerts = [
  	];
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

	    $scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };

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
  				$scope.alerts.push({ type: 'danger', msg: 'StandortID nicht bekannt!'});

  			});
    };

    $scope.dismiss = function () {
    	$location.path('/map');
    };

})
.controller('werbEditController', function($scope, $routeParams, queryService, $rootScope, $location, $uibModal) {
    var currentId = $routeParams.id;
    $rootScope.aktiv = "werbedit";

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
  				console.log(data);
  				console.log(data.substring(0,1));
  				if(data.substring(0,1) == "W")
        			$scope.alerts.push({ type: 'danger', msg: 'StandortID nicht bekannt!'});

  			});
    };

    $scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	  };


    $scope.deleteBoard = function (boardID) {

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
		    			
		    			//change path specific on user rights
		    			$location.path('/map');
		  			})
		  			.error(function(data, status, headers, config) {

		  			});
		    }, function () {
		     
		    });
    };

        

    $scope.dismiss = function () {
    	$location.path('/map');
    };


})
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


				if($scope.board.stream != "empty")
				{
					$scope.streamURL = config.apiUrl  + "/api/stream/" + $scope.board.stream;

					for(var vid = 0; vid<=$rootScope.videoList.length-1; vid++)
					{
						console.log($rootScope.videoList[vid].name);
						if($rootScope.videoList[vid].name == $scope.board.stream)
							$rootScope.timer = $rootScope.videoList[vid].length/2;
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
					$rootScope.timer = 5;
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
    	
    	$rootScope.timer--;
    	//console.log($rootScope.timer);
    }, 2000);

    
    $scope.dismiss = function () {
    	$interval.cancel(tafel);
        tafel = undefined;

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
