import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt'; 
import userModel from "./userModel";
import createHttpError from "http-errors";
import { sign } from 'jsonwebtoken';
import { config } from "../../config/config";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
        return next(createHttpError(400, 'All fields are required'));
    }

    try {
        // Checking if user already exists
        const user = await userModel.findOne({ email });
        if (user) {
            return next(createHttpError(400, 'User already exists'));
        }

        // Hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Adding user into database
        const newUser = await userModel.create({
            name,
            email,
            password: hashedPassword
        });

        // Token generation
        const token = sign({ sub: newUser._id }, config.jwt_secret as string, { expiresIn: "7d" });

        return res.status(201).json({ accessToken: token });
    } catch (error) {
        return next(createHttpError(500, 'Internal Server Error'));
    }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(createHttpError(400, 'All fields are required.'));
    }

    try {
        // Checking if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return next(createHttpError(404, 'User not found'));
        }

        // Checking if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(createHttpError(400, 'Email or password incorrect'));
        }

        // Token generation
        const token = sign({ sub: user._id }, config.jwt_secret as string, { expiresIn: "7d" });

        return res.status(200).json({ accessToken: token });
    } catch (error) {
        return next(createHttpError(500, 'Internal Server Error'));
    }
};

export { createUser, loginUser };
