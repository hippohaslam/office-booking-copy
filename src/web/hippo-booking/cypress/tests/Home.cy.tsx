import React from "react";
import Home from "../../src/pages/home/Home";

describe("<Home />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Home />);
  });
});
