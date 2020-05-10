import  React, {useEffect,useState} from 'react';
import axios from 'axios';
import Card from 'react-bootstrap/Card';

const ChatContactList = props => {

    //load friends/chats
    useEffect(() => {
        axios.get("http://localhost:8080/getfriends/"+props.userid, {withCredentials:true})
            .then(response => {
                if (response.data.error){
                    alert("Error getting friend requests");
                }else{
                    props.handleSetFriends(response.data.data);
                }
            })
            .catch(error => {
                console.log("Error getting friends");
            });
    },[]);

    function handleUserChatClick(e){
        e.preventDefault();
        const username = e.target.attributes.getNamedItem('user-name').value;
        const userid = e.target.attributes.getNamedItem('user-id').value;
        props.handleSetSelectedUserChat({username,userid});
    }

    function showNotif(notifnum){
        if (notifnum > 0){
            return notifnum.toString() + " new messages";
        }else{
            return null;
        }
    }
    return (
    <div  className="overflow-container ChatContactList-row">

        {props.friends.map((friend)=>{
            return (
            <div  > 
                <Card >
                    <Card.Body >
                        <Card.Text 
                            key={friend.userid} 
                            user-id={friend.userid} 
                            user-name={friend.username} 
                            onClick={handleUserChatClick}>
                                {friend.username}
                        </Card.Text>
                        <Card.Text >
                                {showNotif(friend.notification)}
                        </Card.Text>
                    </Card.Body>
                </Card>     
            </div>          
            )
        })}
    </div>
    );
}
    
export default ChatContactList;