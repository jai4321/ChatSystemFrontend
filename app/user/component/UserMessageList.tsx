interface UserListProps {
  messageid: string;
  receiverId: string;
  senderId: string;
  message: string;
  attachments: {
    name: string;
    url: string;
  };
}
export default function UserMessageList({
  messageid,
  receiverId,
  senderId,
  message,
  attachments,
}: UserListProps) {
  return (
    <div
      className={senderId == receiverId ? "messageOther" : "messageMe"}
      key={messageid}
    >
      <div>
        {attachments && (
          <p>
            <a href={attachments.url}>{attachments.name}</a>
          </p>
        )}
        <p>{message}</p>
      </div>
    </div>
  );
}
