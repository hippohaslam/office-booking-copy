import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { useCallback, useEffect, useState } from "react";
import { getSession, postSessionGoogle } from "../../services/Apis";
import HippoSvg from "../../assets/hippo-navy.svg";


export default function SignIn() {
    const location = useLocation();
    const userContext = useUser();
    const navigate = useNavigate();
    const returnURl = new URLSearchParams(location.search).get('returnUrl');
    const [showLogin, setShowLogin] = useState(false);

    const callSessionApi = useCallback(async () => {
        const res = await getSession();
        userContext.setUser({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            email: res.data.email
        })
    }, [userContext]);

    // Define callSessionGoogleApi using useCallback
    const callSessionGoogleApi = useCallback(async (credential: string) => {
        return await postSessionGoogle(credential);
    }, []);

    async function handleSignInUser(credentialResponse: CredentialResponse) {
        if(credentialResponse.credential) {
            try {
                const res = await callSessionGoogleApi(credentialResponse.credential);
                userContext.setUser({
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                    email: res.data.email
                })
            } catch (err) {
                console.log('google error', err);
            }
            navigate(returnURl || '/');
        }
    }
    const errorMessage = () => {
        throw Error('Error signing in');
    };

    useEffect(() => {
        console.log('Checking logged in user')
        callSessionApi()
            .then(() => {
                // This is good, navigate user back to where they were going.
                navigate(returnURl || '/');
            }).catch(() => {
            // Likely a 401, try get the user to log in again
            setShowLogin(true);
        });
    }, [callSessionApi, navigate, returnURl]);

    if(showLogin){
        return (
            <div className="login-container">
                <img src={HippoSvg} alt="Hippo Logo"/>
                <h1>Office bookings</h1>
                <p>For booking desks, dog-of-the-day, and car parking spaces at the Hippo offices.</p>
                <div style={{paddingTop:20 + 'px', paddingBlock:20 + 'px'}}>
                    <GoogleLogin onSuccess={handleSignInUser} onError={errorMessage} useOneTap auto_select shape="pill" size="large"/>
                </div>
            </div>
        );
    }

    return <div className="login-container"><span>Checking login, please wait...</span></div>

}
