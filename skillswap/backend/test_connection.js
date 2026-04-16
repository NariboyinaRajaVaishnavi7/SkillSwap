const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
if (dns.setDefaultResultOrder) { dns.setDefaultResultOrder("ipv4first"); }
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing connection to:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error details:', err);
        process.exit(1);
    });
