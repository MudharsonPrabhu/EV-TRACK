import type { ChargingStation } from '@/types/charging-station';

// Static charging station data for testing Phase 3
export const mockChargingStations: ChargingStation[] = [
  {
    id: 1,
    uuid: "tesla-dt-001",
    addressInfo: {
      title: "Tesla Supercharger - Downtown",
      addressLine1: "123 Main Street",
      town: "San Francisco",
      stateOrProvince: "CA",
      postcode: "94102",
      country: { title: "United States" },
      latitude: 37.7749,
      longitude: -122.4194,
      distance: 0.5
    },
    connections: [
      {
        id: 1,
        connectionTypeID: 27,
        connectionType: { 
          title: "Tesla Supercharger",
          formalName: "Tesla Supercharger"
        },
        statusType: {
          title: "Operational",
          isOperational: true
        },
        powerKW: 150,
        quantity: 8
      }
    ],
    operatorInfo: {
      title: "Tesla"
    },
    statusType: {
      title: "Operational",
      isOperational: true
    },
    dateLastStatusUpdate: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    uuid: "cp-market-002", 
    addressInfo: {
      title: "ChargePoint Station - Market Plaza",
      addressLine1: "456 Market Street",
      town: "San Francisco",
      stateOrProvince: "CA",
      postcode: "94103",
      country: { title: "United States" },
      latitude: 37.7849,
      longitude: -122.4094,
      distance: 1.2
    },
    connections: [
      {
        id: 2,
        connectionTypeID: 1,
        connectionType: { 
          title: "CCS (Type 1)",
          formalName: "CCS (SAE Type 1)"
        },
        statusType: {
          title: "Operational",
          isOperational: true
        },
        powerKW: 50,
        quantity: 4
      },
      {
        id: 3,
        connectionTypeID: 2,
        connectionType: { 
          title: "CHAdeMO",
          formalName: "CHAdeMO"
        },
        statusType: {
          title: "Operational", 
          isOperational: true
        },
        powerKW: 50,
        quantity: 2
      }
    ],
    operatorInfo: {
      title: "ChargePoint"
    },
    statusType: {
      title: "Operational",
      isOperational: true
    },
    dateLastStatusUpdate: "2024-01-14T15:45:00Z"
  },
  {
    id: 3,
    uuid: "evgo-union-003",
    addressInfo: {
      title: "EVgo Fast Charging - Union Square",
      addressLine1: "789 Geary Street",
      town: "San Francisco",
      stateOrProvince: "CA",
      postcode: "94108",
      country: { title: "United States" },
      latitude: 37.7879,
      longitude: -122.4075,
      distance: 0.8
    },
    connections: [
      {
        id: 4,
        connectionTypeID: 1,
        connectionType: { 
          title: "CCS (Type 1)",
          formalName: "CCS (SAE Type 1)"
        },
        statusType: {
          title: "Temporarily Unavailable",
          isOperational: false
        },
        powerKW: 100,
        quantity: 3
      }
    ],
    operatorInfo: {
      title: "EVgo"
    },
    statusType: {
      title: "Temporarily Unavailable",
      isOperational: false
    },
    dateLastStatusUpdate: "2024-01-13T09:15:00Z"
  },
  {
    id: 4,
    uuid: "ea-ggp-004",
    addressInfo: {
      title: "Electrify America - Golden Gate Park",
      addressLine1: "1000 Fell Street",
      town: "San Francisco",
      stateOrProvince: "CA",
      postcode: "94117",
      country: { title: "United States" },
      latitude: 37.7713,
      longitude: -122.4525,
      distance: 2.1
    },
    connections: [
      {
        id: 5,
        connectionTypeID: 1,
        connectionType: { 
          title: "CCS (Type 1)",
          formalName: "CCS (SAE Type 1)"
        },
        statusType: {
          title: "Operational",
          isOperational: true
        },
        powerKW: 350,
        quantity: 6
      },
      {
        id: 6,
        connectionTypeID: 2,
        connectionType: { 
          title: "CHAdeMO",
          formalName: "CHAdeMO"
        },
        statusType: {
          title: "Operational",
          isOperational: true
        },
        powerKW: 150,
        quantity: 2
      }
    ],
    operatorInfo: {
      title: "Electrify America"
    },
    statusType: {
      title: "Operational",
      isOperational: true
    },
    dateLastStatusUpdate: "2024-01-16T12:00:00Z"
  }
];