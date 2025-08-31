const request = require('supertest');
const app = require('../server'); 
const mongoose = require('mongoose');
const User = require('../models/user');
const Availability = require('../models/availability');
const Appointment = require('../models/appointment');

// Before all tests, connect to the database and clear it
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    await Availability.deleteMany({});
    await Appointment.deleteMany({});
});

// After all tests, disconnect from the database
afterAll(async () => {
    await mongoose.disconnect();
});
describe('College Appointment System E2E Flow', () => {
  it('should successfully complete the full user flow as described in the requirements', async () => {
    
    // Step 1: Register and Authenticate Users
    // Register Professor P1
    const resP1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Professor P1', email: 'p1@test.com', password: 'password123', role: 'professor' });
    expect(resP1.statusCode).toBe(201);
    professorToken = resP1.body.token;
    professorId = resP1.body._id;

    // Register Student A1
    const resA1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Student A1', email: 'a1@test.com', password: 'password123', role: 'student' });
    expect(resA1.statusCode).toBe(201);
    studentA1Token = resA1.body.token;
    studentA1Id = resA1.body._id;
    
    // Register Student A2
    const resA2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Student A2', email: 'a2@test.com', password: 'password123', role: 'student' });
    expect(resA2.statusCode).toBe(201);
    studentA2Token = resA2.body.token;
    studentA2Id = resA2.body._id;

    // Step 2: Professor P1 specifies availability
    const resAvailability = await request(app)
      .post(`/api/professors/${professorId}/availability`)
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ date: '2025-10-26', startTime: '10:00 AM', endTime: '11:00 AM' });
    expect(resAvailability.statusCode).toBe(201);
    availableSlotId = resAvailability.body._id;
    
    // Step 3: Student A1 views available slots for P1
    const resViewSlots = await request(app)
      .get(`/api/students/professors/${professorId}/availability`)
      .set('Authorization', `Bearer ${studentA1Token}`);
    expect(resViewSlots.statusCode).toBe(200);
    expect(resViewSlots.body.length).toBe(1);
    expect(resViewSlots.body[0]._id).toBe(availableSlotId);

    // Step 4: Student A1 books an appointment with P1
    const resBookA1 = await request(app)
      .post(`/api/students/appointments`)
      .set('Authorization', `Bearer ${studentA1Token}`)
      .send({ professorId: professorId, availabilityId: availableSlotId });
    expect(resBookA1.statusCode).toBe(201);
    expect(resBookA1.body.student).toBe(studentA1Id);
    appointmentIdForA1 = resBookA1.body._id;

    // Step 5: Student A2 books a different appointment
    // First, P1 must create a second slot
    const resAvailability2 = await request(app)
      .post(`/api/professors/${professorId}/availability`)
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ date: '2025-10-26', startTime: '11:00 AM', endTime: '12:00 PM' });
    expect(resAvailability2.statusCode).toBe(201);
    const availableSlotId2 = resAvailability2.body._id;
    
    //  <-------------- Now A2 books the second slot --------------> //

    const resBookA2 = await request(app)
      .post(`/api/students/appointments`)
      .set('Authorization', `Bearer ${studentA2Token}`)
      .send({ professorId: professorId, availabilityId: availableSlotId2 });
    expect(resBookA2.statusCode).toBe(201);
    expect(resBookA2.body.student).toBe(studentA2Id);

    //  <------------- Step 6: Professor P1 cancels the appointment with Student A1 ------------->//

    const resCancelA1 = await request(app)
      .delete(`/api/professors/appointments/${appointmentIdForA1}/cancel`)
      .set('Authorization', `Bearer ${professorToken}`);
    expect(resCancelA1.statusCode).toBe(200);
    expect(resCancelA1.body.message).toBe('Appointment cancelled successfully');

    // <----------- Step 7: Student A1 checks their appointments ---------->//

    const resCheckA1 = await request(app)
      .get(`/api/students/appointments`)
      .set('Authorization', `Bearer ${studentA1Token}`);
    expect(resCheckA1.statusCode).toBe(200);
    const appointmentA1 = resCheckA1.body.find(a => a._id === appointmentIdForA1);
    expect(appointmentA1.status).toBe('cancelled');
  });
});