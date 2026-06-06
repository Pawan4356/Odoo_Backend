function handleDbError(err, res) {
  console.error(err.message);

  if (err.code === '23505') {
    return res.status(409).json({ message: 'A record with this value already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced record does not exist' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  return res.status(500).json({ message: 'Server error' });
}

module.exports = { handleDbError };
