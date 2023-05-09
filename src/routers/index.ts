import { Router } from "express";

export const indexRouter = Router();

indexRouter.get('/', (req, res) => {
    res.status(200).json({
        success: true,
    })
})