import { rateLimit } from 'express-rate-limit';

let limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,

    message: {
        success: false,
        msg: "Too many requests. Try again later."
    }
});

export default limiter;