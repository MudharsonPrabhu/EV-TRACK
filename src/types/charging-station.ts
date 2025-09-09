export interface ChargingStation {
  id: number;
  uuid: string;
  addressInfo: {
    title: string;
    addressLine1: string;
    town: string;
    stateOrProvince: string;
    postcode: string;
    country: {
      title: string;
    };
    latitude: number;
    longitude: number;
    distance?: number;
  };
  connections: Array<{
    id: number;
    connectionTypeID: number;
    connectionType: {
      title: string;
      formalName: string;
    };
    statusType: {
      title: string;
      isOperational: boolean;
    };
    powerKW?: number;
    quantity?: number;
  }>;
  statusType?: {
    title: string;
    isOperational: boolean;
  };
  usageType?: {
    title: string;
  };
  operatorInfo?: {
    title: string;
    websiteURL?: string;
  };
  dateLastStatusUpdate?: string;
  dataProvider?: {
    title: string;
  };
}

export interface ChargingStationFilters {
  connectorTypes: string[];
  availableOnly: boolean;
  maxDistance: number;
  minPowerKW?: number;
}

export interface SearchLocation {
  latitude: number;
  longitude: number;
  address?: string;
}