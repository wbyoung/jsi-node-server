var http = require('http');
var path = require('path');
var fs = require('fs');

var public = path.join(__dirname, 'public');

http.createServer(function(req, res) {
  console.log('[%s]: %s %s',
    req.connection.remoteAddress, req.method, req.url);

  var send404 = function() {
    res.writeHead(404);
    res.write('Not Found');
    res.end();
  };

  var resolvedPath = path.resolve(path.join(public, req.url));
  if (resolvedPath.indexOf(public) === 0) {
    var fileStream = fs.createReadStream(resolvedPath);
    fileStream.on('error', send404);
    fileStream.pipe(res);
  }
  else { send404(); }

}).listen(3030);
