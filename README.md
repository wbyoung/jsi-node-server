# Node.js Servers

Creating a server with Node.js

> This repository is for learning purposes. It may intentionally contain bugs or
fail to function properly. The code may be purposefully difficult to read,
contain syntax errors, or only be a partial solution. You should not base code
off of this and absolutely should not use it in production.

Don't use this. Use [something else][express].

If you want to manually test a post request, one way to do so is:

```
curl --data "name=Whitney" http://localhost:3030/api/people
curl -X PUT --data "name=Whit" http://localhost:3030/api/people/1
```

[express]: http://expressjs.com
