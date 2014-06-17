var _ = require('lodash');
var http = require('http');
var path = require('path');
var fs = require('fs');
var qs = require('querystring');

var public = path.join(__dirname, 'public');
var people = {
  1: { id: 1, name: 'Adam' },
  2: { id: 2, name: 'Ariel' },
  3: { id: 3, name: 'Sam' },
  4: { id: 4, name: 'Grant' }
};

http.createServer(function(req, res) {
  console.log('[%s]: %s %s',
    req.connection.remoteAddress, req.method, req.url);

  var sendStatusCode = function(code, message) {
    res.writeHead(code);
    res.write(message);
    res.end();
  };

  var send500 = _.partial(sendStatusCode, 500, 'Server Error');
  var send404 = _.partial(sendStatusCode, 404, 'Not Found');

  var resolvedPath = path.resolve(path.join(public, req.url));
  var sendFile = function() {
    var fileStream = fs.createReadStream(resolvedPath);
    fileStream.on('error', function(e) {
      if (e.code === 'EISDIR') {
        resolvedPath = path.join(resolvedPath, 'index.html');
        sendFile();
      }
      else if (e.code === 'ENOENT') { send404(); }
      else { send500(); }
    });
    fileStream.pipe(res);
  };

  if (req.url === '/') {
    res.writeHead(302, {
      'Location': '/home/'
    });
    res.end();
  }
  else if (req.method === 'GET' && req.url === '/api/people') {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      people: _.values(people),
      status: 'ok'
    }));
  }
  else if (req.method === 'POST' && req.url === '/api/people') {
    var body = '';
    req.on('data', function(data) {
      body += data.toString();
    });
    req.on('end', function() {
      var bodyObject = qs.parse(body);
      var id = _.size(people) + 1;
      var newPerson = {
        id: id,
        name: bodyObject.name
      };
      people[id] = newPerson;
      res.end(JSON.stringify({
        person: newPerson,
        status: 'ok'
      }));
    });
  }
  else {
    if (resolvedPath.indexOf(public) === 0) { sendFile(); }
    else { send404(); }
  }

}).listen(3030);
