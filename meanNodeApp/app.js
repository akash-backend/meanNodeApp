var express = require('express'),
path = require('path'),
bodyParser = require('body-parser'),
cors = require('cors'),
http = require('http'),
multer = require('multer'),
passport = require('passport'),
mongoose = require('mongoose'),
config = require('./server/database');

var api = require('./server/apiroutes/api');
var userApi = require('./server/apiroutes/userApi');
var ressortApi = require('./server/apiroutes/ressortApi');
var logger = require('morgan');


global.__basedir = __dirname;
global.globalString = "/upload/";


const app = express();
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 4000;

app.use(cors());
app.use(passport.initialize()); 
app.use(logger('dev')); /* View logs */
app.use(passport.session());


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});


app.use('/api', api);
app.use('/userApi', userApi);
app.use('/ressortApi', ressortApi);
app.use('/gallery', express.static(__dirname + '/upload/salon'));



app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



mongoose.Promise = global.Promise;
mongoose.connect(config.database).then(
  () => {console.log('Database is connected') },
  err => { console.log('Can not connect to the database'+ err)}
  );


// error handler
app.use(function (err, req, res, next) {
// set locals, only providing error in development
res.locals.message = err.message;
res.locals.error = req.app.get('env') === 'development' ? err : {};
// render the error page
res.status(err.status || 500);
res.render('error');
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


const server = http.createServer(app);
server.listen(port, () => console.log(`API running on localhost:${port}`));