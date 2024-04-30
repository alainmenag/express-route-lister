/*

	expressRouteLister.log(app)

	console.log(expressRouteLister.list(app));

*/

const _cache = require('module')._cache;

const api = {};

api.parseRegex = (str) =>
{
	return !str ? null : str
		.split('/^')
		.pop()
		.replace(/\\/g, '')
		.split(':^').pop()
		.split('?(?')[0]
		.split('(?:([^/]+?))').join(':param') // hold param places
		.replace('?$/i', '')
		//.replace(/\(\.\*\)/g, '*') // make wildcard easy to read
		.toString();
};

api.formatMethods = (obj) =>
{
	return Object.keys(obj || {})
		.join(',')
		.toUpperCase()
		.split(',');
};

api.locate = (layer) =>
{
	for (const id in _cache)
	{
		const stack = _cache[id]?.exports?.stack || _cache[id]?.exports._router?.stack;
		
		if (stack && stack.indexOf(layer) > -1)
		{
			return id.replace(process.env.PWD, '');
		}
	}

	return null;
};

api.list = (app) =>
{
	const list = [];
	const stack = app ? app.stack || app?._router?.stack : null;
	
	if (!stack) return list; // no stack, no routes

	const getRoute = (layer, method, pathname) =>
	{
		let routes = layer && layer?.regexp.toString().split('|^'); // consider multi route routes
		
		if (!layer || !routes || !routes.length) return;
		
		for (rt of routes) // multi-path routes
		{
			let route = ((pathname || '') + api.parseRegex(rt).substr(pathname ? 1 : 0));
			let regexp = route.replace(/:param/g, "(?:([^/]+?))");

			// fill params with names
			if (layer.keys) for (key of layer.keys) route = route.replace(':param', ':' + key.name);

			// if it's middleware
			if (!layer?.handle?.stack && !layer.route)
			{
				list.push({
					name: layer.name,
					regexp: regexp.slice(0, -1) || '/',
					path: (route.slice(0, -1) || '/').replace(/\(\.\*\)/g, '*'),
					methods: ['*'],
					code: layer?.handle.toString(),
					file: api.locate(layer),
				});
			}

			// if defined route
			else if (layer.route)
			{
				list.push({
					name: layer.name,
					regexp: regexp.slice(0, -1) || '/',
					path: (route.slice(0, -1) || '/').replace(/\(\.\*\)/g, '*'),
					methods: api.formatMethods(layer.route.methods),
					code: layer.route?.stack[0]?.handle.toString(),
					file: api.locate(layer),
				});
			}

			// keep diving through child routes
			else if (layer?.handle?.stack)
			{
				for (l of layer.handle.stack) getRoute(l, null, route);
			}
		}
	};

	// start looking thru paths/layers
	for (layer of stack) getRoute(layer);

	return list;
};

api.log = (app = null, options = {}) =>
{
	const log = (route, req) =>
	{
		let ts = new Date();
		let methods = [ req ? req.method : null ];
			methods = methods.concat(route.methods ? (route.methods || null) : null);
		let paths = [ req ? req.path : null ];
			paths = paths.concat(route.path ? [ (route.path || null) ] : null);
		let symbol = '🚥';

		if (req && route.path) symbol = '✅';
		if (req && !route.path) symbol = '❌';

		console.log(symbol, ts, methods, paths, `(${ route.file || '' })`);
	};

	// if live logging as middleware
	if (options && options.live) return function(req, res, next)
	{
		const list = api.list(app);
		
		const match = list.filter((p) =>
		{
			//return p.regexp ? (new RegExp(p.regexp)).test(req._parsedUrl.path) : null;
			return p.regexp ? (new RegExp('^' + p.regexp + '$')).test(req.path) : null;
		}).pop();

		log(match || {}, req);
		
		next();
	};

	console.log('🚥', '<reqTimestamp>', [ '<reqMethod>', '<routeMethod>' ], [ '<reqPath>', '<routePath>' ], '(<routeFile>)');

	const list = api.list(app);

	for (let route of list) log(route, null);
}

module.exports = {
	list: api.list,
	log: api.log,
};
