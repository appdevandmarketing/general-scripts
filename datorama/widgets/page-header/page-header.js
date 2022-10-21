$(document).ready(function () {
  const DATO_ADVERTISER_NAME_TOADVERTISER_FULLNAME = {
    "La Capitol FCU": "La Capitol Federal Credit Union",
    Fidelity: "Fidelity Bank",
    "UNCLE CU": "UNCLE Credit Union",
  };

  console.log("Trying from filter!");
  const filter = DA.query.getQuery().filter;
  console.log(JSON.stringify(filter));
  for (let key in filter) {
    const kObj = filter[key];
    if (
      kObj.name === "Advertiser" ||
      kObj.name === "Advertiser - Parent" ||
      kObj.name === "Advertiser - Rain"
    ) {
      let advertiserName = kObj.value[0].value[0];
      if (advertiserName in DATO_ADVERTISER_NAME_TOADVERTISER_FULLNAME) {
        advertiserName =
          DATO_ADVERTISER_NAME_TOADVERTISER_FULLNAME[advertiserName];
      }
      $("#title").text(advertiserName.toUpperCase());
      break;
    }
  }
});
