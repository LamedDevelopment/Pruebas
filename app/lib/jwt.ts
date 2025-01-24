import jwt from 'jsonwebtoken';

// Usamos una clave secreta para firmar los JWT
const SECRET_KEY = process.env.JWT_SECRET || 'S0yUnBu3nD3s4rr0ll4d0rYQu13r0Tr4b4j4r';

// Función para generar un JWT
export function generateToken(userId: number, email: string, role: string) {
  const payload = { userId, email, role }; 
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
  return token;
}

// Función para verificar un JWT
export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    console.log(error);
    throw new Error("Token inválido o expirado");
  }
}
