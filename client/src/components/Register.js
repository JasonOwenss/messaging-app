import  React, {useState} from 'react';

const Register = props => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    function handleUsernameChange(e){setUsername(e.target.value);}
    function handlePasswordChange(e){setPassword(e.target.value);}
    function handlePasswordConfirmChange(e){setPasswordConfirm(e.target.value);}

    function handleUsernameSubmit(e){
        e.preventDefault();
        if (password === passwordConfirm) props.handleRegisterAuth({"username":username,"password":password});
        else alert("Passwords do not match")
    }

    
    return(
        <div className="login-reg-container">
            <div className="login-reg-title">Register</div>
            <br></br>
            <form onSubmit={handleUsernameSubmit} className="form-group">
                <input 
                    className="form-control"
                    type="text" 
                    value={username}
                    placeholder="username"
                    onChange={handleUsernameChange}
                    required/>
                <br></br>
                <input
                    className="form-control"
                    type="password"
                    value={password}
                    placeholder="password"
                    onChange={handlePasswordChange}
                    required/>
                <br></br>
                <input
                    className="form-control"
                    type="password"
                    value={passwordConfirm}
                    placeholder="confirm password"
                    onChange={handlePasswordConfirmChange}
                    required/>
                <br></br>
                <button className="btn btn-primary">Register</button>
            </form>
        </div>
    )
}

export default Register;