"use client";
import UserList from "@/app/user/component/UserList";
import { useToast } from "@/context/ToastContext";
import React, {
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { json } from "stream/consumers";
import UserMessageList from "./UserMessageList";

export default function MessageBox({ token }: any) {
  const { showToast } = useToast();
  const [skipData, setSkipData] = useState(15);
  const [messageOver, setMessageOver] = useState(false);
  const [preMessage, setPreMessage] = useState([]);
  const [userList, setUserList] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [receivedMessage, setReceivedMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
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
      return data.userList;
    }
  };

  const receiverSetter = (receiverId: string) => {
    console.log(receiverId);
    setReceiverId(receiverId);
  };

  const fetchMessages = async (receiverId: string, skip: number = skipData) => {
    console.log(skipData);
    const responese = await fetch("http://localhost:3000/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId: receiverId,
        skip: skip,
        limit: 15,
      }),
      credentials: "include",
    });
    const data = await responese.json();
    if (data.status !== 200) {
      showToast(data.message, data.status);
    }
    return data;
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = async () => {
    const chatBox = messageListRef.current;
    if (!chatBox) return;
    if (chatBox.scrollTop === 0) {
      console.log(preMessage.length);
    }
    if (chatBox.scrollTop === 0 && !messageOver) {
      prevScrollHeightRef.current = chatBox.scrollHeight;

      const response = await fetch("http://localhost:3000/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: receiverId,
          skip: skipData,
          limit: 10,
        }),
        credentials: "include",
      });

      const data = await response.json();

      // const newMessages = data.messageList.filter(
      //   (msg: any) => !preMessage.some((prev) => prev._id === msg._id)
      // );
      setPreMessage((prev) => [...data.messageList, ...prev]);
      setSkipData((prev) => prev + data.messageList.length);
      setMessageOver(data.over);
    }
  };

  // Runs only once for user list polling
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
  // Runs when receiverId changes to setup WebSocket
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
      fetchMessages(receiverId).then((data: any) => {
        setMessageList(data.messageList);
        setMessageOver(data.over);
        setSkipData((prevData) => prevData + 10);
      });
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setReceivedMessage(data.message);
      fetchMessages(receiverId).then((data: any) => {
        setMessageList(data.messageList);
        setMessageOver(data.over);
      });
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
    const chatBox = messageListRef.current;
    if (!chatBox) return;

    chatBox.addEventListener("scroll", handleScroll);
    return () => {
      chatBox.removeEventListener("scroll", handleScroll);
    };
  }, [receiverId, messageOver, skipData, preMessage]);

  useLayoutEffect(() => {
    const chatBox = messageListRef.current;
    if (!chatBox) return;

    const newScrollHeight = chatBox.scrollHeight;
    const scrollDiff = newScrollHeight - prevScrollHeightRef.current;

    if (scrollDiff > 0) {
      chatBox.scrollTop = scrollDiff;
    }
  }, [preMessage]);

  // Scroll To Bottom when Message Load
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
      fetchMessages(receiverId, 15).then((data: any) => {
        setMessageList(data.messageList);
        setMessageOver(data.over);
      });
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
          <div className="messageList" ref={messageListRef}>
            {preMessage &&
              preMessage.map((message: any) => {
                return (
                  <UserMessageList
                    key={message._id}
                    messageid={message._id}
                    receiverId={receiverId}
                    senderId={message.senderId}
                    message={message.message}
                  />
                );
              })}
            {messageList &&
              messageList.map((message: any) => {
                return (
                  <UserMessageList
                    key={message._id}
                    messageid={message._id}
                    receiverId={receiverId}
                    senderId={message.senderId}
                    message={message.message}
                  />
                );
              })}
            <div ref={messageEndRef}></div>
          </div>
          <div className="messageBoxBody">
            <form onSubmit={buttonHandler}>
              <input
                type="text"
                name="message"
                id=""
                placeholder="Type Message Here...."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={buttonHandler}>
                <img src="/send.png" alt="" width="100%" />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
