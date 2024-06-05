import * as core from '@actions/core'
import * as github from '@actions/github'
import * as httpm from '@actions/http-client'
import { WebhookPayload } from '@actions/github/lib/interfaces'
import type { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'

const http = new httpm.HttpClient('client')

async function getAccessToken(
  clientId: string,
  clientSecret: string,
  resource: string,
  dtSSOUrl: string,
  debug: string
): Promise<string> {
  try {
    console.info('Getting OAuth token')
    const response = await http.post(
      dtSSOUrl,
      `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}&resource=${resource}&scope=storage:bizevents:write storage:buckets:read storage:events:write`,
      {
        'content-type': 'application/x-www-form-urlencoded'
      }
    )

    const body = JSON.parse(await response.readBody())
    if (debug == 'true') {
      core.info('OAuth response')
      const logResponse = JSON.stringify(body, null, 2)
      core.info(logResponse)
    }
    return body.access_token as string
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function buildCloudEvent(payload: WorkflowRunCompletedEvent): unknown {
  const workflowRun = (payload as WorkflowRunCompletedEvent).workflow_run
  return {
    specversion: '1.0',
    id: `${workflowRun.id}`,
    type: 'com.dynatrace.github.workflow.run',
    source: 'dynatrace-workflow-ingester',
    data: {
      ...workflowRun,
      run_duration_ms:
        new Date(workflowRun.updated_at).getTime() -
        new Date(workflowRun.run_started_at).getTime()
    }
  }
}

export async function run(): Promise<void> {
  try {
    const clientId = core.getInput('dt-client-id')
    const clientSecret = core.getInput('dt-client-secret')
    const environmentId = core.getInput('dt-environment-id')
    const resource = core.getInput('dt-resource')
    const dtSSOUrl = core.getInput('dt-sso-url')
    const debug = core.getInput('debug')

    const cloudEvent = buildCloudEvent(
      github.context.payload as WorkflowRunCompletedEvent
    )

    const dynatraceAccessToken = await getAccessToken(
      clientId,
      clientSecret,
      resource,
      dtSSOUrl,
      debug
    )
    const response = await http.post(
      `${environmentId}/platform/classic/environment-api/v2/bizevents/ingest`,
      JSON.stringify(cloudEvent),
      {
        'content-type': 'application/cloudevent+json',
        authorization: `Bearer ${dynatraceAccessToken}`
      }
    )
    core.info(await response.readBody())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
