require('dotenv').config();


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');


const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);


//database connection started
// const dbUrl = process.env.ATLASDB_URl;
// main()
// .then(() => console.log('Database Connected...'))
// .catch(err => console.log(err));

// async function main() {
//   await mongoose.connect(dbUrl);
// }

const dbUrl = process.env.ATLASDB_URL;

if (!dbUrl) {
  console.error('❌ Database URL is missing! Check your .env file.');
  process.exit(1);
}

main()
  .then(() => console.log('✅ Database Connected...'))
  .catch(err => console.error('❌ Database Connection Error:', err));

async function main() {
  await mongoose.connect(dbUrl); // No need for deprecated options
}
//database connection ended


const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter:24*3600,
})

store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE");
})

//session options
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now() + 1000*60*60*24*7,
    maxAge:1000*60*60*24*7,
    httpOnly:true
  }
}

// app.get("/" ,(req, res) => {
//   res.send("working successfully");
// })



app.use(session(sessionOptions));
app.use(flash());

//passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})






app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter )

app.all("*",(req,res,next)=>{
next(new ExpressError(404,"Page not found"));
});

app.use((err,req,res,next)=>{
  let{statusCode=500 , message="Something went wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{message});
});

app.listen(8080, () => {
  console.log("Server started at port 8080"); 
});
