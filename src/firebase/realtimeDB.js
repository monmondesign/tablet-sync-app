import { ref, set, onValue, remove } from "firebase/database";
import { db } from "./config";

export function setSelectionA(image) {
  return set(ref(db, "session/selectionA"), {
    id: image.id, file: image.file, label: image.label, src: image.src, updatedAt: Date.now(),
  });
}

export function listenSelectionA(callback) {
  return onValue(ref(db, "session/selectionA"), (snapshot) => {
    callback(snapshot.val());
  });
}

export function setSelectionB(image) {
  return set(ref(db, "session/selectionB"), {
    id: image.id, file: image.file, label: image.label, src: image.src, updatedAt: Date.now(),
  });
}

export function listenSelectionB(callback) {
  return onValue(ref(db, "session/selectionB"), (snapshot) => {
    callback(snapshot.val());
  });
}

export function setSelectionC(image) {
  return set(ref(db, "session/selectionC"), {
    id: image.id, file: image.file, label: image.label, src: image.src, updatedAt: Date.now(),
  });
}

export function resetSession() {
  return remove(ref(db, "session"));
}

export function listenReset(callback) {
  return onValue(ref(db, "resetSignal"), (snapshot) => {
    callback(snapshot.val());
  });
}

export function triggerReset() {
  return set(ref(db, "resetSignal"), { t: Date.now(), r: Math.random() });
}