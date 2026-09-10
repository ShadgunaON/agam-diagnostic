const fs = require('fs');
let schema = fs.readFileSync('infrastructure/schema.graphql', 'utf8');

const missingQueries = \
  # Catalog Queries
  catalogTests(page: Int, limit: Int, q: String): CatalogTestsConnection!
  catalogPackages(page: Int, limit: Int, q: String): CatalogPackagesConnection!
  catalogServices(page: Int, limit: Int, q: String): CatalogServicesConnection!
  testBySlug(slug: String!): TestItem
  packageBySlug(slug: String!): PackageItem
  serviceBySlug(slug: String!): ServiceItem
  
  # Blog Queries
  blogs(page: Int, limit: Int, status: String): BlogConnection!
  blogById(id: String!): BlogItem
  
  # Patient Queries
  mePatient: Patient
  patientById(id: ID!): Patient
  patients(limit: Int, cursor: String, search: String): PatientConnection!
  
  # Booking Queries
  bookingsByPatient(patientId: ID!): [Booking!]!
  recentBookings(limit: Int): [Booking!]!
  
  # Collection Queries
  collectionById(id: ID!): CollectionTask
  collectionsByPatient(patientId: ID!): [CollectionTask!]!
  collections(limit: Int, cursor: String, status: String, search: String): CollectionConnection!
  
  # Report Queries
  reportById(id: ID!): Report
  reportsByPatient(patientId: ID!): [Report!]!
  
  # Invoice Queries
  invoicesByPatient(patientId: ID!): [Invoice!]!
  
  # Document Queries
  documents(entityType: String, entityId: ID): [DocumentItem!]!
  documentById(id: ID!): DocumentItem
  documentDownloadUrl(id: ID!): String!
  
  # Review Queries
  reviewById(id: ID!): Review
  reviewsByPatient(patientId: ID!): [Review!]!
  reviewByBooking(bookingId: ID!): Review
  publicReviews(limit: Int): [Review!]!
  allReviews(limit: Int, cursor: String): ReviewConnection!
  
  # Newsletter
  newsletterSubscribers(limit: Int, cursor: String): SubscriberConnection!
\;

const missingMutations = \
  # Catalog Mutations
  createCatalogTest(input: String!): TestItem!
  updateCatalogTest(id: ID!, input: String!): TestItem!
  updateCatalogTestStatus(id: ID!, status: String!): Boolean!
  deleteCatalogTest(id: ID!): Boolean!
  
  createCatalogPackage(input: String!): PackageItem!
  updateCatalogPackage(id: ID!, input: String!): PackageItem!
  updateCatalogPackageStatus(id: ID!, status: String!): Boolean!
  deleteCatalogPackage(id: ID!): Boolean!
  
  createCatalogService(input: String!): ServiceItem!
  updateCatalogService(id: ID!, input: String!): ServiceItem!
  updateCatalogServiceStatus(id: ID!, status: String!): Boolean!
  deleteCatalogService(id: ID!): Boolean!
  
  # Blog Mutations
  createBlog(input: String!): BlogItem!
  updateBlog(id: ID!, input: String!): BlogItem!
  deleteBlog(id: ID!): Boolean!
  
  # Patient Mutations
  createPatient(input: String!): Patient!
  updatePatient(id: ID!, input: String!): Patient!
  
  # Booking Mutations
  createBooking(input: String!): Booking!
  updateBookingStatus(id: ID!, status: String!): Boolean!
  updateBookingPaymentStatus(id: ID!, status: String!): Boolean!
  
  # Collection Mutations
  createCollection(input: String!): CollectionTask!
  updateCollection(id: ID!, input: String!): CollectionTask!
  
  # Report Mutations
  createReportTask(input: String!): Report!
  updateReportStatus(id: ID!, status: String!, results: String): Boolean!
  
  # Invoice Mutations
  createInvoice(input: String!): Invoice!
  updateInvoiceStatus(id: ID!, status: String!): Boolean!
  updateInvoicePaymentMethod(id: ID!, method: String!): Boolean!
  updateInvoice(id: ID!, input: String!): Invoice!
  
  # Document Mutations
  initiateDocumentUpload(input: String!): DocumentUploadResponse!
  completeDocumentUpload(id: ID!): DocumentItem!
  
  # Newsletter Mutations
  newsletterSubscribe(email: String!): Boolean!
\;

const missingTypes = \
type CatalogTestsConnection { data: [TestItem!]!, meta: PaginationMeta! }
type CatalogPackagesConnection { data: [PackageItem!]!, meta: PaginationMeta! }
type CatalogServicesConnection { data: [ServiceItem!]!, meta: PaginationMeta! }
type BlogConnection { data: [BlogItem!]!, meta: PaginationMeta! }
type PatientConnection { data: [Patient!]!, meta: PaginationMeta! }
type ReviewConnection { data: [Review!]!, meta: PaginationMeta! }
type SubscriberConnection { data: [Subscriber!]!, meta: PaginationMeta! }

type PaginationMeta { total: Int!, page: Int!, limit: Int!, totalPages: Int! }

type BlogItem {
  id: ID!
  slug: String!
  title: String!
  excerpt: String
  content: String
  author: String
  status: String!
  createdAt: String
  updatedAt: String
  coverImage: String
}

type DocumentItem {
  id: ID!
  entityType: String!
  entityId: ID!
  title: String!
  type: String!
  url: String!
  createdAt: String
  uploadedBy: String
}

type DocumentUploadResponse {
  id: ID!
  uploadUrl: String!
}

type Subscriber {
  id: ID!
  email: String!
  subscribedAt: String!
  status: String
}
\;

// Inject into schema
schema = schema.replace('type Query {', 'type Query {\\n' + missingQueries);
schema = schema.replace('type Mutation {', 'type Mutation {\\n' + missingMutations);
schema = schema + '\\n' + missingTypes;

// Apply AppSync Auth Directives
const publicQueries = [
  'catalogTests', 'catalogPackages', 'catalogServices',
  'testBySlug', 'packageBySlug', 'serviceBySlug',
  'blogs', 'blogById', 'publicReviews', 'globalSearch'
];

for (const q of publicQueries) {
  const regex = new RegExp('(\\\\s*' + q + '\\\\([^\\\\)]*\\\\):[^\\\\n]+)');
  schema = schema.replace(regex, '\\ @aws_api_key @aws_cognito_user_pools');
}

// Add adminRoles auth directive too to enforce cognito only (which it is by default, but let's be explicit)
schema = schema.replace(/(\\s*adminRoles:\\s*\\[Role!\\]!)/, '\\ @aws_cognito_user_pools');

fs.writeFileSync('infrastructure/schema.graphql', schema);