import React from 'react';
import ChatContainer from '../../_component/module/messages/chatContainer';
interface TChatWithFriendsProps {
  params: { chatId: string };
}

export default function ChatWithFriend({ params }: TChatWithFriendsProps) {
  return (
    <ChatContainer chatId={params?.chatId} showBack />
  );
}
