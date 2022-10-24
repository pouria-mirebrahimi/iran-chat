import React, { Fragment } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// import pages
import SignIn from "../pages/signin"
import NewUser from "../pages/new"

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

            <Route exact path=
              {
                [
                  "/your/name"
                ]
              } render={
                () => (
                  <Fragment>
                    <NewUser />
                  </Fragment>
                )
              }
            />

            <Route exact path=
              {
                [
                  "/your/messages"
                ]
              } render={
                () => (
                  <Fragment>
                    <div>messages</div>
                  </Fragment>
                )
              }
            />

            <Route
              path='*'
              exact={true}
              component={SignIn}
            />

          </Switch>
        </Router>

      </div>
    </Fragment>
  )
}

export default App
