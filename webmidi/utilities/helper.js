(function () {
	if (!console) {
		console = {};
	}
	var old = console.log;
	var logger = document.getElementById('log');
	console.log = function (message) {
		if (typeof message == 'object') {
			logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : String(message)) + '<br />';
		} else {
			logger.innerHTML += message + '<br />';
		}
	}
	function logger(container, label, data){
		messages = label + " [cmd: " + (data[0] >> 4) + ", type: " + data[0] + " , note: " + data[1] + " , velocity: " + data[2] + "]";
		container.textContent = messages;
	}
})();