/*
 *Open close in web browser.
 *Inspect newtork for  https://app.close.com/api/v1/graphql/ and copy paste csrfToken and organizationId
 *Copy paste script to console and run
 */

const pageDataCount = 50000;
const dataToDownload = [];
const csrfToekn = "";
const organizationId = "";

function downloadCloseContacts(cursorId) {
  const url = "https://app.close.com/api/v1/graphql/?queryName=ContactsSearch";

  const contactSearchRequest = {
    operationName: "ContactsSearch",
    variables: {
      organizationId: organizationId,
      q: {
        query: {
          bool: {
            operator: "AND",
            queries: [
              {
                objectType: {
                  objectType: "CONTACT",
                },
              },
              {
                bool: {
                  operator: "AND",
                  negate: false,
                  queries: [],
                },
              },
            ],
          },
        },
        resultsLimit: null,
      },
      includeTitle: true,
      includeUrl: false,
      includeSequenceSubscriptions: false,
      includeTimezoneIds: false,
      includeLeadName: true,
      includeLeadStatus: false,
      includeLeadDescription: false,
      includeLeadUrl: false,
      includeLeadDateCreated: false,
      includeLeadCreatedBy: false,
      includeLeadDateUpdated: false,
      includeLeadUpdatedBy: false,
      includeLeadPrimaryAddress: false,
      includeCustomFields: false,
      customFieldsIncluded: [],
    },
    query:
      "query ContactsSearch($organizationId: ID!, $q: SortedLimitedSearchQueryInput!, $cursor: String, $includeTitle: Boolean!, $includeTimezoneIds: Boolean!, $includeLeadName: Boolean!, $includeLeadStatus: Boolean!, $includeLeadDescription: Boolean!, $includeLeadUrl: Boolean!, $includeLeadDateCreated: Boolean!, $includeLeadCreatedBy: Boolean!, $includeLeadDateUpdated: Boolean!, $includeLeadUpdatedBy: Boolean!, $includeLeadPrimaryAddress: Boolean!, $includeUrl: Boolean!, $includeSequenceSubscriptions: Boolean!, $includeCustomFields: Boolean!, $customFieldsIncluded: [ID!]!) {\n  organization(id: $organizationId) {\n    id\n    searchQuery(query: $q) {\n      ... on ValidatedSearchQuery {\n        results(first: " +
      pageDataCount +
      ", after: $cursor) {\n          edges {\n            node {\n              ... on Contact {\n                id\n                displayName\n                phones {\n                  phone {\n                    phone\n                    formatted\n                    tzIds @include(if: $includeTimezoneIds)\n                    __typename\n                  }\n                  __typename\n                }\n                emails {\n                  email\n                  __typename\n                }\n                title @include(if: $includeTitle)\n                urls @include(if: $includeUrl) {\n                  url\n                  __typename\n                }\n                lead {\n                  id\n                  displayName @include(if: $includeLeadName)\n                  status @include(if: $includeLeadStatus) {\n                    id\n                    label\n                    __typename\n                  }\n                  description @include(if: $includeLeadDescription)\n                  url @include(if: $includeLeadUrl)\n                  dateCreated @include(if: $includeLeadDateCreated)\n                  createdBy @include(if: $includeLeadCreatedBy) {\n                    id\n                    fullName\n                    firstName\n                    lastName\n                    image\n                    googleProfileImageUrl\n                    __typename\n                  }\n                  dateUpdated @include(if: $includeLeadDateUpdated)\n                  updatedBy @include(if: $includeLeadUpdatedBy) {\n                    id\n                    fullName\n                    firstName\n                    lastName\n                    image\n                    googleProfileImageUrl\n                    __typename\n                  }\n                  primaryAddress @include(if: $includeLeadPrimaryAddress) {\n                    city\n                    state\n                    country {\n                      name\n                      __typename\n                    }\n                    __typename\n                  }\n                  customFieldValues(fields: $customFieldsIncluded) @include(if: $includeCustomFields) {\n                    customField {\n                      id\n                      name\n                      __typename\n                    }\n                    ... on CustomFieldSingleValue {\n                      value {\n                        ... on CustomFieldTextValue {\n                          text: value\n                          __typename\n                        }\n                        ... on CustomFieldNumberValue {\n                          number: value\n                          __typename\n                        }\n                        ... on CustomFieldChoicesValue {\n                          choices: value\n                          __typename\n                        }\n                        ... on CustomFieldDateTimeValue {\n                          dateTime: value\n                          __typename\n                        }\n                        ... on CustomFieldDateValue {\n                          date: value\n                          __typename\n                        }\n                        ... on CustomFieldUserValue {\n                          user: value {\n                            id\n                            fullName\n                            firstName\n                            lastName\n                            image\n                            googleProfileImageUrl\n                            __typename\n                          }\n                          __typename\n                        }\n                        ... on CustomFieldContactValue {\n                          contact: value {\n                            id\n                            displayName\n                            __typename\n                          }\n                          __typename\n                        }\n                        __typename\n                      }\n                      __typename\n                    }\n                    ... on CustomFieldMultipleValues {\n                      values {\n                        ... on CustomFieldTextValue {\n                          text: value\n                          __typename\n                        }\n                        ... on CustomFieldNumberValue {\n                          number: value\n                          __typename\n                        }\n                        ... on CustomFieldChoicesValue {\n                          choices: value\n                          __typename\n                        }\n                        ... on CustomFieldDateTimeValue {\n                          dateTime: value\n                          __typename\n                        }\n                        ... on CustomFieldDateValue {\n                          date: value\n                          __typename\n                        }\n                        ... on CustomFieldUserValue {\n                          user: value {\n                            id\n                            fullName\n                            firstName\n                            lastName\n                            image\n                            googleProfileImageUrl\n                            __typename\n                          }\n                          __typename\n                        }\n                        ... on CustomFieldContactValue {\n                          contact: value {\n                            id\n                            displayName\n                            __typename\n                          }\n                          __typename\n                        }\n                        __typename\n                      }\n                      __typename\n                    }\n                    __typename\n                  }\n                  __typename\n                }\n                subscriptions @include(if: $includeSequenceSubscriptions) {\n                  edges {\n                    node {\n                      id\n                      status\n                      statusReason\n                      sequence {\n                        name\n                        status\n                        __typename\n                      }\n                      dateCreated\n                      dateUpdated\n                      createdBy {\n                        fullName\n                        email\n                        __typename\n                      }\n                      __typename\n                    }\n                    __typename\n                  }\n                  __typename\n                }\n                customFieldValues(fields: $customFieldsIncluded) @include(if: $includeCustomFields) {\n                  customField {\n                    id\n                    name\n                    __typename\n                  }\n                  ... on CustomFieldSingleValue {\n                    value {\n                      ... on CustomFieldTextValue {\n                        text: value\n                        __typename\n                      }\n                      ... on CustomFieldNumberValue {\n                        number: value\n                        __typename\n                      }\n                      ... on CustomFieldChoicesValue {\n                        choices: value\n                        __typename\n                      }\n                      ... on CustomFieldDateTimeValue {\n                        dateTime: value\n                        __typename\n                      }\n                      ... on CustomFieldDateValue {\n                        date: value\n                        __typename\n                      }\n                      ... on CustomFieldUserValue {\n                        user: value {\n                          id\n                          fullName\n                          firstName\n                          lastName\n                          image\n                          googleProfileImageUrl\n                          __typename\n                        }\n                        __typename\n                      }\n                      ... on CustomFieldContactValue {\n                        contact: value {\n                          id\n                          displayName\n                          __typename\n                        }\n                        __typename\n                      }\n                      __typename\n                    }\n                    __typename\n                  }\n                  ... on CustomFieldMultipleValues {\n                    values {\n                      ... on CustomFieldTextValue {\n                        text: value\n                        __typename\n                      }\n                      ... on CustomFieldNumberValue {\n                        number: value\n                        __typename\n                      }\n                      ... on CustomFieldChoicesValue {\n                        choices: value\n                        __typename\n                      }\n                      ... on CustomFieldDateTimeValue {\n                        dateTime: value\n                        __typename\n                      }\n                      ... on CustomFieldDateValue {\n                        date: value\n                        __typename\n                      }\n                      ... on CustomFieldUserValue {\n                        user: value {\n                          id\n                          fullName\n                          firstName\n                          lastName\n                          image\n                          googleProfileImageUrl\n                          __typename\n                        }\n                        __typename\n                      }\n                      ... on CustomFieldContactValue {\n                        contact: value {\n                          id\n                          displayName\n                          __typename\n                        }\n                        __typename\n                      }\n                      __typename\n                    }\n                    __typename\n                  }\n                  __typename\n                }\n                __typename\n              }\n              __typename\n            }\n            __typename\n          }\n          pageInfo {\n            endCursor\n            hasNextPage\n            __typename\n          }\n          count {\n            totalCount\n            limitedCount\n            __typename\n          }\n          __typename\n        }\n        restJson\n        __typename\n      }\n      ... on SearchQueryValidationError {\n        path\n        message\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}",
  };

  if (cursorId != null) {
    contactSearchRequest.cursor = cursorId;
  }

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Csrftoken": csrfToekn,
      "X-Organization-Id": organizationId,
      "X-Graphql-Query": "ContactsSearch",
    },
    body: JSON.stringify(contactSearchRequest),
  })
    .then((response) => response.json())
    .then((body) => {
      const toDownload = body.data;
      dataToDownload.push(toDownload.organization.searchQuery.results.edges);

      //   const hasNextPage =
      //     toDownload.organization.searchQuery.results.pageInfo.hasNextPage;

      const hasNextPage = false;
      if (!hasNextPage) {
        console.log("Downloading blob!");
        downloadBlob(JSON.stringify(dataToDownload));
      } else {
        const nextCursorId =
          toDownload.organization.searchQuery.results.pageInfo.endCursor;
        console.log("Starting from cursor id " + nextCursorId);
        downloadCloseContacts(nextCursorId);
      }
    })
    .catch((err) => console.log(err));
}

function downloadBlob(data) {
  const blobData = data;
  const myBlob = new Blob([blobData], { type: "plain/text" });
  const blobURL = URL.createObjectURL(myBlob);

  const href = document.createElement("a");
  href.href = blobURL;
  href.download = myBlob;
  href.id = "download";
  href.setAttribute("href", blobURL);
  href.setAttribute("download", "close.json");
  href.click();
}

downloadCloseContacts(null);
