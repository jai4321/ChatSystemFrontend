import { createSlice } from "@reduxjs/toolkit";

interface User {
    id: string;
    name: string;
    lastMessage: string;
    lastMessageTime: string;
}

const InitialState = {
    list: [];
}

const userSlice = createSlice({
    name: "user",
})