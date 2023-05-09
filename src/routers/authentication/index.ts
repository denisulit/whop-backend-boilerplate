import { Router } from "express";
import { register } from "../../controllers/authentication/register";
import { login } from "../../controllers/authentication/login";

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);