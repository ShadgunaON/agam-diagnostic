require('dotenv').config();
process.env.DYNAMODB_TABLE_NAME = 'agam-data-dev';
const patientRepo = require('./src/repositories/dynamo-patient');
const bookingRepo = require('./src/repositories/dynamo-booking');

async function test() {
  try {
    console.log('Testing Patient Creation...');
    const p1 = await patientRepo.create({
      id: 'test_pat_1',
      fullName: 'Test Patient',
      email: 'test@example.com'
    });
    console.log('Patient Created:', p1.id);

    console.log('Testing Patient Get...');
    const p2 = await patientRepo.getById('test_pat_1');
    console.log('Patient retrieved:', p2.id === 'test_pat_1');

    console.log('Testing Patient Update...');
    await patientRepo.update('test_pat_1', { fullName: 'Updated Test' });
    const p3 = await patientRepo.getById('test_pat_1');
    console.log('Patient updated:', p3.fullName === 'Updated Test');

    console.log('Testing Patient GetAll...');
    const all = await patientRepo.getAll();
    console.log('Total patients:', all.length);

    console.log('Testing Booking Creation...');
    const b1 = await bookingRepo.create({
      id: 'test_book_1',
      patientId: 'test_pat_1',
      status: 'pending',
      scheduledDate: new Date().toISOString()
    });
    console.log('Booking Created:', b1.id);

    console.log('Testing Booking Get By Patient...');
    const patientBookings = await bookingRepo.getByPatientId('test_pat_1');
    console.log('Patient bookings count:', patientBookings.length);

    console.log('Testing Booking Update Status...');
    await bookingRepo.updateStatus('test_book_1', 'confirmed');
    
    console.log('Testing Booking Update Payment...');
    await bookingRepo.updatePaymentStatus('test_book_1', 'paid');
    
    const b2 = await bookingRepo.getById('test_book_1');
    console.log('Booking updated:', b2.status === 'confirmed' && b2.paymentStatus === 'paid');

    console.log('Testing Booking GetAll/Recent...');
    const recent = await bookingRepo.getRecent();
    console.log('Recent bookings count:', recent.length);
    
    console.log('ALL TESTS PASS');
  } catch (err) {
    console.error('TEST FAILED', err);
  }
}

test();
