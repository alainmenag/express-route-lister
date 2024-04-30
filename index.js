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

api.list = (app, options = {}) =>
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

			let item = {
				symbol: '🚥',
				name: layer.name,
				regexp: regexp.slice(0, -1) || '/',
				route: (route.slice(0, -1) || '/').replace(/\(\.\*\)/g, '*'),
				file: api.locate(layer),
				methods: api.formatMethods(layer?.route?.methods || {'*': true}), // * is for all methods
				code: layer?.route?.stack[0]?.handle.toString() || layer?.handle.toString(),
			};

			let out = options?.include?.length || options?.exclude?.length ? {} : item;
			
			// include or exclude certain key-value pairs
			for (const key in item) if (options?.include?.length && options.include.includes(key))
			{
				out[key] = item[key];
			} else if (options?.exclude?.length && !options.exclude.includes(key))
			{
				out[key] = item[key];
			}
			
			list.push(out);

			// keep diving through child routes
			if (layer?.handle?.stack)
			{
				for (l of layer.handle.stack) getRoute(l, null, route);
			}
		}
	};

	// start looking thru paths/layers
	for (layer of stack) getRoute(layer);

	return list;
};

api.help = () =>
{
	console.log('🚥', '<reqTimestamp>', [ '<reqMethod>', '<routeMethod>' ], [ '<reqPath>', '<routePath>' ], '(<routeFile>)');
};

api.log = function(app, options)
{
	options = (app && !app.engine ? app : options) || {};
	app = app && app.engine ? app : null;

	const log = (route, req) =>
	{
		route.ts = new Date();
		route.method = req ? req.method : null;

		if (req && route.route) route.symbol = '✅';
		if (req && !route.route) route.symbol = '❌';

		if (options.output == 'json') return console.log(route);

		let methods = [ route.method ].concat(route.methods ? (route.methods || null) : null);

		let paths = [ req ? req.path : null ];
			paths = paths.concat(route.route ? [ (route.route || null) ] : null);

		console.log(route.symbol, route.ts, methods, paths, `(${ route.file || '' })`);
	};

	if (app)
	{
		api.help();

		const list = api.list(app);
	
		for (let route of list) log(route, null);
	}

	return function(req, res, next)
	{
		const list = api.list(req.app);
		
		const match = list.filter((p) =>
		{
			return p.regexp ? (new RegExp('^' + p.regexp + '$')).test(req.path) : null;
		}).pop();

		log(match || {}, req);
		
		next();
	};
}

api.http = function(options = {})
{
	return function(req, res, next)
	{
		const list = api.list(req.app, options);

		res.send(list);
	};
};

module.exports = {
	list: api.list,
	log: api.log,
	http: api.http,
};
