import { LightningElement, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import Id from "@salesforce/user/Id";
import { getRecord } from "lightning/uiRecordApi";
import getDraftJobList from "@salesforce/apex/jobObjectController.getDraftJobList";
import chartjs from "@salesforce/resourceUrl/chartjs";
import { loadScript } from "lightning/platformResourceLoader";
import getApplicantDataset from "@salesforce/apex/analyticsDatasets.getApplicantDataset";
import getApplicantsList from "@salesforce/apex/JobApplicantController.getApplicantsList";
import getNumberOfApplicants from "@salesforce/apex/JobApplicantController.getNumberOfApplicants";
import getNumberOfJobsPosted from "@salesforce/apex/JobApplicantController.getNumberOfJobsPosted";
import numberOfApplicantsShortlistedAndRejected from "@salesforce/apex/analyticsDatasets.numberOfApplicantsShortlistedAndRejected";
import empty_box from "@salesforce/resourceUrl/empty_box";
export default class HrLandingPage extends NavigationMixin(LightningElement) {
  @track currentUserName;
  @track draftJobList = [];
  @track applicantChartDataset = [];
  @track applicantsList;
  @track shortlistedRejectedApplicant = [];

  numberOfApplicants;
  numberOfJobsPosted;
  doughnutChart;

  doughnutChartjsInitialized = false;
  pieChart;
  pieChartjsInitialized = false;
  showApplicants = false;

  userId = Id;
  empty_box = empty_box;

  config = {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [],
          backgroundColor: [
            "rgb(255,99,132)",
            "rgb(255,159,64)",
            "rgb(255,205,86)",
            "rgb(75,192,192)",
            "rgb(153,102,204)",
            "rgb(179,158,181)",
            "rgb(188,152,126)",
            "rgb(123,104,238)",
            "rgb(119,221,119)"
          ],
          label: "Applicants Dataset"
        }
      ]
    },
    options: {
      responsive: true,
      title: "Applicants - Cities",

      maintainAspectRatio: false,
      legend: {
        position: "left"
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };

  pieConfig = {
    type: "pie",
    data: {
      datasets: [
        {
          data: [],
          backgroundColor: [
            "rgb(119,221,119)",
            "rgb(188,152,126)",
            "rgb(255,205,86)",
            "rgb(255,99,132)",
            "rgb(123,104,238)",
            "rgb(153,102,204)",
            "rgb(255,159,64)",
            "rgb(255,205,86)",
            "rgb(75,192,192)",
            "rgb(179,158,181)"
          ],
          label: "Applicants - Status"
        }
      ]
    },
    options: {
      responsive: true,
      title: "Applicants - Status",

      maintainAspectRatio: false,
      legend: {
        position: "left"
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  };

  @wire(getRecord, {
    recordId: Id,
    fields: ["User.Name"]
  })
  currentUserInfo({ error, data }) {
    if (data) {
      this.currentUserName = data.fields.Name.value;
    } else if (error) {
      console.error("Error fetching user data", error);
    }
  }
  @wire(getApplicantsList, { userId: "$userId" })
  wiredGetApplicantsList({ error, data }) {
    if (data) {
      this.applicantsList = data;
      if(this.applicantsList.length > 0){
        this.showApplicants = true;
      }
      console.log(this.showApplicants);

    } else {
      console.log("error------->", error);
    }
  }
  @wire(getDraftJobList, { userId: "$userId" })
  wiredGetDraftJobList({ error, data }) {
    if (data) {
        this.draftJobList = data;
        this.showDrafts = true;
    } else if (error) {
        console.error("Error fetching draft job list", error);
    }
}

  @wire(getNumberOfApplicants, { userId: "$userId" })
  wiredGetNumebrOfApplicants({ error, data }) {
    if (data) {
      this.numberOfApplicants = data;
    } else {
      console.log("error--------->", error);
    }
  }

  @wire(getNumberOfJobsPosted, { userId: "$userId" })
  wiredJobsPosted({ error, data }) {
    if (data) {
      this.numberOfJobsPosted = data;
    } else {
      console.log("error-------->", error);
    }
  }

  @wire(getApplicantDataset, {userId:"$userId"})
  applicants({ error, data }) {
    if (data) {
      this.applicantChartDataset = data;

      this.updateDoughnutChart();

      if (!this.doughnutChartjsInitialized) {
        this.doughnutChartjsInitialized = true;
        loadScript(this, chartjs).then(() => {
          const ctx = this.template
            .querySelector("canvas.donut")
            .getContext("2d");
          this.doughnutChart = new window.Chart(ctx, this.config);
        });
      }
    } else {
      console.error("Error fetching applicant data", error);
    }
  }

  @wire(numberOfApplicantsShortlistedAndRejected , {userId:"$userId"})
  wiredNumberOfApplicantsShortlistedAndRejected({ error, data }) {
    if (error) {
      console.error("error rejected applicant----->", error.message);
    }
    if (data) {
      this.shortlistedRejectedApplicant = data;
      this.updatePieChart();

      if (!this.pieChartjsInitialized) {
        this.pieChartjsInitialized = true;
        loadScript(this, chartjs).then(() => {
          const ctx = this.template
            .querySelector("canvas.pie")
            .getContext("2d");
          this.pieChart = new window.Chart(ctx, this.pieConfig);
        });
      }
    }
  }
  updateDoughnutChart() {
    this.config.data.labels = [];
    this.config.data.datasets[0].data = [];
    this.applicantChartDataset.forEach((applicant) => {
      this.config.data.labels.push(applicant.label);
      this.config.data.datasets[0].data.push(applicant.count);
    });
    if (this.doughnutChart) {
      this.doughnutChart.update();
    }
  }

  updatePieChart() {
    this.pieConfig.data.labels = [];
    this.pieConfig.data.datasets[0].data = [];
    this.shortlistedRejectedApplicant.forEach((applicant) => {
      this.pieConfig.data.labels.push(applicant.label);
      this.pieConfig.data.datasets[0].data.push(applicant.count);
    });
    if (this.pieChart) {
      this.pieChart.update();
    }
  }

  navigateToJobDescPage(event) {
    const jobId = event.currentTarget.dataset.jobid;
    console.log("jobid(sender)----->", jobId);

    sessionStorage.setItem("postedJobId", jobId);
    const pageReference = {
      type: "standard__webPage",
      attributes: {
        url: "/job-description-page"
      }
    };
    this[NavigationMixin.Navigate](pageReference);
  }

  navigateToApplicantPage(event) {
    const candidateId = event.currentTarget.dataset.candidateid;
    console.log("candidateId(sender)----->", candidateId);
    sessionStorage.setItem("candidateid", candidateId);
    const pageReference = {
      type: "standard__webPage",
      attributes: {
        url: "/applicant-details"
      }
    };
    this[NavigationMixin.Navigate](pageReference);
  }
}