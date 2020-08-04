import React from "react";
import { BrowserRouter as Router, Route} from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import 'bootstrap';
import "../node_modules/video-react/dist/video-react.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import store from "./store";

import SearchVideo from "./components/search-component/search-video.component";
import UploadVideo from "./components/upload-video.component";
import WatchVideo from "./components/view-video-component/view-video.component";
import UserUploads from "./components/user-uploads.component";
import Login from "./components/auth-component/login";
import Register from "./components/auth-component/register";
import Navbar from "./components/navbar.component";
import UserBookmarks from "./components/user-bookmarks.component";

if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwt_decode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Redirect to login
    window.location.href = "./login";
  }
}

function App(){
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />

            <Route path="/watch/:id" component={WatchVideo} />
            <Route exact path="/" component={SearchVideo} />
            <Route exact path="/upload" component={UploadVideo} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/uploads" component={UserUploads} />
            <Route exact path="/bookmarks" component={UserBookmarks} />
          </div>
        </Router>
      </Provider>
    );
}

export default App;