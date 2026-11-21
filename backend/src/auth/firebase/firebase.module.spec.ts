// @nestjs/config is an ES module that Jest cannot load in this CommonJS setup.
jest.mock('./firebase.service', () => ({
  FirebaseService: class FirebaseService {},
}));

describe('FirebaseModule', () => {

});
