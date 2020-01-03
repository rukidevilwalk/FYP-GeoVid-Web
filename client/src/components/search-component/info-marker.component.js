import React, { Fragment, Component } from "react";
import {
    Marker,
    InfoWindow
} from "@react-google-maps/api";

export default class InfoMarker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        }
    }

    handleToggleOpen = () => {

        // this.setState({
        //     isOpen: true
        // });
        this.props.setMarkerInfoWindow(this.props.index)
    }

    handleToggleClose = () => {

        // this.setState({
        //     isOpen: false
        // });
    }


    render() {

        return (
            <Fragment>
                <Marker
                    key={this.props.index}
                    position={{ lat: this.props.lat, lng: this.props.lng }}
                    label={this.props.index.toString()}
                    onClick={() => this.handleToggleOpen()}
                >
                    {/* {this.state.isOpen &&
                        <InfoWindow
                            // onLoad={console.log(this.props.address)}
                            position={{ lat: this.props.lat, lng: this.props.lng }}
                            onCloseClick={() => this.handleToggleClose()}>
                            <div style={{
                                background: `white`,
                                border: `1px solid #ccc`,
                                padding: 15
                            }}>
                                <div>
                                    <p>{'Address: ' + this.props.address}</p>
                                </div>
                                <div>
                                    <p> {'Coordinates: ' + this.props.lat + ', ' + this.props.lng}</p>
                                </div>
                                <div>
                                    <p> {'From: ' + this.props.dateFrom}</p>
                                </div>
                                <div>
                                    <p> {'To: ' + this.props.dateTo}</p>
                                </div>
                            </div>

                        </InfoWindow>} */}
                </Marker>

            </Fragment>
        );
    }
}
