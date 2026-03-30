const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// POST /api/book-test-drive
router.post('/book-test-drive', async (req, res) => {
  try {
    const { user_id, user_name, user_email, user_phone, car_model, date } = req.body;

    const { data, error } = await supabase
      .from('test_drives')
      .insert({ user_id, user_name, user_email, user_phone, car_model, date })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Test drive booked successfully', testDrive: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book test drive' });
  }
});

// GET /api/my-test-drives?user_id=xxx
router.get('/my-test-drives', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('test_drives')
      .select('*')
      .eq('user_id', req.query.user_id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test drives' });
  }
});

// POST /api/review
router.post('/review', async (req, res) => {
  try {
    const { user_id, user_name, content } = req.body;

    const { data, error } = await supabase
      .from('reviews')
      .insert({ user_id, user_name, content })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Review submitted', review: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;
