const identity = t => t;

const getRef = (firebase, path) => firebase.database().ref(path);

export const asObservable = (getFirebase, path, kind, mapRef = identity, mapValue = identity) => {
  const state = {
    unsubscribed: false,
    ref: null,
    firstCall: true
  };

  return {
    subscribe: fn => {
      getFirebase
        .then(f => getRef(f, path))
        .then(mapRef)
        .then(ref => {
          state.ref = ref;
          if (state.unsubscribed) {
            return;
          }

          ref.on(kind, snapshot => {
            fn(mapValue(snapshot.val()), state.firstCall);
            state.firstCall = false;
          });
        });

      return {
        unsubscribe: () => {
          state.unsubscribed = true;
          if (state.ref) {
            state.ref.off('value');
          }
        }
      };
    }
  };
};

export const asObservableValue = (getFirebase, path, mapRef = identity, mapValue = identity) =>
  asObservable(getFirebase, path, 'value', mapRef, mapValue);

