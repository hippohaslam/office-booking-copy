
import {useEffect, useState} from 'react';
import { useUser } from './contexts/UserContext';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

type ProtectedRouteProps = {
    children: React.ReactNode;
};

// TODO: Can we refresh the token silently. Yes but requires auth-flow to be implemented with backend

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const userContext = useUser();
  const location = useLocation();
  const [checkUser, setCheckUser] = useState(false);

  // Hacky way for now to check if the user is logged in. 
  // Using session storage to minimize risk.
  // Client side MUST be using HTTPS.
  useEffect(() => {
    async function fetchUser(user: string) {
      try {
        const token = JSON.parse(user);
        const result = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if(result.ok) {
          const userJwt: JwtToken = jwtDecode(token);
          userContext.setUser({
            name: userJwt.name,
            email: userJwt.email,
            picture: userJwt.picture,
            exp: userJwt.exp
          });
        }
      } catch(e) {
        console.error(e);
        
      }
    }

    // If there is a user in the context, check the expiration time
    if(userContext.user) {
      // check the expiration time. If the token is expired, remove the user from the context and session storage
      const now = Date.now();
      if(userContext.user.exp * 1000 < now) {
        userContext.clearUser();
      }
      setCheckUser(true);
    } else {
      // If there is no user in the context, check the session storage
      const user = sessionStorage.getItem('user');
      if(user){
        fetchUser(user).finally(() => setCheckUser(true));
      } else {
        setCheckUser(true);
      }
    }
  }, [userContext]);

  

  if(checkUser === false) {
    return null
  }

  if (!userContext.user) {
    
    return <Navigate to={`/signin?returnUrl=${encodeURI(location.pathname)}`} />;
  }

  return children;
};

export default ProtectedRoute;