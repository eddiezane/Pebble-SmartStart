var options;

Pebble.addEventListener("ready", function(e) {
  if(window.localStorage.getItem('username') && 
     window.localStorage.getItem('password')) {
       options = {
         'username': window.localStorage.getItem('username'),
         'password': window.localStorage.getItem('password')
       }
       options.sessid = login();
     } else {
       Pebble.showSimpleNotificationOnPebble("SmartStart", "Please login through settings page!");
     }
});

Pebble.addEventListener("showConfiguration", function() {
  Pebble.openURL("https://s3.amazonaws.com/assets.eddiezane.me/config.html");
});

Pebble.addEventListener("webviewclosed", function(e) {
  if(e.response){
    options = JSON.parse(decodeURIComponent(e.response));
    options.sessid = login();
    if(options.sessid == null) {
      window.localStorage.setItem('username', null);
      window.localStorage.setItem('password', null);
      return null;
    }
    window.localStorage.setItem('username', options.username);
    window.localStorage.setItem('password', options.password);
  }
});

Pebble.addEventListener("appmessage", function(e) {
  var command = e.payload.command;
  switch(command) {
    case 0:
      sendCommand("arm");
      break;
    case 1:
      sendCommand("disarm");
      break;
    case 2:
      sendCommand("remote");
      break;
  }
});

// Returns a SessionID
function login() {
  var res;
  var sessid;
  var req = new XMLHttpRequest();
  req.open('GET', 'https://colt.calamp-ts.com/auth/login/' + options.username + '/' + options.password, false);
  req.onload = function(e) {
    if(req.responseText === undefined) {
      Pebble.showSimpleNotificationOnPebble("SmartStart", "Error logging in, try again!");
      sessid = null;
      options.username = null;
      options.password = null;
      options.sessid = null;
      return null
    }
    res = JSON.parse(req.responseText);
    sessid = res.Return.Results.SessionID
  }
  req.send(null);
  return sessid;
}

function sendCommand(command) {
  if(options.sessid == null) {
    respondBack(-1);
    return null;
  }
  var res;
  var req = new XMLHttpRequest();
  req.open('GET', 'https://colt.calamp-ts.com/device/sendcommand/43853/'+ command + '?sessid=' + options.sessid, true);
  req.onload = function(e) {
    if(req.responseText === undefined) {
      Pebble.showSimpleNotificationOnPebble("SmartStart", "Error sending command");
      sessid = null;
      options.username = null;
      options.password = null;
      options.sessid = null;
      return null;
    }
    res = JSON.parse(req.responseText);
    respondBack(res.Return.ResponseSummary.StatusCode);
  }
  req.send(null);
}

function respondBack(res) {
  // Pebble.sendAppMessage(data, ackHandler, nackHandler);
  if(res == -1) {
    Pebble.showSimpleNotificationOnPebble("SmartStart", "Error sending command");
  } else if(res == 0) {
    Pebble.showSimpleNotificationOnPebble("SmartStart", "Command sent successfully");
  }
}
