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
                <p>
                  Last Message <small>14:15 PM</small>
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
}
