import { LightningElement } from "lwc";
import experienceFieldValues from "@salesforce/apex/JobPicklistController.experienceFieldValues";
import typePickListValues from "@salesforce/apex/JobPicklistController.typePickListValues";
import IndustryPickListValues from "@salesforce/apex/JobPicklistController.IndustryPickListValues";
import TimingsPickListValues from "@salesforce/apex/JobPicklistController.TimingsPickListValues";
import postJob from "@salesforce/apex/jobObjectController.postJob";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import Id from "@salesforce/user/Id";
import getCompanyName from "@salesforce/apex/jobObjectController.getCompanyName";

export default class AddJobsPage extends NavigationMixin(LightningElement) {
  experienceValues = [];
  industryValues = [];
  typeValues = [];
  timingValues = [];

  jobTitle = "";
  summary = "";
  description = "";
  salaryRange = "";
  country = "";
  city = "";
  experienceValue = "";
  typeValue = "";
  industryValue = "";
  timingValue = "";
  skills = "";
  startDate = "";
  endDate = "";

  userCompanyName;
  userId = Id;

  connectedCallback() {
    experienceFieldValues().then((result) => {
      this.experienceValues = result;
    });
    typePickListValues().then((result) => {
      this.typeValues = result;
    });
    IndustryPickListValues().then((result) => {
      this.industryValues = result;
    });
    TimingsPickListValues().then((result) => {
      this.timingValues = result;
    });
    getCompanyName({ userId: this.userId }).then((result) => {
      this.userCompanyName = result;
    });
  }

  handleExperienceChange(event) {
    this.experienceValue = event.target.value;
  }

  handleTypeChange(event) {
    this.typeValue = event.target.value;
  }

  handleIndustryChange(event) {
    this.industryValue = event.target.value;
  }

  handleTimingChange(event) {
    this.timingValue = event.target.value;
    console.log("this.timingValue", this.timingValue);
  }

  getInput() {
    const jobTitleInput = this.template.querySelector(
      'lightning-input[data-id="jobTitle"]'
    );
    const summaryInput = this.template.querySelector(
      'lightning-input[data-id="summary"]'
    );
    const descriptionInput = this.template.querySelector(
      'lightning-input[data-id="description"]'
    );
    const salaryRangeInput = this.template.querySelector(
      'lightning-input[data-id="salaryRange"]'
    );
    const cityInput = this.template.querySelector(
      'lightning-input[data-id="city"]'
    );
    const countryInput = this.template.querySelector(
      'lightning-input[data-id="country"]'
    );
    const skillsInput = this.template.querySelector(
      'lightning-input[data-id="skills"]'
    );
    const start = this.template.querySelector(
      'lightning-input[data-id="start-date"]'
    );
    const end = this.template.querySelector(
      'lightning-input[data-id="end-date"]'
    );

    this.jobTitle = jobTitleInput.value || "";
    this.summary = summaryInput.value || "";
    this.description = descriptionInput.value || "";
    this.salaryRange = salaryRangeInput.value || "";
    this.city = cityInput.value || "";
    this.country = countryInput.value || "";
    this.skills = skillsInput.value || "";
    this.startDate = start.value || "";
    this.endDate = end.value || "";
  }

  postJobData(event) {
    this.getInput();
    const value = event.target.value;
    postJob({
      value: value,
      jobTitle: this.jobTitle,
      description: this.description,
      salaryRange: this.salaryRange,
      companyName: this.userCompanyName,
      city: this.city,
      country: this.country,
      experienceValue: this.experienceValue,
      typeValue: this.typeValue,
      industryValue: this.industryValue,
      summary: this.summary,
      skills: this.skills,
      timing: this.timingValue,
      publishStartDate: this.startDate,
      publishEndDate: this.endDate
    })
      .then(() => {
        console.log("true");
        if (value === "Completed") {
          this.showToast("Success", "Job posted successfully", "success");
        } else if (value === "Draft") {
          this.showToast("Success", "Draft Saved successfully", "success");
        }

        const pageReference = {
          type: "standard__webPage",
          attributes: {
            url: "/manage-jobs"
          }
        };
        this[NavigationMixin.Navigate](pageReference);
      })
      .catch((error) => {
        console.error("Error saving job:", error);
        this.showToast(
          "Error",
          "Some Error occured, please try again",
          "error"
        );
      });
  }

  showToast(title, message, variant) {
    this.dispatchEvent(
      new ShowToastEvent({
        title: title,
        message: message,
        variant: variant
      })
    );
  }
}
