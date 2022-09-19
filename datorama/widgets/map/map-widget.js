importScripts([
  [
    "css",
    "https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css",
  ],
  [
    "css",
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css",
  ],

  [
    "js",
    "https://maps.googleapis.com/maps/api/js?key=AIzaSyBwA_84CNVQjgvQn2fUvOg9jOz93qMHUdo&libraries=geometry",
  ],
  ["js", "https://code.jquery.com/jquery-3.6.0.min.js"],
  [
    "js",
    "https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js",
  ],
  ["js", "https://polyfill.io/v3/polyfill.min.js?features=default"],
]).then(function () {
  jQuery(onLoad);
});

async function onLoad($) {
  const C_ZOOM_LEVEL = 10;
  const CTL_ZOOM_LEVEL = 12;
  const CT_ZOOM_LEVEL = 14;
  const API_URL = "https://supernovaapp.rainlocal.com/campaign/targets/";

  const loadedMapData = [];
  const loadedTargetLists = [];

  let googleMapsInstance = null;

  function isInitialized() {
    return googleMapsInstance !== null;
  }

  function init(centerLat, centerLng, zoomLevel, element = "map") {
    if (isInitialized() || !centerLat || !centerLng || !zoomLevel) {
      console.log("Map already created");
      return;
    }

    console.log("Init");
    const latLng = new google.maps.LatLng(centerLat, centerLng);
    const settings = {
      zoom: zoomLevel,
      center: latLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    googleMapsInstance = new google.maps.Map(
      document.getElementById(element),
      settings
    );
  }

  function setCenterLatLng(latLng) {
    if (!isInitialized()) {
      return;
    }
    googleMapsInstance.setCenter(latLng);
  }

  function setCenter(lat, lng) {
    if (!isInitialized()) {
      return;
    }
    googleMapsInstance.panTo(new google.maps.LatLng(lat, lng));
  }
  function setZoom(zoomLevel) {
    if (!isInitialized()) {
      return;
    }
    googleMapsInstance.setZoom(zoomLevel);
  }

  function resize() {
    if (!isInitialized()) {
      return;
    }
    console.log("resize");
    google.maps.event.trigger(googleMapsInstance, "resize");
  }

  function createPolygon(path, color, polygonDefaultOptions) {
    const tmp = Object.assign({}, polygonDefaultOptions);
    tmp.fillColor = color;
    tmp.strokeColor = color;

    tmp.paths = path;
    tmp.map = googleMapsInstance;

    return new google.maps.Polygon(tmp);
  }

  function fitBounds(boundsArray) {
    if (!isInitialized()) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    boundsArray.forEach((marker) => {
      bounds.extend(marker);
    });
    googleMapsInstance.fitBounds(bounds);

    if (boundsArray.length == 1) {
      console.log("Setting array bounds zoom" + boundsArray[0]);
      setZoom(C_ZOOM_LEVEL);
    }
  }

  function createCircle(circle, color, circleOptionsDefaults) {
    const tmp = Object.assign({}, circleOptionsDefaults);
    // Sets the color
    tmp.fillColor = color;
    tmp.strokeColor = color;

    tmp.map = googleMapsInstance;
    tmp.center = new google.maps.LatLng(circle.center.lat, circle.center.lng);
    tmp.radius = kilometersToMeters(circle.radius);

    return new google.maps.Circle(tmp);
  }

  function kilometersToMeters(km) {
    return km * 1000;
  }

  function formatPolygonCoordinates(polygonCoordinates) {
    if (!polygonCoordinates) {
      return [];
    }

    const formattedCoordinates = [];
    for (let i = 0; i < polygonCoordinates.length; i++) {
      formattedCoordinates.push(
        new google.maps.LatLng(
          polygonCoordinates[i].lat,
          polygonCoordinates[i].lng
        )
      );
    }
    return formattedCoordinates;
  }

  function findCampaignNumberIndex(results) {
    const fields = results.fields;
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].defaultName.includes("Campaign Number")) {
        return i;
      }
    }
    return -1;
  }

  function findCampaignNameHIndex(results) {
    const fields = results.fields;
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].defaultName.includes("Campaign Name (h)")) {
        return i;
      }
    }
    return -1;
  }

  function findCampaignNameIndex(results) {
    const fields = results.fields;
    for (let i = 0; i < fields.length; i++) {
      if (
        fields[i].defaultName.includes("Campaign Name") &&
        fields[i].systemName === "CAMPAIGN"
      ) {
        return i;
      }
    }
    return -1;
  }

  function findValidCampaignNumbers(results) {
    const campaignNumbers = [];
    const campaignNumberIndex = findCampaignNumberIndex(results);
    const campaignHIndex = findCampaignNameHIndex(results);
    const campaignNameIndex = findCampaignNameIndex(results);

    results.rows.forEach((row) => {
      const campaignNumber = row[campaignNumberIndex].value.replace(/\D/g, "");
      if (campaignHIndex >= 0 && campaignNameIndex >= 0) {
        const campaignNameH = row[campaignHIndex].value;
        const campaignName = row[campaignNameIndex].value;
        if (
          campaignName == null ||
          campaignName == "" ||
          !campaignName.includes(campaignNameH)
        ) {
          return;
        }
      }
      if (
        campaignNumber == null ||
        campaignNumber == "" ||
        isNaN(campaignNumber) ||
        campaignNumbers.includes(campaignNumber)
      ) {
        return;
      }
      campaignNumbers.push(campaignNumber);
    });
    return campaignNumbers;
  }

  async function loadMapDataFromAPI() {
    const results = DA.query.getQueryResult();
    console.log(JSON.stringify(results));

    const loadedCoordinates = [];
    const campaignNumbers = findValidCampaignNumbers(results);

    for (let index = 0; index < campaignNumbers.length; index++) {
      if (index > 10) break;
      const campaignNumber = campaignNumbers[index];

      const response = await $.get(API_URL + campaignNumber);

      response.campaignTargetLists.forEach((targetList) => {
        let isCampaignTargetListLoaded = false;

        targetList.campaignTargets.forEach((target) => {
          if (loadedCoordinates.includes(target.coordinates)) {
            return;
          }

          isCampaignTargetListLoaded = true;
          loadedCoordinates.push(target.coordinates);
          const mapType = target.type;
          const geoData = JSON.parse(target.coordinates);
          if (mapType == "circle") {
            if (!isInitialized()) {
              init(geoData.center.lat, geoData.center.lng, C_ZOOM_LEVEL);
            }
            createCircle(geoData, chooseRandomColor());
          } else {
            if (!isInitialized()) {
              init(geoData[0].lat, geoData[0].lng, C_ZOOM_LEVEL);
            }
            createPolygon(
              formatPolygonCoordinates(geoData),
              chooseRandomColor(),
              null
            );
          }
        });

        if (isCampaignTargetListLoaded) {
          loadedTargetLists.push(targetList);
        }
      });
      loadedMapData.push(response);
    }

    if (isInitialized()) {
      panToCampaign(loadedMapData);
    }
  }

  function defaultMap() {
    new google.maps.Map(document.getElementById("map"), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });
  }

  function chooseRandomColor() {
    const colors = [
      "#ff0000ff",
      "#00ff00ff",
      "#0000ffff",
      "#2E8B57ff",
      "#DC143CFF",
      "#4B0082FF",
      "#A0522DFF",
      "#006400FF",
      "#39C0ED",
      "#262626",
      "#FFA900",
      "#B23CFD",
      "#00B74A",
    ];
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
  }

  function createTreeListing() {
    let html = "";

    loadedMapData.forEach((campaign) => {
      campaign.campaignTargetLists.forEach((campaignTargetList) => {
        if (loadedTargetLists.includes(campaignTargetList)) {
          html += `<div class="row" style="margin-left: 0px;margin-right: 5px;"><div class="col-sm-12 label label-default" role="ctl" data-campaignId="${campaign.id}" data-ctlId="${campaignTargetList.id}">${campaignTargetList.name}</div></div>`;
        }
      });
    });

    $(".treeContainer").html(html);
    return html;
  }

  function findCampaignByCampaignId(cId) {
    for (let i = 0; i < loadedMapData.length; i++) {
      if (loadedMapData[i].id == cId) {
        return loadedMapData[i];
      }
    }
  }

  function findCampaignTargetList(cid, ctlId) {
    const campaign = findCampaignByCampaignId(cid);
    for (let i = 0; i < campaign.campaignTargetLists.length; i++) {
      if (campaign.campaignTargetLists[i].id == ctlId) {
        return campaign.campaignTargetLists[i];
      }
    }
    return null;
  }

  function findCampaignTarget(cid, ctlId, ctId) {
    const ctl = findCampaignTargetList(cid, ctlId);
    for (let i = 0; i < ctl.campaignTargets.length; i++) {
      if (ctl.campaignTargets[i].id == ctId) {
        return ctl.campaignTargets[i];
      }
    }
    return null;
  }

  function panToCampaignTarget(firstCt) {
    const boundsArray = [];
    const mapType = firstCt.type;
    const geoData = JSON.parse(firstCt.coordinates);
    addBoundsForGeoData(boundsArray, geoData, mapType);
    fitBounds(boundsArray);
  }

  function addBoundsForGeoData(boundsArray, geoData, mapType) {
    if (mapType == "circle") {
      try {
        let latLng = new google.maps.LatLng(
          geoData.center.lat,
          geoData.center.lng
        );
        const bearings = [0, 90, 180, 270];
        const radius = kilometersToMeters(geoData.radius);
        bearings.forEach((bearing) => {
          const bound = google.maps.geometry.spherical.computeOffset(
            latLng,
            radius,
            bearing
          );
          boundsArray.push(bound);
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      geoData.forEach((gd) => {
        boundsArray.push(new google.maps.LatLng(gd.lat, gd.lng));
      });
    }
  }

  function panToCampaignTargetList(firstCtl) {
    let animTime = 500;
    if (googleMapsInstance.getZoom() < C_ZOOM_LEVEL - 1) {
      animTime = 0;
    } else {
      setZoom(googleMapsInstance.getZoom() - 1);
    }

    setTimeout(() => {
      const boundsArray = [];
      firstCtl.campaignTargets.forEach((target) => {
        const mapType = target.type;
        const geoData = JSON.parse(target.coordinates);
        addBoundsForGeoData(boundsArray, geoData, mapType);
      });
      fitBounds(boundsArray);
    }, animTime);
  }

  function panToCampaign(campaigns) {
    const boundsArray = [];
    campaigns.forEach((campaign) => {
      campaign.campaignTargetLists.forEach((targetList) => {
        targetList.campaignTargets.forEach((target) => {
          const mapType = target.type;
          const geoData = JSON.parse(target.coordinates);
          addBoundsForGeoData(boundsArray, geoData, mapType);
        });
      });
    });

    fitBounds(boundsArray);
  }

  $("body").on("click", "[role=c]", function () {
    console.log("Clicked on campaigns");
    const cId = $(this).data("campaignid");
    const campaign = findCampaignByCampaignId(cId);
    if (campaign == null) return;
    panToCampaign([campaign]);
  });

  $("body").on("click", "[role=ctl]", function () {
    console.log("Clicked on ctl");
    const cId = $(this).data("campaignid");
    const ctlId = $(this).data("ctlid");

    const firstCtl = findCampaignTargetList(cId, ctlId);
    if (firstCtl == null) return;
    panToCampaignTargetList(firstCtl);

    $("[role=ctl]").removeClass("active");
    $(this).addClass("active");
  });

  $("body").on("click", "[role=ct]", function () {
    console.log("Clicked on ct");
    const cId = $(this).data("campaignid");
    const ctlId = $(this).data("ctlid");
    const ctId = $(this).data("ctid");

    const firstCt = findCampaignTarget(cId, ctlId, ctId);

    if (firstCt == null) return;
    panToCampaignTarget(firstCt);
  });

  function createErrorTemplate(title, message) {
    return `
      <h2>${title}&nbsp;<b>:(</b></h2>
      <h3>${message}</h3>
       <div class="gears">
        <div class="gear one">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
        <div class="gear two">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
        <div class="gear three">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>
      </div>
      `;
  }

  try {
    await loadMapDataFromAPI();
    createTreeListing();
    if (!isInitialized()) {
      $("body").html(
        createErrorTemplate(
          "No Maps",
          "Targeting map is not available for this campaign."
        )
      );
    }
  } catch (err) {
    console.log(err);
    $("body").html(
      createErrorTemplate(
        "Error",
        "There was an error loading campaign target maps!"
      )
    );
  }

  $(".loading").hide();
}