import React from 'react'
import FloorplanEditor from '../../src/pages/floorplan-editor/FloorplanEditor'

describe('<FloorplanEditor />', () => {
    it('renders', () => {
        // see: https://on.cypress.io/mounting-react
        cy.mount(<FloorplanEditor />)
    })
})