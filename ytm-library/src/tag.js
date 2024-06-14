class tag {
    constructor(track_id, title, artist, album, album_id, genre, copyright, time, file) {
      this.track_id = track_id;
      this.title = title;
      this.artist = artist;
      this.album = album;
      this.album_id = album_id;
      this.genre = genre;
      this.copyright = copyright;
      this.time = time;
      this.file = file;
    }
}
  
module.exports = tag;
  