import React, { Fragment, PureComponent } from "react";
import axios from "axios";
import { Redirect } from 'react-router-dom'
import {
    GoogleMap,
    Circle
} from "@react-google-maps/api";
import InfoMarker from "./info-marker.component";
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
} from 'react-places-autocomplete';
import Geocode from "react-geocode";
import {
    //toLatLon,
    //  toLatitudeLongitude, 
    headingDistanceTo,
    //   moveTo, 
    //insidePolygon,
    insideCircle
} from "geolocation-utils";
import DateTimePicker from 'react-datetime-picker';
import { convertStringToDate, createPath, convertSubSearch, convertSub } from "../helper";

const CancelToken = axios.CancelToken;
let source;

Geocode.setApiKey("AIzaSyCeAosp3NmF1k7mTIYJRJOlPq8LRWhKqgs")

export default class Homepage extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            videolist: [],
            counter: 0,
            selectedVideos: [],
            isLoaded: false,
            address: '',
            errorMessage: '',
            radiusLatitude: 0,
            radiusLongitude: 0,
            latitude: 0,
            longitude: 0,
            isGeocoding: false,
            geoAddress: [],
            dateTo: new Date(),
            dateFrom: new Date(),
            radiusSize: 2000,
            isToggled: false,
            renderCircle: false,
            radius: 0,
            markerAddress: 'None',
            markerLat: 'None',
            markerLng: 'None',
            markerDateFrom: 'None',
            markerDateTo: 'None',
            markerPaths: []
        };


    }
    refsCollection = [];
    selectedVideos = [];
    urlString = ''

    componentDidMount() {

        this.setAPILoaded()
        if (source) {
            source.cancel('Operation canceled by the user.');
        }
        source = CancelToken.source();
        axios.get("http://localhost:8000/search/", {
            cancelToken: source.token
        }).then(response => {
            this.setState({ videolist: convertSubSearch(response.data) })
            this.setState({ markerPaths: createPath(convertSub(response.data)) });
            this.getAddrFromLatLng()
        }).catch(function (thrown) {
            if (axios.isCancel(thrown)) {
                console.log('Request canceled', thrown.message)
            } else {
                console.log(thrown)
            }
        })

    }

    renderRedirect = () => {


        this.urlString = ''

        this.selectedVideos.forEach((url) => {
            this.urlString += ('?' + url)
        })

        if (this.selectedVideos.length = 1)
            this.urlString = this.urlString.substring(1)
        console.log(this.urlString)
        this.setState({ redirect: true })



    }

    //DateTime Picker fuctions

    handleDateTimeFrom = (date) => {
        this.setState({ dateFrom: date })
    }

    handleDateTimeTo = (date) => {
        this.setState({ dateTo: date })
    }

    // Autocomplete functions
    handleChange = address => {

        this.setState({
            address,
            errorMessage: '',
        });
    };

    handleSelect = selected => {
        this.setState({ isGeocoding: true, address: selected });
        geocodeByAddress(selected)
            .then(res => getLatLng(res[0]))
            .then(({ lat, lng }) => {
                this.setState({
                    latitude: lat,
                    longitude: lng,
                    isGeocoding: false,
                });
                this.map.panTo({ lat: this.state.latitude, lng: this.state.longitude })
                this.map.setZoom(14)
                //this.fitBounds();
            })
            .catch(error => {
                this.setState({ isGeocoding: false });
                console.log('error', error); // eslint-disable-line no-console
            });

    };

    handleCloseClick = () => {
        this.setState({
            address: '',
            latitude: null,
            longitude: null,
        });
    };

    // Flag to render map only after Google API has loaded
    setAPILoaded = () => {
        if (!this.state.isLoaded)
            this.setState({ isLoaded: true })
    }

    // Circle functions

    handleRadiusChange = () => {

        if (this.radius !== undefined) {

            if (this.state.radiusLatitude != this.radius.getCenter().lat() || this.state.radiusLongitude != this.radius.getCenter().lng()) {
                console.log('handling radius change')
                this.setState({
                    radiusLatitude: this.radius.getCenter().lat(),
                    radiusLongitude: this.radius.getCenter().lng()
                })

                if (this.radius.getRadius() > 12000) {

                    this.radius.setRadius(12000)

                } else if (this.radius.getRadius() < 2000) {

                    this.radius.setRadius(2000)

                } else {
                    // this.setState({ radiusSize: parseInt(this.radius.getRadius()) })
                }
            }
        }
    }


    handleRadiusSlider = (event) => {
        if (this.radius !== undefined) {
            this.radius.setRadius(parseInt(event.target.value))
            //  this.setState({ radius: parseInt(event.target.value) })
        }

    }

    removeSelectedVideos = (value) => {
        console.log('Removing from selectedVideos:' + value)
        this.selectedVideos = this.selectedVideos.filter(item => item !== value)

    }

    addSelectedVideos = (value) => {
        if (!this.selectedVideos.includes(value)) {
            console.log('Adding to selectedVideos:' + value)
            this.selectedVideos.push(value)
        }

    }


    checkInsideCirle = () => {

        // Circle and markers must have been rendered
        if (this.radius !== undefined && typeof this.refsCollection !== 'undefined') {
            //  console.log('Checking inside circle1' + '\n' + this.refsCollection + '\n' + this.state.radiusLongitude + " " + this.state.radiusLatitude + " " + this.radius.getCenter().lat() + " " + this.radius.getCenter().lng())

            var checkRadius = false
            var coordInsideCircle = false

            // Don't run the check if no markers have been initialized
            this.refsCollection.some(element => {
                checkRadius = (element !== null)
                return checkRadius
            })

            if (checkRadius && (this.state.isToggled || (this.state.radiusLatitude != this.radius.getCenter().lat() || this.state.radiusLongitude != this.radius.getCenter().lng()))) {

                this.setState({
                    radiusLatitude: this.radius.getCenter().lat(),
                    radiusLongitude: this.radius.getCenter().lng()
                })

                this.state.videolist.forEach((data, index) => {

                    coordInsideCircle = false
                    let dateFrom = convertStringToDate(data[0].date)
                    let dateTo = convertStringToDate(data[data.length - 1].date)

                    // Only check markers within the date range
                    if (dateFrom >= this.state.dateFrom && dateTo <= this.state.dateTo) {

                        let centerOfCircle = { lat: this.radius.getCenter().lat(), lon: this.radius.getCenter().lng() }

                        // Select marker if at least one coordinate is inside radius
                        data.some((coord) => {

                            let markerCoord = { lat: parseFloat(coord.lat), lon: parseFloat(coord.lon) }

                            coordInsideCircle = insideCircle(markerCoord, centerOfCircle, this.radius.getRadius())

                            return coordInsideCircle

                        })

                        if (coordInsideCircle) {
                            this.refsCollection[index].handleSelectMarker()
                            this.addSelectedVideos(data[0].filename)
                        } else {
                            this.refsCollection[index].handleDeselectMarker()
                            this.removeSelectedVideos(data[0].filename)
                        }

                    }

                })
            }
        } else {
            // console.log('Circle not initialized')
        }



    }

    renderRadiusByClick = (event) => {
        if (this.state.isToggled) {
            this.setState({
                radiusLatitude: event.latLng.lat(),
                radiusLongitude: event.latLng.lng()
            })

            this.checkInsideCirle()

            this.setState(prevState => ({
                isToggled: !prevState.isToggled
            }))


        }



    }

    handleRadiusToggle = (event) => {
        this.setState(prevState => ({
            isToggled: !prevState.isToggled
        }))

    }

    renderRadius = () => {
        return ((<Circle
            onLoad={radius => {
                this.radius = radius;
            }}
            center={{
                lat: this.state.radiusLatitude,
                lng: this.state.radiusLongitude
            }}
            draggable={true}
            options={{
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                editable: true,
                visible: true,
                radius: this.state.radiusSize,
                zIndex: 1
            }}
            onRadiusChanged={this.handleRadiusChange}
            onCenterChanged={e => this.checkInsideCirle()}
            onDragEnd={e => console.log('dragend')}
        />))
    }

    // Map functions

    getAddrFromLatLng = () => {

        this.state.videolist.forEach(video => {

            Geocode.fromLatLng(video[0].lat, video[0].lon).then(
                response => {
                    const address = response.results[0].formatted_address;

                    this.setState(prevState => ({
                        geoAddress: [...prevState.geoAddress, address]
                    }))
                },
                error => {
                    console.error(error);
                    return ("Address not found.")
                }
            )

        })

    }

    fitBounds = () => {
        if (this.state.longitude !== null) {
            const bounds = new window.google.maps.LatLngBounds();
            console.log(this.radius.getBounds())
            bounds.extend(this.radius.getBounds());
            this.map.fitBounds(bounds);
        }

    }

    setMarkerInfoWindow = markerIndex => {
        let marker = this.state.videolist[markerIndex]
        let dateFrom = convertStringToDate(marker[0].date)
        let dateTo = convertStringToDate(marker[marker.length - 1].date)

        this.setState({ markerAddress: this.state.geoAddress[markerIndex] });
        this.setState({ markerLat: marker[0].lat });
        this.setState({ markerLng: marker[0].lon });
        this.setState({ markerDateFrom: dateFrom });
        this.setState({ markerDateTo: dateTo });
    };

    renderInfoMarkers = () => {

        return (this.state.videolist.map((data, index) => {
            let dateFrom = convertStringToDate(data[0].date)
            let dateTo = convertStringToDate(data[data.length - 1].date)

            return (dateFrom >= this.state.dateFrom && dateTo <= this.state.dateTo && (<InfoMarker
                key={index}
                index={index}
                filename={data[0].filename}
                removeSelectedVideos={this.removeSelectedVideos}
                addSelectedVideos={this.addSelectedVideos}
                ref={instance => this.refsCollection[index] = instance}
                pathdata={this.state.markerPaths[index]}
                lat={parseFloat(data[0].lat)}
                lng={parseFloat(data[0].lon)}
                setMarkerInfoWindow={this.setMarkerInfoWindow}
            />))
        }))

    }

    renderAutoComplete = () => {

        const {
            address,
            // errorMessage,
            //  latitude,
            //  longitude,
            // isGeocoding,
        } = this.state;
        return (<PlacesAutocomplete
            onChange={this.handleChange}
            value={address}
            onSelect={this.handleSelect}
            onError={this.handleError}
            shouldFetchSuggestions={address.length > 2}
        >
            {({ getInputProps, suggestions, getSuggestionItemProps }) => {
                return (
                    <div className="Demo__search-bar-container">
                        <div className="Demo__search-input-container">

                            <input
                                {...getInputProps({
                                    placeholder: 'Search Places...',
                                    className: 'Demo__search-input',
                                })}
                            />

                            {this.state.address.length > 0 && (
                                <button
                                    className="Demo__clear-button"
                                    onClick={this.handleCloseClick}
                                >x</button>
                            )}
                        </div>

                        {suggestions.length > 0 && (
                            <div className="Demo__autocomplete-container">
                                {suggestions.map(suggestion => {
                                    const className = "Demo"

                                    return (
                                        /* eslint-disable react/jsx-key */
                                        <div
                                            {...getSuggestionItemProps(suggestion, { className })}
                                        >
                                            <strong>
                                                {suggestion.formattedSuggestion.mainText}
                                            </strong>{' '}
                                            <small>
                                                {suggestion.formattedSuggestion.secondaryText}
                                            </small>
                                        </div>
                                    );
                                    /* eslint-enable react/jsx-key */
                                })}

                            </div>
                        )}
                    </div>
                );
            }}
        </PlacesAutocomplete>)

    }

    renderMap = () => {
        if (this.state.isLoaded) {
            return (
                <GoogleMap
                    onLoad={map => {
                        this.map = map;
                    }}
                    id="search-map"
                    mapContainerStyle={{
                        height: "100%",
                        width: "100%"
                    }}
                    zoom={14}
                    center={{
                        lat: this.state.latitude !== 0 ? this.state.latitude : 1.43729,
                        lng: this.state.longitude !== 0 ? this.state.longitude : 103.83903
                    }}
                    onClick={e => this.renderRadiusByClick(e)}
                >
                    {this.renderRadius()}
                    {this.renderInfoMarkers()}

                </GoogleMap>
            );
        } else {
            return null;
        }

    }



    render() {
        return (
            <Fragment>
                <div id="SearchMap" className="row mx-auto col-11">

                    <div className="col-xl-9 embed-responsive">
                        <div className="embed-responsive-item">
                            {this.renderMap()}
                        </div>
                    </div>

                    <div className="col-xl-2 ">

                        <div className="searchControls">
                            <a className="btn btn-danger btn-sm" onClick={e => { this.handleRadiusToggle(e) }}>
                                <i className="fas fa-map-marker-alt"></i>
                            </a>
                            {this.renderAutoComplete()}
                        </div>

                        <div className="searchControls">
                            <label id="radiusSlider">Radius: {this.state.radiusSize}</label>
                            <input type="range" className="custom-range" id="customRange1" onChange={e => { this.handleRadiusSlider(e) }} min="2000" max="12000" />
                        </div>

                        <div className="search-controls-datetimepicker">
                            <p>From:</p>
                            <DateTimePicker
                                onChange={this.handleDateTimeFrom}
                                value={this.state.dateFrom}
                            />
                            <p>To:</p>
                            <DateTimePicker
                                onChange={this.handleDateTimeTo}
                                value={this.state.dateTo}
                            />
                        </div>

                        <div className="searchControls">
                            {(this.state.redirect && <Redirect to={{
                                pathname: '/watch/' + this.urlString
                            }} />)}
                            <button type="button" className="btn btn-success" onClick={this.renderRedirect}>Search</button>
                        </div>

                        <div className="markerInfo">
                            <div>
                                <p>{'Address: ' + this.state.markerAddress}</p>
                            </div>
                            <div>
                                <p> {'Coordinates: ' + this.state.markerLat + ', ' + this.state.markerLng}</p>
                            </div>
                            <div>
                                <p> {'From: ' + this.state.markerDateFrom}</p>
                            </div>
                            <div>
                                <p> {'To: ' + this.state.markerDateTo}</p>
                            </div>
                        </div>

                    </div>
                </div>

            </Fragment>


        )
    }
}

