const Certification = require('../models/Certification');

exports.createCertification = (req, res) => {
  const { name, authority, issued_date, expiry_date } = req.body;

  Certification.create(name, authority, issued_date, expiry_date, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, message: 'Certification created' });
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

exports.updateCertification = (req, res) => {
  const { id } = req.params;
  const { name, authority, issued_date, expiry_date } = req.body;

  Certification.update(id, name, authority, issued_date, expiry_date, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Certification updated' });
  });
};

exports.deleteCertification = (req, res) => {
  const { id } = req.params;
  Certification.delete(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Certification deleted' });
  });
};

// Linking with product
exports.linkCertificationToProduct = (req, res) => {
  const { productId } = req.params;
  const { certificationId } = req.body;

  Certification.linkToProduct(productId, certificationId, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Certification linked to product' });
  });
};

exports.getProductCertifications = (req, res) => {
  const { productId } = req.params;
  Certification.getByProductId(productId, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
