import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/src/hooks/useUser";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userInfo: user } = useUser();
  const endpoint = process.env.NEXT_PUBLIC_SOCKET_HOST;

  useEffect(() => {
    if (endpoint && user) {
      const newSocket = io(endpoint);

      setSocket(newSocket);

      newSocket.emit("setup", user);

      newSocket.on("connected", () => {
        console.log("Socket connected");
      });

      // newSocket.on('connect_error', (error) => {
      //   console.error('Socket connection error:', error);
      // });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [endpoint, user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
