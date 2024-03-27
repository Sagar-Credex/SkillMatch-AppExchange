/**
 * This class contains unit tests for validating the behavior of Apex classes
 * and triggers.
 *
 * Unit tests are class methods that verify whether a particular piece
 * of code is working properly. Unit test methods take no arguments,
 * commit no data to the database, and are flagged with the testMethod
 * keyword in the method definition.
 *
 * All test methods in an org are executed whenever Apex code is deployed
 * to a production org to confirm correctness, ensure code
 * coverage, and prevent regressions. All Apex classes are
 * required to have at least 75% code coverage in order to be deployed
 * to a production org. In addition, all triggers must have some code coverage.
 *
 * The @isTest class annotation indicates this class only contains test
 * methods. Classes defined with the @isTest annotation do not count against
 * the org size limit for all Apex scripts.
 *
 * See the Apex Language Reference for more information about Testing and Code Coverage.
 */
@isTest
private class JobListControllerTest {
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

  @isTest
  static void testGetTypeValues() {
    list<string> typeValues = JobListController.getTypeValues();

    System.assertEquals(3, typeValues.size());
    System.assert(typeValues.contains('Contract'));
  }

  @isTest
  static void testGetIndustryValues() {
    list<string> industryValues = JobListController.getIndustryValues();

    System.assertEquals(10, industryValues.size());
    System.assert(industryValues.contains('Information Technology'));
  }

  @isTest
  static void testExperienceValues() {
    list<string> experienceValues = JobListController.getExperienceValues();

    System.assertEquals(5, experienceValues.size());
    System.assert(experienceValues.contains('no experience needed'));
  }

  @isTest
  static void testGetJobList() {
    List<Job__c> testJobs = new List<Job__c>();
    testJobs.add(
      new Job__c(
        Title_of_position__c = 'Java Developer',
        City__c = 'Noida',
        Country__c = 'India',
        Type__c = 'Temporary',
        Experience__c = '1 to 3 years',
        Industry__c = 'Information Technology',
        Status__c = 'Completed'
      )
    );
    testJobs.add(
      new Job__c(
        Title_of_position__c = 'Sales Manager',
        City__c = 'Gurgaon',
        Country__c = 'India',
        Type__c = 'Temporary',
        Experience__c = '1 to 3 years',
        Industry__c = 'Information Technology',
        Status__c = 'Completed'
      )
    );
    insert testJobs;

    System.assertEquals(
      JobListController.getJobList(
          'Java',
          'Noida',
          new List<string>{ 'Temporary' },
          new List<string>{ '1 to 3 years' },
          new List<string>{ 'Information Technology' }
        )
        .size(),
      1
    );
  }
}
