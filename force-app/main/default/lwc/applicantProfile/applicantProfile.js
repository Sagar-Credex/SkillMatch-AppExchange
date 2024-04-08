import { LightningElement, wire } from "lwc";
import GetApplicantDataMethod from "@salesforce/apex/GetApplicantData.GetApplicantDataMethod";
import GetWorkExperienceData from "@salesforce/apex/GetApplicantData.GetWorkExperienceData";
import changeStatus from "@salesforce/apex/JobApplicantController.changeStatus";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getApplicantStatus from "@salesforce/apex/JobApplicantController.getApplicantStatus";
import getResume from "@salesforce/apex/GetApplicantData.getResume";
import getAppliedJobById from "@salesforce/apex/GetApplicantData.getAppliedJobById";
import { NavigationMixin } from "lightning/navigation";

export default class ApplicantProfile extends NavigationMixin(
  LightningElement
) {
  applicantId = sessionStorage.getItem("candidateid");
  applicantDetails = [];
  workExpDetails = [];
  status;
  skills;
  IsAccepted = false;
  IsRejected = false;
  appliedJob;
  value;
  contentDocumentId;
  pdfUrl;

  @wire(GetApplicantDataMethod, { applicantId: "$applicantId" })
  wiredGetApplicantDataMethod({ error, data }) {
    if (error) {
      console.log("error------->", error);
    }
    if (data) {
      this.applicantDetails = data;
      console.log("applicantId------>", this.applicantId);
      console.log("this.applicantDetails", this.applicantDetails);

      if (this.applicantDetails && this.applicantDetails.Skills__c) {
        this.skills = [...this.applicantDetails.Skills__c.split(",")];
        console.log("this.skills", this.skills);
      }
    }
    this.applicantStatus();
  }

  @wire(getAppliedJobById, { candidateId: "$applicantId" })
  wiredGetAppliedJobById({ error, data }) {
    if (data) {
      this.appliedJob = data;
      console.log("this.appliedJob", this.appliedJob);
    } else {
      console.log("error------->", error);
    }
  }
  @wire(GetWorkExperienceData, { applicantId: "$applicantId" })
  wiredGetWorkExperienceData({ error, data }) {
    if (error) {
      console.log("error--->", error);
    }
    if (data) {
      this.workExpDetails = data;
      console.log("this.workExpDetails", this.workExpDetails);
    }
  }

  handleShortlistButton(event) {
    this.value = event.target.value;
    changeStatus({ value: this.value, applicantId: this.applicantId }).then(
      () => {
        console.log("true");
        this.showToast("Success", "Candidate Shortlisted", "success");
      }
    );
    this.IsAccepted = true;
    this.IsRejected = false;
  }
  handleRejectedButton(event) {
    this.value = event.target.value;
    changeStatus({ value: this.value, applicantId: this.applicantId }).then(
      () => {
        console.log("true");
        this.showToast("Rejected", "Candidate rejected", "Error");
      }
    );
    this.IsRejected = true;
    this.IsAccepted = true;
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

  applicantStatus() {
    getApplicantStatus({ applicantId: this.applicantId }).then((data) => {
      this.status = data;
      if (this.status === "Accepted") {
        this.IsAccepted = true;
        this.IsRejected = false;
      } else if (this.status === "Rejected") {
        this.IsRejected = true;
        this.IsAccepted = true;
      }
    });
  }
  handleResumePreview() {
    getResume({ applicantId: this.applicantId })
        .then(result => {
            // Filter out the CV attachment
            const document = result.documents[0];

            if (document) {
              // Generate preview URL for the document
              this.pdfUrl = '/sfc/servlet.shepherd/document/download/' + document.Id;
              this.contentDocumentId = document.Id;
          } else {
              // If document is not found, display an error message or handle it accordingly
              console.error('Document not found.');
          }
        })
        .catch(error => {
            console.error('Error fetching CV:', error);
            
        });
}

}