const jwt = require("jsonwebtoken");

module.exports = function auth(req: import("express").Request & { userId?: number }, res: import("express").Response, next: import("express").NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Token missing" });

  const parts = header.split(" ");
  if (parts.length !== 2) return res.status(401).json({ message: "Token error" });

  const token = parts[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.userId = decoded.userId;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
