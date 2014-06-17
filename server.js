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

  var findNext = function (obj) {
    var nextUnique = _.size(obj);

    var iterate = function (obj) {
      if (obj[nextUnique]) {
        nextUnique += 1;
        console.log(nextUnique);
        iterate(obj);
      }
      else {return nextUnique;}
    };

    iterate(obj);
    return nextUnique;
  };

  var sendStatusCode = function(code, message) {
    res.writeHead(code);
    res.write(message);
    res.end();
  };

  var send500 = _.partial(sendStatusCode, 500, 'Server Error');
  var send404 = _.partial(sendStatusCode, 404, 'Not Found');

  var match;
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
      var id = findNext(people);
      console.log('received from findNext :' + id);
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
  else if (req.method === 'GET' &&
    (match = req.url.match(/^\/api\/people\/(\d+)$/))) {
    var id = match[1];
    var person = people[id];
    if (person) {
      res.end(JSON.stringify({
        person: person,
        status: 'ok'
      }));
    }
    else {
      res.writeHead(404);
      res.end(JSON.stringify({
        status: 'not found'
      }));
    }
  }
  else if (req.method === 'PUT' &&
    (match = req.url.match(/^\/api\/people\/(\d+)$/))) {
    var id = match[1];
    if (people[id]) {
      var body = '';
      var bodyObject = {};
      req.on('data', function(data) {
        body += data.toString();
      });
      req.on('end', function() {
        bodyObject = qs.parse(body);
        bodyObject.id = id;
        people[id] = bodyObject;
        if (bodyObject) {
          res.end(JSON.stringify({
            person: bodyObject,
            status: 'ok'
          }));
        }
      });
    }
    else { send404(); }
  }
  else if (req.method === 'DELETE' &&
    (match = req.url.match(/^\/api\/people\/(\d+)$/))) {
    var id = match[1];
    if (people[id]) {
      people = _.omit(people, id);
      res.end(JSON.stringify({
        people: _.values(people),
        status: 'ok'
      }));
    }
    else {send404();}
  }
  else {
    if (resolvedPath.indexOf(public) === 0) { sendFile(); }
    else { send404(); }
  }

}).listen(3030);
