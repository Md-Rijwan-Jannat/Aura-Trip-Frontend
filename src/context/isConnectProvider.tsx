import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/src/redux/hook";

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
  const token = useAppSelector((state) => state.auth.token);

  const socket = useMemo(
    () =>
      io(`${process.env.NEXT_PUBLIC_SOCKET_HOST}`, {
        withCredentials: true,
        autoConnect: false, // Avoid immediate auto-connection
        // Server-side handshake auth: connections without a valid JWT are
        // rejected.
        auth: token ? { token } : {},
      }),
    [token]
  );

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      // Server derives identity from the verified handshake token — payload
      // (previously the hardcoded "sampleUserId") is ignored.
      socket.emit("setup");
      socket.emit("get online users");
    };

    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    const handleDisconnect = () => {
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
