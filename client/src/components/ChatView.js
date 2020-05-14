import  React, {useEffect,useState} from 'react';
import axios from 'axios';
import Loader from 'react-loader-spinner';

const ChatView = props => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if(props.selectedUserChat !== ""){
            setIsLoading(true);
            axios.post(props.serverUrl.current+'messages', {withCredentials:true},{
            data:{
                userid:props.userid,
                adresseeId: props.selectedUserChat.userid
                }
            })
            .then(response => {
                if (response.data.error){
                    alert("Error fetching messages");
                }
                else{
                    props.handleSetMessages(response.data.data);
                    setIsLoading(false);
                }
            })
            .catch(e => {
                alert("Error fetching messages");
            });

        }
        
    },[props.selectedUserChat]);

    if(!props.selectedUserChat.username){
        return(
            <div className="h-100 start-chat-div">
                <p className="start-chat-p">
                  Start A Chat  
                </p>
            </div>
        )
    }
    else if(isLoading){
        return (
            <div>
            <div>
                <div className="d-flex justify-content-center chat-header">
                <div className="chat-header-username">
                    {props.selectedUserChat.username}
                </div>
                </div>
            </div>
            <div className="ChatView-row">
                <Loader
                    type="Puff"
                    color="#00BFFF"
                    height={100}
                    width={100}
                    timeout={3000} //3 secs
                />
            </div>
            </div>
            );
    }
    else{
        return (
            <div>
            <div>
                <div className="d-flex justify-content-center chat-header">
                <div className="chat-header-username">
                    {props.selectedUserChat.username}
                </div>
                </div>
            </div>
            <div  className="ChatView-row " >
                {props.messages.slice(0).reverse().map((m)=>{
                    return (
                
                    <div className={props.username===m.username ? "d-flex justify-content-end ":"d-flex justify-content-start "} > 
                        <div
                        className={props.username===m.username ? "this-client-messages":"other-client-messages"}
                        key={m.userid} 
                        user-id={m.userid} 
                        user-name={m.username} >
                            {m.message_content}
                        </div>
                    </div>   
                    
                    )
                })}
            </div>
            </div>
        );
    }
    
}
    
export default ChatView;