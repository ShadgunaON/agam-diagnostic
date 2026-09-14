process.env.DYNAMODB_TABLE_NAME = 'agam-data-dev';
const collectionRepo = require('./infrastructure/src/repositories/dynamo-collection');
const reportRepo = require('./infrastructure/src/repositories/dynamo-report');
const bookingRepo = require('./infrastructure/src/repositories/dynamo-booking');
const patientRepo = require('./infrastructure/src/repositories/dynamo-patient');

async function testUpdateCollection() {
  const collectionId = 'COL-1789305156796_mtas9';
  const existingCollection = await collectionRepo.getById(collectionId);
  console.log("Existing Collection:", existingCollection);
  
  if (!existingCollection) return;

  const bookingId = existingCollection.bookingId;
  let patient = null;
  if (existingCollection.patientId) {
    patient = await patientRepo.getById(existingCollection.patientId);
  }

  console.log("Patient:", patient);

  const existingReports = await reportRepo.getByPatientId(existingCollection.patientId);
  console.log("Existing Reports:", existingReports);
  
  const alreadyExists = existingReports.some(r => r.bookingId === bookingId);
  console.log("Already Exists:", alreadyExists);

  if (!alreadyExists) {
    const reportData = {
      id: `REP-${bookingId.replace('bk_', '')}`,
      patientId: existingCollection.patientId,
      bookingId: bookingId,
      patient: patient ? {
        name: patient.name || 'Unknown',
        age: patient.age || 0,
        gender: patient.gender || 'Unknown',
        id: patient.id || existingCollection.patientId
      } : {
        name: typeof existingCollection.patient === 'string' ? existingCollection.patient : existingCollection.patient?.name || 'Unknown',
        age: 0,
        gender: 'Unknown',
        id: existingCollection.patientId
      },
      tests: existingCollection.tests || [],
      testType: (existingCollection.tests || []).join(', '),
      status: 'Processing',
      priority: 'Routine',
      generatedAt: new Date().toISOString()
    };
    console.log("Creating report:", reportData);
    const created = await reportRepo.create(reportData);
    console.log("Created Report:", created);
  } else {
    console.log("Report already exists. Won't create.");
  }
}

testUpdateCollection().catch(console.error);
