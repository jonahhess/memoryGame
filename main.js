(() => {
  class MemoryGame {
    #constants;
    #dom;
    #state;

    constructor() {
      this.#constants = {
        pairs: 6,
        maxPokemonId: 1025,
        baseUrl:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/",
      };

      this.#dom = {
        board: document.getElementById("board"),
        attempts: document.getElementById("tries"),
        found: document.getElementById("successes"),
        score: document.getElementById("high-score"),
        reset: document.getElementById("reset"),
        winText: document.getElementById("win-text"),
      };

      this.#state = {
        pokemonIds: this.#generatePokemonIds(),
        selectedCards: [],
        tries: 0,
        successes: 0,
        highScore: 0,
      };

      this.#dom.reset.onclick = () => this.#initState();
      this.#initState();
    }

    #generatePokemonIds() {
      const idSet = new Set();
      while (idSet.size < this.#constants.pairs) {
        idSet.add(Math.floor(Math.random() * this.#constants.maxPokemonId) + 1);
      }
      return Array.from(idSet);
    }

    #shuffleCards(array) {
      return array
        .map((item) => ({
          item,
          key: crypto.getRandomValues(new Uint32Array(1))[0],
        }))
        .sort((a, b) => a.key - b.key)
        .map(({ item }) => item);
    }

    #createCard(pokemonId) {
      const card = document.createElement("button");
      card.classList.add("card");

      const img = document.createElement("img");
      img.src = `${this.#constants.baseUrl}${pokemonId}.png`;
      card.appendChild(img);

      return card;
    }

    #renderScore() {
      this.#dom.attempts.innerHTML = `Tries: ${this.#state.tries}`;
      this.#dom.found.innerHTML = `Pairs found: ${this.#state.successes}`;

      if (this.#state.successes >= this.#constants.pairs) {
        this.#dom.winText.style.visibility = "visible";

        const potentialHighScore =
          (this.#state.successes / this.#state.tries) * 100;

        if (
          Number.isFinite(potentialHighScore) &&
          potentialHighScore > this.#state.highScore
        ) {
          this.#state.highScore = potentialHighScore;
          this.#dom.score.innerHTML = `High Score: ${+this.#state.highScore.toFixed(2)} %`;
          this.#playHighScoreAnimation();
        }
      } else {
        this.#dom.winText.style.visibility = "hidden";
      }
    }

    #playHighScoreAnimation() {
      this.#dom.score.classList.remove("new-high-score");
      // Force reflow so repeated wins can retrigger the animation class.
      void this.#dom.score.offsetWidth;
      this.#dom.score.classList.add("new-high-score");
    }

    #handleSelect(card) {
      if (this.#state.selectedCards.length >= 2) {
        this.#initState();
        return;
      }

      card.classList.add("selected");
      card.classList.remove("card");
      this.#state.selectedCards.push(card);
    }

    #handleUnselect(card) {
      card.classList.add("card");
      card.classList.remove("selected");
    }

    #handleFind(card) {
      card.onclick = null;
      card.classList.add("finished");
      card.classList.remove("selected");
    }

    #handleFoundPair(card1, card2) {
      this.#state.successes += 1;
      this.#handleFind(card1);
      this.#handleFind(card2);
    }

    #handlePairNotFound(card1, card2) {
      this.#dom.board.classList.add("blocked");
      setTimeout(() => {
        this.#handleUnselect(card1);
        this.#handleUnselect(card2);
        this.#dom.board.classList.remove("blocked");
      }, 1000);
    }

    #onCardClick(card) {
      if (
        card.classList.contains("selected") ||
        this.#dom.board.classList.contains("blocked")
      ) {
        return;
      }

      this.#handleSelect(card);
      if (this.#state.selectedCards.length < 2) {
        return;
      }

      this.#state.tries += 1;
      const [card1, card2] = this.#state.selectedCards;

      if (card1.innerHTML === card2.innerHTML) {
        this.#handleFoundPair(card1, card2);
      } else {
        this.#handlePairNotFound(card1, card2);
      }

      this.#state.selectedCards = [];
      this.#renderScore();
    }

    #initState() {
      this.#dom.winText.style.visibility = "hidden";
      this.#dom.board.innerHTML = "";
      this.#state.selectedCards = [];
      this.#state.tries = 0;
      this.#state.successes = 0;

      this.#renderScore();

      const cards = [];
      for (let i = 0; i < this.#constants.pairs; i++) {
        const pokemonId = this.#state.pokemonIds[i];
        cards.push(this.#createCard(pokemonId));
        cards.push(this.#createCard(pokemonId));
      }

      const mixedCards = this.#shuffleCards(cards);
      for (const card of mixedCards) {
        card.onclick = () => this.#onCardClick(card);
        this.#dom.board.appendChild(card);
      }
    }
  }

  new MemoryGame();
})();
