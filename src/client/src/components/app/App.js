import React, { Fragment } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// import pages
import SignIn from "../pages/signin"
import Messages from "../pages/messages"
import NewUser from "../pages/new"
import MSGShow from '../layouts/messaging/msgshow';

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
                  "/your/messages",
                ]
              } render={
                () => (
                  <Fragment>
                    <Messages />
                  </Fragment>
                )
              }
            />

            <Route exact path=
              {
                [
                  "/your/messages/:id",
                ]
              } render={
                () => (
                  <Fragment>
                    <MSGShow />
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
