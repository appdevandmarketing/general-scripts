
const filter = DA.query.getQuery()
const result = DA.query.getQueryResult()

const VIEW_CONFIGS = {
    'Google Analytics Traffic Details': {
        renderer: async (sectionName, advertiserData) => {
            const lookerStudioUrl = getLookerStudioLink(advertiserData);
            return createBasicHtmlWithLink(sectionName, 'fad fa-th', lookerStudioUrl, 'Looker Studio');
        }
    }
};

function getAdvertiserNameFromFilter(filter) {
    for (let key in filter.filter) {
        const filterObj = filter.filter[key];
        if (filterObj.name === "Advertiser") {
            return filterObj.value[0].value[0];
        }
    }
    return null;
}

function getAuthTokenFromResult(result) {
    let tokenIndex = -1;
    for (let i = 0; i < result.fields.length; i++) {
        if (result.fields[i].name === "Supernova X Auth Token (Calc)") {
            tokenIndex = i;
            break;
        }
    }

    if (tokenIndex !== -1 && result.rows.length > 0) {
        return result.rows[0][tokenIndex].value;
    }
    return null;
}

async function getAdvertiserDetails(advertiserName, authToken) {
    try {
        const response = await fetch('https://xconnect.rainlocal.com/open/v1/advertiser/search', {
            method: 'POST',
            headers: {
                'X-AuthToken': authToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "datoramaAdvertiserName": advertiserName
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching advertiser details:', error);
        return null;
    }
}

function getLookerStudioLink(advertiserData) {
    if (advertiserData && advertiserData.additionalMetadata && advertiserData.additionalMetadata.links) {
        const lookerLink = advertiserData.additionalMetadata.links.find(link =>
            link.name === "Looker Studio"
        );
        return lookerLink ? lookerLink.value : null;
    }
    return null;
}


function createBasicHtml(sectionName, iconClass) {
    return `
        <div id="title">
            <i class="${iconClass}"></i>${sectionName}
        </div>
    `;
}

function createBasicHtmlWithLink(sectionName, iconClass, linkUrl, linkText) {
    let htmlElement = `
        <div id="title">
            <i class="${iconClass}"></i>${sectionName}`;

    if (linkUrl) {
        htmlElement += ` &nbsp; &nbsp; &nbsp;
            <a href="${linkUrl}" target="_blank">${linkText}</a>`;
    }

    htmlElement += `
        </div>
    `;

    return htmlElement;
}

async function renderView(sectionName) {
    const config = VIEW_CONFIGS[sectionName];

    if (config && config.renderer) {
        const advertiserName = getAdvertiserNameFromFilter(filter);
        const authToken = getAuthTokenFromResult(result);

        let advertiserData = null;
        if (advertiserName && authToken) {
            advertiserData = await getAdvertiserDetails(advertiserName, authToken);
            if (!advertiserData) {
                console.error('Could not fetch advertiser data');
            }
        } else {
            console.error('Could not extract advertiser name or auth token from data');
        }

        return await config.renderer(sectionName, advertiserData);
    } else {
        return createBasicHtml(sectionName, 'fad fa-th');
    }
}

// // Default behavior - render Google Analytics Traffic Details
renderView('Google Analytics Traffic Details').then(htmlElement => {
    console.log('Generated HTML:', htmlElement);
    document.getElementById("widget-container").innerHTML = htmlElement;
});