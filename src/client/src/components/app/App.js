import React, { Fragment } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// import pages
import SignIn from "../pages/signin"

function App() {
  return (
    <Fragment>
      <div className="App">

        <Router>
          <Switch>

            <Route exact path=
              {
                [
                  "/"
                ]
              } render={() => (
                <Fragment>
                  <SignIn />
                </Fragment>
              )} />

          </Switch>
        </Router>

      </div>
    </Fragment>
  )
}

export default App
