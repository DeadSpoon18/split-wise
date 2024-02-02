import { useState } from "react";

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

function App() {
  const getItemFromLocalStorage = localStorage.getItem("friendData")
    ? JSON.parse(localStorage.getItem("friendData"))
    : initialFriends;

  const [showAddFriend, setShowAddFriend] = useState(true);
  const [friends, setFriends] = useState(getItemFromLocalStorage);

  // const [selectedFriend, setSelectedFriend] = useState(null);

  const [friendId, setFriendId] = useState(null);

  const handleShowAddFriend = () => {
    setShowAddFriend((i) => !i);
  };

  return (
    <>
      <div>
        <h1 className="title">SplitWise</h1>
      </div>
      <div className="app">
        <div className="sidebar">
          <FriendsList
            friends={friends}
            setFriendId={setFriendId}
            friendId={friendId}
            setShowAddFriend={setShowAddFriend}
            setFriends={setFriends}
          />
          {showAddFriend && (
            <FormAddFriend
              setFriends={setFriends}
              setShowAddFriend={setShowAddFriend}
              friends={friends}
            />
          )}
          <Button onClick={handleShowAddFriend}>
            {showAddFriend ? "Close" : "Add Friend"}
          </Button>
        </div>
        {friendId && (
          <FormSplitBill
            friends={friends}
            friendId={friendId}
            setFriends={setFriends}
            setFriendId={setFriendId}
          />
        )}
      </div>
    </>
  );
}

const FriendsList = ({
  friends,
  setFriendId,
  friendId,
  setShowAddFriend,
  setFriends,
}) => {
  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          friend={friend}
          setFriendId={setFriendId}
          friendId={friendId}
          setShowAddFriend={setShowAddFriend}
          key={friend.id}
          setFriends={setFriends}
          friends={friends}
        />
      ))}
    </ul>
  );
};

const Friend = ({
  friend,
  setFriendId,
  friendId,
  setShowAddFriend,
  setFriends,
  friends,
}) => {
  const handleSelect = (id) => {
    if (friendId !== null && friendId === friend.id) {
      setFriendId(null);
    } else {
      setFriendId(id);
    }
    setShowAddFriend(false);
  };

  const handleDelete = (id) => {
    let data = [...friends];
    let filtered = data.filter((f) => f.id !== id);
    localStorage.setItem("friendData", JSON.stringify(filtered));
    setFriends(filtered);
  };

  const isSelected = friendId === friend.id;

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt="img" />
      <h3>{friend.name}</h3>
      {friend.balance < 0 && (
        <p className="red">
          You owe {friend.name} {Math.abs(friend.balance)} Rs
        </p>
      )}
      {friend.balance > 0 && (
        <p className="green">
          {friend.name} ows you {Math.abs(friend.balance)} Rs
        </p>
      )}
      {friend.balance === 0 && <p>You and {friend.name} are even.</p>}
      <Button onClick={() => handleSelect(friend.id)}>
        {isSelected ? "Close" : "Select"}
      </Button>
      <button onClick={() => handleDelete(friend.id)} disabled={isSelected} className="remove-btn">
        ❌
      </button>
    </li>
  );
};

const Button = ({ children, onClick }) => {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
};

const FormAddFriend = ({ setFriends, setShowAddFriend, friends }) => {
  const [friendName, setAddFriendName] = useState("");
  const [friendURL, setFriendURL] = useState("https://i.pravatar.cc/48");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!friendName || !friendURL) return;

    const newFriend = {
      id: crypto.randomUUID(),
      image: `${friendURL}?=${crypto.randomUUID()}`,
      balance: 0,
      name: friendName,
    };
    let updated = [...friends, newFriend];
    localStorage.setItem("friendData", JSON.stringify(updated));
    setFriends(updated);
    // thus spreading for making new array, push will mutate the original array and mostly don't rerender the DOM

    setShowAddFriend(false);
    //console.log(friends);

    setAddFriendName("");
  };

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>🧑‍🤝‍🧑Friend Name</label>
      <input
        type="text"
        value={friendName}
        onChange={(e) => setAddFriendName(e.target.value)}
      />

      <label>🌄 Image URL</label>
      <input
        type="text"
        value={friendURL}
        onChange={(e) => setFriendURL(e.target.value)}
      />

      <Button>Add</Button>
    </form>
  );
};

const FormSplitBill = ({ friends, friendId, setFriends, setFriendId }) => {
  const [billValue, setBillValue] = useState("");
  const [yourExpense, setYourExpense] = useState("");
  const paidByFriend = billValue ? billValue - yourExpense : " ";
  const [whoIsPaying, setWhoIsPaying] = useState("you");
  let friend = {};
  if (friendId) {
    friend = friends.find((f) => f.id === friendId);
  }
  // console.log(friend);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (whoIsPaying === "you") {
      setFriends(() =>
        friends.map((f) =>
          f.id === friendId
            ? { ...f, balance: friend.balance + paidByFriend }
            : f
        )
      );
      //console.log(friends);
    } else if (whoIsPaying === "friend") {
      setFriends(() =>
        friends.map((f) =>
          f.id === friendId
            ? { ...f, balance: friend.balance - yourExpense }
            : f
        )
      );
    }
    setFriendId(null);
  };

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>SPLIT BILL WITH {friend.name}</h2>

      <label>💰Bill value</label>
      <input
        type="text"
        value={billValue}
        onChange={(e) => setBillValue(Number(e.target.value))}
      />

      <label>🙆‍♂️Your expense</label>
      <input
        type="text"
        value={yourExpense}
        onChange={(e) =>
          setYourExpense(
            Number(e.target.value) > billValue
              ? yourExpense
              : Number(e.target.value)
          )
        }
      />

      <label>🧑‍🤝‍🧑{friend.name} value</label>
      <input type="text" disabled value={paidByFriend} />

      <label>🤑Who is paying the bill?</label>
      <select
        value={whoIsPaying}
        onChange={(e) => setWhoIsPaying(e.target.value)}
      >
        <option value="you">You</option>
        <option value="friend">{friend.name}</option>
      </select>
      <Button>Split</Button>
    </form>
  );
};

export default App;
