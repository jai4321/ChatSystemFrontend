"use client";
import UserList from "@/app/user/component/UserList";
import { useToast } from "@/context/ToastContext";
import { use, useEffect, useRef, useState } from "react";
import { json } from "stream/consumers";

export default function UserMain({ token }: any) {
  const { showToast } = useToast();
  const [userList, setUserList] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [receivedMessage, setReceivedMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const getUserList = async () => {
    const response = await fetch("http://localhost:3000/api/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    if (data.status == 200) {
      return data.users;
    }
  };
  const receiverSetter = (receiverId: string) => {
    console.log(receiverId);
    setReceiverId(receiverId);
  };
  const fetchMessages = async (receiverId: string) => {
    const responese = await fetch("http://localhost:3000/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ receiverId: receiverId }),
      credentials: "include",
    });
    const data = await responese.json();
    if (data.status !== 200) {
      showToast(data.message, data.status);
    }
    console.log(data.messageList);
    setMessageList(data.messageList);
  };
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  // 1. Runs only once for user list polling
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUserList();
      setUserList(data);
    };
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);
    fetchData();
    return () => clearInterval(intervalId);
  }, []);
  // 2. Runs when receiverId changes to setup WebSocket
  useEffect(() => {
    if (!receiverId) return;
    const socket = new WebSocket("ws://localhost:8080");
    socketRef.current = socket;
    socket.onopen = () => {
      console.log("WebSocket connected");
      socket.send(
        JSON.stringify({
          type: "connect",
          token: token,
          receiverId: receiverId,
        })
      );
      fetchMessages(receiverId);
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setReceivedMessage(data.message);
      fetchMessages(receiverId);
      console.log("Message received:", event.data);
    };
    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "disconnect", token: token }));
      }
      socket.close();
    };
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messageList, receivedMessage]);
  const buttonHandler = async () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: "message",
        receiverId: receiverId,
        message: message,
        token: token,
      };
      socketRef.current.send(JSON.stringify(payload));
      setMessage(""); // Clear the input after sending
      await fetchMessages(receiverId);
    } else {
      console.warn("WebSocket is not connected.");
    }
  };
  return (
    <section className="MessageTab">
      <div className="sidebar">
        <div className="searchBar">
          <input
            type="search"
            name="searchUser"
            placeholder="Search User...."
          />
        </div>
        <UserList userList={userList} receiverSetter={receiverSetter} />
      </div>
      {receiverId && (
        <div className="messageBox">
          <div className="messageList">
            {messageList &&
              messageList.map((message: any) => {
                return (
                  <div
                    className={
                      message.senderId == receiverId
                        ? "messageOther"
                        : "messageMe"
                    }
                    key={message._id}
                  >
                    <p>{message.message}</p>
                  </div>
                );
              })}
            <div ref={messageEndRef}></div>
          </div>
          <div className="messageBoxBody">
            <input
              type="text"
              name="message"
              id=""
              placeholder="Type Message Here...."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={buttonHandler}>Send</button>
          </div>
        </div>
      )}
    </section>
  );
}
