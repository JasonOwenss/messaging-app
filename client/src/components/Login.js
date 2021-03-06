import  React, {useState} from 'react';
import axios from 'axios';

const Login = props => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    function handleUsernameChange(e){setUsername(e.target.value);}
    function handlePasswordChange(e){setPassword(e.target.value);}

    function handleUsernameSubmit(e){
        e.preventDefault();
        axios.post(props.serverUrl.current+'login', {withCredentials:true},{
            data:{
              username:username,
              password:password
            }
          })
          .then(response => {
            if (response.data.data === "no match or error") {
              alert("incorrect password or error");
            }else if(response.data.data === "no user"){
              alert("no user with that username")
            }else{
              props.handleAuth({"username":username,"id":response.data.id});
            }
          })
          .catch(error => {
            console.log("login error")
          });
        
    }

    
    return(
        <div className="login-reg-container">
            <div className="login-reg-title">Login</div>
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
                
                <button className="btn btn-primary">Login</button>
                
                
            </form>
        </div>
    )
}

export default Login;