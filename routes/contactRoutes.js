const express = require('express');
const router = express.Router();
const Contact = require('../models/contactModel'); // Ensure correct path

// POST API to submit contact form
router.post('/submit', async (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;

    // Validate input fields
    if (!firstName || !lastName || !email || !phone || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create a new contact document
        const newContact = new Contact({ firstName, lastName, email, phone, message });

        // Save contact to the database
        const savedContact = await newContact.save();

        res.status(201).json({
            message: 'Thank You For Enquiring At FTFL Technologies... We will Get Back To You Soon',
            contact: savedContact,
        });
    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET API to fetch all contact form submissions
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find();

        if (!contacts || contacts.length === 0) {
            return res.status(404).json({ message: 'No contacts found' });
        }

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET API to fetch a specific contact by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json(contact);
    } catch (error) {
        console.error('Error fetching contact by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE API to remove a contact by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedContact = await Contact.findByIdAndDelete(id);

        if (!deletedContact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
