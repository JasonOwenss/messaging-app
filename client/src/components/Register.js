import  React, {useState} from 'react';
import axios from 'axios';

const Register = props => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    function handleUsernameChange(e){setUsername(e.target.value);}
    function handlePasswordChange(e){setPassword(e.target.value);}
    function handlePasswordConfirmChange(e){setPasswordConfirm(e.target.value);}

    function handleUsernameSubmit(e){
        e.preventDefault();
        if (password === passwordConfirm){
            axios.post(props.serverUrl.current+'register', {withCredentials:true},{
                data:{
                  username:username,
                  password:password
                }
              })
              .then(response => {
                console.log(response);
                if (response.data.data === "error") {
                  alert("error occured");
                }else if(response.data.data === "user exists"){
                  alert("that username is already taken")
                }else{
                  props.handleRegisterAuth({"username":username,"id":response.data.id});
                }
              })
              .catch(error => {
                console.log("register error")
              });
        } 
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