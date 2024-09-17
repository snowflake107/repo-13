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
exports.RemoteWriteExporter = void 0;
const otlpExporter = require("@opentelemetry/exporter-metrics-otlp-http");
const types = require("./types");
const remoteWriteExporterNodeBase = require("./remoteWriteExporterNodeBase");
const DEFAULT_LISTENER_URL = 'https://listener.logz.io:8053';
const ExportResultCode = '@opentelemetry/core';
/**
 * Remote write Metric Exporter for Node with protobuf
 */
class RemoteWriteExporter extends remoteWriteExporterNodeBase.RemoteWriteExporterNodeBase {
    constructor(config = {}) {
        super(config);
        this.headers = config.headers;
        // Converts time to nanoseconds
        this._startTime = new Date().getTime() * 1000000;
        this._shutdown = false;
    }
    getDefaultUrl(config) {
        return typeof config.url === 'string'
            ? config.url : DEFAULT_LISTENER_URL
    }
    getServiceClientType() {
        return types.ServiceClientType.METRICS;
    }

    export(metrics, resultCallback) {
        if (this._shutdown) {
            setImmediate(resultCallback, { code: ExportResultCode.FAILED });
            return;
        }
        return this.send(metrics, resultCallback);
    }

    forceFlush() {
        return Promise.resolve();
    }

    shutdown() {
        this._shutdown = true;
        return this.forceFlush();
    }

}
exports.RemoteWriteExporter = RemoteWriteExporter;
