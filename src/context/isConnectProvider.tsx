import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface IsConnectedContextType {
  isConnected: boolean;
  onlineUsers: string[];
  socket: Socket | null;
}

const IsConnectedContext = createContext<IsConnectedContextType | undefined>(
  undefined
);

export const IsConnectedProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useMemo(
    () =>
      io(`${process.env.NEXT_PUBLIC_SOCKET_HOST}`, {
        withCredentials: true,
        autoConnect: false, // Avoid immediate auto-connection
      }),
    []
  );

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
      socket.emit("setup", { _id: "sampleUserId" }); // Send user ID to server
      socket.emit("get online users"); // Explicitly request online users
    };

    const handleOnlineUsers = (users: string[]) => {
      console.log("Online users received:", users);
      setOnlineUsers(users);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setOnlineUsers([]); // Clear online users when disconnected
    };

    socket.on("connect", handleConnect);
    socket.on("online users", handleOnlineUsers);
    socket.on("disconnect", handleDisconnect);

    // Explicitly connect the socket
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("online users", handleOnlineUsers);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <IsConnectedContext.Provider value={{ isConnected, onlineUsers, socket }}>
      {children}
    </IsConnectedContext.Provider>
  );
};

export const useIsConnected = () => {
  const context = useContext(IsConnectedContext);

  if (!context) {
    throw new Error(
      "useIsConnected must be used within an IsConnectedProvider"
    );
  }

  return context;
};
