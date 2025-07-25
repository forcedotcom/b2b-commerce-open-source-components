# OPEN CODE COMPONENTS (B2B Commerce)

This repository provides the source code for selected components from the B2B Commerce Storefront, made available as "Open Code Components." These components can be customized and extended to meet your storefront’s specific needs. You can enhance them as required and deploy the updated versions in any B2B Storefront by following the steps outlined below.

## Steps to use Open Code Components

1. As a first step, we need to make sure that access to ExperienceBundle Metadata API is enabled. In order to checl that, go to the org where you have deployed your components and go to Setup → Digital Experiences. Under “Digital Experiences”, go to Settings and then select the checkbox “Enable ExperienceBundle Metadata API”. 

<img width="1547" height="910" alt="Screenshot 2025-06-04 at 11 59 38 AM" src="https://github.com/user-attachments/assets/0243481b-e50a-403b-a228-b8761b88be4d" />

2. After this, go to your sfdx project and in case not already created, then please create a new sfdx project and connect it to your SF org using the sfdx auth command, like this :: 
      sfdx force:auth:web:login -r "ORG-BASE-URL" -a "alias"

3. After this, execute the below command to retrieve all the digital experiences ::

    sfdx force:source:retrieve -m DigitalExperienceBundle -o "alias"

NOTE- In case the above mentioned sfdx command doesn’t works on your IDE, use this command from terminal ::
    sf project retrieve start -m DigitalExperienceBundle -o TestingOrg  (sf cli command)

4. Next, navigate to the specific storefront where you want to deploy the Open Code Component. Within the storefront’s folder structure (typically under digitalExperiences), you’ll find directories named "sfdc_cms__lwc" and "sfdc_cms__label". These same folders are also present in this repository. To integrate the component, simply copy the needed components along with the dependent components from the corresponding sfdc_cms__lwc and sfdc_cms__label folders in this repo into the matching folders in your target storefront. 

5. Proceed with making the necessary enhancements to the component as per your requirements. Once the changes are complete, use the following command to deploy the updated components to your storefront ::

    sf project deploy start --source-dir force-app/main/default/digitalExperiences/site/<name_of_store>/sfdc_cms__lwc/<name_of_component>  --target-org <org_alias_name>

6. Once the deployment is complete, navigate to your SF org and open the Experience Builder for the storefront where the components were deployed. You’ll notice a new section in the Palette named "Open Code", which lists all the recently deployed components. Based on the mapping between the original components and their Open Code counterparts, replace the existing components in your storefront with the enhanced versions from the Open Code section.

<img width="967" height="557" alt="Screenshot 2025-07-25 at 12 10 08 PM" src="https://github.com/user-attachments/assets/81705582-a38f-429c-91c5-445393136add" />
