const Listing = require("../models/listings.js");

// module.exports.index = async(req,res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs",{allListings});
// }

module.exports.index = async (req, res) => {
    const { category } = req.query;

    let filter = {};

    if (category) {
        filter.category = category;
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index.ejs", { allListings, category });
};

module.exports.renderNewForm =  (req,res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","The listing you requested for doesn't exist. ");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}

module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if(req.file){
        newListing.image = {
            url : req.file.path,
            filename : req.file.filename,
        };
    }
    newListing.category = req.body.listing.category;
    await newListing.save();
    req.flash("success","New listing created");
    res.redirect("/listings");
}

module.exports.editListingForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    // console.log(req.body);
    const updatedData = {
        title : req.body.listing.title,
        description : req.body.listing.description,
        category : req.body.listing.category,
        price : req.body.listing.price,
        location : req.body.listing.location,
        country : req.body.listing.country,
    };
    let listing = await Listing.findByIdAndUpdate(id,updatedData,{new:true});
    if(req.file){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success","Listing updated");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing deleted");
    res.redirect(`/listings`);
}

module.exports.searchListings = async (req, res) => {
  const query = req.query.q?.trim();

  if (!query || query.length === 0) {
      req.flash("error", "Please enter a destination");
      return res.redirect("/listings");
  }

  // Search in location OR country (case-insensitive)
  const allListings = await Listing.find({
    $or: [
      { location: { $regex: query, $options: "i" } },
      { country: { $regex: query, $options: "i" } }
    ]
  });

  res.render("listings/index", { allListings, category: null, query });
};