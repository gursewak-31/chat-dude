import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { useEffect, useRef, useState } from "react";
import useUser from "@/hook/useUser";
import { getConnections, getChat, getUsers, addNewConnection } from "@/api/app-api";
import { logout, refresh } from "@/api/auth-api";
import { useNavigate } from "react-router-dom";
import type { Conversation, NewMsgNotification, Chat } from "@/types/app-types";
import type { User } from "@/types/app-types";
import { FaComments, FaUserPlus, FaArrowLeft } from 'react-icons/fa6';
import { HiUsers } from "react-icons/hi"
import { MdDownloadDone } from "react-icons/md";
import useToken from "@/hook/useToken";

export default function Home() {
    let [msg, setMsg] = useState('');
    let [msgNotification, setMsgNotification] = useState<NewMsgNotification[]>([]);
    let { user } = useUser();
    let { token, setToken } = useToken();
    let [tab, setTab] = useState<"connections" | "users">("connections");
    let [connections, setConnections] = useState<Conversation[] | null>(null); // holds all conversations of user
    let [selectedConn, setSelectedConn] = useState<Conversation | null>(null);
    let [mobileShowChat, setMobileShowChat] = useState(false);
    let [users, setUsers] = useState<User[] | null>(null); // holds all users who are not in conversation with user
    let [addConnectionState, setAddConnectionState] = useState<{[id: string]: "not added" | "adding" | "added"}>({});
    
    let [socket, setSocket] = useState<WebSocket | null>(null);
    let [chatHistory, setChatHistory] = useState<Chat[]>([]);
    let selectedConnRef = useRef(selectedConn);
    selectedConnRef.current = selectedConn;
    let redirect = useNavigate();

    function sendMessage(){
      if(!socket || socket.readyState !== WebSocket.OPEN || !user || !selectedConn || !msg.trim()) return;

      let data = JSON.stringify({type: "MESSAGE", sendTo: selectedConn.id, text: msg});
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

    async function handleLogout(){
      let res = await logout();

      if(res.success){
        setUsers(null);
        setToken('');
        redirect("/login");
      }
    }

    useEffect(() => {
      if(!user || !token) return;

      let url = import.meta.env.VITE_WS_URL;
      let newSocketObj = new WebSocket(url);
      setSocket(newSocketObj);

      newSocketObj.onopen = () => { // send access token for authentication on connection open
        newSocketObj.send(JSON.stringify({
          type: "AUTH",
          accessToken: token
        }));
      };

      newSocketObj.onmessage = (e) => {
        try {
          const res = JSON.parse(e.data);
          if(res.type == "NEW_MESSAGE"){
            // append new message to chat if sender is selected connection, else append to new message notification
            if(res.msgInfo.conversation_id == selectedConnRef.current?.id){
              setChatHistory(prevChat => [...prevChat, res.msgInfo]);
            }else{
              setMsgNotification(prevNotify => [...prevNotify, {senderid: res.msgInfo.conversation_id}]);
            }
          }else if(res.type == "MESSAGE_STATUS" && res.status == "sent"){
            setChatHistory(prevChat => [...prevChat, res.msgInfo]);
          }
        } catch {
          console.error("Received an invalid WebSocket message");
        }
      };

      newSocketObj.onclose = async (e) => {
        if(e.code === 4001){
          let newAccessToken = await refresh();

          if(newAccessToken){
            setToken(newAccessToken);

            newSocketObj.send(JSON.stringify({
              type: "AUTH",
              accessToken: newAccessToken
            }));
          }else{
            logout();
          }
        }
      }

      return () => {
        newSocketObj.close();
        setSocket(currentSocket => currentSocket === newSocketObj ? null : currentSocket);
      };
    }, [user, token]);

    useEffect(() => {
      if(selectedConn){
        (async () => {
          let res = await getChat(selectedConn?.id); // pass conversation id as first parameter
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
        <div className="dark h-dvh w-full overflow-hidden bg-background text-primary">
          <div className="flex h-full gap-2 bg-card p-2 sm:p-3">
            <div className={`${mobileShowChat ? "hidden" : "flex"} h-full w-full gap-2 md:flex md:w-[340px] md:shrink-0`}>
              <div className="h-full w-12 shrink-0 sm:w-14">
                <Tabs orientation="vertical" className={"w-full"}>
                  <TabsList className="h-full w-full">
                    <TabsTrigger value={"connections"} onClick={() => setTab("connections")} ><FaComments size={24} /></TabsTrigger>
                    <TabsTrigger value={"users"} onClick={() => setTab("users")} ><HiUsers></HiUsers></TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
                {tab == "connections" ? (
                  <Tabs defaultValue={""} orientation="vertical" className={"w-full min-h-0 flex-1 overflow-y-auto"}>
                    <TabsList className={"w-full flex-col items-stretch"}>
                      {connections ? connections.map((con, idx) => (
                        <TabsTrigger key={con.id} value={con.id} onClick={() => { setSelectedConn(con); setMobileShowChat(true); }} data-active={selectedConn?.id == con.id} className="min-w-0 justify-start">
                          <Avatar>
                            <AvatarFallback>{con.name[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{con.name}</span>
                          {/* {user?.id == con.id && '(self)'}  */}
                          {msgNotification.find((info) => info.senderid == con.id) && (<span className="text-white">•</span>)}
                        </TabsTrigger>
                      )) : <div className="text-center text-muted-foreground">No connections</div>}
                    </TabsList>
                  </Tabs>
                ) : (
                  <div className="w-full min-h-0 flex-1 overflow-y-auto">
                    <div className="w-full rounded-md bg-accent">
                      {users?.map((user) => (
                        <div key={user.id} className="flex min-w-0 items-center justify-between gap-2 rounded-md px-1.5 py-1 text-sm font-medium text-gray-400 transition-colors hover:bg-accent hover:text-accent-foreground">
                          <div className="flex min-w-0 items-center gap-2">
                            <Avatar>
                              <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="truncate">{user.name}</span>
                          </div>

                          <Button variant={"ghost"} onClick={() => handleAddConnection(user.id)} disabled={addConnectionState[user.id] == "adding" || addConnectionState[user.id] == "added"}>
                            {addConnectionState[user.id] == "added" ? (
                              <MdDownloadDone />
                            ) : addConnectionState[user.id] == "adding" ? (
                              <div className="spinner"></div>
                            ) : (
                              <FaUserPlus />
                            )}
                          </Button>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                <div className="flex items-center gap-2 rounded-2xl bg-accent p-2">
                  <Avatar>
                    <AvatarFallback>{user?.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex justify-between items-center">
                    <div className="min-w-0 text-sm">
                      <p className="truncate">{user?.name}</p>
                      <span className="block truncate text-xs text-gray-500">{user?.email}</span>
                    </div>
                    <div>
                      <Button variant={"outline"} onClick={handleLogout}>Log out</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${mobileShowChat ? "flex" : "hidden"} min-w-0 flex-1 flex-col rounded-2xl border p-1 md:flex`}>
              <div className="flex items-center gap-2 border-b px-2 py-2 md:hidden">
                <Button variant="ghost" size="sm" className="bg-accent" onClick={() => setMobileShowChat(false)}>
                  <FaArrowLeft />
                </Button>
                <Avatar>
                  <AvatarFallback>{selectedConn?.name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="truncate font-medium">{selectedConn?.name ?? "Chat"}</span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
                <div className="min-h-0 flex-1 overflow-y-auto">
                {chatHistory.map((msg) => (
                  <RenderChat chat={msg} selectedConn={selectedConn} user={user} key={msg.id} />
                ))}
                {!selectedConn && <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">Choose a conversation to start chatting.</p>}
                </div>
                <div className="flex shrink-0 items-end gap-2">
                  <Textarea className="min-h-11 max-h-32 flex-1 resize-y" placeholder="Write a message..." value={msg} onChange={(e) => setMsg(e.target.value)}></Textarea>
                  <Button onClick={sendMessage}>Send</Button>
                </div>
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
