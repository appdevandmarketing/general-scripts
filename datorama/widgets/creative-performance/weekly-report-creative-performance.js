importScripts([
  ["css", "https://cdn.datatables.net/1.12.1/css/jquery.dataTables.min.css"],
  [
    "css",
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/css/bootstrap.min.css",
  ],
  [
    "css",
    "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css",
  ],
  ["css", "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css"],
  [
    "css",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css",
  ],
  ["css", "https://vjs.zencdn.net/7.20.3/video-js.css"],

  ["js", "https://cdn.datatables.net/1.12.1/js/jquery.dataTables.min.js"],
  [
    "js",
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/js/bootstrap.min.js",
  ],
  [
    "js",
    "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js",
  ],
  ["js", "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js"],
  ["js", "https://vjs.zencdn.net/7.20.3/video.min.js"],
]).then(function () {
  jQuery(onLoad);
});

const SEARCH_AD_ICON_URL =
  "https://cdn1.rainlocal.com/asset/scripts/datorama/widgets/creative-performance/search_ad_icon.png";
const ALERT_ICON_URL =
  "https://cdn1.rainlocal.com/asset/scripts/datorama/widgets/creative-performance/alert-icon.svg";
const VIDEO_PLAYER_ICON_URL =
  "https://cdn1.rainlocal.com/asset/scripts/datorama/widgets/creative-performance/video-player-icon.svg";
const ICON_URL_CODE_OUTLINE =
  "https://cdn1.rainlocal.com/asset/icon/generic/code-outline.png";

const API_ENDPOINT = "https://xconnect.rainlocal.com/open/v1/creative/adsLink2";

const FIELD_CAMPAIGN_NUMBER_H = "Campaign Number (h)";
const FIELD_AD_NUMBER = "Ad Number";
const FIELD_IMPRESSIONS = "Impressions";
const FIELD_CLICKS = "Clicks";
const FIELD_CTR = "CTR";
const FIELD_GA_RAIN_EVENTS = "GA4 RAIN Events";
const FIELD_CONV_RATE = "Conv Rate";
const FIELD_CAMPAIGN_NAME = "Campaign Name";
const FIELD_CAMPAIGN_NAME_H = "Campaign Name (h)";
const FIELD_AD_TYPE = "Ad Type";
const FIELD_AD_CONTENT = "Ad Content";
const FIELD_AD_SIZE = "Ad Size";
const FIELD_AD_THUMBNAIL = "Ad Image";
const FIELD_CLICKS_RI = "Clicks - RI";
const FIELD_BID_STRATEGY_H = "Bid Strategy (h)";
const FIELD_X_AUTH_TOKEN = "Supernova X Auth Token (Calc)";
const BID_STRATEGY_FOR_PAID_SEARCH = ["Paid Search", "Search"];

const AGGREGATION_SKIP_DIMENSIONS = [
  FIELD_CAMPAIGN_NAME,
  FIELD_CAMPAIGN_NAME_H,
  FIELD_CAMPAIGN_NUMBER_H,
  FIELD_BID_STRATEGY_H,
  FIELD_X_AUTH_TOKEN,
];

const CALCULATED_VALUES = {
  [FIELD_CTR]: (row, datoFieldIndex, adLinks, istotalField, datoRows) => {
    if (row[FIELD_IMPRESSIONS] == 0) return 0;
    return (row[FIELD_CLICKS] / row[FIELD_IMPRESSIONS]) * 100;
  },
  [FIELD_CONV_RATE]: (row, datoFieldIndex, adLinks, istotalField, datoRows) => {
    if (row[FIELD_CLICKS] == 0) return 0;
    let clicks = row[FIELD_CLICKS];
    if (FIELD_CLICKS_RI in row) {
      clicks = row[FIELD_CLICKS_RI];
    }
    return (row[FIELD_GA_RAIN_EVENTS] / clicks) * 100;
  },
  [FIELD_AD_THUMBNAIL]: (
    row,
    datoFieldIndex,
    adLinks,
    istotalField,
    datoRows
  ) => {
    const thumbHeight = 60;
    const thumbWidth = 60;

    const adKey = getAggregationKey(datoFieldIndex, row);

    if (istotalField) return "Total";

    if (row[FIELD_AD_NUMBER] === "Unattributed") {
      return `<img src="${ALERT_ICON_URL}" alt="Error" width="${thumbWidth}" height="${thumbHeight}" style="object-fit: scale-down;"></img>`;
    }

    if (row[FIELD_AD_NUMBER].endsWith("A")) {
      return `<img src="${ICON_URL_CODE_OUTLINE}" alt="Video" width="${thumbWidth}" height="${thumbHeight}" style="object-fit: scale-down;"></img>`;
    }

    if (
      datoRows != null &&
      datoRows.length > 0 &&
      BID_STRATEGY_FOR_PAID_SEARCH.includes(datoRows[0][FIELD_BID_STRATEGY_H])
    ) {
      return `<img src="${SEARCH_AD_ICON_URL}" alt="Error" width="${thumbWidth}" height="${thumbHeight}" style="object-fit: scale-down;"></img>`;
    }

    if (adKey in adLinks) {
      const ads = filterBestFitAds(adLinks[adKey]);
      if (ads.length > 0) {
        const imageAds = ads.filter((a) => a.mimeType.startsWith("image/", 0));
        const videoAds = ads.filter((a) => a.mimeType.startsWith("video/", 0));
        const animatedAds = ads.filter((a) =>
          a.mimeType.startsWith("text/html", 0)
        );

        if (imageAds.length > 0) {
          return `<img src="${imageAds[0].url}" alt="${imageAds[0].adFileName}" width="${thumbWidth}" height="${thumbHeight}" style="object-fit: cover;"></img>`;
        } else if (videoAds.length > 0) {
          return `<img src="${VIDEO_PLAYER_ICON_URL}" alt="Video" width="${thumbWidth}" height="${thumbHeight}" style="object-fit: scale-down;"></img>`;
        } else if (animatedAds.length > 0) {
          return `<img src="${ICON_URL_CODE_OUTLINE}" alt="Video" width="${thumbWidth}" height="${thumbHeight}" style="object-fit: scale-down;"></img>`;
        }
      }
    }
    return `<img src="${ALERT_ICON_URL}" alt="Error" width="${thumbWidth}" height="${thumbHeight}" style="object-fit: scale-down;"></img>`;
  },
};

const FIELD_DATA_FORMATTER = {
  [FIELD_IMPRESSIONS]: numberWithCommas,
  [FIELD_CLICKS]: numberWithCommas,
  [FIELD_CTR]: (val) => percentageFormatter(val, 2),
  [FIELD_GA_RAIN_EVENTS]: numberWithCommas,
  [FIELD_CONV_RATE]: (val) => percentageFormatter(val, 1),
};

const DIMENSIONS_TO_DISPLAY = [
  FIELD_AD_THUMBNAIL,
  FIELD_AD_NUMBER,
  FIELD_AD_TYPE,
  FIELD_AD_CONTENT,
];

const MEASUREMENTS_TO_DISPLAY = [
  FIELD_IMPRESSIONS,
  FIELD_CLICKS,
  FIELD_CTR,
  FIELD_GA_RAIN_EVENTS,
  FIELD_CONV_RATE,
];

const DATO_TO_API_DATA_FUSION = {
  [FIELD_AD_NUMBER]: "adNumber",
  [FIELD_AD_SIZE]: "adSize",
  [FIELD_AD_TYPE]: "adType",
  [FIELD_AD_CONTENT]: "adContent",
};

const LOADER_HTML_WITH_CLASS = (klass) => {
  return `
      <div class='loader ${klass}'>
        <div class='loader--dot'></div>
        <div class='loader--dot'></div>
        <div class='loader--dot'></div>
        <div class='loader--dot'></div>
        <div class='loader--dot'></div>
        <div class='loader--dot'></div>
      </div>
      `;
};

const LOADER_HTML = LOADER_HTML_WITH_CLASS("loading");

let activeSwiper = null;
let activeVideoPlayer = null;

async function onLoad($) {
  $("#creativeImageGallery").remove();

  $("#creativeTableContainer").removeClass("col-9");
  $("#creativeTableContainer").addClass("col");
  $("#creativeTableContainer").html(LOADER_HTML);

  $("body").on("load", "[role=animatedAdsPlayer]", function () {
    console.log("Animated ads is loaded completely!");
    $("[role=animatedAdsPlayer]").show();
    $(".animatedAdsLoader").hide();
  });

  const result = DA.query.getQueryResult();

  const datoFieldIndex = getFieldsNameToIndex(result);
  const adsLink = await fetchAdLinks(datoFieldIndex, result); //aggregation key to [ads links details]
  Object.keys(adsLink).forEach((key) => {
    let lArray = adsLink[key];
    lArray = lArray.filter(
      (al) =>
        al.mimeType.startsWith("image/") ||
        al.mimeType.startsWith("video/") ||
        al.mimeType.startsWith("text/html")
    );
    if (lArray.length > 0) {
      adsLink[key] = lArray;
    } else {
      delete adsLink[key];
    }
  });

  const aggregatedData = aggregateResults(datoFieldIndex, result, adsLink); //rows, total, rowsByKey
  drawTableForAggregatedData(datoFieldIndex, aggregatedData);
}

function findSupernovaAuthToken(datoFieldIndex, result) {
  try {
    const ai = datoFieldIndex.dimensions[FIELD_X_AUTH_TOKEN];
    return result.rows[0][ai].value;
  } catch (err) {
    return "";
  }
}

async function fetchAdLinks(datoFieldIndex, result) {
  const uniqueCampaignNumbers = findUniqueCampaignNumbersAndAdNumbers(
    datoFieldIndex,
    result
  );

  const authToken = findSupernovaAuthToken(datoFieldIndex, result);
  let adsLinkData = {};

  try {
    adsLinkData = await $.ajax({
      method: "POST",
      url: API_ENDPOINT,
      headers: { "X-AuthToken": authToken, "Content-Type": "application/json" },
      data: JSON.stringify(uniqueCampaignNumbers),
    });
  } catch (err) {
    console.log(err);
    adsLinkData = {};
  }

  const linksByKey = {};
  const creativeDetailsByKey = {};

  Object.entries(adsLinkData).forEach(([adNumber, rows]) => {
    rows.forEach((row) => {
      applyAdditionalAdInformation(row);
      const aggregationKey = getAdLinkAggregationKey(datoFieldIndex, row);

      if (!(aggregationKey in linksByKey)) {
        linksByKey[aggregationKey] = [];
      }
      if (!(aggregationKey in creativeDetailsByKey)) {
        creativeDetailsByKey[aggregationKey] = [];
      }

      if (!linksByKey[aggregationKey].includes(row.url)) {
        linksByKey[aggregationKey].push(row.url);
        creativeDetailsByKey[aggregationKey].push(row);
      }
    });
  });
  return creativeDetailsByKey;
}

function filterBestFitAds(adsDetails) {
  const maxHeight = getHtmlHeight();
  const galleryWidth = $("#creativeImageGallery").width();
  const widthByHeightRatio = galleryWidth / maxHeight;

  const fitRatioDeltaToAdDetails = {};
  let bestFitRatioDelta = Number.MAX_VALUE;

  adsDetails.forEach((ad) => {
    try {
      const adSize = ad.adSize.split("x");
      const width = parseFloat(adSize[0]);
      const height = parseFloat(adSize[1]);
      const wbyh = width / height;

      const delta = Math.abs(widthByHeightRatio - wbyh);
      if (bestFitRatioDelta > delta) {
        bestFitRatioDelta = delta;
      }

      if (!(delta in fitRatioDeltaToAdDetails)) {
        fitRatioDeltaToAdDetails[delta] = [];
      }
      fitRatioDeltaToAdDetails[delta].push(ad);
    } catch (err) {
      console.log(err);
    }
  });

  if (bestFitRatioDelta in fitRatioDeltaToAdDetails) {
    return fitRatioDeltaToAdDetails[bestFitRatioDelta];
  }
  return adsDetails;
}

function hideImageCarousal() {
  if (activeSwiper != null) {
    activeSwiper.destroy();
  }

  $("#creativeImageGallery").hide();
  $("tr[role=adrow].selectedRow").removeClass("selectedRow");
}

function onAdNumberClicked(key, adsLink) {
  if (activeSwiper != null) {
    activeSwiper.destroy();
  }

  if (activeVideoPlayer != null) {
  }

  if (!(key in adsLink)) {
    let html = `<div class="alertMessage">`;
    html += `<div class="">`;
    html += `<img loading="lazy" class="alignleft" src="https://cdn1.rainlocal.com/asset/scripts/datorama/widgets/creative-performance/alert-icon.svg" width="80" height="80"></img>`;
    html += `<br><p>No creative content available for selected ad!<p>`;
    html += `</div>`;
    html += `</div>`;

    $("#creativeImageGallery").html(html);
    const maxHeight = getHtmlHeight();

    $(".alertMessage").css("height", `${maxHeight / 2}px`);
  } else {
    const maxHeight = getHtmlHeight();
    let ads = adsLink[key];
    ads = filterBestFitAds(ads);

    let html = `<div class="swiper mySwiper">`;
    html += `<div class="swiper-wrapper">`;
    ads.forEach((ad) => {
      if (ad.mimeType.startsWith("image/")) {
        html += `<div class="swiper-slide"><img src=${ad.url}></img></div>`;
      } else if (ad.mimeType.startsWith("video/", 0)) {
        html += `<div class="swiper-slide">`;
        html += `<video class="video-js" controls preload="auto" width="${
          $("#creativeImageGallery").width() - 30
        }" height="${
          $("#creativeImageGallery").height() - 30
        }" data-setup="{}">`;
        html += `<source src="${ad.url}" type="${ad.mimeType}"/>`;
        html += `</video>`;
        html += `</div>`;
      } else if (ad.mimeType.startsWith("text/html")) {
        const baseUrl = ad.url;
        const frameWidth = $("#creativeImageGallery").width();
        const frameHeight = $("#creativeImageGallery").height();
        let adWidth = getWidth(ad.adSize);
        if (adWidth < 10) {
          adWidth = frameHeight;
        }
        adWidth += 10;

        let adHeight = getHeight(ad.adSize);
        if (adHeight < 10) {
          adHeight = frameHeight;
        }
        adHeight += 10;

        const wScale = frameWidth / adWidth;
        const hScale = frameHeight / adHeight;

        let rScale = wScale;
        if (hScale < wScale) {
          rScale = hScale;
        }
        rScale *= 0.95;

        html += LOADER_HTML_WITH_CLASS("animatedAdsLoader");
        html += `<iframe role="animatedAdsPlayer" src="${baseUrl}" width="${adWidth}" height="${adHeight}" style="border: 0; transform: scale(${rScale});">`;
        html += `</iframe>`;
      }
    });
    html += "</div>";
    html += `<div class="swiper-pagination"></div>`;
    html += `</div>`;

    $("#creativeImageGallery").html(html);
    $("[role=animatedAdsPlayer]").hide();

    setTimeout(() => {
      $("[role=animatedAdsPlayer]").show();
      $(".animatedAdsLoader").hide();
      document.querySelector("[role=animatedAdsPlayer]");
    }, 2000);

    activeSwiper = new Swiper(".mySwiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: "auto",
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });
  }

  $("tr[role=adrow].selectedRow").removeClass("selectedRow");
  $(`tr[role=adrow]`).each((i, obj) => {
    const tKey = $(obj).data("key");
    if (key == tKey) {
      $(obj).addClass("selectedRow");
    }
  });
  $("#creativeImageGallery").show();
}

function getHeight(size) {
  try {
    return parseFloat(size.split("x")[1].replace(/\D/g, ""));
  } catch (err) {
    return 0;
  }
}

function getWidth(size) {
  try {
    return parseFloat(size.split("x")[0].replace(/\D/g, ""));
  } catch (err) {
    return 0;
  }
}

function getHtmlHeight() {
  return $("html").height();
}

function applyAdditionalAdInformation(adDetail) {
  const fileNameSplits = adDetail.adFileName.split("-");
  adDetail["adType"] = fileNameSplits[2].trim();
  adDetail["adContent"] = fileNameSplits[1].trim();
  adDetail["adSize"] = fileNameSplits[3].trim();
  return adDetail;
}

function getAdLinkAggregationKey(datoFieldIndex, adDetailsRow) {
  const dimensionsFields = getDimensionToAggregateOn(datoFieldIndex);

  let key = "";
  dimensionsFields.forEach((field) => {
    let value = adDetailsRow[DATO_TO_API_DATA_FUSION[field]];
    if (value == undefined || value == null) {
      value = "";
    }
    key += "|" + value.replace("|", "||");
  });
  return encodeURIComponent(key);
}

function findUniqueCampaignNumbersAndAdNumbers(datoFieldIndex, result) {
  const campaignNumbers = {};
  const cnIndex = datoFieldIndex.dimensions[FIELD_CAMPAIGN_NUMBER_H];
  const impressionIndex = datoFieldIndex.measurements[FIELD_IMPRESSIONS];
  const adNumberIndex = datoFieldIndex.dimensions[FIELD_AD_NUMBER];

  result.rows.forEach((row) => {
    const campaignNumberH = row[cnIndex].value;
    const campaignNumber = campaignNumberH.replace(/\D/g, "");

    const impressions = parseMeasurement(row[impressionIndex].value);

    const adNumber = row[adNumberIndex].value;

    if (!isNaN(campaignNumber) && impressions > 0) {
      if (!campaignNumbers.hasOwnProperty(campaignNumber)) {
        campaignNumbers[campaignNumber] = [];
      }

      campaignNumbers[campaignNumber].push(adNumber);
    }
  });

  return campaignNumbers;
}

function findUniqueCampaignNumbers(datoFieldIndex, result) {
  const campaignNumbers = [];
  const cnIndex = datoFieldIndex.dimensions[FIELD_CAMPAIGN_NUMBER_H];
  const campaignNameHIndex = datoFieldIndex.dimensions[FIELD_CAMPAIGN_NAME_H];
  const impressionIndex = datoFieldIndex.measurements[FIELD_IMPRESSIONS];

  result.rows.forEach((row) => {
    const campaignNameH = row[campaignNameHIndex].value;
    const impressions = parseMeasurement(row[impressionIndex].value);

    const campaignNumberH = row[cnIndex].value;
    const campaignNumber = campaignNumberH.replace(/\D/g, "");
    if (
      !isNaN(campaignNumber) &&
      !campaignNumbers.includes(campaignNumber) &&
      impressions > 0
    ) {
      campaignNumbers.push(campaignNumber);
    }
  });
  return campaignNumbers;
}

function defaultFormatter(value) {
  return value;
}

function percentageFormatter(value, decplac) {
  if (value == null || value == "" || isNaN(value) || !isFinite(value))
    return parseFloat(0).toFixed(decplac) + "%";
  else return parseFloat(value).toFixed(decplac) + "%";
}

function numberWithCommas(x) {
  if (x == null || x == "" || isNaN(x) || !isFinite(x)) return "0";
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function drawTableForAggregatedData(datoFieldIndex, aggregatedData) {
  let allFields = getFieldsOrderToDisplay(datoFieldIndex);

  const html = buildHtmlTable(allFields, aggregatedData);
  $("#creativeTableContainer").html(html);
  const table = $("#creativeTable").DataTable({
    scrollY: getHtmlHeight() - 120 + "px",
    scrollCollapse: true,
    paging: false,
    order: [[4, "desc"]],
  });
}

function getFieldsOrderToDisplay(datoFieldIndex) {
  let allFields = [...DIMENSIONS_TO_DISPLAY];
  const existingDimensions = Object.keys(datoFieldIndex.dimensions);

  allFields = allFields.filter(
    (f) => existingDimensions.includes(f) || f == FIELD_AD_THUMBNAIL
  );

  existingDimensions
    .filter((f) => !AGGREGATION_SKIP_DIMENSIONS.includes(f))
    .forEach((f) => {
      if (!allFields.includes(f)) {
        allFields.push(f);
      }
    });

  MEASUREMENTS_TO_DISPLAY.forEach((m) => {
    allFields.push(m);
  });

  Object.keys(datoFieldIndex.measurements).forEach((f) => {
    if (!allFields.includes(f) && f !== FIELD_CLICKS_RI) {
      allFields.push(f);
    }
  });

  return allFields;
}

function buildHtmlTable(allFields, aggregatedData) {
  console.log("all fields " + JSON.stringify(allFields));
  let html =
    '<table id="creativeTable" class="stripe row-border order-column nowrap" style="width: 100%;">';
  {
    html += `<thead><tr>`;
    allFields.forEach((field) => {
      html += `<th>${field}</th>`;
    });
  }
  {
    html += "<tbody>";

    Object.entries(aggregatedData.rowsByKey).forEach(([key, row]) => {
      html += `<tr data-key="${key}" role="adrow">`;

      allFields.forEach((field) => {
        const value = row[field];

        let formattedValue = value;
        if (field in FIELD_DATA_FORMATTER) {
          formattedValue = FIELD_DATA_FORMATTER[field](formattedValue);
        } else {
          formattedValue = defaultFormatter(formattedValue);
        }
        if (field === FIELD_AD_NUMBER) {
          html += `<td data-key="${key}" role="adnumber">${formattedValue}</td>`;
        } else {
          html += `<td>${formattedValue}</td>`;
        }
      });
      html += `</tr>`;
    });

    html += "</tbody>";
  }
  {
    html += "<tfoot><tr>";
    allFields.forEach((field) => {
      const value = aggregatedData.total[field];
      let formattedValue = value;
      if (field in FIELD_DATA_FORMATTER) {
        formattedValue = FIELD_DATA_FORMATTER[field](formattedValue);
      } else {
        formattedValue = defaultFormatter(formattedValue);
      }
      html += `<td>${formattedValue}</td>`;
    });
    html += "</tr><tfoot>";
  }
  html += `</tr></thead>`;
  html += `</table>`;
  return html;
}

function parseMeasurement(value) {
  if (value == null || value == "" || isNaN(value) || !isFinite(value))
    return 0;
  return parseFloat(value);
}

function applyUnattributedLogic(key, datoFieldIndex, row, adsLink) {
  const dimensions = Object.keys(datoFieldIndex.dimensions);
  const fieldsForUnttributed = [
    FIELD_AD_NUMBER,
    FIELD_AD_TYPE,
    FIELD_AD_CONTENT,
    FIELD_AD_SIZE,
  ];
  if (row[FIELD_AD_NUMBER] == "Unattributed") {
    fieldsForUnttributed.forEach((f) => {
      if (dimensions.includes(f)) {
        row[f] = "Unattributed";
      }
    });
  }
  if (!(key in adsLink) && row[FIELD_IMPRESSIONS] == 0) {
    fieldsForUnttributed.forEach((f) => {
      if (dimensions.includes(f)) {
        row[f] = "Unattributed";
      }
    });
  }
}

function aggregateResults(datoFieldIndex, result, adsLink) {
  const rows = convertDatoResultToObjects(datoFieldIndex, result, adsLink);
  const aggregatedData = aggregateRows(datoFieldIndex, rows, adsLink);
  return aggregatedData;
}

function aggregateRows(datoFieldIndex, rows, adsLink) {
  const aggregationByKey = {};
  const aggregatedRowObjects = {};

  rows.forEach((row) => {
    let key = getAggregationKey(datoFieldIndex, row);
    applyUnattributedLogic(key, datoFieldIndex, row, adsLink);
    key = getAggregationKey(datoFieldIndex, row);
    if (!(key in aggregationByKey)) {
      aggregationByKey[key] = row;
      aggregatedRowObjects[key] = [];
      aggregatedRowObjects[key].push({ ...row });
    } else {
      Object.keys(datoFieldIndex.measurements).forEach((measurement) => {
        aggregationByKey[key][measurement] += row[measurement];
      });
      aggregatedRowObjects[key].push({ ...row });
    }
  });
  const total = {};
  Object.keys(datoFieldIndex.measurements).forEach((measurement) => {
    total[measurement] = 0;
  });

  Object.keys(datoFieldIndex.dimensions).forEach((dim, index) => {
    if (!AGGREGATION_SKIP_DIMENSIONS.includes(dim)) {
      total[dim] = "";
    }
  });

  const aggregatedRows = Object.entries(aggregationByKey).map(([key, row]) => {
    const newRow = row;
    AGGREGATION_SKIP_DIMENSIONS.forEach((dim, index) => {
      delete newRow[dim];
    });
    Object.keys(datoFieldIndex.measurements).forEach((measurement) => {
      total[measurement] += newRow[measurement];
    });
    Object.entries(CALCULATED_VALUES).forEach(([field, calculator]) => {
      newRow[field] = calculator(
        newRow,
        datoFieldIndex,
        adsLink,
        false,
        aggregatedRowObjects[key]
      );
    });
    return newRow;
  });

  Object.entries(CALCULATED_VALUES).forEach(([field, calculator]) => {
    total[field] = calculator(total, datoFieldIndex, adsLink, true);
  });

  return { rows: aggregatedRows, total, rowsByKey: aggregationByKey };
}

function getDimensionToAggregateOn(datoFieldIndex) {
  return Object.keys(datoFieldIndex.dimensions).filter(
    (dimension) => !AGGREGATION_SKIP_DIMENSIONS.includes(dimension)
  );
}

function getAggregationKey(datoFieldIndex, row) {
  let key = "";
  getDimensionToAggregateOn(datoFieldIndex).forEach((dimension) => {
    if (!AGGREGATION_SKIP_DIMENSIONS.includes(dimension)) {
      key += "|" + row[dimension].replace("|", "||");
    }
  });

  return encodeURIComponent(key);
}

function getFieldsNameToIndex(result) {
  const dimensions = {};
  const measurements = {};

  result.fields.forEach((field, index) => {
    if (field.type === "dimension") {
      dimensions[field.name] = index;
    } else if (field.type == "metric") {
      measurements[field.name] = index;
    }
  });
  return { dimensions, measurements };
}

function convertDatoResultToObjects(datoFieldIndex, result, adsLink) {
  const rows = result.rows.map((row) => {
    const rt = {};
    Object.entries(datoFieldIndex.dimensions).forEach(([name, index]) => {
      rt[name] = row[index].value;
    });

    Object.entries(datoFieldIndex.measurements).forEach(([name, index]) => {
      rt[name] = parseMeasurement(row[index].value);
    });

    return rt;
  });
  return rows;
}
