const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET /api/test-drives
router.get('/test-drives', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('test_drives')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test drives' });
  }
});

// PUT /api/test-drive/:id
router.put('/test-drive/:id', async (req, res) => {
  try {
    const { status, assigned_salesman } = req.body;

    const { data, error } = await supabase
      .from('test_drives')
      .update({ status, assigned_salesman })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: `Test drive ${status}`, testDrive: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update test drive' });
  }
});

// GET /api/reviews
router.get('/reviews', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/review-reply
router.post('/review-reply', async (req, res) => {
  try {
    const { review_id, reply } = req.body;

    const { data, error } = await supabase
      .from('reviews')
      .update({ reply })
      .eq('id', review_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Reply added', review: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reply' });
  }
});

module.exports = router;
