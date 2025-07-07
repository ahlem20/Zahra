import Chat from "./chat/Chat";
import Detail from "./detail/Detail";
import List from "./list/List";

const Doctor = () => {

  return (
    <>
      {/* Main Doctor Content */}
      <div className="container">
       
      <Detail />
        <Chat />
        <List />
      </div>
    </>
  );
};

export default Doctor;
