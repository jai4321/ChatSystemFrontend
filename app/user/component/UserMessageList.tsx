interface UserListProps {
  messageid: string;
  receiverId: string;
  senderId: string;
  message: string;
}
export default function UserMessageList({
  messageid,
  receiverId,
  senderId,
  message,
}: UserListProps) {
  return (
    <div
      className={senderId == receiverId ? "messageOther" : "messageMe"}
      key={messageid}
    >
      <p>{message}</p>
    </div>
  );
}
