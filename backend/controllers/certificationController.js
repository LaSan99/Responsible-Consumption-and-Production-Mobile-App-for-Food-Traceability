const Certification = require('../models/Certification');

exports.createCertification = (req, res) => {
  const { name, authority, issued_date, expiry_date, description, certificate_number } = req.body;

  if (!name || !authority || !issued_date) {
    return res.status(400).json({ error: 'Name, authority, and issued date are required' });
  }

  Certification.create(name, authority, issued_date, expiry_date, description, certificate_number, req.user.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Certification created successfully',
      certification: {
        id: result.insertId,
        name,
        authority,
        issued_date,
        expiry_date,
        description,
        certificate_number
      }
    });
  });
};

exports.getCertifications = (req, res) => {
  Certification.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getCertificationById = (req, res) => {
  const { id } = req.params;
  Certification.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Certification not found' });
    res.json(results[0]);
  });
};

exports.getProducerCertifications = (req, res) => {
  Certification.getByProducer(req.user.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getProducerStats = (req, res) => {
  Certification.getProducerStats(req.user.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
};

exports.updateCertification = (req, res) => {
  const { id } = req.params;
  const { name, authority, issued_date, expiry_date, description, certificate_number } = req.body;

  Certification.update(id, name, authority, issued_date, expiry_date, description, certificate_number, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Certification updated successfully' });
  });
};

exports.deleteCertification = (req, res) => {
  const { id } = req.params;
  Certification.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Certification deleted successfully' });
  });
};

// Linking with product
exports.linkCertificationToProduct = (req, res) => {
  const { productId } = req.params;
  const { certificationId } = req.body;

  if (!certificationId) {
    return res.status(400).json({ error: 'Certification ID is required' });
  }

  Certification.linkToProduct(productId, certificationId, (err) => {
    if (err) {
      if (err.message.includes('already linked')) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Certification linked to product successfully' });
  });
};

exports.unlinkCertificationFromProduct = (req, res) => {
  const { productId, certificationId } = req.params;

  Certification.unlinkFromProduct(productId, certificationId, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Certification unlinked from product successfully' });
  });
};

exports.getProductCertifications = (req, res) => {
  const { productId } = req.params;
  Certification.getByProductId(productId, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
