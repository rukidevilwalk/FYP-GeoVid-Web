import React, { Fragment, Component } from "react"
import {
    Marker,
    Polyline
} from "@react-google-maps/api"

export default class InfoMarker extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isOpen: false,
            pathVisible: false,
            isSelected: false,
            iconURL: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
    }

    filename = ''

    handleToggleOpen = () => {

        // this.setState({
        //     isOpen: true
        // })

        this.props.setMarkerInfoWindow(this.props.index)

        if (this.marker.getIcon() === 'http://maps.google.com/mapfiles/ms/icons/green-dot.png') {

            this.handleDeselectMarker()
            this.props.removeSelectedVideos(this.filename)
            this.setState({
                pathVisible: false
            })
        }

        else {

            this.handleSelectMarker()
            this.props.addSelectedVideos(this.filename, this.props.dateFrom, this.props.dateTo)
            this.setState({
                pathVisible: true
            })
        }

    }

    handleSelectMarker = () => {
        if (this.marker !== undefined) {
            if (this.marker.getIcon() === 'http://maps.google.com/mapfiles/ms/icons/red-dot.png') {
                this.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
            }

        }

    }

    handleDeselectMarker = () => {
        if (this.marker !== undefined) {
            if (this.marker.getIcon() === 'http://maps.google.com/mapfiles/ms/icons/green-dot.png') {
                this.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png')
                this.setState({
                    pathVisible: false
                })
            }
        }

    }

    handleToggleClose = () => {

        // this.setState({
        //     isOpen: false
        // })
    }

    init = (marker) => {
        this.filename = this.props.filename
        this.marker = marker
    }

    render() {

        return (
            <Fragment>

                <Marker
                    key={this.props.index}
                    position={{ lat: this.props.lat, lng: this.props.lng }}
                    onClick={() => this.handleToggleOpen()}
                    onLoad={marker => {
                        this.init(marker)
                    }}
                    icon={this.state.iconURL} //Selected
                >

                </Marker>

                <Polyline
                    key={this.props.index + 1}
                    onLoad={path => {
                        this.path = path
                    }}
                    path={this.props.pathdata}
                    options={{
                        strokeColor: "#ff0000",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#ff0000',
                        fillOpacity: 0.35,
                        clickable: false,
                        draggable: false,
                        editable: false,
                        visible: this.state.pathVisible,
                        radius: 30000,
                        paths: this.props.pathdata,
                        zIndex: 1
                    }}
                />
            </Fragment>
        )
    }
}
