import "./list.css";
import Userinfo from "./userInfo/Userinfo";
import ChatList from "./chatList/ChatList";
import Footer from "./footer/Footer";
const List = () => {
  return (
      <div className="list">
       <Userinfo />
      <ChatList />
      <Footer/>
    </div>
  )
}

export default List;
