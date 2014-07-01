var ws;
var paused = false;
var focusListener;
var blurListener;

var sceneSize = 2000;

// Support both the WebSocket and MozWebSocket objects
if ((typeof (WebSocket) == 'undefined')
		&& (typeof (MozWebSocket) != 'undefined')) {
	WebSocket = MozWebSocket;
}

//This function moves from a position from leap space, 
// to a position in scene space, using the sceneSize
// we defined in the global variables section
function leapToScene( position ,event){

	
  var x = position[0] - event.interactionBox.center[0];
  var y = position[1] - event.interactionBox.center[1];
  var z = position[2] - event.interactionBox.center[2];
    
  x /= event.interactionBox.size[0];
  y /= event.interactionBox.size[1];
  z /= event.interactionBox.size[2];

  x *= sceneSize;
  y *= sceneSize;
  z *= sceneSize;

  z -= sceneSize;

  return new THREE.Vector3( x , y , z );

}


// Create the socket with event handlers
function initLeap() {
	// Create and open the socket
	ws = new WebSocket("ws://localhost:6437/v6.json");

	// On successful connection
	ws.onopen = function(event) {
		var enableMessage = JSON.stringify({
			enableGestures : true
		});
		ws.send(enableMessage); // Enable gestures
		ws.send(JSON.stringify({
			focused : true
		})); // claim focus

		focusListener = window.addEventListener('focus', function(e) {
			ws.send(JSON.stringify({
				focused : true
			})); // claim focus
		});

		blurListener = window.addEventListener('blur', function(e) {
			ws.send(JSON.stringify({
				focused : false
			})); // relinquish focus
		});

		document.getElementById("main").style.visibility = "visible";
		document.getElementById("connection").innerHTML = "Leap WebSocket connection open!";
	};

	// On message received
	ws.onmessage = function(event) {
		var obj = JSON.parse(event.data);
		var str = JSON.stringify(obj, undefined, 2);
		// document.getElementById("textdiv").innerHTML = '<pre>' + str +
		// '</pre>';
		// if (pauseOnGesture && obj.gestures.length > 0) {
		// togglePause();
		// }
		
		for ( var i = 0; i < 10; i++) {
			dedo[i].x = 0;
			dedo[i].y = 0;
			dedo[i].z = 0;
		}

		if (obj.hands) {
			//if(obj.hands && obj.hands[1])
			//console.log(dedo);
		
			for(var i = 0;i<obj.hands.length;i++){
				// console.log(hand.palmPosition[0]);
				var hand = obj.hands[i];
				// dedo.x = hand.stabilizedPalmPosition[0]*2;
				// dedo.y = hand.stabilizedPalmPosition[1];
				// dedo.z = hand.stabilizedPalmPosition[2]*2 -400;
				var pointables = obj.pointables;
	
				for ( var j = 0; j < 5; j++) {
					//dedo[i].x = pointables[i].btipPosition[0] * 2;
					//dedo[i].y = pointables[i].btipPosition[1] * 2;
					//dedo[i].z = pointables[i].btipPosition[2] * 2;
					dedo[i*5 +j] = leapToScene(pointables[i*5 + j].btipPosition,obj);
				}
			}
			
//			console.log(pointables[0].stabilizedTipPosition);

		} else {
			for ( var i = 0; i < 10; i++) {
				dedo[i].x = 0;
				dedo[i].y = 0;
				dedo[i].z = 0;
			}
		}
		
	};

	// On socket close
	ws.onclose = function(event) {
		ws = null;
		window.removeListener("focus", focusListener);
		window.removeListener("blur", blurListener);
		document.getElementById("main").style.visibility = "hidden";
		document.getElementById("connection").innerHTML = "WebSocket connection closed";
	}

	// On socket error
	ws.onerror = function(event) {
		alert("Received error");
	};
}

function togglePause() {
	paused = !paused;

	if (paused) {
		document.getElementById("pause").innerText = "Resume";
	} else {
		document.getElementById("pause").innerText = "Pause";
	}
}

function pauseForGestures() {
	if (document.getElementById("pauseOnGesture").checked) {
		pauseOnGesture = true;
	} else {
		pauseOnGesture = false;
	}
}