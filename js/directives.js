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