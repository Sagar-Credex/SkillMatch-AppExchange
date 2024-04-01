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
private class GetApplicantDataTest {
  @isTest
  static void TestGetApplicantDataMethod() {
    Candidate_Details__c candidate = new Candidate_Details__c(
      About__c = 'About the candidate',
      City__c = 'City',
      Country__c = 'Country',
      Candidate_Email__c = 'candidate@example.com',
      Gender__c = 'Male',
      Name = 'John Doe',
      Phone_Number__c = '1234567890',
      Skills__c = 'Java, JavaScript',
      Experience__c = 5,
      Job_Title__c = 'Software Engineer'
    );
    insert candidate;
    List<Candidate_Details__c> result = GetApplicantData.GetApplicantDataMethod(
      candidate.Id
    );

    System.assertEquals(1, result.size());
    System.assertEquals('1234567890', result[0].Phone_Number__c);
  }

  @isTest
  static void TestGetAppliedJobById() {
    Candidate_Details__c candidate = new Candidate_Details__c(
      About__c = 'About the candidate',
      City__c = 'City',
      Country__c = 'Country',
      Candidate_Email__c = 'candidate@example.com',
      Gender__c = 'Male',
      Name = 'John Doe',
      Phone_Number__c = '1234567890',
      Skills__c = 'Java, JavaScript',
      Experience__c = 5,
      Job_Title__c = 'Software Engineer'
      
    );
    insert candidate;
    Job__c job = new Job__c(
      Title_of_position__c = 'Sales Manager',
      City__c = 'Gurgaon',
      Country__c = 'India',
      Type__c = 'Temporary',
      Experience__c = '1 to 3 years',
      Industry__c = 'Information Technology',
      Status__c = 'Completed'
    );
    insert job;

    Job_Applicants__c applicant = new Job_Applicants__c(
      CandidateId__c = candidate.id,
      Job_Id__c = job.id,
      Application_Status__c = 'Pending'
    );

    insert applicant;

    List<Job__c> result = GetApplicantData.getAppliedJobById(candidate.id);

    System.assertEquals(1, result.size());
  }

 
    @isTest
    static void TestGetWorkExperienceData() {
        Candidate_Details__c candidate = new Candidate_Details__c(
            About__c = 'About the candidate',
            City__c = 'City',
            Country__c = 'Country',
            Candidate_Email__c = 'candidate@example.com',
            Gender__c = 'Male',
            Name = 'John Doe',
            Phone_Number__c = '1234567890',
            Skills__c = 'Java, JavaScript',
            Experience__c = 5,
            Job_Title__c = 'Software Engineer'
        );
        insert candidate;
        
        List<Work_Experience__c> workExpList = new List<Work_Experience__c>{
            new Work_Experience__c(
                CandidateId__c = candidate.Id,
                City__c = 'City1',
                Country__c = 'Country1',
                Name = 'Work Experience 1',
                From_Date__c = Date.newInstance(2020, 1, 1),
                To_Date__c = Date.newInstance(2022, 12, 31),
                Is_Current_Company__c = false,
                Organisation__c = 'Company A',
                Skills__c = 'Java, SQL'
            ),
            new Work_Experience__c(
                CandidateId__c = candidate.Id,
                City__c = 'City2',
                Country__c = 'Country2',
                Name = 'Work Experience 2',
                From_Date__c = Date.newInstance(2018, 1, 1),
                To_Date__c = null,
                Is_Current_Company__c = true,
                Organisation__c = 'Company B',
                Skills__c = 'JavaScript, HTML'
            )
        };
        insert workExpList;

        list<Work_Experience__c> result = GetApplicantData.GetWorkExperienceData(candidate.id);

        System.assertEquals(2, result.size());
    }
}

