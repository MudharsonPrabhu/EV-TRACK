export interface MockChargingStation {
  stationId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    address: string;
  };
  status: 'Available' | 'Occupied' | 'Offline';
  availablePorts: number;
  totalPorts: number;
  chargingSpeed: '7kW' | '22kW' | '50kW' | '120kW';
  lastUpdated: Date;
  operator: string;
}

// Mock charging stations across India
export const mockIndianStations: MockChargingStation[] = [
  {
    stationId: 'CHN001',
    name: 'Express Avenue Charging Hub',
    location: {
      lat: 13.0732,
      lng: 80.2609,
      city: 'Chennai',
      address: 'Express Avenue Mall, Royapettah'
    },
    status: 'Available',
    availablePorts: 3,
    totalPorts: 4,
    chargingSpeed: '50kW',
    lastUpdated: new Date(),
    operator: 'Tata Power'
  },
  {
    stationId: 'CHN002',
    name: 'Anna Nagar Fast Charge',
    location: {
      lat: 13.0878,
      lng: 80.2093,
      city: 'Chennai',
      address: 'Anna Nagar West, Chennai'
    },
    status: 'Occupied',
    availablePorts: 0,
    totalPorts: 2,
    chargingSpeed: '22kW',
    lastUpdated: new Date(),
    operator: 'Ather Energy'
  },
  {
    stationId: 'BLR001',
    name: 'Forum Mall EV Station',
    location: {
      lat: 12.9279,
      lng: 77.6271,
      city: 'Bangalore',
      address: 'Forum Mall, Koramangala'
    },
    status: 'Available',
    availablePorts: 5,
    totalPorts: 6,
    chargingSpeed: '120kW',
    lastUpdated: new Date(),
    operator: 'ChargeZone'
  },
  {
    stationId: 'BLR002',
    name: 'Electronic City Hub',
    location: {
      lat: 12.8456,
      lng: 77.6603,
      city: 'Bangalore',
      address: 'Electronic City Phase 1'
    },
    status: 'Offline',
    availablePorts: 0,
    totalPorts: 4,
    chargingSpeed: '50kW',
    lastUpdated: new Date(),
    operator: 'MG Motor'
  },
  {
    stationId: 'DEL001',
    name: 'Connaught Place Station',
    location: {
      lat: 28.6315,
      lng: 77.2167,
      city: 'Delhi',
      address: 'Connaught Place, New Delhi'
    },
    status: 'Available',
    availablePorts: 2,
    totalPorts: 3,
    chargingSpeed: '22kW',
    lastUpdated: new Date(),
    operator: 'BPCL'
  },
  {
    stationId: 'DEL002',
    name: 'Gurgaon Cyber Hub',
    location: {
      lat: 28.4950,
      lng: 77.0890,
      city: 'Delhi',
      address: 'Cyber Hub, Gurgaon'
    },
    status: 'Occupied',
    availablePorts: 1,
    totalPorts: 5,
    chargingSpeed: '50kW',
    lastUpdated: new Date(),
    operator: 'Tata Power'
  },
  {
    stationId: 'MUM001',
    name: 'Bandra Kurla Complex',
    location: {
      lat: 19.0596,
      lng: 72.8656,
      city: 'Mumbai',
      address: 'BKC, Bandra East'
    },
    status: 'Available',
    availablePorts: 4,
    totalPorts: 4,
    chargingSpeed: '120kW',
    lastUpdated: new Date(),
    operator: 'Adani Total Gas'
  },
  {
    stationId: 'MUM002',
    name: 'Powai Tech Park',
    location: {
      lat: 19.1176,
      lng: 72.9060,
      city: 'Mumbai',
      address: 'Hiranandani, Powai'
    },
    status: 'Occupied',
    availablePorts: 0,
    totalPorts: 3,
    chargingSpeed: '22kW',
    lastUpdated: new Date(),
    operator: 'Ather Energy'
  },
  {
    stationId: 'HYD001',
    name: 'HITEC City Station',
    location: {
      lat: 17.4505,
      lng: 78.3809,
      city: 'Hyderabad',
      address: 'HITEC City, Madhapur'
    },
    status: 'Available',
    availablePorts: 3,
    totalPorts: 3,
    chargingSpeed: '50kW',
    lastUpdated: new Date(),
    operator: 'EV Motors India'
  },
  {
    stationId: 'HYD002',
    name: 'Gachibowli Metro Station',
    location: {
      lat: 17.4399,
      lng: 78.3488,
      city: 'Hyderabad',
      address: 'Gachibowli Metro Station'
    },
    status: 'Offline',
    availablePorts: 0,
    totalPorts: 2,
    chargingSpeed: '22kW',
    lastUpdated: new Date(),
    operator: 'Hyundai'
  },
  {
    stationId: 'PUN001',
    name: 'Pune IT Park Hub',
    location: {
      lat: 18.5596,
      lng: 73.7802,
      city: 'Pune',
      address: 'Hinjawadi IT Park'
    },
    status: 'Available',
    availablePorts: 2,
    totalPorts: 4,
    chargingSpeed: '50kW',
    lastUpdated: new Date(),
    operator: 'Tata Power'
  },
  {
    stationId: 'KOL001',
    name: 'Salt Lake Sector V',
    location: {
      lat: 22.5726,
      lng: 88.4638,
      city: 'Kolkata',
      address: 'Salt Lake Sector V'
    },
    status: 'Occupied',
    availablePorts: 1,
    totalPorts: 3,
    chargingSpeed: '22kW',
    lastUpdated: new Date(),
    operator: 'BPCL'
  },
  {
    stationId: 'AHM001',
    name: 'Gandhinagar Hub',
    location: {
      lat: 23.2156,
      lng: 72.6369,
      city: 'Ahmedabad',
      address: 'Gandhinagar, Gujarat'
    },
    status: 'Available',
    availablePorts: 3,
    totalPorts: 3,
    chargingSpeed: '120kW',
    lastUpdated: new Date(),
    operator: 'Adani Total Gas'
  },
  {
    stationId: 'KOC001',
    name: 'Marine Drive Station',
    location: {
      lat: 9.9312,
      lng: 76.2673,
      city: 'Kochi',
      address: 'Marine Drive, Ernakulam'
    },
    status: 'Available',
    availablePorts: 2,
    totalPorts: 2,
    chargingSpeed: '50kW',
    lastUpdated: new Date(),
    operator: 'KSEB'
  },
  {
    stationId: 'JAI001',
    name: 'Pink City Mall',
    location: {
      lat: 26.8467,
      lng: 75.8373,
      city: 'Jaipur',
      address: 'Tonk Road, Jaipur'
    },
    status: 'Occupied',
    availablePorts: 0,
    totalPorts: 4,
    chargingSpeed: '22kW',
    lastUpdated: new Date(),
    operator: 'ChargeZone'
  }
];