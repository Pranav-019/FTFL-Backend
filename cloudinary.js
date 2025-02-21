const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({ 
    cloud_name: 'dpo2nilaz', 
    api_key: '911471156814242', 
    api_secret: 'y7E31mtWn8SSQiMCTcJx6kYBwto' 
  });

module.exports = cloudinary;
