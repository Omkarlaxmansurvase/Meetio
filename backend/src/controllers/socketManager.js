import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server);


    io.on("connection", (socket) => {

        // Handle joining a call
        socket.on("join-call",(path)=>{

            if(connections[path]===undefined){
                
            }

        })

        // Handle incoming signals
        socket.on("signal",(toId,message)=>{
            io.to(toId).emit("signal",socket.id,message);
        })

        // Handle disconnection
        socket.on("disconnect",()=>{

        });
    });

    return io;
}