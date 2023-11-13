---
title: AEM Events as a Cloud Service
description: Introduction to the all-new AEM Events in AEM as a Cloud Service
---

## Introducing Cloud-Native AEM Events in AEM as a Cloud Service

A major strength of AEM has always been interoperability, based on open standards. This has enabled custom extensions and integrations and created countless additional use cases with AEM as the content centerpiece. With the new development of AEM Events, AEM CS now offers a cloud-native solution for AEM expandability and thus pursues the following goals:

- A generic eventing platform that makes it easy to subscribe to events, process them according to your project needs in most lightweight, scalable and secure ways
- Separation of functions like AEM Events in this case into standardized dedicated services for improved scalability and maintainability
- Avoidance of custom code in AEM runtimes for better robustness and reduced effort when deploying, testing and maintaining AEM CS

While the existing AEM Eventing https://developer.adobe.com/events/docs/guides/using/aem/ solution is still supported for AEM OnPremise installations and AEM on Adobe Managed Service, the new AEM Eventing is by design initiated for AEM as a Cloud Service only. 

> [!NOTE]
> AEM as a Cloud Service Eventing, together with AEM as a Cloud Service APIs, is currently only available to registered users in pre-release mode. Please contact Adobe if you are interested in unlocking these cloud-native extensibility capabilities of AEM as a Cloud Service.**

## Why AEM Events?

Exposing events in AEM CS to external services, both first and third party, can solve a number of problems related to integrating various systems and improving the overall functionality of AEM CS. Here are a few specific problems that can be addressed by exposing events:

- Real-time updates: By exposing events to external services, you can enable real-time updates to content and metadata within AEM. This means that changes made within AEM can be immediately reflected in other systems and platforms that are integrated with it.
- Cross-system integration: Many organizations use multiple systems to manage different aspects of their business. By exposing events in AEM, you can facilitate integration with other systems, such as customer relationship management (CRM) or marketing automation tools. This allows for a more seamless exchange of data between systems, reducing manual data entry and improving overall efficiency.
- Customization and flexibility: Exposing events in AEM allows for greater customization and flexibility in how the system is used. Developers can create custom integrations that use the events exposed by AEM to trigger specific actions in other systems or platforms. This allows for a more tailored approach to content management that can meet the unique needs of a particular organization. Traditionally, this comes at the cost of custom code integration in AEM, not so with AEM Events.
- Improved analytics and reporting: By exposing events in AEM, you can gather more detailed data about how content is being used and consumed across different systems and platforms. This data can be used to generate more robust analytics and reporting, which can help inform content strategy and improve overall performance.

Overall, exposing events in AEM can help to create a more integrated and efficient content ecosystem, while also providing greater flexibility and customization options for organizations.

## Example Use Cases 
 
For project-specific extensions and integrations with AEM, AEM Events can help to inform external systems about all possible events in AEM in real time. This means that a automated reaction can be defined or implemented upon every event in AEM. Below you will find a few use case examples to illustrate how you could use AEM Events.

- You are publishing headless content in AEM and want to forward content changes as webhooks on to e.g. a native mobile app. AEM Events is the perfect realtime trigger.
- You want to log and archive all activities in AEM in an audit-proof manner. With AEM Events, you obtain relevant changes in AEM and forward them to an external system suitable for info retrieval and archiving.
- You want to integrate an external search engine for site search on AEM Publish and update the indexes in real time.
- You want to inform user groups about certain events in AEM in external channels. Forward the events as needed, e.g. to a Slack channel or to an email group.

In some use cases it is sufficient to forward AEM events as notifications. However, in most cases AEM Events must be combined with custom business logic and AEM APIs to access AEM content. Adobe offers comprehensive support here with Adobe Developer Console, Adobe i/o and AEM APIs. This tutorial is intended to give you an overview of AEM Events and step-by-step instructions on how you can effectively extend AEM via Events and integrate it with other systems.

## AEM Events processing via Adobe I/O 

AEM events are routed to Adobe I/O by default and are available instantly as soon as you subscribe to them in the Adobe Developer Console. In Adobe I/O you have the 3 consumption options described below for processing AEM events. It's best to familiarize yourself with the options in advance, as each has its own characteristics and it's up to you to choose a suitable strategy based on your project requirements. 

|Process|Description|Consumption|Scope|Documentation|
|---|---|---|---|---|
|Adobe I/O Events Webhooks |Sign up a Webhook URL that receives event JSON objects as HTTP POST requests instantly. |PUSH |Choose any webhook client or webhook automation service to forward specific AEM Events. |[Adobe I/O Events Webhooks Documentation](https://developer.adobe.com/events/docs/guides/)|
|Adobe I/O Journaling API |Enables enterprise integrations to consume events according to their own cadence and process them in bulk. |PULL |Use your existing ressources, e.g. Java Development, to process AEM Events with custom logic from any infrastructure by using Adobe I/O Journaling API. |[Adobe I/O Events Journaling API](https://developer.adobe.com/events/docs/guides/journaling_intro/)| 
|Adobe I/O Runtime |AEM Events trigger serverless functions |PUSH |Use Adobe Developer App Builder and create custom business logic in NodeJS for subscribed AEM event types. AEM Events result in execution as a serverless function in Adobe I/O Runtime. |[Adobe I/O Events Runtime](https://developer.adobe.com/runtime/docs/guides/overview/what_is_runtime/)|

## Available Event Types

Current available event types for **AEM Sites** are considered to be in the headless use-cases area and refer to events related to content fragments and content fragment models. 

| Event Type Name | Event Type Description |
|---|---|
| Content Fragment created | Event triggered when a Content Fragment Model has been created on the AEM Authoring environment. |
| Content Fragment Deleted | Event triggered when a Content Fragment Model has been deleted on the AEM Authoring environment. |
| Content Fragment Model Created | Event triggered when a Content Fragment Model has been created on the AEM Authoring environment. |
| Content Fragment Model Deleted | Event triggered when a Content Fragment Model has been deleted on the AEM Authoring environment. |
| Content Fragment Model Modified | Event triggered when a Content Fragment Model has been modified on the AEM Authoring environment. |
| Content Fragment Model Published | Event triggered when a Content Fragment Model has been published. |
| Content Fragment Model Unpublished | Event triggered when a Content Fragment Model has been unpublished. |
| Content Fragment Modified | Event triggered when a Content Fragment has been modified on the AEM Authoring environment. |
| Content Fragment Published | Event triggered when a Content Fragment has been published. |
| Content Fragment Unpublished | Event triggered when a Content Fragment has been unpublished. |
| Content Fragment Variation Change | Event triggered when a Content Fragment Variation has been modified on the AEM Authoring environment. |

Current available event types for **AEM Assets** are part of the [developer documentation](https://developer.adobe.com/experience-cloud/experience-manager-apis/api/experimental/assets/author/).

> [!NOTE] 
> The list of available event types for AEM as a Cloud Service is being expanded on a rolling basis. If you are missing the event types you need, please contact the AEM-Eventing team via support, Adobe Consulting or your Technical Account Manager. We can provide you with immediate information about which event types are in progress or how quickly we can provide the event types you need. Your project success is our goal, and accordingly, the AEM Events Team will do everything possible to provide you with the event types you need as fast as possible. 

## Enable AEM Events on your AEM Cloud Service Environment

First, you need to enable your User Role in order to be able to subscribe to AEM Events from your AEM as a Cloud Service Environment via Adobe Developer Console. The following steps are necessary for this:
1. Visit [Admin Console](https://adminconsole.adobe.com/) and login with an Administrator account.
2. Select “Adobe Experience Manager as a Cloud Service” from the eligible products.
3. Select the desired AEM as a Cloud Service environment from which you want to subscribe to AEM Events
4. Select an associated product profile where your user is assigned as an admin user, otherwise you can make this edit in the product profile dialog.

## How to subscribe to AEM Events in the Adobe Developer Console

In order to subscribe to AEM Eevents, you first need to create a new project in the Adobe Developer Console. You can do this by following these steps:

1. Visit [https://developer.adobe.com/console/projects](https://developer.adobe.com/console/projects) and create a new project. But first, make sure you know how you want to process AEM events in Adobe I/O. If you want to use Adobe I/O Runtime, create a new project from a template. This gives you the opportunity to create your Adobe I/O project with App Builder. You can find more information about App Builder at the [App Builder Developer Documentation](https://developer.adobe.com/app-builder/docs/overview/).
   If you are unsure how to handle AEM Events in your project, please see the section [AEM Events processing via Adobe I/O](#aem-events-processing-via-adobe-io) earlier in this tutorial.

   ![create new project](/src/pages/guides/events/images/4.png)
   
3. Add a new Service "Event" to your prefered workspace in your new Adobe Developer Console project. This will open the "Add Event" dialog for you, which shows you all Adobe product solutions to which you are entitled.
   
   ![Select solution](/src/pages/guides/events/images/9.png)
   
4. Select the AEM Solution from which you want to subscribe to AEM Events, for example AEM Sites or AEM Assets. Once you click "Next", you will be provided with all AEM as a Cloud Service Environments, to which you are entitled as per Admin Console Configuration, see also section [Enable AEM Events on your AEM Cloud Service Environment](#Enable-AEM-Events-on-your-AEM-Cloud-Service-Environment) above.

    ![Select AEM instance](/src/pages/guides/events/images/10.png)
   
5. Choose the AEM as a Cloud Service Environment, from which you want to receive AEM Events. Once you click "Next", you will be provided with a list of available AEM Events for your selected AEM Solution. 

6. Select the Event Types to which you want to subscribe and click "Next".
   ![Select event types](/src/pages/guides/events/images/11.png)

7. Select the **OAuth Server-To-Server** card, edit the credential name for better identification in the Admin Console and click "Next".

   ![Oauth Server-to-server card](/src/pages/guides/events/images/7.png)
   
9. Provide a name and a description for your AEM Event registration and click "Next".
10. 
11. Press the **Save Configured API** button to save your changes.
12. Clicking the **Event** link in the left hand side of the screen, as shown below

   ![Event link](/src/pages/guides/events/images/8.png)
   
11. Then, select the solution from which you wish to consume events. In this case, it is **AEM Sites**

   ![Select solution](/src/pages/guides/events/images/9.png)
      
   

   
   >[!NOTE]
   >
   >For a list of available event types, see [this section](#available-event-types) of the documentation.

11. Click **Next** and select **OAuth Server-to-Server** as the type of authentication
12. Give your event registration a name and a description.
13. Next, choose how you would want to consume the events for this event registration. This example uses **Journaling**. For more information, consult the Event Processing Options section.

   ![Journaling](/src/pages/guides/events/images/12.png)
   
15. Once you've configured all of the above, you can:

   * Copy the Journaling endpoint - specific to your event registration, to access the Journaling API. This can be  done by pressing the **Copy** button next to the **Event Delvery Method** you've chosen
   * Validate event functionality per the subscribed event  
   * Review events in the Journaling Events Browser
   * Lookup connected credentials
 
## Event Processing Options

Adobe I/O offers three methods of processing events:

| | | |

* [Journaling](https://developer.adobe.com/events/docs/guides/journaling_intro/)
* [Webhooks](https://developer.adobe.com/events/docs/guides/)
* [Runtime action](https://developer.adobe.com/runtime/docs/guides/overview/what_is_runtime/)

## FAQ see also wiki

