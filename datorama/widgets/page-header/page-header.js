$(document).ready(function () {
  const DATO_ADVERTISER_NAME_TOADVERTISER_FULLNAME = {
    Altrua: "Altrua HealthShare",
    "Bellwether Community CU": "Bellwether Community Credit Union",
    "Community Resource CU": "Community Resource Credit Union",
    "Congressional FCU": "Congressional Federal Credit Union",
    "FNB Central Texas": "FIRST NATIONAL BANK CENTRAL TEXAS",
    "Firefighters First CU": "Firefighters First Credit Union",
    Forward: "Forward Bank",
    "Friendship State Bank": "The Friendship State Bank",
    "La Capitol FCU": "La Capitol Federal Credit Union",
    Fidelity: "Fidelity Bank",
    "UNCLE CU": "UNCLE Credit Union",
    "Garden Saving FCU": "Garden Savings Federal Credit Union",
    "Hickam FCU": "Hickam Federal Credit Union",
    LCNB: "LCNB National Bank",
    "US Eagle": "US Eagle Federal Credit Union",
    "Uncle CU": "Uncle Credit Union",
    VFW: "Veterans of Foreign Wars",
    "Velocity Community Federal Credit Union":
      "Velocity Community Credit Union",
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
      let advertiserName = findAdvertiserFullName(kObj.value[0].value[0]);
      $("#title").text(advertiserName.toUpperCase());
      break;
    }
  }

  function findAdvertiserFullName(name) {
    for (let key of Object.keys(DATO_ADVERTISER_NAME_TOADVERTISER_FULLNAME)) {
      if (key.toUpperCase() === name.toUpperCase()) {
        return DATO_ADVERTISER_NAME_TOADVERTISER_FULLNAME[key];
      }
    }
    return name;
  }
});
