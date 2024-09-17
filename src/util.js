"use strict";
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.send = exports.onInit = exports.getExportRequestProto = void 0;

const SnappyJS = require('snappyjs');
const transform = require('./transformTs');
const logger = require('./logging').logger
const axios = require('axios');
const { version } = require('../package.json');
let lost = 0;

let ExportRequestProto;
function getExportRequestProto() {
    return ExportRequestProto;
}
exports.getExportRequestProto = getExportRequestProto;


function onInit(collector, _config) {

}
exports.onInit = onInit;

function shouldRetry(status, attempts, maxAttempts) {
    const retryCodes = [408, 500, 502, 503, 504, 522, 524];
    return retryCodes.includes(status) && attempts < maxAttempts;
}

function axiosRetry({
    url,
    payload,
    baseHeaders,
    httpAgent,
    response,
    maxAttempts,
    retryMS,
    callback
} = {}) {
    process.nextTick(execute);

    function execute() {
        const headers = getRequestHeaders(baseHeaders, response.attempts);
        const requestOptions = {
            headers,
            httpAgent,
            validateStatus: function (status) {
                if (status < 200 || status > 204) {
                    return false;
                }
                return true;
            }
        };

        response.options = {
            headers,
        };

        response.attempts += 1;

        axios.post(url, payload, requestOptions)
        .then(res => {
            if (shouldRetry(res.status, response.attempts, maxAttempts)) {
                setTimeout(() => execute.call(this), retryMS);
            } else {
                response.status = res.status;
                callback(null);
            }
        })
        .catch(error => {
            if (error.response && error.response.status) {
                if (shouldRetry(error.response.status, response.attempts, maxAttempts)) {
                    setTimeout(() => execute.call(this), retryMS);
                } else {
                    response.status = error.response.status;
                    callback(error);
                }
            } else {
                callback(error);
            }
        });
    }
}

function makeWriteRequest(collector, objects) {
    const writeRequest = transform.toTimeSeries(objects);
    return writeRequest;
}

function makePayload(writeRequest) {
    const bytes = writeRequest.serializeBinary();
    const payload = SnappyJS.compress(bytes);
    return payload;
}

function getRequestHeaders(baseHeaders, attempts) {
    const rawHeaders = {
        "Content-Encoding": "snappy",
        "Content-Type": "application/x-protobuf",
        "X-Prometheus-Remote-Write-Version": "0.1.0",
        "User-Agent": `nodejs-metrics/${version}/${attempts}/${lost}`,
    };
    const headers = {...rawHeaders, ...baseHeaders}
    return headers;
}

function send(collector, objects) {
    const response = {
        options: {},
        attempts: 0,
        status: -1,
    };
    const writeRequest = makeWriteRequest(collector, objects);
    if (!(writeRequest && writeRequest.f)) {
        // no data
        logger.log({level: 'info', message: 'No timeseries to send'});
        return;
    }
    const timeSeriesCount = writeRequest.f["1"].length;
    if (0 < timeSeriesCount) {
        logger.log({level: 'info', message: `Sending bulk of ${timeSeriesCount} timeseries`});

        axiosRetry({
            url: collector.url,
            payload: makePayload(writeRequest),
            httpAgent: collector.agent,
            baseHeaders: collector.headers,
            maxAttempts: 3,
            retryMS: 2000,
            response,
            callback: postRequest
        });

        function postRequest(err) {
            if (err) {
                lost += timeSeriesCount;
                return logger.log({
                    level: "error",
                    message: `Failed to export error : ${err.message}`
                });
            }
            lost = 0;
            logger.log({
                level: "info",
                message: `Export Succeeded after ${response.attempts} attempts. Status code: ${response.status}`
            });
        }
    } else {
        logger.log({level: "info", message: "No timeseries to send"})
    }

    return response;
}
exports.send = send;