const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
if (dns.setDefaultResultOrder) { dns.setDefaultResultOrder("ipv4first"); }
require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String, email: String, teach: Array, learn: Array, careerGoal: String
});
const User = mongoose.model("User", UserSchema);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({}, "name teach learn careerGoal");
    const fs = require("fs");
    fs.writeFileSync("users_report.json", JSON.stringify(users, null, 2));
    console.log("Report written to users_report.json");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
