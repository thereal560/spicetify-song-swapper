

(async function extension() {

  if (!(Spicetify.Player && Spicetify.Platform && Spicetify.ReactJSX)) {
    setTimeout(extension, 300);
    return;
  }

  Spicetify.Player.addEventListener('songchange', (e) => { checkTrack(); });

  getLocal();
  regReload();
  main();
})();

function main() {
  console.log('main function - awesome plugin v1')
}

async function getLocal() {

  if (!Spicetify.Platform.LocalFilesAPI) {
    setTimeout(getLocal, 300);
    return;
  }

  const local = await Spicetify.Platform?.LocalFilesAPI?.getTracks();
  localURIs = local.map(x => x.uri);
  localNames = local.map(x => x.name);
  localArtists = local.map(x => x.artists.map(y => y.name));

  for (let i = 0; i<localArtists.length; i++) {
    if (localArtists[i].toString() == '') {
      const song = localNames[i];
      const artist = song.split(' - ')[0];
      const name = song.split(' - ')[1];
      localNames[i] = name;
      localArtists[i][0] = artist;
    }
  }
}

function checkTrack() {

  const track = Spicetify.Player.data.item;
  const trackName = track.name;
  const trackArtists = track.artists.map(x => x.name);
  const trackArtistsJoined = trackArtists.join(', ');

  if (track.isLocal) { return; }

  for (let i = 0; i < localNames.length; i++) {
    if (trackName == localNames[i]) {
      if (trackArtists.includes(localArtists[i][0])) {
        Spicetify.addToQueue([{uri: localURIs[i]}]);
        Spicetify.Player.next();
        Spicetify.showNotification('Playing ' + trackName + ' by ' + trackArtistsJoined + ' from local files.');
      }
    }
  }
}

function regReload() {

  const reloadButton = new Spicetify.ContextMenu.Item(
    "Reload list of local tracks",
    reloadLocalTracks,
    checkIfLocalFiles,
    Spicetify.SVGIcons["repeat"],
    false,
  );

  reloadButton.register();
}

function reloadLocalTracks() {
  getLocal();
  Spicetify.showNotification("Reloaded local tracks.");
}

function checkIfLocalFiles(uri) {
  const uriObj = Spicetify.URI.fromString(uri[0]);
  if (uriObj.category == 'local-files') { return true; }
  return false;
}
