const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const cors = require('cors');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const MONGODB_URI =
    process.env.MONGODB_URL ||
    'mongodb+srv://database:vbfgrt45%24%25@cluster0.lj6vk.mongodb.net/shop?w=majority';

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
});

const corsOptions = {
    origin: 'https://personal-app-cse341.herokuapp.com/',
    optionsSuccessStatus: 200,
};

const csrfProtection = csrf();

const app = express();

app.use(cors(corsOptions));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 't9cl4TGHaIKPzlmZGANclHdruB9i9UB6R64csrn6wD5J0UTYSnmpqAxj0m3Dudg',
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);

app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then((user) => {
            req.user = user;
            next();
        })
        .catch((err) => console.log(err));
});
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);
const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    family: 4,
};
mongoose
    .connect(MONGODB_URI, options)
    .then(() => {
        app.listen(process.env.PORT || 3000);
    })
    .catch((err) => {
        console.log(err);
    });
