import  React, {useState} from 'react';

const ChatTextBox = props => {
    const [msgval, setMsgval] = useState('');

    function handleMsgChange(e){setMsgval(e.target.value);}

    function handleMessageSubmit(e){
        e.preventDefault();
        props.ws.current.send(JSON.stringify({"type":"message","sendToUsername":props.selectedUserChat.username,
                "sendToId":props.selectedUserChat.userid,"msg":msgval,"senderUsername":props.username,"senderId":props.userid}));
        
        props.handleSendMessage({"username":props.username,"userid":props.userid,"message_content":msgval});
        setMsgval('');
    }


    if (!props.selectedUserChat.username){
        return(
            <div></div>
        )
    }
    else{
        return (
            <div className="ChatTextBox-row">
                <form onSubmit={handleMessageSubmit} >
                    <div className="input-group mb-3">
                    <input 
                        className="form-control"
                        type="text" 
                        value={msgval}
                        onChange={handleMsgChange}
                        required/>
                        <div className="input-group-append">
                            <button type="submit" className="btn btn-dark">add msg</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
    
}
    
export default ChatTextBox;