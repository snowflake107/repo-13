---
title: AEM Events as a Cloud Service
description: Introduction to the all-new AEM Events in AEM as a Cloud Service
---

## Introducing the all-new AEM Eventing by AEM as a Cloud Service

A major strength of AEM has always been interoperability, based on open standards. This has enabled custom extensions and integrations, creating countless additional use cases around AEM. With the new development of AEM Events, AEM CS now offers a cloud-native solution for AEM expandability and thus pursues the following goals:

- A generic eventing platform that standardizes core functions such as event distribution, further processing and security
- Outsource custom event processing into separate services for improved scalability and maintainability
- Avoidance of custom code in AEM runtimes for better robustness and reduced effort when deploying, testing and maintaining AEM CS

While the existing AEM Eventing [link] solution is still supported for AEM OnPremise installations and AEM on Adobe Managed Service, the new AEM Eventing is by design initiated for AEM as a Cloud Service only. Thi

## When to use AEM Events
 
For project-specific extensions and integrations with AEM, AEM Events can help inform external systems about all possible events in AEM in real time. This means that a reaction can be defined or implemented for every change in AEM. Below you will find a few examples of how you can use AEM Events.
- You want to publish headless content in AEM and deploy it elsewhere at the same time, e.g. because you run other native mobile apps in addition to your AEM website.
- You want to log and archive all activities in AEM in an audit-proof manner. With AEM Events, you obtain relevant changes in AEM and forward them to an external system suitable for archiving.
- You want to integrate an external search engine for site search on AEM Publish and update the indexes in real time.
- You want to inform user groups about certain events in AEM in external channels. Forward the events as desired, e.g. to a Slack channel or to an email group.

In some use cases it is sufficient to forward AEM events as notifications. However, for most application areas, AEM Events must be combined with custom business logic and AEM APIs to access AEM content. Adobe offers comprehensive support here with Adobe Developer Console, Adobe i/o and AEM APIs. This tutorial is intended to give you an overview of AEM Events and step-by-step instructions on how you can effectively extend AEM via Events and integrate it with other systems.
