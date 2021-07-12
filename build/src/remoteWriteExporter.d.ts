import { collectorTypes, CollectorExporterNodeConfigBase } from '@opentelemetry/exporter-collector';
import { MetricRecord, MetricExporter } from '@opentelemetry/metrics';
import { ServiceClientType } from './types';
import { CollectorExporterNodeBase } from './remoteWriteExporterNodeBase';
/**
 * Collector Metric Exporter for Node with protobuf
 */
export declare class CollectorMetricExporter extends CollectorExporterNodeBase<MetricRecord, collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest> implements MetricExporter {
    protected readonly _startTime: number;
    constructor(config?: CollectorExporterNodeConfigBase);
    convert(metrics: MetricRecord[]): collectorTypes.opentelemetryProto.collector.metrics.v1.ExportMetricsServiceRequest;
    getDefaultUrl(config: CollectorExporterNodeConfigBase): string;
    getServiceClientType(): ServiceClientType;
}
//# sourceMappingURL=remoteWriteExporter.d.ts.map