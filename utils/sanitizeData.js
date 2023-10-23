export function sanitizeData(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName:user.lastName,
    email: user.email,
    permissions:user.role?.permissions
  }
} 
