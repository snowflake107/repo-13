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

## Available Event Types

### Events for AEM Sites

Current vailable event types for AEM Sites are considered to be in the headless use-cases area and refer to events related to content fragments and content fragment models. 

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

## Available event types for AEM Assets: ##

| Event Type Name | Event Type Description | 
|---|---|
| Asset Processing Completed | Event triggered when an asset has completed processing in AEM. This is often used in place of an 'asset created' event for use cases that trigger from asset creation for two reasons - many extensions require some amount of asset metadata, which is extracted during asset processing and acting upon an asset that is in processing has a high chance of running into conflicts and contention issues. |

**Please note:** The list of available event types for AEM as a Cloud Service is being expanded on a rolling basis. If you are missing the event types you need, please contact the AEM-Eventing team via support, Adobe Consulting or your Technical Account Manager. We can provide you with immediate information about which event types are in progress or how quickly we can provide the event types you need. Your project success is our goal, and accordingly, the AEM Events Team will do everything possible to provide you with the event types you need as fast as possible. 


## Enable AEM Events for your AEM Cloud Service Environment

1. First, you need to enable your User Role. You can do this by going to the [Admin Console](https://adminconsole.adobe.com/), login with an Administrator account and assign the AEM Environment that you want to produce events. You can do this going to the **Users** tab in the upper part of the screen, then select the user you wish to change the Product Profile for

   ![enable user role](/src/pages/guides/events/images/1.png)

2. Add the developer access ACL to your product profile

   ![add developer access](/src/pages/guides/events/images/2.png)        
   
3. Ensure that you have admin rights for the product profile that will have to produce events

   ![ensure admin rights](/src/pages/guides/events/images/3.png)

## How to subscribe to AEM Events on Adobe Developer Console

In order to subscribe to AEM Eevents, you first need to create a new project in the Developer Console. You can do this by following these steps:

1. Visit [https://developer.adobe.com/console/projects](https://developer.adobe.com/console/projects) and create a new project

   ![create new project](/src/pages/guides/events/images/4.png)
   
2. Add a new API by pressing the **Add API** button

   ![Add API](/src/pages/guides/events/images/5.png)
   
3. In the following screen, select the **I/O Management API** card

   ![Press the I/O Management API card](/src/pages/guides/events/images/6.png)
     
4. Then, select the **OAuth Server-To-Server** card and edit the credential name for better identification in the Admin Console

   ![Oauth Server-to-server card](/src/pages/guides/events/images/7.png)
   
5. Press the **Save Configured API** button to save your changes.
6. Clicking the **Event** link in the left hand side of the screen, as shown below

   ![Event link](/src/pages/guides/events/images/8.png)
   
7. Then, select the solution from which you wish to consume events. In this case, it is **AEM Sites**

   ![Select solution](/src/pages/guides/events/images/9.png)
      
8. Select the AEM instance from which you wish to parse events

   ![Select AEM instance](/src/pages/guides/events/images/10.png)
   
9. Select the event types for your event subscription

   ![Select event types](/src/pages/guides/events/images/11.png)    
   
   >[!NOTE]
   >
   >For a list of available event types, see [this section](#available-event-types) of the documentation.

10. Click **Next** and select **OAuth Server-to-Server** as the type of authentication
11. Give your event registration a name and a description.
12. Next, choose how you would want to consume the events for this event registration. This example uses **Journaling**. For more information, consult the Event Processing Options section.

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

