import  React, {useEffect,useState,useRef} from 'react';
import './App.css';
import ChatTextBox from './components/ChatTextBox';
import Login from './components/Login';
import Register from './components/Register';
import NavBar from './components/NavBar';
import ChatContactList from './components/ChatContactList';
import ChatView from './components/ChatView';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';


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

    axios.post(serverUrl.current+'register', {withCredentials:true},{
      data:{
        username:data.username,
        password:data.password
      }
    })
    .then(response => {
      console.log(response);
      if (response.data.data === "error") {
        alert("error occured");
      }else if(response.data.data === "user exists"){
        alert("that username is already taken")
      }else{
        setUserid(response.data.id);
        setUsername(response.data.username);
        setIsAuth(true);
      }
    })
    .catch(error => {
      console.log("register error")
    });
  }

  function handleAuth(data){
    
    axios.post(serverUrl.current+'login', {withCredentials:true},{
      data:{
        username:data.username,
        password:data.password
      }
    })
    .then(response => {
      if (response.data.data === "no match or error") {
        alert("incorrect password or error");
      }else if(response.data.data === "no user"){
        alert("no user with that username")
      }else{
        setUserid(response.data.id);
        setUsername(response.data.username);
        setIsAuth(true);
      }
    })
    .catch(error => {
      console.log("login error")
    });

    
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
      <div className="container">
        <Register handleRegisterAuth={handleRegisterAuth}></Register>
        <Login handleAuth={handleAuth}></Login>
      </div>
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
            <Col xs={3} className="col1">
              <ChatContactList
                friends={friends}
                userid={userid} 
                username={username} 
                serverUrl={serverUrl}
                handleSetFriends={handleSetFriends}
                handleSetSelectedUserChat={handleSetSelectedUserChat}></ChatContactList>
            </Col>
            <Col xs={5} className="col2">
              
                <ChatView
                  userid={userid} 
                  username={username} 
                  selectedUserChat={selectedUserChat}
                  messages={messages}></ChatView>
              
              
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
