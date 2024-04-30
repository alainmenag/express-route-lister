
# Get Started

## Install

```bash
npm install express-route-lister
```

## Import

### Code

```js
const express = require('express');
const expressRouteLister = require('express-route-lister');

const app = express();
```

## Log Routes on Init.

### Code

```js
app.listen(3001, '127.0.0.1', (e) =>
{
	expressRouteLister.log(app); // log all routes on app. start
});
```
### Output

```log
🚥 2024-04-30T02:49:45.136Z [ null, '*' ] [ null, '/' ] (/routes/index.js)
🚥 2024-04-30T02:49:45.137Z [ null, '*' ] [ null, '/' ] (/routes/index.js)
🚥 2024-04-30T02:49:45.137Z [ null, '*' ] [ null, '/' ] (/routes/index.js)
🚥 2024-04-30T02:49:45.137Z [ null, '*' ] [ null, '/' ] (/routes/index.js)
🚥 2024-04-30T02:49:45.137Z [ null, '*' ] [ null, '/' ] (/routes/index.js)
🚥 2024-04-30T02:49:45.137Z [ null, '*' ] [ null, '/' ] (/routes/index.js)
🚥 2024-04-30T02:49:45.137Z [ null, 'GET' ] [ null, '/' ] (/routes/index.js)
🚥 2024-04-30T02:49:45.137Z [ null, '*' ] [ null, '/_:id' ] (/routes/api/bin.js)
🚥 2024-04-30T02:49:45.137Z [ null, '*' ] [ null, '/_:id/*' ] (/routes/api/bin.js)
🚥 2024-04-30T02:49:45.137Z [ null, '*' ] [ null, '/_*' ] (/routes/api/bin.js)
🚥 2024-04-30T02:49:45.138Z [ null, '*' ] [ null, '/api/bin/_:id' ] (/routes/api/bin.js)
🚥 2024-04-30T02:49:45.138Z [ null, '*' ] [ null, '/api/bin/_:id/*' ] (/routes/api/bin.js)
🚥 2024-04-30T02:49:45.138Z [ null, '*' ] [ null, '/api/bin/_*' ] (/routes/api/bin.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'POST' ] [ null, '/api/obs/actions/restart' ] (/routes/api/obs-sub.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'DELETE' ] [ null, '/api/obs/actions/group/wakeup/:pizza' ] (/routes/api/obs-sub-sub.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'GET' ] [ null, '/api/obs' ] (/routes/api/obs.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'GET' ] [ null, '/api/obs/:sceneUuid' ] (/routes/api/obs.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'POST' ] [ null, '/api/obs/resource' ] (/routes/api/obs.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'GET' ] [ null, '/api/litra' ] (/routes/api/litra.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'GET' ] [ null, '/api/litra/:id' ] (/routes/api/litra.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'POST' ] [ null, '/api/litra/dial/:id' ] (/routes/api/litra.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'POST' ] [ null, '/api/litra/toggle/:id' ] (/routes/api/litra.js)
🚥 2024-04-30T02:49:45.138Z [ null, 'GET' ] [ null, '/api/screenshot/cleanup' ] (/routes/api/screenshot.js)
```

## Middleware Live Logger

### Code

```js
app.use(expressRouteLister.log(app, { live: true }));
```

### Output

```log
✅ 2024-04-30T02:49:48.687Z [ 'GET', 'GET' ] [ '/api/obs', '/api/obs' ] (/routes/api/obs.js)
❌ 2024-04-30T02:50:11.581Z [ 'GET', null ] [ '/api/obsd', null ] ()
✅ 2024-04-30T02:50:24.593Z [ 'GET', 'GET' ] [ '/api/litra/23424234234', '/api/litra/:id' ] (/routes/api/litra.js)
✅ 2024-04-30T02:55:00.653Z [ 'GET', 'GET' ] [ '/', '/' ] (/routes/index.js)
```

## Array of Objects

### Code

```js
const routes = expressRouteLister.list(app); // log all routes

console.log(routes);
```

### Output

```log
[
	{
		name: 'query',
		regexp: '/',
		path: '/',
		methods: [ '*' ],
		code: 'function query(req, res, next){\n...'
		file: '/routes/index.js'
	},
	{
		name: 'expressInit',
		regexp: '/',
		path: '/',
		methods: [ '*' ],
		code: 'function expressInit...',
		file: '/routes/index.js'
	},

	...

	{
		name: 'bound dispatch',
		regexp: '/api/obs/resource',
		path: '/api/obs/resource',
		methods: [ 'POST' ],
		code: 'async function(req, res)...',
		file: '/routes/api/obs.js'
	}
]
```

# Dictionary

## Symbols

- 🚥 - Existing Route
- ✅ - Live log on HTTP request successfully matched to a route
- ❌ - Live log on HTTP request failed to match to a route
