/* global describe, it, before */

import chai from 'chai';
import {Cat, Dog} from '../lib/admin-on-rest.js';

chai.expect();

const expect = chai.expect;

let lib;

describe('Given an instance of my Cat admin-on-rest', () => {
  before(() => {
    lib = new Cat();
  });
  describe('when I need the name', () => {
    it('should return the name', () => {
      expect(lib.name).to.be.equal('Cat');
    });
  });
});

describe('Given an instance of my Dog admin-on-rest', () => {
  before(() => {
    lib = new Dog();
  });
  describe('when I need the name', () => {
    it('should return the name', () => {
      expect(lib.name).to.be.equal('Dog');
    });
  });
});
