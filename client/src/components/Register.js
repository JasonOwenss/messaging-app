import  React, {useState} from 'react';

const Register = props => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    function handleUsernameChange(e){setUsername(e.target.value);}
    function handlePasswordChange(e){setPassword(e.target.value);}

    function handleUsernameSubmit(e){
        e.preventDefault();
        props.handleRegisterAuth({"username":username,"password":password});
    }

    
    return(
        <div>
            <form onSubmit={handleUsernameSubmit}>
                <input 
                    type="text" 
                    value={username}
                    placeholder="username"
                    onChange={handleUsernameChange}
                    required/>
                <input
                    type="text"
                    value={password}
                    placeholder="password"
                    onChange={handlePasswordChange}
                    required/>
                <button>Register</button>
            </form>
        </div>
    )
}

export default Register;