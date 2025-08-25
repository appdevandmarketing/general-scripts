$(document).ready(function () {
  // Array of notes
  const notes = [
    {
      title: "Apply",
      description:
        "Only direct conversions: apply now, open account, become a member, etc.",
    },
    {
      title: "Primary",
      description:
        "High-value actions: call links, contact forms, high-intent info e.g. rate views & calculators, etc.",
    },
    {
      title: "Secondary",
      description:
        "Support actions: branch lookups, directions, general info, learn more, etc.",
    },
  ];

  let footnoteContent = `
    <br/>
    <p class='rain-text-margin'>
      <div class="info-icon-wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style="fill: rgba(0, 170, 255, 1);transform: ;msFilter:;"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M11 11h2v6h-2zm0-4h2v2h-2z"></path></svg>
        <div class="custom-popover">
        <b> Disclaimer: </b> <br/>
The APS category was implemented in March/April 2025 and remained in beta until the end of August 2025. If a date range prior to implementation is selected, all conversions will appear as "uncategorized" and categories themselves may not be accurate or consistent during the beta period.</div>
     
     </div>
      <u>Conversion Category Descriptions:</u>
    </p>
  `;

  // Loop through the array to generate <p> elements
  notes.forEach((note) => {
    footnoteContent += `<p class="rain-text-margin"><b>${note.title}:</b> ${note.description}</p>`;
  });

  // Insert the generated HTML into the parent div with id 'RAIN-Conversion-Footnote'
  $("#RAIN-Conversion-Footnote").html(footnoteContent);
});
