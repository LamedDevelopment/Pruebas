// const corsOptions = {
//   origin: (origin: string, callback: Function) => {
//     const allowedOrigins = ['http://localhost:3000', 'http://localhost:3003', 'http://127.0.0.1:3003']; // Asegúrate de incluir 3003
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('No permitido por CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['x-token','Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
//   credentials: true,
//   preflightContinue: false,
// };

// export default corsOptions;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Proxy las solicitudes que comienzan con "/api"
        destination: "http://localhost:3000/api/:path*", // Redirige al backend
      },
    ];
  },
};

export default nextConfig;
