
export interface ConnectionUser{
    id: string,
    name: string
}

export interface ClientMessage{
    type?: string,
    accessToken?: string,
    sendTo?: string,
    text?: string,
};