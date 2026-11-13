import dotenv from "dotenv";

dotenv.config();

function requiredString(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const portValue = requiredString("PORT");
const port = Number(portValue);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
}

export const env = {
    port,
    clientOrigin: requiredString("CLIENT_ORIGIN"),
};
