# B2B Commerce Open Source Components

This repository provides the source code for selected storefront components of B2B Commerce. 
This readme outlines the prerequisites and steps to customize and deploy the open source components in your storefront. These components provide the source code for selected elements, allowing you to extend and enhance them to meet your specific storefront needs.


## Prerequisites 🗒️

Before you begin, complete these prerequisites:

* Enable ExperienceBundle Metadata API for Digital Experiences.
  * This is typically enabled by default; to verify the setting, login to your org and go to **Setup** → **Digital Experiences**. Under Settings, ensure that the checkbox Enable ExperienceBundle Metadata API is selected. <img width="1547" height="910" alt="Screenshot 2025-06-04 at 11 59 38 AM" src="https://github.com/user-attachments/assets/0243481b-e50a-403b-a228-b8761b88be4d" />

* Install Salesforce Developer Experience (SFDX) on your system.

After the prerequisites are completed, follow these steps to use open source components.

## Prepare and Deploy Open Source Components

1. **Connect SFDX project to your org**: If you don't have an SFDX project, create one. Then connect the project to your Salesforce org by running this command on your Terminal:

   ```console 
   sf org login web --alias "alias" --instance-url "ORG-BASE-URL"
   ```

2. **Retrieve digital experiences**: Retrieve all digital experiences by running this command on your Terminal:
   ```console
   sf project retrieve start --metadata DigitalExperienceBundle --target-org "alias"
   ```
  > [!TIP]
  > If the above command doesn’t work on your terminal, use this instead:
  > ```console
  > sf project retrieve start -m DigitalExperienceBundle -o "alias"
  > ```

3. **Copy open source components**: Navigate to the storefront where you want to deploy the component. Within the storefront’s folder, you’ll find directories named sfdc_cms__lwc and sfdc_cms__label, typically under digitalExperiences. These folders are also present in the open-source-components GitHub repository. 

   Copy the components along with their dependencies from the corresponding sfdc_cms__lwc and sfdc_cms__label folders in the GitHub repository, to the matching folders in your target storefront.


4. **Enhance and deploy components**: Modify the code of the component as per your requirements. Once the changes are complete, use one of the following commands to deploy the updated components to your storefront.

   If you’re deploying the components for the first time and want to deploy all the components, run this command:

   ```console
   sf project deploy start --source-dir force-app/main/default/digitalExperiences/site/<name_of_store>  --target-org <org_alias_name>
   ```
   Or If you’re deploying a single updated component, use this command:

   ```console
   sf project deploy start --source-dir force-app/main/default/digitalExperiences/site/<name_of_store>/sfdc_cms__lwc/<name_of_component>  --target-org <org_alias_name>
   ```

5. **Activate in Experience Builder**: Once the deployment is complete, navigate to your Salesforce org and open the Experience Builder for the store where the components were deployed. You’ll notice a new section in the palette named Open Source, which shows the newly-deployed components. Replace the existing components in your store with the enhanced versions from the Open Source section. <img width="967" height="557" alt="Screenshot 2025-07-25 at 12 10 08 PM" src="https://github.com/user-attachments/assets/81705582-a38f-429c-91c5-445393136add" />
