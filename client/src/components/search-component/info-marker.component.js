import React, { Fragment, Component } from "react";
import {
    Marker,
    InfoWindow
} from "@react-google-maps/api";

export default class InfoMarker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            isSelected: false,
            iconURL: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    }

    handleToggleOpen = () => {

        // this.setState({
        //     isOpen: true
        // });
        console.log('selecting marker')
        this.props.setMarkerInfoWindow(this.props.index)
        console.log(this.marker.getIcon())
        if (this.marker.getIcon() == 'http://maps.google.com/mapfiles/ms/icons/green-dot.png')
            this.handleDeselectMarker()
        else
            this.handleSelectMarker()
    }

    handleSelectMarker = () => {

        this.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
    }

    handleDeselectMarker = () => {

        this.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
    }

    handleToggleClose = () => {

        // this.setState({
        //     isOpen: false
        // });
    }

    handleToggleSelected = () => {

    }

    render() {

        return (
            <Fragment>
                <Marker
                    key={this.props.index}
                    position={{ lat: this.props.lat, lng: this.props.lng }}
                    onClick={() => this.handleToggleOpen()}
                    onLoad={marker => {
                        this.marker = marker;
                    }}
                    icon={this.state.iconURL} //Selected
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
