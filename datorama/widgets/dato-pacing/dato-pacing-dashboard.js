importScripts([
  [
    "css",
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.6.2/css/bootstrap.min.css",
  ],
  [
    "js",
    "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js",
  ],
]).then(function () {
  jQuery(onLoad);
});

const FIELD_X_AUTH_TOKEN = "Supernova X Auth Token (Calc)";
const FIELD_CAMPAIGN_NUMBER_H = "Campaign Number (h)";
const FIELD_IMPRESSIONS = "Impressions";
const FIELD_MEDIACOST = "Media Cost";

const API_ENDPOINT = "https://xconnect.rainlocal.com/open/v1/budget-pacing/";

async function onLoad($) {
  const query = DA.query.getQuery();

  const datoStartDate = moment(getStartDate(query), "YYYY-MM-DD").format(
    "MMM D, YYYY"
  );

  const datoEndDate = moment(getEndDate(query), "YYYY-MM-DD").format(
    "MMM D, YYYY"
  );

  console.log(datoStartDate);
  console.log(datoEndDate);

  const results = DA.query.getQueryResult();
  logJson(results);

  const rowMap = reduceRowsToMap(results);

  const authToken = findXAuthToken(results);
  const campaignNumbers = Object.keys(rowMap).slice(0, 15);

  campaignNumbers.forEach(async (campaignNumber) => {
    try {
      const campaignBudgetPacingInfo = await $.ajax({
        url: API_ENDPOINT + campaignNumber,
        headers: { "X-AuthToken": authToken },
      });

      for (const campaignId in campaignBudgetPacingInfo) {
        const pacingDetails = campaignBudgetPacingInfo[campaignId];

        const startDate = moment(pacingDetails.startDate, "YYYY-MM-DD").format(
          "MMM D, YYYY"
        );
        const endDate = moment(pacingDetails.endDate, "YYYY-MM-DD").format(
          "MMM D, YYYY"
        );

        if (startDate == datoStartDate && endDate == datoEndDate) {
          modifyCampaignPacingDetails(
            pacingDetails,
            campaignNumber,
            rowMap[campaignNumber]
          );
        }

        let html = `<div class="card shadow-sm">`;
        html += `<div class = "row">`;

        html += `<div class="col-sm-12"><b>(${campaignId}) ${pacingDetails.campaignName}</b></div>`;
        html += `<div class="col-sm-6"><b style="color: rgb(36, 165, 222);"> ${pacingDetails.advertiserName}</b></div>`;
        html += `<div class="col-sm-6"><b style="color: rgb(36, 165, 222);"> ${startDate} - ${endDate}</b></div>`;
        html += `<div class="col-sm-12"><hr></div>`;
        html += `<div class="col-sm-3">Imp. Goal: ${formatInt(
          pacingDetails.impressionGoal
        )}</div>`;
        html += `<div class="col-sm-3">Current Imp.: ${formatInt(
          pacingDetails.totalImpressionsToDate
        )}</div>`;

        html += `<div class="col-sm-3">Current Imp./Day: ${formatInt(
          pacingDetails.currentImpressionsPerDay
        )}</div>`;

        if (
          pacingDetails.remainingDays === 0 &&
          pacingDetails.requiredImpressionsPerDay > 0
        ) {
          html += `<div class="col-sm-3 errMsg">Req. Imp./Day: ${formatInt(
            pacingDetails.requiredImpressionsPerDay
          )}</div>`;
        } else {
          html += `<div class="col-sm-3">Req. Imp./Day: ${formatInt(
            pacingDetails.requiredImpressionsPerDay
          )}</div>`;
        }

        html += `<div class="col-sm-12">&nbsp;</div>`;

        html += `<div class="col-sm-3">Budget: ${formatAmount(
          pacingDetails.budget
        )}</div>`;

        html += `<div class="col-sm-3">Budget Spent: ${formatAmount(
          pacingDetails.budgetSpentToDate
        )}</div>`;

        html += `<div class="col-sm-3">Budget Spent/Day: ${formatAmount(
          pacingDetails.budgetSpentPerDay
        )}</div>`;

        if (
          pacingDetails.remainingBudget <= 0 &&
          pacingDetails.remainingDays >= 0
        ) {
          html += `<div class="col-sm-3 errMsg">Budget Rem./Day: ${formatAmount(
            pacingDetails.budgetRemainingPerDay
          )}</div>`;
        } else {
          html += `<div class="col-sm-3">Budget Rem./Day: ${formatAmount(
            pacingDetails.budgetRemainingPerDay
          )}</div>`;
        }

        html += "</div>";
        html += "</div>";
        $("#pacingDetails").append(html);
      }
    } catch (err) {
      console.log(err);
      const msg = `Error fetching pacing details for campaign number ${campaignNumber}.`;

      $("#errors").append(
        `<div class="alert alert-warning" role="alert">
         ${msg} 
        </div>
        `
      );
    }
  });

  logJson(campaignBudgetPacingInfo);
}

function modifyCampaignPacingDetails(
  pacingDetails,
  campaignNumber,
  datoPacingInfo
) {
  pacingDetails.totalImpressionsToDate = datoPacingInfo[FIELD_IMPRESSIONS];
  pacingDetails.budgetSpentToDate = datoPacingInfo[FIELD_MEDIACOST];
  pacingDetails.remainingBudget =
    pacingDetails.budget - pacingDetails.budgetSpentToDate;

  pacingDetails.requiredImpressions = Math.max(
    pacingDetails.impressionGoal - pacingDetails.totalImpressionsToDate,
    0
  );
  pacingDetails.requiredImpressionsPerDay = Math.ceil(
    pacingDetails.remainingDays === 0
      ? pacingDetails.requiredImpressions
      : pacingDetails.requiredImpressions / pacingDetails.remainingDays
  );

  pacingDetails.currentImpressionsPerDay = Math.ceil(
    pacingDetails.totalImpressionsToDate / pacingDetails.daysTill
  );

  pacingDetails.budgetSpentPerDay =
    pacingDetails.budgetSpentToDate / pacingDetails.daysTill;

  if (pacingDetails.remainingDays === 0) {
    pacingDetails.budgetRemainingPerDay = pacingDetails.remainingBudget;
  } else {
    pacingDetails.budgetRemainingPerDay =
      pacingDetails.remainingBudget / pacingDetails.remainingDays;
  }
}

function getStartDate(query) {
  try {
    return query.date.startDate;
  } catch (err) {
    console.log(err);
    return null;
  }
}

function reduceRowsToMap(results) {
  const map = {};
  results.rows.forEach((row) => {
    const campaignNumber = getFieldValue(
      results,
      row,
      FIELD_CAMPAIGN_NUMBER_H
    ).replace(/\D/g, "");
    const impressions = getFieldValue(results, row, FIELD_IMPRESSIONS);
    const mediaCosts = getFieldValue(results, row, FIELD_MEDIACOST);

    if (campaignNumber in map) {
      const pv = map[campaignNumber];
      const nv = {
        [FIELD_IMPRESSIONS]: pv[FIELD_IMPRESSIONS] + impressions,
        [FIELD_MEDIACOST]: pv[FIELD_MEDIACOST] + mediaCosts,
      };
      map[campaignNumber] = nv;
    } else {
      const nv = {
        [FIELD_IMPRESSIONS]: impressions,
        [FIELD_MEDIACOST]: mediaCosts,
      };
      map[campaignNumber] = nv;
    }
  });
  return map;
}

function getEndDate(query) {
  try {
    return query.date.endDate;
  } catch (err) {
    console.log(err);
    return null;
  }
}

function formatAmount(num) {
  const fixed = parseFloat(num).toFixed(2);
  return "$" + parseFloat(fixed).toLocaleString();
}

function formatInt(num) {
  const fixed = parseFloat(num).toFixed(0);
  return parseFloat(fixed).toLocaleString();
}

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

function logJson(obj) {
  const json = JSON.stringify(obj);
  console.log(json);
}

function findXAuthToken(results) {
  try {
    for (fieldIndex in results.fields) {
      const field = results.fields[fieldIndex];
      if (field.name === FIELD_X_AUTH_TOKEN) {
        return results.rows[0][fieldIndex].value;
      }
    }
  } catch (err) {
    console.log(err);
  }
  return "";
}

function getFieldValue(results, row, fieldName) {
  for (fieldIndex in results.fields) {
    const field = results.fields[fieldIndex];
    if (field.name === fieldName) {
      return row[fieldIndex].value;
    }
  }
}

// function findAllCampaignNumbers(results) {
//   try {
//     return results.rows
//       .map((row) =>
//         getFieldValue(results, row, FIELD_CAMPAIGN_NUMBER_H).replace(/\D/g, "")
//       )
//       .filter((it) => it !== "");
//   } catch (err) {
//     console.log(err);
//   }
//   return [];
// }
