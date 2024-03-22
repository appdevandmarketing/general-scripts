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
  const TO_EXCLUDE_COUNTIES = {
    "First Commonwealth Bank": ["Bucks County", "Chester County"],
  };
  const TO_EXCLUDE_BRANCHES = {
    "First Commonwealth Bank": ["Devon", "Doylestown"],
  };
  const TRACTS_API_URL =
    "https://xconnect.rainlocal.com/open/v1/campaign/targets/cra-tracts/";
  const BRANCHES_API_URl =
    "https://xconnect.rainlocal.com/open/v1/campaign/targets/branches/";

  const INACTIVE_MARKER = {
    url: "https://cdn1.rainlocal.com/asset/scripts/datorama/widgets/map/map-marker-selected.svg",
    anchor: new google.maps.Point(24, 46),
  };

  const ACTIVE_MARKER = {
    url: "https://cdn1.rainlocal.com/asset/scripts/datorama/widgets/map/map-marker-not-selected.svg",
    anchor: new google.maps.Point(24, 46),
  };

  const authToken = findSupernovaAuthToken();
  const campaignNumbers = findValidCampaignNumbers();
  const datoAdvertiserName = getDatoAdvertiserName();

  let tracts = await getCraTractsInformation(campaignNumbers);
  if (TO_EXCLUDE_COUNTIES.hasOwnProperty(datoAdvertiserName)) {
    tracts = tracts.filter(
      (tract) =>
        !TO_EXCLUDE_COUNTIES[datoAdvertiserName].includes(
          JSON.parse(tract.properties).NAMELSADCO
        )
    );
  }

  let branchesInformation = await getBranchesInformation(datoAdvertiserName);

  if (TO_EXCLUDE_BRANCHES.hasOwnProperty(datoAdvertiserName)) {
    branchesInformation = branchesInformation.filter(
      (bi) => !TO_EXCLUDE_BRANCHES[datoAdvertiserName].includes(bi.branchName)
    );
  }

  const geocoder = new google.maps.Geocoder();

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4, // Initial zoom, but will be overridden by fitBounds
  });
  map.data.setStyle(function (feature) {
    return {
      fillColor: "#27a4dd", // Fill color of the polygon
      strokeWeight: 2, // Stroke width of the polygon boundary
      strokeColor: "#27a4dd", // Stroke color of the polygon boundary
      fillOpacity: 0.2, // Fill opacity of the polygon
    };
  });

  const branchToLongLat = {};
  const branchToMarkerActive = {};
  const branchToMarkerInactive = {};
  const formattedBranches = await Promise.all(
    branchesInformation.map(async (branch) => {
      const name =
        branch.branchAddress +
        ", " +
        branch.branchCity +
        ", " +
        branch.branchState +
        ", " +
        branch.branchCountry;
      const zip = branch.branchZip;
      const row = [name, zip];
      const branchCoord =
        branch.geoCoordinate != null && branch.geoCoordinate != undefined
          ? branch.geoCoordinate
          : await geocodeAddress(geocoder, row);

      branch.geoCoordinate = branchCoord;
      branchToLongLat[branch.branchNumber] = branchCoord;
      branchToMarkerActive[branch.branchNumber] = new google.maps.Marker({
        map: null,
        position: branchCoord,
        title: branch.branchName + ", " + branch.branchAddress,
        icon: ACTIVE_MARKER,
      });
      branchToMarkerInactive[branch.branchNumber] = new google.maps.Marker({
        map: map,
        position: branchCoord,
        title: branch.branchName + ", " + branch.branchAddress,
        icon: INACTIVE_MARKER,
      });
      return branch;
    })
  );

  tracts.forEach((tract) => {
    const geoJson = JSON.parse(tract.geoData);
    map.data.addGeoJson(geoJson);
  });

  const infowindow = new google.maps.InfoWindow();
  map.data.addListener("mouseover", function (event) {
    const feature = event.feature;
    const content = `<div><strong>Details</strong>
<br>
NAME: ${feature.getProperty("NAMELSADCO")}<br>
GEOID: ${feature.getProperty("GEOID")}<br>
STATE: ${feature.getProperty("STATE_NAME")}
</div>`;

    infowindow.setContent(content);
    infowindow.setPosition(event.latLng);
    infowindow.setOptions({ pixelOffset: new google.maps.Size(0, -10) });
    infowindow.open(map);
  });

  map.data.addListener("mouseout", function (event) {
    infowindow.setContent("");
    infowindow.close();
  });

  fitAllbounds();

  $(".loading").hide();

  $(".treeContainer").css({ "max-height": "100%", overflow: "auto" });
  $(".treeContainer").html(createTreeListing(branchesInformation));

  let currentlyActiveCtl = null;
  $("body").on("click", "[role=ctl]", function () {
    if (this === currentlyActiveCtl) {
      $("[role=ctl]").removeClass("active");
      resetAllMarkersToInactive();
      fitAllbounds();
      currentlyActiveCtl = null;
    } else {
      currentlyActiveCtl = this;
      $("[role=ctl]").removeClass("active");
      $(this).addClass("active");
      const branchNumber = $(this).data("ctlid");

      if (branchToLongLat.hasOwnProperty(branchNumber)) {
        resetAllMarkersToInactive();
        branchToMarkerInactive[branchNumber].setMap(null);
        branchToMarkerActive[branchNumber].setMap(map);

        fitBoundsAroundLatLong(branchToLongLat[branchNumber]);
      }
    }
  });

  function getDatoAdvertiserName() {
    const query = DA.query.getQuery();
    const filter = query.filter;
    const values = Object.entries(filter);
    for (let [_, value] of values) {
      if (value.name.includes("Advertiser")) {
        return value.value[0].value[0];
      }
    }
    return "Unknown";
  }

  function fitBoundsAroundLatLong(latLng) {
    const boundsArray = [];
    const bearings = [0, 90, 180, 270];
    const radius = 50000;
    bearings.forEach((bearing) => {
      const bound = google.maps.geometry.spherical.computeOffset(
        latLng,
        radius,
        bearing
      );
      boundsArray.push(bound);
    });

    const bounds = new google.maps.LatLngBounds();
    boundsArray.forEach((marker) => {
      bounds.extend(marker);
    });
    map.fitBounds(bounds);
  }

  function hideAllMarkers() {
    Object.values(branchToMarkerInactive).forEach((marker) => {
      marker.setMap(null);
    });
    Object.values(branchToMarkerActive).forEach((marker) => {
      marker.setMap(null);
    });
  }

  function resetAllMarkersToInactive() {
    Object.values(branchToMarkerInactive).forEach((marker) => {
      marker.setMap(map);
    });
    Object.values(branchToMarkerActive).forEach((marker) => {
      marker.setMap(null);
    });
  }

  function fitAllbounds() {
    const bounds = new google.maps.LatLngBounds();
    map.data.forEach(function (feature) {
      processPointsForBounds(feature.getGeometry(), bounds.extend, bounds);
    });

    map.fitBounds(bounds);
  }

  function createTreeListing(branchesInformation) {
    branchesInformation.sort((a, b) => {
      const nameA = a.branchName.toUpperCase();
      const nameB = b.branchName.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    let html = "";
    branchesInformation.forEach((branch) => {
      html += `<div class="row" style="margin-left: 0px;margin-right: 5px;"><div class="col-sm-12 label label-default" role="ctl" data-campaignId="" data-ctlId="${branch.branchNumber}">${branch.branchName}</div></div>`;
    });
    return html;
  }

  function geocodeAddress(geocoder, rowData) {
    return new Promise((resolve, reject) => {
      if (rowData.length == 3) {
        const latLong = new google.maps.LatLng(rowData[0], rowData[1]);
        resolve(latLong);
      } else {
        geocoder.geocode({ address: rowData[0] }, function (results, status) {
          if (status === "OK") {
            // console.log(
            //   "Latitude and longitude found for address: " +
            //     rowData[0] +
            //     " as: " +
            //     results[0].geometry.location
            // );
            const latLong = results[0].geometry.location;
            resolve(latLong);
          } else {
            reject(status);
          }
        });
      }
    });
  }

  function processPointsForBounds(geometry, callback, thisArg) {
    if (geometry instanceof google.maps.LatLng) {
      callback.call(thisArg, geometry);
    } else if (geometry instanceof google.maps.Data.Point) {
      callback.call(thisArg, geometry.get());
    } else {
      geometry.getArray().forEach(function (g) {
        processPointsForBounds(g, callback, thisArg);
      });
    }
  }

  function getBranchesInformation(advertiserName) {
    const url = BRANCHES_API_URl + encodeURIComponent(advertiserName);
    const headers = { "X-AuthToken": authToken };
    return $.ajax({
      url,
      headers,
    });
  }

  function getCraTractsInformation(campaignNumbers) {
    const url = TRACTS_API_URL + campaignNumbers.join(",");
    const headers = { "X-AuthToken": authToken };
    return $.ajax({
      url,
      headers,
    });
  }

  function findSupernovaAuthToken() {
    try {
      const results = DA.query.getQueryResult();
      return results.rows[0][findAuthTokenIndex(results)].value;
    } catch (err) {
      return "";
    }
  }

  function findAuthTokenIndex() {
    const results = DA.query.getQueryResult();
    const fields = results.fields;
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].defaultName.includes("Supernova X Auth Token")) {
        return i;
      }
    }
    return -1;
  }

  function getAdvertiserName() {
    const results = DA.query.getQueryResult();
    const advertiserIndex = findAdvertiserNameIndex(results);
    let advName = "";
    results.forEach((row) => {
      const advertiserName = row[advertiserIndex].value;
      if (advName.length < advertiserName.length) {
        advName = advertiserName;
      }
    });
    return advName;
  }

  function findValidCampaignNumbers() {
    const results = DA.query.getQueryResult();

    const campaignNumbers = [];
    const campaignNumberIndex = findCampaignNumberIndex(results);
    const campaignHIndex = findCampaignNameHIndex(results);
    const campaignNameIndex = findCampaignNameIndex(results);

    results.rows.forEach((row) => {
      const campaignNumber = row[campaignNumberIndex].value.replace(/\D/g, "");
      if (
        campaignHIndex >= 0 &&
        campaignNameIndex >= 0 &&
        row[campaignNameIndex].value !== "CRA"
      ) {
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

  function findAdvertiserNameIndex(results) {
    const fields = results.fields;
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].defaultName.includes("Advertiser")) {
        return i;
      }
    }
    return -1;
  }
}
