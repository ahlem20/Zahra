import Detail1 from "./detail1/Detail1";
import Chat from "../chat/Chat";
import List from "../list/list";

const App = () => {
  return (
    <>
      {/* Main Doctor Content */}
      <div className="container">
        
      <Detail1 />
        <Chat />
        <List />
      </div>
    </>
  );
};

export default App;
