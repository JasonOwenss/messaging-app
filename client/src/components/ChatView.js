import  React from 'react';

const ChatView = props => {

    
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
    
export default ChatView;