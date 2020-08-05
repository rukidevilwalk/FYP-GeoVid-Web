import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import logo from "../logo.png";
import { logoutUser } from "../actions/authActions";

const Navbar = (props) => {

    const [loggedIn, setLoggedIn] = React.useState(false);
    const [errors, setErrors] = React.useState({});



    useEffect(() => {

        if (props.auth.isAuthenticated)
            setLoggedIn(true)
    }, []);

    const isFirstRun = useRef(true);

    useEffect(() => {

        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (props.auth.isAuthenticated) {
            setLoggedIn(true)
        } else {
            setLoggedIn(false)
        }
    }, [props.auth.isAuthenticated]);

    useEffect(() => {

        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (props.errors) {
            setErrors(props.errors)
        }
    }, [props.errors]);


    const onLogoutClick = e => {
        e.preventDefault();
        props.logoutUser();
    }

    return (
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
                                <Link to="/" className="nav-link">Home</Link>
                            </li>
                            {(loggedIn && <li className="navbar-item">
                                <Link to="/uploads" className="nav-link">Manage Uploads</Link>
                            </li>)}
                            {(loggedIn && <li className="navbar-item">
                                <Link to="/bookmarks" className="nav-link">Manage Bookmarks</Link>
                            </li>)}
                            {(loggedIn && <li className="navbar-item">
                                <Link to="/upload" className="nav-link">Upload Video</Link>
                            </li>)}
                        </ul>
                        <div>
                            <ul className="navbar-nav mr-auto">

                                {(loggedIn &&
                                    <li className="navbar-item">
                                        <p className="font-weight-bold" id="user"> Logged in as: {props.auth.user.email}</p>
                                    </li>)}

                                {(!loggedIn &&
                                    <li className="navbar-item">
                                        <Link to="/login" className="nav-link">Login</Link>
                                    </li>)}

                                {(!loggedIn &&
                                    <li className="navbar-item">
                                        <Link to="/register" className="nav-link">Register</Link>
                                    </li>)}

                                {(loggedIn &&
                                    <li className="navbar-item">
                                        <Link to="/" onClick={onLogoutClick} className="nav-link">Logout</Link>
                                    </li>)}

                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
            <br />
        </div >
    );
}

Navbar.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    errors: state.errors
});
export default connect(
    mapStateToProps,
    { logoutUser }
)(Navbar);
