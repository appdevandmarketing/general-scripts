var trackingUrl = 'https://conversion.rainlocal.com/click';
var conversionUrl = 'https://conversion.rainlocal.com/conversion';
var campaignLandingPageId = 2020;
var clickUrlParameterId = 0;


function trackUrlParameters(callback) {
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

}

function trackConversion(type, callBack) {
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

//set cookie
if (getParameterByName('dsp') == "F70624" || getParameterByName('dsp') == "FACD02" || getParameterByName('dsp') == "010101") {
    trackUrlParameters();
}

