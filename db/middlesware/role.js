function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }
    next();
  };
}

module.exports = requireRole;
