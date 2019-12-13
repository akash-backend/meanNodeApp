var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the salon model
var Salon = require('./schema/salon');
var config = require('./database'); // get db config file

module.exports = function(passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
      Salon.findOne({id: jwt_payload.sub}, function(err, salon) {
            if (err) {
                return done(err, false);
            }
            if (salon) {
                done(null, salon);
            } else {
                done(null, false);
            }
        });
    }));
  };
