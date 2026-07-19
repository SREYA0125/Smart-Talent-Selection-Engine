import { ROLES } from "../constants/roles.js";

/*
|--------------------------------------------------------------------------
| Authorize Middleware
|--------------------------------------------------------------------------
| Restricts access based on user roles.
|
| Must always run AFTER protect middleware.
|--------------------------------------------------------------------------
*/

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {

    // Safety check
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: "Authorization middleware requires authentication middleware.",
      });
    }

    // Check role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
};