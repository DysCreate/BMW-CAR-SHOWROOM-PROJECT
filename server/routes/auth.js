const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return res.status(401).json({ error: 'User not found' });
    if (data.password !== password) return res.status(401).json({ error: 'Invalid password' });

    res.json({
      _id: data.id,
      name: data.name,
      email: data.email,
      role: data.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const { data, error } = await supabase
      .from('users')
      .insert({ name, email, password, role: 'customer' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      _id: data.id,
      name: data.name,
      email: data.email,
      role: data.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
