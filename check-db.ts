import dbConnect from "./lib/dbConnect";
import Venue from "./models/Venue";

async function check() {
  await dbConnect();
  const venues = await Venue.find({});
  console.log(JSON.stringify(venues, null, 2));
  process.exit(0);
}

check();
