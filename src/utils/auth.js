import { auth } from '../firebase';

export const generateToken = async (user) => {
  const token = await user.getIdToken();
  const isAdmin = user.email.startsWith('admin@');
  return { token, isAdmin };
};

export const verifyToken = async (token) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    const newToken = await currentUser.getIdToken();
    return {
      email: currentUser.email,
      isAdmin: currentUser.email.startsWith('admin@'),
      token: newToken
    };
  } catch (error) {
    return null;
  }
}; 