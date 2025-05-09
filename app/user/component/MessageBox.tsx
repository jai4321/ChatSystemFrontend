"use client";
import UserList from "@/app/user/component/UserList";
import { useToast } from "@/context/ToastContext";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import UserMessageList from "./UserMessageList";
interface fileInfoTypes {
  name: String;
  url: String;
}
export default function MessageBox({ token }: any) {
  const { showToast } = useToast();
  const [progress, setProgress] = useState(0);
  const [canSend, setCanSend] = useState(true);
  const [userList, setUserList] = useState([]);
  const [skipData, setSkipData] = useState(15);
  const [messageOver, setMessageOver] = useState(false);
  const [preMessage, setPreMessage] = useState<any>([]);
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<fileInfoTypes | null>(null);
  const [messageList, setMessageList] = useState([]);
  const [receivedMessage, setReceivedMessage] = useState("");
  const [search, setSearch] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const [userSearch, setUserSearch] = useState("");
  const getUserList = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await response.json();
    if (data.status == 200) {
      return data.userList;
    }
  };

  const receiverSetter = (receiverId: string) => {
    console.log(receiverId);
    setReceiverId(receiverId);
  };

  const fileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCanSend(false);
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachment(file);
    const formData = new FormData();
    formData.append("file", file);
    console.log("inside");
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${process.env.NEXT_PUBLIC_BACKEND_URL}/fileupload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.response);
        setFileInfo({ name: file.name, url: response.fileurl });
        setCanSend(true);
      } else {
        console.log("Upload Failed");
      }
    };

    xhr.send(formData);
  };

  const fetchMessages = async (receiverId: string, skip: number = skipData) => {
    console.log(skipData);
    const responese = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
      {
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
      }
    );
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user`,
        {
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
        }
      );

      const data = await response.json();

      // const newMessages = data.messageList.filter(
      //   (msg: any) => !preMessage.some((prev) => prev._id === msg._id)
      // );
      setPreMessage((prev: any) => [...data.messageList, ...prev]);
      setSkipData((prev) => prev + data.messageList.length);
      setMessageOver(data.over);
    }
  };

  const closeAttachHandler = () => {
    setAttachment(null);
    setCanSend(true);
  };

  const buttonHandler = async () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: "message",
        receiverId: receiverId,
        message: message,
        attachment: fileInfo,
        token: token,
      };
      socketRef.current.send(JSON.stringify(payload));
      setMessage("");
      fetchMessages(receiverId, 15).then((data: any) => {
        setMessageList(data.messageList);
        setMessageOver(data.over);
        setFileInfo(null);
        setAttachment(null);
        setProgress(0);
      });
    } else {
      console.warn("WebSocket is not connected.");
    }
  };

  // Runs only once for user list polling
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUserList();
      console.log(data);
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
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);
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
    const handleBeforeUnload = () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "disconnect", token }));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "disconnect", token }));
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
  useEffect(() => {
    const fileInput = document.querySelector(
      ".attachmentInput"
    ) as HTMLInputElement | null;
    if (fileInput) {
      if (!attachment) {
        fileInput.value = "";
      }
    }
  }, [attachment]);

  return (
    <section className="MessageTab">
      <div className="sidebar">
        <div className="searchBar">
          <input
            type="search"
            name="searchUser"
            placeholder="Search User...."
            onKeyUp={(e: any) => {
              setUserSearch(e.target.value);
            }}
          />
        </div>
        <UserList
          userList={userList}
          receiverSetter={receiverSetter}
          search={search}
        />
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
                    attachments={message.attachments}
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
                    attachments={message.attachments}
                  />
                );
              })}
            <div ref={messageEndRef}></div>
          </div>
          <div className="messageBoxBody">
            {attachment && (
              <div className="attachDiv">
                <img src="/assets/file.png" alt="" />
                <div>
                  {progress < 100 && (
                    <p
                      className="progressBar"
                      style={{ width: `${progress}%` }}
                    ></p>
                  )}
                  <p className="fileInfo">{attachment.name}</p>
                </div>
                <button type="button" onClick={closeAttachHandler}>
                  X
                </button>
              </div>
            )}
            <form onSubmit={buttonHandler}>
              <div className="attachments">
                <button type="button">
                  <input
                    type="file"
                    className="attachmentInput"
                    onChange={fileHandler}
                  />
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/8455/8455362.png"
                    alt=""
                    width="100%"
                  />
                </button>
              </div>
              <input
                type="text"
                name="message"
                id=""
                placeholder="Type Message Here...."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="button"
                onClick={buttonHandler}
                className={canSend ? "" : "disableBtn"}
              >
                <img src="/assets/send.png" alt="" width="100%" />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
