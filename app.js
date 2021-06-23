const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error:"));
db.once("open", () => {
    console.log("Database Connected");
})



const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds =  await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', catchAsync(async (req, res)=>{
    if(!req.body.campground) throw new ExpressError('Invalid Campground data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground =  await Campground.findById(id);
    res.render('campgrounds/show', {campground});
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const id = req.params.id;
    const campground =  await Campground.findById(id);
    res.render('campgrounds/edit', {campground});
}));

app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);

}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// app.use((err, req, res, next) => {
//     const { status = 500, message = 'Something Went Wrong' } = err;
//     res.status(status).send(message);
// })

app.all('*', (req, res ,next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something Went Wrong' } = err;
    res.status(statusCode)
    res.send('SOMETHING IS VERY VERY WRONG')
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
});