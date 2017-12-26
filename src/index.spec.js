/* eslint-disable no-unused-expressions */

import sinon from 'sinon';

import { asObservable } from '.';

const delay = (t = 1) => new Promise(res => setTimeout(() => res(), t));

const getFirebaseMock = (value) => {
  const subscription = {
    callback: null
  };
  const trigger = () => {
    if (subscription.callback) {
      subscription.callback({ val: () => value });
    }
  };
  const ref = {
    on: sinon.spy((k, callback) => { subscription.callback = callback; }),
    off: sinon.spy(() => { subscription.callback = null; })
  };

  const database = {
    ref: sinon.spy(() => ref)
  };

  return {
    database: sinon.stub().returns(database),

    mocks: {
      database,
      ref,
      trigger
    }
  };
};

describe('ladda-observable-firebase', () => {
  describe('asObservable', () => {
    it('returns a ladda observable', () => {
      const value = {};
      const firebase = getFirebaseMock(value);
      const kind = 'value';
      const path = '/x';
      const observable = asObservable(() => Promise.resolve(firebase), path, kind);

      expect(observable.subscribe).to.be.a('function');

      const subscription = observable.subscribe(t => t);
      expect(subscription.unsubscribe).to.be.a('function');
    });

    describe('subscribe', () => {
      it('obtains a firebase ref at the given path', () => {
        const value = {};
        const fb = getFirebaseMock(value);
        const kind = 'value';
        const path = '/x';
        const observable = asObservable(() => Promise.resolve(fb), path, kind);

        const callback = sinon.spy();


        observable.subscribe(callback);

        return delay().then(() => {
          expect(fb.database).to.be.calledOnce;
          expect(fb.mocks.database.ref).to.be.calledWith(path);
        });
      });

      it('registers a listener at the ref', () => {
        const value = {};
        const fb = getFirebaseMock(value);
        const kind = 'value';
        const path = '/x';
        const observable = asObservable(() => Promise.resolve(fb), path, kind);

        const callback = sinon.spy();


        observable.subscribe(callback);

        return delay().then(() => {
          expect(fb.mocks.ref.on.args[0][0]).to.equal(kind);
          expect(fb.mocks.ref.on.args[0][1]).to.be.a('function');
        });
      });

      it('register the subscription fn on the ref', () => {
        const value = {};
        const fb = getFirebaseMock(value);
        const kind = 'value';
        const path = '/x';
        const observable = asObservable(() => Promise.resolve(fb), path, kind);

        const callback = sinon.spy();


        observable.subscribe(callback);

        return delay().then(() => {
          fb.mocks.trigger();

          expect(callback).to.be.calledWith(value);
        });
      });

      it('lets subscription callback know whether it is called for the first time or not', () => {
        const value = {};
        const fb = getFirebaseMock(value);
        const kind = 'value';
        const path = '/x';
        const observable = asObservable(() => Promise.resolve(fb), path, kind);

        const callback = sinon.spy();


        observable.subscribe(callback);

        return delay().then(() => {
          fb.mocks.trigger();
          expect(callback).to.be.calledOnce;
          expect(callback).to.be.calledWith(value, true);
          fb.mocks.trigger();
          expect(callback).to.be.calledTwice;
          expect(callback).to.be.calledWith(value, false);
        });
      });

      it('allows to map the ref (e.g. to add paging) ', () => {
        const value = {};
        const fb = getFirebaseMock(value);
        const kind = 'value';
        const path = '/x';

        const identitySpy = sinon.spy(t => t);
        const observable = asObservable(() => Promise.resolve(fb), path, kind, identitySpy);

        const callback = sinon.spy();


        observable.subscribe(callback);

        return delay().then(() => {
          expect(identitySpy).to.be.calledWith(fb.mocks.ref);
        });
      });


      it('allows to map the value subscribed to', () => {
        const value = {};
        const mappedValue = {};
        const fb = getFirebaseMock(value);
        const kind = 'value';
        const path = '/x';

        const mapSpy = sinon.spy(() => mappedValue);
        const observable = asObservable(() => Promise.resolve(fb), path, kind, t => t, mapSpy);

        const callback = sinon.spy();


        observable.subscribe(callback);

        return delay().then(() => {
          expect(mapSpy).not.to.be.called;
          fb.mocks.trigger();
          expect(mapSpy).to.be.calledWith(value);
          expect(callback).to.be.calledWith(mappedValue);
        });
      });
    });
  });
});

