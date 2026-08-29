/* ============================================================
   OMS v3 — Application store: one small pub/sub state object.
   Page-level components own their own re-render for local state
   (filters, wizard steps) and only reach into here for the
   cross-cutting stuff: which person's lens we're viewing through,
   which route we're on, which deal is selected.
   ============================================================ */
(function (OMS) {
  "use strict";

  var listeners = [];
  var state = {
    personId: OMS.data.CURRENT_PERSON_ID,
    route: "dashboard",           // "dashboard" | "deals" | "dealDetail"
    selectedDealId: null,
    dealsReturnScroll: 0
  };

  function get() { return state; }

  function set(patch) {
    state = Object.assign({}, state, patch);
    listeners.forEach(function (fn) { fn(state); });
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function unsubscribe() { listeners = listeners.filter(function (f) { return f !== fn; }); };
  }

  function currentPerson() { return OMS.data.PEOPLE_BY_ID[state.personId]; }

  function goto(route, extra) {
    set(Object.assign({ route: route }, extra || {}));
    window.scrollTo({ top: 0, behavior: OMS.utils.reduceMotion ? "auto" : "smooth" });
  }

  function openDeal(dealId) {
    set({ route: "dealDetail", selectedDealId: dealId });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function setPerson(personId) {
    set({ personId: personId, route: "dashboard", selectedDealId: null });
  }

  OMS.store = { get: get, set: set, subscribe: subscribe, currentPerson: currentPerson, goto: goto, openDeal: openDeal, setPerson: setPerson };
})(window.OMS = window.OMS || {});
