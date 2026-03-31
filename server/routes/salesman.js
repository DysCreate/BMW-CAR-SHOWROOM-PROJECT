const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (req, file, cb) => cb(null, 'pfp-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET /api/salesman-profile?id=xxx
router.get('/salesman-profile', async (req, res) => {
  try {
    const { id } = req.query;

    // Get salesman user info
    const { data: profile, error: pErr } = await supabase
      .from('users')
      .select('id, name, email, profile_pic, join_date, salary, phone, created_at')
      .eq('id', id)
      .single();

    if (pErr) return res.status(500).json({ error: pErr.message });

    // Get all approved test drives assigned to this salesman (these count as "sales")
    const { data: sales, error: sErr } = await supabase
      .from('test_drives')
      .select('created_at')
      .eq('assigned_salesman', id)
      .eq('status', 'approved');

    if (sErr) return res.status(500).json({ error: sErr.message });

    // Build monthly sales counts for the last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth()
      });
    }

    const monthlySales = months.map(m => {
      const count = sales.filter(s => {
        const sd = new Date(s.created_at);
        return sd.getFullYear() === m.year && sd.getMonth() === m.month;
      }).length;
      return { label: m.label, count };
    });

    // Calculate tenure
    const joinDate = profile.join_date || profile.created_at;
    const joinD = new Date(joinDate);
    const diffMs = now - joinD;
    const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diffMonths / 12);
    const remainMonths = diffMonths % 12;
    const tenure = years > 0 ? `${years}y ${remainMonths}m` : `${remainMonths}m`;

    res.json({
      ...profile,
      tenure,
      totalSales: sales.length,
      monthlySales
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch salesman profile' });
  }
});

// POST /api/salesman-profile-pic — upload profile picture as file
router.post('/salesman-profile-pic', upload.single('profile_pic'), async (req, res) => {
  try {
    const { id } = req.body;
    const filePath = 'uploads/' + req.file.filename;

    const { data, error } = await supabase
      .from('users')
      .update({ profile_pic: filePath })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Profile pic updated', path: filePath });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload profile pic' });
  }
});

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
