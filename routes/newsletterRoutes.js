const express = require('express');
const nodemailer = require('nodemailer');
const Newsletter = require('../models/newsletterModel');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env

const router = express.Router();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "mail.lifelinecart.com",
  port: 465,
  secure: true, // Ensures the connection is secure
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route to subscribe to the newsletter
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email is already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ error: 'This email is already subscribed' });
    }

    // Add new subscriber to the database
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    res.status(200).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ error: 'Error subscribing to the newsletter' });
  }
});

// Route to send promotional emails to all subscribers
router.post('/send', async (req, res) => {
  const { subject, message } = req.body;

  try {
    // Get all subscribers
    const subscribers = await Newsletter.find();
    if (!subscribers.length) {
      return res.status(400).json({ error: 'No subscribers found' });
    }

    // Prepare email list and options
    const emails = subscribers.map(subscriber => subscriber.email);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails,
      subject: subject,
      text: message,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Error sending email', details: error });
      }
      res.status(200).json({ message: 'Promotional email sent successfully!', info });
    });
  } catch (error) {
    console.error('Error sending promotional emails:', error);
    res.status(500).json({ error: 'Error fetching subscribers or sending email' });
  }
});

// Route to get all subscribed emails
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Newsletter.find({}, 'email -_id'); // Fetch only email field
    if (!subscribers.length) {
      return res.status(404).json({ error: 'No subscribers found' });
    }
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Error fetching subscribers' });
  }
});

module.exports = router;
