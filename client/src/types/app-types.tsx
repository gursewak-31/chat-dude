
export interface Conversation{
    id: string,
    name: string
}

export interface User{
    id: string,
    name: string
}

export interface NewMsgNotification{
    senderid: string
}

export interface StoredMsg{
    id: string,
    message: string,
    senderId: string,
    userId: string,
    sendat: Date
}

export interface Chat{
    id: string,
    msg: string,
    sender_id: string,
    sender_name: string,
    conversation_id: string,
    created_at: Date
}