import  React, {useEffect,useState,useRef} from 'react';
import './App.css';
import ChatTextBox from './components/ChatTextBox';
import Login from './components/Login';
import Register from './components/Register';
import NavBar from './components/NavBar';
import ChatContactList from './components/ChatContactList';
import ChatView from './components/ChatView';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import axios from 'axios';

function App() {
  const [messages,setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [userid, setUserid] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedUserChat, setSelectedUserChat] = useState('');
  const ws = useRef(null);
  const wsUrl = useRef(null);
  const serverUrl = useRef(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production'){
      wsUrl.current = 'wss://messagapp.herokuapp.com/';
      serverUrl.current = 'https://messagapp.herokuapp.com/';
    }else{
      wsUrl.current = 'ws://localhost:8080/';
      serverUrl.current = 'http://localhost:8080/';
    }
    
    axios.get(serverUrl.current, {withCredentials:true})
    .then(response => {
    })
    .catch(error => {
      alert("server error");
    });
  },[]);
  
  useEffect(()=> {
    if(isAuth){
      ws.current = new WebSocket(wsUrl.current + '?username=' + username)
      ws.current.onopen = evt => {
        console.log("connected")
  
      }
  
      ws.current.onclose = () => {
        console.log("disconnected")
      }
  
      return () => {
        ws.current.close();
      };
    }
    

  },[isAuth]);
    
  useEffect(() => {
    if(!ws.current) return;
    ws.current.onmessage = evt => {
      // listen to data sent from the websocket server
      const message = JSON.parse(evt.data);
      console.log(message)
      if (message.type === "error"){
        alert(message.data);
      }
      else if (message.type === "friendRequest"){
        setFriendRequests([...friendRequests, {"username":message.requesterName,"userid":message.requesterId}]);
      }
      else if(message.type === "message"){
        if (selectedUserChat.username === message.senderUsername){
          setMessages([...messages,{"username":message.senderUsername,"userid":message.senderId,"message_content":message.data}]);
        }
        else if (selectedUserChat.username !== message.senderUsername){
          const tempFriends = friends;
          tempFriends.forEach(UserChat => {
            if(UserChat.userid === message.senderId){
              UserChat.notification++;
            }
          });

          setFriends([...tempFriends]);
        }
      }
      else if(message.type === "friendRequestAccept"){
        setFriends([...friends,{"username":message.adresseeName,"userid":message.adresseeId}]);
      }
      else if(message.type === "ping"){
        ws.current.send(JSON.stringify({"type":"ping"}));
      }
    }
  
  });

  function handleRegisterAuth(data){

    setUserid(data.id);
    setUsername(data.username);
    setIsAuth(true);

  }

  function handleAuth(data){

    setUserid(data.id);
    setUsername(data.username);
    setIsAuth(true);

  }

  function handleSetFriendRequests(data){
    setFriendRequests(data);
  }

  function handleAcceptFriendRequest(friend){
    const newFriendRequests = friendRequests.filter(fr => fr.userid !== parseInt(friend.userid));
    setFriendRequests(newFriendRequests);
    setFriends([...friends, friend]);
  }

  function handleDeclineFriendRequest(friend){
    const newFriendRequests = friendRequests.filter(fr => fr.userid !== parseInt(friend.userid));
    setFriendRequests(newFriendRequests);
  }

  function handleSetFriends(friendlist){
    setFriends(friendlist.map(f => ({"userid":f.userid,"username":f.username,"notification":0})));
  }

  function handleSetSelectedUserChat(userchat){
    console.log(userchat)
    const tempFriends = friends;
    tempFriends.forEach(UserChat => {
      if(UserChat.username === userchat.username){
        UserChat.notification = 0;
      }
    });

    setFriends([...tempFriends]);
    setSelectedUserChat(userchat);
  }

  function handleSetMessages(chatmessages){
    setMessages(chatmessages);
  }

  function handleSendMessage(message){
    setMessages([...messages,message]);
  }

  //render
  if(!isAuth){
    return (
      <Container fluid="true" className="login-container">
        <Row className="login-row h-100 align-items-center justify-content-center">
          <Col xs={6} md={4} className="login-col-1" align="center">
            <Register 
              handleRegisterAuth={handleRegisterAuth}
              serverUrl={serverUrl}></Register>
          </Col>
          <Col xs={6} md={4} className="" align="center">
            <Login 
              handleAuth={handleAuth}
              serverUrl={serverUrl}></Login>
          </Col>
        </Row>
      </Container>
    )
  }else{
    return (
      <div>
        <Container fluid="true"> 
          <Row>
            <Col>
              <NavBar 
                userid={userid} 
                username={username} 
                friendRequests={friendRequests} 
                handleSetFriendRequests={handleSetFriendRequests}
                ws={ws}
                serverUrl={serverUrl}
                handleAcceptFriendRequest={handleAcceptFriendRequest}
                handleDeclineFriendRequest={handleDeclineFriendRequest}></NavBar>
            </Col>
          </Row>
          <Row className="justify-content-center main-row" >
            <Col xs={5} md={3} className="col1">
              <ChatContactList
                friends={friends}
                userid={userid} 
                username={username} 
                serverUrl={serverUrl}
                handleSetFriends={handleSetFriends}
                handleSetSelectedUserChat={handleSetSelectedUserChat}></ChatContactList>
            </Col>
            <Col xs={7} md={5} className="col2">
              
                <ChatView
                  userid={userid} 
                  username={username} 
                  serverUrl={serverUrl}
                  selectedUserChat={selectedUserChat}
                  messages={messages}
                  handleSetMessages={handleSetMessages}></ChatView>
              
              
                <ChatTextBox
                  ws={ws}
                  serverUrl={serverUrl}
                  userid={userid} 
                  username={username}
                  messages={messages}
                  selectedUserChat={selectedUserChat} 
                  handleSendMessage={handleSendMessage}
                  handleSetMessages={handleSetMessages}></ChatTextBox>
              
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
  
}

export default App;
