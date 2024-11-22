import "./SignIn.scss";
import { useCallback, useEffect, useState } from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useUser } from "../../contexts/UserContext";
import { getSession, postSessionGoogle } from "../../services/Apis";
import HippoSvg from "../../assets/hippo-navy.svg";
import HippoReserveLogo from "../../assets/hippo-reserve-logo.svg";
import { ErrorBanner } from "../../components";

export default function SignIn() {
  const location = useLocation();
  const userContext = useUser();
  const navigate = useNavigate();
  const returnURl = new URLSearchParams(location.search).get("returnUrl");
  const [showLogin, setShowLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const callSessionApi = useCallback(async () => {
    const res = await getSession();
    userContext.setUser({
      firstName: res.data.firstName,
      lastName: res.data.lastName,
      email: res.data.email,
      isAdmin: res.data.isAdmin || false,
    });
  }, [userContext]);

  // Define callSessionGoogleApi using useCallback
  const callSessionGoogleApi = useCallback(async (credential: string) => {
    return await postSessionGoogle(credential);
  }, []);

  async function handleSignInUser(credentialResponse: CredentialResponse) {
    if (credentialResponse.credential) {
      try {
        const res = await callSessionGoogleApi(credentialResponse.credential);
        userContext.setUser({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          email: res.data.email,
          isAdmin: res.data.isAdmin || false,
        });
        setErrorMessage(null);
      } catch (err: any) {
        console.log("google error", err);
        setErrorMessage(err.message);
      }
      navigate(returnURl || "/");
    }
  }

  useEffect(() => {
    callSessionApi()
      .then(() => {
        // This is good, navigate user back to where they were going.
        navigate(returnURl || "/");
      })
      .catch((e: any) => {
        // Likely a 401, try get the user to log in again
        setShowLogin(true);
        // Ignore 401 error because initial login attempt will always return 401
        if (e.status === 401) {
          return;
        }
        setErrorMessage("Failed to login, please try again");
      });
  }, [callSessionApi, navigate, returnURl]);

  if (showLogin) {
    return (
      <>
        <Helmet>
          <title>Sign in | Hippo Reserve</title>
        </Helmet>
        <img alt='Hippo company logo' src={HippoSvg} className='hippo-watermark-logo'/>
        <ErrorBanner title='Uh oh!' errorMessage={errorMessage || ""} isShown={errorMessage !== null} allowClose={false} />
        <div className='login-container'>
          {/* <img src={HippoSvg} alt='Hippo Logo' /> */}
          <div className="login-logo">
            <img alt='' src={HippoReserveLogo}></img>
            <h1>Hippo Reserve</h1>
          </div>
          <p>For booking desks, dog-of-the-day, and car parking spaces at the Hippo offices.</p>
          <div style={{ paddingTop: 20 + "px", paddingBlock: 20 + "px" }}>
            <GoogleLogin
              onSuccess={handleSignInUser}
              onError={() => setErrorMessage("Failed to login, please try again")}
              shape='pill'
              size='large'
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <span>Checking login, please wait...</span>
    </div>
  );
}
