import { Request, Response, NextFunction } from "express";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isUnauthenticated()) {
        return res.status(401).json({ message: "User is unauthenticated." });
    }
    next();
}

export default isAuthenticated;