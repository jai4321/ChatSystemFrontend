interface UserListProps {
  userList: any[];
  receiverSetter: (id: string) => void;
}
export default function UserList(userListProps: UserListProps) {
  const { userList, receiverSetter } = userListProps;
  return (
    <div className="userList">
      {userList &&
        userList.map((item: any) => {
          const date = new Date(item.latestTimestamp);
          let hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
          const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;
          return (
            <div
              className="userListItem"
              key={item._id}
              onClick={() => receiverSetter(item._id)}
            >
              <div className="userListItemTop">
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/035/857/779/small/people-face-avatar-icon-cartoon-character-png.png"
                  alt=""
                  width="100%"
                />
              </div>
              <div className="userListItemBottom">
                <p>{item.username}</p>
                {item.latestMessage && (
                  <p>
                    {item.latestMessage}{" "}
                    <small>{formattedTime}</small>
                  </p>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
