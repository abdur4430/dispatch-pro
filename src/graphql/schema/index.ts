import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar DateTime

  enum UserRole { OWNER ADMIN DISPATCHER VIEWER }
  enum TruckSize {
    CARGO_VAN SPRINTER_VAN BOX_TRUCK_16FT BOX_TRUCK_24FT
    FLATBED STEP_DECK LOWBOY SEMI_DRY_VAN SEMI_REEFER
    SEMI_TANKER SEMI_DUMP OTHER
  }
  enum TruckUsageType { DEDICATED SPOT_MARKET OWNER_OPERATOR LEASE RENTAL }
  enum TruckSegment { LTL FTL PARTIAL_LOAD EXPEDITED SPECIALIZED HAZMAT }
  enum TruckStatus { AVAILABLE ON_ROUTE MAINTENANCE OUT_OF_SERVICE RESERVED }
  enum DistanceRange { LOCAL REGIONAL LONG_HAUL ANY }
  enum DriverStatus { AVAILABLE ON_DUTY OFF_DUTY ON_LEAVE TERMINATED }
  enum DispatchStatus {
    PENDING CONFIRMED IN_TRANSIT AT_PICKUP LOADED
    AT_DELIVERY DELIVERED COMPLETED CANCELLED ON_HOLD
  }
  enum RateType { FLAT PER_MILE PER_HUNDREDWEIGHT PER_PALLET }

  type User {
    id: ID!
    email: String!
    name: String
    role: UserRole!
    companyId: ID
    createdAt: DateTime!
  }

  type Company {
    id: ID!
    name: String!
    dotNumber: String
    mcNumber: String
    address: String
    city: String
    state: String
    zip: String
    country: String!
    phone: String
    email: String
    website: String
    logoUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CompanyInput {
    name: String!
    dotNumber: String
    mcNumber: String
    address: String
    city: String
    state: String
    zip: String
    country: String
    phone: String
    email: String
    website: String
    logoUrl: String
  }

  type Truck {
    id: ID!
    companyId: ID!
    unitNumber: String!
    make: String
    model: String
    year: Int
    vin: String
    licensePlate: String
    licensePlateState: String
    color: String
    size: TruckSize!
    usageType: TruckUsageType!
    segment: TruckSegment!
    status: TruckStatus!
    loadCapacityLbs: Float
    maxWeightLbs: Float
    lengthFt: Float
    widthFt: Float
    heightFt: Float
    distanceRange: DistanceRange!
    notes: String
    licenses: [TruckLicense!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input TruckInput {
    unitNumber: String!
    make: String
    model: String
    year: Int
    vin: String
    licensePlate: String
    licensePlateState: String
    color: String
    size: TruckSize!
    usageType: TruckUsageType!
    segment: TruckSegment!
    loadCapacityLbs: Float
    maxWeightLbs: Float
    lengthFt: Float
    widthFt: Float
    heightFt: Float
    distanceRange: DistanceRange!
    notes: String
  }

  input TruckFiltersInput {
    size: TruckSize
    usageType: TruckUsageType
    segment: TruckSegment
    status: TruckStatus
    distanceRange: DistanceRange
    search: String
  }

  type TruckLicense {
    id: ID!
    truckId: ID!
    licenseType: String!
    licenseNumber: String
    issuedBy: String
    issuedAt: DateTime
    expiresAt: DateTime
    documentUrl: String
    notes: String
    createdAt: DateTime!
  }

  input TruckLicenseInput {
    licenseType: String!
    licenseNumber: String
    issuedBy: String
    issuedAt: DateTime
    expiresAt: DateTime
    documentUrl: String
    notes: String
  }

  type Driver {
    id: ID!
    companyId: ID!
    firstName: String!
    lastName: String!
    fullName: String!
    email: String
    phone: String
    address: String
    city: String
    state: String
    zip: String
    licenseNumber: String
    licenseState: String
    licenseClass: String
    licenseExpiry: DateTime
    status: DriverStatus!
    hireDate: DateTime
    assignedTruckId: ID
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input DriverInput {
    firstName: String!
    lastName: String!
    email: String
    phone: String
    address: String
    city: String
    state: String
    zip: String
    licenseNumber: String
    licenseState: String
    licenseClass: String
    licenseExpiry: DateTime
    hireDate: DateTime
    assignedTruckId: ID
    notes: String
  }

  type Client {
    id: ID!
    companyId: ID!
    name: String!
    contactName: String
    email: String
    phone: String
    address: String
    city: String
    state: String
    zip: String
    country: String!
    billingName: String
    billingAddress: String
    billingCity: String
    billingState: String
    billingZip: String
    billingEmail: String
    paymentTerms: String
    creditLimit: Float
    notes: String
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input ClientInput {
    name: String!
    contactName: String
    email: String
    phone: String
    address: String
    city: String
    state: String
    zip: String
    country: String
    billingName: String
    billingAddress: String
    billingCity: String
    billingState: String
    billingZip: String
    billingEmail: String
    paymentTerms: String
    creditLimit: Float
    notes: String
  }

  type DispatchOrder {
    id: ID!
    orderNumber: String!
    companyId: ID!
    truck: Truck
    driver: Driver
    client: Client
    originAddress: String!
    originCity: String!
    originState: String!
    originZip: String
    destAddress: String!
    destCity: String!
    destState: String!
    destZip: String
    distanceMiles: Float
    pickupAt: DateTime
    deliveryAt: DateTime
    actualPickupAt: DateTime
    actualDeliveryAt: DateTime
    loadDescription: String
    weightLbs: Float
    pieces: Int
    pallets: Int
    hazmat: Boolean!
    hazmatClass: String
    specialInstructions: String
    referenceNumber: String
    rate: Float
    rateType: RateType!
    fuelSurcharge: Float
    totalCharge: Float
    driverPay: Float
    status: DispatchStatus!
    notes: String
    statusHistory: [DispatchStatusEvent!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DispatchStatusEvent {
    id: ID!
    status: DispatchStatus!
    note: String
    occurredAt: DateTime!
  }

  input DispatchOrderInput {
    truckId: ID
    driverId: ID
    clientId: ID
    originAddress: String!
    originCity: String!
    originState: String!
    originZip: String
    destAddress: String!
    destCity: String!
    destState: String!
    destZip: String
    distanceMiles: Float
    pickupAt: DateTime
    deliveryAt: DateTime
    loadDescription: String
    weightLbs: Float
    pieces: Int
    pallets: Int
    hazmat: Boolean
    hazmatClass: String
    specialInstructions: String
    referenceNumber: String
    rate: Float
    rateType: RateType
    fuelSurcharge: Float
    totalCharge: Float
    driverPay: Float
    notes: String
  }

  input DispatchFiltersInput {
    status: DispatchStatus
    truckId: ID
    driverId: ID
    clientId: ID
    search: String
  }

  type PageInfo {
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
  }

  type TruckConnection {
    nodes: [Truck!]!
    pageInfo: PageInfo!
  }

  type DriverConnection {
    nodes: [Driver!]!
    pageInfo: PageInfo!
  }

  type ClientConnection {
    nodes: [Client!]!
    pageInfo: PageInfo!
  }

  type DispatchConnection {
    nodes: [DispatchOrder!]!
    pageInfo: PageInfo!
  }

  type DashboardStats {
    totalTrucks: Int!
    availableTrucks: Int!
    trucksOnRoute: Int!
    totalDrivers: Int!
    availableDrivers: Int!
    activeDispatches: Int!
    completedThisMonth: Int!
    revenueThisMonth: Float!
    pendingOrders: Int!
  }

  type AuthPayload {
    user: User!
    token: String
  }

  input SignUpInput {
    email: String!
    password: String!
    name: String
  }

  type Query {
    me: User
    company: Company
    dashboardStats: DashboardStats!
    trucks(filters: TruckFiltersInput, page: Int, pageSize: Int): TruckConnection!
    truck(id: ID!): Truck
    truckLicenses(truckId: ID!): [TruckLicense!]!
    drivers(status: DriverStatus, search: String, page: Int, pageSize: Int): DriverConnection!
    driver(id: ID!): Driver
    clients(search: String, isActive: Boolean, page: Int, pageSize: Int): ClientConnection!
    client(id: ID!): Client
    dispatchOrders(filters: DispatchFiltersInput, page: Int, pageSize: Int): DispatchConnection!
    dispatchOrder(id: ID!): DispatchOrder
    recentDispatchOrders(limit: Int): [DispatchOrder!]!
  }

  type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    upsertCompany(input: CompanyInput!): Company!
    createTruck(input: TruckInput!): Truck!
    updateTruck(id: ID!, input: TruckInput!): Truck!
    deleteTruck(id: ID!): Boolean!
    updateTruckStatus(id: ID!, status: TruckStatus!): Truck!
    addTruckLicense(truckId: ID!, input: TruckLicenseInput!): TruckLicense!
    deleteTruckLicense(id: ID!): Boolean!
    createDriver(input: DriverInput!): Driver!
    updateDriver(id: ID!, input: DriverInput!): Driver!
    deleteDriver(id: ID!): Boolean!
    assignDriverToTruck(driverId: ID!, truckId: ID): Driver!
    createClient(input: ClientInput!): Client!
    updateClient(id: ID!, input: ClientInput!): Client!
    deleteClient(id: ID!): Boolean!
    createDispatchOrder(input: DispatchOrderInput!): DispatchOrder!
    updateDispatchOrder(id: ID!, input: DispatchOrderInput!): DispatchOrder!
    deleteDispatchOrder(id: ID!): Boolean!
    updateDispatchStatus(id: ID!, status: DispatchStatus!, note: String): DispatchOrder!
  }
`;
