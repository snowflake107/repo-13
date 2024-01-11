---
title: AEM OpenAPI-based APIs
description: How to use AEM OpenAPI-based APIs
---

## Using the OpenAPI-based APIs

### Introduction

AEM as a Cloud Service offers a variety of APIs that adhere to the [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3).

For a full list of provided APIs and supported events, see the [APIs documentation](/).

This guide describes the common patterns applying to all APIs.

### Authentication

Credentials should be generated using the AEM Developer Console. A short-lived [development access token](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/implementing/developing/generating-access-tokens-for-server-side-apis.html#generating-the-access-token) can be generated for one-off API usage, while for persistent code, [a longer-lived JWT token](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/implementing/developing/generating-access-tokens-for-server-side-apis.html?lang=en#generate-a-jwt-token-and-exchange-it-for-an-access-token) can be generated to exchange for an access token.  

Pass the token as the value of the Authorization header as follows:

`curl -H "Authorization: Bearer <access_token>" <https://<endpoint_url>`

### JSON Payloads

Clients receiving JSON payload must be forgiving when processing the payload and not fail on additional properties that might not be declared in the schema the client is using. On the other hand clients must be strict when sending a JSON document as part of a request. The document must conform to the used schema.

### Collections: Pagination and sorting

Usually an API will support a **limit** query parameter to indicate the desired number of results to return. Documentation will state the default limit and any minimum or maximum values.

If there are more resources in the collection than returned, the output result will include a **cursor** property. The cursor's value can then be used in a subsequent LIST API call to retrieve the next set of resources in the collection, by passing the returned value to the **cursor** query parameter.

Empty collections are represented as an empty array.

If API documentation states that results are sortable, optionally pass the **orderBy** query parameter a comma separated list of values, each followed by a space and either **asc** (ascending, which is the default) or **dec** (descending).

### Error handling
  
A 500 error (or other 5xx codes) implies something wrong with the service, while a 400 error (or other 4xx codes) implies the service is rejecting the request due to permissions or data; for example, invalid credentials, incorrect parameters, or unknown version IDs.

Per [RFC 7808](https://datatracker.ietf.org/doc/html/rfc7807), the response may include the following detaiils:

| Field      | Type      | Description |
| ---------- | -------- | ----------- |
| type      | string      | A URI reference that identifies the problem type |
| title     | string      | A summary of the problem type |
| status   | number       | The HTTP status code |
| detail   | string       | Explanation of the problem |
| instance   | string     | A URI reference that identifies the specific occurrence of the problem |

### Defending against concurrent update

When updating a resource, which may also be updated by other clients, first GET the resource and store the resulting **ETag**. When attempting to update, pass the ETag as a value in an **If-Match** header. If the resource has been modified by a different client, a 412 Precondition Failed error code is returned.

### Long-running operations

Some endpoints may take several seconds or minutes to process the request and respond with the result. In those cases, the API's reference documentation will include **202 Accepted** as a possible HTTP response status, which indicates that the client must be coded to inspect the result, and be prepared to make additional requests.

If a 202 Accepted is returned, the **Location header** will include the URI to poll, with the recommending time interval to start polling dictated by the **Retry-After header**. If, when polled at the URI, the operation is still running, a 202 Accepted is again returned, and Retry-After header may have a new value to signal the recommended time interval to continue polling.

When the operation has completed processing, it will in many cases return with the HTTP response status **303 See Other** and a Location header indicating the URI to retrieve the output, as well as JSON output with more information about the final state of processing. Invoking that URI will return an HTTP code of "200 OK" if successful, or the appropriate error code.

However, note that in the case where the original operation was a GET, instead of a "303 See other" response status and Location header, the client may receive a response of "200 OK" with a status property set to terminated and a result in the **result** property.

The client can include the Prefer header, whose value is set to its preference for either an asynchronous or synchronous response, which may influence, but does not guarantee, the response pattern. For asynchronous, pass in the value **respond-async**; for synchronous, pass in the value **wait** with the maximum number of seconds it would be willing to wait. If the Prefer header value is honored, the result will set the **Preference-Applied** header.

If the client has taken too much time to poll, the result may be lost and the URI's HTTP status would return 404 Not Found.

### Versioning

The full set of AEM OpenAPI-based APIs gets a version associated with the timing of its release. For example, 2023.9.

Changes to a particular API from one version to the next can only be additive and are thus always backwards compatible.

Adobe may deprecate an element of an API by flaggng it in documentation as deprecated. If a complete endpoint is deprecated, the response returns a **Sunset** header, indicating the targeted removal date.

### Experimental and Unsupported APIs

Some APIs are marked in documentation as experimental, which implies that Adobe may modify or remove them without warning. Clients must acknowledge that understanding by including a header **X-Adobe-Accept-Experimental** with value of "1". If the invocation of an experimental API does not include this header and value, a 400 status code is returned.

Some APIs may be discoverable and potentially documented, but not intended for the use of customers, and are thus unsupported; there is a risk of being modified or removed by Adobe without warning. It should be noted that these APIs will only be processed if invoked with a header **X-Adobe-Accept-Unsupported-API** with a value of "1".
