import  React, {useEffect,useState} from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import axios from 'axios';

const NavBar = props => {
    
    const [usernameSearch, setUsernameSearch] = useState('');

    function handleUsernameSearch(e){
        e.preventDefault();
        setUsernameSearch(e.target.elements.formUserName.value);
    };

    function handleAccept(e){
        e.preventDefault();
        const username = e.target.attributes.getNamedItem('user-name').value;
        const userid = e.target.attributes.getNamedItem('user-id').value;
        axios.post(props.serverUrl.current+'acceptfriendrequest', {withCredentials:true},{
                data:{
                    adresseeId: props.userid,
                    requesterId: userid
                }
            })
            .then(response => {
                if (response.error){
                    alert("Error accepting friend requests");
                }else{
                    props.ws.current.send(JSON.stringify({"type":"friendRequestAccept","adresseeId":props.userid,"adresseeName":props.username,"requesterName":username}));
                    props.handleAcceptFriendRequest({"userid":userid,"username":username})
                }
            })
            .catch(error => {
                console.log("Error accepting friend request");
            });
        
        
    }

    function handleDecline(e){
        e.preventDefault();
        const username = e.target.attributes.getNamedItem('user-name').value;
        const userid = e.target.attributes.getNamedItem('user-id').value;
        axios.post(props.serverUrl.current+'declinefriendrequest', {withCredentials:true},{
                data:{
                    adresseeId: props.userid,
                    requesterId: userid
                }
            })
            .then(response => {
                if (response.error){
                    alert("Error declining friend requests");
                }else{
                    props.handleDeclineFriendRequest({"userid":userid,"username":username});
                }
            })
            .catch(error => {
                console.log("Error declining friend request");
            });
        
    }

    useEffect(()=>{
        if (usernameSearch !== '' & usernameSearch !== props.username){
            props.ws.current.send(JSON.stringify({"type":"friendRequest","requesterId":props.userid,"adresseeName":usernameSearch,"requesterName":props.username}));
        }
    },[usernameSearch]);

    useEffect(() => {
        axios.post(props.serverUrl.current+'friendrequests', {withCredentials:true},{
                data:{
                    adresseeId: props.userid
                }
            })
            .then(response => {
                if (response.data.data === "error"){
                    alert("Error loading friend requests");
                }else{
                    props.handleSetFriendRequests(response.data.data);
                }
            })
            .catch(error => {
                console.log("get friends requests error");
            });
    },[]);

    return (
    <div >
        <Navbar bg="light" expand="lg">
        <Navbar.Brand >Messenger</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
            <NavDropdown title="Friend Requests" id="basic-nav-dropdown">
                {props.friendRequests.map((requester)=>{
                        return (
                        <div>
                            <NavDropdown.Item key={requester.userid}  disabled="true"> 
                            <div>{requester.username}</div>       
                            </NavDropdown.Item>
                            <Button type="submit" user-id={requester.userid} user-name={requester.username} onClick={handleAccept}>accept</Button>{' '}
                            <Button type="submit" user-id={requester.userid} user-name={requester.username} onClick={handleDecline}>decline</Button>{' '}
                        </div>
                        
                        )
                })}
            </NavDropdown>
            </Nav>
            <Form inline onSubmit={handleUsernameSearch}>
                <FormGroup controlId="formUserName">
                    <FormControl type="text" placeholder="Add Friend" className="mr-sm-2" />
                </FormGroup>
                <Button variant="outline-success" type="submit">Search</Button>
            </Form>
        </Navbar.Collapse>
        </Navbar>
    </div>
    );
}
    
export default NavBar;