// app.js
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'
import clientRoutes from './routes/client.routes.js'
import messageRoutes from './routes/message.routes.js';
import templateRoutes from './routes/template.routes.js'
import creditRoutes from './routes/credits.routes.js';
import languageRoutes from './routes/language.routes.js';
import dashboardRoutes from "./routes/dashboard.routes.js";
import userRoutes from './routes/user.routes.js';

const app = express();

// 📦 Middlewares
// app.use(cors({
//   origin: ['http://localhost:5173', ""], // ⚠️ ne pas utiliser '*'
//   credentials: true,               // permettre les cookies / tokens
// }));
app.use(cors())
app.use(express.json()); 

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/templates", templateRoutes);
app.use('/api/credits', creditRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("✅ API ImmoConnect backend est en ligne !");
});

export default app;
