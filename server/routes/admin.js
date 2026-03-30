const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// POST /api/add-car
router.post('/add-car', async (req, res) => {
  try {
    const { model_name, price, image } = req.body;

    const { data, error } = await supabase
      .from('cars')
      .insert({ model_name, price, image: image || '' })
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

    // Per-salesman performance
    const { data: salesmen } = await supabase.from('users').select('*').eq('role', 'salesman');

    const salesmanStats = await Promise.all(
      (salesmen || []).map(async (s) => {
        const { count: handled } = await supabase.from('test_drives').select('*', { count: 'exact', head: true }).eq('assigned_salesman', s.id);
        const { count: approvedCount } = await supabase.from('test_drives').select('*', { count: 'exact', head: true }).eq('assigned_salesman', s.id).eq('status', 'approved');
        return { name: s.name, email: s.email, handled: handled || 0, approved: approvedCount || 0 };
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

module.exports = router;
