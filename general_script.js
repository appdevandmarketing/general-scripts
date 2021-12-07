var trackingUrl_sn = 'https://conversion.rainlocal.com/v2/click';
var conversionUrl_sn = 'https://conversion.rainlocal.com/v2/conversion';
var shouldRequestLocation_sn = false;
var validSource_sn = false;
var sessionUuid_sn = null;

var location_sn = {
    lat: 0,
    lng: 0
}

function track_sn(name) {
    if (!validSource_sn) {
        return;
    }

    if(!sessionUuid_sn){
        getSession_sn();
    }

    if (sessionUuid_sn) {
        post_sn(conversionUrl_sn, {name: name, sessionUuid: sessionUuid_sn}, function (response) {
        });
    } else {
        console.log("Session not initiated or not valid")
    }
}

function isValidSource_sn() {
    var source = getQueryParam_sn("utm_source")
    if (source) {
        validSource_sn = source.startsWith("rain");
    }
}

function post_sn(url, data, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onload = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            if (callback) {
                callback(JSON.parse(xmlHttp.responseText));
            }
        }
    }

    xmlHttp.open("post", url, false);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.setRequestHeader("Cross-Domain", "true");
    xmlHttp.send(JSON.stringify(data));
}

function getSession_sn() {

    if (sessionUuid_sn || !validSource_sn) {
        return;
    }

    var sessionObj = {
        url: window.location.href,
        lat: location_sn.lat,
        lng: location_sn.lng
    }

    post_sn(trackingUrl_sn, sessionObj, function (response) {
        if(response){
            sessionUuid_sn = response.value
        }
    });
}

function loadLocation_sn(callback) {
    if (shouldRequestLocation_sn && ("geolocation" in navigator)) {
        navigator.geolocation.getCurrentPosition(function (position) {
            location_sn.lat = position.coords.latitude
            location_sn.lng = position.coords.longitude
            callback()
        });
    }
    callback()
}

/*
 * ref. https://stackoverflow.com/questions/831030/
 * a function that retrieves the value of a query parameter
 */
function getQueryParam_sn(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(window.location.search)) {
        return decodeURIComponent(name[1]);
    }
}

function init_sn() {
    isValidSource_sn();
    loadLocation_sn(getSession_sn);
}


/*
 * Old logic starts from here
 * clk_sn() function below is used by both new and old tracking
 */
var trackingUrl = 'https://conversion.rainlocal.com/click';
var conversionUrl = 'https://conversion.rainlocal.com/conversion';
var campaignLandingPageId = 2020;
var clickUrlParameterId = 0;

function trackUrlParameters(callback) {
    if (clickUrlParameterId == 0) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onload = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                clickUrlParameterId = JSON.parse(xmlHttp.responseText).id;
                callback;
            }
        }
        xmlHttp.open("post", trackingUrl, false);
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.setRequestHeader("Cross-Domain", "true");
        xmlHttp.send(JSON.stringify(getDataFromUrl()));
    } else {
        callback;
    }
}

function trackConversion(type, callBack) {
    trackUrlParameters();

    var conversionData = {
        type: type,
        campaignLandingPageId: campaignLandingPageId
    };

    if (clickUrlParameterId !== 0) {
        conversionData.clickUrlParameterId = clickUrlParameterId;
    }

    if (getParameterByName('fulfillmentCreativeId')) {
        conversionData.fulfillmentCreativeId = getParameterByName('fulfillmentCreativeId');
    }

    if (getParameterByName('dsp')) {
        conversionData.postBackId = getParameterByName('dsp');
    }

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callBack;
        }
    }

    xmlHttp.open("post", conversionUrl, false);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.setRequestHeader("Cross-Domain", "true");
    xmlHttp.send(JSON.stringify(conversionData));

}

function trackTractConversion() {
}

function getDataFromUrl() {
    var urlData = {
        campaignLandingPageId: campaignLandingPageId,
        domain: getParameterByName('domain'),
        gaid: getParameterByName('gaid'),
        idfa: getParameterByName('idfa'),
        dspOrderId: getParameterByName('dspOrderId'),
        dspCampaignId: getParameterByName('dspCampaignId'),
        lat: '',
        lng: ''
    };

    if (isNumber(getParameterByName('lat'))) {
        urlData.lat = getParameterByName('lat');
    }

    if (isNumber(getParameterByName('lng'))) {
        urlData.lng = getParameterByName('lng');
    }

    if (getParameterByName('dsp')) {
        urlData.postBackId = getParameterByName('dsp');
        urlData.domain = 'rainlocal.com';
    }

    if (getParameterByName('fulfillmentCreativeId')) {
        urlData.fulfillmentCreativeId = getParameterByName('fulfillmentCreativeId');
    }

    if (getParameterByName('fulfillmentOrderId')) {
        urlData.fulfillmentOrderId = getParameterByName('fulfillmentOrderId');
    }

    if (getParameterByName('px')) {
        urlData.gaid = getParameterByName('px');
    }

    if (getParameterByName('pb')) {
        urlData.idfa = getParameterByName('pb');
    }

    return urlData;
}

function isNumber(testText) {
    return !isNaN(parseFloat(testText));
}

function getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function clk_sn(convName) {
    if (getParameterByName('dsp') == "F70624" || getParameterByName('dsp') == "FACD02" || getParameterByName('dsp') == "010101" || getParameterByName('dsp') == "FF69B4") {
        trackUrlParameters();
        trackConversion(convName);
        trackTractConversion();
    }
    track_sn(convName)
}

function append_utms(domainsToDecorate, queryParams) {

    queryParams.push.apply(queryParams, ['fulfillmentCreativeId', 'dspCampaignId', 'dspOrderId', 'fulfillmentOrderId', 'dsp'])

    // do not edit anything below this line
    var links = document.querySelectorAll('a');

// check if links contain domain from the domainsToDecorate array and then decorates
    for (var linkIndex = 0; linkIndex < links.length; linkIndex++) {
        for (var domainIndex = 0; domainIndex < domainsToDecorate.length; domainIndex++) {
            if (links[linkIndex].href.indexOf(domainsToDecorate[domainIndex]) > -1 && links[linkIndex].href.indexOf("#") === -1) {
                links[linkIndex].href = decorateUrl(links[linkIndex].href);
            }
        }
    }

// decorates the URL with query params
    function decorateUrl(urlToDecorate) {
        urlToDecorate = (urlToDecorate.indexOf('?') === -1) ? urlToDecorate + '?' : urlToDecorate + '&';
        var collectedQueryParams = [];
        for (var queryIndex = 0; queryIndex < queryParams.length; queryIndex++) {
            if (getQueryParam(queryParams[queryIndex])) {
                collectedQueryParams.push(queryParams[queryIndex] + '=' + getQueryParam(queryParams[queryIndex]))
            }
        }
        return urlToDecorate + collectedQueryParams.join('&');
    }

    // borrowed from https://stackoverflow.com/questions/831030/
    // a function that retrieves the value of a query parameter
    function getQueryParam(name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(window.location.search))
            return decodeURIComponent(name[1]);
    }

}

init_sn()
