import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/src/hooks/useUser";
import { useAppSelector } from "@/src/redux/hook";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userInfo: user } = useUser();
  const token = useAppSelector((state) => state.auth.token);
  const endpoint = process.env.NEXT_PUBLIC_SOCKET_HOST;

  useEffect(() => {
    if (endpoint && user && token) {
      // The backend rejects handshakes without a valid JWT; identity on the
      // server is derived from this token, not from event payloads.
      const newSocket = io(endpoint, { auth: { token } });

      setSocket(newSocket);

      newSocket.emit("setup", user);

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
