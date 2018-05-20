import React, { Component } from "react";
import { css } from "glamor";
import glamorous from "glamorous";

const clientId = "61023dff117c43b4a0f601ee341ed8bd";
const authorizeUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=http://localhost:3000&scope=playlist-read-private`;

class App extends Component {
  state = {
    data: {},
    playlist: {},
    tracks: [],
    token: undefined
  };
  componentDidMount() {
    const match = window.location.hash.match(/#(?:access_token)=([\S\s]*?)&/);
    if (match && match[1]) {
      this.setState({ token: match[1] }, () => {
        fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
          headers: new Headers({
            Authorization: "Bearer " + this.state.token
          })
        })
          .then(res => res.json())
          .then(json => {
            this.setState(
              {
                data: json
              },
              () => {
                if (json.items.length > 0) {
                  this.loadPlaylist(json.items[0].id)();
                }
              }
            );
          });
      });
    }
  }
  loadPlaylist = id => () => {
    const playlist = this.state.data.items.find(p => p.id === id);
    this.setState({ playlist, tracks: [] }, () => {
      fetch(playlist.tracks.href, {
        headers: new Headers({
          Authorization: "Bearer " + this.state.token
        })
      })
        .then(res => res.json())
        .then(json => {
          this.setState({
            tracks: json.items
          });
        });
    });
  };
  render() {
    const data = this.state.data;
    const playlist = this.state.playlist;
    const tracks = this.state.tracks;
    return (
      <Grid>
        <Header>Playlister</Header>
        <Sidebar>
          {data.items ? (
            <div>
              {data.items.map(playlist => (
                <Playlist
                  onClick={this.loadPlaylist(playlist.id)}
                  key={playlist.id}
                >
                  {playlist.name}
                </Playlist>
              ))}
              <p style={{ padding: "0 1rem" }}>
                <i>
                  Showing {data.items.length} of {data.total} playlists.
                </i>
              </p>
            </div>
          ) : (
            <div style={{ padding: "1rem" }}>
              <a href={authorizeUrl}>Get Access Token</a>
            </div>
          )}
        </Sidebar>
        <Main>
          {playlist.id ? (
            <div>
              <p>{playlist.name}</p>
              {tracks.length > 0
                ? tracks.map(t => (
                    <div>
                      <a key={t.track.id} href={t.track.uri}>
                        {t.track.name}
                      </a>
                    </div>
                  ))
                : null}
            </div>
          ) : null}
        </Main>
      </Grid>
    );
  }
}

export default App;

css.global("html, body", {
  fontFamily: "Menlo, monospace",
  padding: 0,
  margin: 0
});

const Grid = glamorous.div({
  display: "grid",
  gridTemplateRows: "4rem calc(100vh - 4rem)",
  gridTemplateColumns: "20rem auto",
  gridTemplateAreas: `
    "header header"
    "playlists tracks"
    `
});

const Header = glamorous.header({
  gridArea: "header",
  padding: "1rem",
  fontSize: "1.5rem",
  borderBottom: "1px solid gainsboro"
});

const Sidebar = glamorous.div({
  gridArea: "playlists",
  borderRight: "1px solid gainsboro",
  overflow: "auto"
});

const Main = glamorous.div({
  gridArea: "tracks",
  padding: "1rem",
  overflow: "auto"
});

const Playlist = glamorous.div({
  padding: "0.5rem",
  background: "gainsboro",
  margin: "0.25rem",
  userSelect: "none",
  ":hover": {
    background: "darkgray"
  }
});
