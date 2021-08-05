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
exports.CollectorMetricExporter = void 0;
const exporter_collector_1 = require("@opentelemetry/exporter-collector");
const types_1 = require("./types");
const CollectorExporterNodeBase_1 = require("./remoteWriteExporterNodeBase");
const core_1 = require("@opentelemetry/core");
const DEFAULT_LISTENER_URL = 'https://listener.logz.io:8053';
/**
 * Collector Metric Exporter for Node with protobuf
 */
class RemoteWriteExporter extends CollectorExporterNodeBase_1.CollectorExporterNodeBase {
    constructor(config = {}) {
        super(config);
        this.headers = config.headers;
        // Converts time to nanoseconds
        this._startTime = new Date().getTime() * 1000000;
    }
    convert(metrics) {
        return exporter_collector_1.toCollectorExportMetricServiceRequest(metrics, this._startTime, this);
    }
    getDefaultUrl(config) {
        return typeof config.url === 'string'
            ? config.url : DEFAULT_LISTENER_URL
    }
    getServiceClientType() {
        return types_1.ServiceClientType.METRICS;
    }
}
exports.CollectorMetricExporter = RemoteWriteExporter;
