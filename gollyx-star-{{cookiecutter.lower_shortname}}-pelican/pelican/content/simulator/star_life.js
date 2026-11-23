/*jslint onevar: true, undef: false, nomen: true, eqeqeq: true, plusplus: false, bitwise: true, regexp: true, newcap: true, immed: true  */

/**
 * Game of Life - JS & CSS
 * Pedro Verruma (http://pmav.eu)
 * 04 September 2010
 *
 * Major modifications by Charles Reid (https://github.com/charlesreid1)
 * 12 February 2018
 * 11 July 2019
 *
 * Major modifications by Ch4zm of Hellmouth (https://github.com/ch4zm)
 * 26 October 2020
 */

(function () {

  var realBackgroundColor = "#060606";
  var gridStrokeColor1    = "#3a3a3a";
  var mapZoneStrokeColor  = "#dddddd";
  var grays = ["#303030", "#3f3f3f", "#494949", "#525252", "#5d5d5d"];

  var GOL = {

    // http://www.mirekw.com/ca/rullex_gene.html

    // Star Wars CA
    ruleParams : {
      b : [2],
      s : [3, 4, 5],
      c : 4,
      tolZero : 1e-8,
      tolStable : 1e-6,
      runningAvgMaxDim: {{cookiecutter.running_avg_max_dim}},
    },

    // // Banners
    // ruleParams : {
    //   b : [3, 4, 5, 7],
    //   s : [2, 3, 6, 7],
    //   c : 5,
    //   tolZero : 1e-8,
    //   tolStable : 1e-5,
    //   //runningAvgMaxDim: 280,
    //   runningAvgMaxDim: 220,
    // },

    // // Caterpillars
    // ruleParams : {
    //   s : [1, 2, 4, 5, 6, 7],
    //   b : [3, 7, 8],
    //   c : 4,
    //   tolZero : 1e-8,
    //   tolStable : 1e-6,
    //   runningAvgMaxDim: 280,
    // },

    // // Transer
    // ruleParams : {
    //   s : [1, 3, 4, 5, 8],
    //   b : [3, 8],
    //   c : 6,
    //   tolZero : 1e-8,
    //   tolStable : 1e-6,
    //   runningAvgMaxDim: 280,
    // },

    // Initial Conditions:
    s1Default: '[{"49":[93,94,95,97,98,100,101,144,145,146,147,148,149,151]},{"50":[94,95,96,97,98,99,100,101,143,144,147,149,150,151]},{"51":[93,96,97,98,99,100,101,144,145,146,147,148,150,151]},{"52":[93,94,95,96,97,98,99,100,101,143,144,145,146,148,149,150,151]},{"53":[93,95,96,97,98,99,100,101,143,144,145,148,149,150,151]},{"54":[93,94,96,97,98,100,101,143,145,146,147,149,150,151]},{"55":[93,94,95,96,98,99,100,101,143,144,145,146,148,151]},{"56":[93,94,95,96,97,98,100,101,144,146,147,148,149]},{"57":[93,94,95,96,97,99,100,144,145,146,148,149,150]},{"58":[93,94,96,97,99,100,101,144,145,147,150]},{"59":[93,94,96,97,98,99,100,101,143,144,145,149,150,151]},{"60":[93,94,95,96,98,99,100,143,144,145,146,147,149,151]},{"61":[93,94,95,96,97,99,100,101,143,144,146,147,148,149,150,151]},{"62":[93,94,95,96,97,98,99,100,144,145,146,148,149,150,151]},{"63":[93,94,96,97,98,99,101,147,149,150,151]},{"64":[93,94,96,97,98,99,100,143,144,145,146,147,149,150,151]},{"65":[93,97,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"66":[93,94,95,97,98,99,100,144,147,148,150,151]},{"67":[93,95,97,99,100,101,145,146,149,150,151]},{"68":[94,95,96,97,98,99,100,101,143,144,145,146,147,148,149]},{"69":[93,95,96,97,101,143,144,148,149,150,151]},{"70":[94,95,96,97,98,99,100,143,144,146,147,148,149,150,151]},{"71":[93,94,95,96,97,98,99,101,143,144,145,146,147,148,149,150]},{"72":[93,94,96,97,98,99,100,101,143,144,149,150,151]},{"73":[93,94,95,96,97,98,101,143,145,147,148,149,150]},{"74":[93,94,96,97,99,100,101,143,144,145,146,147,148,149,150,151]},{"75":[93,94,95,96,97,99,100,101,143,145,146,147,148,150,151]},{"76":[93,94,95,97,98,100,143,145,146,147,148,149,151]},{"77":[93,94,95,96,97,98,99,100,101,143,144,145,146,147,151]},{"78":[93,94,96,97,98,99,100,101,144,145,146,149,150,151]},{"79":[93,95,96,97,98,99,100,143,146,149,151]},{"80":[93,94,95,97,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"81":[93,94,95,96,97,98,99,100,101,143,144,146,147,148,149,150,151]},{"82":[93,94,95,96,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"83":[93,95,97,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"84":[93,94,95,96,97,99,100,101,144,145,146,147,148,149,151]},{"85":[94,96,97,98,99,144,145,146,147,148,149,150,151]},{"86":[93,94,95,96,97,98,99,100,101,143,145,146,147,148,149,150,151]},{"87":[94,95,96,97,98,100,101,143,144,146,147,149,151]},{"88":[93,94,95,96,97,98,99,100,143,144,145,146,147,148,149,150,151]},{"89":[93,94,96,97,98,99,100,101,144,145,147,148,149,150,151]},{"90":[98,100,143,144,145,146,147,148,149,151]},{"91":[93,94,96,97,98,99,100,101,143,144,146,147,148,149,150,151]},{"92":[93,94,95,96,97,98,99,100,101,143,144,145,147,148,149,150,151]},{"93":[93,94,95,96,97,99,100,143,144,145,146,147,148,149,150]},{"94":[93,95,96,97,98,99,100,143,145,146,147,148,149,150]},{"95":[93,94,95,96,97,98,99,100,101,143,145,146,147,148,149,150,151]},{"96":[93,94,95,96,97,98,99,100,101,143,144,145,146,147,148,149,150,151]},{"97":[94,95,96,97,98,99,100,101,144,146,147,148,149]}]',
    s2Default: '[{"47":[52,53,54,55,56,57,58,59,188,189,190,191,192,194,195,196]},{"48":[54,55,56,57,58,60,188,189,190,192,193,195,196]},{"49":[52,53,55,56,57,58,59,188,189,190,191,193,194,195,196]},{"50":[52,53,54,56,58,59,60,189,190,191,192,193,194,196]},{"51":[52,53,54,55,56,57,58,188,189,190,191,192,193,195,196]},{"52":[54,56,57,58,59,60,188,189,190,192,193,194]},{"53":[53,54,55,56,57,58,59,188,189,190,191,192,194,195]},{"54":[52,53,54,57,58,60,188,189,190,192,193,194,195,196]},{"55":[52,53,54,55,56,57,59,60,190,193,194,195,196]},{"56":[52,53,54,55,56,57,58,60,188,189,190,191,192,193,194]},{"57":[52,53,55,56,57,59,60,189,190,192,193,195]},{"58":[52,53,55,57,60,188,189,192,193,194,195,196]},{"59":[52,53,55,56,57,58,60,188,189,190,191,193,194,195,196]},{"60":[53,54,55,56,57,58,59,60,188,189,190,192,193,194,196]},{"61":[53,54,55,56,57,58,60,188,189,190,192,193,194,195,196]},{"62":[52,53,54,55,56,57,58,59,60,188,190,192,196]},{"63":[52,53,56,58,59,188,189,190,191,192,193,194,195,196]},{"64":[53,54,55,57,59,60,189,190,191,192,194,195]},{"65":[53,56,57,59,60,188,189,190,191,192,195,196]},{"66":[52,53,54,56,57,58,59,188,189,190,192,194,195]},{"67":[52,53,54,56,57,58,59,189,191,193,194,195,196]},{"68":[52,53,55,56,57,58,59,60,189,190,191,192,193,194,195,196]},{"69":[52,53,54,55,56,57,58,59,60,188,189,190,192,193,194,195,196]},{"70":[52,53,54,56,57,58,59,60,188,189,190,191,192,193,194,195,196]},{"71":[52,55,57,58,59,60,190,191,192,193,195,196]},{"72":[52,53,54,55,56,57,58,59,60,189,190,191,192,193,194,195]},{"73":[52,54,55,56,58,59,60,189,190,191,192,193,194,195,196]},{"74":[52,53,54,55,56,57,58,59,188,190,191,192,193,194,195,196]},{"75":[52,53,54,55,56,188,190,191,192,193,194,195,196]},{"76":[52,53,55,56,57,58,59,60,188,190,191,192,193,194,196]},{"77":[52,53,55,56,57,58,59,60,188,189,190,191,192,193,194,195,196]},{"78":[52,53,54,55,56,57,58,59,60,188,190,191,192,194,195]},{"79":[53,55,56,57,58,59,60,189,190,191,192,193,194,195,196]},{"80":[52,54,55,56,57,58,59,60,189,190,193,194,195]},{"81":[52,53,54,55,56,58,59,60,188,189,190,191,193,194,195]},{"82":[52,53,54,55,57,58,59,60,188,189,190,191,192,193,195,196]},{"83":[52,53,54,56,58,59,60,188,189,190,191,193,195,196]},{"84":[52,53,54,55,56,57,58,59,60,189,190,191,193,194,195]},{"85":[52,53,54,55,56,57,59,60,188,189,190,191,192,193,194,195,196]},{"86":[52,55,56,57,58,60,188,189,190,191,192,193,194,195]},{"87":[52,53,55,57,58,59,60,188,189,190,191,192,194,195]},{"88":[52,54,55,56,57,58,60,189,192,193,194,196]},{"89":[53,54,55,57,58,59,60,188,189,190,191,192,193,194,196]},{"90":[52,53,54,55,56,57,58,59,60,188,189,191,192,194,195,196]},{"91":[52,53,54,55,57,58,59,60,188,189,190,192,193,194,195]},{"92":[52,53,54,55,56,58,59,60,188,189,190,191,192,193,195]},{"93":[52,53,55,56,57,58,59,188,190,191,193,194,195,196]},{"94":[52,53,54,55,56,57,59,60,189,191,192,193,194,195,196]},{"95":[52,53,54,55,56,57,58,60,188,189,190,191,192,193,195]}]',

    // two acorns
    //s1Default: '[{"50":[60,160]},{"51":[62,162]},{"52":[59,60,63,64,65,159,160,163,164,165]}]',
    //s2Default: '[{"60":[60,160]},{"61":[62,162]},{"62":[59,60,63,64,65,159,160,163,164,165]}]',

    // Geometry:
    defaultCols: 280,
    defaultRows: 180,
    defaultCellSize: 3,

    //// Stability:
    //// Previously this was 240, but that was a bit too small for Star Wars CA
    //// If increased to 300, it never converges if oscillators are present
    //// This should be rule-specific
    //runningAvgMaxDim: 280,

    // URLs:
    baseApiUrl : getBaseApiUrl(),
    baseUIUrl : getBaseUIUrl(),
    mapsApiUrl : getMapsApiUrl(),
    // this may duplicate / between the base url and simulator
    baseSimulatorUrl : getBaseUIUrl() + '/simulator/index.html',

    simulatorDivIds : [
      'container-golly-header',
      'container-golly-controls',
      'container-canvas',
      'container-golly-frontmatter',
      'container-loading'
    ],

    // Other params
    gameMode : false,
    mapMode : false,
    sandboxMode : false,

    columns : 0,
    rows : 0,
    cellSize: 0,

    waitTimeMs: 0,
    // Hyper speed: generations run back to back per tick of the run loop
    hyperGenerations: 3,
    generation : 0,

    running : false,
    autoplay : false,

    // Cell colors
    //
    // dead/trail colors always the same
    // alive color sets are either set by the game (game mode)
    // or set by the user via the schemes (sandbox mode)
    colors : {

      ncolors: 3,

      currentScheme : 0,

      schedule : false,
      dead: realBackgroundColor,
      trail: grays,

      alive: null,
      aliveLabels: null,
      deadWait: null,


      // https://www.colorhexa.com/ffc20a-to-272b30
      schemes : [
        {
          aliveLabels: ['Orange', 'Blue', 'Referees'],
          alive:       ['#e66100', '#0c7bdc', '#ffffff'],
        },
        {
          aliveLabels: ['Yellow', 'Red', 'Referees'],
          alive: ['#ffc20a', '#dc3220', '#ffffff'],
        },
        {
          aliveLabels: ['Orange', 'Purple', 'Referees'],
          alive: ['#e66100', '#9963ab', '#ffffff'],
        },
        {
          aliveLabels: ['Bright', 'Not So Bright', 'Referees'],
          alive: ['#aaaaaa', '#666666', '#ffffff'],
        }
      ],

      getRefereeLabel : function() {
        return "Referees";
      },
    },

    // Grid style
    grid : {
      current : 1,
      mapOverlay : false,

      schemes : [
        {
          color : gridStrokeColor1,
        },
        {
          color : '', // Special case: 0px grid
        },
      ],
    },

    // information about winner/loser
    showWinnersLosers : false,
    foundVictor : false,
    runningAvgWindow : [],
    runningAvgLast3 : [0.0, 0.0, 0.0],

    // Clear state
    clear : {
      schedule : false
    },

    // Average execution times
    times : {
      algorithm : 0,
      gui : 0
    },

    // DOM elements
    element : {
      generation : null,
      livecells : null,
      liveCellsColors: [],
      livepct: null,
      teamColors: [],
      teamNames: [],
      teamRanks: [],
      mapName: null,
      mapPanel: null,
    },

    // Initial state
    // Set in loadConfig()
    initialState1 : null,
    initialState2 : null,
    initialState3 : null,

    // Trail state
    trail : {
      current: false,
      schedule : false
    },

    /**
     * On Load Event
     */
    init : function() {
      try {
        this.loading();
        this.listLife.init();   // Reset/init algorithm
        this.loadConfig();      // Load config from URL
        this.keepDOMElements(); // Keep DOM references (getElementsById)
        this.loadState();       // Load state from config
      } catch (e) {
        console.log(e);
        this.error(-1);
      }
    },

    error : function(mode) {

      // Hide elements
      for (var c in this.simulatorDivIds) {
        try {
          var elem = document.getElementById(this.simulatorDivIds[c]);
          elem.classList.add('invisible');
        } catch (e) {
          // do nothing
        }
      }

      // Show error
      var container = document.getElementById('container-error');
      container.classList.remove("invisible");

    },

    loading : function() {
      this.loadingElem = document.getElementById('container-loading');
      this.loadingElem.classList.remove('invisible');
    },

    removeLoadingElem : function() {
      this.loadingElem.classList.add('invisible');
    },

    showControlsElem : function() {
      var controls = document.getElementById('container-golly-controls');
      controls.classList.remove('invisible');
    },

    showGridElem : function() {
      var canv = document.getElementById('container-canvas');
      canv.classList.remove('invisible');
    },

    /**
     * Load config from URL
     *
     * This function loads configuration variables for later processing.
     * Here is how it works:
     * - if user provides gameId param, switch to game simulation mode
     * - if user provides no gameId param, switch to sandbox mode
     *   - if user provides map param, show map display
     *   - if user provides random param, don't show map display
     *   - if user provides s1 or s2 params, don't show map display
     *   - if user provides nothing, don't show map display
     * Any options that require data to be loaded are set elsewhere.
     */
    loadConfig : function() {
      var grid, zoom;

      // User providing gameId means we go to game mode
      this.gameId = this.helpers.getUrlParameter('gameId');

      // User NOT providing gameId means we go to sandbox mode
      // User can provide a map,
      this.patternName = this.helpers.getUrlParameter('patternName');
      // Or specify the random flag,
      this.random = parseInt(this.helpers.getUrlParameter('random'));
      // Or specify the states of the two colors
      this.s1user = this.helpers.getUrlParameter('s1');
      this.s2user = this.helpers.getUrlParameter('s2');
      // Remove ability to specify referee state by URL
      // this.s3user = this.helpers.getUrlParameter('s3');

      if (this.gameId != null) {
        // Game simulation mode with map overlay
        this.gameMode = true;
        this.grid.mapOverlay = true;

      } else if (this.patternName != null) {
        // Map mode with map overlay
        this.mapMode = true;
        this.sandboxMode = true;
        this.grid.mapOverlay = true;

      } else if (this.random == 1) {
        // Random map
        this.sandboxMode = true;
        this.grid.mapOverlay = false;

      } else if ((this.s1user != null) || (this.s2user != null)) {
        // User-provided patterns
        this.sandboxMode = true;
        this.grid.mapOverlay = false;

      } else {
        // Default patterns
        this.sandboxMode = true;
        this.grid.mapOverlay = false;

      }

      // Initialize the victor percent running average window array
      var maxDim = this.ruleParams.runningAvgMaxDim;
      // var maxDim = Math.max(2*this.columns, 2*this.rows);
      for (var i = 0; i < maxDim; i++) {
        this.runningAvgWindow[i] = 0;
      }

      // The following configuration/user variables can always be set,
      // regardless of whether in game mode, map mode, or sandbox mode

      // Initial grid config
      grid = parseInt(this.helpers.getUrlParameter('grid'), 10);
      if (isNaN(grid) || grid < 1 || grid > this.grid.schemes.length) {
        grid = 0;
      }
      this.grid.current = 1 - grid;

      // Add ?autoplay=1 to the end of the URL to enable autoplay
      this.autoplay = this.helpers.getUrlParameter('autoplay') === '1' ? true : this.autoplay;

      // Add ?trail=1 to the end of the URL to show trails
      this.trail.current = this.helpers.getUrlParameter('trail') === '1' ? true : this.trail.current;
    },

    /**
     * Load world state from config
     *
     * This method is complicated because it loads the data,
     * and a lot of other actions have to wait for the data
     * to be loaded before they can be completed.
     */
    loadState : function() {

      if (this.gameId != null) {

        // ~~~~~~~~~~ GAME MODE ~~~~~~~~~~

        // Load a game from the /game API endpoint
        let url = this.baseApiUrl + '/game/' + this.gameId;
        fetch(url)
        .then(res => res.json())
        .then((gameApiResult) => {

          // Remove loading message, show controls and grid
          this.removeLoadingElem();
          this.showControlsElem();
          this.showGridElem();

          this.gameApiResult = gameApiResult;

          // Set the game title
          var gameTitleElem = document.getElementById('golly-game-title');
          if (gameApiResult.isPostseason == true) {
            var sp1 = gameApiResult.season + 1;
            gameTitleElem.innerHTML = "Star {{cookiecutter.upper_shortname}}: " + gameApiResult.description + " <small>- S" + sp1 + "</small>";
          } else {
            var sp1 = gameApiResult.season + 1;
            var dp1 = gameApiResult.day + 1;
            var descr = "Star {{cookiecutter.upper_shortname}} Cup: Season " + sp1 + " Day " + dp1;
            gameTitleElem.innerHTML = descr;
          }

          // Determine if we know a winner/loser
          if (
            this.gameApiResult.hasOwnProperty('team1Score') &&
            this.gameApiResult.hasOwnProperty('team2Score')
          ) {
            var s1 = this.gameApiResult.team1Score;
            var s2 = this.gameApiResult.team2Score;
            this.showWinnersLosers = true;
            if (s1 > s2) {
              this.whoWon = 1;
            } else {
              this.whoWon = 2;
            }
          }

          this.setTeamNames();
          this.setColors();
          this.drawIcons();

          // Map initial conditions
          this.initialState1 = this.gameApiResult.initialConditions1;
          this.initialState2 = this.gameApiResult.initialConditions2;
          this.columns = this.gameApiResult.columns;
          this.rows = this.gameApiResult.rows;
          this.cellSize = this.gameApiResult.cellSize;
          this.mapName = this.gameApiResult.mapName;

          this.setZoomState();
          this.setInitialState();

          this.updateMapLabels();
          this.updateTeamNamesColors();
          this.updateTeamRecords();
          this.updateGameInitCounts();
          this.updateGameControls();
          this.updateWinLossLabels();

          this.canvas.init();
          this.registerEvents();
          this.prepare()

        })
        .catch(err => {
          this.error(-1);
        });
        // Done loading game from /game API endpoint

      } else if (this.patternName != null) {

        // ~~~~~~~~~~ MAP MODE ~~~~~~~~~~

        // Get user-specified rows/cols, if any
        var rows = this.getRowsFromUrlSafely();
        var cols = this.getColsFromUrlSafely();

        // Load a random map from the /map API endpoint
        let url = this.mapsApiUrl + '/map/star-{{cookiecutter.lower_shortname}}/' + this.patternName + '/r/' + this.getRowsFromUrlSafely() + '/c/' + this.getColsFromUrlSafely();
        fetch(url)
        .then(res => res.json())
        .then((mapApiResult) => {

          // Remove loading message, show controls and grid
          this.removeLoadingElem();
          this.showControlsElem();
          this.showGridElem();

          // Set the game title
          var gameTitleElem = document.getElementById('golly-game-title');
          gameTitleElem.innerHTML = "Star {{cookiecutter.upper_shortname}}: " + mapApiResult.mapName;

          this.setTeamNames();
          this.setColors();

          // Initial conditions
          this.initialState1 = mapApiResult.initialConditions1;
          this.initialState2 = mapApiResult.initialConditions2;
          this.initialState3 = mapApiResult.initialConditions3;

          this.columns = mapApiResult.columns;
          this.rows = mapApiResult.rows;
          this.cellSize = mapApiResult.cellSize;

          this.mapName = mapApiResult.mapName;

          this.setZoomState();
          this.setInitialState();

          this.updateMapLabels();
          this.updateTeamNamesColors();
          this.updateTeamRecords();
          this.updateGameInitCounts();
          this.updateGameControls();

          this.canvas.init();
          this.registerEvents();
          this.prepare()

        })
        .catch(err => {
          this.error(-1);
        });
        // Done loading pattern from /map API endpoint

      } else {

        // ~~~~~~~~~~ PLAIN OL SANDBOX MODE ~~~~~~~~~~

        this.setTeamNames();
        this.setColors();
        this.setZoomState();

        if ((this.s1user != null) || (this.s2user != null)) {
          if (this.s1user != null) {
            this.initialState1 = this.s1user;
          } else {
            this.initialState1 = [{}];
          }
          if (this.s2user != null) {
            this.initialState2 = this.s2user;
          } else {
            this.initialState2 = [{}];
          }

          // Set the game title
          var gameTitleElem = document.getElementById('golly-game-title');
          gameTitleElem.innerHTML = "Sandbox";

        } else {
          this.initialState1 = this.s1Default;
          this.initialState2 = this.s2Default;

          // Set the game title
          var gameTitleElem = document.getElementById('golly-game-title');
          gameTitleElem.innerHTML = "Sandbox";

        }
        // No ability to specify referee state by URL, and no default state
        this.initialState3 = [{}];

        // Remove loading message, show controls and grid
        this.removeLoadingElem();
        this.showControlsElem();
        this.showGridElem();

        this.setInitialState();

        this.updateMapLabels();
        this.updateTeamNamesColors();
        this.updateTeamRecords();
        this.updateGameInitCounts();
        this.updateGameControls();

        this.canvas.init();
        this.registerEvents();
        this.prepare()
      }
    },

    /**
     * Update the Game of Life with initial cell counts/stats.
     */
    updateGameInitCounts : function() {

      // Update live counts for initial state
      this.element.generation.innerHTML = '0';
      var liveCounts = this.getCounts();
      this.updateStatisticsElements(liveCounts);

      // If all cell counts are 0 to begin with, disable victory check
      this.zeroStart = false;
      var zeroScores = 0;

      ////////////////////////////////
      // hard-coded rules format
      var r;
      for (r=0; r<this.colors.ncolors-1; r++) {
        if (liveCounts.liveCellsColors[r]==0) {
          zeroScores++;
        }
      }
      // end hard-coded rules format
      ////////////////////////////////

      var shutoutConditions = (zeroScores == 1);
      if (shutoutConditions) {
        this.zeroStart = true;
      }

    },

    /**
     * Update the Game of Life scoreboard with winner/loser
     * indicators, if this is a game and we know the score.
     */
    updateWinLossLabels : function() {
      if (this.gameMode === true) {
        // Indicate winner/loser, if we know
        if (this.showWinnersLosers) {
          if (this.whoWon == 1) {
            this.element.team1winner.innerHTML = 'W';
            this.element.team2loser.innerHTML = 'L';
          } else if (this.whoWon == 2) {
            this.element.team2winner.innerHTML = 'W';
            this.element.team1loser.innerHTML = 'L';
          } else {
            // should only be here if already a victor,
            // but the user pressed clear
            this.showWinnersLosers = false;
          }
        }
      }
    },

    /**
     * Update the Game of Life controls depending on what mode we're in.
     */
    updateGameControls : function() {
      if (this.gameMode === true) {
        // In game mode, hide controls that the user won't need
        this.element.clearButton.remove();
      }
    },

    /**
     * Update map labels using loaded map label data
     */
    updateMapLabels : function() {
      if (this.grid.mapOverlay===true) {
        this.element.mapName.innerHTML = this.mapName;
      } else {
        // Remove the Map line from the scoreboard
        this.element.mapPanel.remove();
      }

    },

    /**
     * Set the names of the two teams
     */
    setTeamNames : function() {
      if (this.gameMode === true) {
        // If game mode, get team names from game API result
        this.teamNames = [this.gameApiResult.team1Name, this.gameApiResult.team2Name, this.colors.getRefereeLabel()];
      } else {
        // Use color labels
        this.teamNames = this.colors.schemes[this.colors.currentScheme].aliveLabels;
      }
    },

    /**
     * Given the team color and the grid background color,
     * calculate the background color of dead waiting cells.
     */
    interpolateDeadWaitColor : function(hexcol1, hexcol2, dw) {
      slots = (this.ruleParams.c-1);
      p = (slots-dw)/slots;

      col1 = hexcol1.slice(1,hexcol1.length);
      col2 = hexcol2.slice(1,hexcol2.length);

      const rgb1 = parseInt(col1, 16);
      const rgb2 = parseInt(col2, 16);
      
      const [r1, g1, b1] = this.toArray(rgb1);
      const [r2, g2, b2] = this.toArray(rgb2);
      
      const q = 1-p;
      const rr = Math.round(r1 * p + r2 * q);
      const rg = Math.round(g1 * p + g2 * q);
      const rb = Math.round(b1 * p + b2 * q);
      
      var result = Number((rr << 16) + (rg << 8) + rb).toString(16);
      if (result.length < 6) {
        var i;
        for (i=0; i<(6 - result.length); i++) {
          result = "0" + result;
        }
      }
      return result;
    },

    toArray : function(rgb) {
      const r = rgb >> 16;
      const g = (rgb >> 8) % 256;
      const b = rgb % 256;
    
      return [r, g, b];
    },

    /**
     * Set the default color palatte.
     * There is a default set of color pallettes that are colorblind-friendly.
     * In game mode, we insert the two teams' default colors,
     * but still allow folks to cycle through other color schemes.
     */
    setColors : function() {
      if (this.gameMode === true) {

        if (this.gameApiResult.hasOwnProperty('message')) {
          if (this.gameApiResult['message'] === 'Invalid Game ID Error') {
            throw 'Error: invalid game ID';
          }
        }

        // Modify the color schemes available:
        // - insert the teams' original color schemes in front
        // - update the labels for each color scheme to be the team names
        this.colors.schemes.unshift({
          // Hard-coded referee color
          aliveLabels : [this.gameApiResult.team1Name, this.gameApiResult.team2Name, 'Referees'],
          alive : [this.gameApiResult.team1Color, this.gameApiResult.team2Color, '#ffffff'],
          deadWait : [
            ['#' + this.interpolateDeadWaitColor(this.gameApiResult.team1Color, realBackgroundColor, 1), '#' + this.interpolateDeadWaitColor(this.gameApiResult.team2Color, realBackgroundColor, 1), '#999999'],
            ['#' + this.interpolateDeadWaitColor(this.gameApiResult.team1Color, realBackgroundColor, 2), '#' + this.interpolateDeadWaitColor(this.gameApiResult.team2Color, realBackgroundColor, 2), '#444444'],
          ],
        });
        this.colors.currentScheme = 0;
        this.colors.alive = this.colors.schemes[this.colors.currentScheme].alive;
        this.colors.deadWait = this.colors.schemes[this.colors.currentScheme].deadWait;

      } else {
        // Parse color options and pick out scheme
        this.colors.currentScheme = 0;

        this.colors.alive = this.colors.schemes[this.colors.currentScheme].alive;
        this.colors.deadWait = [
            ['#' + this.interpolateDeadWaitColor(this.colors.alive[0], realBackgroundColor, 1), '#' + this.interpolateDeadWaitColor(this.colors.alive[1], realBackgroundColor, 1), '#999999'],
            ['#' + this.interpolateDeadWaitColor(this.colors.alive[0], realBackgroundColor, 2), '#' + this.interpolateDeadWaitColor(this.colors.alive[1], realBackgroundColor, 2), '#444444'],
        ];
      }
    },

    /**
     * Draw the icons for each team.
     * Get data from the /teams endpoint first.
     * Team abbreviation.
     * This is only called when in gameMode.
     */
    drawIcons : function() {

      // Get team abbreviations from /teams endpoint
      // (abbreviations are used to get svg filename)
      let url = this.baseApiUrl + '/teams/' + this.gameApiResult.season;
      fetch(url)
      .then(res => res.json())
      .then((teamApiResult) => {

        this.teamApiResult = teamApiResult;

        // Assemble team abbr/colors/names
        var teamAbbrs = [this.gameApiResult.team1Abbr.toLowerCase(), this.gameApiResult.team2Abbr.toLowerCase()];
        var teamColors = [this.gameApiResult.team1Color, this.gameApiResult.team2Color];
        var teamNames = [this.gameApiResult.team1Name, this.gameApiResult.team2Name];

        // For each team, make a new <object> tag
        // that gets data from an svg file.
        var iconSize = "25";
        var i;
        for (i = 0; i < 2; i++) {
          var ip1 = i + 1;
          var containerId = "team" + ip1 + "-icon-container";
          var iconId = "team" + ip1 + "-icon";

          var container = document.getElementById(containerId);
          var svg = document.createElement("object");
          svg.setAttribute('type', 'image/svg+xml');
          svg.setAttribute('data', '../img/' + teamAbbrs[i].toLowerCase() + '.svg');
          svg.setAttribute('height', iconSize);
          svg.setAttribute('width', iconSize);
          svg.setAttribute('id', iconId);
          svg.classList.add('icon');
          svg.classList.add('team-icon');
          svg.classList.add('invisible');
          container.appendChild(svg);

          // Wait a little bit for the data to load,
          // then modify the color and make it visible
          var paint = function(color, elemId) {
            var mysvg = $('#' + elemId).getSVG();
            var child = mysvg.find("g path:first-child()");
            if (child.length > 0) {
              child.attr('fill', color);
              $('#' + elemId).removeClass('invisible');
            }
          }
          // This fails pretty often, so try a few times.
          setTimeout(paint, 100,  teamColors[i], iconId);
          setTimeout(paint, 250,  teamColors[i], iconId);
          setTimeout(paint, 500,  teamColors[i], iconId);
          setTimeout(paint, 1000, teamColors[i], iconId);
          setTimeout(paint, 1500, teamColors[i], iconId);
        }

      })
      .catch();
      // Note: intentionally do nothing.
      // If we can't figure out how to draw
      // the team icon, just leave it be.

    },

    getRowsFromUrlSafely : function() {
      // Get the number of rows from the URL parameters,
      // checking the specified value and setting to default
      // if invalid or not specified
      rows = parseInt(this.helpers.getUrlParameter('rows'));
      if (isNaN(rows) || rows < 0 || rows > 1000) {
        rows = this.defaultRows;
      }
      if (rows >= 200) {
        // Turn off the grid
        this.grid.current = 1;
      }
      return rows;
    },

    getColsFromUrlSafely : function() {
      // Get the number of cols from the URL parameters,
      // checking the specified value and setting to default
      // if invalid or not specified
      cols = parseInt(this.helpers.getUrlParameter('cols'));
      if (isNaN(cols) || cols < 0 || cols > 1000) {
        cols = this.defaultCols;
      }
      if (cols >= 200) {
        // Turn off the grid
        this.grid.current = 1;
      }
      return cols;
    },

    getCellSizeFromUrlSafely : function() {
      // Get the cell size from the URL parameters,
      // checking the specified value and setting to default
      // if invalid or not specified
      cellSize = parseInt(this.helpers.getUrlParameter('cellSize'));
      if (isNaN(cellSize) || cellSize < 1 || cellSize > 10) {
        cellSize = this.defaultCellSize;
      }
      if (cellSize <= 5) {
        // Turn off the grid
        this.grid.current = 1;
      }
      return cellSize;
    },

    /**
     * Set number of rows/columns and cell size.
     */
    setZoomState : function() {
      if (this.gameMode === true) {
        /* we are all good
        this.columns  = this.mapApiResult.columns;
        this.rows     = this.mapApiResult.rows;
        this.cellSize = this.mapApiResult.cellSize;
         */
      } else {
        this.columns = this.getColsFromUrlSafely();
        this.rows = this.getRowsFromUrlSafely();
        this.cellSize = this.getCellSizeFromUrlSafely();
      }
    },

    /**
     * Parse the initial state variables s1/s2/s3.
     * Initialize the internal state of the simulator.
     *
     * The internal state is stored as a list of live cells,
     * in the form of an array of arrays with this scheme:
     * [
     *   [ y1, x1, x2, x3, x4, x5 ],
     *   [ y2, x6, x7, x8, x9, x10 ],
     *   ...
     * ]
     */
    setInitialState : function() {

      this.listLife.initBuffers();

      // state 1 parameter
      state1 = jsonParse(decodeURI(this.initialState1));
      var irow, icol, y;
      for (irow = 0; irow < state1.length; irow++) {
        for (y in state1[irow]) {
          for (icol = 0 ; icol < state1[irow][y].length ; icol++) {
            var yy = parseInt(y);
            var xx = state1[irow][yy][icol];
            color = 1;
            this.listLife.addAliveCell(xx, yy, color);
          }
        }
      }

      // state 2 parameter
      state2 = jsonParse(decodeURI(this.initialState2));
      var irow, icol, y;
      for (irow = 0; irow < state2.length; irow++) {
        for (y in state2[irow]) {
          for (icol = 0 ; icol < state2[irow][y].length ; icol++) {
            var yy = parseInt(y);
            var xx = state2[irow][yy][icol];
            if (!this.listLife.isAlive(xx, yy)) {
              color = 2;
              this.listLife.addAliveCell(xx, yy, color);
            }
          }
        }
      }

    },


    /**
     * Clean up actual state and prepare a new run
     */
    cleanUp : function() {
      this.listLife.init(); // Reset/init algorithm
      this.listLife.initBuffers();
      this.prepare();
    },


    relativeDiff : function(a, b, tol) {
      var aa = parseFloat(a);
      var bb = parseFloat(b);
      var smol = 1e-12;
      var denom = Math.max(Math.abs(aa + smol), Math.abs(bb + smol));
      return Math.abs(aa-bb)/denom;
    },

    approxEqual : function(a, b, tol) {
      var diff = this.relativeDiff(a, b, tol);
      return diff < tol;
    },


    /**
     * Check for a victor
     */
    checkForVictor : function(liveCounts) {
      if (this.zeroStart===true) {
        return;
      }
      if (this.foundVictor==false) {
        var maxDim = this.ruleParams.runningAvgMaxDim;

        // Use vector magnitude to account for changes in all team scores
        var squareSum = 0;
        var r;
        for (r=0; r<GOL.colors.ncolors-1; r++) {
          squareSum += liveCounts.liveCellsColors[r]**2;
        }
        var rootSum = Math.sqrt(squareSum);

        // update running average window
        if (this.generation < maxDim) {
          // Keep populating the window...
          //
          // Use vector magnitude to account for changes in all team scores
          this.runningAvgWindow[this.generation] = rootSum;
        } else {
          // Push and pop newest/oldest values
          var removed = this.runningAvgWindow.shift();
          this.runningAvgWindow.push(rootSum);

          // compute running average
          var sum = 0.0;
          for (var i = 0; i < this.runningAvgWindow.length; i++) {
            sum += this.runningAvgWindow[i];
          }
          var runningAvg = sum/this.runningAvgWindow.length;

          // update running average last 3
          removed = this.runningAvgLast3.shift();
          this.runningAvgLast3.push(runningAvg);

          // Now run the following victory condition checks:
          // 1. Check if last running average was zero. If running average is zero, we can't have a victor yet.
          // 2. If running average is nonzero, check if running averages are all equal (victory by stability)
          //
          // Ignore case of running average of 0

          // Tolerance to check if running average values are zero (if so, can't stop)
          var tolZero = this.ruleParams.tolZero; //1e-8;

          // Tolerance to check if running averages are equal (stability)
          var tolStable = this.ruleParams.tolStable; //1e-6;

          if (!this.approxEqual(removed, 0.0, tolZero)) {
            // Here because we have a nonzero running average (game is going), and no victor.
            // Check if average has become stable
            //
            //var diff01 = this.relativeDiff(this.runningAvgLast3[0], this.runningAvgLast3[1], tolStable);
            //var diff02 = this.relativeDiff(this.runningAvgLast3[1], this.runningAvgLast3[2], tolStable);
            var bool0eq1 = this.approxEqual(this.runningAvgLast3[0], this.runningAvgLast3[1], tolStable);
            var bool1eq2 = this.approxEqual(this.runningAvgLast3[1], this.runningAvgLast3[2], tolStable);
            var victoryByStability = ((bool0eq1 && bool1eq2) && (liveCounts.liveCells > 0));
            if (victoryByStability) {
              // Someone won due to the simulation becoming stable
              this.foundVictor = true;
              if (liveCounts.liveCellsColors[0] > liveCounts.liveCellsColors[1]) {
                this.whoWon = 1;
              } else if (liveCounts.liveCellsColors[1] > liveCounts.liveCellsColors[0]) {
                this.whoWon = 2;
              } else {
                this.whoWon = 0;
              }
              this.showWinnersLosers = true;
              this.handlers.buttons.run();
              this.running = false;
            }
          }
        } // end if gen > maxDim

        // Second way for a victor to be declared,
        // is to have all other teams get shut out.
        var victoryByShutout = false;

        /////////////////////////////////
        // hard-coded rules format
        var zeroScore = 0;
        var threshold = 1;
        var r;
        for (r=0; r<GOL.colors.ncolors-1; r++) {
          if (liveCounts.liveCellsColors[r] == 0) {
            zeroScore++;
          }
        }
        if (zeroScore >= threshold) {
          victoryByShutout = true;
        }
        // end hard-coded rules format
        //////////////////////////////////

        if (victoryByShutout) {
          // Someone won because everyone else died
          this.foundVictor = true;
          if (liveCounts.liveCellsColors[0] > liveCounts.liveCellsColors[1]) {
            this.whoWon = 1;
          } else if (liveCounts.liveCellsColors[1] > liveCounts.liveCellsColors[0]) {
            this.whoWon = 2;
          } else {
            this.whoWon = 0;
          }
          this.showWinnersLosers = true;
          this.handlers.buttons.run();
          this.running = false;
        }
      } // end if no victor found
    },

    /**
     * Update the statistics elements on the simulator page
     */
    updateStatisticsElements : function(liveCounts) {
      this.element.livecells.innerHTML  = liveCounts.liveCells;
      this.element.livecells1.innerHTML = liveCounts.liveCellsColors[0];
      this.element.livecells2.innerHTML = liveCounts.liveCellsColors[1];
      this.element.livecells3.innerHTML = liveCounts.liveCellsColors[2];
      this.element.livepct.innerHTML    = liveCounts.livePct.toFixed(1) + "%";
    },

    /**
     * Prepare DOM elements and Canvas for a new run
     */
    prepare : function() {
      this.generation = this.times.algorithm = this.times.gui = 0;
      this.mouseDown = this.clear.schedule = false;

      this.canvas.clearWorld(); // Reset GUI
      this.canvas.drawWorld(); // Draw State

      if (this.autoplay) { // Next Flow
        this.autoplay = false;
        this.handlers.buttons.run();
      }
    },

    updateTeamRecords : function() {
      if (this.gameMode === true) {
        var game = this.gameApiResult;
        if (game.isPostseason) {
          // Postseason: win-loss record in current series
          var t1_wlstr = game.team1SeriesWinLoss[0] + "-" + game.team1SeriesWinLoss[1];
          var t2_wlstr = game.team2SeriesWinLoss[0] + "-" + game.team2SeriesWinLoss[1];

          this.element.team1wlrec.innerHTML = t1_wlstr;
          this.element.team2wlrec.innerHTML = t2_wlstr;

        } else {
          // Season: win-loss record to date
          var t1_wlstr = game.team1WinLoss[0] + "-" + game.team1WinLoss[1];
          var t2_wlstr = game.team2WinLoss[0] + "-" + game.team2WinLoss[1];

          this.element.team1wlrec.innerHTML = t1_wlstr;
          this.element.team2wlrec.innerHTML = t2_wlstr;
        }
      } else {

        // TODO When not in game mode, do the following:
        // - remove table columns for records
        // - shrink icons column to 0px
        // - shrink scoreboard container to sm-4
        var elems;
        var i, j, k;

        // Delete unused columns from scoreboard table
        var idsToDelete = ['scoreboard-table-column-icon', 'scoreboard-table-column-spacing', 'scoreboard-table-column-record'];
        for(i = 0; i < idsToDelete.length; i++) {
          idToDelete = idsToDelete[i];
          elems = document.getElementsByClassName(idToDelete);
          while(elems[0]) {
            elems[0].parentNode.removeChild(elems[0]);
          }
        }

        // Shrink scoreboard container to sm-4
        var elem = document.getElementById('scoreboard-panels-container');
        elem.classList.remove('col-sm-8');
        elem.classList.add('col-sm-4');

      }
    },

    updateTeamNamesColors : function() {
      var i, e;

      // Team colors
      for (i = 0; i < this.element.team1color.length; i++) {
        e = this.element.team1color[i];
        e.style.color = this.colors.alive[0];
      }
      for (i = 0; i < this.element.team2color.length; i++) {
        e = this.element.team2color[i];
        e.style.color = this.colors.alive[1];
      }

      // Team names
      for (i = 0; i < this.element.team1name.length; i++) {
        e = this.element.team1name[i];
        e.innerHTML = this.teamNames[0];
      }
      for (i = 0; i < this.element.team2name.length; i++) {
        e = this.element.team2name[i];
        e.innerHTML = this.teamNames[1];
      }
    },

    getCounts : function() {
      var liveCounts = GOL.listLife.getLiveCounts();
      return liveCounts;
    },

    /**
     * keepDOMElements
     * Save DOM references for this session (one time execution)
     */
    keepDOMElements : function() {

      this.element.generation = document.getElementById('generation');
      this.element.livecells  = document.getElementById('livecells');
      this.element.livecells1 = document.getElementById('livecells1');
      this.element.livecells2 = document.getElementById('livecells2');
      this.element.livecells3 = document.getElementById('livecells3');

      this.element.team1wlrec = document.getElementById("team1record");
      this.element.team2wlrec = document.getElementById("team2record");
      this.element.team1wlrecCont = document.getElementById("team1record-container");
      this.element.team2wlrecCont = document.getElementById("team2record-container");

      this.element.livepct    = document.getElementById('livePct');

      this.element.team1color = document.getElementsByClassName("team1color");
      this.element.team1name  = document.getElementsByClassName("team1name");

      this.element.team2color = document.getElementsByClassName("team2color");
      this.element.team2name  = document.getElementsByClassName("team2name");

      this.element.clearButton = document.getElementById('buttonClear');
      this.element.colorButton = document.getElementById('buttonColors');

      this.element.mapName = document.getElementById('mapname-label');
      this.element.mapPanel = document.getElementById('stats-panel-map');

      this.element.speedSlider = document.getElementById('speed-slider');

      this.element.team1winner = document.getElementById('team1winner');
      this.element.team2winner = document.getElementById('team2winner');
      this.element.team1loser = document.getElementById('team1loser');
      this.element.team2loser = document.getElementById('team2loser');
    },


    /**
     * registerEvents
     * Register event handlers for this session (one time execution)
     */
    registerEvents : function() {

      // Keyboard Events
      this.helpers.registerEvent(document.body, 'keyup', this.handlers.keyboard, false);
      // Controls
      this.helpers.registerEvent(document.getElementById('buttonRun'), 'click', this.handlers.buttons.run, false);
      this.helpers.registerEvent(document.getElementById('buttonStep'), 'click', this.handlers.buttons.step, false);
      if (this.sandboxMode === true || this.mapMode === true) {
        // Clear control only available in sandbox or map mode
        this.helpers.registerEvent(document.getElementById('buttonClear'), 'click', this.handlers.buttons.clear, false);
      }

      // Speed control slider
      this.helpers.registerEvent(document.getElementById('speed-slider'), 'input', this.handlers.buttons.speedControl, false);

      // Layout
      // on click, call function to show/hide trails
      this.helpers.registerEvent(document.getElementById('buttonTrail'), 'click', this.handlers.buttons.trail, false);
      // on click, call function to switch grid on/off
      this.helpers.registerEvent(document.getElementById('buttonGrid'), 'click', this.handlers.buttons.grid, false);
      // on click, call function to cycle all colors
      this.helpers.registerEvent(document.getElementById('buttonColors'), 'click', this.handlers.buttons.colorcycle, false);
    },

    /**
     * Run Next Step
     */
    nextStep : function() {

      // Hyper speed runs hyperGenerations generations per tick, other speeds run one
      var n = 0;
      do {
        GOL.runGeneration();
        n++;
      } while (GOL.running && GOL.helpers.isHyper() && n < GOL.hyperGenerations);

      var v = this.helpers.getWaitTimeMs();

      // Sleepy time before going on to next step
      setTimeout(() => {
        // Flow Control
        if (GOL.running) {
          GOL.nextStep();
        } else {
          if (GOL.clear.schedule) {
            GOL.cleanUp();
          }
        }
      }, v);

    },

    /**
     * Run one generation: algorithm, canvas, statistics, victory check
     */
    runGeneration : function() {

      var i, x, y, r;
      var liveCellNumbers, liveCellNumber, liveCellNumber1, liveCellNumber2;
      var algorithmTime, guiTime;

      // Algorithm run

      algorithmTime = (new Date());

      liveCounts = GOL.listLife.nextGeneration();

      algorithmTime = (new Date()) - algorithmTime;

      // Canvas run

      guiTime = (new Date());

      for (i = 0; i < GOL.listLife.redrawList.length; i++) {
        var x, y, action, color;
        x = GOL.listLife.redrawList[i][0];
        y = GOL.listLife.redrawList[i][1];
        action = GOL.listLife.redrawList[i][2];
        color = GOL.listLife.redrawList[i][3];

        // Decide which action to take
        // TODO: this matches up with the current value of c, but update it so it can handle c != 4
        if (action === 1) {
          GOL.canvas.changeCelltoAlive(x, y, color);
        } else if (action === 2) {
          GOL.canvas.keepCellAlive(x, y, color);
        } else if (action === 3) {
          GOL.canvas.changeCelltoDeadWait(x, y, color, c=0);
        } else if (action === 4) {
          GOL.canvas.changeCelltoDeadWait(x, y, color, c=1);
        } else {
          GOL.canvas.changeCelltoDead(x, y);
        }
      }

      guiTime = (new Date()) - guiTime;

      // Post-run updates

      // Clear Trail
      if (GOL.trail.schedule) {
        GOL.trail.schedule = false;
        GOL.canvas.drawWorld();
      }

      // Change Grid
      if (GOL.grid.schedule) {
        GOL.grid.schedule = false;
        GOL.canvas.drawWorld();
      }

      // Change Colors
      if (GOL.colors.schedule) {
        GOL.colors.schedule = false;
        GOL.canvas.drawWorld();
      }

      // Running Information
      GOL.generation++;
      GOL.element.generation.innerHTML = GOL.generation;

      // Update statistics
      GOL.updateStatisticsElements(liveCounts);

      // Check for victor
      GOL.checkForVictor(liveCounts);

      // Update winner/loser if found
      if (GOL.showWinnersLosers) {
        if (GOL.whoWon == 1) {
          GOL.element.team1winner.innerHTML = 'W';
          GOL.element.team2loser.innerHTML = 'L';
        } else {
          GOL.element.team2winner.innerHTML = 'W';
          GOL.element.team1loser.innerHTML = 'L';
        }
      }

      r = 1.0/GOL.generation;
      GOL.times.algorithm = (GOL.times.algorithm * (1 - r)) + (algorithmTime * r);
      GOL.times.gui = (GOL.times.gui * (1 - r)) + (guiTime * r);

    },


    /** ****************************************************************************************************************************
     * Event Handlers
     */
    handlers : {

      mouseDown : false,
      lastX : 0,
      lastY : 0,

      /**
       * When user clicks down, set mouse down state
       * and change change cell alive/dead state at
       * the current mouse location.
       * (sandbox mode only)
       */
      canvasMouseDown : function(event) {
        if (GOL.sandboxMode === true || GOL.mapMode === true) {
          var position = GOL.helpers.mousePosition(event);
          GOL.canvas.switchCell(position[0], position[1]);
          GOL.handlers.lastX = position[0];
          GOL.handlers.lastY = position[1];
          GOL.handlers.mouseDown = true;
        }
      },


      /**
       * Handle user mouse up instance.
       * (sandbox mode only)
       */
      canvasMouseUp : function() {
        if (GOL.sandboxMode === true || GOL.mapModed === true) {
          GOL.handlers.mouseDown = false;
        }
      },


      /**
       * If we have captured a mouse down event,
       * track where the mouse is going and change
       * cell alive/dead state at mouse location.
       * (sandbox mode only)
       */
      canvasMouseMove : function(event) {
        if (GOL.sandboxMode === true || GOL.mapMode === true) {
          if (GOL.handlers.mouseDown) {
            var position = GOL.helpers.mousePosition(event);
            if ((position[0] !== GOL.handlers.lastX) || (position[1] !== GOL.handlers.lastY)) {
              GOL.canvas.switchCell(position[0], position[1]);
              GOL.handlers.lastX = position[0];
              GOL.handlers.lastY = position[1];
            }
          }
        }
      },


      /**
       * Allow keyboard shortcuts
       */
      keyboard : function(e) {
        var event = e;
        if (!event) {
          event = window.event;
        }

        if (event.keyCode === 67) { // Key: C
          // User can only clear the board in sandbox mode
          if (GOL.sandboxMode === true || GOL.mapMode === true) {
            GOL.handlers.buttons.clear();
          }

        } else if (event.keyCode === 82 ) { // Key: R
          GOL.handlers.buttons.run();

        } else if (event.keyCode === 83 ) { // Key: S
          if (GOL.running) {
            // If running, S will stop the simulation
            GOL.handlers.buttons.run();
          } else {
            GOL.handlers.buttons.step();
          }

        } else if (event.keyCode === 70 ) { // Key: F
          var speed = GOL.element.speedSlider.value;
          speed = speed - 1;
          if (speed < 0) {
            speed = 4;
          }
          GOL.element.speedSlider.value = speed;
          GOL.handlers.buttons.speedControl();

        } else if (event.keyCode === 71 ) { // Key: G
          GOL.handlers.buttons.grid();

        }
      },


      buttons : {

        /**
         * Button Handler - Run
         */
        run : function() {

          GOL.running = !GOL.running;
          // Update run/stop button state
          if (GOL.running) {
            GOL.nextStep();
            document.getElementById('buttonRun').innerHTML = '<u>S</u>top';
            document.getElementById('buttonRun').classList.remove("btn-success");
            document.getElementById('buttonRun').classList.add("btn-danger");
          } else {
            document.getElementById('buttonRun').innerHTML = '<u>R</u>un';
            document.getElementById('buttonRun').classList.remove("btn-danger");
            document.getElementById('buttonRun').classList.add("btn-success");
          }
        },


        /**
         * Button Handler - Next Step - One Step only
         */
        step : function() {
          if (!GOL.running) {
            GOL.nextStep();
          }
        },


        /**
         * Button Handler - Clear World
         */
        clear : function() {
          if (GOL.sandboxMode === true || GOL.mapMode === true) {
            if (GOL.running) {
              GOL.clear.schedule = true;
              GOL.running = false;
              $("#buttonRun").text("Run");
              document.getElementById('buttonRun').classList.remove("btn-danger");
              document.getElementById('buttonRun').classList.add("btn-success");
            } else {
              GOL.cleanUp();

              //////////////////////////////////////////
              // DO IT (CLEAR BUTTON CLEANUP) HERE

              // If we found a victor and the user pressed clear, reset foundVictor
              GOL.foundVictor = false;
              GOL.whoWon = 0;
              GOL.showWinnersLosers = false;
              GOL.element.team1winner.innerHTML = '';
              GOL.element.team2winner.innerHTML = '';
              GOL.element.team1loser.innerHTML = '';
              GOL.element.team2loser.innerHTML = '';

              // GOL.listLife alive and dead wait cells should now be empty
              liveCounts = GOL.getCounts();
              // liveCounts should have 0 cells everywhere
              GOL.updateStatisticsElements(liveCounts);
              // This should probably be in an updateGeneration() function
              GOL.element.generation.innerHTML = 0;

              // DONE WITH CLEAR BUTTON CLEANUP
              //////////////////////////////////////////
            }
          }
        },


        /**
         * Button Handler - Remove/Add Trail
         *
         * This function is only called when the user clicks the "Trails" button.
         */
        trail : function() {
          GOL.trail.current = !GOL.trail.current;
          if (GOL.running) {
            GOL.trail.schedule = true;
          } else {
            GOL.canvas.drawWorld();
          }
        },

        /**
         * Cycle through the color schemes.
         *
         * This function is only called when the user clicks the "Colors" button.
         */
        colorcycle : function() {
          if (GOL.colors.schemes.length > 1) {
            GOL.colors.currentScheme = (GOL.colors.currentScheme + 1) % GOL.colors.schemes.length;
            GOL.colors.alive = GOL.colors.schemes[GOL.colors.currentScheme].alive;
            GOL.colors.deadWait = [
                ['#' + GOL.interpolateDeadWaitColor(GOL.colors.alive[0], realBackgroundColor, 1), '#' + GOL.interpolateDeadWaitColor(GOL.colors.alive[1], realBackgroundColor, 1), '#999999'],
                ['#' + GOL.interpolateDeadWaitColor(GOL.colors.alive[0], realBackgroundColor, 2), '#' + GOL.interpolateDeadWaitColor(GOL.colors.alive[1], realBackgroundColor, 2), '#444444'],
            ];
            if (GOL.gameMode === false) {
              GOL.teamNames = GOL.colors.schemes[GOL.colors.currentScheme].aliveLabels;
            }
            GOL.updateTeamNamesColors();
            if (GOL.running) {
              GOL.colors.schedule = true; // Delay redraw until end of next generation
            } else {
              GOL.canvas.drawWorld(); // Force complete redraw now
            }
          } else {
            console.log('Only one color scheme available');
          }
        },

        /**
         * Show/hide the grid
         *
         * This function is only called when the user clicks the "Grid" button.
         */
        grid : function() {
          GOL.grid.current = (GOL.grid.current + 1) % GOL.grid.schemes.length;
          if (GOL.running) {
            GOL.grid.schedule = true; // Delay redraw
          } else {
            GOL.canvas.drawWorld(); // Force complete redraw
          }
        },

        /**
         * Update simulation speed
         */
        speedControl : function() {
          // The getWaitTimeMs function will read
          // the value of the speed slider directly.
          // Here we only switch the slider and label into the Hyper style.
          var label = document.getElementById('speed-label-fast');
          var slider = GOL.element.speedSlider;
          if (GOL.helpers.isHyper()) {
            label.innerHTML = 'HYPER';
            label.classList.add('hyper');
            slider.classList.add('hyper');
          } else {
            label.innerHTML = '<u>F</u>aster';
            label.classList.remove('hyper');
            slider.classList.remove('hyper');
          }
        },

      },

    },


    /** ****************************************************************************************************************************
     *
     */
    canvas: {

      context : null,
      width : null,
      height : null,
      age : null,
      cellSize : null,
      cellSpace : null,


      /**
       * init
       */
      init : function() {

        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');

        this.cellSize = GOL.cellSize;
        this.cellSpace = 1;

        // register the mousedown/mouseup/mousemove events with function callbacks
        GOL.helpers.registerEvent(this.canvas, 'mousedown', GOL.handlers.canvasMouseDown, false);
        GOL.helpers.registerEvent(document, 'mouseup', GOL.handlers.canvasMouseUp, false);
        GOL.helpers.registerEvent(this.canvas, 'mousemove', GOL.handlers.canvasMouseMove, false);

        this.clearWorld();
      },


      /**
       * clearWorld
       */
      clearWorld : function () {
        var i, j;

        // Init ages (Canvas reference)
        this.age = [];
        for (i = 0; i < GOL.columns; i++) {
          this.age[i] = [];
          for (j = 0; j < GOL.rows; j++) {
            this.age[i][j] = 0; // Dead
          }
        }
      },


      /**
       * drawWorld
       * Normally the nextGeneration method redraws each cell as they change states.
       * This method is only called when team colors are changed, or the grid turned on/off.
       * In those cases the entire grid must be re-drawn from scratch.
       */
      drawWorld : function() {
        var i, j;

        // Special no grid case
        if (GOL.grid.schemes[GOL.grid.current].color === '') {
          this.setNoGridOn();
          this.width = this.height = 0;
        } else {
          this.setNoGridOff();
          this.width = this.height = 1;
        }

        // Dynamic canvas size
        this.width = this.width + (this.cellSpace * GOL.columns) + (this.cellSize * GOL.columns);
        this.canvas.setAttribute('width', this.width);

        this.height = this.height + (this.cellSpace * GOL.rows) + (this.cellSize * GOL.rows);
        this.canvas.setAttribute('height', this.height);

        // Fill background
        this.context.fillStyle = GOL.grid.schemes[GOL.grid.current].color;
        this.context.fillRect(0, 0, this.width, this.height);

        // Fill each cell
        for (i = 0 ; i < GOL.columns; i++) {
          for (j = 0 ; j < GOL.rows; j++) {
            if (GOL.listLife.isAlive(i, j)) {
              this.drawCell(i, j, 1, GOL.listLife.getCellColor(i, j));
            } else if (GOL.listLife.isDeadWait(i, j, c=0)) {
              this.drawCell(i, j, 2, GOL.listLife.getDeadWaitColor(i, j, c=0));
            } else if (GOL.listLife.isDeadWait(i, j, c=1)) {
              this.drawCell(i, j, 3, GOL.listLife.getDeadWaitColor(i, j, c=1));
            } else {
              this.drawCell(i, j, 0);
            }
          }
        }

      },


      /**
       * setNoGridOn
       */
      setNoGridOn : function() {
        this.cellSize = GOL.cellSize + 1;
        this.cellSpace = 0;
      },


      /**
       * setNoGridOff
       */
      setNoGridOff : function() {
        this.cellSize = GOL.cellSize;
        this.cellSpace = 1;
      },


      /**
       * drawCell
       */
      drawCell : function (i, j, aliveDeadState, color = -1) {

        if (aliveDeadState === 0) {

          // aliveDeadState = 0 means this cell is dead
          if (GOL.trail.current && this.age[i][j] < 0) {
            this.context.fillStyle = GOL.colors.trail[(this.age[i][j] * -1) % GOL.colors.trail.length];
          } else {
            this.context.fillStyle = GOL.colors.dead;
          }

        } else if (aliveDeadState === 1 ) {

          // aliveDeadState = 1 means this cell is normal-alive
          // (use alive colors)
          if (color === -1) {
            // look up this cell's color using state lists
            this.context.fillStyle = GOL.colors.alive[GOL.listLife.getCellColor(i, j) - 1];
          } else {
            // save time by using user-specified color
            this.context.fillStyle = GOL.colors.alive[color - 1];
          }

        } else {

          // Rules that specify a value for c will have dead/alive and c-2 remaining states
          // Calling this function with aliveDeadState > 1 will move cells to dead wait states
          c = aliveDeadState - 2;

          this.context.fillStyle = GOL.colors.deadWait[c][color - 1];
          // No default option for color, user must provide

        }

        this.context.fillRect(this.cellSpace + (this.cellSpace * i) + (this.cellSize * i), this.cellSpace + (this.cellSpace * j) + (this.cellSize * j), this.cellSize, this.cellSize);

        // Draw light strokes cutting the canvas through the middle
        if (i===parseInt(GOL.columns/2)) {
          if (GOL.grid.mapOverlay==true) {
            this.context.fillStyle = mapZoneStrokeColor;
            this.context.fillRect(
              (this.cellSpace * i+1) + (this.cellSize * i+1) - 2*this.cellSpace,
              (this.cellSpace * j) + (this.cellSize * j) + this.cellSpace,
              this.cellSpace,
              this.cellSize,
            );
          }
        }

        if (j===parseInt(GOL.rows/2)) {
          if (GOL.grid.mapOverlay==true) {
            this.context.fillStyle = mapZoneStrokeColor;
            this.context.fillRect(
              (this.cellSpace * i+1) + (this.cellSize * i+1) - 2*this.cellSpace,
              (this.cellSpace * j) + (this.cellSize * j) + this.cellSpace,
              this.cellSize,
              this.cellSpace,
            );
          }
        }

      },


      /**
       * switchCell
       *
       * This is only activated when a user clicks on a cell
       */
      switchCell : function(i, j) {
        //////////////
        // TODO fix
        if (GOL.sandboxMode===true) {
          if (GOL.listLife.isAlive(i, j)) {
            // User can only paint two colors, no referee
            if (GOL.listLife.getCellColor(i, j) == 1) {
              // Swap colors
              GOL.listLife.removeAliveCell(i, j);
              GOL.listLife.addAliveCell(i, j, 2);
            } else if (GOL.listLife.getCellColor(i, j) == 2) {
              GOL.listLife.removeAliveCell(i, j);
            }
          } else {
            GOL.listLife.addAliveCell(i, j, 1);
          }
        }
        if (GOL.running) {
          GOL.colors.schedule = true;
        } else {
          GOL.canvas.drawWorld();
        }
      },


      /**
       * keepCellAlive
       */
      keepCellAlive : function(i, j, color = -1) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j]++;
          if (color === -1) {
            // default behavior: use current cell color
            color = GOL.listLife.getCellColor(i, j)
          }
          this.drawCell(i, j, 1, color);
        }
      },


      /**
       * changeCelltoAlive
       */
      changeCelltoAlive : function(i, j, color = -1) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          this.age[i][j] = 1;
          if (color === -1) {
            // default behavior: use current cell color
            color = GOL.listLife.getCellColor(i, j)
          }
          this.drawCell(i, j, 1, color);
        }
      },


      /**
       * changeCelltoDead
       */
      changeCelltoDead : function(i, j) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          // Age sign change should happen when cell perma-dies, not while in deadwait
          this.age[i][j] = -this.age[i][j]; // Keep trail
          this.drawCell(i, j, 0, 0);
        }
      },


      changeCelltoDeadWait : function(i, j, color, c = -1) {
        if (i >= 0 && i < GOL.columns && j >=0 && j < GOL.rows) {
          if (c>=0) {
            this.drawCell(i, j, 2+c, color);
          }
        }
      },


    },


    /** ****************************************************************************************************************************
     *
     */
    listLife : {

      redrawList : [],
      // Typed-array buffers are allocated by initBuffers()


      /**
       * Initialize variables
       */
      init : function () {
        this.redrawList = [];
        this._buffersReady = false;
      },


      /**
       * Allocate typed-array buffers for the optimized algorithm.
       * Must be called after GOL.columns/rows are set (i.e. in setInitialState/cleanUp).
       */
      initBuffers : function () {
        var rows = GOL.rows;
        var cols = GOL.columns;
        var size = rows * cols;
        var i, j;

        // Dense cell state: 0=dead, 1=alive, 2..c-1=dead wait phases 0..c-3
        this.state = new Uint8Array(size);

        // Dense cell color for alive and dead wait cells (1=team1, 2=team2, 3=referee), 0 for dead cells
        this.color = new Uint8Array(size);

        // Alive cell index lists (double-buffered)
        this.liveCells = new Int32Array(size);
        this.newLiveCells = new Int32Array(size);
        this.liveCount = 0;

        // Dead wait cell index lists, one per dead wait phase (c - 2 phases, the 2 accounts for alive/dead),
        // plus a spare list for the cells that die this generation
        this.deadWaitCells = [];
        this.deadWaitCounts = [];
        for (j = 0; j < GOL.ruleParams.c - 2; j++) {
          this.deadWaitCells.push(new Int32Array(size));
          this.deadWaitCounts.push(0);
        }
        this.dyingCells = new Int32Array(size);

        // Packed alive neighbor counts: bits 0-3 = total, bits 4-7 = team1, bits 8-11 = team2
        // (referees count toward the total only)
        this.packedNeighbors = new Uint16Array(size);
        this.packedInc = new Uint16Array([0, 0x011, 0x101, 0x001]);

        // Generation stamps for birth-candidate dedup
        this.checkedStamp = new Uint32Array(size);
        this._currentStamp = 1;

        // Survive/birth lookup by number of alive neighbors
        this.survive = new Uint8Array(9);
        this.born = new Uint8Array(9);
        for (i = 0; i < GOL.ruleParams.s.length; i++) {
          this.survive[GOL.ruleParams.s[i]] = 1;
        }
        for (i = 0; i < GOL.ruleParams.b.length; i++) {
          this.born[GOL.ruleParams.b[i]] = 1;
        }

        // Pre-computed toroidal wrapping
        this.rowUp = new Int32Array(rows);
        this.rowDown = new Int32Array(rows);
        this.colLeft = new Int32Array(cols);
        this.colRight = new Int32Array(cols);

        var y, x;
        for (y = 0; y < rows; y++) {
          this.rowUp[y] = y === 0 ? rows - 1 : y - 1;
          this.rowDown[y] = y === rows - 1 ? 0 : y + 1;
        }
        for (x = 0; x < cols; x++) {
          this.colLeft[x] = x === 0 ? cols - 1 : x - 1;
          this.colRight[x] = x === cols - 1 ? 0 : x + 1;
        }

        // Scratch list of the 8 neighbor indices of a cell
        this.nbrs = new Int32Array(8);

        // Reusable result object for getLiveCounts
        this._liveCountsResult = {liveCells: 0, liveCellsColors: [0, 0, 0], livePct: 0};

        this._cols = cols;
        this._buffersReady = true;
      },


      /**
       * Return the number of alive cells, and a list of the number of alive cells
       * of each color. Returns other useful statistics and count information.
       */
      getLiveCounts : function() {
        var color = this.color;
        var liveCells = this.liveCells;
        var numLive = this.liveCount;

        var counts = [0, 0, 0, 0];
        for (var i = 0; i < numLive; i++) {
          counts[color[liveCells[i]]]++;
        }

        var totalArea = GOL.columns * GOL.rows;
        var livePct = ((numLive)/(totalArea))*100.0;

        var r = this._liveCountsResult;
        r.liveCells = numLive;
        r.liveCellsColors[0] = counts[1];
        r.liveCellsColors[1] = counts[2];
        r.liveCellsColors[2] = counts[3];
        r.livePct = livePct;
        return r;
      },


      /**
       * Fill this.nbrs with the indices of the 8 neighbors of cell (x, y),
       * in the order NW, N, NE, W, E, SW, S, SE
       */
      setNeighbors : function(x, y) {
        var cols = this._cols;
        var ym1Off = this.rowUp[y] * cols;
        var yOff = y * cols;
        var yp1Off = this.rowDown[y] * cols;
        var xm1 = this.colLeft[x];
        var xp1 = this.colRight[x];
        var nbrs = this.nbrs;
        nbrs[0] = ym1Off + xm1;
        nbrs[1] = ym1Off + x;
        nbrs[2] = ym1Off + xp1;
        nbrs[3] = yOff + xm1;
        nbrs[4] = yOff + xp1;
        nbrs[5] = yp1Off + xm1;
        nbrs[6] = yp1Off + x;
        nbrs[7] = yp1Off + xp1;
      },


      /**
       * The main driver method: advance the state of the simulator forward one generation.
       *
       * Rules (Star Wars is B2/S345/C4):
       * - Alive cells with a survive number of alive neighbors stay alive, the rest enter dead wait phase 0.
       *   Either way the cell takes the majority color of its alive team neighbors. A tie goes to the
       *   majority color of alive plus dead wait team neighbors, and a second tie (or no alive team
       *   neighbors) keeps the cell's own color.
       * - Dead cells (not in dead wait) with a birth number of alive neighbors come alive with the
       *   majority color of their alive team neighbors. A tie (or no alive team neighbors) makes a referee.
       * - Dead wait cells move to the next phase; cells in the last phase die.
       */
      nextGeneration : function() {
        var cols = this._cols;
        var state = this.state;
        var color = this.color;
        var liveCells = this.liveCells;
        var numLive = this.liveCount;
        var rowUp = this.rowUp;
        var rowDown = this.rowDown;
        var colLeft = this.colLeft;
        var colRight = this.colRight;
        var packed = this.packedNeighbors;
        var packedInc = this.packedInc;
        var checkedStamp = this.checkedStamp;
        var stamp = this._currentStamp;
        var survive = this.survive;
        var born = this.born;
        var nbrs = this.nbrs;
        var li, m, idx, x, y, inc;
        this.redrawList = [];
        var redrawList = this.redrawList;

        // Phase 1: Accumulate packed alive neighbor counts
        for (li = 0; li < numLive; li++) {
          idx = liveCells[li];
          y = (idx / cols) | 0;
          x = idx - y * cols;
          var ym1Off = rowUp[y] * cols;
          var yOff = y * cols;
          var yp1Off = rowDown[y] * cols;
          var xm1 = colLeft[x];
          var xp1 = colRight[x];

          inc = packedInc[color[idx]];

          packed[ym1Off + xm1] += inc;
          packed[ym1Off + x]   += inc;
          packed[ym1Off + xp1] += inc;
          packed[yOff  + xm1]  += inc;
          packed[yOff  + xp1]  += inc;
          packed[yp1Off + xm1] += inc;
          packed[yp1Off + x]   += inc;
          packed[yp1Off + xp1] += inc;
        }

        // Phase 2: Survive and birth steps.
        // Cells that die keep state 1 until phase 3, so dead wait tiebreaks
        // below only see cells that were already in dead wait.
        var newLiveCells = this.newLiveCells;
        var newCount = 0;
        var dyingCells = this.dyingCells;
        var dyingCount = 0;

        for (li = 0; li < numLive; li++) {
          idx = liveCells[li];
          var p = packed[idx];
          var n1 = (p >> 4) & 0xF;
          var n2 = (p >> 8) & 0xF;
          y = (idx / cols) | 0;
          x = idx - y * cols;
          this.setNeighbors(x, y);

          // Survival color: majority rule, then dead wait tiebreak, then keep own color
          var c;
          if (n1 > n2) {
            c = 1;
          } else if (n2 > n1) {
            c = 2;
          } else if (n1 > 0) {
            var dw1 = 0, dw2 = 0;
            for (m = 0; m < 8; m++) {
              if (state[nbrs[m]] >= 2) {
                if (color[nbrs[m]] === 1) {
                  dw1++;
                } else if (color[nbrs[m]] === 2) {
                  dw2++;
                }
              }
            }
            c = (dw1 > dw2) ? 1 : ((dw2 > dw1) ? 2 : color[idx]);
          } else {
            c = color[idx];
          }

          color[idx] = c;
          if (survive[p & 0xF]) {
            newLiveCells[newCount++] = idx;
            redrawList.push([x, y, 2, c]); // Keep alive
          } else {
            dyingCells[dyingCount++] = idx;
            redrawList.push([x, y, 3, c]); // First phase of dead wait
          }

          // Birth: check all 8 neighbors of this alive cell for dead (not dead wait) candidates
          for (m = 0; m < 8; m++) {
            var nIdx = nbrs[m];
            if (state[nIdx] === 0 && checkedStamp[nIdx] !== stamp) {
              checkedStamp[nIdx] = stamp;
              var np = packed[nIdx];
              if (born[np & 0xF]) {
                var b1 = (np >> 4) & 0xF;
                var b2 = (np >> 8) & 0xF;
                var bc = (b1 > b2) ? 1 : ((b2 > b1) ? 2 : 3);
                state[nIdx] = 1;
                color[nIdx] = bc;
                newLiveCells[newCount++] = nIdx;
                var ny = (nIdx / cols) | 0;
                redrawList.push([nIdx - ny * cols, ny, 1, bc]); // Bring to life
              }
            }
          }
        }

        // Phase 3: Dead wait cycling.
        // Kill all cells in the last dead wait phase, shift the other phases by 1,
        // then cells that died this generation become dead wait phase 0.
        var deadWaitCells = this.deadWaitCells;
        var deadWaitCounts = this.deadWaitCounts;
        var cmaxIndex = deadWaitCells.length - 1;
        var list, count, k;

        list = deadWaitCells[cmaxIndex];
        count = deadWaitCounts[cmaxIndex];
        for (k = 0; k < count; k++) {
          idx = list[k];
          state[idx] = 0;
          color[idx] = 0;
          y = (idx / cols) | 0;
          redrawList.push([idx - y * cols, y, 0, 0]); // Perma-kill
        }
        var spare = list;

        // 0=die, 1=birth, 2=keep alive, 3=death phase 1, 4=death phase 2, 5=death phase 3,...
        for (var ph = cmaxIndex; ph > 0; ph--) {
          list = deadWaitCells[ph - 1];
          count = deadWaitCounts[ph - 1];
          for (k = 0; k < count; k++) {
            idx = list[k];
            state[idx] = ph + 2;
            y = (idx / cols) | 0;
            redrawList.push([idx - y * cols, y, 3 + ph, color[idx]]);
          }
          deadWaitCells[ph] = list;
          deadWaitCounts[ph] = count;
        }

        for (k = 0; k < dyingCount; k++) {
          state[dyingCells[k]] = 2;
        }
        deadWaitCells[0] = dyingCells;
        deadWaitCounts[0] = dyingCount;
        this.dyingCells = spare;

        // Phase 4: Cleanup and swap
        packed.fill(0);
        this._currentStamp = stamp + 1;

        this.liveCells = newLiveCells;
        this.newLiveCells = liveCells;
        this.liveCount = newCount;

        return this.getLiveCounts();
      },


      /**
       * Given an x coordinate, normalize for a periodic grid
       * (add total number of rows, then take result mod number of rows).
       * Ensures coordinate is not negative/off grid.
       */
      periodicNormalizex(j) {
        return (j + GOL.columns)%(GOL.columns);
      },


      /**
       * Given a y coordinate, normalize for a periodic grid
       * (add total number of rows, then take result mod number of rows).
       * Ensures coordinate is not negative/off grid.
       */
      periodicNormalizey(j) {
        return (j + GOL.rows)%(GOL.rows);
      },


      /**
       * Get the grid index of cell (x, y)
       */
      cellIndex : function(x, y) {
        x = this.periodicNormalizex(x);
        y = this.periodicNormalizey(y);
        return y * this._cols + x;
      },


      /**
       * Check if the cell at location (x, y) is alive
       */
      isAlive : function(x, y) {
        return this.state[this.cellIndex(x, y)] === 1;
      },


      /**
       * Check if the cell at location (x, y) is in a dead wait state.
       * If the index c (zero-indexed) is specified, only check that dead wait state.
       */
      isDeadWait : function(x, y, c = -1) {
        var s = this.state[this.cellIndex(x, y)];
        if (c < 0) {
          return s >= 2;
        }
        return s === c + 2;
      },


      /**
       * Get the color of the cell at location (x, y)
       * (assumes cell is alive, returns 0 if cell is not alive)
       */
      getCellColor : function(x, y) {
        var idx = this.cellIndex(x, y);
        return this.state[idx] === 1 ? this.color[idx] : 0;
      },


      /**
       * Get the color of the dead wait cell at location (x, y)
       * (returns 0 if cell is not in dead wait, or not in dead wait state c if c is specified)
       */
      getDeadWaitColor : function(x, y, c = -1) {
        var idx = this.cellIndex(x, y);
        return this.isDeadWait(x, y, c) ? this.color[idx] : 0;
      },


      /**
       * Remove cell idx from an index list, returning the new list length
       */
      _removeFromList : function(list, count, idx) {
        for (var i = 0; i < count; i++) {
          if (list[i] === idx) {
            list[i] = list[count - 1];
            return count - 1;
          }
        }
        return count;
      },


      /**
       * Add an alive cell with the given color (1, 2, 3) at location (x, y).
       * A cell that is already alive keeps its color.
       * A dead wait cell comes alive.
       */
      addAliveCell : function(x, y, color) {
        if ((color < 1) || (color > 3)) {
          throw "addAliveCell() called with invalid color "+color;
        }
        var idx = this.cellIndex(x, y);
        var s = this.state[idx];
        if (s === 1) {
          return;
        }
        if (s >= 2) {
          this.deadWaitCounts[s - 2] = this._removeFromList(this.deadWaitCells[s - 2], this.deadWaitCounts[s - 2], idx);
        }
        this.state[idx] = 1;
        this.color[idx] = color;
        this.liveCells[this.liveCount++] = idx;
      },


      /**
       * Remove the alive cell at location (x, y), if any
       */
      removeAliveCell : function(x, y) {
        var idx = this.cellIndex(x, y);
        if (this.state[idx] === 1) {
          this.state[idx] = 0;
          this.color[idx] = 0;
          this.liveCount = this._removeFromList(this.liveCells, this.liveCount, idx);
        }
      }

    },


    /** ****************************************************************************************************************************
     *
     */
    helpers : {
      urlParameters : null, // Cache


      /**
       * Return a random integer from [min, max]
       */
      random : function(min, max) {
        return min <= max ? min + Math.round(Math.random() * (max - min)) : null;
      },


      /**
       * Get URL Parameters
       */
      getUrlParameter : function(name) {
        if (this.urlParameters === null) { // Cache miss
          var hash, hashes, i;

          this.urlParameters = [];
          hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

          for (i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            this.urlParameters.push(hash[0]);
            this.urlParameters[hash[0]] = hash[1];
          }
        }

        return this.urlParameters[name];
      },


      /**
       * Register Event
       */
      registerEvent : function (element, event, handler, capture) {
        if (/msie/i.test(navigator.userAgent)) {
          element.attachEvent('on' + event, handler);
        } else {
          element.addEventListener(event, handler, capture);
        }
      },


      /**
       *
       */
      mousePosition : function (e) {
        // http://www.malleus.de/FAQ/getImgMousePos.html
        // http://www.quirksmode.org/js/events_properties.html#position
        var event, x, y, domObject, posx = 0, posy = 0, top = 0, left = 0, cellSize = GOL.cellSize + 1;

        event = e;
        if (!event) {
          event = window.event;
        }

        if (event.pageX || event.pageY)     {
          posx = event.pageX;
          posy = event.pageY;
        } else if (event.clientX || event.clientY)  {
          posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
          posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        domObject = event.target || event.srcElement;

        while ( domObject.offsetParent ) {
          left += domObject.offsetLeft;
          top += domObject.offsetTop;
          domObject = domObject.offsetParent;
        }

        domObject.pageTop = top;
        domObject.pageLeft = left;

        x = Math.ceil(((posx - domObject.pageLeft)/cellSize) - 1);
        y = Math.ceil(((posy - domObject.pageTop)/cellSize) - 1);

        return [x, y];
      },

      /**
       * Hyper speed is the leftmost slider position (0)
       */
      isHyper : function () {
        try {
          return GOL.element.speedSlider.value == 0;
        } catch {
          return false;
        }
      },

      getWaitTimeMs : function () {
        var j = 0;
        var default_ = 500;
        try {
          j = GOL.element.speedSlider.value;
        } catch {
          // console.log("Could not read speed-slider value, using default value of 25 ms");
          return default_;
        }
        if (j<=0) {
          return 0;
        } else if (j==1) {
          return 8;
        } else if (j==2) {
          return 15;
        } else if (j==3) {
          return 50;
        } else if (j==4) {
          return 200;
        } else if (j==5) {
          return default_;
        } else {
          return default_;
        }
      }
    }

  };


  /**
   * Init on 'load' event
   */
  GOL.helpers.registerEvent(window, 'load', function () {
    GOL.init();
  }, false);

}());
