const Contact = require('../models/contactModel');

exports.submitInquiry = (req, res) => {
  const { name, email, subject, message, category } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: 'Name, email, and message are required',
      success: false 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Please enter a valid email address',
      success: false 
    });
  }

  // Get client information
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip || req.connection.remoteAddress;

  Contact.create(name, email, subject, message, category, userAgent, ipAddress, (err, result) => {
    if (err) {
      console.error('Error creating contact inquiry:', err);
      return res.status(500).json({ 
        error: 'Failed to submit inquiry. Please try again.',
        success: false 
      });
    }

    res.status(201).json({ 
      message: 'Thank you for contacting us! We will respond within 24 hours.',
      success: true,
      inquiryId: result.insertId
    });
  });
};

exports.getAllInquiries = (req, res) => {
  Contact.getAll((err, results) => {
    if (err) {
      console.error('Error fetching inquiries:', err);
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
    res.json(results);
  });
};

exports.getInquiryById = (req, res) => {
  const { id } = req.params;
  
  Contact.getById(id, (err, results) => {
    if (err) {
      console.error('Error fetching inquiry:', err);
      return res.status(500).json({ error: 'Failed to fetch inquiry' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    res.json(results[0]);
  });
};

exports.updateInquiryStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['new', 'in_progress', 'resolved', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
    });
  }

  Contact.updateStatus(id, status, (err, result) => {
    if (err) {
      console.error('Error updating inquiry status:', err);
      return res.status(500).json({ error: 'Failed to update inquiry status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry status updated successfully' });
  });
};

exports.getInquiriesByStatus = (req, res) => {
  const { status } = req.params;

  Contact.getByStatus(status, (err, results) => {
    if (err) {
      console.error('Error fetching inquiries by status:', err);
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
    res.json(results);
  });
};

exports.getInquiryStats = (req, res) => {
  Contact.getStats((err, results) => {
    if (err) {
      console.error('Error fetching inquiry statistics:', err);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
    res.json(results[0]);
  });
};

exports.deleteInquiry = (req, res) => {
  const { id } = req.params;

  Contact.delete(id, (err, result) => {
    if (err) {
      console.error('Error deleting inquiry:', err);
      return res.status(500).json({ error: 'Failed to delete inquiry' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry deleted successfully' });
  });
};

// Send automated response email (placeholder - would integrate with email service)
exports.sendAutoResponse = (email, name, inquiryId) => {
  // This would integrate with an email service like SendGrid, Mailgun, etc.
  console.log(`Auto-response email would be sent to ${email} for inquiry #${inquiryId}`);
  
  // Example email content:
  const emailContent = {
    to: email,
    subject: 'Thank you for contacting FoodTrace - Inquiry #' + inquiryId,
    html: `
      <h2>Thank you for contacting FoodTrace!</h2>
      <p>Dear ${name},</p>
      <p>We have received your inquiry and will respond within 24 hours.</p>
      <p>Your inquiry ID is: <strong>#${inquiryId}</strong></p>
      <p>You can reference this ID in any follow-up communications.</p>
      <br>
      <p>Best regards,<br>The FoodTrace Support Team</p>
    `
  };
  
  // Here you would call your email service API
  // await emailService.send(emailContent);
};
