var fs 			= require('fs')
  , mincer		= require('mincer')
  , environment	= require('../environment');
module.exports = function(app) {
	app.use( '/assets', mincer.createServer( environment ));
	app.use(function(req, res, next) {
		if (typeof res.locals == 'undefined' || res.locals == null)
			res.locals = {};
	    res.locals.isXHR = (req.headers.hasOwnProperty('x-requested-with') && req.headers['x-requested-with'] === 'XMLHttpRequest') ? true : false;
	    next();
	});

};