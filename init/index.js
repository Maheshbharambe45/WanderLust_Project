const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');

//database connection started
main()
.then(() => console.log('Database Connected...'))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/WanderLust');
}
//database connection ended

const initDb = async () => {
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({...obj , owner:"6795e6011c65cc5f7f1a0c90"}));
    await Listing.insertMany(initdata.data);
    console.log('Data was initialized');
}
 
initDb();