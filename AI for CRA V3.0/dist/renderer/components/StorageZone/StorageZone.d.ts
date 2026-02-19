/**
 * Storage Zone Component - File upload and management
 * Zone A: Protocol files, Zone B: Subject files
 */
import React from 'react';
interface StorageZoneProps {
    zone: 'protocol' | 'subject';
    title: string;
    subtitle: string;
}
export declare const StorageZone: React.FC<StorageZoneProps>;
export default StorageZone;
//# sourceMappingURL=StorageZone.d.ts.map