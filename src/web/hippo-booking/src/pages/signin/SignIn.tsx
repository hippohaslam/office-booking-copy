import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";


export default function SignIn() {
    const location = useLocation();
    const userContext = useUser();
    const navigate = useNavigate();
    const returnURl = new URLSearchParams(location.search).get('returnUrl');

    async function handleSignInUser(credentialResponse: CredentialResponse) {
      if(credentialResponse.credential) {
        const userJwt: JwtToken = jwtDecode(credentialResponse.credential);
        userContext.setUser({
          name: userJwt.name,
          email: userJwt.email,
          picture: userJwt.picture,
          exp: userJwt.exp
        });
        sessionStorage.setItem('user', JSON.stringify(credentialResponse.credential));

        navigate(returnURl || '/');
      }
    }
    const errorMessage = () => {
        throw Error('Error signing in');
    };

  return (
    <GoogleLogin onSuccess={handleSignInUser} onError={errorMessage} useOneTap auto_select />
  );
}
