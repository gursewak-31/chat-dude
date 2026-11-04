import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import useUser from "@/hook/useUser";
import { getConnections, getChat, getUsers, addNewConnection } from "@/api/app-api";
import type { Conversation, NewMsgNotification, Chat } from "@/types/app-types";
import type { User } from "@/types/app-types";
import { FaComments, FaUserPlus } from 'react-icons/fa6';
import { HiUsers } from "react-icons/hi"
import { MdDownloadDone } from "react-icons/md";

export default function Home() {
    let [msg, setMsg] = useState('');
    let [msgNotification, setMsgNotification] = useState<NewMsgNotification[]>([]);
    let { user } = useUser();
    let [tab, setTab] = useState<"connections" | "users">("connections");
    let [connections, setConnections] = useState<Conversation[] | null>(null); // holds all conversations of user
    let [selectedConn, setSelectedConn] = useState<Conversation | null>(null);
    let [users, setUsers] = useState<User[] | null>(null); // holds all users who are not in conversation with user
    let [addConnectionState, setAddConnectionState] = useState<{[id: string]: "not added" | "adding" | "added"}>({});
    
    let [socket, setSocket] = useState<WebSocket | null>(null);
    let [chatHistory, setChatHistory] = useState<Chat[]>([]);

    function sendMessage(){
      if(!socket || !user || !selectedConn) return;

      let data = JSON.stringify({type: "message", sendTo: selectedConn.id, text: msg});
      socket.send(data);
      setMsg('');
    }

    async function handleAddConnection(connectionId: string){
      setAddConnectionState(prev => ({...prev, [connectionId]: "adding"}));
      let res = await addNewConnection(connectionId);
      if(res.success){
        setAddConnectionState(prev => ({...prev, [connectionId]: "added"}));
      }else{
        setAddConnectionState(prev => ({...prev, [connectionId]: "not added"}));
      }
    }

    useEffect(() => {
      if(!user) return;
      let newSocketObj = new WebSocket("ws://localhost:3001");
      setSocket(newSocketObj);
    }, [user]);

    useEffect(() => {
      if(socket){
        socket.onmessage = (e) => {
          let res = JSON.parse(e.data);

          if(res.type == "new_message"){
            // append new message to chat if sender is selected connection, else append to new message notification
            if(res.msgInfo.conversation_id == selectedConn?.id){
              setChatHistory(prevChat => [...prevChat, res.msgInfo]);
            }else{
              setMsgNotification(prevNotify => [...prevNotify, res.msgInfo]);
            }
          }else if(res.type == "message_status" && res.status == "sent"){
            setChatHistory(prevChat => [...prevChat, res.msgInfo]);
          }
        }
      }
    }, [socket]);

    useEffect(() => {
      if(selectedConn){
        (async () => {
          let res = await getChat(selectedConn?.id); // pass conversation id
          setChatHistory(res.data);

          // remove new message notification for selected connection
          setMsgNotification(msgNotification.filter((msg) => msg.senderid != selectedConn.id)); 
        })();

      }
    }, [selectedConn]);

    useEffect(() => {
      if(tab == "connections"){
        (async () => {
          let res = await getConnections();

          if(res.success && res.data.length != 0){
            setConnections(res.data);
            setSelectedConn(res.data[0]);
          }

        })();
      }else if(tab == "users"){
        (async () => {
          let res = await getUsers();
      
          if(res.success && res.data.length != 0){
            setUsers(res.data);
          }
        })();
      }
    }, [tab]);

    return(
        <div className="dark bg-background w-screen h-screen text-primary">
          <div className="bg-card flex gap-2 h-full">
            <div className="w-1/4 h-full flex gap-2 p-3">
              <div className="w-1/6 h-full">
                <Tabs orientation="vertical" className={"w-full"}>
                  <TabsList className="h-full w-full">
                    <TabsTrigger value={"connections"} onClick={() => setTab("connections")} ><FaComments size={24} /></TabsTrigger>
                    <TabsTrigger value={"users"} onClick={() => setTab("users")} ><HiUsers></HiUsers></TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex-1">
                {tab == "connections" ? (
                  <Tabs defaultValue={""} orientation="vertical" className={"w-full"}>
                    <TabsList className={"w-full"}>
                      {connections ? connections.map((con) => (
                        <TabsTrigger key={con.id} value={con.id} onClick={() => setSelectedConn(con)}>
                          <Avatar>
                            <AvatarFallback>{con.name[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {con.name} 
                          {/* {user?.id == con.id && '(self)'}  */}
                          {msgNotification.find((info) => info.senderid == con.id) && (<span className="text-white">•</span>)}
                        </TabsTrigger>
                      )) : <div className="text-center text-muted-foreground">No connections</div>}
                    </TabsList>
                  </Tabs>
                ) : (
                  <Tabs orientation="vertical" className={"w-full"}>
                    <TabsList className="h-full w-full">
                      {users?.map((user) => (
                        <TabsTrigger value={user.id} key={user.id}>
                          <Avatar>
                            <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {user.name}
                          <Button onClick={() => handleAddConnection(user.id)} className="ml-auto">
                            {addConnectionState[user.id] == "added" ? <MdDownloadDone />
                            : addConnectionState[user.id] == "adding" ? <div className="spinner"></div> 
                            : <FaUserPlus /> }
                          </Button>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}
              </div>
            </div>
            <div className="flex-1 border rounded-2xl flex flex-col p-1">
              <div className="flex-1 p-2 overflow-auto min-h-0">
                {chatHistory.map((msg) => (
                  <RenderChat chat={msg} selectedConn={selectedConn} user={user} key={msg.id} />
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <Textarea placeholder="write a message..." value={msg} onChange={(e) => setMsg(e.target.value)}></Textarea>
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </div>
        </div>
    )
}

type RenderChatProps = {
  chat: Chat, 
  selectedConn: Conversation | null,
  user: User | null
}
function RenderChat({chat, selectedConn, user}: RenderChatProps){
  return(
    <>
      <Message className="py-2">
        <MessageAvatar>
          <Avatar>
            <AvatarFallback>
              { chat?.sender_name[0]?.toUpperCase() }
            </AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent className="flex flex-row items-center gap-1">
          <Bubble>
            <BubbleContent>{chat.msg}</BubbleContent>
          </Bubble>
          <span className="text-[0.65rem] text-muted-foreground">
            {new Date(chat.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            })}
          </span>
        </MessageContent>
      </Message>
    </>
  )
}