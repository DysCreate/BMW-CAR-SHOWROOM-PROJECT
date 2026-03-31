const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const multer = require('multer');
const path = require('path');

// Save uploads to project root /uploads folder
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST /api/add-car (with optional image upload)
router.post('/add-car', upload.single('image'), async (req, res) => {
  try {
    const { model_name, price, badge } = req.body;
    const image = req.file ? 'uploads/' + req.file.filename : (req.body.auto_image || '');

    const { data, error } = await supabase
      .from('cars')
      .insert({ model_name, price, image, badge: badge || '' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Car added', car: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add car' });
  }
});

// GET /api/cars
router.get('/cars', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// DELETE /api/car/:id
router.delete('/car/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

// GET /api/admin-stats
router.get('/admin-stats', async (req, res) => {
  try {
    // Total counts
    const { count: totalTestDrives } = await supabase.from('test_drives').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabase.from('test_drives').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: approved } = await supabase.from('test_drives').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: rejected } = await supabase.from('test_drives').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer');
    const { count: totalReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
    const { count: totalCars } = await supabase.from('cars').select('*', { count: 'exact', head: true });

    // Per-salesman performance with monthly sales
    const { data: salesmen } = await supabase.from('users').select('*').eq('role', 'salesman');

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth()
      });
    }

    const salesmanStats = await Promise.all(
      (salesmen || []).map(async (s) => {
        const { count: handled } = await supabase.from('test_drives').select('*', { count: 'exact', head: true }).eq('assigned_salesman', s.id);
        const { count: approvedCount } = await supabase.from('test_drives').select('*', { count: 'exact', head: true }).eq('assigned_salesman', s.id).eq('status', 'approved');

        // Monthly sales data
        const { data: sales } = await supabase
          .from('test_drives')
          .select('created_at')
          .eq('assigned_salesman', s.id)
          .eq('status', 'approved');

        const monthlySales = months.map(m => {
          const count = (sales || []).filter(td => {
            const d = new Date(td.created_at);
            return d.getFullYear() === m.year && d.getMonth() === m.month;
          }).length;
          return { label: m.label, count };
        });

        // Tenure
        const joinDate = s.join_date || s.created_at;
        const joinD = new Date(joinDate);
        const diffMonths = Math.floor((now - joinD) / (1000 * 60 * 60 * 24 * 30));
        const years = Math.floor(diffMonths / 12);
        const remMonths = diffMonths % 12;
        const tenure = years > 0 ? `${years}y ${remMonths}m` : `${remMonths}m`;

        return {
          id: s.id, name: s.name, email: s.email, salary: s.salary || 'Not set',
          profile_pic: s.profile_pic || '', tenure,
          handled: handled || 0, approved: approvedCount || 0,
          monthlySales
        };
      })
    );

    res.json({
      totalTestDrives: totalTestDrives || 0,
      pending: pending || 0,
      approved: approved || 0,
      rejected: rejected || 0,
      totalUsers: totalUsers || 0,
      totalReviews: totalReviews || 0,
      totalCars: totalCars || 0,
      salesmanStats
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/all-users
router.get('/all-users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/update-salary
router.put('/update-salary', async (req, res) => {
  try {
    const { id, salary } = req.body;
    console.log('Updating salary for id:', id, 'to:', salary);

    const { data, error } = await supabase
      .from('users')
      .update({ salary: salary })
      .eq('id', id)
      .select()
      .single();

    console.log('Update result:', { data, error });

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'User not found or not updated' });
    res.json({ message: 'Salary updated', user: data });
  } catch (err) {
    console.error('Update salary error:', err);
    res.status(500).json({ error: 'Failed to update salary' });
  }
});

module.exports = router;
