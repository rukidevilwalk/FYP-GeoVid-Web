import React, { Fragment, PureComponent } from "react";
import axios from "axios";
import {
    GoogleMap,
    Polyline,
    Polygon
} from "@react-google-maps/api";
import { convertSub, createPath, calcDirectionVector } from "../helper"

const CancelToken = axios.CancelToken;
let source;

export default class VideoMap extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isLoaded: false,
            mapRef: null,
            subtitle_file: [],
            map_path: [],
            directionVectors: []
        };
    }

    componentDidMount() {

        this.setAPILoaded()
        let subtitleStr = ""
        this.props.videos.forEach(video => {
            subtitleStr += (video + ',')
        })
        subtitleStr = subtitleStr.substring(0, subtitleStr.length - 1)
        if (source) {
            source.cancel('Operation canceled by the user.');
        }
        source = CancelToken.source();

        axios.get("http://localhost:8000/subtitle/" + subtitleStr, {
            cancelToken: source.token
        })
            .then(response => {
                //console.log(response.data)
                this.setState({ subtitle_file: convertSub(response.data) });


            }).then(() => {
                this.setState({ map_path: createPath(this.state.subtitle_file) });
                this.setState({
                    directionVectors: calcDirectionVector(this.state.subtitle_file)
                });
            }).catch(function (thrown) {
                if (axios.isCancel(thrown)) {
                    console.log('Request canceled', thrown.message);
                } else {
                    console.log(thrown);
                }
            })

    }


    fitBounds = () => {

        const bounds = new window.google.maps.LatLngBounds();
        this.state.map_path.forEach(path => {
            path.map(point => {
                bounds.extend(point);
                return "Bounds";
            });
        });


        this.map.fitBounds(bounds);
    };

    loadHandler = () => {

        this.fitBounds();
    };

    // Flag to render map only after Google API has loaded
    setAPILoaded = () => {
        if (!this.state.isLoaded)
            this.setState({ isLoaded: true })
    }

    // Flag to render video only after map has been rendered
    setIsRendered = () => {
        if (!this.props.mapIsRendered)
            this.props.mapRenderedHandler(true)
    }

    renderPaths = () => {
        return (this.state.map_path.map((data, index) => {

            return <Polyline
                key={index}
                path={data}
                options={{
                    strokeColor: this.props.colorArr[index],
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: this.props.colorArr[index],
                    fillOpacity: 0.35,
                    clickable: false,
                    draggable: false,
                    editable: false,
                    visible: true,
                    radius: 30000,
                    paths: data,
                    zIndex: 1
                }}
            />
        }))
    }

    renderDirectionVectors = () => {
        //console.log(this.state.directionVectors)
        return (this.state.directionVectors.map((data, i) => {

            return (data.map((coords, i) => {
                let index = this.props.findIndexOfVideo(coords.filename)
                if (i === this.props.directionIndex[index].directionIndex && index !== -1) {

                    return [
                        // Viewing vector
                        <Polyline
                            key={i + 1}
                            path={[
                                { lat: coords.initial.lat, lng: coords.initial.lng },
                                { lat: coords.left.lat, lng: coords.left.lng },
                                { lat: coords.initial.lat, lng: coords.initial.lng },
                                { lat: coords.right.lat, lng: coords.right.lng }
                            ]}
                            options={{
                                strokeColor: "#FF0000",
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                fillColor: "lightblue",
                                fillOpacity: 1,
                                clickable: false,
                                draggable: false,
                                editable: false,
                                visible: true,
                                radius: 30000,

                                zIndex: 1
                            }}
                        />,
                        <Polygon
                            key={i}
                            paths={[
                                { lat: coords.initial.lat, lng: coords.initial.lng },
                                { lat: coords.left.lat, lng: coords.left.lng },
                                { lat: coords.right.lat, lng: coords.right.lng }
                            ]}
                            options={{
                                fillColor: "lightblue",
                                fillOpacity: 1,
                                strokeColor: "red",
                                strokeOpacity: 0,
                                strokeWeight: 2,
                                clickable: false,
                                draggable: false,
                                editable: false,
                                geodesic: false,
                                zIndex: 1
                            }}
                        />
                    ];
                }
            }))
        }))
    }

    renderMap = () => {

        if (this.state.isLoaded && this.state.map_path.length !== 0 && this.state.directionVectors.length !== 0) {
            return (
                <Fragment>
                    <div className="embed-responsive-item">
                        <GoogleMap
                            onLoad={map => {
                                this.map = map;
                                this.loadHandler()
                                this.setIsRendered()
                            }}
                            id="video-map"
                            mapContainerStyle={{
                                height: "100%",
                                width: "100%"
                            }}
                            zoom={11}

                        >
                            {this.renderPaths()}
                            {this.renderDirectionVectors()}

                        </GoogleMap>
                    </div>
                </Fragment >
            );
        } else {
            return null;
        }

    };

    render() {

        return (
            <Fragment>

                {this.renderMap()}

            </Fragment>
        );
    }
}