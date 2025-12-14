require("dotenv").config({path : "../.env"});
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");


const MONGO_URL = process.env.ATLASDB_URL;

main()
.then(() =>{
    console.log("connected to db");
})
.catch((err) =>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner:"693bf0ec61ac4f633d02baaf"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");

};

initDB();
