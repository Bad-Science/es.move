function move (locator, action) {

}

class Agent {
  aync function at(environemt, action) {
    Broker.execute(environment, action);
  }

  function join(..actions) {
    return await Promise.all(actions);
  }

  function seq(..actions) {
    for (let action of actions) {
      result = await action();
    }
  }

  function run(params) {
    execute(
      // join(
      //   at('movies', function(deps) {
      //     return deps.movies.myFavoriteMovies();
      //   }),
      //   at('books', function(deps) {
      //     return deps.books.myFavoriteBook();
      //   })
      // ).at()
      this.move('movies', function () {
        let favMovie = this.$.movies.myFavoriteMovie(this.params.movieGenre);

      }, { movieGenre: this.params.movieGenre });
    )
  }
}

export default Agent;