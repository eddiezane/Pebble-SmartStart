var options;

Pebble.addEventListener("ready", function(e) {
  console.log("Ready");
  if(window.localStorage.getItem('username') && 
     window.localStorage.getItem('password')) {
       options = {
         'username': window.localStorage.getItem('username'),
         'password': window.localStorage.getItem('password')
       }
       options.sessid = doLogin();
     } else {
       Pebble.showSimpleNotificationOnPebble("SmartStart", "Please login through settings page!");
     }
});

Pebble.addEventListener("showConfiguration", function() {
  console.log("Config opened");
  Pebble.openURL("https://s3.amazonaws.com/assets.eddiezane.me/config.html");
});

Pebble.addEventListener("webviewclosed", function(e) {
  console.log("Config closed");
  if(e.response){
    options = JSON.parse(decodeURIComponent(e.response));
    window.localStorage.setItem('username', options.username);
    window.localStorage.setItem('password', options.password);
    doLogin();
  }
});

Pebble.addEventListener("appmessage", function(e) {
  console.log("Received message: " + JSON.stringify(e.payload.command));
  switch(e.payload.command) {
    case 0:
      fireCommand("arm", options.sessid);
      break;
    case 1:
      fireCommand("disarm", options.sessid);
      break;
    case 2:
      fireCommand("remote", options.sessid);
      break;
  }
});

function doLogin() {
  console.log("Inside doLogin");
  var res;
  var sessid;
  var req = new XMLHttpRequest();
  req.open('GET', 'https://colt.calamp-ts.com/auth/login/' + options.username + '/' + options.password, false);
  req.onload = function(e) {
    console.log("Inside onload");
    if(req.responseText === undefined) {
      Pebble.showSimpleNotificationOnPebble("SmartStart", "Error logging in, try again!");
      sessid = null;
      return null
    }
    res = JSON.parse(req.responseText);
    sessid = res.Return.Results.SessionID
  }
  req.send(null);
  return sessid;
}

function fireCommand(command, token) {
  console.log("Inside fireCommand");
  if(options.sessid == null) {
    return null;
  }
  var req = new XMLHttpRequest();
  req.open('GET', 'https://colt.calamp-ts.com/device/sendcommand/43853/'+ command + '?sessid=' + token, true);
  req.onload = function(e) {
    console.log("Inside onload");
    res = JSON.parse(req.responseText);
    console.log(res.Return.ResponseSummary.StatusCode);
  }
  req.send(null);
}
