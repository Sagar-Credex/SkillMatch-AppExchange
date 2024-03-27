/**
 * @description       :
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             :
 * @last modified on  : 03-27-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
 **/
public with sharing class JobListController {
  
  public class JobWrapper {
    @AuraEnabled
    public Id jobId { get; set; }
    @AuraEnabled
    public Integer daysAgo { get; private set; }
    @AuraEnabled
    public String title { get; set; }
    @AuraEnabled
    public String company { get; set; }
    @AuraEnabled
    public String jobType { get; set; }
    @AuraEnabled
    public String summary { get; set; }
    @AuraEnabled
    public Decimal salary { get; set; }
    @AuraEnabled
    public System.Location location { get; set; }
    @AuraEnabled
    public String city { get; set; }
    @AuraEnabled
    public String country { get; set; }

    public JobWrapper(Job__c job) {
      this.jobId = job.Id;
      this.daysAgo = calculateDaysAgo(job.CreatedDate);
      this.title = job.Title_of_position__c;
      this.company = job.Company_Name__c;
      this.jobType = job.Type__c;
      this.summary = job.Summary__c;
      this.salary = job.Salary__c;
      this.location = job.Location__c;
      this.city = job.City__c;
      this.country = job.Country__c;
    }

    private Integer calculateDaysAgo(Datetime createdDate) {
      Datetime currentDate = Datetime.now();
      Long millisecondsAgo = currentDate.getTime() - createdDate.getTime();
      Integer daysAgo = (millisecondsAgo / (1000 * 60 * 60 * 24)).intValue();
      return daysAgo;
    }
  }
  @AuraEnabled(cacheable=true)
  public static List<String> getTypeValues() {
    Schema.DescribeFieldResult fieldResult = Job__c.Type__c.getDescribe();
    List<Schema.PicklistEntry> typeValues = fieldResult.getPicklistValues();
    List<String> values = new List<String>();
    for (Schema.PicklistEntry entry : typeValues) {
      values.add(entry.getLabel());
    }
    return values;
  }

  @AuraEnabled(cacheable=true)
  public static List<String> getIndustryValues() {
    Schema.DescribeFieldResult fieldResult = Job__c.Industry__c.getDescribe();
    List<Schema.PicklistEntry> industryValues = fieldResult.getPicklistValues();
    List<String> values = new List<String>();
    for (Schema.PicklistEntry entry : industryValues) {
      values.add(entry.getLabel());
    }
    return values;
  }

  @AuraEnabled(cacheable=true)
  public static List<String> getExperienceValues() {
    Schema.DescribeFieldResult fieldResult = Job__c.Experience__c.getDescribe();
    List<Schema.PicklistEntry> experienceValues = fieldResult.getPicklistValues();
    List<String> values = new List<String>();
    for (Schema.PicklistEntry entry : experienceValues) {
      values.add(entry.getLabel());
    }
    return values;
  }

  @AuraEnabled(cacheable=true)
  public static List<JobWrapper> getJobList(
    String searchTitle,
    String searchLocation,
    List<String> selectedTypeValues,
    List<String> selectedExperienceValues,
    List<String> selectedIndustryValues
  ) {
    // Use dynamic SOQL to build a query based on the search term
    String query = 'SELECT Id, Experience__c, Industry__c, CreatedDate, City__c, Country__c, Location__c, Salary__c, Title_of_position__c, Type__c, Company_Name__c, Summary__c FROM Job__c Where Status__c = \'Completed\'';

    List<String> dynamicConditions = new List<String>();
    searchTitle = '%' + searchTitle + '%';
    searchLocation = '%' + searchLocation + '%';
    if (!selectedTypeValues.isEmpty()) {
      dynamicConditions.add('Type__c IN :selectedTypeValues');
    }

    if (!selectedExperienceValues.isEmpty()) {
      dynamicConditions.add('Experience__c IN :selectedExperienceValues');
    }

    if (!selectedIndustryValues.isEmpty()) {
      dynamicConditions.add('Industry__c IN :selectedIndustryValues');
    }

    if (String.isNotBlank(searchTitle)) {
      dynamicConditions.add('Title_of_position__c LIKE :searchTitle');
    }

    if (String.isNotBlank(searchLocation)) {
      dynamicConditions.add('City__c LIKE :searchLocation');
    }

    if (!dynamicConditions.isEmpty()) {
      query += ' AND ' + String.join(dynamicConditions, ' AND ');
    }

    List<Job__c> jobs = Database.query(query);

    List<JobWrapper> wrappedJobs = new List<JobWrapper>();
    for (Job__c job : jobs) {
      wrappedJobs.add(new JobWrapper(job));
    }

    return wrappedJobs;
  }
}
