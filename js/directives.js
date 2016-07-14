angular.module('advertioApp.directives', [])
.directive('map', function($http, $interval, $uibModal, latllngService) {
	return {
		restrict: 'A',
		scope: {
            boards:"="
        },
		link: function(scope) 
		{	

			var icon = L.Icon.extend({
		       options: {
			     iconSize:     [50, 50], // size of the icon
			     iconAnchor:   [25, 45], // point of the icon which will correspond to marker's location
			     popupAnchor:  [0, -45] // point from which the popup should open relative to the iconAnchor
			       }
			   });

		   var kTafel = new icon({ iconUrl: '/img/Icons/iconG.png'}),
		     gTafel = new icon({iconUrl: '/img/Icons/iconK.png'});

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