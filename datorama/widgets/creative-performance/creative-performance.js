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

  ["js", "https://code.jquery.com/jquery-3.6.0.min.js"],
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
]).then(function () {
  jQuery(onLoad);
});

const API_ENDPOINT =
  "https://supernovaapp.rainlocal.com/public/creative/adsLink/";

const FIELD_CAMPAIGN_NUMBER = "Campaign Number";
const FIELD_AD_NUMBER = "Ad Number";
const FIELD_IMPRESSIONS = "Impressions";
const FIELD_CLICKS = "Clicks";
const FIELD_CTR = "CTR";
const FIELD_GA_RAIN_EVENTS = "GA RAIN Events";
const FIELD_CONV_RATE = "Conv Rate";

const FIELD_TO_DATO_DEFAULT_FIELD = {
  [FIELD_AD_NUMBER]: "Ad Number",
  [FIELD_IMPRESSIONS]: "Impressions",
  [FIELD_CLICKS]: "Clicks",
  [FIELD_GA_RAIN_EVENTS]: "GA Rain Events",
  [FIELD_CAMPAIGN_NUMBER]: "Campaign Number",
};

const FIELD_DATA_FORMATTER = {
  [FIELD_CTR]: percentageFormatter,
  [FIELD_CONV_RATE]: percentageFormatter,
  [FIELD_IMPRESSIONS]: numberWithCommas,
  [FIELD_CLICKS]: numberWithCommas,
  [FIELD_GA_RAIN_EVENTS]: numberWithCommas,
};

const FIELDS_TO_DISPLAY = [
  FIELD_AD_NUMBER,
  FIELD_IMPRESSIONS,
  FIELD_CLICKS,
  FIELD_CTR,
  FIELD_GA_RAIN_EVENTS,
  FIELD_CONV_RATE,
];

let activeSwiper = null;

async function onLoad($) {
  const result = DA.query.getQueryResult();
  const adsLink = fetchAdLinks(result);
  const tableData = aggregateDataForTable(result);
  const dataTableHtml = buildDataTable(tableData, adsLink);

  $("#creativeTableContainer").append(dataTableHtml);
  $("#creativeTable").DataTable();

  $("body").on("click", "[role=adnumber]", function (event) {
    onAdNumberClicked(this, result, adsLink, event);
  });

  hideImageCarousal();
  hideLoading();
}

function hideImageCarousal() {
  if (activeSwiper != null) {
    activeSwiper.destroy();
  }

  $("#creativeImageGallery").hide();
  $("tr[role=adrow].selectedRow").removeClass("selectedRow");
}

function showLoading() {
  $(".loading").show();
}

function hideLoading() {
  $(".loading").hide();
}

function onAdNumberClicked(element, result, adsLink, event) {
  const adNumber = $(element).data("adnumber");
  if (!(adNumber in adsLink)) {
    toastr.warning("Cannot find creatives associated with this ad number!");
    return;
  }
  const ads = adsLink[adNumber];
  const alreadySelected = $(`tr[data-adnumber=${adNumber}]`).hasClass(
    "selectedRow"
  );
  if (alreadySelected) {
    hideImageCarousal();
    return;
  } else {
    let html = `<div class="swiper mySwiper">`;
    html += `<div class="swiper-wrapper">`;
    ads.forEach((ad) => {
      html += `<div class="swiper-slide"><img src=${ad}></img></div>`;
    });
    html += "</div>";
    //html += `<div class="swiper-button-next"></div>`;
    //html += `<div class="swiper-button-prev"></div>`;
    html += `<div class="swiper-pagination"></div>`;
    html += `</div>`;

    $("#creativeImageGallery").html(html);
    $("tr[role=adrow].selectedRow").removeClass("selectedRow");
    $(`tr[data-adnumber=${adNumber}]`).addClass("selectedRow");
    $("#creativeImageGallery").show();

    const maxHeight = $("html").height();
    console.log("Window height is " + maxHeight);
    $("#creativeImageGallery").css("height", `${maxHeight - 30}px`);

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
        autoplay: {
          delay: 2500,
          disableOnInteraction: false,
        },
    });
  }
}

function percentageFormatter(value) {
  return value.toFixed(2) + "%";
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function buildDataTable(tableData, adsLink) {
  let html = '<table id="creativeTable" class="display" style="width: 100%;">';
  {
    html += `<thead><tr>`;
    FIELDS_TO_DISPLAY.forEach((field) => {
      html += `<th>${field}</th>`;
    });
  }

  {
    html += "<tbody>";
    tableData.data.forEach((row) => {
      html += `<tr data-adnumber="${row[FIELD_AD_NUMBER]}" role="adrow">`;

      FIELDS_TO_DISPLAY.forEach((field) => {
        let value = row[field];
        let formattedValue = value;
        if (field in FIELD_DATA_FORMATTER) {
          formattedValue = FIELD_DATA_FORMATTER[field](formattedValue);
        }
        if (field === FIELD_AD_NUMBER) {
          html += `<td data-adnumber="${value}" role="adnumber">${formattedValue}</td>`;
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
    FIELDS_TO_DISPLAY.forEach((field) => {
      let value = tableData.total[field];
      if (field in FIELD_DATA_FORMATTER) {
        value = FIELD_DATA_FORMATTER[field](tableData.total[field]);
      }
      html += `<td>${value}</td>`;
    });
    html += "</tr><tfoot>";
  }
  html += `</tr></thead>`;
  html += `</table>`;

  return html;
}

function aggregateDataForTable(result) {
  const aggregationByAdNumber = {};
  result.rows.forEach((row) => {
    const anIndex = findIndexOfField(result, FIELD_AD_NUMBER);
    const adNumber = row[anIndex].value;
    if (!(adNumber in aggregationByAdNumber)) {
      aggregationByAdNumber[adNumber] = {
        [FIELD_AD_NUMBER]: adNumber,
        [FIELD_IMPRESSIONS]: 0,
        [FIELD_CLICKS]: 0,
        [FIELD_GA_RAIN_EVENTS]: 0,
      };
    }

    const previous = aggregationByAdNumber[adNumber];
    previous[FIELD_AD_NUMBER] = adNumber;
    previous[FIELD_IMPRESSIONS] += findFieldValue(
      result,
      row,
      FIELD_IMPRESSIONS
    );
    previous[FIELD_CLICKS] += findFieldValue(result, row, FIELD_CLICKS);
    previous[FIELD_GA_RAIN_EVENTS] += findFieldValue(
      result,
      row,
      FIELD_GA_RAIN_EVENTS
    );
  });

  const total = {
    [FIELD_AD_NUMBER]: "Total",
    [FIELD_IMPRESSIONS]: 0,
    [FIELD_CLICKS]: 0,
    [FIELD_GA_RAIN_EVENTS]: 0,
  };
  const rows = Object.values(aggregationByAdNumber).map((row) => {
    row[FIELD_CTR] = (row[FIELD_CLICKS] * 100) / row[FIELD_IMPRESSIONS];
    row[FIELD_CONV_RATE] =
      (row[FIELD_GA_RAIN_EVENTS] * 100) / row[FIELD_CLICKS];

    total[FIELD_IMPRESSIONS] += row[FIELD_IMPRESSIONS];
    total[FIELD_CLICKS] += row[FIELD_CLICKS];
    total[FIELD_GA_RAIN_EVENTS] += row[FIELD_GA_RAIN_EVENTS];

    return row;
  });

  total[FIELD_CTR] = (total[FIELD_CLICKS] * 100) / total[FIELD_IMPRESSIONS];
  total[FIELD_CONV_RATE] =
    (total[FIELD_GA_RAIN_EVENTS] * 100) / total[FIELD_CLICKS];

  const data = { data: rows, total: total };
  console.log(JSON.stringify(data));
  return data;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function fetchAdLinks(result) {
  const uniqueCampaignNumbers = findUniqueCampaignNumbers(result);
  const uniqueAdNumbers = findUniqueAdNumbers(result);

  const adsLink = {};

  uniqueAdNumbers.forEach((adNumber) => {
    const width = 200 + getRandomInt(100);
    const height = 200 + getRandomInt(100);
    const url = `https://picsum.photos/${width}/${height}`;

    const imageCounts = 1 + getRandomInt(5);
    if (!(adNumber in adsLink)) {
      adsLink[adNumber] = [];
    }

    const links = adsLink[adNumber];
    for (let i = 0; i < imageCounts; i++) {
      links.push(url);
    }
  });

  return adsLink;
}

function findUniqueCampaignNumbers(result) {
  const campaignNumbers = [];
  const cnIndex = findIndexOfField(result, FIELD_CAMPAIGN_NUMBER);
  result.rows.forEach((row) => {
    const campaignNumberH = row[cnIndex].value;
    const campaignNumber = campaignNumberH.replace(/\D/g, "");
    if (!isNaN(campaignNumber) && !campaignNumbers.includes(campaignNumber)) {
      campaignNumbers.push(campaignNumber);
    }
  });
  return campaignNumbers;
}

function findUniqueAdNumbers(result) {
  const adNumbers = [];
  const anIndex = findIndexOfField(result, FIELD_AD_NUMBER);
  result.rows.forEach((row) => {
    const adNumber = row[anIndex].value;
    if (!adNumbers.includes(adNumber)) {
      adNumbers.push(adNumber);
    }
  });
  return adNumbers;
}

function findIndexOfField(result, fieldName) {
  const containsValue = FIELD_TO_DATO_DEFAULT_FIELD[fieldName];
  const fields = result.fields;
  let retIndex = -1;
  fields.forEach((field, index) => {
    if (field.defaultName.includes(containsValue)) {
      retIndex = index;
      return;
    }
  });
  return retIndex;
}

function findFieldValue(result, row, fieldName) {
  const index = findIndexOfField(result, fieldName);
  const fieldType = result.fields[index].type;

  if (fieldType !== "metric") {
    return row[index].value;
  }

  const value = row[index].value;
  if (value == null || value === undefined || value === "" || isNaN(value)) {
    return 0;
  }
  return parseFloat(value);
}
