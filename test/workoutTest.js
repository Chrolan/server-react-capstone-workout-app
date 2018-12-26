const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require('jsonwebtoken');
const { app, runServer, closeServer } = require("../server");
const { User } = require('../users');
const { DATABASE_URL, JWT_SECRET } = require('../config');
const mongoose = require('mongoose');

const expect = chai.expect;

chai.use(chaiHttp);

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe("workouts", function() {
  const username = 'jkleriga';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  const email = 'jordikleriga@gmail.com';

  before(function() {
    return runServer(DATABASE_URL);
  });
    before(function() {
    return tearDownDb();
  });
  before(function() {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName,
        email
      })
    );
  });

  after(function() {
    return User.remove({});
  });
    after(function() {
    return tearDownDb();
  });
  after(function() {
    return closeServer();
  });

  let token = jwt.sign({
      user: {
        username,
        firstName,
        lastName
      },
    }, JWT_SECRET, {
      algorithm: 'HS256',
      subject: username,
      expiresIn: '7d'
    });

      // test strategy:
  //  1. make a POST request with data for a new item
  //  2. inspect response object and prove it has right
  //  status code and that the returned object has an `id`
  it("should add an item on POST", function() {
    const newItem = {
        name: 'example workout',
        date: Date.now(),
        exercises: [
            {name: 'bench press'},
            {name: 'chest fly'}
        ]
    };
    return chai
      .request(app)
      .post("/workouts")
      .send(newItem)
      .set('authorization', `Bearer ${token}`)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("object");
        expect(res.body).to.include.keys('name', 'date', 'exercises');
        expect(res.body.id).to.not.equal(null);
      });
  });


    // test strategy:
  //   1. make request to `/workouts`
  //   2. inspect response object and prove has right code and have
  //   right keys in response object.
  it("should list items on GET", function() {
    return chai
      .request(app)
      .get("/workouts")
      .set('authorization', `Bearer ${token}`)
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("object");

        expect(res.body.workouts.length).to.be.at.least(1);

        const expectedKeys = ['name', 'date', 'exercises'];
        res.body.workouts.forEach(function(item) {
          expect(item).to.be.a("object");
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  // test strategy:
  //  1. initialize some update data (we won't have an `id` yet)
  //  2. make a GET request so we can get an item to update
  //  3. add the `id` to `updateData`
  //  4. Make a PUT request with `updateData`
  //  5. Inspect the response object to ensure it
  //  has right status code and that we get back an updated
  //  item with the right data in it.
  it("should update items on PUT", function() {
    const updateData = {
        name: 'example workout',
        date: Date.now(),
        exercises: [
            {name: 'lat pull downs'},
            {name: 'push ups'}
        ]
    };
    return (
      chai
        .request(app)
        .get("/workouts")
        .set('authorization', `Bearer ${token}`)
        .then(function(res) {
          updateData._id = res.body.workouts[0]._id;
          return chai
            .request(app)
            .put(`/workouts/${updateData._id}`)
            .send(updateData)
            .set('authorization', `Bearer ${token}`)
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        })
    );
  });

  // test strategy:
  //  1. GET shopping list items so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204
  it("should delete items on DELETE", function() {
    return (
      chai
        .request(app)
        .get("/workouts")
        .set('authorization', `Bearer ${token}`)
        .then(function(res) {
          return chai.request(app).delete(`/workouts/${res.body.workouts[0]._id}`).set('authorization', `Bearer ${token}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
        })
    );
  });
});