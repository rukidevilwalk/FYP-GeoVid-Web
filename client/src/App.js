import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

import "../node_modules/video-react/dist/video-react.css";
import "bootstrap/dist/css/bootstrap.min.css";

import SearchVideo from "./components/search-component/search-video.component";
import UploadVideo from "./components/upload-video.component";
import WatchVideo from "./components/view-video-component/view-video.component";
import logo from "./logo.png";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="container.fluid" >

          <div className="mx-auto col-xl-11 justify-content-center align-items-center">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
              <a className="navbar-brand" href="" target="_blank" rel="noopener noreferrer">
                <img src={logo} width="30" height="30" alt="Team Liquid" />
              </a>
              <Link to="/" className="navbar-brand">GeoVid</Link>
              <div className="collpase navbar-collapse">
                <ul className="navbar-nav mr-auto">
                  <li className="navbar-item">
                    <Link to="/upload" className="nav-link">Upload Video</Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <br />

          <Switch>
            <Route path="/watch/:id" component={WatchVideo} />
            <Route path="/" exact component={SearchVideo} />
            <Route path="/upload" component={UploadVideo} />
          </Switch>
        </div>

      </Router>
    );
  }
}

export default App;