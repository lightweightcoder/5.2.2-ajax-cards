/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Stuff
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // 1, 11, 12 ,13
      if (cardName == 1) {
        cardName = 'ace';
      } else if (cardName == 11) {
        cardName = 'jack';
      } else if (cardName == 12) {
        cardName = 'queen';
      } else if (cardName == 13) {
        cardName = 'king';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Stuff
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function games(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };

  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    // deal out a new shuffled deck for this game.
    const deck = shuffleCards(makeDeck());

    const newGame = {
      cards: {
        playerHand: [deck.pop(), deck.pop()],
        deck,
      },
    };

    try {
      // run the DB INSERT query
      const game = await db.Game.create(newGame);
      console.log(game);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        cards: {
          playerHand: game.cards.playerHand,
        },
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // deal two new cards from the deck.
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);
      console.log('deck length before pop', game.cards.deck.length);
      console.log('previous deck length before pop', game.previous('cards').deck.length);

      // make changes to the object
      const playerHand = [game.cards.deck.pop(), game.cards.deck.pop()];
      /** make playerHand a constant to see if game.update still works if only deck changed -- result: update doesnt work */
      // const playerHand = 1;
      // game.cards.deck.pop();
      console.log('previous deck length after pop', game.previous('cards').deck.length);
      console.log('has game entry changed after pop', game.changed()); // false
      /** if game.cards.playerHand = playerHand is done, update doesn't work */
      // game.cards.playerHand = playerHand;
      // console.log('has game entry changed after changing playerHand', game.changed()); // false
      const { deck } = game.cards;
      console.log('popped deck length', deck.length);

      // update the game with the new info
      await game.update({
        cards: {
          playerHand,
          deck,
        },
      });

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        // cards: {
        //   playerHand: game.cards.playerHand,
        // },
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
  };
}
