const mongoose = require('mongoose');

// Use commonjs style for simplicity in this script
async function check() {
  try {
    // Try to find the mongo uri from process.env or use default
    const uri = "mongodb://localhost:27017/futsal"; // Standard default
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    const VenueSchema = new mongoose.Schema({
      name: String,
      image: String,
      description: String
    }, { strict: false });
    
    const Venue = mongoose.models.Venue || mongoose.model('Venue', VenueSchema);
    
    const venues = await Venue.find({});
    console.log('Found ' + venues.length + ' venues');
    venues.forEach(v => {
      console.log('Venue: ' + v.name);
      console.log(' - Image: ' + v.image);
      console.log(' - Description: ' + v.description);
    });
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
