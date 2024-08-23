import React from "react";
import Parking from "../../src/pages/parking-booking/parking";

describe("<Parking />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Parking />);
  });
});
