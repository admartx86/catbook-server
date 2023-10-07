require('dotenv').config();

const multer = require('multer');

const meowRoutes = require('./routes/meowRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

const fs = require('fs');
const https = require('https');

const privateKeyPath = process.env.PRIVATE_KEY_PATH;
const certificatePath = process.env.CERTIFICATE_PATH;
const caPath = process.env.CA_PATH;

const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');
const ca = fs.readFileSync(caPath, 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

const express = require('express');
const app = express();

const connectToDb = require('./config/connectToDb');
connectToDb();

const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      /^https:\/\/catbook\.dev$/,
      /^http:\/\/localhost:(\d+)$/,
      /^http:\/\/172.233.221.154:8080$/
    ];
    if (origin) {
      if (
        whitelist.some((allowedOrigin) => allowedOrigin.test(origin) || allowedOrigin === origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      callback(new Error('Origin not provided'), false);
    }
  },
  credentials: true
};

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src https://trusted.com; child-src 'none'"
  );
  next();
});
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const session = require('express-session');
const MongoStore = require('connect-mongo');
const sessionStore = MongoStore.create({
  mongoUrl: process.env.DB_URL,
  collection: 'sessions'
});
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,

    proxy: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    },
    store: sessionStore
  })
);

const passport = require('passport');
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log('---- New Incoming Request ----');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query Parameters:', req.query);
  next();
});

app.use('/meows', meowRoutes);
app.use('/auth', authRoutes);

app.use((req, res, next) => {
  console.log('Session: ', req.session);
  next();
});

if (process.env.NODE_ENV === 'development') {
  const http = require('http');
  http.createServer(app).listen(process.env.PORT);
  console.log('HTTP Backend Server running.');
} else {
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(process.env.PORT, () => {
    console.log('HTTPS Backend Server running.');
  });
}
