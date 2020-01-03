import {
    // toLatLon,
    // toLatitudeLongitude,
    // headingDistanceTo,
    moveTo,
    //  insidePolygon
} from "geolocation-utils";

export function convertStringToDate(dateStr) {
    if (dateStr.substring(1, 2) === " ")
        dateStr = "0" + dateStr
    let day = dateStr.substring(0, 2)
    let month = dateStr.substring(3, 6)
    var d = Date.parse(month + "1, 2012");
    if (!isNaN(d)) {
        month = new Date(d).getMonth() + 1;
    }
    let year = dateStr.substring(7, 11)

    let time = dateStr.substring(12)
        , reggie = /(\d{2}):(\d{2}):(\d{2})/
        , [, hours, minutes, seconds] = reggie.exec(time)
        , dateObject = new Date(year, month - 1, day, hours, minutes, seconds);

    return dateObject
}

export function convertSub(content) {
    let tempArr = [];
    let location = [];

    content.forEach(f => {

        let split2 = JSON.stringify(f);

        split2 = split2.replace(/n/g, "");
        split2 = split2.replace(/\\/g, "|");
        split2 = split2.replace(/ --> /g, "|");
        split2 = split2.replace("[", "");
        split2 = split2.replace("]", "");
        split2 = split2.replace(/"/g, "");
        split2 = split2.replace(/,,/g, ",");
        split2 = split2.replace(" ", "");


        let index, filename, date, timeFrom, timeTo, lat, lon, direction;
        let string = "";
        let count = 0;
        filename = split2.split('|')[0]
        split2 = split2.replace(filename + '|', '');
        for (let i = 0; i < split2.length; i++) {
            if (split2.charAt(i) !== "|") string += split2.charAt(i);

            if (split2.charAt(i) === "|" && string !== "") {
                ++count;
                switch (count) {
                    case 1:
                        index = string;
                        break;
                    case 2:
                        timeFrom = string;
                        break;
                    case 3:
                        timeTo = string;
                        break;
                    case 4:
                        date = string;
                        break;
                    case 5:
                        lat = string;
                        break;
                    case 6:
                        lon = string;
                        break;
                    case 7:
                        direction = string;
                        tempArr.push({
                            index: index,
                            filename: filename,
                            timeFrom: timeFrom,
                            timeTo: timeTo,
                            date: date,
                            lat: lat,
                            lon: lon,
                            direction: direction
                        });
                        count = 0;
                        break;
                    default:
                        break;
                }

                string = "";
            }
        }
        location.push(tempArr)
        tempArr = [];
    })

    return location;
}

export function convertSubSearch(content) {
    let tempArr = [];
    let location = [];

    content.forEach(f => {

        let split2 = JSON.stringify(f);
        split2 = split2.replace(/n/g, "");
        split2 = split2.replace(/\\/g, "|");
        split2 = split2.replace(/ --> /g, "|");
        split2 = split2.replace("[", "");
        split2 = split2.replace("]", "");
        split2 = split2.replace(/"/g, "");
        split2 = split2.replace(/,,/g, ",");
        //split2 = split2.replace(" ", "");


        let index, filename, date, timeFrom, timeTo, lat, lon, direction;
        let string = "";
        let count = 0;
        filename = split2.split('|')[0]
        split2 = split2.replace(filename + '|', '');
        for (let i = 0; i < split2.length; i++) {
            if (split2.charAt(i) !== "|") string += split2.charAt(i);

            if (split2.charAt(i) === "|" && string !== "") {
                ++count;
                switch (count) {
                    case 1:
                        index = string;
                        break;
                    case 2:
                        timeFrom = string;
                        break;
                    case 3:
                        timeTo = string;
                        break;
                    case 4:
                        date = string;
                        break;
                    case 5:
                        lat = string;
                        break;
                    case 6:
                        lon = string;
                        break;
                    case 7:
                        direction = string;
                        tempArr.push({
                            index: index,
                            filename: filename,
                            timeFrom: timeFrom,
                            timeTo: timeTo,
                            date: date,
                            lat: lat,
                            lon: lon,
                            direction: direction
                        });
                        count = 0;
                        break;
                    default:
                        break;
                }

                string = "";
            }
        }

        location.push(tempArr)
        tempArr = [];
    })
    return location;
}

export function createPath(content) {
    let pathArr = [];
    let tempArr = [];
    content.forEach(path => {

        path.forEach(function (contents) {
            tempArr.push({ lat: parseFloat(contents.lat), lng: parseFloat(contents.lon) });
        });
        pathArr.push(tempArr)
        tempArr = [];
    });

    return pathArr;
}

export function calcDirectionVector(subtitle_file) {
    let tempArr = [];
    let directionVectors = [];
    subtitle_file.forEach(path => {
        path.forEach(function (data) {
            const leftCoords = moveTo(
                { lat: parseFloat(data.lat), lon: parseFloat(data.lon) },
                { distance: 50, heading: parseInt(data.direction) - 22.5 }
            );

            const rightCoords = moveTo(
                { lat: parseFloat(data.lat), lon: parseFloat(data.lon) },
                { distance: 50, heading: parseInt(data.direction) + 22.5 }
            );

            tempArr.push({
                filename: data.filename,
                initial: { lat: parseFloat(data.lat), lng: parseFloat(data.lon) },
                left: { lat: leftCoords.lat, lng: leftCoords.lon },
                right: { lat: rightCoords.lat, lng: rightCoords.lon }
            });

        });
        directionVectors.push(tempArr)
        tempArr = [];
    })

    return directionVectors;
}