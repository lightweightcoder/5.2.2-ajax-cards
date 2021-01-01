import db from './models/index.mjs';

// import your controllers here
import games from './controllers/games.mjs';

export default function routes(app) {
  const GamesController = games(db);

  // main page
  app.get('/', GamesController.index);

  // create a new game
  app.post('/games', GamesController.create);

  // update a game with new cards
  app.put('/games/:id/deal', GamesController.deal);
}
